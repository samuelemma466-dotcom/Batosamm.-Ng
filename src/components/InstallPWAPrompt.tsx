import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, Smartphone, Sparkles, Share, ArrowUpRight } from "lucide-react";

export default function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const ua = window.navigator.userAgent;
    const ipad = !!ua.match(/iPad/i);
    const iphone = !!ua.match(/iPhone/i);
    const ios = ipad || iphone;
    setIsIOS(ios);

    // Check if user already dismissed or installed
    const isDismissed = localStorage.getItem("bato_sam_pwa_dismissed") === "true";
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) {
      return; // Already running in standalone app
    }

    // Handle Before Install Prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS Safari or browsers where beforeinstallprompt doesn't fire, we can prompt after some time
    if (ios && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Trigger after 5 seconds on iOS to engage users
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native prompt
    deferredPrompt.prompt();

    // Wait for response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA Install] User outcome: ${outcome}`);

    // Clear prompt state
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("bato_sam_pwa_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="pwa-install-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-slate-950/40 backdrop-blur-sm pointer-events-none"
      />
      
      <motion.div
        id="pwa-install-modal"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="fixed bottom-0 left-0 right-0 z-[130] p-4 md:p-6 bg-slate-900/95 border-t border-white/10 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto max-w-2xl mx-auto md:bottom-4 md:rounded-3xl md:border md:left-4 md:right-4"
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-cyan-500 opacity-80" />
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
          aria-label="Dismiss prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Logo Brand Frame */}
          <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/25 to-cyan-600/25 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10">
            <Smartphone className="h-7 w-7 animate-pulse text-cyan-400" />
          </div>

          {/* Description Content */}
          <div className="flex-grow space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-500/25 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> INSTALL BATO SAM APP
              </span>
              <span className="text-[10px] text-slate-500 font-mono">PWA Support</span>
            </div>
            <h3 className="font-sans text-base font-black text-white tracking-tight uppercase">
              Bato Sam Digital Hub
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Add our premium platform to your home screen for lightning-fast offline access, custom alerts, and instant CAC status tracker tracking.
            </p>
          </div>
        </div>

        {/* Dynamic Action Buttons or iOS Guide */}
        <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {isIOS ? (
            /* Custom iOS Safari Guidance */
            <div className="flex items-start gap-2.5 bg-blue-950/40 p-3 rounded-2xl border border-blue-500/15 w-full">
              <Share className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 leading-normal">
                <span className="font-bold text-white block mb-0.5">iOS Installation Guide:</span>
                Tap the <strong className="text-blue-400">Share button</strong> at the bottom of Safari, then choose <strong className="text-blue-400">Add to Home Screen</strong>.
              </div>
            </div>
          ) : (
            /* Dynamic Android/Chrome installation triggering button */
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Install Application</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl hover:bg-white/5 transition-all text-center cursor-pointer"
              >
                Later, keep browsing
              </button>
            </div>
          )}

          {isIOS && (
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl hover:bg-white/5 transition-all text-center cursor-pointer flex-shrink-0"
            >
              Close Guide
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
