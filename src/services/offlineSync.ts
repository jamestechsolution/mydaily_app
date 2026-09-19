import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SyncQueueItem {
  id: string;
  userId: string;
  subPath: string; // 'tasks' | 'projects' | 'reminders' | 'notes' | 'reports' | 'categories'
  operation: 'save' | 'delete';
  itemId: string;
  payload?: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  lastSyncedAt: string | null;
  isSimulatedOffline: boolean;
}

type SyncStatusListener = (status: SyncStatus) => void;

class OfflineSyncService {
  private listeners: Set<SyncStatusListener> = new Set();
  private isSyncing = false;
  private isSimulatedOffline = false;
  private lastSyncedAt: string | null = null;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notifyListeners();
        this.triggerSync();
      });

      window.addEventListener('offline', () => {
        this.notifyListeners();
      });

      // Periodic sync check every 30 seconds when online
      this.syncTimer = setInterval(() => {
        if (this.isEffectivelyOnline() && !this.isSyncing) {
          const totalQueue = this.getTotalQueueCount();
          if (totalQueue > 0) {
            this.triggerSync();
          }
        }
      }, 30000);
    }
  }

  private isEffectivelyOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  public getStatus(userId?: string): SyncStatus {
    const queue = userId ? this.getQueue(userId) : [];
    return {
      isOnline: this.isEffectivelyOnline(),
      isSyncing: this.isSyncing,
      queueLength: queue.length,
      lastSyncedAt: this.lastSyncedAt,
      isSimulatedOffline: this.isSimulatedOffline,
    };
  }

  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(userId?: string) {
    const status = this.getStatus(userId);
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public setSimulatedOffline(simulate: boolean, userId?: string) {
    this.isSimulatedOffline = simulate;
    this.notifyListeners(userId);
    if (!simulate && this.isEffectivelyOnline()) {
      this.triggerSync(userId);
    }
  }

  private getQueueKey(userId: string): string {
    return `dwm_sync_queue_${userId}`;
  }

  public getQueue(userId: string): SyncQueueItem[] {
    try {
      const raw = localStorage.getItem(this.getQueueKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(userId: string, queue: SyncQueueItem[]) {
    try {
      localStorage.setItem(this.getQueueKey(userId), JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to persist sync queue to localStorage:', e);
    }
  }

  private getTotalQueueCount(): number {
    try {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dwm_sync_queue_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) count += parsed.length;
          }
        }
      }
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Enqueue a pending mutation when offline or if network save failed
   */
  public enqueue(
    userId: string,
    subPath: string,
    operation: 'save' | 'delete',
    itemId: string,
    payload?: any
  ): void {
    const queue = this.getQueue(userId);

    // Optimize queue: remove obsolete prior operations on the same item
    const existingIndex = queue.findIndex(
      (q) => q.subPath === subPath && q.itemId === itemId
    );

    if (existingIndex >= 0) {
      const existing = queue[existingIndex];
      if (operation === 'delete') {
        // If we previously saved it offline and now delete it, replace with delete
        queue[existingIndex] = {
          id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId,
          subPath,
          operation: 'delete',
          itemId,
          timestamp: Date.now(),
          retryCount: 0,
        };
      } else {
        // Updated save payload
        queue[existingIndex] = {
          ...existing,
          payload,
          timestamp: Date.now(),
        };
      }
    } else {
      queue.push({
        id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId,
        subPath,
        operation,
        itemId,
        payload,
        timestamp: Date.now(),
        retryCount: 0,
      });
    }

    this.saveQueue(userId, queue);
    this.notifyListeners(userId);
  }

  /**
   * Process all queued operations for a user or all users
   */
  public async triggerSync(userId?: string): Promise<{ synced: number; remaining: number }> {
    if (!this.isEffectivelyOnline() || this.isSyncing) {
      return { synced: 0, remaining: userId ? this.getQueue(userId).length : this.getTotalQueueCount() };
    }

    this.isSyncing = true;
    this.notifyListeners(userId);

    let totalSynced = 0;
    const targetUserIds = userId ? [userId] : this.getAllUserIdsWithQueue();

    try {
      for (const uid of targetUserIds) {
        const queue = this.getQueue(uid);
        if (queue.length === 0) continue;

        const remainingQueue: SyncQueueItem[] = [];

        for (const item of queue) {
          // If offline while looping, halt
          if (!this.isEffectivelyOnline()) {
            remainingQueue.push(item);
            continue;
          }

          try {
            if (item.operation === 'save') {
              const docRef = doc(db, 'users', uid, item.subPath, item.itemId);
              await setDoc(docRef, item.payload, { merge: true });
            } else if (item.operation === 'delete') {
              const docRef = doc(db, 'users', uid, item.subPath, item.itemId);
              await deleteDoc(docRef);
            }
            totalSynced++;
          } catch (err: any) {
            console.warn(`Sync failed for ${item.subPath}/${item.itemId}:`, err?.message || err);
            item.retryCount = (item.retryCount || 0) + 1;
            remainingQueue.push(item);
            // If network failure, stop batch
            if (err?.code === 'unavailable' || !navigator.onLine) {
              break;
            }
          }
        }

        this.saveQueue(uid, remainingQueue);
      }

      this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } finally {
      this.isSyncing = false;
      this.notifyListeners(userId);
    }

    return {
      synced: totalSynced,
      remaining: userId ? this.getQueue(userId).length : this.getTotalQueueCount(),
    };
  }

  private getAllUserIdsWithQueue(): string[] {
    const userIds: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dwm_sync_queue_')) {
          const uid = key.replace('dwm_sync_queue_', '');
          if (uid) userIds.push(uid);
        }
      }
    } catch {}
    return userIds;
  }
}

export const offlineSync = new OfflineSyncService();
