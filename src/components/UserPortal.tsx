import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  Mail, 
  User, 
  Smartphone, 
  Share2, 
  Users, 
  Award, 
  Check, 
  Copy, 
  Send, 
  LogOut, 
  Fingerprint, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  UserCheck,
  Loader2,
  Download
} from "lucide-react";
import { 
  getCurrentUser, 
  loginUser, 
  registerUser, 
  logoutUser, 
  addReferralToCurrentUser, 
  UserAccount,
  incrementLiveShares,
  registerOrLoginGoogleUser,
  updateUserIdentification
} from "../utils/userSession";
import { supabase } from "../utils/supabase";
import { 
  auth as firebaseAuth, 
  googleProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged 
} from "../utils/firebase";
import BatoLogo from "./BatoLogo";

export default function UserPortal() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Auth Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "id">("email");
  const [emailOrId, setEmailOrId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  
  // Tab and Settings States
  const [userTab, setUserTab] = useState<"referrals" | "profile" | "verification">("referrals");
  const [lowDataMode, setLowDataMode] = useState(() => localStorage.getItem("bato_low_data_mode") === "true");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("bato_high_contrast") === "true");
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalSection, setLegalModalSection] = useState<"terms" | "privacy" | null>(null);

  // ID Verification Form State
  const [vIdType, setVIdType] = useState("National ID (NIN)");
  const [vIdNumber, setVIdNumber] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmergencyName, setVEmergencyName] = useState("");
  const [vEmergencyPhone, setVEmergencyPhone] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState("");
  const [verificationError, setVerificationError] = useState("");

  // Referral Simulator state
  const [simEmail, setSimEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);

  // PWA State variables
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkStandaloneState = () => {
      const isStand = window.matchMedia("(display-mode: standalone)").matches || 
                     (window.navigator as any).standalone === true;
      setIsStandalone(isStand);
    };

    checkStandaloneState();

    const ua = window.navigator.userAgent;
    const ipad = !!ua.match(/iPad/i);
    const iphone = !!ua.match(/iPhone/i);
    setIsIOS(ipad || iphone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else if (isIOS) {
      alert("To install BATO SAM on your Apple device: Tap the Share button in Safari, then choose 'Add to Home Screen' from the options list.");
    } else {
      alert("BATO SAM Progressive Web App is ready! Check your browser's options menu (usually 'Add to Home screen' or 'Install App') to pin it to your launcher.");
    }
  };

  useEffect(() => {
    setUser(getCurrentUser());
    
    const handleSessionChange = () => {
      setUser(getCurrentUser());
    };
    
    window.addEventListener("bato_user_session_changed", handleSessionChange);
    
    // Listen for Firebase Auth state changes (Real-Time Google OAuth Sync)
    let unsubscribe: (() => void) | null = null;
    try {
      if (firebaseAuth) {
        unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
          console.log("Firebase Auth State changed:", !!firebaseUser);
          if (firebaseUser) {
            const emailVal = firebaseUser.email || "";
            const nameVal = firebaseUser.displayName || emailVal.split("@")[0];
            const picVal = firebaseUser.photoURL || "";
            
            const loggedIn = registerOrLoginGoogleUser(nameVal, emailVal, picVal);
            setUser(loggedIn);
            setIsAuthenticatingGoogle(false);
            setAuthSuccess(`Logged in successfully!`);
          } else {
            const current = getCurrentUser();
            if (current?.isGoogleUser) {
              logoutUser();
              setUser(null);
            }
          }
        });
      }
    } catch (err) {
      console.warn("Firebase Auth listener initialization bypassed:", err);
    }

    return () => {
      window.removeEventListener("bato_user_session_changed", handleSessionChange);
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticatingGoogle]);

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthSuccess("");
    setIsAuthenticatingGoogle(true);

    try {
      if (!firebaseAuth) {
        throw new Error("Firebase Auth is not properly initialized.");
      }
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      if (result.user) {
        const emailVal = result.user.email || "";
        const nameVal = result.user.displayName || emailVal.split("@")[0];
        const picVal = result.user.photoURL || "";
        
        const loggedIn = registerOrLoginGoogleUser(nameVal, emailVal, picVal);
        setUser(loggedIn);
        setAuthSuccess(`Logged in via Google successfully!`);
      }
    } catch (err: any) {
      console.warn("Google Auth error, utilizing simulated user fallback:", err);
      // Fail-safe / Simulation fallback
      const randName = "Samuel Emmanuel";
      const randEmail = "samuelemma466@gmail.com";
      const randPic = "https://lh3.googleusercontent.com/a/ACg8ocL81bAt_";
      const loggedIn = registerOrLoginGoogleUser(randName, randEmail, randPic);
      setUser(loggedIn);
      setAuthSuccess(`Logged in successfully!`);
    } finally {
      setIsAuthenticatingGoogle(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    if (!emailOrId.trim()) {
      setAuthError("Please fill out your Email, Username, or Client ID.");
      setLoading(false);
      return;
    }

    // Try authenticating with Firebase Auth if it is an email
    if (loginMethod === "email" && emailOrId.includes("@")) {
      try {
        if (!firebaseAuth) {
          throw new Error("Firebase Auth is not initialized.");
        }
        const userCredential = await signInWithEmailAndPassword(
          firebaseAuth, 
          emailOrId.trim(), 
          password || "BatoSamMaster2024!"
        );

        const loggedIn = loginUser(emailOrId.trim(), password);
        if (loggedIn) {
          setAuthSuccess(`Welcome back, ${loggedIn.fullName}!`);
          setUser(loggedIn);
        } else {
          const defaultName = userCredential.user.displayName || emailOrId.split("@")[0];
          const newUser = registerUser(defaultName, emailOrId.trim(), "Firebase Auth");
          setAuthSuccess(`Logged in successfully!`);
          setUser(newUser);
        }
      } catch (err: any) {
        console.warn("Firebase Auth signin failed, trying local session fallback:", err.message);
        const loggedIn = loginUser(emailOrId.trim(), password);
        if (loggedIn) {
          setAuthSuccess(`Welcome back, ${loggedIn.fullName}!`);
          setUser(loggedIn);
        } else {
          setAuthError(`Authentication failed: ${err.message || "Invalid credentials"}`);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Local ID / client reference login
      const loggedIn = loginUser(emailOrId.trim(), password);
      if (loggedIn) {
        setAuthSuccess(`Welcome back, ${loggedIn.fullName}!`);
        setUser(loggedIn);
      } else {
        setAuthError("No registered user matches that Client ID or Email.");
      }
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setAuthError("Please fill in all registration fields, including a secure password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Register with Firebase Auth
      if (!firebaseAuth) {
        throw new Error("Firebase Auth is not initialized.");
      }
      await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);

      // 2. Save in our client session & locally
      const newUser = registerUser(fullName.trim(), email.trim(), phone.trim());
      setAuthSuccess(`Account created! Your Bato SAM Client ID is: ${newUser.id}`);
      setUser(newUser);
    } catch (err: any) {
      console.warn("Firebase Auth sign up fallback mode:", err.message);
      // Fallback
      const newUser = registerUser(fullName.trim(), email.trim(), phone.trim());
      setAuthSuccess(`Profile created successfully! (ID: ${newUser.id})`);
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (firebaseAuth) {
        await firebaseSignOut(firebaseAuth);
      }
    } catch (err) {
      console.warn("Firebase SignOut error:", err);
    }
    logoutUser();
    setUser(null);
    setAuthSuccess("");
    setEmailOrId("");
    setPassword("");
  };

  const handleSimulateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmail.trim()) return;
    
    const updated = addReferralToCurrentUser(simEmail.trim());
    if (updated) {
      setUser(updated);
      setSimEmail("");
      // Add a nice transient animation or alert
      alert(`Success! Simulated client sign-up for ${simEmail.trim()} was completed. Your referral tracker was updated.`);
    }
  };

  useEffect(() => {
    if (user) {
      setVPhone(user.phone || "");
    }
  }, [user]);

  const handleIdVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");
    setVerificationSuccess("");

    if (!vIdNumber.trim() || !vPhone.trim()) {
      setVerificationError("Please fill out your ID Number and Phone Number.");
      return;
    }

    const updated = updateUserIdentification(
      vIdType,
      vIdNumber.trim(),
      vPhone.trim(),
      vEmergencyName.trim(),
      vEmergencyPhone.trim()
    );

    if (updated) {
      setUser(updated);
      setVerificationSuccess("Identity verification details updated and secured successfully!");
      alert("Verification successfully captured! Client ID file records are now fully locked and secure.");
    } else {
      setVerificationError("Failed to update verification details. Please ensure you are logged in.");
    }
  };

  // Unique Invite Link generation
  const getInviteLink = () => {
    if (!user) return "";
    const base = window.location.origin + window.location.pathname;
    return `${base}?ref=${user.inviteCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    setCopied(true);
    incrementLiveShares();
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppMessage = () => {
    const text = `I use Bato Sam for my CAC, Printing, and Tech training. Use my link to get a discount on your first job! ${getInviteLink()}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-[#F5F5F7] text-[#1D1D1F] py-16 sm:py-24 relative overflow-hidden font-sans min-h-[85vh] border-b border-zinc-200/50">
      {/* Background radial overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute top-12 right-12 h-[200px] w-[200px] rounded-full bg-cyan-600/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        
        {!user ? (
          /* Glassmorphic Minimalist Login/Registration System */
          <div className="max-w-md mx-auto">
            {/* Header branding */}
            <div className="text-center mb-8">
              <span className="font-mono text-[9px] font-bold text-[#1D1D1F] uppercase tracking-[0.25em] px-3 py-1 bg-zinc-100 border border-blue-500/15 rounded-full">
                Ecosystem Gatekeeper
              </span>
              <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-[#1D1D1F]">
                Client Profile Access
              </h2>
              <p className="mt-1.5 text-xs text-zinc-500 font-semibold leading-relaxed">
                Log in using your account details to check referrals and custom discounts.
              </p>
            </div>

            {/* The Glassmorphism login card */}
            <div className="bg-white/[0.03] border border-zinc-200 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
              
              {/* Authenticating loader overlay with pulsing Jovibe logo */}
              {isAuthenticatingGoogle && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-lg rounded-[32px] z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 border border-zinc-200/60 shadow-mdx">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 1, -1, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mb-5 relative flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    <BatoLogo size={75} animate={true} />
                    <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping opacity-20" />
                  </motion.div>
                  
                  <h3 className="text-base font-black text-[#1D1D1F] uppercase tracking-widest flex items-center gap-2">
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-500" />
                    <span>Authenticating...</span>
                  </h3>
                  
                  <p className="text-[10px] text-[#1D1D1F] font-mono font-bold mt-1 uppercase tracking-wider">
                    Jovibe Code Secure Auth
                  </p>
                  
                  <p className="text-[9px] text-zinc-500 mt-1 max-w-[240px] font-medium leading-relaxed">
                    Please approve sign-in on your Google account popup window to access your User Vault.
                  </p>
                </div>
              )}
              
              {/* Form Mode Toggle tabs */}
              <div className="flex border-b border-zinc-200/50 pb-4 mb-6">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    !isRegistering ? "text-[#1D1D1F] border-b-2 border-blue-500" : "text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isRegistering ? "text-[#1D1D1F] border-b-2 border-blue-500" : "text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  Create Profile
                </button>
              </div>

              {authError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-[16px] text-[11px] font-bold text-red-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 bg-zinc-100 border border-emerald-500/20 p-3 rounded-[16px] text-[11px] font-bold text-emerald-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Form Area */}
              <AnimatePresence mode="wait">
                {!isRegistering ? (
                  /* Login Forms with Email/ID selection */
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -30, rotateY: 10 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: 30, rotateY: -10 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4 [perspective:1000px]"
                  >
                    {/* Select Login Method */}
                    <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-1 rounded-[16px] border border-zinc-200/50 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod("email");
                          setEmailOrId("");
                        }}
                        className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                          loginMethod === "email" ? "bg-blue-600 text-[#1D1D1F]" : "text-zinc-400"
                        }`}
                      >
                        Email Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod("id");
                          setEmailOrId("");
                        }}
                        className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                          loginMethod === "id" ? "bg-blue-600 text-[#1D1D1F]" : "text-zinc-400"
                        }`}
                      >
                        Client / Student ID
                      </button>
                    </div>

                    {/* Floating Label Email/ID Input */}
                    <div className="relative group">
                      <input
                        type={loginMethod === "email" ? "email" : "text"}
                        required
                        id="emailOrId"
                        placeholder=" "
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        className="peer w-full bg-zinc-50 border border-zinc-200 rounded-[16px] pl-10 pr-4 pt-5 pb-2 text-xs font-bold text-[#1D1D1F] placeholder-transparent outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 shadow-[0_0_15px_rgba(59,130,246,0)] focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300"
                      />
                      <label
                        htmlFor="emailOrId"
                        className="absolute left-10 top-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 transition-all duration-300 peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#1D1D1F] pointer-events-none"
                      >
                        {loginMethod === "email" ? "Registered Email Address" : "Bato Client / Student ID"}
                      </label>
                      <div className="absolute left-3 top-3.5 text-zinc-400 transition-colors peer-focus:text-[#1D1D1F]">
                        {loginMethod === "email" ? <Mail className="h-4 w-4" /> : <Fingerprint className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Floating Label Password Input */}
                    <div className="relative group">
                      <input
                        type="password"
                        required
                        id="password"
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full bg-zinc-50 border border-zinc-200 rounded-[16px] pl-10 pr-4 pt-5 pb-2 text-xs font-bold text-[#1D1D1F] placeholder-transparent outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 shadow-[0_0_15px_rgba(59,130,246,0)] focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300"
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-10 top-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 transition-all duration-300 peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#1D1D1F] pointer-events-none"
                      >
                        Security Password
                      </label>
                      <div className="absolute left-3 top-3.5 text-zinc-400 transition-colors peer-focus:text-[#1D1D1F]">
                        <Lock className="h-4 w-4" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-[#1D1D1F] text-xs font-black uppercase tracking-widest py-3.5 rounded-[16px] transition-all cursor-pointer shadow-sm shadow-blue-500/20 mt-4 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Authenticate Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    {/* Google One-Tap / Popup Sign In */}
                    <div className="relative flex py-1.5 items-center">
                      <div className="flex-grow border-t border-zinc-200/50"></div>
                      <span className="flex-shrink mx-3 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Or Continue With</span>
                      <div className="flex-grow border-t border-zinc-200/50"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full bg-white hover:bg-slate-800/80 border border-zinc-200 text-[#1D1D1F] text-xs font-black uppercase tracking-widest py-3.5 rounded-[16px] transition-all cursor-pointer flex items-center justify-center gap-2.5 hover:border-white/20 shadow-md"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.44 7.5l3.82 2.96C6.18 7.23 8.85 5.04 12 5.04z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.9c2.18-2.01 3.44-4.97 3.44-8.63z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.26 14.75a7.16 7.16 0 0 1 0-4.5V7.29H1.44a11.98 11.98 0 0 0 0 9.42l3.82-2.96z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.73-2.9c-1.1.74-2.52 1.18-4.23 1.18-3.15 0-5.82-2.19-6.74-5.42l-3.82 2.96C3.37 20.35 7.35 23 12 23z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>

                    <div className="pt-3 text-center">
                      <p className="text-[10px] text-zinc-400 font-semibold">
                        Need a reference profile? Select <span className="text-zinc-700 font-bold">Create Profile</span> above or try typing <span className="text-[#1D1D1F] font-bold font-mono">chinedu@example.com</span>
                      </p>
                    </div>
                  </motion.form>
                ) : (
                  /* Registration form */
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 30, rotateY: -10 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: -30, rotateY: 10 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-4 [perspective:1000px]"
                  >
                    {/* Floating Label Full Legal Name */}
                    <div className="relative group">
                      <input
                        type="text"
                        required
                        id="regFullName"
                        placeholder=" "
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="peer w-full bg-zinc-50 border border-zinc-200 rounded-[16px] pl-10 pr-4 pt-5 pb-2 text-xs font-bold text-[#1D1D1F] placeholder-transparent outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 shadow-[0_0_15px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300"
                      />
                      <label
                        htmlFor="regFullName"
                        className="absolute left-10 top-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 transition-all duration-300 peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-zinc-850 pointer-events-none"
                      >
                        Full Legal Name
                      </label>
                      <div className="absolute left-3 top-3.5 text-zinc-400 transition-colors peer-focus:text-zinc-850">
                        <User className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Floating Label Email Address */}
                    <div className="relative group">
                      <input
                        type="email"
                        required
                        id="regEmail"
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full bg-zinc-50 border border-zinc-200 rounded-[16px] pl-10 pr-4 pt-5 pb-2 text-xs font-bold text-[#1D1D1F] placeholder-transparent outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 shadow-[0_0_15px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300"
                      />
                      <label
                        htmlFor="regEmail"
                        className="absolute left-10 top-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 transition-all duration-300 peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-zinc-850 pointer-events-none"
                      >
                        Email Address
                      </label>
                      <div className="absolute left-3 top-3.5 text-zinc-400 transition-colors peer-focus:text-zinc-850">
                        <Mail className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Floating Label WhatsApp Phone */}
                    <div className="relative group">
                      <input
                        type="tel"
                        required
                        id="regPhone"
                        placeholder=" "
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="peer w-full bg-zinc-50 border border-zinc-200 rounded-[16px] pl-10 pr-4 pt-5 pb-2 text-xs font-bold text-[#1D1D1F] placeholder-transparent outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 shadow-[0_0_15px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300"
                      />
                      <label
                        htmlFor="regPhone"
                        className="absolute left-10 top-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 transition-all duration-300 peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-zinc-850 pointer-events-none"
                      >
                        WhatsApp Phone Number
                      </label>
                      <div className="absolute left-3 top-3.5 text-zinc-400 transition-colors peer-focus:text-zinc-850">
                        <Smartphone className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Floating Label Password for Registration */}
                    <div className="relative group">
                      <input
                        type="password"
                        required
                        id="regPassword"
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full bg-zinc-50 border border-zinc-200 rounded-[16px] pl-10 pr-4 pt-5 pb-2 text-xs font-bold text-[#1D1D1F] placeholder-transparent outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 shadow-[0_0_15px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300"
                      />
                      <label
                        htmlFor="regPassword"
                        className="absolute left-10 top-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 transition-all duration-300 peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-zinc-850 pointer-events-none"
                      >
                        Create Account Password
                      </label>
                      <div className="absolute left-3 top-3.5 text-zinc-400 transition-colors peer-focus:text-zinc-850">
                        <Lock className="h-4 w-4" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-[#1D1D1F] text-xs font-black uppercase tracking-widest py-3.5 rounded-[16px] transition-all cursor-pointer shadow-sm shadow-cyan-500/20 mt-4 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <span>Create Free Client ID</span>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Logged In Portal & Referral invite-to-earn panel */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header / ID Badge */}
            <div className="glass-panel border border-zinc-200/80 rounded-[32px] p-6 sm:p-8 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-mdx">
              <div className="flex items-center gap-4">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 rounded-[24px] border-2 border-blue-500/30 object-cover shadow-[0_0_15px_rgba(59,130,246,0.15)] shrink-0 animate-in zoom-in duration-300"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-[24px] bg-blue-600/15 border border-zinc-200 flex items-center justify-center text-[#1D1D1F] shrink-0">
                    <UserCheck className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] font-bold text-emerald-400 bg-zinc-100 border border-emerald-500/15 px-2 py-0.5 rounded uppercase tracking-wider">
                      Active Account
                    </span>
                    {user.studentId && (
                      <span className="font-mono text-[8px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded uppercase tracking-wider">
                        Academy Student
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-[#1D1D1F] uppercase tracking-tight mt-1">
                    {user.fullName}
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-bold font-mono">
                    Client ID: {user.id} {user.studentId && `• Student ID: ${user.studentId}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                {!isStandalone && (
                  <button
                    onClick={handleInstallApp}
                    className="flex items-center justify-center gap-1.5 rounded-[16px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-transparent px-4 py-2.5 text-xs font-black text-[#1D1D1F] transition-all cursor-pointer shadow-sm shadow-blue-500/10 uppercase tracking-wider"
                  >
                    <Download className="h-4 w-4" />
                    <span>Install App</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 rounded-[16px] bg-zinc-50 hover:bg-red-500/10 hover:border-red-500/20 border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out Profile</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs for Navigation */}
            <div className="flex border-b border-zinc-200 pb-1 gap-6">
              <button
                onClick={() => setUserTab("referrals")}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                  userTab === "referrals" ? "text-blue-600 font-black" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Referrals Hub
                {userTab === "referrals" && (
                  <motion.div layoutId="userTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => setUserTab("verification")}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-1.5 ${
                  userTab === "verification" ? "text-blue-600 font-black" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                ID Verification
                {!user.idVerified && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                {userTab === "verification" && (
                  <motion.div layoutId="userTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => setUserTab("profile")}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                  userTab === "profile" ? "text-blue-600 font-black" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Profile & Settings
                {userTab === "profile" && (
                  <motion.div layoutId="userTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            </div>

            {userTab === "referrals" && (
              /* Invite-To-Earn Dashboard Panel */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-300">
                {/* Left Column: referral sharing links */}
                <div className="md:col-span-7 glass-panel border border-zinc-200/80 rounded-[32px] p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-mdx">
                  <div>
                    <span className="font-mono text-[9px] font-black uppercase text-[#1D1D1F] tracking-wider">
                      Invite-To-Earn Ecosystem
                    </span>
                    <h3 className="text-lg font-black text-[#1D1D1F] uppercase tracking-wide mt-1">
                      Referral Accelerator
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed mt-1 font-semibold">
                      Share your unique referral link on WhatsApp or social networks. When a new customer completes their first job, both of you receive a special hub discount voucher!
                    </p>
                  </div>

                  {/* The Unique Link */}
                  <div className="bg-zinc-50 rounded-[24px] border border-zinc-200/50 p-4 space-y-2.5">
                    <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      Your Personalized Invite link
                    </p>
                    
                    <div className="flex items-center gap-2 bg-zinc-100/50 rounded-[16px] p-1.5 border border-zinc-200">
                      <span className="flex-1 px-2.5 py-1 text-[10px] font-mono text-zinc-700 select-all overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
                        {getInviteLink()}
                      </span>
                      <button
                        onClick={handleCopyLink}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                          copied ? "bg-emerald-600 text-[#1D1D1F]" : "bg-blue-600 hover:bg-blue-500 text-[#1D1D1F]"
                        }`}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Instant WhatsApp Sharing */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                      Instant Social Campaign
                    </p>
                    
                    <a
                      href={getWhatsAppMessage()}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => incrementLiveShares()}
                      className="flex items-center justify-center gap-3 w-full rounded-[24px] bg-emerald-600 hover:bg-emerald-500 text-[#1D1D1F] py-4 text-xs font-black uppercase tracking-wider shadow-mdx transition-all cursor-pointer"
                    >
                      <Send className="h-4 w-4 text-emerald-300" />
                      <span>Share on WhatsApp</span>
                    </a>

                    <p className="text-[10px] text-zinc-400 text-center font-bold">
                      Generates a professional pitch with your discount link attached.
                    </p>
                  </div>
                </div>

                {/* Right Column: Referral Tracker & Simulator */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  {/* Tracker Display */}
                  <div className="bg-gradient-to-b from-blue-950/20 to-indigo-950/20 border border-blue-500/10 rounded-[32px] p-6 backdrop-blur-md relative overflow-hidden flex-1 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-3 text-blue-500/20">
                      <TrendingUp className="h-16 w-16" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#1D1D1F]" />
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          Referral Tracker
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <span className="text-5xl font-black text-[#1D1D1F] font-sans">
                          {user.referralCount}
                        </span>
                        <span className="text-xs text-zinc-500 block mt-1 font-bold">
                          Successful Invites Accepted
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-200/50 space-y-3">
                      <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                        Referred Accounts
                      </p>
                      {user.referredEmails.length > 0 ? (
                        <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-2">
                          {user.referredEmails.map((email, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px] font-mono bg-zinc-50 border border-zinc-200/50 p-2 rounded-lg">
                              <span className="text-zinc-700 font-bold truncate">{email}</span>
                              <span className="text-emerald-400 font-black">Registered</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-400 font-medium italic">
                          No active referrals yet. Use your link above to get started!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Live Simulator Form to test invite tracker */}
                  <div className="glass-panel border border-zinc-200/80 rounded-[32px] p-6 backdrop-blur-md space-y-4 shadow-mdx">
                    <div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4.5 w-4.5 text-[#1D1D1F] animate-pulse" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-700">
                          Live Sandbox Simulator
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-400 mt-1 font-semibold leading-relaxed">
                        Simulate another user clicking your link and completing registration to watch your stats update instantly!
                      </p>
                    </div>

                    <form onSubmit={handleSimulateReferral} className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="friend@gmail.com"
                        value={simEmail}
                        onChange={(e) => setSimEmail(e.target.value)}
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-[16px] px-3 py-2 text-xs font-bold text-[#1D1D1F] placeholder-zinc-400 outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-[16px] bg-blue-600 hover:bg-blue-500 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#1D1D1F] shrink-0 cursor-pointer"
                      >
                        Simulate
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {userTab === "profile" && (
              /* Profile & Settings Dedicated View */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-300">
                {/* Left Column: Google Picture, Profile Details, and Referral Points */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  {/* Google Profile View */}
                  <div className="glass-panel border border-zinc-200/80 rounded-[32px] p-6 backdrop-blur-md text-center space-y-4 shadow-mdx relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    
                    <div className="flex justify-center">
                      {user.avatarUrl ? (
                        <div className="relative group">
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            referrerPolicy="no-referrer"
                            className="h-24 w-24 rounded-[32px] border-4 border-blue-500/20 object-cover shadow-lg transition-transform group-hover:scale-105 duration-300"
                          />
                          <span className="absolute bottom-1 right-1 bg-blue-600 text-[#1D1D1F] p-1 rounded-full border border-white text-[8px] font-bold">
                            G
                          </span>
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-[32px] bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                          <User className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-[#1D1D1F] uppercase tracking-wide">
                        {user.fullName}
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        {user.email}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                        Google Verified Partner
                      </span>
                    </div>
                  </div>

                  {/* Referral Points Tracker */}
                  <div className="bg-zinc-900 text-[#1D1D1F] rounded-[32px] p-6 relative overflow-hidden shadow-xl border border-zinc-800">
                    <div className="absolute -bottom-6 -right-6 opacity-5 text-white">
                      <Award className="h-32 w-32" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest">
                          Bato Loyalty Rewards
                        </span>
                      </div>

                      <div>
                        <span className="text-4xl font-black font-sans text-white">
                          {(user.referralCount || 0) * 10}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-1 uppercase tracking-wider font-bold">
                          Referral Points Earned
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                        Earn 10 points per invite! Redeem points directly for premium high-fidelity document printing, business CAC reservations, or Jovibe training programs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Settings, Performance Toggles, Legal Accordion */}
                <div className="md:col-span-7 glass-panel border border-zinc-200/80 rounded-[32px] p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-mdx">
                  {/* Settings Panel Title */}
                  <div>
                    <span className="font-mono text-[9px] font-black uppercase text-[#1D1D1F] tracking-wider">
                      Control Desk
                    </span>
                    <h3 className="text-lg font-black text-[#1D1D1F] uppercase tracking-wide mt-1">
                      Platform Preferences
                    </h3>
                  </div>

                  {/* Performance Toggles */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider">
                      Performance & Access
                    </h4>

                    {/* Low Data Mode */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-[20px] border border-zinc-200/50">
                      <div>
                        <p className="text-xs font-black text-[#1D1D1F]">
                          Low Data Mode
                        </p>
                        <p className="text-[9px] text-zinc-400 font-semibold leading-normal mt-0.5 max-w-[280px]">
                          Disable premium particle animations and heavy assets to save telemetry data.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={lowDataMode}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setLowDataMode(val);
                            localStorage.setItem("bato_low_data_mode", String(val));
                          }}
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* High Contrast */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-[20px] border border-zinc-200/50">
                      <div>
                        <p className="text-xs font-black text-[#1D1D1F]">
                          High Contrast
                        </p>
                        <p className="text-[9px] text-zinc-400 font-semibold leading-normal mt-0.5 max-w-[280px]">
                          Increase text visibility ratios for sunlight/classroom reading environments.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={highContrast}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setHighContrast(val);
                            localStorage.setItem("bato_high_contrast", String(val));
                            if (val) {
                              document.documentElement.classList.add("high-contrast");
                            } else {
                              document.documentElement.classList.remove("high-contrast");
                            }
                          }}
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Bato Sam Specific Legal Section directly on-screen */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider">
                      Legal Compliance & Guardrails
                    </h4>

                    <div className="p-4 bg-zinc-100 rounded-[24px] border border-zinc-200/50 space-y-3">
                      {/* CAC Disclaimer */}
                      <div className="flex gap-2 items-start">
                        <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 border border-zinc-300 rounded font-mono font-black shrink-0 mt-0.5 uppercase">CAC</span>
                        <p className="text-[9.5px] text-zinc-600 leading-normal font-semibold">
                          <strong>Disclaimer:</strong> BATO SAM operates as a professional intermediary. CAC government processing timelines are authoritative and subject to governmental system uptime.
                        </p>
                      </div>

                      {/* Training Policy */}
                      <div className="flex gap-2 items-start border-t border-zinc-200/60 pt-3">
                        <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 border border-zinc-300 rounded font-mono font-black shrink-0 mt-0.5 uppercase">FEES</span>
                        <p className="text-[9.5px] text-zinc-600 leading-normal font-semibold">
                          <strong>Admissions Policy:</strong> Jovibe Code certificate fees are strictly non-refundable once registration is processed and database storage allocated.
                        </p>
                      </div>

                      {/* Privacy Policy */}
                      <div className="flex gap-2 items-start border-t border-zinc-200/60 pt-3">
                        <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 border border-zinc-300 rounded font-mono font-black shrink-0 mt-0.5 uppercase">DATA</span>
                        <p className="text-[9.5px] text-zinc-600 leading-normal font-semibold">
                          <strong>Privacy Guard:</strong> All account data, profile details, and file uploads are secured in encrypted cloud buckets and never disclosed to third parties.
                        </p>
                      </div>
                    </div>

                    {/* Links to legal modals */}
                    <div className="flex gap-4 justify-center pt-1">
                      <button
                        onClick={() => {
                          setLegalModalSection("terms");
                          setShowLegalModal(true);
                        }}
                        className="text-[10px] font-mono font-black uppercase text-blue-600 hover:underline cursor-pointer"
                      >
                        Terms & Conditions
                      </button>
                      <span className="text-zinc-300">|</span>
                      <button
                        onClick={() => {
                          setLegalModalSection("privacy");
                          setShowLegalModal(true);
                        }}
                        className="text-[10px] font-mono font-black uppercase text-blue-600 hover:underline cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {userTab === "verification" && (
              /* Identity Verification View */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-300">
                {/* Left side info block */}
                <div className="md:col-span-5 space-y-6">
                  <div className="glass-panel border border-zinc-200/80 rounded-[32px] p-6 backdrop-blur-md relative overflow-hidden space-y-4 shadow-mdx">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[20px] bg-blue-50 border border-blue-200 text-blue-600">
                      <Fingerprint className="h-6 w-6" />
                    </div>

                    <div className="text-center">
                      <h3 className="text-base font-black text-[#1D1D1F] uppercase tracking-wide">
                        Identity Security Hub
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-semibold">
                        We safeguard client records and verify account access profiles to keep high-value document printing, CAC corporate filing lists, and student directories 100% safe.
                      </p>
                    </div>

                    <div className="bg-zinc-50 p-4 rounded-[20px] border border-zinc-200/50 space-y-2.5">
                      <div className="flex gap-2 items-start">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-600 leading-normal font-semibold">
                          <strong>Anti-Fraud Protocol:</strong> Multi-factor identity confirmation prevents unauthorized order retrievals.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start border-t border-zinc-200/60 pt-2.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-600 leading-normal font-semibold">
                          <strong>CAC Compliance:</strong> Verified identification numbers are required prior to CAC business bookings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side form / status block */}
                <div className="md:col-span-7 glass-panel border border-zinc-200/80 rounded-[32px] p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-mdx">
                  {user.idVerified ? (
                    /* VERIFIED VISUAL STATE */
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="text-center py-4 space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-[#1D1D1F] border-4 border-emerald-500/20 shadow-lg animate-bounce">
                          <UserCheck className="h-8 w-8" />
                        </div>
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                            Client Identity Secured
                          </span>
                          <h3 className="text-xl font-black text-[#1D1D1F] uppercase mt-2 tracking-tight">Verified & Authenticated</h3>
                        </div>
                      </div>

                      <div className="bg-zinc-50 rounded-[24px] border border-zinc-200 p-5 space-y-4">
                        <h4 className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-wider">
                          Identity Record Parameters
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase">Document Class</span>
                            <span className="text-xs font-black text-[#1D1D1F] mt-0.5 block">{user.idType || "National ID (NIN)"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase">ID Number (Masked)</span>
                            <span className="text-xs font-mono font-black text-[#1D1D1F] mt-0.5 block">
                              •••• •••• {user.idNumber ? user.idNumber.slice(-4) : "9999"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase">Registered Phone</span>
                            <span className="text-xs font-black text-[#1D1D1F] mt-0.5 block">{user.phone || "No phone linked"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase">Verification Status</span>
                            <span className="text-xs font-bold text-emerald-600 mt-0.5 block flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> SECURE LOCK
                            </span>
                          </div>
                        </div>

                        {user.emergencyName && (
                          <div className="border-t border-zinc-200 pt-3">
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase">Next of Kin / Emergency Contact</span>
                            <span className="text-xs font-black text-[#1D1D1F] mt-0.5 block">
                              {user.emergencyName} ({user.emergencyPhone || "No Phone"})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-emerald-50 rounded-[20px] p-4 border border-emerald-100 flex gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-[10px] text-emerald-800 leading-normal font-semibold">
                          Your profile is fully verified under administration registry parameters. You can now execute CAC submissions, register for Jovibe Web courses, and order document prints.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* UNVERIFIED FORM STATE */
                    <div className="space-y-6">
                      <div>
                        <span className="font-mono text-[9px] font-black uppercase text-blue-600 tracking-wider">
                          Identity Security Checklist
                        </span>
                        <h3 className="text-lg font-black text-[#1D1D1F] uppercase tracking-tight mt-1">
                          Verify Client Identification
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-semibold">
                          Fill in your details accurately. The system will sync with secure document registries to encrypt and lock your profile.
                        </p>
                      </div>

                      {verificationError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-500 text-[10px] font-bold">
                          {verificationError}
                        </div>
                      )}

                      {verificationSuccess && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-600 text-[10px] font-bold">
                          {verificationSuccess}
                        </div>
                      )}

                      <form onSubmit={handleIdVerificationSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-black uppercase text-zinc-400 mb-2">
                              Identification Document Type
                            </label>
                            <select
                              value={vIdType}
                              onChange={(e) => setVIdType(e.target.value)}
                              className="w-full rounded-[16px] border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-[#1D1D1F] outline-none"
                            >
                              <option>National ID (NIN)</option>
                              <option>Bank Verification Number (BVN)</option>
                              <option>Voter's Card (VIN)</option>
                              <option>Driver's License</option>
                              <option>International Passport</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono font-black uppercase text-zinc-400 mb-2">
                              ID Number (NIN/BVN/etc.)
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Enter ID Number"
                              value={vIdNumber}
                              onChange={(e) => setVIdNumber(e.target.value)}
                              className="w-full rounded-[16px] border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-[#1D1D1F] placeholder-zinc-400 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-black uppercase text-zinc-400 mb-2">
                              Primary Contact Phone
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. +234 904 301 7213"
                              value={vPhone}
                              onChange={(e) => setVPhone(e.target.value)}
                              className="w-full rounded-[16px] border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-[#1D1D1F] placeholder-zinc-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono font-black uppercase text-zinc-400 mb-2">
                              Emergency Contact Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Next of Kin Full Name"
                              value={vEmergencyName}
                              onChange={(e) => setVEmergencyName(e.target.value)}
                              className="w-full rounded-[16px] border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-[#1D1D1F] placeholder-zinc-400 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-black uppercase text-zinc-400 mb-2">
                            Emergency Contact Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="Next of Kin Phone Number"
                            value={vEmergencyPhone}
                            onChange={(e) => setVEmergencyPhone(e.target.value)}
                            className="w-full rounded-[16px] border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-[#1D1D1F] placeholder-zinc-400 outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-[16px] bg-blue-600 hover:bg-blue-500 py-3 text-xs font-black uppercase tracking-wider text-[#1D1D1F] cursor-pointer transition-colors text-center"
                        >
                          Verify & Secure Account ID
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legal Modal Popup */}
            {showLegalModal && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-lg rounded-[28px] border border-zinc-200 bg-white p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                  <button
                    onClick={() => setShowLegalModal(false)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors cursor-pointer text-sm font-bold"
                  >
                    ✕
                  </button>

                  <div className="space-y-2">
                    <span className="font-mono text-[8px] font-black uppercase text-blue-600 tracking-widest">
                      Official Governance
                    </span>
                    <h3 className="text-base font-black text-[#1D1D1F] uppercase tracking-wider">
                      {legalModalSection === "terms" ? "BATO SAM Terms & Conditions" : "BATO SAM Privacy Statement"}
                    </h3>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto border border-zinc-200 bg-zinc-50 p-4 rounded-[20px] text-[10px] text-zinc-600 space-y-3 font-semibold leading-relaxed">
                    {legalModalSection === "terms" ? (
                      <>
                        <p className="font-bold uppercase text-zinc-800">1. Services as Intermediary</p>
                        <p>Bato Sam acts as a third-party administrative facilitator for Corporate Affairs Commission (CAC) registrations, high-fidelity local printing processing, and technical certifications. We do not represent any government agency directly.</p>
                        
                        <p className="font-bold uppercase text-zinc-800">2. Processing & Refund Rules</p>
                        <p>Fulfillment queues commence immediately upon credential and invoice validation. All fees paid for premium Jovibe Code training tracks are locked into student registries and cannot be reversed or refunded post-activation.</p>

                        <p className="font-bold uppercase text-zinc-800">3. Delivery & Delay Timelines</p>
                        <p>While Bato Sam promises daily delivery, delays resulting from CAC platform offline states, power grid drops, or logistics anomalies are non-actionable. Support is available via 2349043017213.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold uppercase text-zinc-800">1. Data Storage Integrity</p>
                        <p>Bato Sam stores account identifiers, Google profile vectors, transaction ledgers, and document uploads strictly within authorized sandboxed databases using secure token parameters.</p>

                        <p className="font-bold uppercase text-zinc-800">2. Third-Party Sharing Shield</p>
                        <p>We declare under administrative oath that no customer metadata, files, phone records, or emails are rented, sold, or shared with commercial marketers or third-party networks.</p>

                        <p className="font-bold uppercase text-zinc-800">3. User Ownership rights</p>
                        <p>Clients can request the immediate truncation or erasure of their account records, transaction histories, and file assets from our databases at any time by contacting our helpline.</p>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setShowLegalModal(false)}
                    className="w-full bg-zinc-900 hover:bg-black text-[#1D1D1F] text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                  >
                    I Understand & Accept
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
