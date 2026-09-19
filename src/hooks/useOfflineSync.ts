import { useState, useEffect, useCallback } from 'react';
import { offlineSync, SyncStatus } from '../services/offlineSync';
import { useAuth } from '../context/AuthContext';

export const useOfflineSync = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'guest-user';

  const [status, setStatus] = useState<SyncStatus>(() => offlineSync.getStatus(userId));

  useEffect(() => {
    // Initial sync check
    setStatus(offlineSync.getStatus(userId));

    // Subscribe to state mutations
    const unsubscribe = offlineSync.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return () => unsubscribe();
  }, [userId]);

  const triggerSync = useCallback(async () => {
    return await offlineSync.triggerSync(userId);
  }, [userId]);

  const toggleSimulatedOffline = useCallback(() => {
    offlineSync.setSimulatedOffline(!status.isSimulatedOffline, userId);
  }, [status.isSimulatedOffline, userId]);

  return {
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    queueLength: status.queueLength,
    lastSyncedAt: status.lastSyncedAt,
    isSimulatedOffline: status.isSimulatedOffline,
    triggerSync,
    toggleSimulatedOffline,
  };
};
