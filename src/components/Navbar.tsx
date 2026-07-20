import React, { useState } from "react";
import { ShieldCheck, Phone, Award, Home, Printer, Briefcase, GraduationCap, FolderOpen, HelpCircle, Clock, User, Sun, Moon, LogIn } from "lucide-react";
import BatoLogo from "./BatoLogo";
import { UserAccount } from "../utils/userSession";

interface NavbarProps {
  currentTab: "home" | "printing" | "cac" | "academy" | "dashboard" | "track" | "profile";
  onChangeTab: (tab: "home" | "printing" | "cac" | "academy" | "dashboard" | "track" | "profile") => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onLogoTripleClick: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  currentUser: UserAccount | null;
  onOpenSidebar: () => void;
  onOpenLoginModal: () => void;
}

export default function Navbar({ 
  currentTab, 
  onChangeTab, 
  isAdmin, 
  onLogoutAdmin, 
  onLogoTripleClick, 
  theme, 
  onToggleTheme,
  currentUser,
  onOpenSidebar,
  onOpenLoginModal
}: NavbarProps) {
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
    onChangeTab("home");
  };

  const navItems = [
    { id: "home", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { id: "printing", label: "Printing", icon: <Printer className="h-4 w-4" /> },
    { id: "cac", label: "CAC", icon: <Briefcase className="h-4 w-4" /> },
    { id: "academy", label: "Academy", icon: <GraduationCap className="h-4 w-4" /> },
    ...(isAdmin ? [{ id: "dashboard", label: "Admin Vault", icon: <FolderOpen className="h-4 w-4" /> }] : [])
  ] as const;

  return (
    <>
      {/* 1. DESKTOP HEADER (Fixed top on medium/large screens) */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md text-[#1A1A1A] dark:text-zinc-100 hidden md:block transition-colors duration-300">
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
              <span className="block font-mono text-[8px] font-bold tracking-widest uppercase -mt-1 text-zinc-500 dark:text-zinc-400">
                {currentTab === "academy" ? "SPONSORED BY BATOSAM NIG." : "DIGITAL EXCELLENCE. DELIVERED DAILY."}
              </span>
            </div>
          </div>

          {/* Desktop Nav Items - Only show if user is logged in */}
          {currentUser && (
            <nav className="flex items-center gap-8 text-xs font-black uppercase tracking-widest">
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
          )}

          {/* Action Button & Theme Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400 animate-pulse" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {currentUser ? (
              <button
                id="navbar-user-avatar"
                onClick={onOpenSidebar}
                className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-600 transition-all shadow-sm"
                title="Open Client Panel"
              >
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.fullName} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="h-5 w-5 text-zinc-500" />
                )}
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 rounded-xl bg-black dark:bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white dark:text-zinc-950 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Portal Sign In</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. MOBILE TOP BAR (Fixed on top for brand recognition) */}
      <div className="sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[#1A1A1A] dark:text-zinc-100 px-4 py-3.5 flex items-center justify-between md:hidden select-none transition-colors duration-300">
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
        
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {currentUser ? (
            <button
              onClick={onOpenSidebar}
              className="h-8.5 w-8.5 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer"
            >
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.fullName} 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-4.5 w-4.5 text-zinc-500" />
              )}
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="p-2 rounded-xl bg-black dark:bg-white text-white dark:text-zinc-950 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR - Only show if logged in */}
      {currentUser && (
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
                  
                  <span className={`text-[8px] font-black mt-1 uppercase tracking-widest transition-colors duration-200 ${
                    isActive ? "text-black dark:text-white" : "text-zinc-400 dark:text-zinc-500"
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
