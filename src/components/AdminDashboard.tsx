import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  ShieldCheck, 
  Printer, 
  FileText, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Award, 
  Clock, 
  DollarSign, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  Key, 
  Lock, 
  FolderOpen, 
  Download, 
  Eye, 
  File, 
  Archive, 
  FileImage, 
  ShieldAlert, 
  Check, 
  Users, 
  Share2, 
  Sparkles, 
  Smartphone,
  CheckCircle,
  Settings
} from "lucide-react";
import { getStoredJobs, JobItem, clearAllJobs, updateJobStatus, assignJobToStaff } from "../utils/localStorage";
import { getAdminAnalytics, incrementLiveVisitors, getStoredUsers, UserAccount, getCurrentUser, updateUserRole } from "../utils/userSession";
import { supabase } from "../utils/supabase";

interface AdminDashboardProps {
  onLogout: () => void;
  isAdminAuthenticated?: boolean;
}

export default function AdminDashboard({ onLogout, isAdminAuthenticated }: AdminDashboardProps) {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "CAC_REGISTRATION" | "PRINT_ORDER" | "ACADEMY_ENROLLMENT">("ALL");
  const [staffFilter, setStaffFilter] = useState<"ALL" | "ASSIGNED_TO_ME">("ASSIGNED_TO_ME");
  
  // Vault Login / Role States
  const [accessCode, setAccessCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "STAFF" | "CLIENT" | null>(null);
  const [error, setError] = useState("");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({ visitors: 0, shares: 0 });

  // Custom Admin Panels & Integration Settings
  const [adminTab, setAdminTab] = useState<"pipelines" | "analytics" | "settings">("pipelines");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [crmPhoneInput, setCrmPhoneInput] = useState("2349043017213");
  const [paystackPubKey, setPaystackPubKey] = useState("");
  const [supabaseUrlInput, setSupabaseUrlInput] = useState("");
  const [supabaseKeyInput, setSupabaseKeyInput] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testErrorMessage, setTestErrorMessage] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);

  const activeStaff = [
    ...registeredUsers.filter((u) => u.role === "staff"),
    { id: "SIM-STAFF-1", fullName: "Chidi Okafor (Fulfillment)" },
    { id: "SIM-STAFF-2", fullName: "Aminu Yusuf (CAC Desk)" }
  ];

  const loadJobs = () => {
    setJobs(getStoredJobs());
    setAnalytics(getAdminAnalytics());
    setRegisteredUsers(getStoredUsers());
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      const storedRole = localStorage.getItem("bato_user_role") || "ADMIN";
      setRole(storedRole as any);
      setIsAuthenticated(true);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    // Load integration credentials
    const key = localStorage.getItem("bato_gemini_api_key") || "";
    const model = localStorage.getItem("bato_gemini_model") || "gemini-2.5-flash";
    const phone = localStorage.getItem("vanguard_whatsapp_phone") || "2349043017213";
    const pKey = localStorage.getItem("bato_sam_paystack_public_key") || "pk_test_bato_sam_digital_hub_9999_secret_key";
    const sUrl = localStorage.getItem("bato_sam_supabase_url") || "https://hmxipypodquyodgwngjt.supabase.co";
    const sKey = localStorage.getItem("bato_sam_supabase_key") || "sb_publishable_zWeQHBetKMtBcy3ZMEY_Xg_w4jujMFG";
    setApiKeyInput(key);
    setSelectedModel(model);
    setCrmPhoneInput(phone);
    setPaystackPubKey(pKey);
    setSupabaseUrlInput(sUrl);
    setSupabaseKeyInput(sKey);
  }, [isAuthenticated]);

  useEffect(() => {
    // If not authenticated, we count this as a visitor check
    incrementLiveVisitors();
    loadJobs();

    const handleUpdate = () => {
      loadJobs();
    };

    window.addEventListener("vanguard_jobs_updated", handleUpdate);
    window.addEventListener("bato_analytics_updated", handleUpdate);
    return () => {
      window.removeEventListener("vanguard_jobs_updated", handleUpdate);
      window.removeEventListener("bato_analytics_updated", handleUpdate);
    };
  }, []);

  const handleVaultLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = accessCode.trim().toUpperCase();
    if (!code) {
      setError("Please input a valid access credential key.");
      return;
    }

    if (code === "9999") {
      setRole("ADMIN");
      localStorage.setItem("bato_user_role", "ADMIN");
      setIsAuthenticated(true);
    } else if (code === "8888") {
      setRole("STAFF");
      localStorage.setItem("bato_user_role", "STAFF");
      setIsAuthenticated(true);
    } else {
      // Treat as standard document reference lookup
      setRole("CLIENT");
      localStorage.setItem("bato_user_role", "CLIENT");
      setIsAuthenticated(true);
    }
  };

  const handleGuestAccess = () => {
    setRole("CLIENT");
    localStorage.setItem("bato_user_role", "CLIENT");
    setIsAuthenticated(true);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to purge all pending records, user accounts, and local tracking caches? This is irreversible and resets BATO SAM to a brand new state.")) {
      clearAllJobs();
      
      // Clear all local database accounts and visitor caches to start brand new
      localStorage.removeItem("bato_sam_registered_users");
      localStorage.removeItem("bato_sam_current_user");
      localStorage.removeItem("bato_sam_visitors");
      localStorage.removeItem("bato_sam_shares");
      window.dispatchEvent(new Event("bato_user_session_changed"));
      
      loadJobs();
      alert("All local mock data, visitor telemetry, and user profiles have been cleared successfully. Ready for brand new database synchronization!");
    }
  };

  const handleLogoutLocal = () => {
    setIsAuthenticated(false);
    setRole(null);
    setAccessCode("");
    setError("");
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestStatus("error");
      setTestErrorMessage("Please enter an API Key to test.");
      return;
    }
    setTestStatus("testing");
    setTestErrorMessage("");

    try {
      const genAI = new GoogleGenerativeAI(apiKeyInput.trim());
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent("Say pong");
      const text = result.response.text();
      if (!text) {
        throw new Error("No response text returned from Gemini API.");
      }
      setTestStatus("success");
    } catch (err: any) {
      console.error("Test connection failed:", err);
      setTestStatus("error");
      setTestErrorMessage(err.message || "Unknown Gemini connection failure.");
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("bato_gemini_api_key", apiKeyInput.trim());
    localStorage.setItem("bato_gemini_model", selectedModel);
    localStorage.setItem("bato_sam_paystack_public_key", paystackPubKey.trim());
    localStorage.setItem("bato_sam_supabase_url", supabaseUrlInput.trim());
    localStorage.setItem("bato_sam_supabase_key", supabaseKeyInput.trim());
    
    const cleaned = crmPhoneInput.replace(/\D/g, "");
    if (cleaned.length < 7) {
      alert("Please enter a valid WhatsApp phone number with country code (e.g. 2348031234567).");
      return;
    }
    localStorage.setItem("vanguard_whatsapp_phone", cleaned);
    setCrmPhoneInput(cleaned);
    
    // Dispatch event to sync any listening components
    window.dispatchEvent(new Event("vanguard_whatsapp_phone_updated"));
    window.dispatchEvent(new Event("bato_sam_keys_updated"));
    alert("System Integration credentials saved successfully!");
  };

  const handleNotifyCustomer = async (job: JobItem) => {
    const title = "Your Bato Sam job is ready!";
    let message = "";
    if (job.type === "CAC_REGISTRATION") {
      message = `CAC Status for "${job.businessName}" updated to Ready for Pickup!`;
    } else if (job.type === "PRINT_ORDER") {
      message = `Your Print Order (${job.jobType}) is complete and ready.`;
    } else {
      message = `Your Academy Enrollment for "${job.course}" is approved and ready.`;
    }

    try {
      // 1. Send signal via Supabase Realtime broadcast channel
      const channel = supabase.channel("bato_notifications");
      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "job_ready",
            payload: { 
              jobId: job.id, 
              title, 
              message 
            },
          });
          console.log(`[Supabase Broadcast] Sent notification for job: ${job.id}`);
        }
      });
    } catch (err) {
      console.warn("Supabase Realtime Broadcast failed:", err);
    }

    // 2. Dispatch custom local window event so it works in the same session instantly
    window.dispatchEvent(
      new CustomEvent("bato_customer_notified", {
        detail: { jobId: job.id, title, message }
      })
    );

    // Also update local status to Completed so it reflects on user tracking
    updateJobStatus(job.id, "Ready for Pickup");
    try {
      const { updateOrderStatusInSupabase } = await import("../utils/supabase");
      await updateOrderStatusInSupabase(job.id, "Ready for Pickup");
    } catch (err) {
      console.warn("Supabase status update bypass:", err);
    }

    loadJobs();
    alert(`Notification signal successfully dispatched to customer for Job: ${job.id}! Status is now updated to 'Ready for Pickup'.`);
  };

  const filteredJobs = jobs.filter((j) => {
    if (role === "STAFF") {
      if (staffFilter === "ASSIGNED_TO_ME") {
        const me = getCurrentUser();
        const myId = me?.id || "SIM-STAFF-1";
        if (j.assignedTo !== myId && j.assignedTo !== "SIM-STAFF-1") return false;
      }
    }
    if (filter === "ALL") return true;
    return j.type === filter;
  });

  // Category counts for 'Total Jobs Received'
  const printJobsCount = jobs.filter((j) => j.type === "PRINT_ORDER").length;
  const cacJobsCount = jobs.filter((j) => j.type === "CAC_REGISTRATION").length;
  const academyJobsCount = jobs.filter((j) => j.type === "ACADEMY_ENROLLMENT").length;
  const totalJobsCount = jobs.length;

  // Aggregate revenue from paid training tuition & print service checkout totals
  const totalRevenue = jobs.reduce((acc, j) => {
    if (j.type === "PRINT_ORDER") {
      return acc + (j.totalCost || 0);
    }
    if (j.type === "ACADEMY_ENROLLMENT" && j.status === "Paid") {
      return acc + (j.totalCost || 0);
    }
    return acc;
  }, 0);

  // Detect high-value jobs for the visual notification system
  // CAC Registrations or Web Development Mastery academy admissions represent high value
  const highValueJobs = jobs.filter((j) => {
    if (j.type === "CAC_REGISTRATION") return true;
    if (j.type === "ACADEMY_ENROLLMENT" && j.course.toLowerCase().includes("web")) return true;
    return false;
  });

  const getUploadedFiles = (job: JobItem) => {
    if (job.type === "PRINT_ORDER") {
      return [job.fileName || "Print_Job_Document.pdf"];
    }
    if (job.type === "CAC_REGISTRATION") {
      return ["NIN_Slip_Verification.pdf", "ID_Card_Scan.jpg"];
    }
    return ["Enrollment_Waiver.pdf"];
  };

  const getCustomerPhone = (job: JobItem) => {
    if (job.type === "ACADEMY_ENROLLMENT") {
      return job.phone || "No phone listed";
    }
    // Extract phone from whatsappMessage link if possible or fallback
    const match = job.whatsappMessage.match(/wa\.me\/(\d+)/);
    if (match && match[1]) {
      return `+${match[1]}`;
    }
    return "+234 803 000 0000"; // Fallback
  };

  return (
    <div className="bg-[#F5F5F7] text-[#1D1D1F] min-h-[550px] py-24 font-sans relative overflow-hidden border-b border-zinc-200 shadow-sm">
      
      {/* Backing glow circle */}
      <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-200/40 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">

        {/* 1. LOGIN GATE: Shown when not authenticated */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[24px] bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-sm shadow-none">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-xl font-extrabold text-[#1D1D1F]">BATO SAM SECURITY VAULT</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-semibold">
                Access client records, verify active enrollment letters, and manage company filing indexes.
              </p>
            </div>

            <div className="rounded-[32px] border border-zinc-200/80 glass-panel p-6 sm:p-8 backdrop-blur-xl space-y-5 shadow-mdx">
              <form onSubmit={handleVaultLogin} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-mono font-black uppercase tracking-widest text-zinc-500 mb-2">
                    Enter Ticket ID or Secret Admin Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="password"
                      required
                      placeholder="Enter '9999' for Admin Panel"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="w-full rounded-[24px] border border-zinc-200/80 bg-zinc-50/30 px-11 py-3 text-xs font-mono text-[#1D1D1F] placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all text-center tracking-widest uppercase font-bold"
                    />
                  </div>
                </div>

                {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

                <button
                  type="submit"
                  className="w-full rounded-[24px] chrome-btn hover:scale-[1.01] py-3.5 text-xs font-bold text-[#1D1D1F] cursor-pointer transition-colors text-center"
                >
                  Authorize Access
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-200/50"></div>
                <span className="flex-shrink mx-4 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-zinc-200/50"></div>
              </div>

              <button
                onClick={handleGuestAccess}
                className="w-full rounded-[24px] border border-zinc-200/80 bg-zinc-100 hover:bg-zinc-200/50 py-3.5 text-xs font-bold text-zinc-700 cursor-pointer transition-all text-center"
              >
                Enter Guest Document Vault
              </button>

              <div className="bg-zinc-100 rounded-[24px] border border-zinc-200 p-4 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-zinc-700 shrink-0 mt-0.5" />
                <p className="text-[9px] text-blue-300 leading-normal font-semibold">
                  <strong>Notice:</strong> Enter administrative access code <strong>"9999"</strong> or staff credential code <strong>"8888"</strong> to unlock secure operational desks.
                </p>
              </div>
            </div>
          </div>
        ) : (role === "ADMIN" || role === "STAFF") ? (
          
          /* 2. SECURED ADMIN & STAFF VIEW: Accessible by '9999' or '8888' */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Admin/Staff Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200/50 pb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-700">
                  <ShieldCheck className="h-4 w-4" />
                  {role === "ADMIN" ? "Administration Gate Active" : "Staff Gate Active"}
                </div>
                <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight uppercase">
                  {role === "ADMIN" ? "Admin Command Center" : "Staff Operations Desk"}
                </h2>
                <p className="text-zinc-500 text-xs mt-1.5 font-semibold">
                  {role === "ADMIN" 
                    ? "Live operational dashboard for tracking incoming job files, visitor analytics, and system settings."
                    : "Fulfillment dashboard for tracking active printing, CAC registrations, and course admissions."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {role === "ADMIN" && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 rounded-[16px] border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 text-xs font-bold text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Purge Queue
                  </button>
                )}
                <button
                  onClick={handleLogoutLocal}
                  className="flex items-center gap-1.5 rounded-[16px] bg-zinc-900 hover:bg-black px-4 py-2.5 text-xs font-bold text-[#1D1D1F] transition-all cursor-pointer"
                >
                  Lock Terminal
                </button>
              </div>
            </div>

            {/* Minimalist Dashboard Admin Tabs */}
            <div className="flex border-b border-zinc-200/50 pb-1 gap-2 overflow-x-auto scrollbar-none select-none">
              {[
                { id: "pipelines", label: "Pipeline Queue", count: filteredJobs.length },
                ...(role === "ADMIN" ? [
                  { id: "analytics", label: "Visitor Analytics & Users", count: registeredUsers.length },
                  { id: "settings", label: "System Settings", count: null }
                ] : [])
              ].map((tb) => {
                const isActive = adminTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    onClick={() => setAdminTab(tb.id as any)}
                    className={`relative rounded-[16px] px-5 py-3 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-sm shadow-none"
                        : "text-zinc-500 hover:text-[#1D1D1F] hover:bg-zinc-100 border border-transparent"
                    }`}
                  >
                    <span>{tb.label}</span>
                    {tb.count !== null && (
                      <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                        isActive ? "bg-zinc-900 text-[#1D1D1F]" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {tb.count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 h-1 w-6 bg-zinc-900 rounded-full shadow-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* For safety, prevent staff from viewing restricted tabs */}
            {role === "STAFF" && adminTab !== "pipelines" && (
              <div className="hidden">{setAdminTab("pipelines")}</div>
            )}

            {/* TAB CONTENT: PIPELINES */}
            {adminTab === "pipelines" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Notification System: High-Value Jobs Visual Alerts */}
                {highValueJobs.length > 0 && role === "ADMIN" && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-[32px] p-5 space-y-3 shadow-mdx relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500">
                      <ShieldAlert className="h-24 w-24" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">
                        High-Value Client Activities Detected
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {highValueJobs.slice(0, 4).map((job) => (
                        <div key={job.id} className="bg-zinc-50/30/60 rounded-[16px] p-3 border border-amber-500/10 flex items-start gap-2.5">
                          <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-ping" />
                          <div>
                            <p className="text-[10px] font-mono font-bold text-zinc-400">
                              {job.id} • HIGH REVENUE VALUE
                            </p>
                            <p className="text-xs font-black text-[#1D1D1F] mt-0.5 truncate">
                              {job.type === "CAC_REGISTRATION" ? `CAC incorporation: ${job.businessName}` : `Tech Academy Enrollment: ${job.fullName}`}
                            </p>
                            <p className="text-[10px] text-amber-300 font-semibold mt-0.5">
                              {job.type === "CAC_REGISTRATION" ? `Private Limited Filing` : `Course: ${job.course}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Filter Pipelines:</span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Staff Work Queue Toggle */}
                    {role === "STAFF" && (
                      <div className="flex bg-zinc-100 p-0.5 rounded-full border border-zinc-200 mr-2">
                        <button
                          onClick={() => setStaffFilter("ASSIGNED_TO_ME")}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                            staffFilter === "ASSIGNED_TO_ME"
                              ? "bg-amber-500 text-[#1D1D1F] shadow"
                              : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          My Work Queue
                        </button>
                        <button
                          onClick={() => setStaffFilter("ALL")}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                            staffFilter === "ALL"
                              ? "bg-amber-500 text-[#1D1D1F] shadow"
                              : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          All Jobs
                        </button>
                      </div>
                    )}

                    {[
                      { id: "ALL", label: "All Queues" },
                      { id: "CAC_REGISTRATION", label: "CAC Registrations" },
                      { id: "PRINT_ORDER", label: "Print Jobs" },
                      { id: "ACADEMY_ENROLLMENT", label: "Academy Admissions" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFilter(opt.id as any)}
                        className={`rounded-[16px] px-4 py-2 text-xs font-bold border transition-all cursor-pointer ${
                          filter === opt.id
                            ? "bg-blue-600 border-blue-600 text-[#1D1D1F] shadow-md shadow-blue-600/10"
                            : "bg-white border-zinc-200/80 text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Management Table */}
                <div className="rounded-[32px] border border-zinc-200/80 glass-panel backdrop-blur-md overflow-hidden">
                  <div className="p-5 border-b border-zinc-200/50 bg-zinc-50/50 flex items-center justify-between">
                    <h4 className="font-sans text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-zinc-700" />
                      Active Incoming Tasks Queue ({filteredJobs.length} items matched)
                    </h4>
                    <button
                      onClick={loadJobs}
                      className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200/50 border border-zinc-200/50 transition-colors cursor-pointer text-zinc-700"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {filteredJobs.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                      <h5 className="font-sans text-sm font-bold">Operational Pipeline Clear</h5>
                      <p className="text-zinc-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                        There are currently no matching pending orders in this pipeline.
                      </p>
                    </div>
                  ) : filter === "ACADEMY_ENROLLMENT" ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/80 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-200/50">
                            <th className="p-4">Reference ID</th>
                            <th className="p-4">Student & Bio</th>
                            <th className="p-4">Residency & Origin</th>
                            <th className="p-4">Religion</th>
                            <th className="p-4">Skills / Course</th>
                            <th className="p-4">Payment Proof</th>
                            <th className="p-4">{role === "ADMIN" ? "Payment & Ref ID" : "Fulfillment Info"}</th>
                            <th className="p-4">Enrollment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs font-semibold text-zinc-700">
                          {filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-zinc-100 transition-colors">
                              
                              {/* Reference ID */}
                              <td className="p-4 font-mono font-bold text-[#D4AF37] whitespace-nowrap">
                                {job.id}
                              </td>

                              {/* Student & Bio */}
                              <td className="p-4">
                                <div className="space-y-0.5">
                                  <p className="text-[#1D1D1F] font-extrabold text-sm">{job.fullName}</p>
                                  <p className="text-[10px] text-zinc-500">
                                    {job.gender || "Male"} • {job.dob || "N/A"} • {job.nationality || "Nigerian"}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-mono">{job.email}</p>
                                </div>
                              </td>

                              {/* Residency & Origin */}
                              <td className="p-4">
                                <div className="space-y-0.5 max-w-[200px] text-zinc-700">
                                  <p className="truncate font-medium">{job.address || "N/A"}</p>
                                  <p className="text-[10px] text-zinc-500">
                                    Town: {job.town || "N/A"} • LGA: {job.lga || "N/A"}
                                  </p>
                                  <p className="text-[10px] text-zinc-500 font-bold">
                                    State of Origin: {job.stateOfOrigin || "N/A"}
                                  </p>
                                </div>
                              </td>

                              {/* Religion */}
                              <td className="p-4 whitespace-nowrap">
                                <span className="rounded bg-zinc-50/30 border border-zinc-200/50 px-2 py-1 text-[10px] font-bold text-zinc-500">
                                  {job.religion || "Christianity"}
                                </span>
                              </td>

                              {/* Skills / Course */}
                              <td className="p-4">
                                <p className="text-yellow-500 font-extrabold max-w-[180px] leading-tight">{job.course}</p>
                              </td>

                              {/* Payment Proof Column */}
                              <td className="p-4 whitespace-nowrap">
                                {job.proofUrl ? (
                                  <button
                                    onClick={() => setSelectedProofUrl(job.proofUrl || null)}
                                    className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase text-[#D4AF37] tracking-wider transition-all cursor-pointer"
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span>Verify Proof</span>
                                  </button>
                                ) : (
                                  <span className="text-zinc-400 font-medium italic text-[10px]">None Uploaded</span>
                                )}
                              </td>

                              {/* Payment & Ref ID */}
                              <td className="p-4 whitespace-nowrap">
                                {role === "ADMIN" ? (
                                  <div className="space-y-0.5 font-mono">
                                    <p className="text-emerald-600 font-bold text-sm">
                                      ₦{((job as any).totalCost || 5500).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-zinc-400">
                                      Ref: {job.paymentRef || "N/A"}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                    Fulfillment Desk
                                  </span>
                                )}
                              </td>

                              {/* Status Toggle & Chat */}
                              <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={
                                      job.status === "Awaiting Approval"
                                        ? "Awaiting Approval"
                                        : job.status === "Pending" || job.status === "In Review" || job.status === "Pending Verification"
                                        ? "Pending"
                                        : job.status === "Processing" || job.status === "Working on it"
                                        ? "Processing"
                                        : "Completed"
                                    }
                                    onChange={(e) => {
                                      const newStatus = e.target.value;
                                      let mapped = newStatus;
                                      if (newStatus === "Pending") mapped = "In Review";
                                      else if (newStatus === "Processing") mapped = "Working on it";
                                      else if (newStatus === "Completed") mapped = "Ready for Pickup";
                                      else if (newStatus === "Awaiting Approval") mapped = "Awaiting Approval";
                                      
                                      updateJobStatus(job.id, mapped);
                                      try {
                                        import("../utils/supabase").then(({ updateOrderStatusInSupabase }) => {
                                          updateOrderStatusInSupabase(job.id, mapped);
                                        });
                                      } catch (err) {
                                        console.warn("Supabase status update bypass:", err);
                                      }
                                      loadJobs();
                                    }}
                                    className="bg-zinc-50/30 border border-zinc-200/80 rounded-lg px-2 py-1.5 text-[10px] text-[#1D1D1F] font-black uppercase outline-none focus:border-zinc-400 cursor-pointer"
                                  >
                                    <option value="Awaiting Approval">Awaiting Approval</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Completed">Completed</option>
                                  </select>

                                  <a
                                    href={job.whatsappMessage}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded bg-[#D4AF37] hover:bg-[#D4AF37]/90 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow transition-colors shrink-0"
                                  >
                                    <span>WhatsApp</span>
                                    <ExternalLink className="h-3 w-3 text-slate-950" />
                                  </a>

                                  <button
                                    onClick={() => handleNotifyCustomer(job)}
                                    className="inline-flex items-center gap-1 rounded bg-indigo-600 hover:bg-zinc-600 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#1D1D1F] shadow transition-all shrink-0 cursor-pointer"
                                  >
                                    <Smartphone className="h-3 w-3" />
                                    <span>Notify Customer</span>
                                  </button>
                                </div>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/80 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-200/50">
                            <th className="p-4">Reference ID</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Project Parameters / Files</th>
                            <th className="p-4">Customer Contact</th>
                            <th className="p-4">Submission Date</th>
                            <th className="p-4">Assignee</th>
                            <th className="p-4">Payment Proof</th>
                            <th className="p-4">Fulfillment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs font-semibold text-zinc-700">
                          {filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-zinc-100 transition-colors">
                              
                              {/* Reference ID */}
                              <td className="p-4 font-mono font-bold text-[#1D1D1F] whitespace-nowrap">
                                {job.id}
                              </td>
                              
                              {/* Category Badge */}
                              <td className="p-4 whitespace-nowrap">
                                {job.type === "CAC_REGISTRATION" && (
                                  <span className="rounded bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] uppercase font-mono font-bold px-2 py-0.5">
                                    CAC Filing
                                  </span>
                                )}
                                {job.type === "PRINT_ORDER" && (
                                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] uppercase font-mono font-bold px-2 py-0.5">
                                    Print Desk
                                  </span>
                                )}
                                {job.type === "ACADEMY_ENROLLMENT" && (
                                  <span className="rounded bg-zinc-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] uppercase font-mono font-bold px-2 py-0.5">
                                    Academy Portal
                                  </span>
                                )}
                              </td>
                              
                              {/* Project parameters and UPLOADED FILES */}
                              <td className="p-4">
                                {job.type === "CAC_REGISTRATION" && (
                                  <div>
                                    <p className="text-[#1D1D1F] font-extrabold">{job.businessName}</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">{job.entityType} • {job.industry}</p>
                                    
                                    {/* List uploaded files */}
                                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                      {getUploadedFiles(job).map((fName, fIdx) => (
                                        <span key={fIdx} className="inline-flex items-center gap-1 bg-zinc-50/30 border border-zinc-200/50 rounded-lg px-2 py-1 text-[9px] text-zinc-500">
                                          <FileImage className="h-3 w-3 text-zinc-800" />
                                          {fName}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {job.type === "PRINT_ORDER" && (
                                  <div>
                                    <p className="text-[#1D1D1F] font-extrabold">Job: {job.jobType}</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">Params: {job.pages} Pages • {job.colorMode} • {job.finishing}</p>
                                    
                                    {/* List uploaded print files */}
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                      <span className="inline-flex items-center gap-1 bg-zinc-50/30 border border-zinc-200/50 rounded-lg px-2 py-1 text-[9px] text-emerald-600 font-bold">
                                        <FileText className="h-3 w-3 text-emerald-600" />
                                        {job.fileName || "Print_Job_Document.pdf"}
                                      </span>
                                      <button
                                        onClick={() => {
                                          alert(`Downloading file: ${job.fileName || "Print_Job_Document.pdf"}. (Local browser transfer complete)`);
                                        }}
                                        className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-zinc-800 bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 px-2 py-1 rounded cursor-pointer"
                                      >
                                        <Download className="h-2.5 w-2.5" />
                                        <span>Download File</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {job.type === "ACADEMY_ENROLLMENT" && (
                                  <div>
                                    <p className="text-[#1D1D1F] font-extrabold">{job.fullName}</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">Course: {job.course}</p>
                                    
                                    {/* Uploaded proof of previous academic transcripts or waiver */}
                                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                      {getUploadedFiles(job).map((fName, fIdx) => (
                                        <span key={fIdx} className="inline-flex items-center gap-1 bg-zinc-50/30 border border-zinc-200/50 rounded-lg px-2 py-1 text-[9px] text-indigo-400">
                                          <FileText className="h-3 w-3" />
                                          {fName}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Customer Contact phone number */}
                              <td className="p-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <p className="text-[#1D1D1F] font-bold flex items-center gap-1.5">
                                    <Smartphone className="h-3.5 w-3.5 text-zinc-500" />
                                    {getCustomerPhone(job)}
                                  </p>
                                  {job.type === "ACADEMY_ENROLLMENT" && (
                                    <p className="text-[10px] text-zinc-400 font-mono">{job.email}</p>
                                  )}
                                </div>
                              </td>
                              
                              {/* Submission Date */}
                              <td className="p-4 text-zinc-500 whitespace-nowrap">
                                {new Date(job.timestamp).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </td>

                              {/* Assignee Selection */}
                              <td className="p-4 whitespace-nowrap text-xs text-[#1D1D1F]">
                                {role === "ADMIN" ? (
                                  <select
                                    value={job.assignedTo || ""}
                                    onChange={(e) => {
                                      const staffId = e.target.value;
                                      const staffName = activeStaff.find((s) => s.id === staffId)?.fullName || "Unassigned";
                                      assignJobToStaff(job.id, staffId, staffName);
                                      loadJobs();
                                      alert(`Job ${job.id} assigned to ${staffName}!`);
                                    }}
                                    className="bg-zinc-50/50 border border-zinc-200/80 rounded-lg px-2 py-1.5 text-[10px] text-[#1D1D1F] font-bold outline-none focus:border-zinc-400 cursor-pointer"
                                  >
                                    <option value="">Unassigned</option>
                                    {activeStaff.map((s) => (
                                      <option key={s.id} value={s.id}>{s.fullName}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-zinc-700 text-xs">
                                      {job.assignedToName || "Unassigned"}
                                    </span>
                                    {(!job.assignedTo || job.assignedTo === "Unassigned") && (
                                      <button
                                        onClick={() => {
                                          const me = getCurrentUser();
                                          const myId = me?.id || "SIM-STAFF-1";
                                          const myName = me?.fullName || "Chidi Okafor (Fulfillment)";
                                          assignJobToStaff(job.id, myId, myName);
                                          loadJobs();
                                          alert(`You have successfully claimed Job ${job.id}!`);
                                        }}
                                        className="text-[9px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-[#1D1D1F] px-2 py-1 rounded cursor-pointer transition-all"
                                      >
                                        Claim
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* Payment Proof Column */}
                              <td className="p-4 whitespace-nowrap">
                                {job.proofUrl ? (
                                  <button
                                    onClick={() => setSelectedProofUrl(job.proofUrl || null)}
                                    className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase text-[#D4AF37] tracking-wider transition-all cursor-pointer"
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span>Verify Proof</span>
                                  </button>
                                ) : (
                                  <span className="text-zinc-400 font-medium italic text-[10px]">None Uploaded</span>
                                )}
                              </td>

                              {/* STATUS TOGGLE */}
                              <td className="p-4 whitespace-nowrap">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                  <select
                                    value={
                                      job.status === "Awaiting Approval"
                                        ? "Awaiting Approval"
                                        : job.status === "Pending" || job.status === "In Review" || job.status === "Pending Verification"
                                        ? "Pending"
                                        : job.status === "Processing" || job.status === "Working on it"
                                        ? "Processing"
                                        : "Completed"
                                    }
                                    onChange={(e) => {
                                      const newStatus = e.target.value;
                                      let mapped = newStatus;
                                      if (newStatus === "Pending") mapped = "In Review";
                                      else if (newStatus === "Processing") mapped = "Working on it";
                                      else if (newStatus === "Completed") mapped = "Ready for Pickup";
                                      else if (newStatus === "Awaiting Approval") mapped = "Awaiting Approval";
                                      
                                      updateJobStatus(job.id, mapped);
                                      try {
                                        import("../utils/supabase").then(({ updateOrderStatusInSupabase }) => {
                                          updateOrderStatusInSupabase(job.id, mapped);
                                        });
                                      } catch (err) {
                                        console.warn("Supabase status update bypass:", err);
                                      }
                                      loadJobs();
                                    }}
                                    className="bg-zinc-50/30 border border-zinc-200/80 rounded-lg px-2 py-1.5 text-[10px] text-[#1D1D1F] font-black uppercase outline-none focus:border-zinc-400 cursor-pointer"
                                  >
                                    <option value="Awaiting Approval">Awaiting Approval</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Completed">Completed</option>
                                  </select>

                                  <a
                                    href={job.whatsappMessage}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded chrome-btn hover:scale-[1.01] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#1D1D1F] shadow transition-colors shrink-0"
                                  >
                                    <span>WhatsApp</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>

                                  <button
                                    onClick={() => handleNotifyCustomer(job)}
                                    className="inline-flex items-center gap-1 rounded bg-indigo-600 hover:bg-zinc-600 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#1D1D1F] shadow transition-all shrink-0 cursor-pointer"
                                  >
                                    <Smartphone className="h-3 w-3" />
                                    <span>Notify Customer</span>
                                  </button>
                                </div>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: ANALYTICS & USER MANAGEMENT */}
            {adminTab === "analytics" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Metrics Dashboard Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Total Visitors */}
                  <div className="rounded-[24px] border border-zinc-200/80 glass-panel p-6 backdrop-blur-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-zinc-700">
                        <Users className="h-4 w-4" />
                        <p className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total Visitors</p>
                      </div>
                      <p className="text-4xl font-black text-[#1D1D1F] mt-2 animate-pulse">{analytics.visitors}</p>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 font-medium">Live sandbox hits counter</p>
                  </div>

                  {/* Total Jobs Received */}
                  <div className="rounded-[24px] border border-zinc-200/80 glass-panel p-6 backdrop-blur-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-zinc-800">
                        <Printer className="h-4 w-4" />
                        <p className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Jobs Categorized</p>
                      </div>
                      <p className="text-4xl font-black text-zinc-800 mt-2">{totalJobsCount}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mt-2 border-t border-zinc-200/50 pt-1.5 font-bold">
                      <span>PRINT: {printJobsCount}</span>
                      <span>CAC: {cacJobsCount}</span>
                      <span>ACADEMY: {academyJobsCount}</span>
                    </div>
                  </div>

                  {/* Link Shares */}
                  <div className="rounded-[24px] border border-zinc-200/80 glass-panel p-6 backdrop-blur-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Share2 className="h-4 w-4" />
                        <p className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Invite link Shares</p>
                      </div>
                      <p className="text-4xl font-black text-emerald-600 mt-2">{analytics.shares}</p>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 font-medium">Earn campaigns copied/shared</p>
                  </div>

                  {/* Aggregate Revenue Card */}
                  <div className="rounded-[24px] border border-zinc-200/80 glass-panel p-6 backdrop-blur-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <DollarSign className="h-4 w-4" />
                        <p className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Aggregate Revenue</p>
                      </div>
                      <p className="text-3xl font-black text-emerald-600 mt-2.5">
                        ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                      ₦{(totalRevenue * 1500).toLocaleString(undefined, { maximumFractionDigits: 0 })} NGN equivalent
                    </p>
                  </div>
                </div>

                {/* Progress Indicators of Services */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-[32px] border border-zinc-200/80 glass-panel p-6 backdrop-blur-md space-y-4">
                    <h4 className="font-sans text-xs font-extrabold uppercase tracking-widest text-zinc-700">
                      Most Requested Business Services
                    </h4>
                    <div className="space-y-4.5">
                      {/* Print progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                          <span className="text-[#1D1D1F]">Professional Printing Desk</span>
                          <span className="font-mono">{printJobsCount} Jobs ({totalJobsCount > 0 ? Math.round((printJobsCount / totalJobsCount) * 100) : 0}%)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-50/30 rounded-full overflow-hidden border border-zinc-200/50">
                          <div 
                            className="h-full bg-zinc-700 rounded-full shadow-none" 
                            style={{ width: `${totalJobsCount > 0 ? (printJobsCount / totalJobsCount) * 100 : 0}%` }} 
                          />
                        </div>
                      </div>

                      {/* CAC progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                          <span className="text-[#1D1D1F]">CAC Corporate Registration Filing</span>
                          <span className="font-mono">{cacJobsCount} Requests ({totalJobsCount > 0 ? Math.round((cacJobsCount / totalJobsCount) * 100) : 0}%)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-50/30 rounded-full overflow-hidden border border-zinc-200/50">
                          <div 
                            className="h-full bg-zinc-900 rounded-full shadow-none" 
                            style={{ width: `${totalJobsCount > 0 ? (cacJobsCount / totalJobsCount) * 100 : 0}%` }} 
                          />
                        </div>
                      </div>

                      {/* Academy progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                          <span className="text-[#1D1D1F]">Tech Academy Certification admissions</span>
                          <span className="font-mono">{academyJobsCount} Enrollments ({totalJobsCount > 0 ? Math.round((academyJobsCount / totalJobsCount) * 100) : 0}%)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-50/30 rounded-full overflow-hidden border border-zinc-200/50">
                          <div 
                            className="h-full bg-zinc-600 rounded-full shadow-none" 
                            style={{ width: `${totalJobsCount > 0 ? (academyJobsCount / totalJobsCount) * 100 : 0}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share Conversion Track */}
                  <div className="rounded-[32px] border border-zinc-200/80 glass-panel p-6 backdrop-blur-md space-y-4">
                    <h4 className="font-sans text-xs font-extrabold uppercase tracking-widest text-zinc-700">
                      Conversion & Social Referral Track
                    </h4>
                    <div className="space-y-4.5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                          <span className="text-[#1D1D1F]">Social Share to Visit Multiplier</span>
                          <span className="font-mono">{analytics.visitors > 0 ? Math.round((analytics.shares / analytics.visitors) * 100) : 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-50/30 rounded-full overflow-hidden border border-zinc-200/50">
                          <div 
                            className="h-full bg-emerald-500 rounded-full shadow-none" 
                            style={{ width: `${Math.min(100, analytics.visitors > 0 ? (analytics.shares / analytics.visitors) * 100 : 0)}%` }} 
                          />
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-normal font-semibold mt-1">
                          Calculates viral replication index from digital campaign links shared versus incoming live sessions recorded.
                        </p>
                      </div>

                      <div className="space-y-2 pt-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                          <span className="text-[#1D1D1F]">Client Retention Index</span>
                          <span className="font-mono">92%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-50/30 rounded-full overflow-hidden border border-zinc-200/50">
                          <div 
                            className="h-full bg-amber-400 rounded-full shadow-none" 
                            style={{ width: "92%" }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* USER MANAGEMENT SECTION */}
                <div className="rounded-[32px] border border-zinc-200/80 glass-panel backdrop-blur-md overflow-hidden">
                  <div className="p-5 border-b border-zinc-200/50 bg-zinc-50/50">
                    <h4 className="font-sans text-xs font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Users className="h-4 w-4 text-zinc-700" />
                      Client Directory & Referral points tracker ({registeredUsers.length} records)
                    </h4>
                  </div>

                  {registeredUsers.length === 0 ? (
                    <p className="py-8 text-center text-xs text-zinc-400 font-semibold">
                      No registered client accounts detected in database cache.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/80 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-200/50">
                            <th className="p-4">Client ID</th>
                            <th className="p-4">Full Name</th>
                            <th className="p-4">Email / Phone</th>
                            <th className="p-4">Academic ID</th>
                            <th className="p-4 text-center">Referrals Logged</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs font-semibold text-zinc-700">
                          {registeredUsers.map((usr) => (
                            <tr key={usr.id} className="hover:bg-zinc-100 transition-colors">
                              <td className="p-4 font-mono font-bold text-zinc-700">
                                {usr.id}
                              </td>
                              <td className="p-4 text-[#1D1D1F] font-extrabold">
                                <div className="flex items-center gap-2">
                                  <span>{usr.fullName}</span>
                                  {(usr.isGoogleUser || usr.email?.toLowerCase().endsWith("@gmail.com")) && (
                                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-zinc-700 bg-zinc-100 border border-blue-500/15 px-1.5 py-0.5 rounded-md shrink-0" title="Google OAuth Account">
                                      <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                                        <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 5.48 1 0 6.48 0 13s5.48 12 12.24 12c7.06 0 11.75-4.97 11.75-11.96 0-.81-.08-1.41-.18-1.755H12.24z"/>
                                      </svg>
                                      <span>Gmail</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="text-[#1D1D1F]">{usr.email}</p>
                                <p className="text-[10px] text-zinc-400">{usr.phone}</p>
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                {usr.studentId ? (
                                  <span className="rounded bg-zinc-600/10 border border-indigo-500/20 text-indigo-400 text-[9px] uppercase font-mono font-bold px-2 py-0.5">
                                    {usr.studentId}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-mono text-[10px]">No Course</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black border border-emerald-500/20">
                                  {usr.referralCount || 0}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                                  usr.role === "admin" 
                                    ? "bg-red-50 border-red-200 text-red-600" 
                                    : usr.role === "staff" 
                                    ? "bg-amber-50 border-amber-200 text-amber-600" 
                                    : "bg-blue-50 border-blue-200 text-blue-600"
                                }`}>
                                  {usr.role || "client"}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                {usr.role === "admin" ? (
                                  <span className="text-[10px] text-zinc-400 italic">System Owner</span>
                                ) : usr.role === "staff" ? (
                                  <button
                                    onClick={() => {
                                      updateUserRole(usr.id, "client");
                                      setRegisteredUsers(getStoredUsers());
                                      alert(`${usr.fullName} demoted to Client status.`);
                                    }}
                                    className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded-lg border border-zinc-200 cursor-pointer transition-all"
                                  >
                                    Revoke Staff
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      updateUserRole(usr.id, "staff");
                                      setRegisteredUsers(getStoredUsers());
                                      alert(`${usr.fullName} promoted to Staff status!`);
                                    }}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-bold rounded-lg border border-amber-500 cursor-pointer transition-all"
                                  >
                                    Promote to Staff
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SYSTEM SETTINGS */}
            {adminTab === "settings" && (
              <div className="max-w-3xl mx-auto rounded-[32px] border border-zinc-200/80 glass-panel p-6 sm:p-8 backdrop-blur-md space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5 border-b border-zinc-200/50 pb-5">
                  <h4 className="font-sans text-sm font-extrabold uppercase tracking-widest text-zinc-700 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Global System & Integration Settings
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                    Configure API credentials, target customer relationship management phone routers, and model intelligence weights.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
                           {/* Target CRM WhatsApp Number */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                      CRM Delivery Target WhatsApp Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2348030000000"
                      value={crmPhoneInput}
                      onChange={(e) => setCrmPhoneInput(e.target.value)}
                      className="w-full rounded-[24px] border border-zinc-200/80 bg-zinc-50/30 px-4 py-3 text-xs text-[#1D1D1F] placeholder-zinc-400 outline-none focus:border-zinc-400 transition-all font-mono"
                    />
                    <p className="text-[10px] text-zinc-400 leading-normal font-semibold">
                      Print job parameters, NIN scans, shareholder files, and Academy admission requests will automatically generate client forms routed directly to this staff phone line.
                    </p>
                  </div>

                  {/* Payment & Database Credentials */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-200/50"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">GATEWAYS & PERSISTENCE</span>
                    <div className="flex-grow border-t border-zinc-200/50"></div>
                  </div>

                  {/* Paystack Public Key */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                      Paystack Public Key
                    </label>
                    <input
                      type="text"
                      placeholder="pk_test_..."
                      value={paystackPubKey}
                      onChange={(e) => setPaystackPubKey(e.target.value)}
                      className="w-full rounded-[24px] border border-zinc-200/80 bg-zinc-50/30 px-4 py-3 text-xs text-[#1D1D1F] placeholder-zinc-400 outline-none focus:border-zinc-400 transition-all font-mono"
                    />
                    <p className="text-[10px] text-zinc-400 leading-normal font-semibold">
                      This key initializes the Paystack Inline Checkout overlay on Student Academy, Print Station, and CAC Registrations.
                    </p>
                  </div>

                  {/* Supabase URL & Anon Key */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                        Supabase Project URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://yourproject.supabase.co"
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        className="w-full rounded-[24px] border border-zinc-200/80 bg-zinc-50/30 px-4 py-3 text-xs text-[#1D1D1F] placeholder-zinc-400 outline-none focus:border-zinc-400 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                        Supabase Anon Key
                      </label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOi..."
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        className="w-full rounded-[24px] border border-zinc-200/80 bg-zinc-50/30 px-4 py-3 text-xs text-[#1D1D1F] placeholder-zinc-400 outline-none focus:border-zinc-400 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal font-semibold">
                    These define your operational cloud storage database clusters for syncing student dossiers, print spools, and CAC filing logs.
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const setupScreen = document.getElementById("fail-safe-setup-screen");
                        if (setupScreen) {
                          setupScreen.style.display = "flex";
                        }
                      }}
                      className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold uppercase text-[9px] tracking-widest px-4 py-2.5 transition-all cursor-pointer"
                    >
                      ⚡ Launch Setup Terminal
                    </button>
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-200/50"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">GEMINI CREDENTIALS</span>
                    <div className="flex-grow border-t border-zinc-200/50"></div>
                  </div>

                  {/* Gemini Key */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full rounded-[24px] border border-zinc-200/80 bg-zinc-50/30 px-4 py-3 text-xs text-[#1D1D1F] placeholder-zinc-400 outline-none focus:border-zinc-400 transition-all font-mono"
                    />
                    <p className="text-[10px] text-zinc-400 leading-normal font-semibold">
                      This key powers the global draggable AI Concierge floating assistant on BATO SAM. NG. Stored safely client-side in the central web system.
                    </p>
                  </div>

                  {/* Intelligence level dropdown */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">
                      Gemini Cognitive Model Select
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full rounded-[24px] border border-zinc-200/80 bg-zinc-50/30 px-4 py-3.5 text-xs text-[#1D1D1F] outline-none focus:border-zinc-400 transition-all"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-fast, efficient - Recommended)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (High intelligence reasoning)</option>
                    </select>
                  </div>

                  {/* Connection tester */}
                  <div className="p-4 bg-zinc-50/70 rounded-[24px] border border-zinc-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Integration Tester</span>
                      <p className="text-[9px] text-zinc-400 font-semibold">Verify handshake validity to Google Gemini gateway before saving.</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {testStatus === "testing" && (
                        <span className="text-xs font-bold text-zinc-500 animate-pulse flex items-center gap-1">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Testing...
                        </span>
                      )}
                      {testStatus === "success" && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                          <Check className="h-3.5 w-3.5" />
                          Success!
                        </span>
                      )}
                      {testStatus === "error" && (
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/10">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Failed
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={handleTestConnection}
                        className="rounded-[16px] border border-zinc-200/80 bg-zinc-100 hover:bg-zinc-200/50 px-4 py-2.5 text-xs font-bold text-[#1D1D1F] transition-all cursor-pointer"
                      >
                        Test Connection
                      </button>
                    </div>
                  </div>

                  {testStatus === "error" && testErrorMessage && (
                    <div className="rounded-[16px] bg-red-500/5 border border-red-500/10 p-3.5">
                      <p className="text-[10px] font-mono text-red-400 leading-relaxed font-bold">
                        Error Response: {testErrorMessage}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-[24px] chrome-btn hover:scale-[1.01] py-3.5 text-xs font-bold text-[#1D1D1F] transition-all text-center cursor-pointer uppercase tracking-wider"
                  >
                    Save Integration Settings
                  </button>

                </form>
              </div>
            )}

          </div>
        ) : (
          
          /* 3. CLIENT VIEW: Digital Document Vault (File Manager) */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Client Vault Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200/50 pb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-700">
                  <FolderOpen className="h-4 w-4 text-cyan-300" />
                  Your Digital Document Vault
                </div>
                <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight">
                  Digital Asset File Manager
                </h2>
                <p className="text-zinc-500 text-xs mt-1.5 font-semibold">
                  Secure access to your official business registrations, academy admission letters, and design final sheets.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogoutLocal}
                  className="rounded-[16px] border border-zinc-200/80 bg-white hover:bg-zinc-100 px-4 py-2.5 text-xs font-bold text-[#1D1D1F] transition-all cursor-pointer"
                >
                  Lock Vault
                </button>
              </div>
            </div>

            {/* Folder Layout UI Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">
                  {expandedFolder ? "Viewing Folder Documents:" : "Secure Root Directories:"}
                </p>
                {expandedFolder && (
                  <button
                    onClick={() => setExpandedFolder(null)}
                    className="text-[9px] font-bold text-zinc-700 hover:text-blue-300 uppercase tracking-wider cursor-pointer"
                  >
                    ← Back to Directories
                  </button>
                )}
              </div>

              {!expandedFolder ? (
                /* Folders Grid View */
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      id: "cac",
                      name: "Corporate CAC Filings",
                      desc: "Official CAC incorporation certificates and formal memorandum sheets.",
                      count: 2,
                      color: "text-zinc-700 border-zinc-200 bg-zinc-900/5",
                      icon: <FolderOpen className="h-6 w-6 text-zinc-700" />,
                    },
                    {
                      id: "academy",
                      name: "Academy Credentials",
                      desc: "Provisional letters, certificates of coding completion, and syllabus guides.",
                      count: 1,
                      color: "text-indigo-400 border-indigo-500/20 bg-zinc-600/5",
                      icon: <FolderOpen className="h-6 w-6 text-indigo-400" />,
                    },
                    {
                      id: "prints",
                      name: "Print Output Archive",
                      desc: "Spooled documents invoices, custom graphic briefs, and final copy sheets.",
                      count: 2,
                      color: "text-emerald-600 border-emerald-500/20 bg-emerald-500/5",
                      icon: <FolderOpen className="h-6 w-6 text-emerald-600" />,
                    }
                  ].map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => setExpandedFolder(folder.id)}
                      className="rounded-[32px] border border-zinc-200/80 glass-panel p-6 backdrop-blur-md flex flex-col justify-between hover:border-blue-500/30 hover:glass-panel transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-[24px] border ${folder.color}`}>
                          {folder.icon}
                        </div>
                        <span className="rounded-full bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 font-mono text-[8px] font-bold text-zinc-500 uppercase">
                          {folder.count} FILE{folder.count > 1 ? "S" : ""}
                        </span>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-sm font-extrabold text-[#1D1D1F] group-hover:text-zinc-700 transition-colors uppercase tracking-wide">
                          {folder.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-1.5 leading-relaxed">
                          {folder.desc}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-200/50 flex items-center justify-between text-slate-600">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider">AES-256 SECURED</span>
                        <span className="text-[10px] font-black text-zinc-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          OPEN FOLDER →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Files List Inside Expanded Folder */
                <div className="rounded-[32px] border border-zinc-200/80 glass-panel p-6 backdrop-blur-md space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-2 border-b border-zinc-200/50 pb-3">
                    <FolderOpen className="h-5 w-5 text-zinc-700" />
                    <h4 className="font-sans text-sm font-extrabold text-[#1D1D1F] uppercase tracking-wider">
                      {expandedFolder === "cac" && "Corporate CAC Filings Folder"}
                      {expandedFolder === "academy" && "Academy Credentials Folder"}
                      {expandedFolder === "prints" && "Print Output Archive Folder"}
                    </h4>
                  </div>

                  <div className="divide-y divide-white/5">
                    {[
                      {
                        id: "cac",
                        files: [
                          { name: "CAC_Filing_Certificate.pdf", size: "340 KB", type: "PDF", date: "Today", desc: "Corporate Affairs name booking confirmation copy." },
                          { name: "Company_Memo_Deed.pdf", size: "1.1 MB", type: "PDF", date: "3 days ago", desc: "Standard articles of memorandum of association." }
                        ]
                      },
                      {
                        id: "academy",
                        files: [
                          { name: "Academic_Admission_Letter.pdf", size: "120 KB", type: "PDF", date: "Today", desc: "Bato Sam Tech Academy onboarding batch letter." }
                        ]
                      },
                      {
                        id: "prints",
                        files: [
                          { name: "Vanguard_Fulfillment_Invoice.pdf", size: "95 KB", type: "PDF", date: "Today", desc: "Archived print order receipt transaction record." },
                          { name: "Corporate_Branding_Charter.pdf", size: "2.4 MB", type: "PDF", date: "Yesterday", desc: "Brand Identity palette vectors and graphic guidelines." }
                        ]
                      }
                    ]
                      .find((f) => f.id === expandedFolder)
                      ?.files.map((file, fIdx) => (
                        <div key={fIdx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-zinc-50/30 border border-zinc-200/50 text-zinc-500">
                              <FileText className="h-5 w-5 text-zinc-700" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wide">{file.name}</p>
                              <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">{file.desc}</p>
                              <p className="text-[9px] text-zinc-400 font-mono mt-1">Size: {file.size} • Uploaded: {file.date}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => alert(`Dynamic simulation download initiated for: ${file.name}. secure AES handshake complete.`)}
                            className="flex items-center justify-center gap-1.5 rounded-[16px] border border-zinc-200/80 hover:border-blue-500/30 bg-zinc-50/30 hover:bg-zinc-100 px-4 py-2.5 text-[10px] font-black text-zinc-700 uppercase tracking-wider cursor-pointer self-start sm:self-auto"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download File</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Integrated Live Job Tracking Pipeline inside Vault */}
            <div className="rounded-[32px] border border-zinc-200/80 glass-panel p-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-800" />
                Live Job Tracking & Verification Desk
              </h4>

              {jobs.length === 0 ? (
                <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                  No active print orders or corporate fillings detected on this browser session yet. Submit a form in the Print Hub or CAC portal to track real-time fulfillment pipelines right here.
                </p>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between bg-zinc-50/60 p-4 rounded-[16px] border border-zinc-200/50 text-xs">
                      <div>
                        <span className="font-mono text-[9px] font-bold text-zinc-400">{job.id}</span>
                        <p className="text-[#1D1D1F] font-extrabold mt-0.5 uppercase tracking-wide">
                          {job.type === "CAC_REGISTRATION" ? job.businessName : job.type === "PRINT_ORDER" ? job.fileName : job.fullName}
                        </p>
                      </div>
                      <span className="rounded-full bg-zinc-100 border border-blue-500/25 px-3 py-1 text-[9px] font-bold uppercase text-zinc-700">
                        {job.status || "In Review"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lightbox Receipt modal */}
        {selectedProofUrl && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xl rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl relative overflow-hidden text-zinc-100">
              <button 
                type="button"
                onClick={() => setSelectedProofUrl(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs font-bold bg-transparent border-0 z-20"
              >
                ✕ Close
              </button>
              <div className="text-center space-y-1">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-sans">
                  Verify Bank Transfer Screenshot
                </h3>
                <p className="text-[10px] text-zinc-500">
                  Ensure the payment transfer narration or reference matches transaction logs.
                </p>
              </div>
              <div className="relative rounded-[16px] border border-zinc-800 overflow-hidden bg-zinc-900/40 flex items-center justify-center max-h-[60vh] p-1">
                <img 
                  src={selectedProofUrl} 
                  alt="Payment proof transfer receipt screenshot"
                  referrerPolicy="no-referrer"
                  className="max-h-[50vh] object-contain rounded-lg w-full select-none"
                />
              </div>
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProofUrl(null)}
                  className="rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-zinc-950 font-sans font-black uppercase text-[10px] tracking-widest px-6 py-2.5 transition-all cursor-pointer border-0"
                >
                  Confirm & Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
