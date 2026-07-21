import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  AlertCircle, 
  MapPin, 
  ArrowRight, 
  Book, 
  Download, 
  Award, 
  School, 
  ExternalLink, 
  HelpCircle, 
  FileText, 
  Loader2, 
  CreditCard,
  Heart,
  BookOpenText,
  BadgeAlert,
  Sparkle,
  Share2
} from "lucide-react";
import { motion } from "motion/react";
import { saveJob } from "../utils/localStorage";
import { createOrderInSupabase, uploadProofToSupabase, sendAdminAlert } from "../utils/supabase";
import { getCurrentUser } from "../utils/userSession";

export default function StudentPortal() {
  const [step, setStep] = useState(1);

  // Share action state & handler
  const [shareNotification, setShareNotification] = useState("");

  const handleShareAcademy = async () => {
    const shareData = {
      title: "Jovibe Code Tech Academy - Free Tuition",
      text: "Acquire premium, world-class technical skills with FREE tuition sponsored by Bato Sam Digital Hub. Apply now!",
      url: window.location.origin + "?tab=academy"
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareNotification("Shared successfully!");
        setTimeout(() => setShareNotification(""), 3000);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Web Share failed:", err);
        }
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareNotification("Link copied to clipboard!");
        setTimeout(() => setShareNotification(""), 3000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        setShareNotification("Failed to copy link.");
        setTimeout(() => setShareNotification(""), 3000);
      }
    }
  };

  // Auto-fill form fields from logged-in Google / standard user account
  useEffect(() => {
    const activeUser = getCurrentUser();
    if (activeUser) {
      if (activeUser.fullName) setFullName(activeUser.fullName);
      if (activeUser.email) setEmail(activeUser.email);
      if (activeUser.phone && activeUser.phone !== "Google Auth") {
        setPhone(activeUser.phone);
      }
    }
  }, []);
  
  // Paystack Integration States
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Safe bypass
      }
    };
  }, []);

  // Step 1: Bio Data
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [nationality, setNationality] = useState("Nigerian");
  const [email, setEmail] = useState(""); // Kept as optional/helper for notifications

  // Step 2: Location Details
  const [houseAddress, setHouseAddress] = useState("");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [lga, setLga] = useState("");
  const [town, setTown] = useState("");

  // Step 3: Religious & Extra
  const [religion, setReligion] = useState("Christianity");

  // Step 4: Skill Selection Checklist (Max 2, Min 1)
  const availableSkills = [
    { id: "ai_prompt", name: "AI Prompt Engineering", desc: "System design, custom guidelines, context limits, and tool-calling flows." },
    { id: "vibe_coding", name: "Vibe Coding", desc: "AI code generation, prompt-driven iteration, and rapid prototype deployment." },
    { id: "graphic_design", name: "Graphic Design", desc: "Visual geometry, logo shielding, premium colors, and layout typography." },
    { id: "cbt_practice", name: "CBT Practice", desc: "Computer-based testing simulations, timed exams, and dynamic analytics dashboards." },
    { id: "three_d_design", name: "3D Product Design", desc: "Model rendering, lighting, product mesh models, and STL print exports." },
    { id: "coding_app", name: "Coding/App Development", desc: "Web applications, database persistence, Express endpoints, and production deployments." },
    { id: "basic_computing", name: "Basic Computing", desc: "File systems, executive spreadsheets, word processors, and secure operations." }
  ];
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 5: Commitment & Fee
  const [commitmentSigned, setCommitmentSigned] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"full" | "installment_1">("full");

  // Connected gateway & verification states
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "opay">("paystack");
  const [showOPayModal, setShowOPayModal] = useState(false);
  const [opayVerifying, setOpayVerifying] = useState(false);
  const [opayRef, setOpayRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofError, setProofError] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [syllabusTab, setSyllabusTab] = useState<"list" | "details">("details");

  // Countdown timer to next batch enrollment
  const [daysLeft, setDaysLeft] = useState(14);
  const [hoursLeft, setHoursLeft] = useState(5);
  const [minutesLeft, setMinutesLeft] = useState(24);
  const [secondsLeft, setSecondsLeft] = useState(45);

  useEffect(() => {
    const now = new Date();
    let targetYear = now.getFullYear();
    let targetMonth = now.getMonth();
    let targetDay = 1;

    if (now.getDate() < 15) {
      targetDay = 15;
    } else {
      targetMonth += 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
      targetDay = 1;
    }

    const targetDate = new Date(targetYear, targetMonth, targetDay, 9, 0, 0);

    const timer = setInterval(() => {
      const difference = targetDate.getTime() - Date.now();
      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setDaysLeft(d);
      setHoursLeft(h);
      setMinutesLeft(m);
      setSecondsLeft(s);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!fullName.trim()) {
        setError("Please enter the candidate's full legal name.");
        return;
      }
      if (!phone.trim()) {
        setError("Please enter your mobile phone number.");
        return;
      }
      if (!dob) {
        setError("Please select the candidate's date of birth.");
        return;
      }
      if (!nationality.trim()) {
        setError("Please specify the candidate's nationality.");
        return;
      }
    } else if (step === 2) {
      if (!houseAddress.trim()) {
        setError("Please enter your residential house address.");
        return;
      }
      if (!stateOfOrigin.trim()) {
        setError("Please enter your State of Origin.");
        return;
      }
      if (!lga.trim()) {
        setError("Please provide your Local Government Area (LGA).");
        return;
      }
      if (!town.trim()) {
        setError("Please provide your residential town or city.");
        return;
      }
    } else if (step === 3) {
      if (!religion.trim()) {
        setError("Please specify your religion.");
        return;
      }
    } else if (step === 4) {
      if (selectedSkills.length === 0) {
        setError("Please select at least one skill you are applying for.");
        return;
      }
      if (selectedSkills.length > 2) {
        setError("You can only select a maximum of two skills.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const toggleSkillSelection = (skillName: string) => {
    setError("");
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skillName));
    } else {
      if (selectedSkills.length >= 2) {
        setError("Admission allows selection of up to 2 skills only.");
        return;
      }
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const getAmountToPay = () => {
    return paymentOption === "full" ? 5500 : 2750;
  };

  const handlePaystackPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check for logged-in user session first
    const hasSession = localStorage.getItem("bato_user_session");
    if (!hasSession) {
      window.dispatchEvent(new Event("bato_require_auth"));
      return;
    }

    if (!commitmentSigned) {
      setError("Please check the commitment box to vow and abide by Jovibe Code rules.");
      return;
    }

    // Always show the Bank Transfer Modal
    const generatedRef = `BATO-JOV-${Math.floor(100000 + Math.random() * 900000)}`;
    setOpayRef(generatedRef);
    setPaying(true);
    setShowOPayModal(true);
  };

  const completeEnrollment = async (refId: string, proofUrl?: string) => {
    const admissionsDeskPhone = "2349043017213"; // 09043017213
    const payPlanText = paymentOption === "full" ? `₦5,500 Full Certificate Fee (via Bank Transfer)` : `₦2,750 Installment (1 of 2) (via Bank Transfer)`;
    
    const waText = encodeURIComponent(
      `*JOVIBE CODE ADMISSION APPLICATION (Sponsored by BATOSAM NIG.)*\n\n` +
      `• *Candidate Name:* ${fullName}\n` +
      `• *Phone Number:* ${phone}\n` +
      `• *Date of Birth:* ${dob}\n` +
      `• *Gender:* ${gender}\n` +
      `• *Nationality:* ${nationality}\n` +
      `• *Address:* ${houseAddress}\n` +
      `• *LGA & State:* ${lga} LGA, ${stateOfOrigin} State\n` +
      `• *Town:* ${town}\n` +
      `• *Religion:* ${religion}\n` +
      `• *Selected Skills:* ${selectedSkills.join(", ")}\n` +
      `• *Tuition Fee:* FREE (₦0)\n` +
      `• *Maintenance Fee rule:* ₦200 per class accepted\n` +
      `• *Paid Certificate Fee:* ${payPlanText}\n` +
      `• *Payment Reference:* ${refId}\n` +
      `• *Enrollment Status:* Awaiting Approval (via Bank Transfer)\n\n` +
      `Dear Admissions Desk, I have successfully applied and paid my certificate fee. Please confirm my enrollment.`
    );

    const jobId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;

    const newJob = {
      id: jobId,
      type: "ACADEMY_ENROLLMENT" as const,
      fullName,
      email: email.trim() || `${phone.replace(/\s+/g, "")}@jovibecode.com`,
      phone,
      course: selectedSkills.join(", "),
      status: "Awaiting Approval (₦5,500)", // Set status to Awaiting Approval for manual validation
      timestamp: new Date().toISOString(),
      whatsappMessage: `https://wa.me/${admissionsDeskPhone}?text=${waText}`,
      paymentRef: refId,
      totalCost: getAmountToPay(),

      // New form properties
      dob,
      gender,
      nationality,
      address: houseAddress,
      stateOfOrigin,
      lga,
      town,
      religion,
      skillsSelected: selectedSkills,
      commitmentSigned,
      paymentOption,
      proofUrl: proofUrl || null
    };

    try {
      await createOrderInSupabase(newJob);
      saveJob(newJob);

      // Trigger EmailJS notification alert to Admin
      await sendAdminAlert(
        `New student academy enrollment awaiting verification! ID: ${newJob.id}, Student: ${fullName}, Amount: NGN ${getAmountToPay().toLocaleString()}`
      );
    } catch (dbErr) {
      console.warn("Saving to database bypassed, saved locally:", dbErr);
      saveJob(newJob);
    }

    setSuccess(true);
    setPaying(false);

    window.open(`https://wa.me/${admissionsDeskPhone}?text=${waText}`, "_blank");
  };

  return (
    <section id="academy" className="bg-[#FAF9FB] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 py-16 relative overflow-hidden font-sans border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      
      {/* Luxurious Gold & Ambient Highlights */}
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[450px] w-[450px] rounded-full bg-zinc-200/20 dark:bg-zinc-900/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-3">
            <Sparkle className="h-3 w-3 animate-pulse text-[#D4AF37]" />
            Admissions Intake Live
          </div>
          <h2 className="font-sans text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Jovibe Code Tech Academy
          </h2>
          <p className="block font-mono text-[9px] font-bold text-amber-600 dark:text-[#D4AF37] tracking-widest uppercase mt-1">
            SPONSORED BY BATOSAM NIG. • DIGITAL EXCELLENCE DAILY
          </p>
          <p className="mt-4 font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Acquire premium world-class technical skills with FREE tuition. Complete our digital admission form step-by-step, pay for certification, and begin your cohort journey immediately.
          </p>

          {/* Web Share Action */}
          <div className="mt-5 flex items-center justify-center gap-3">
             <button
                onClick={handleShareAcademy}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-[#D4AF37]/10 hover:bg-zinc-200 dark:hover:bg-[#D4AF37]/20 text-zinc-800 dark:text-[#D4AF37] px-4 py-2 text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer border border-zinc-200 dark:border-[#D4AF37]/30"
                title="Share Academy Admission portal with your network"
             >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Academy</span>
             </button>
             {shareNotification && (
                <span className="text-xs text-amber-600 dark:text-yellow-400 font-bold animate-pulse">
                  {shareNotification}
                </span>
             )}
          </div>
        </div>

        {/* 🎓 JOVIBE CODE SKILL TRACKS */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h3 className="text-sm font-black uppercase text-amber-600 dark:text-yellow-500 tracking-wider">
              OUR 7 CORE TECHNICAL & PRACTICAL SKILLS
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold mt-1">
              Tuition is completely FREE. Secure certificate credentials for just ₦5,500.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {availableSkills.map((sk, index) => (
              <div 
                key={sk.id} 
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-[#D4AF37] dark:hover:border-[#D4AF37]/60 transition-all duration-300 p-5 flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wide text-zinc-900 dark:text-white mt-3 group-hover:text-[#D4AF37] transition-colors">
                    {sk.name}
                  </h4>
                  <div className="flex items-center gap-2.5 mt-1.5 text-[9px] font-mono font-bold text-amber-600 dark:text-[#D4AF37]">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">TUITION FREE</span>
                    <span className="text-zinc-400 dark:text-zinc-500">• Cert: ₦5,500</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium leading-relaxed">
                    {sk.desc}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedSkills.includes(sk.name)) {
                      if (selectedSkills.length >= 2) {
                        setError("Admission allows up to 2 skills only.");
                      } else {
                        setSelectedSkills([...selectedSkills, sk.name]);
                      }
                    }
                    setStep(4);
                    const el = document.getElementById("academy-apply-wizard");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full border border-zinc-200 dark:border-[#D4AF37]/30 bg-transparent hover:bg-[#D4AF37] hover:text-slate-950 text-zinc-700 dark:text-[#D4AF37] text-[9px] font-black uppercase tracking-wider py-2 rounded-lg transition-all mt-4 cursor-pointer text-center"
                >
                  Select Skill
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Countdown Timer Widget */}
        <div className="max-w-4xl mx-auto mb-12 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/30 p-6 backdrop-blur-md text-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-slate-950 font-mono text-[9px] font-black uppercase tracking-widest px-4 py-0.5 rounded-b-xl">
            Cohort Deadline Closing
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-2 mb-4">
            Next Lecture Batch Onboarding Countdown
          </p>

          <div className="flex justify-center items-center gap-4 sm:gap-8 text-zinc-900 dark:text-white">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#D4AF37]">
                {String(daysLeft).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mt-1">Days</span>
            </div>
            <span className="text-xl font-bold text-zinc-200 dark:text-zinc-800 -mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-zinc-800 dark:text-white">
                {String(hoursLeft).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mt-1">Hours</span>
            </div>
            <span className="text-xl font-bold text-zinc-200 dark:text-zinc-800 -mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-zinc-800 dark:text-white">
                {String(minutesLeft).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mt-1">Mins</span>
            </div>
            <span className="text-xl font-bold text-zinc-200 dark:text-zinc-800 -mt-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#D4AF37]">
                {String(secondsLeft).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mt-1">Secs</span>
            </div>
          </div>
        </div>

        {/* Step Wizard Indicator Bar */}
        <div className="max-w-4xl mx-auto mb-8" id="academy-apply-wizard">
          <div className="flex items-center justify-between bg-white/85 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 backdrop-blur-md overflow-x-auto whitespace-nowrap scrollbar-none shadow-sm">
            {[
              { num: 1, name: "Bio Data" },
              { num: 2, name: "Location" },
              { num: 3, name: "Religion" },
              { num: 4, name: "Skills" },
              { num: 5, name: "Commitment" }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center gap-2 shrink-0">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black border transition-all ${
                  step >= s.num
                    ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37]"
                    : "bg-zinc-100 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800"
                }`}>
                  {s.num}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider ${
                  step === s.num ? "text-zinc-900 dark:text-white font-black" : "text-zinc-400 dark:text-zinc-600 font-semibold"
                }`}>
                  {s.name}
                </span>
                {idx < 4 && <div className="h-[1px] w-4 bg-zinc-200 dark:bg-zinc-800" />}
              </div>
            ))}
          </div>
        </div>

        {/* Split Form & Curriculums */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start max-w-6xl mx-auto">
          
          {/* Left Column: Form & Step Views */}
          <div className="lg:col-span-7">
            
            {success ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 backdrop-blur-xl text-center space-y-5 shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-sans text-lg font-black uppercase text-zinc-900 dark:text-white">Application Received!</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Excellent! Your digital admission details have been captured and secure handshakes are initiated. Your enrollment status is set to <strong className="text-emerald-500 dark:text-emerald-400 uppercase">Enrolled</strong>.
                </p>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-sm mx-auto text-left space-y-2 text-[11px] font-semibold shadow-inner">
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1 text-zinc-500 dark:text-zinc-400">
                    <span>Candidate Name:</span>
                    <span className="text-zinc-900 dark:text-white font-extrabold">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1 text-zinc-500 dark:text-zinc-400">
                    <span>Applied Skill(s):</span>
                    <span className="text-amber-600 dark:text-[#D4AF37] font-extrabold">{selectedSkills.join(", ")}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1 text-zinc-500 dark:text-zinc-400">
                    <span>Certificate Fee:</span>
                    <span className="text-zinc-900 dark:text-white font-mono">{paymentOption === "full" ? "₦5,500 Paid (Full)" : "₦2,750 Paid (1st Installment)"}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Payment Ref ID:</span>
                    <span className="text-amber-600 dark:text-[#D4AF37] font-mono">{paymentReference}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
                  <a
                    href={`https://wa.me/2349043017213`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Join Student WhatsApp Group</span>
                  </a>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setStep(1);
                      setFullName("");
                      setPhone("");
                      setHouseAddress("");
                      setStateOfOrigin("");
                      setLga("");
                      setTown("");
                      setSelectedSkills([]);
                      setCommitmentSigned(false);
                    }}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 py-2.5 text-xs font-bold text-amber-600 dark:text-[#D4AF37] transition-all cursor-pointer"
                  >
                    Enroll New Student
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-6 sm:p-8 backdrop-blur-xl shadow-sm">
                
                {/* Step 1: Bio Data */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <span className="text-[9px] font-mono text-amber-600 dark:text-[#D4AF37] font-bold uppercase tracking-widest">Enrollment Desk</span>
                      <h3 className="text-base font-black uppercase text-zinc-900 dark:text-white mt-0.5">Step 1: Student Bio Profile</h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Please enter your statutory legal identification and date of birth details.</p>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                          Student Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3 h-4 w-4 text-zinc-400 dark:text-rose-300/40" />
                          <input
                            type="text"
                            required
                            placeholder="Surname First Name Othername"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-11 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3.5 sm:grid-cols-2">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                            Primary Phone Number (WhatsApp)
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-3 h-4 w-4 text-zinc-400 dark:text-rose-300/40" />
                            <input
                              type="tel"
                              required
                              placeholder="e.g. 09135580911"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-11 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            required
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3.5 sm:grid-cols-2">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                            Gender
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["Male", "Female"].map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g)}
                                className={`rounded-xl border py-2.5 text-xs font-bold transition-all cursor-pointer ${
                                  gender === g
                                    ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37]"
                                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                            Nationality
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Nigerian"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                          Helper Email Address (Optional)
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3 h-4 w-4 text-zinc-400 dark:text-rose-300/40" />
                          <input
                            type="email"
                            placeholder="student@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-11 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 border border-red-500/20 mt-3 text-red-500">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-400">{error}</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 py-3 text-xs font-black text-slate-950 transition-all cursor-pointer mt-4 border-0"
                    >
                      <span>Continue to Location</span>
                      <ArrowRight className="h-4 w-4 text-slate-950" />
                    </button>
                  </div>
                )}

                {/* Step 2: Location Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <span className="text-[9px] font-mono text-amber-600 dark:text-[#D4AF37] font-bold uppercase tracking-widest">Enrollment Desk</span>
                      <h3 className="text-base font-black uppercase text-zinc-900 dark:text-white mt-0.5">Step 2: Geographic Parameters</h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">We require physical residency parameters for student catalog placement.</p>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                          House Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3 h-4 w-4 text-zinc-400 dark:text-rose-300/40" />
                          <input
                            type="text"
                            required
                            placeholder="House number, Street, Area"
                            value={houseAddress}
                            onChange={(e) => setHouseAddress(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-11 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3.5 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                            State of Origin
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Lagos"
                            value={stateOfOrigin}
                            onChange={(e) => setStateOfOrigin(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                            Local Govt (LGA)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Badagry"
                            value={lga}
                            onChange={(e) => setLga(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                            Town
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Pure Water"
                            value={town}
                            onChange={(e) => setTown(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 border border-red-500/20 mt-3 text-red-500">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-400">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="w-1/3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-3 text-xs font-bold text-zinc-700 dark:text-[#D4AF37] hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer text-center"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-2/3 flex items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 py-3 text-xs font-black text-slate-950 transition-all cursor-pointer border-0"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4 text-slate-950" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Religion */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <span className="text-[9px] font-mono text-amber-600 dark:text-[#D4AF37] font-bold uppercase tracking-widest">Enrollment Desk</span>
                      <h3 className="text-base font-black uppercase text-zinc-900 dark:text-white mt-0.5">Step 3: Religious Affiliation</h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Required institutional demographics records.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider mb-1.5">
                        Religion
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Christianity", "Islam", "Traditional", "Others"].map((rel) => (
                          <button
                            key={rel}
                            type="button"
                            onClick={() => setReligion(rel)}
                            className={`rounded-xl border py-3 text-xs font-bold transition-all cursor-pointer ${
                              religion === rel
                                ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37]"
                                : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            }`}
                          >
                            {rel}
                          </button>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 border border-red-500/20 mt-3 text-red-500">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-400">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="w-1/3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-3 text-xs font-bold text-zinc-700 dark:text-[#D4AF37] hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer text-center"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-2/3 flex items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 py-3 text-xs font-black text-slate-950 transition-all cursor-pointer border-0"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4 text-slate-950" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Skill Selection Checklist */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <span className="text-[9px] font-mono text-amber-600 dark:text-[#D4AF37] font-bold uppercase tracking-widest">Enrollment Desk</span>
                      <h3 className="text-base font-black uppercase text-zinc-900 dark:text-white mt-0.5">Step 4: Skill Course Selection</h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Mark or tick <strong>one or two skills</strong> you wish to apply for during this cohort.</p>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
                      {availableSkills.map((sk) => {
                        const isChecked = selectedSkills.includes(sk.name);
                        return (
                          <div
                            key={sk.id}
                            onClick={() => toggleSkillSelection(sk.name)}
                            className={`rounded-xl border p-3 flex items-start gap-3 cursor-pointer transition-all ${
                              isChecked
                                ? "bg-amber-500/5 dark:bg-[#D4AF37]/5 border-amber-500 dark:border-[#D4AF37] text-zinc-900 dark:text-white"
                                : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-[#D4AF37]/30 text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="h-4 w-4 rounded border-zinc-300 dark:border-yellow-600/30 text-[#D4AF37] focus:ring-[#D4AF37] mt-0.5 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-extrabold uppercase text-zinc-900 dark:text-white">{sk.name}</p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{sk.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-amber-600 dark:text-[#D4AF37] font-mono font-bold bg-zinc-100 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span>Selected Count: {selectedSkills.length} / 2</span>
                      <span>Allowed Limit: Exactly 1 or 2 Skills</span>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 border border-red-500/20">
                        <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-400">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="w-1/3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-3 text-xs font-bold text-zinc-700 dark:text-[#D4AF37] hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer text-center"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-2/3 flex items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 py-3 text-xs font-black text-slate-950 transition-all cursor-pointer border-0"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4 text-slate-950" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Commitment & Fee Payment */}
                {step === 5 && (
                  <form onSubmit={handlePaystackPayment} className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <span className="text-[9px] font-mono text-amber-600 dark:text-[#D4AF37] font-bold uppercase tracking-widest">Enrollment Desk</span>
                      <h3 className="text-base font-black uppercase text-zinc-900 dark:text-white mt-0.5">Step 5: Commitment & Certificate</h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Vow to rules, read structural fees, and authorize payment to verify enrollment.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 text-[11px] font-semibold shadow-inner">
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5 text-zinc-500 dark:text-zinc-400">
                        <span>Applied Track:</span>
                        <span className="text-zinc-900 dark:text-white font-extrabold max-w-[200px] truncate">{selectedSkills.join(", ")}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5 text-zinc-500 dark:text-zinc-400">
                        <span>Tuition Fee:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono uppercase">FREE (₦0)</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5 text-zinc-500 dark:text-zinc-400">
                        <span>Maintenance Fee:</span>
                        <span className="text-zinc-900 dark:text-white font-extrabold font-mono">₦200 per class</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Certificate Fee:</span>
                        <span className="text-amber-600 dark:text-[#D4AF37] font-extrabold font-mono">₦5,500</span>
                      </div>
                    </div>

                    {/* Interactive 2 Times Payment Rule Options */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider">
                        Select Certificate Payment Option:
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setPaymentOption("full")}
                          className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                            paymentOption === "full"
                              ? "border-amber-500 dark:border-[#D4AF37] bg-amber-500/5 dark:bg-[#D4AF37]/5 text-zinc-900 dark:text-white"
                              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          }`}
                        >
                          <span className="block text-[9px] font-bold uppercase text-zinc-900 dark:text-white">Full Certificate Payment</span>
                          <span className="block text-xs font-black text-amber-600 dark:text-yellow-500 mt-1">₦5,500 NGN</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentOption("installment_1")}
                          className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                            paymentOption === "installment_1"
                              ? "border-amber-500 dark:border-[#D4AF37] bg-amber-500/5 dark:bg-[#D4AF37]/5 text-zinc-900 dark:text-white"
                              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          }`}
                        >
                          <span className="block text-[9px] font-bold uppercase text-amber-600 dark:text-[#D4AF37]">2 Times Payment Allowed</span>
                          <span className="block text-xs font-black text-amber-600 dark:text-yellow-500 mt-1">₦2,750 NGN (Part 1)</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-zinc-400 dark:text-rose-200/40 font-bold italic mt-1 leading-normal">
                        * Note: Installment rule lets you pay ₦2,750 twice (once at admission, and once before certificate collection).
                      </p>
                    </div>

                    {/* Core Vow Commitment Checklist */}
                    <div 
                      onClick={() => setCommitmentSigned(!commitmentSigned)}
                      className={`rounded-xl border p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                        commitmentSigned
                          ? "bg-amber-500/5 dark:bg-[#D4AF37]/5 border-amber-500 dark:border-[#D4AF37] text-zinc-900 dark:text-white"
                          : "bg-zinc-50 dark:bg-zinc-950 border-red-500/20 text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={commitmentSigned}
                        onChange={() => {}}
                        className="h-4.5 w-4.5 rounded border-zinc-300 dark:border-yellow-600/30 text-[#D4AF37] focus:ring-[#D4AF37] mt-0.5 shrink-0"
                      />
                      <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 leading-relaxed">
                        I vow to abide by the rules and regulations and pay for certification and maintenance fees to ensure the progress of the training.
                      </p>
                    </div>

                    {/* Payment Gateway selector */}
                    <div className="space-y-2 pt-1">
                      <label className="block text-[9px] font-bold text-zinc-500 dark:text-[#D4AF37] uppercase tracking-wider">
                        Select Payment Method:
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("paystack")}
                          className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                            paymentMethod === "paystack" ? "bg-[#D4AF37] text-slate-950 font-black shadow-sm" : "text-zinc-500 dark:text-rose-100/50 hover:text-zinc-900 dark:hover:text-white bg-transparent"
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span>Paystack Gateway</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("opay")}
                          className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                            paymentMethod === "opay" ? "bg-[#D4AF37] text-slate-950 font-black shadow-sm" : "text-zinc-500 dark:text-rose-100/50 hover:text-zinc-900 dark:hover:text-white bg-transparent"
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                          <span>OPay Transfer</span>
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 border border-red-500/20">
                        <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-400 leading-normal">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="w-1/3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent py-3.5 text-xs font-bold text-zinc-700 dark:text-[#D4AF37] hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer text-center"
                      >
                        Modify
                      </button>
                      
                      <button
                        type="submit"
                        disabled={paying}
                        className="w-2/3 flex items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 disabled:bg-slate-800 disabled:text-slate-500 py-3.5 text-xs font-black text-slate-950 transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 border-0"
                      >
                        {paying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 text-slate-950" />
                            <span>
                              {paymentMethod === "paystack" 
                                ? `Pay via Paystack (₦${getAmountToPay().toLocaleString()})`
                                : `Initiate OPay Transfer (₦${getAmountToPay().toLocaleString()})`
                              }
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

          </div>

          {/* Right Column: High Value Syllabus Details Accordion/Grid */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Curriculum Showcase */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-6 sm:p-8 backdrop-blur-md shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-[#D4AF37]" />
                  <h4 className="font-sans text-xs font-extrabold uppercase text-zinc-900 dark:text-white tracking-wider">Jovibe Syllabus Hub</h4>
                </div>
                
                {/* Visual Roadmap Toggle Tabs */}
                <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSyllabusTab("details")}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      syllabusTab === "details"
                        ? "bg-[#D4AF37] text-slate-950 font-black"
                        : "text-zinc-500 dark:text-rose-200/50 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyllabusTab("list")}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      syllabusTab === "list"
                        ? "bg-[#D4AF37] text-slate-950 font-black"
                        : "text-zinc-500 dark:text-rose-200/50 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    Quick list
                  </button>
                </div>
              </div>

              {syllabusTab === "details" ? (
                <div className="space-y-4">
                  <span className="text-[8px] font-mono font-bold text-amber-600 dark:text-[#D4AF37] uppercase tracking-widest block">Featured Curriculum Overview</span>
                  <div className="relative pl-5 space-y-6 border-l border-dashed border-zinc-300 dark:border-yellow-600/25">
                    
                    <div className="relative">
                      <span className="absolute -left-[24px] top-1 h-3.5 w-3.5 rounded-full bg-zinc-100 dark:bg-rose-950 border border-amber-500 dark:border-[#D4AF37] flex items-center justify-center text-[8px] font-black text-amber-600 dark:text-[#D4AF37]">
                        1
                      </span>
                      <h5 className="text-[11px] font-black uppercase text-zinc-900 dark:text-white">AI Prompt & Vibe Coding Labs</h5>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mt-1">
                        Formulate high-performance system instructions, master context window caching, write robust natural-language prompts, and deploy full applications.
                      </p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[24px] top-1 h-3.5 w-3.5 rounded-full bg-zinc-100 dark:bg-rose-950 border border-amber-500 dark:border-[#D4AF37] flex items-center justify-center text-[8px] font-black text-amber-600 dark:text-[#D4AF37]">
                        2
                      </span>
                      <h5 className="text-[11px] font-black uppercase text-zinc-900 dark:text-white">Advanced Computing & Graphic Suite</h5>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mt-1">
                        Build luxury interlocking shield vectors, master executive database spreadsheets, configure local filesystems, and prepare CMYK digital formats.
                      </p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[24px] top-1 h-3.5 w-3.5 rounded-full bg-zinc-100 dark:bg-rose-950 border border-amber-500 dark:border-[#D4AF37] flex items-center justify-center text-[8px] font-black text-amber-600 dark:text-[#D4AF37]">
                        3
                      </span>
                      <h5 className="text-[11px] font-black uppercase text-zinc-900 dark:text-white">CBT & Digital Exams Preparation</h5>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mt-1">
                        Acquire maximum proficiency in computerized test taking, analyze timed score vectors, and complete complex examinations.
                      </p>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <div className="pt-2 text-[11px] font-semibold flex justify-between items-start">
                    <span>1. AI Prompt Engineering</span>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold flex justify-between items-start">
                    <span>2. Vibe Coding</span>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold flex justify-between items-start">
                    <span>3. Graphic Design</span>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold flex justify-between items-start">
                    <span>4. CBT Practice</span>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold flex justify-between items-start">
                    <span>5. 3D Product Design</span>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold flex justify-between items-start">
                    <span>6. Coding/App Development</span>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                  </div>
                  <div className="pt-2 text-[11px] font-semibold flex justify-between items-start">
                    <span>7. Basic Computing</span>
                    <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                  </div>
                </div>
              )}

              {/* Maintenance Fee Disclaimer */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 text-[10px] font-medium leading-relaxed text-amber-600 dark:text-yellow-500/80">
                * Note: Tuition is FREE. Maintenance fee of ₦200 per class is required to ensure resource continuity. Official Certificate fee is ₦5,500.
              </div>
            </div>

            {/* Why Choose Jovibe Code sponsored by BATOSAM NIG. */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 relative overflow-hidden shadow-sm">
              <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-amber-500/5 dark:bg-[#D4AF37]/5 blur-xl pointer-events-none" />
              <div className="flex items-start gap-3">
                <Award className="h-4.5 w-4.5 text-amber-600 dark:text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <h5 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">Licensed Training Desk</h5>
                  <p className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-semibold mt-1">
                    Jovibe Code (Sponsored by BATOSAM NIG.) trains technical candidates under strict guidelines. Our graduates acquire authentic technical competence and accredited professional certifications.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {showOPayModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => {
                setShowOPayModal(false);
                setPaying(false);
                setProofFile(null);
                setProofError("");
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer text-sm font-bold bg-transparent border-0"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-zinc-900 border border-zinc-800 text-white">
                <span className="font-mono text-xl font-black text-[#D4AF37]">₦</span>
              </div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-sans">
                {uploadingProof ? "Uploading Proof..." : "Bato Sam Bank Transfer"}
              </h3>
              <p className="text-[10px] text-zinc-400 font-semibold max-w-xs mx-auto leading-normal">
                {uploadingProof 
                  ? "Transmitting payment voucher screenshot to secure cloud ledger. Please hold..."
                  : "Complete manual bank transfer of the specified amount and upload the screenshot proof below."
                }
              </p>
            </div>

            {uploadingProof ? (
              <div className="py-8 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
                <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 animate-pulse uppercase">
                  Uploading proof screenshot...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bank Account Ledger Details */}
                <div className="bg-zinc-900/60 rounded-[18px] p-4 border border-zinc-800/80 space-y-3 font-mono text-xs text-zinc-100">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                    <span className="text-zinc-500 font-medium">Bank Name</span>
                    <span className="font-extrabold text-zinc-300">OPay</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                    <span className="text-zinc-500 font-medium">Account Number</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("9033106381");
                      }}
                      className="font-mono font-extrabold text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-0"
                    >
                      <span>9033106381</span>
                      <span className="text-[9px] text-zinc-500 font-normal">(Copy)</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                    <span className="text-zinc-500 font-medium">Account Name</span>
                    <span className="font-extrabold text-zinc-300">Samuel Austine Uzor</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                    <span className="text-zinc-500 font-medium">Amount to Pay</span>
                    <span className="font-extrabold text-[#D4AF37] text-sm">
                      ₦{getAmountToPay().toLocaleString()} NGN
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium text-[10px]">Reference / Memo</span>
                    <span className="font-mono font-extrabold text-zinc-400">
                      {opayRef}
                    </span>
                  </div>
                </div>

                {/* Mandatory Payment Screenshot Uploader */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Upload Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="relative group rounded-[16px] border border-dashed border-zinc-800 hover:border-[#D4AF37]/40 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all p-4 text-center cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProofFile(e.target.files[0]);
                          setProofError("");
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="space-y-2">
                      <div className="mx-auto h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-[#D4AF37] transition-colors">
                        📷
                      </div>
                      <div className="text-xs text-zinc-300">
                        {proofFile ? (
                          <span className="font-bold text-[#D4AF37] truncate max-w-[200px] block mx-auto">
                            📎 {proofFile.name}
                          </span>
                        ) : (
                          <span>Tap here or drag to upload transfer alert / screenshot</span>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-500">Supports PNG, JPG, JPEG files</p>
                    </div>
                  </div>
                  {proofError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {proofError}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!proofFile) {
                        setProofError("Please select/upload a screenshot of your bank transfer receipt.");
                        return;
                      }
                      setUploadingProof(true);
                      setProofError("");
                      try {
                        const { url, error } = await uploadProofToSupabase(proofFile);
                        if (error || !url) {
                          setProofError("Server error uploading payment proof. Please try again.");
                          setUploadingProof(false);
                          return;
                        }
                        setUploadingProof(false);
                        setShowOPayModal(false);
                        await completeEnrollment(opayRef, url);
                        setProofFile(null);
                      } catch (err) {
                        console.error("Proof submission failure:", err);
                        setProofError("An unexpected error occurred during submission.");
                        setUploadingProof(false);
                      }
                    }}
                    className="w-full rounded-[16px] bg-[#D4AF37] hover:bg-[#D4AF37]/90 py-3.5 text-xs font-black text-slate-950 transition-all cursor-pointer uppercase tracking-wider text-center border-0"
                  >
                    Upload Proof & Complete Enrollment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOPayModal(false);
                      setPaying(false);
                      setProofFile(null);
                      setProofError("");
                    }}
                    className="w-full text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-400 transition-colors py-1 cursor-pointer bg-transparent border-0"
                  >
                    Cancel & Modify Form
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
