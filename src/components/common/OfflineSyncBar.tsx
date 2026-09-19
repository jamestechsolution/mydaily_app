import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Cloud,
  CloudOff,
  ChevronDown,
  ChevronUp,
  Database,
  ArrowUpCircle,
} from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync';

export const OfflineSyncBar: React.FC = () => {
  const {
    isOnline,
    isSyncing,
    queueLength,
    lastSyncedAt,
    isSimulatedOffline,
    triggerSync,
    toggleSimulatedOffline,
  } = useOfflineSync();

  const [expanded, setExpanded] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleManualSync = async () => {
    const res = await triggerSync();
    if (res.synced > 0) {
      setSyncFeedback(`Successfully synced ${res.synced} change${res.synced === 1 ? '' : 's'} to cloud!`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } else if (res.remaining === 0) {
      setSyncFeedback('All local task data is up to date with cloud!');
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  return (
    <div id="offline-sync-indicator" className="relative select-none text-xs">
      {/* Compact Header Pill */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-300 ${
          !isOnline
            ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40 text-amber-700 dark:text-amber-300'
            : queueLength > 0
            ? 'bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
            : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-750'
        }`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 font-medium cursor-pointer"
          title="Offline Caching & Cloud Synchronization Status"
        >
          {!isOnline ? (
            <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          ) : isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
          ) : queueLength > 0 ? (
            <ArrowUpCircle className="w-3.5 h-3.5 text-indigo-500" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          )}

          <span className="hidden md:inline font-semibold">
            {!isOnline
              ? 'Offline Mode'
              : isSyncing
              ? 'Syncing...'
              : queueLength > 0
              ? `${queueLength} Pending Sync`
              : 'Cloud Synced'}
          </span>

          {queueLength > 0 && !isOnline && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
              {queueLength}
            </span>
          )}

          {expanded ? (
            <ChevronUp className="w-3 h-3 opacity-60 ml-0.5" />
          ) : (
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          )}
        </button>

        {isOnline && queueLength > 0 && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Force Sync Now"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        )}
      </div>

      {/* Expanded Dropdown Details */}
      {expanded && (
        <div
          id="offline-sync-popover"
          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-xl ${
                  !isOnline
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-emerald-500/10 text-emerald-600'
                }`}
              >
                {!isOnline ? (
                  <CloudOff className="w-4 h-4" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  Offline Caching & Sync
                </h4>
                <p className="text-[10px] text-slate-400">
                  Service Worker + Local Task Queue
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                !isOnline
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {!isOnline ? 'Offline' : 'Online'}
            </span>
          </div>

          {/* Feedback banner */}
          {syncFeedback && (
            <div className="mt-3 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Info Details */}
          <div className="mt-3 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Pending Sync Queue:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {queueLength} {queueLength === 1 ? 'mutation' : 'mutations'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Last Synced:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {lastSyncedAt || 'Just now'}
              </span>
            </div>

            <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {!isOnline
                ? 'Tasks created, updated, or marked completed now are preserved in your local service worker cache and will automatically sync once your connection returns.'
                : 'All changes are actively synchronized in real time with Firestore and cached locally for instant offline availability.'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={toggleSimulatedOffline}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                isSimulatedOffline
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
              title="Toggle Simulated Offline Mode to test offline task creation and editing"
            >
              {isSimulatedOffline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Resume Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Test Offline Mode</span>
                </>
              )}
            </button>

            {isOnline && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="py-2 px-3 rounded-xl text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
