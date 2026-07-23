import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check, ArrowDown } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallAppPromptProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export const InstallAppPrompt: React.FC<InstallAppPromptProps> = ({ forceShow = false, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already running in standalone / PWA mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);
    if (checkStandalone && !forceShow) {
      return;
    }

    // 2. Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/i.test(ua);
    setIsIOS(isIOSDevice);

    // 3. Detect Mobile screen or user agent
    const isMobileDevice = isIOSDevice || /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth <= 768;

    // 4. Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Check dismissal history unless forceShow is true
    const dismissedTimestamp = localStorage.getItem('pwa_prompt_dismissed');
    const isRecentlyDismissed = dismissedTimestamp && (Date.now() - parseInt(dismissedTimestamp, 10)) < (3 * 24 * 60 * 60 * 1000); // 3 days

    if (forceShow) {
      setIsVisible(true);
    } else if (isMobileDevice && !isRecentlyDismissed && !checkStandalone) {
      // Delay prompt slightly for better UX (1.5 seconds)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [forceShow]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstalledSuccess(true);
          setTimeout(() => {
            handleDismiss();
          }, 2000);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else if (!isIOS) {
      // Fallback: Show message or guide
      alert('To install Daily Finance Tracker, tap your browser menu (⋮) and select "Add to Home screen" or "Install App".');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden p-5 transition-transform animate-in slide-in-from-bottom-5 duration-300 relative"
      >
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <img src="/icon.svg" alt="App Icon" className="w-full h-full rounded-[10px]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Install Daily Finance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quick access & offline capability</p>
          </div>
        </div>

        {installedSuccess ? (
          <div className="py-4 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-emerald-400">App installed successfully!</p>
            <p className="text-xs text-slate-400">You can now open Daily Finance directly from your home screen.</p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Specific Step-by-Step Guidance */
          <div className="space-y-3.5 my-2">
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              Install this app on your iPhone or iPad for the best full-screen experience.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <span>Tap the </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-white bg-slate-700 px-1.5 py-0.5 rounded">
                    <Share className="w-3.5 h-3.5 text-emerald-400" /> Share
                  </span>
                  <span> icon in Safari</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <span>Scroll down & select </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-white bg-slate-700 px-1.5 py-0.5 rounded">
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400" /> Add to Home Screen
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <span>Tap </span>
                  <span className="font-semibold text-emerald-400">Add</span>
                  <span> in the top right corner</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md mt-2"
            >
              Got It
            </button>
          </div>
        ) : (
          /* Android / Chrome / General Installation */
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              Install Daily Finance Tracker on your device to launch it instantly from your home screen with fast offline tracking.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleDismiss}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition text-center"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstallClick}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
