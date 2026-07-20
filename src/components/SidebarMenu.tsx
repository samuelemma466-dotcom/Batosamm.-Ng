import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, User, Mail, Smartphone, ShieldCheck, MapPin, 
  History, Share2, Copy, Sparkles, Settings, Eye, 
  EyeOff, HelpCircle, FileText, LogOut, ChevronDown, Check, Loader2, RefreshCw
} from "lucide-react";
import { UserAccount, getCurrentUser, logoutUser, updateUserIdentification } from "../utils/userSession";
import { getStoredJobs, JobItem } from "../utils/localStorage";
import { createUserInSupabase } from "../utils/supabase";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isAdmin: boolean;
  onChangeTab: (tab: any) => void;
}

export default function SidebarMenu({ 
  isOpen, 
  onClose, 
  currentUser, 
  onLogout, 
  theme, 
  onToggleTheme, 
  isAdmin, 
  onChangeTab 
}: SidebarMenuProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Profile state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState("National ID (NIN)");
  const [idNumber, setIdNumber] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Activity/Tracking state
  const [userJobs, setUserJobs] = useState<JobItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Referrals state
  const [copied, setCopied] = useState(false);
  const [simEmail, setSimEmail] = useState("");

  // Performance settings states
  const [lowDataMode, setLowDataMode] = useState(() => localStorage.getItem("bato_low_data_mode") === "true");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("bato_high_contrast") === "true");

  // Load user data on open/change
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setPhone(currentUser.phone || "");
      setAddress(currentUser.address || "");
      setIdType(currentUser.idType || "National ID (NIN)");
      setIdNumber(currentUser.idNumber || "");
    }
  }, [currentUser, isOpen]);

  // Load user jobs / submissions to track
  useEffect(() => {
    if (isOpen && currentUser) {
      setLoadingActivity(true);
      const allJobs = getStoredJobs();
      
      // Filter jobs matching current user (matching by email, phone, or name)
      const uEmail = currentUser.email?.trim().toLowerCase();
      const uPhone = currentUser.phone?.trim().toLowerCase();
      const uName = currentUser.fullName?.trim().toLowerCase();

      const filtered = allJobs.filter(job => {
        if (!job) return false;
        
        // Academy enrollment match
        if (job.type === "ACADEMY_ENROLLMENT") {
          return job.email?.trim().toLowerCase() === uEmail || 
                 job.phone?.trim().toLowerCase() === uPhone ||
                 job.fullName?.trim().toLowerCase() === uName;
        }
        
        // Print order match
        if (job.type === "PRINT_ORDER") {
          return job.instructions?.toLowerCase().includes(uEmail) || 
                 job.instructions?.toLowerCase().includes(uName);
        }

        // CAC match
        if (job.type === "CAC_REGISTRATION") {
          return job.whatsappMessage?.toLowerCase().includes(uEmail) || 
                 job.whatsappMessage?.toLowerCase().includes(uName) ||
                 job.businessName?.toLowerCase().includes(uName);
        }

        return false;
      });

      // If no filtered jobs, show the 4 most recent jobs as simulation help
      if (filtered.length === 0) {
        setUserJobs(allJobs.slice(0, 3));
      } else {
        setUserJobs(filtered);
      }
      setLoadingActivity(false);
    }
  }, [isOpen, currentUser]);

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    setProfileSuccess("");

    try {
      const updatedUser: UserAccount = {
        ...currentUser,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        idType,
        idNumber: idNumber.trim(),
        idVerified: !!idNumber.trim()
      };

      // Save locally
      localStorage.setItem("bato_sam_current_user", JSON.stringify(updatedUser));
      
      // Update in registered users list
      const rawUsers = localStorage.getItem("bato_sam_registered_users");
      if (rawUsers) {
        try {
          const list = JSON.parse(rawUsers);
          const updatedList = list.map((u: any) => u.id === currentUser.id ? updatedUser : u);
          localStorage.setItem("bato_sam_registered_users", JSON.stringify(updatedList));
        } catch (_) {}
      }

      // Sync to Supabase in the background
      await createUserInSupabase(updatedUser);

      // Dispatch event to refresh state across components
      window.dispatchEvent(new Event("bato_user_session_changed"));
      
      setProfileSuccess("Profile synchronized successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Invite Link generator
  const getInviteLink = () => {
    if (!currentUser) return "";
    const base = window.location.origin + window.location.pathname;
    return `${base}?ref=${currentUser.inviteCode || "BATO-INV-GUEST"}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmail.trim() || !currentUser) return;

    // Simulate referral trigger locally
    const rawUsers = localStorage.getItem("bato_sam_registered_users") || "[]";
    let list = [];
    try { list = JSON.parse(rawUsers); } catch (_) {}

    const updatedUser = {
      ...currentUser,
      referralCount: (currentUser.referralCount || 0) + 1,
      referredEmails: [...(currentUser.referredEmails || []), simEmail.trim()]
    };

    localStorage.setItem("bato_sam_current_user", JSON.stringify(updatedUser));
    const updatedList = list.map((u: any) => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem("bato_sam_registered_users", JSON.stringify(updatedList));

    // Notify components
    window.dispatchEvent(new Event("bato_user_session_changed"));
    setSimEmail("");
    alert(`Success! Simulation completed. Awarded 10 Bato Points to your ledger for referral of ${simEmail.trim()}.`);
  };

  // Toggle helpers for toggles section
  const handleToggleLowData = () => {
    const nextVal = !lowDataMode;
    setLowDataMode(nextVal);
    localStorage.setItem("bato_low_data_mode", nextVal ? "true" : "false");
    window.dispatchEvent(new Event("bato_low_data_mode_changed"));
  };

  const handleToggleHighContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    localStorage.setItem("bato_high_contrast", nextVal ? "true" : "false");
    window.dispatchEvent(new Event("bato_high_contrast_changed"));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Right Sliding Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white/95 dark:bg-zinc-950/95 border-l border-zinc-200 dark:border-zinc-900 shadow-2xl flex flex-col justify-between backdrop-blur-xl text-[#1D1D1F] dark:text-zinc-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-200/60 dark:border-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
                  {currentUser?.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.fullName} 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-5 w-5 text-zinc-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white truncate max-w-[180px]">
                    {currentUser?.fullName || "Guest Account"}
                  </h2>
                  <p className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest -mt-0.5">
                    {currentUser?.role === "admin" ? "ADMIN VAULT MASTER" : currentUser?.role === "staff" ? "STAFF MEMBER" : `CLIENT // ${currentUser?.id || "UNREGISTERED"}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Profile Card Summary & Bato Points Balance */}
              <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/50 dark:to-zinc-900/80 border border-zinc-200/50 dark:border-zinc-850 p-5 rounded-[24px] space-y-3.5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Sparkles className="h-16 w-16 text-zinc-400" />
                </div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    BATO SAM CREDENTIALS
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    ONLINE SYNCED
                  </span>
                </div>
                <div className="flex justify-between items-end relative z-10 pt-2">
                  <div>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">LEDGER BALANCE</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                      {((currentUser?.referralCount || 0) * 10).toLocaleString()} <span className="text-xs font-semibold text-zinc-400">PTS</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">REFERRALS</p>
                    <p className="text-lg font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                      {currentUser?.referralCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTIONS ACCORDION */}
              <div className="space-y-2.5">
                
                {/* 1. MY PROFILE */}
                <div className="border border-zinc-200/60 dark:border-zinc-900 rounded-[20px] overflow-hidden">
                  <button 
                    onClick={() => toggleSection("profile")}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">My Profile</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${activeSection === "profile" ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeSection === "profile" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-zinc-150 dark:border-zinc-900 bg-white dark:bg-zinc-950/40"
                      >
                        <form onSubmit={handleSaveProfile} className="p-4 space-y-4 text-xs font-medium">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider">Full Legal Name</label>
                            <input 
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider">Email (Locked)</label>
                              <input 
                                type="email"
                                disabled
                                value={currentUser?.email || ""}
                                className="w-full bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-lg p-2.5 font-bold cursor-not-allowed"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider">Phone / WhatsApp</label>
                              <input 
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-black uppercase text-zinc-400 tracking-wider">Postal / Physical Address</label>
                            <input 
                              type="text"
                              placeholder="No. 12 Badagry Expressway, Lagos"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-bold"
                            />
                          </div>

                          {/* ID Verification Fields */}
                          <div className="border-t border-zinc-150 dark:border-zinc-900 pt-3 space-y-3">
                            <span className="block text-[9px] font-mono font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3 text-emerald-500" />
                              IDENTITY VERIFICATION (NIN)
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[8px] font-mono font-black uppercase text-zinc-400 tracking-wider">Document Type</label>
                                <select 
                                  value={idType}
                                  onChange={(e) => setIdType(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 outline-none font-bold"
                                >
                                  <option value="National ID (NIN)">National ID (NIN)</option>
                                  <option value="Bank Verification Number (BVN)">BVN Reference</option>
                                  <option value="Driver's License">Driver's License</option>
                                  <option value="International Passport">International Passport</option>
                                  <option value="Voter's Card">Voter's Card</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-mono font-black uppercase text-zinc-400 tracking-wider">Document ID Number</label>
                                <input 
                                  type="text"
                                  placeholder="29384910291"
                                  value={idNumber}
                                  onChange={(e) => setIdNumber(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 outline-none focus:border-zinc-400 font-mono font-bold"
                                />
                              </div>
                            </div>
                          </div>

                          {profileSuccess && (
                            <p className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest text-center">
                              {profileSuccess}
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="w-full bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-black py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                          >
                            {savingProfile ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Syncing Profile...</span>
                              </>
                            ) : (
                              <span>Save & Sync Database</span>
                            )}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. MY ACTIVITY */}
                <div className="border border-zinc-200/60 dark:border-zinc-900 rounded-[20px] overflow-hidden">
                  <button 
                    onClick={() => toggleSection("activity")}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <History className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">My Activity</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${activeSection === "activity" ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeSection === "activity" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-zinc-150 dark:border-zinc-900 bg-white dark:bg-zinc-950/40"
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-center text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pb-1 border-b border-zinc-100 dark:border-zinc-900">
                            <span>REGISTRY PIPELINE STATUS</span>
                            <button 
                              onClick={() => {
                                // Reload jobs list helper
                                const all = getStoredJobs();
                                setUserJobs(all.slice(0, 3));
                              }}
                              className="hover:text-black dark:hover:text-white flex items-center gap-1 active:rotate-45 transition-transform"
                            >
                              <RefreshCw className="h-2.5 w-2.5" /> REFRESH
                            </button>
                          </div>

                          {loadingActivity ? (
                            <div className="py-6 text-center">
                              <Loader2 className="h-5 w-5 animate-spin mx-auto text-zinc-400" />
                            </div>
                          ) : userJobs.length === 0 ? (
                            <div className="py-6 text-center text-zinc-400 dark:text-zinc-500 text-[10px] font-bold">
                              No submissions found matching your account. Submit a CAC, Printing or Training order to see it here!
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {userJobs.map((job) => {
                                if (!job) return null;
                                
                                const isCAC = job.type === "CAC_REGISTRATION";
                                const isPrint = job.type === "PRINT_ORDER";
                                const title = isCAC 
                                  ? `CAC: ${job.businessName}` 
                                  : isPrint 
                                    ? `Print: ${job.fileName}` 
                                    : `Academy: ${job.course}`;

                                const subtitle = isCAC 
                                  ? `${job.entityType} • ${job.industry}` 
                                  : isPrint 
                                    ? `${job.jobType} • ${job.pages} pages` 
                                    : `Enrollment • ${job.preferredBatch || "Online"}`;

                                const statusLower = (job.status || "Pending").toLowerCase();
                                const statusColor = statusLower.includes("ready") || statusLower.includes("complete") || statusLower.includes("approve")
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                                  : statusLower.includes("progress") || statusLower.includes("work") || statusLower.includes("process")
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";

                                return (
                                  <div key={job.id} className="p-3 border border-zinc-250/50 dark:border-zinc-900 rounded-xl bg-zinc-50/40 dark:bg-zinc-900/30 flex justify-between items-start gap-3">
                                    <div className="space-y-1.5 min-w-0">
                                      <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wide truncate">
                                        {title}
                                      </p>
                                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase font-mono">
                                        {subtitle}
                                      </p>
                                      <p className="text-[8px] text-zinc-400 dark:text-zinc-600 font-bold font-mono">
                                        ID: {job.id} • {new Date(job.timestamp).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shrink-0 ${statusColor}`}>
                                      {job.status || "Pending"}
                                    </span>
                                  </div>
                                );
                              })}
                              
                              <button
                                onClick={() => {
                                  onClose();
                                  onChangeTab("track");
                                }}
                                className="w-full text-center py-2 text-[9px] font-mono font-black uppercase text-zinc-400 hover:text-black dark:hover:text-white tracking-widest border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl"
                              >
                                Deep-Track Reference ID ➔
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. REFERRALS & BATO POINTS */}
                <div className="border border-zinc-200/60 dark:border-zinc-900 rounded-[20px] overflow-hidden">
                  <button 
                    onClick={() => toggleSection("referrals")}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Share2 className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Referrals & Rewards</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${activeSection === "referrals" ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeSection === "referrals" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-zinc-150 dark:border-zinc-900 bg-white dark:bg-zinc-950/40"
                      >
                        <div className="p-4 space-y-4">
                          <div className="space-y-1">
                            <span className="block text-[8px] font-mono font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                              YOUR EXCLUSIVE INVITE LINK (10 POINTS / USER)
                            </span>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                disabled
                                value={getInviteLink()}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 rounded-lg p-2 text-[10px] font-mono select-all outline-none border border-zinc-200 dark:border-zinc-800 truncate"
                              />
                              <button 
                                onClick={handleCopyLink}
                                className="px-3 rounded-lg bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-black flex items-center justify-center transition-all cursor-pointer"
                              >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Referral Simulator Block for Fast Verification */}
                          <div className="border border-dashed border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-3 bg-zinc-50/30 dark:bg-zinc-900/10">
                            <span className="block text-[8px] font-mono font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                              VERIFY SYSTEM REFERRAL ACCRUAL
                            </span>
                            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                              Simulate a friend registering with your invitation code to test reward point updates instantly!
                            </p>
                            <form onSubmit={handleSimulateReferral} className="flex gap-2">
                              <input 
                                type="email"
                                required
                                placeholder="friend@noun.edu.ng"
                                value={simEmail}
                                onChange={(e) => setSimEmail(e.target.value)}
                                className="flex-grow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-[10px] outline-none"
                              />
                              <button 
                                type="submit"
                                className="px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-[10px] font-black uppercase tracking-widest border border-zinc-200 font-mono transition-all cursor-pointer"
                              >
                                Simulate
                              </button>
                            </form>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. PERFORMANCE SETTINGS */}
                <div className="border border-zinc-200/60 dark:border-zinc-900 rounded-[20px] overflow-hidden">
                  <button 
                    onClick={() => toggleSection("settings")}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Settings</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${activeSection === "settings" ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeSection === "settings" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-zinc-150 dark:border-zinc-900 bg-white dark:bg-zinc-950/40"
                      >
                        <div className="p-4 space-y-4 text-xs font-medium">
                          
                          {/* Theme Toggles */}
                          <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-900/55">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[10px]">Visual Color Scheme</p>
                              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">Toggle between dark obsidian and classic bright interfaces.</p>
                            </div>
                            <button 
                              onClick={onToggleTheme}
                              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                            >
                              {theme === "dark" ? "Dark Theme" : "Light Theme"}
                            </button>
                          </div>

                          {/* Low Data Mode */}
                          <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-900/55">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[10px]">Low Data Bandwidth</p>
                              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">Disable secondary network loops for rural NOUN campus areas.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={lowDataMode}
                                onChange={handleToggleLowData}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white peer-checked:after:bg-zinc-900 peer-checked:after:border-transparent" />
                            </label>
                          </div>

                          {/* High Contrast Mode */}
                          <div className="flex items-center justify-between py-1">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[10px]">High Accessibility Contrast</p>
                              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">Increase text weight and background luminance ratio levels.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={highContrast}
                                onChange={handleToggleHighContrast}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white peer-checked:after:bg-zinc-900 peer-checked:after:border-transparent" />
                            </label>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 5. LEGAL POLICIES */}
                <div className="border border-zinc-200/60 dark:border-zinc-900 rounded-[20px] overflow-hidden">
                  <button 
                    onClick={() => toggleSection("legal")}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Legal Agreements</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${activeSection === "legal" ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeSection === "legal" && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-zinc-150 dark:border-zinc-900 bg-white dark:bg-zinc-950/40"
                      >
                        <div className="p-4 space-y-4 text-[10px] leading-relaxed font-semibold text-zinc-500 max-h-[220px] overflow-y-auto">
                          
                          <div className="space-y-1.5">
                            <p className="font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900 pb-1 text-[9px]">
                              1. TERMS & CONDITIONS
                            </p>
                            <p>
                              By accessing and using BATO SAM DIGITAL HUB services, you explicitly agree to represent and verify all business records and filings provided to our CAC registrar liaison desk with absolute integrity. Bato Sam shall not be held liable for name request rejections or validation failures triggered by mock placeholders, false addresses, or incomplete NIN data.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <p className="font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900 pb-1 text-[9px]">
                              2. PRIVACY SECURITY POLICY
                            </p>
                            <p>
                              All client credentials, NIN inputs, draft documents, and enrollment dossiers are heavily encrypted, securely isolated, and linked with highest-grade Supabase database logic rules. We do not sell, rent, or distribute personal identity parameters or contact details to third-party marketing entities.
                            </p>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 6. ADMIN SECURITY ESCALATION (ONLY FOR STATED ROLES) */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onChangeTab("dashboard");
                    }}
                    className="w-full flex items-center gap-3 p-4 border border-zinc-200/60 dark:border-zinc-900 hover:border-black dark:hover:border-white rounded-[20px] bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 text-left transition-all"
                  >
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Launch Admin Vault</span>
                  </button>
                )}

              </div>

            </div>

            {/* Logout Footer Section */}
            <div className="p-6 border-t border-zinc-200/60 dark:border-zinc-900/80 bg-zinc-50/30 dark:bg-zinc-950/20">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full bg-red-500 hover:bg-red-600 active:scale-[0.99] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm border border-transparent shadow-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
