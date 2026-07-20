import React from "react";
import { motion } from "motion/react";
import { Briefcase, Printer, GraduationCap, ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { UserAccount } from "../utils/userSession";

interface UserDashboardProps {
  currentUser: UserAccount | null;
  onSelectService: (service: "cac" | "printing" | "academy") => void;
}

export default function UserDashboard({ currentUser, onSelectService }: UserDashboardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const services = [
    {
      id: "cac",
      title: "Register Business (CAC)",
      description: "Secure, prompt registrations of Companies, Business Names, and Trustees with our liaison registrar.",
      icon: <Briefcase className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />,
      tag: "100% SUCCESS RATE",
      color: "bg-zinc-100/50 dark:bg-zinc-900/30",
    },
    {
      id: "academy",
      title: "Tech Academy (Jovibe)",
      description: "Enroll in software development bootcamps with verified certificates, physical sessions, and direct mentorship.",
      icon: <GraduationCap className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />,
      tag: "CERTIFIED TRAINING",
      color: "bg-zinc-100/50 dark:bg-zinc-900/30",
    },
    {
      id: "printing",
      title: "Print & Document Hub",
      description: "Upload folders, select binding types, calculate quotes, and route to local high-volume lasers instantly.",
      icon: <Printer className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />,
      tag: "INSTANT DOCUMENT CONFIG",
      color: "bg-zinc-100/50 dark:bg-zinc-900/30",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16 space-y-12">
      {/* Dynamic Welcoming Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-900 pb-8">
        <div>
          <span className="font-mono text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            AUTHORIZED SECTOR WORKSPACE
          </span>
          <h1 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">
            {getGreeting()}, {currentUser?.fullName?.split(" ")[0] || "Client"}
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-1">
            Account verified. Secure administrative functions are fully active and synced.
          </p>
        </div>
        
        {/* Dynamic points badge */}
        <div className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3 backdrop-blur-md self-start md:self-center">
          <div className="h-7 w-7 rounded-full bg-zinc-50 dark:bg-zinc-850 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700">
            <Sparkles className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Bato Points Ledger</p>
            <p className="text-sm font-black text-zinc-900 dark:text-white font-mono leading-none mt-0.5">
              {((currentUser?.referralCount || 0) * 10)} <span className="text-[10px] font-normal text-zinc-400">PTS</span>
            </p>
          </div>
        </div>
      </div>

      {/* The Grid: Exactly 3 minimalist service cards */}
      <div className="space-y-6">
        <h2 className="text-[10px] font-mono font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-[0.25em]">
          CHOOSE SERVICE TERMINAL
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.button
              key={service.id}
              onClick={() => onSelectService(service.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group text-left bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-[32px] p-6 hover:shadow-lg hover:border-zinc-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden"
            >
              {/* Card top elements */}
              <div className="w-full flex justify-between items-start">
                <div className="h-12 w-12 rounded-[20px] bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-750 flex items-center justify-center text-zinc-900 dark:text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <span className="text-[8px] font-mono font-black text-zinc-400 dark:text-zinc-500 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {service.tag}
                </span>
              </div>

              {/* Card content and CTA */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-sans text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wide">
                    {service.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold leading-relaxed mt-1.5">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <span>Enter Panel</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dynamic referral prompt strip */}
      <div className="bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-850 p-6 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">ECOSYSTEM REWARDS PROGRAM</p>
          <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white">Invite your network to Bato Sam</h3>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold max-w-lg">
            Share your secure client referral link to credit your balance with 10 Bato Points for every friend registering for academy, printing, or registries.
          </p>
        </div>
        <button
          onClick={() => {
            // Open sidebar by simulating profile click or letting parent handle it
            const avatar = document.getElementById("navbar-user-avatar");
            if (avatar) avatar.click();
          }}
          className="px-5 py-3 rounded-2xl bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-black text-[10px] font-black uppercase tracking-widest font-mono shadow-md self-start sm:self-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Get Invite Link
        </button>
      </div>
    </div>
  );
}
