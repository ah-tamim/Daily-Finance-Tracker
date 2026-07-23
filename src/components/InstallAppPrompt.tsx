import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check, ExternalLink, MoreVertical, Compass } from 'lucide-react';

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
  const [isInIframe, setIsInIframe] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'auto' | 'chrome' | 'ios'>('auto');

  useEffect(() => {
    // Detect if inside an iframe (like AI Studio preview frame)
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }

    // 1. Check if already running in standalone / PWA mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);
    if (checkStandalone && !forceShow) {
      return;
    }

    // 2. Detect iOS vs Android/Chrome
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/i.test(ua);
    setIsIOS(isIOSDevice);
    if (isIOSDevice) {
      setActiveTab('ios');
    } else {
      setActiveTab('chrome');
    }

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
    const isRecentlyDismissed = dismissedTimestamp && (Date.now() - parseInt(dismissedTimestamp, 10)) < (2 * 24 * 60 * 60 * 1000); // 2 days

    if (forceShow) {
      setIsVisible(true);
    } else if (isMobileDevice && !isRecentlyDismissed && !checkStandalone) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [forceShow]);

  const [manualGuideNotice, setManualGuideNotice] = useState<boolean>(false);

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
        setManualGuideNotice(true);
      }
    } else if (isInIframe) {
      handleOpenNewTab();
    } else {
      setManualGuideNotice(true);
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden p-5 transition-transform animate-in slide-in-from-bottom-5 duration-300 relative">
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <img src="/icon.svg" alt="App Icon" className="w-full h-full rounded-[10px]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Install Daily Finance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quick access on mobile & desktop</p>
          </div>
        </div>

        {/* Iframe Preview Banner Warning */}
        {isInIframe && (
          <div className="mb-4 p-3 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-xl text-xs space-y-2">
            <div className="flex items-start gap-2">
              <Compass className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-semibold block text-amber-200">Preview Iframe Detected</span>
                <span>Chrome disables app installation inside preview frames. Please open the app in a standalone tab first.</span>
              </div>
            </div>
            <button
              onClick={handleOpenNewTab}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab to Install</span>
            </button>
          </div>
        )}

        {/* Success Banner */}
        {installedSuccess ? (
          <div className="py-4 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-emerald-400">App installed successfully!</p>
            <p className="text-xs text-slate-400">You can now open Daily Finance directly from your home screen.</p>
          </div>
        ) : (
          <div>
            {/* Primary Action Install Button Card */}
            <div className="mb-4 p-3 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 shadow-inner">
              <div className="text-xs text-emerald-200 min-w-0">
                <span className="font-bold block text-emerald-400 text-xs">
                  {deferredPrompt ? '1-Click Fast Install Ready' : isInIframe ? 'Open Tab to Install PWA' : 'Install Daily Finance'}
                </span>
                <span className="text-[11px] text-slate-300 block truncate">
                  {deferredPrompt ? 'Tap below to add to device' : isInIframe ? 'Required inside preview frame' : 'Add shortcut on homescreen'}
                </span>
              </div>
              <button
                onClick={handleInstallClick}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition shrink-0 flex items-center gap-1.5 border border-emerald-400/30"
              >
                {isInIframe ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>Install App</span>
              </button>
            </div>

            {manualGuideNotice && !deferredPrompt && !isInIframe && (
              <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <span>Follow the steps below for your browser to complete installation:</span>
                <button 
                  onClick={() => setManualGuideNotice(false)} 
                  className="text-amber-400 hover:text-amber-200 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Platform Instructions Toggle */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl mb-3.5 text-xs font-medium">
              <button
                onClick={() => setActiveTab('chrome')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  activeTab === 'chrome' ? 'bg-emerald-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chrome / Android
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  activeTab === 'ios' ? 'bg-emerald-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Safari / iOS
              </button>
            </div>

            {/* Chrome Specific Instructions */}
            {activeTab === 'chrome' && (
              <div className="space-y-2.5 text-xs text-slate-300">
                <p className="text-slate-400 mb-1">If no automatic prompt pops up in Chrome, follow these 3 quick steps:</p>
                
                <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1 leading-snug">
                    <span>Tap the </span>
                    <span className="inline-flex items-center gap-0.5 font-semibold text-white bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                      <MoreVertical className="w-3 h-3 text-emerald-400" /> 3 dots menu
                    </span>
                    <span> in Chrome's top-right corner.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1 leading-snug">
                    <span>Select </span>
                    <span className="font-semibold text-emerald-400 bg-slate-700/80 px-1.5 py-0.5 rounded text-[11px]">
                      "Add to Home screen"
                    </span>
                    <span> or </span>
                    <span className="font-semibold text-emerald-400 bg-slate-700/80 px-1.5 py-0.5 rounded text-[11px]">
                      "Install app"
                    </span>
                    <span className="text-slate-400 block text-[11px] mt-0.5">(or "Save and share" → "Install page as app" on desktop Chrome)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1 leading-snug">
                    <span>Confirm </span>
                    <span className="font-semibold text-white">"Install"</span>
                    <span> to place the icon directly on your mobile home screen.</span>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Safari Instructions */}
            {activeTab === 'ios' && (
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1 leading-snug">
                    <span>Tap the </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-white bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                      <Share className="w-3 h-3 text-emerald-400" /> Share
                    </span>
                    <span> icon at the bottom of Safari.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1 leading-snug">
                    <span>Scroll down and select </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-white bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                      <PlusSquare className="w-3 h-3 text-emerald-400" /> Add to Home Screen
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1 leading-snug">
                    <span>Tap </span>
                    <span className="font-semibold text-emerald-400">Add</span>
                    <span> in the top right corner.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                {isInIframe ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>{isInIframe ? 'Open Tab to Install' : 'Install App'}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition text-center shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

