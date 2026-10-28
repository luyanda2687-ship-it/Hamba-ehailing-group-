import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Install Hamba on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed space-y-2">
                1. Tap the <strong>Share</strong> button in the Safari bottom bar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Open Hamba from your home screen for full offline maps & navigation.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-bold text-slate-950 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Universal fallback install affordance
  return (
    <button
      onClick={() => alert("Hamba is PWA enabled. To install, tap your browser's 'Add to Home Screen' or install icon in the address bar for full offline map capability.")}
      className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition whitespace-nowrap"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>Install App</span>
    </button>
  );
};
