import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, Sparkles, Smartphone, ArrowRight } from "lucide-react";
import BatoLogo from "./BatoLogo";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
}

export default function DeviceNotificationToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; message: string }>;
      const { title, message } = customEvent.detail;
      
      // Generate unique ID
      const id = Math.random().toString(36).substring(2, 9);
      setToast({ id, title, message });

      // Play soft notification sound safely
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Synth sound sequence: premium mobile ring chime (Double note: high G, high C)
        const playTone = (freq: number, startTime: number, duration: number) => {
          const osc = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);
          
          gainNode.gain.setValueAtTime(0.08, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          osc.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        const now = audioContext.currentTime;
        playTone(783.99, now, 0.12); // G5 note
        playTone(1046.50, now + 0.08, 0.28); // C6 note (crystal clear chime chime)
      } catch (audioErr) {
        // Safe catch for iframe / user-gesture autoplay blocking
        console.log("Audio feedback blocked or context inactive:", audioErr);
      }
    };

    window.addEventListener("bato_native_toast", handleToastEvent);
    return () => {
      window.removeEventListener("bato_native_toast", handleToastEvent);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          id="device-push-notification"
          initial={{ y: -120, opacity: 0, scale: 0.93 }}
          animate={{ y: 16, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.93 }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
          className="fixed top-0 left-4 right-4 z-[99999] max-w-sm mx-auto bg-slate-900/95 border border-white/10 text-white rounded-3xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl flex gap-3.5 items-start select-none cursor-pointer"
          onClick={() => setToast(null)}
        >
          {/* Neon Top Edge Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

          {/* Icon Brand Column */}
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/80 border border-white/5 relative shadow-inner">
            <BatoLogo size={24} animate={false} />
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-cyan-500 flex items-center justify-center text-[7px] font-black font-sans text-slate-950 scale-100 animate-pulse border border-slate-900">
              !
            </div>
          </div>

          {/* Description Block */}
          <div className="flex-grow space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-cyan-400" /> Bato Sam push
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase font-black">Just Now</span>
            </div>
            
            <h4 className="font-sans text-[13px] font-extrabold uppercase text-white tracking-tight leading-snug">
              {toast.title}
            </h4>
            
            <p className="text-xs text-slate-300 leading-normal font-semibold">
              {toast.message}
            </p>
          </div>

          {/* Close button frame */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setToast(null);
            }}
            className="flex-shrink-0 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
