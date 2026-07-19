import React, { useState, useEffect } from "react";
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight, 
  PhoneCall, 
  Calendar,
  FileText,
  Briefcase,
  GraduationCap,
  History
} from "lucide-react";
import { getStoredJobs, JobItem } from "../utils/localStorage";

export default function TrackJob() {
  const [searchId, setSearchId] = useState("");
  const [trackedJob, setTrackedJob] = useState<JobItem | null>(null);
  const [searched, setSearched] = useState(false);
  const [recentJobs, setRecentJobs] = useState<JobItem[]>([]);
  const [error, setError] = useState("");

  // Load recent jobs from localStorage to help user test/track easily
  useEffect(() => {
    const jobs = getStoredJobs();
    // Sort by timestamp descending
    const sorted = [...jobs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentJobs(sorted.slice(0, 5));

    // If there's a recently submitted job ID in session/URL query, pre-fill it
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get("trackId") || window.location.hash.split("?")[1]?.split("=")[1];
    if (queryId) {
      handleTrackById(queryId, jobs);
    }
  }, []);

  const handleTrackById = (id: string, jobsList?: JobItem[]) => {
    setError("");
    const list = jobsList || getStoredJobs();
    const cleanId = id.trim().toUpperCase();
    const found = list.find(job => job.id.toUpperCase() === cleanId);
    
    if (found) {
      setTrackedJob(found);
      setSearchId(found.id);
    } else {
      setTrackedJob(null);
      setError(`No active job found with Reference ID "${cleanId}". Please check the spelling or create a new order.`);
    }
    setSearched(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setError("Please enter a valid Job ID.");
      return;
    }
    handleTrackById(searchId);
  };

  // Stepper layout calculation
  const getStepStatus = (jobStatus: string) => {
    const normalized = jobStatus ? jobStatus.toLowerCase() : "";
    
    if (normalized.includes("ready") || normalized.includes("complete") || normalized.includes("pickup")) {
      return { step: 3, label: "Ready for Pickup" };
    }
    if (normalized.includes("work") || normalized.includes("process") || normalized.includes("progress")) {
      return { step: 2, label: "Working on it" };
    }
    // Default to In Review
    return { step: 1, label: "In Review" };
  };

  const activeStage = trackedJob ? getStepStatus(trackedJob.status) : { step: 1, label: "In Review" };

  const getJobDetailsText = (job: JobItem) => {
    if (job.type === "PRINT_ORDER") {
      return {
        title: "Print & Binding Hub Job",
        icon: <FileText className="h-5 w-5 text-blue-400" />,
        desc: `File: ${job.fileName} (${job.pages} pages, ${job.colorMode})`,
        meta: `Specs: ${job.finishing || "No binding"}`
      };
    } else if (job.type === "CAC_REGISTRATION") {
      return {
        title: "CAC Business Registration",
        icon: <Briefcase className="h-5 w-5 text-cyan-400" />,
        desc: `Entity: ${job.businessName}`,
        meta: `Type: ${job.entityType} (${job.industry})`
      };
    } else {
      return {
        title: "Tech Academy Admission",
        icon: <GraduationCap className="h-5 w-5 text-purple-400" />,
        desc: `Candidate: ${job.fullName}`,
        meta: `Course: ${job.course}`
      };
    }
  };

  const getWhatsAppLink = (job: JobItem) => {
    const savedPhoneNum = localStorage.getItem("vanguard_whatsapp_phone") || "2349043017213";
    const details = getJobDetailsText(job);
    const text = encodeURIComponent(
      `*JOB STATUS UPDATE INQUIRY*\n\n` +
      `• *Job ID:* ${job.id}\n` +
      `• *Service:* ${details.title}\n` +
      `• *Details:* ${details.desc}\n` +
      `• *Current Status:* ${activeStage.label}\n\n` +
      `Hello! I am checking on the progress of my job reference #${job.id}. Let me know if you require any additional materials.`
    );
    return `https://wa.me/${savedPhoneNum}?text=${text}`;
  };

  return (
    <section id="track" className="bg-[#F5F5F7] text-[#1D1D1F] py-16 sm:py-24 relative overflow-hidden font-sans min-h-[85vh] border-b border-zinc-200/50">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[350px] w-[350px] sm:w-[600px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[250px] w-[250px] rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/15">
            Operational Verification
          </span>
          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl uppercase">
            Live Job Tracker
          </h2>
          <p className="mt-3 font-sans text-xs sm:text-sm text-zinc-500 leading-relaxed font-semibold">
            Track print orders, government corporate filings, and student admissions in real-time. Enter your Job ID to inspect your live status.
          </p>
        </div>

        {/* Search Engine Container */}
        <div className="max-w-xl mx-auto mb-10">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white border border-zinc-200 rounded-[20px] p-2 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400/20 transition-all shadow-md backdrop-blur-md">
            <div className="pl-4 text-zinc-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Enter Job ID (e.g., JOB-7701 or NOUN-PRJ-XXXXXX)..."
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setError("");
              }}
              className="w-full bg-transparent border-0 px-3 py-3.5 text-xs sm:text-sm font-bold text-[#1D1D1F] placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              className="rounded-[16px] chrome-btn text-[#1D1D1F] px-5 sm:px-7 py-3.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-blue-500/20"
            >
              Track Job
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-[16px] bg-red-500/10 p-4 border border-red-500/20 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-red-400 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Search Result Dashboard */}
        {searched && trackedJob && (
          <div className="max-w-3xl mx-auto glass-panel border border-zinc-200/80 rounded-[32px] p-6 sm:p-8 backdrop-blur-md shadow-mdx animate-in fade-in duration-300 mb-12">
            
            {/* Header / Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-zinc-100 border border-zinc-200">
                  {getJobDetailsText(trackedJob).icon}
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                    Reference Identification
                  </span>
                  <h3 className="text-sm font-black text-[#1D1D1F] uppercase tracking-wide mt-0.5">
                    Job ID: {trackedJob.id}
                  </h3>
                </div>
              </div>

              <div className="flex flex-col sm:items-end text-left sm:text-right">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  Submission Date
                </span>
                <span className="text-xs font-bold text-zinc-700 mt-0.5 flex items-center gap-1.5 justify-start sm:justify-end">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                  {new Date(trackedJob.timestamp).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>

            {/* Core Info Details */}
            <div className="py-6 space-y-2">
              <p className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                {getJobDetailsText(trackedJob).title}
              </p>
              <h4 className="text-lg font-black text-[#1D1D1F] leading-snug">
                {getJobDetailsText(trackedJob).desc}
              </h4>
              <p className="text-xs text-zinc-500 font-semibold">
                {getJobDetailsText(trackedJob).meta}
              </p>
            </div>

            {/* Visual Tracking Stepper Pipeline */}
            <div className="bg-zinc-50 rounded-[24px] border border-zinc-200/60 p-6 sm:p-8 my-4">
              <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-8 text-center sm:text-left">
                Production Tracking Pipeline
              </p>

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                {/* Horizontal progress bar background (Desktop) */}
                <div className="absolute top-[18px] left-[15%] right-[15%] h-0.5 bg-zinc-100 hidden md:block" />
                {/* Active progress bar highlight (Desktop) */}
                <div className={`absolute top-[18px] left-[15%] h-0.5 bg-blue-600 transition-all duration-500 hidden md:block`} 
                  style={{ 
                    width: activeStage.step === 1 ? "0%" : activeStage.step === 2 ? "35%" : "70%" 
                  }} 
                />

                {/* Vertical line background (Mobile) */}
                <div className="absolute left-[18px] top-[10%] bottom-[10%] w-0.5 bg-zinc-100 md:hidden" />
                <div className="absolute left-[18px] top-[10%] w-0.5 bg-blue-600 transition-all duration-500 md:hidden"
                  style={{
                    height: activeStage.step === 1 ? "0%" : activeStage.step === 2 ? "50%" : "100%"
                  }}
                />

                {/* STEP 1: In Review */}
                <div className="relative flex flex-row md:flex-col items-center gap-4 md:gap-3 w-full md:w-1/3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-black transition-all z-10 ${
                    activeStage.step >= 1 
                      ? "bg-blue-600 border-blue-500 text-[#1D1D1F] shadow-sm shadow-blue-500/20 scale-105" 
                      : "bg-zinc-100 border-zinc-200 text-zinc-400"
                  }`}>
                    {activeStage.step > 1 ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : "01"}
                  </div>
                  <div className="text-left md:text-center">
                    <p className={`text-xs font-black uppercase tracking-wider ${activeStage.step === 1 ? "text-blue-400" : "text-[#1D1D1F]"}`}>
                      In Review
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Staff parsing specifications</p>
                  </div>
                </div>

                {/* STEP 2: Working on it */}
                <div className="relative flex flex-row md:flex-col items-center gap-4 md:gap-3 w-full md:w-1/3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-black transition-all z-10 ${
                    activeStage.step >= 2 
                      ? "bg-blue-600 border-blue-500 text-[#1D1D1F] shadow-sm shadow-blue-500/20 scale-105" 
                      : "bg-zinc-100 border-zinc-200 text-zinc-400"
                  }`}>
                    {activeStage.step > 2 ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : "02"}
                  </div>
                  <div className="text-left md:text-center">
                    <p className={`text-xs font-black uppercase tracking-wider ${activeStage.step === 2 ? "text-blue-400" : "text-zinc-500"}`}>
                      Working on it
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Active file execution & binding</p>
                  </div>
                </div>

                {/* STEP 3: Ready for Pickup */}
                <div className="relative flex flex-row md:flex-col items-center gap-4 md:gap-3 w-full md:w-1/3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs font-black transition-all z-10 ${
                    activeStage.step >= 3 
                      ? "bg-emerald-600 border-emerald-500 text-[#1D1D1F] shadow-sm shadow-emerald-500/20 scale-105" 
                      : "bg-zinc-100 border-zinc-200 text-zinc-400"
                  }`}>
                    {activeStage.step >= 3 ? <CheckCircle2 className="h-5 w-5" /> : "03"}
                  </div>
                  <div className="text-left md:text-center">
                    <p className={`text-xs font-black uppercase tracking-wider ${activeStage.step === 3 ? "text-emerald-400" : "text-zinc-500"}`}>
                      Ready for Pickup
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Available at storefront or dispatched</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span>Need immediate dispatch options?</span>
              </div>

              <a
                href={getWhatsAppLink(trackedJob)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-[16px] bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-[#1D1D1F] transition-all shadow-sm cursor-pointer"
              >
                <PhoneCall className="h-4 w-4 text-emerald-300" />
                <span>Talk to an Expert on WhatsApp</span>
              </a>
            </div>

          </div>
        )}

        {/* Recent Submissions lookup */}
        <div className="max-w-xl mx-auto rounded-[32px] border border-zinc-200/50 bg-zinc-50/50 p-5 sm:p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-blue-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700">
              Your Recent Submissions (Click to Track)
            </h4>
          </div>

          {recentJobs.length > 0 ? (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleTrackById(job.id)}
                  className="w-full flex items-center justify-between text-left rounded-[16px] bg-zinc-50 hover:bg-zinc-100 p-3 border border-zinc-200/50 hover:border-zinc-200 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <span className="font-mono text-[10px] font-bold text-zinc-500 block uppercase">
                        {job.id}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-800 line-clamp-1">
                        {job.type === "PRINT_ORDER" ? job.fileName : job.type === "CAC_REGISTRATION" ? job.businessName : job.fullName}
                      </span>
                    </div>
                  </div>

                  <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-blue-400">
                    {job.status || "In Review"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-400 font-medium text-center py-4">
              No recent jobs found on this browser. Submit a print file or CAC request to see them here!
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
