import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Printer, GraduationCap, Briefcase } from "lucide-react";
import BatoLogo from "./BatoLogo";

interface LandingViewProps {
  onGetStarted: () => void;
  onLogoTripleClick?: () => void;
}

export default function LandingView({ onGetStarted, onLogoTripleClick }: LandingViewProps) {
  const [clickCount, setClickCount] = React.useState(0);
  const [lastClickTime, setLastClickTime] = React.useState(0);

  const handleLogoClick = () => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 500) {
      const nextCount = clickCount + 1;
      setClickCount(nextCount);
      if (nextCount === 3) {
        setClickCount(0);
        if (onLogoTripleClick) onLogoTripleClick();
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(currentTime);
  };

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] text-[#1D1D1F] dark:bg-zinc-950 dark:text-zinc-50 flex flex-col justify-between overflow-hidden px-6 py-12 transition-colors duration-300">
      {/* Background elegant radial light blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-zinc-200/40 dark:bg-zinc-900/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[300px] w-[300px] rounded-full bg-zinc-300/30 dark:bg-zinc-800/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex justify-between items-center">
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <BatoLogo size={46} animate={false} monochrome={false} />
          <div>
            <span className="font-sans text-lg font-black tracking-tight text-[#1D1D1F] dark:text-white block uppercase">
              Bato Sam<span className="text-zinc-400">. NG</span>
            </span>
            <span className="block font-mono text-[8px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase -mt-1">
              DIGITAL HUB
            </span>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase px-3.5 py-1.5 bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 rounded-full backdrop-blur-md shadow-sm">
            v2.1.0 // ENTERPRISE
          </span>
        </div>
      </header>

      {/* Main Hero & Slogan */}
      <main className="relative z-10 max-w-4xl mx-auto w-full my-auto flex flex-col items-center text-center space-y-10 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center space-y-6"
        >
          {/* Animated Glowing Logo Wrapper */}
          <div className="p-4 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 rounded-[32px] shadow-lg backdrop-blur-md">
            <BatoLogo size={90} animate={true} monochrome={false} />
          </div>

          <div className="space-y-4">
            <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#1D1D1F] dark:text-white uppercase leading-tight">
              DIGITAL EXCELLENCE.<br />
              <span className="text-zinc-400 dark:text-zinc-500">DELIVERED DAILY.</span>
            </h1>
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed uppercase tracking-wider font-mono">
              Nigeria's Elite Corporate Portal for Business Formations, Fast Printing, and High-End Software Engineering Training.
            </p>
          </div>
        </motion.div>

        {/* The Teaser: Services at a Glance (Bento Grid) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl"
        >
          {/* Service 1 */}
          <div className="group bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-[24px] p-5 text-left transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-700 text-zinc-900 dark:text-white shadow-inner">
              <Briefcase className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <h3 className="font-sans text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest mt-4">
                CAC REGISTRIES
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1">
                AI-driven instant company, business, and NGO registrations.
              </p>
            </div>
          </div>

          {/* Service 2 */}
          <div className="group bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-[24px] p-5 text-left transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-700 text-zinc-900 dark:text-white shadow-inner">
              <Printer className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <h3 className="font-sans text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest mt-4">
                DOCUMENT HUB
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1">
                Automated document configuration, binding, and instant print routing.
              </p>
            </div>
          </div>

          {/* Service 3 */}
          <div className="group bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-[24px] p-5 text-left transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-700 text-zinc-900 dark:text-white shadow-inner">
              <GraduationCap className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <h3 className="font-sans text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest mt-4">
                TECH ACADEMY
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1">
                Full-stack software bootcamps with verified job-ready certification.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Large, Animated CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-6"
        >
          <button
            onClick={onGetStarted}
            className="group relative flex items-center justify-center gap-3 rounded-[24px] bg-[#1D1D1F] hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black px-10 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.98] border border-transparent dark:border-white"
          >
            <span>LAUNCH APPLICATION PORTAL</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center border-t border-zinc-200/40 dark:border-zinc-900 pt-6">
        <p className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 dark:text-zinc-600 uppercase">
          © 2026 BATO SAM DIGITAL HUB LTD. REGISTERED UNDER THE CORPORATE AFFAIRS COMMISSION, NIGERIA. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
