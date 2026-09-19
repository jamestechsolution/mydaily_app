import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  TaskItem,
  ProjectItem,
  ReminderItem,
  DailyReportItem,
  NoteItem,
  CategoryItem,
  UserProfile,
} from '../types';
import { offlineSync } from '../services/offlineSync';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-work', name: 'Work', color: '#3b82f6', isDefault: true },
  { id: 'cat-study', name: 'Study', color: '#8b5cf6', isDefault: true },
  { id: 'cat-personal', name: 'Personal', color: '#10b981', isDefault: true },
  { id: 'cat-development', name: 'Development', color: '#6366f1', isDefault: true },
  { id: 'cat-meetings', name: 'Meetings', color: '#f59e0b', isDefault: true },
  { id: 'cat-projects', name: 'Projects', color: '#06b6d4', isDefault: true },
  { id: 'cat-health', name: 'Health', color: '#ec4899', isDefault: true },
  { id: 'cat-other', name: 'Other', color: '#94a3b8', isDefault: true },
];

// Storage helpers with dual-layer persistence (Firestore + Local fallback)
export class WorkStorageService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Subscribe to real-time changes
  subscribeCollection<T>(
    subPath: string,
    callback: (items: T[]) => void,
    fallbackKey: string
  ): Unsubscribe {
    // Deliver local cache immediately if present for instant rendering
    const cachedData = localStorage.getItem(`dwm_${this.userId}_${fallbackKey}`);
    if (cachedData) {
      try {
        callback(JSON.parse(cachedData));
      } catch {}
    }

    try {
      const colRef = collection(db, 'users', this.userId, subPath);
      const q = query(colRef);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as T[];
          // Keep local cache updated
          localStorage.setItem(`dwm_${this.userId}_${fallbackKey}`, JSON.stringify(docs));
          callback(docs);
        },
        (error) => {
          // Gracefully fallback to local storage if Firestore subscription fails or requires auth token
          const cached = localStorage.getItem(`dwm_${this.userId}_${fallbackKey}`);
          if (cached) {
            try {
              callback(JSON.parse(cached));
              return;
            } catch {}
          }
          callback([]);
        }
      );
      return unsubscribe;
    } catch (e) {
      const cached = localStorage.getItem(`dwm_${this.userId}_${fallbackKey}`);
      if (cached) {
        try {
          callback(JSON.parse(cached));
          return () => {};
        } catch {}
      }
      callback([]);
      return () => {};
    }
  }

  // Save single item with optimistic local caching + offline sync queuing
  async saveItem<T extends { id: string }>(subPath: string, item: T): Promise<void> {
    // 1. Cache in local storage first for optimistic instant updates
    try {
      const key = `dwm_${this.userId}_${subPath}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]') as T[];
      const idx = existing.findIndex((x) => x.id === item.id);
      if (idx >= 0) {
        existing[idx] = item;
      } else {
        existing.push(item);
      }
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to cache item locally:', e);
    }

    // 2. If offline or simulated offline, enqueue for background sync
    const status = offlineSync.getStatus(this.userId);
    if (!status.isOnline) {
      offlineSync.enqueue(this.userId, subPath, 'save', item.id, item);
      return;
    }

    // 3. Attempt cloud persistence; if network error occurs, enqueue for later sync
    try {
      const docRef = doc(db, 'users', this.userId, subPath, item.id);
      await setDoc(docRef, item, { merge: true });
    } catch (e) {
      console.warn(`Firestore save error on ${subPath}/${item.id}, enqueued for offline sync:`, e);
      offlineSync.enqueue(this.userId, subPath, 'save', item.id, item);
    }
  }

  // Delete single item with optimistic local removal + offline sync queuing
  async deleteItem(subPath: string, id: string): Promise<void> {
    // 1. Remove from local storage first
    try {
      const key = `dwm_${this.userId}_${subPath}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter((x: any) => x.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete item locally:', e);
    }

    // 2. If offline, enqueue deletion
    const status = offlineSync.getStatus(this.userId);
    if (!status.isOnline) {
      offlineSync.enqueue(this.userId, subPath, 'delete', id);
      return;
    }

    // 3. Attempt cloud deletion
    try {
      const docRef = doc(db, 'users', this.userId, subPath, id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn(`Firestore delete error on ${subPath}/${id}, enqueued for offline sync:`, e);
      offlineSync.enqueue(this.userId, subPath, 'delete', id);
    }
  }

  // Initialize default categories for user workspace
  async initUserCategories(): Promise<void> {
    for (const cat of DEFAULT_CATEGORIES) {
      await this.saveItem('categories', { ...cat, userId: this.userId });
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const collections = ['tasks', 'projects', 'reminders', 'notes', 'reports', 'categories', 'daily_goals'];
    for (const sub of collections) {
      try {
        const colRef = collection(db, 'users', this.userId, sub);
        const snaps = await getDocs(colRef);
        for (const s of snaps.docs) {
          await deleteDoc(doc(db, 'users', this.userId, sub, s.id));
        }
      } catch (e) {
        console.warn(`Error clearing ${sub}:`, e);
      }
      localStorage.removeItem(`dwm_${this.userId}_${sub}`);
    }
  }
}
