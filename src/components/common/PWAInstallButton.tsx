import React, { useState } from 'react';
import { Download, Share2, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed and running as a standalone PWA, hide button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Edge flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-2xs active:scale-95 ${
          compact ? 'p-1.5 text-xs' : 'px-2.5 py-1.5 text-xs'
        }`}
        title="Install Daily Work Manager App"
      >
        <Download className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
        <span className={compact ? 'hidden xl:inline' : 'inline'}>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit manual Add to Home Screen)
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-2xs ${
            compact ? 'p-1.5 text-xs' : 'px-2.5 py-1.5 text-xs'
          }`}
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span className={compact ? 'hidden xl:inline' : 'inline'}>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Install on iPhone / iPad
                    </h3>
                    <p className="text-[11px] text-slate-400">Add to your Home Screen</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-indigo-500" /> in Safari's bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <div>
                    Tap <strong>Add</strong> in the top-right corner to launch Daily Work Manager as a standalone app!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic prompt fallback for other browsers
  return (
    <button
      id="pwa-install-generic-btn"
      onClick={() => {
        // Provide standard browser install shortcut tip
        alert('To install Daily Work Manager: Click the install icon (⬇️) in your browser address bar or menu, or press Menu > Install Daily Work Manager.');
      }}
      className={`flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-all hover:bg-slate-200 dark:hover:bg-slate-750 shadow-2xs ${
        compact ? 'p-1.5 text-xs' : 'px-2.5 py-1.5 text-xs'
      }`}
      title="Install Daily Work Manager on your device"
    >
      <Download className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
      <span className={compact ? 'hidden xl:inline' : 'inline'}>Install App</span>
    </button>
  );
};
