import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import BatoLogo from "./BatoLogo";
import { Terminal, Shield, Cpu, RefreshCw, Activity } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  const getStatusText = (prog: number) => {
    if (prog < 15) return "Initializing Bato Sam Digital Hub...";
    if (prog < 35) return "Loading CAC Corporate Filing Module...";
    if (prog < 55) return "Spooling High-End Laser Printing System...";
    if (prog < 75) return "Establishing Secure Database Connection...";
    if (prog < 90) return "Configuring Academy Dossier Registers...";
    if (prog < 100) return "Optimizing High-Performance Command Center...";
    return "Initialization Complete. Welcome.";
  };

  useEffect(() => {
    // Fail-safe timeout: Force-exit the splash screen after 6 seconds under all circumstances
    const safetyTimeout = setTimeout(() => {
      console.log("SplashScreen Component: Ironclad fail-safe timeout triggered. Dismissing splash screen.");
      onComplete();
    }, 6000);

    // Elegant, smooth progress bar timer simulating high-end system initialization
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 450); // Elegant pause to view the completed masterpiece logo
          return 100;
        }
        
        // Complex, smaller variable increment to simulate real computing blocks and take ~3.5 seconds
        const increment = Math.floor(Math.random() * 3) + 2; // Increments of 2-4% every 100ms
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => {
      clearTimeout(safetyTimeout);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-zinc-950 text-white select-none overflow-hidden"
      id="bato-splash-screen"
    >
      {/* Background Radial Ambient Gradients (Glowing Luxury Dark Universe) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/5 to-cyan-500/5 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse" />

      {/* Cybernetic Geometric Tech Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-40 z-0 pointer-events-none" />

      {/* Main Construct Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: -40 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-md w-full px-8 text-center space-y-8"
      >
        {/* Animated Construction Piece-by-Piece Logo */}
        <div className="relative">
          {/* Beautiful Outer Radial Glow aura */}
          <div className="absolute -inset-10 rounded-full bg-blue-600/10 blur-[40px] animate-pulse" />
          <div className="relative transform hover:scale-105 transition-transform duration-500">
            <BatoLogo size={140} animate={true} monochrome={false} />
          </div>
        </div>

        {/* Brand Display Typography */}
        <div className="space-y-2">
          <motion.h1 
            initial={{ letterSpacing: "0.1em", opacity: 0 }}
            animate={{ letterSpacing: "0.3em", opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-4xl font-black text-white uppercase"
          >
            BATO SAM
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-black"
          >
            Digital Excellence • Delivered Daily
          </motion.p>
        </div>

        {/* Professional Initializing Progress Bar */}
        <div className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-[28px] p-6 backdrop-blur-md shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          
          <div className="space-y-4">
            {/* Actionable Subtext Header */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold tracking-wider">
              <span className="flex items-center gap-1.5 uppercase text-blue-400">
                <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                SYSTEM INITIALIZING
              </span>
              <span className="text-white font-black">{progress}%</span>
            </div>

            {/* Custom Glowing Progress Bar */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800/50 p-[2px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Crucial requested label text */}
            <div className="text-center h-5 flex items-center justify-center">
              <span className="text-[11px] font-sans font-extrabold text-zinc-300 tracking-wide block animate-pulse">
                {getStatusText(progress)}
              </span>
            </div>
          </div>
        </div>

        {/* System Credentials Signature */}
        <div className="flex justify-center items-center gap-6 pt-4 text-[9px] font-mono text-zinc-500 font-semibold tracking-wider">
          <span className="uppercase">LAGOS HUB v3.1</span>
          <span className="text-zinc-700">•</span>
          <span className="uppercase">SECURE INTERACTION LAYERS</span>
        </div>
      </motion.div>

      {/* Signature Bottom Bar */}
      <div className="absolute bottom-6 font-mono text-[8px] text-zinc-600 uppercase tracking-[0.25em] font-bold z-10">
        Nigeria CAC Broker Accredited • ISO 27001 Cryptography
      </div>
    </motion.div>
  );
}
