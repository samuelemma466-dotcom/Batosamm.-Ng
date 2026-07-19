import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Sparkles, X, ShieldCheck } from "lucide-react";
import { showNativeNotification } from "../utils/notifications";

interface NotificationPermissionPromptProps {
  showAfterSplash: boolean;
}

export default function NotificationPermissionPrompt({ showAfterSplash }: NotificationPermissionPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!showAfterSplash) return;

    // Check if notifications are supported
    if (!("Notification" in window)) {
      return;
    }

    // Check if permission is default and user hasn't dismissed the custom prompt yet
    const currentPermission = Notification.permission;
    const isDismissed = localStorage.getItem("bato_notification_prompt_dismissed") === "true";

    if (currentPermission === "default" && !isDismissed) {
      // Show prompt 1.5 seconds after splash finishes to feel completely natural and premium
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showAfterSplash]);

  const handleAllow = async () => {
    if (!("Notification" in window)) return;

    try {
      const permission = await Notification.requestPermission();
      console.log(`[Notification API] Permission selection: ${permission}`);
      
      localStorage.setItem("bato_notification_prompt_dismissed", "true");
      setShowPrompt(false);

      if (permission === "granted") {
        // Trigger haptic and show confirmation
        setTimeout(() => {
          showNativeNotification(
            "Notifications Enabled! 🔔",
            "You will now receive instant live updates about your Bato Sam jobs."
          );
        }, 800);
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      localStorage.setItem("bato_notification_prompt_dismissed", "true");
      setShowPrompt(false);
    }
  };

  const handleBlock = () => {
    localStorage.setItem("bato_notification_prompt_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {/* Semi-transparent backdrop blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[140] bg-slate-950/60 backdrop-blur-md"
      />

      {/* Floating Center Notification Prompt Card */}
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 240 }}
          className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />
          
          {/* Close button */}
          <button
            onClick={handleBlock}
            className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon frame */}
          <div className="mx-auto mt-2 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10">
            <Bell className="h-7 w-7 animate-bounce text-cyan-400" />
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-500/15 inline-flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> Live Job Updates
            </span>
            <h3 className="font-sans text-lg font-black text-white uppercase tracking-tight">
              Bato Sam Alerts
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold px-2">
              Bato Sam would like to send you live job updates.
            </p>
            <p className="text-[10px] text-slate-500 font-medium px-4">
              Get notified immediately from the system level once your CAC file, print orders, or academy admissions statuses update.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleBlock}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-xs font-bold text-slate-300 cursor-pointer transition-colors text-center uppercase tracking-wider"
            >
              Block
            </button>
            <button
              onClick={handleAllow}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-black text-white cursor-pointer transition-all text-center uppercase tracking-wider shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Allow</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
