import React, { useState, useEffect } from "react";
import { ShieldCheck, Phone, Award, Home, Printer, Briefcase, GraduationCap, FolderOpen, HelpCircle, Clock, User, Sun, Moon } from "lucide-react";
import BatoLogo from "./BatoLogo";

interface NavbarProps {
  currentTab: "home" | "printing" | "cac" | "academy" | "dashboard" | "track" | "profile";
  onChangeTab: (tab: "home" | "printing" | "cac" | "academy" | "dashboard" | "track" | "profile") => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onLogoTripleClick: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Navbar({ currentTab, onChangeTab, isAdmin, onLogoutAdmin, onLogoTripleClick, theme, onToggleTheme }: NavbarProps) {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = () => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 500) {
      const nextCount = clickCount + 1;
      setClickCount(nextCount);
      if (nextCount === 3) {
        setClickCount(0);
        onLogoTripleClick();
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(currentTime);
  };

  const navItems = [
    { id: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { id: "printing", label: "Printing", icon: <Printer className="h-5 w-5" /> },
    { id: "cac", label: "CAC", icon: <Briefcase className="h-5 w-5" /> },
    { id: "academy", label: "Academy", icon: <GraduationCap className="h-5 w-5" /> },
    { id: "track", label: "Track", icon: <Clock className="h-5 w-5" /> },
    { id: "profile", label: "Account", icon: <User className="h-5 w-5" /> },
    ...(isAdmin ? [{ id: "dashboard", label: "Admin Vault", icon: <FolderOpen className="h-5 w-5" /> }] : [])
  ] as const;

  return (
    <>
      {/* 1. DESKTOP HEADER (Fixed top on medium/large screens) */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md text-[#1A1A1A] dark:text-zinc-100 hidden md:block transition-colors duration-300">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          
          {/* Logo Brand with Secret Triple-Click Trigger */}
          <div 
            onClick={handleLogoClick} 
            className="flex cursor-pointer items-center gap-3 transition-all hover:scale-[1.01] select-none"
            title="BATO SAM. NG"
          >
            <BatoLogo size={42} animate={false} monochrome={true} />
            <div>
              <span className="font-sans text-lg font-black tracking-tight text-[#1A1A1A] dark:text-zinc-100 block">
                {currentTab === "academy" ? (
                  <>JOVIBE <span className="text-zinc-800 dark:text-zinc-200">CODE</span></>
                ) : (
                  <>BATO SAM<span className="text-zinc-500 dark:text-zinc-400">. NG</span></>
                )}
              </span>
              <span className="block font-mono text-[8px] font-bold tracking-widest uppercase -mt-1">
                {currentTab === "academy" ? (
                  <span className="text-zinc-500 dark:text-zinc-400 font-extrabold">SPONSORED BY BATOSAM NIG.</span>
                ) : (
                  <span className="text-zinc-500 dark:text-zinc-400">DIGITAL EXCELLENCE. DELIVERED DAILY.</span>
                )}
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id as any)}
                className={`hover:text-black dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 py-2 border-b-2 ${
                  currentTab === item.id 
                    ? "text-black dark:text-white border-black dark:border-white" 
                    : "border-transparent text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Action Button & Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400 animate-pulse" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {isAdmin ? (
              <button
                onClick={onLogoutAdmin}
                className="rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white px-4 py-2 text-xs font-bold text-white dark:text-zinc-950 shadow-sm transition-all cursor-pointer"
              >
                Exit Staff Admin
              </button>
            ) : (
              <button
                onClick={() => onChangeTab("academy")}
                className="flex items-center gap-1.5 rounded-md bg-black dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-zinc-950 shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer"
              >
                <Award className="h-4 w-4" />
                <span>Admission letter</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. MOBILE TOP BAR (Fixed on top for brand recognition) */}
      <div className="sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[#1A1A1A] dark:text-zinc-100 px-4 py-3 flex items-center justify-between md:hidden select-none transition-colors duration-300">
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all"
        >
          <BatoLogo size={32} animate={false} monochrome={true} />
          <div>
            <span className="font-sans text-xs font-black tracking-wider text-[#1A1A1A] dark:text-zinc-100 block">
              {currentTab === "academy" ? "JOVIBE CODE" : "BATO SAM. NG"}
            </span>
            <span className="block font-mono text-[7px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase -mt-0.5">
              {currentTab === "academy" ? "SPONSORED BY BATOSAM" : "DIGITAL HUB"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-[9px] font-bold text-black dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-sm">
              Staff Live
            </span>
          )}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 border-t border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md md:hidden shadow-sm pb-safe transition-colors duration-300">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeTab(item.id as any);
                  // Soft haptic tick for premium mobile feel
                  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                    try {
                      navigator.vibrate(15);
                    } catch (e) {}
                  }
                }}
                className="flex flex-col items-center justify-center w-14 h-14 rounded-md transition-all relative cursor-pointer active:scale-90 transform-gpu duration-150"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {/* Active Minimalist Indicator Pill */}
                {isActive && (
                  <span className="absolute top-1.5 h-1.5 w-6 rounded-full bg-black dark:bg-white" />
                )}
                
                <div className={`transition-colors duration-200 ${
                  isActive ? "text-black dark:text-white scale-105" : "text-zinc-400 dark:text-zinc-500"
                }`}>
                  {item.icon}
                </div>
                
                <span className={`text-[8px] font-bold mt-1 uppercase tracking-wider transition-colors duration-200 ${
                  isActive ? "text-black dark:text-white" : "text-zinc-400 dark:text-zinc-500"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
