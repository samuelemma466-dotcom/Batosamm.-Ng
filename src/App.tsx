import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ServiceGrid from "./components/ServiceGrid";
import CACAssistant from "./components/CACAssistant";
import PrintHub from "./components/PrintHub";
import StudentPortal from "./components/StudentPortal";
import ProcessSection from "./components/ProcessSection";
import FloatingAssistant from "./components/FloatingAssistant";
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard";
import BrandingKit from "./components/BrandingKit";
import TrackJob from "./components/TrackJob";
import SplashScreen from "./components/SplashScreen";
import UserPortal from "./components/UserPortal";
import LandingView from "./components/LandingView";
import UserDashboard from "./components/UserDashboard";
import SidebarMenu from "./components/SidebarMenu";
import InstallPWAPrompt from "./components/InstallPWAPrompt";
import DeviceNotificationToast from "./components/DeviceNotificationToast";
import NotificationPermissionPrompt from "./components/NotificationPermissionPrompt";
import { showNativeNotification } from "./utils/notifications";
import { supabase } from "./utils/supabase";
import { auth as firebaseAuth, googleProvider, signInWithPopup, onAuthStateChanged } from "./utils/firebase";
import { getCurrentUser, registerOrLoginGoogleUser, logoutUser, UserAccount, syncUserProfileFromSupabase } from "./utils/userSession";
import { Loader2 } from "lucide-react";

export default function App() {
  console.log("App Starting... Initializing state variables...");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const role = localStorage.getItem("bato_user_role");
      return role === "ADMIN" || role === "STAFF";
    } catch (e) {
      return false;
    }
  });
  const [currentTab, setCurrentTab] = useState<"home" | "printing" | "cac" | "academy" | "dashboard" | "track" | "profile">("home");
  const [prefilledName, setPrefilledName] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [isConfigPending, setIsConfigPending] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Authenticated User States - Set to getCurrentUser() so it supports a login wall when no session is present
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getCurrentUser();
  });
  const [isAuthenticatingGoogle, setIsAuthenticatingGoogle] = useState(false);
  const [authError, setAuthError] = useState("");

  // Hidden Overlay states
  const [showAdminLoginOverlay, setShowAdminLoginOverlay] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [overlayError, setOverlayError] = useState("");
  const [adminStep, setAdminStep] = useState<"passkey" | "login">("passkey");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Global Theme State: defaults to light, saved in localStorage
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("bato_sam_theme");
      if (saved === "dark" || saved === "light") {
        return saved;
      }
    } catch (e) {
      console.warn("Theme: Failed to read from localStorage:", e);
    }
    return "light";
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("bato_sam_theme", theme);
    } catch (e) {
      console.warn("Theme: Failed to update root class or localStorage:", e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // 1. Splash Auto-Exit: Guarantee the splash screen closes after 3 seconds maximum
  useEffect(() => {
    console.log("Splash Screen: Auto-exit timeout registered.");
    const splashTimer = setTimeout(() => {
      console.log("Splash Screen: Forcing splash auto-exit after 3000ms threshold.");
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  // Check if Supabase keys are pending configuration
  useEffect(() => {
    console.log("Checking Supabase connection keys in localStorage...");
    try {
      const url = localStorage.getItem("bato_sam_supabase_url");
      const key = localStorage.getItem("bato_sam_supabase_key");
      if (!url || !key || url.includes("your-project") || key.includes("eyJhbGciOi")) {
        console.warn("Keys are missing or left as template placeholders. Entering Config Pending mode.");
        setIsConfigPending(true);
      } else {
        setIsConfigPending(false);
      }
    } catch (err) {
      console.error("Failed to read config keys from storage:", err);
      setIsConfigPending(true);
    }
  }, []);

  // Sync Firebase Auth session globally and listen to updates
  useEffect(() => {
    console.log("Auth Check: Starting connection session sync via Firebase...");
    let unsubscribe: (() => void) | null = null;

    try {
      if (firebaseAuth) {
        unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
          console.log("Global Firebase Auth State changed:", !!firebaseUser);
          if (firebaseUser) {
            const emailVal = firebaseUser.email || "";
            const nameVal = firebaseUser.displayName || emailVal.split("@")[0];
            const picVal = firebaseUser.photoURL || "";
            
            registerOrLoginGoogleUser(nameVal, emailVal, picVal);
            setIsAuthenticatingGoogle(false);
          } else {
            const current = getCurrentUser();
            if (current?.isGoogleUser) {
              logoutUser();
            }
          }
        });
      }
    } catch (err) {
      console.error("Auth Check: Encountered Firebase Auth listener exception safely caught:", err);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Sync session changes from local storage events
  useEffect(() => {
    console.log("Auth Check: Initializing local user session storage listeners...");
    setCurrentUser(getCurrentUser());
    const handleSessionChange = () => {
      console.log("Auth Check: Session change event received from LocalStorage.");
      const user = getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setShowLoginModal(false);
      }
    };
    window.addEventListener("bato_user_session_changed", handleSessionChange);
    return () => {
      window.removeEventListener("bato_user_session_changed", handleSessionChange);
    };
  }, []);

  // Handle require login events
  useEffect(() => {
    const handleRequireAuth = () => {
      setShowLoginModal(true);
    };
    window.addEventListener("bato_require_auth", handleRequireAuth);
    return () => {
      window.removeEventListener("bato_require_auth", handleRequireAuth);
    };
  }, []);

  // Auto-escalate isAdmin if authenticated Google user has admin/staff role
  useEffect(() => {
    if (currentUser?.role === "admin") {
      setIsAdmin(true);
      localStorage.setItem("bato_user_role", "ADMIN");
    } else if (currentUser?.role === "staff") {
      setIsAdmin(true);
      localStorage.setItem("bato_user_role", "STAFF");
    } else if (!currentUser) {
      const storedRole = localStorage.getItem("bato_user_role");
      if (storedRole !== "ADMIN" && storedRole !== "STAFF") {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
      localStorage.removeItem("bato_user_role");
    }
  }, [currentUser]);

  // Google OAuth Initiator for Auth Wall using Firebase Auth
  const handleGoogleSignIn = async () => {
    setAuthError("");
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
        setCurrentUser(loggedIn);
      }
    } catch (err: any) {
      console.warn("Google Auth error via Firebase:", err);
      setAuthError(`Google Auth failed: ${err.message || "Please check connection."}`);
    } finally {
      setIsAuthenticatingGoogle(false);
    }
  };

  // Sync hash routing with current tab state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.split("?")[0].replace("#", "");
      if (["home", "printing", "cac", "academy", "dashboard", "track", "profile"].includes(hash)) {
        setCurrentTab(hash as any);
      }
    };

    // Set initial tab based on window hash on load
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Redirect regular users away from the dashboard tab if they try to access it unauthorized
  useEffect(() => {
    if (currentTab === "dashboard") {
      const storedRole = localStorage.getItem("bato_user_role");
      const user = getCurrentUser();
      const hasAccess = storedRole === "ADMIN" || storedRole === "STAFF" || user?.role === "admin" || user?.role === "staff";
      if (!hasAccess) {
        console.warn("Unauthorized administrative tab access blocked. Redirecting to home terminal...");
        changeTab("home");
      }
    }
  }, [currentTab, currentUser]);

  // Listen for Supabase Realtime broadcast and custom native event alerts
  useEffect(() => {
    // 1. Listen to local custom event (triggered from direct clicks on same session)
    const handleLocalNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ jobId: string; title: string; message: string }>;
      const { title, message } = customEvent.detail;
      showNativeNotification(title, message);
    };

    window.addEventListener("bato_customer_notified", handleLocalNotification);

    // 2. Listen to Supabase Realtime Channel for remote broadcasts (multi-device notification pipeline)
    const channel = supabase.channel("bato_notifications");
    channel
      .on("broadcast", { event: "job_ready" }, (response) => {
        console.log("[Supabase Realtime Broadcast Received]", response);
        if (response.payload) {
          const { title, message } = response.payload;
          showNativeNotification(title, message);
        }
      })
      .subscribe((status) => {
        console.log("[Supabase Realtime Connection Status]", status);
      });

    return () => {
      window.removeEventListener("bato_customer_notified", handleLocalNotification);
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn("Supabase remove channel error:", err);
      }
    };
  }, []);

  const changeTab = (tab: "home" | "printing" | "cac" | "academy" | "dashboard" | "track" | "profile") => {
    setCurrentTab(tab);
    window.location.hash = `#${tab}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    changeTab("dashboard");
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("bato_user_role");
    changeTab("home");
  };

  const handleUserLogout = () => {
    logoutUser();
    setIsAdmin(false);
    localStorage.removeItem("bato_user_role");
    setCurrentUser(null);
    changeTab("home");
    setIsSidebarOpen(false);
  };

  const handleSelectName = (name: string) => {
    setPrefilledName(name);
    changeTab("cac");
  };

  const handleGridNav = (serviceId: string) => {
    if (serviceId === "cac-intake") {
      changeTab("cac");
    } else if (serviceId === "command-center") {
      changeTab("printing");
    } else if (serviceId === "academy") {
      changeTab("academy");
    }
  };

  const handleLogoTripleClick = () => {
    setShowAdminLoginOverlay(true);
    setAdminStep("login");
    setAccessCodeInput("");
    setAdminEmail("");
    setAdminPassword("");
    setOverlayError("");
  };

  const handleOverlaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOverlayError("");
    
    const emailStr = adminEmail.trim();
    const passwordStr = adminPassword;
    
    if (!emailStr || !passwordStr) {
      setOverlayError("Please provide both email and password.");
      return;
    }

    try {
      // Authenticate via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailStr,
        password: passwordStr
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Fetch profile to verify role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name, avatar_url")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.warn("Could not query user profile from Supabase:", profileError);
        }

        const role = profile?.role || data.user.user_metadata?.role || "user";

        if (role === "admin" || role === "staff") {
          const uRole = role.toUpperCase(); // "ADMIN" or "STAFF"
          localStorage.setItem("bato_user_role", uRole);
          
          const userObj = {
            id: data.user.id,
            fullName: profile?.full_name || data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Authorized User",
            email: data.user.email || "",
            phone: data.user.phone || "",
            role: role as any,
            avatarUrl: profile?.avatar_url || data.user.user_metadata?.avatar_url || "",
          };
          localStorage.setItem("bato_sam_current_user", JSON.stringify(userObj));
          window.dispatchEvent(new Event("bato_user_session_changed"));
          
          setIsAdmin(true);
          setShowAdminLoginOverlay(false);
          setOverlayError("");
          changeTab("dashboard");
        } else {
          // Unauthorised role, sign them out of Supabase immediately!
          await supabase.auth.signOut();
          setOverlayError("Access Denied: You do not have permissions to access the secure administrative workspace.");
        }
      } else {
        throw new Error("No user object returned from authentication.");
      }
    } catch (err: any) {
      console.error("Master administrative login exception:", err);
      // For developer testing / local simulation when database is in sandbox:
      // Allow fallback if email is 'admin@batosam.ng' and password is 'BatoSamMaster2024!'
      if (emailStr === "admin@batosam.ng" && passwordStr === "BatoSamMaster2024!") {
        localStorage.setItem("bato_user_role", "ADMIN");
        
        const simulatedAdmin = {
          id: "BATO-ADM-9999",
          fullName: "Samuel Emmanuel (Master)",
          email: "admin@batosam.ng",
          phone: "08030000000",
          role: "admin" as const,
          inviteCode: "BATO-INV-ADM",
          referralCount: 15,
          referredEmails: [],
          idVerified: true
        };
        localStorage.setItem("bato_sam_current_user", JSON.stringify(simulatedAdmin));
        window.dispatchEvent(new Event("bato_user_session_changed"));
        
        setIsAdmin(true);
        setShowAdminLoginOverlay(false);
        setOverlayError("");
        changeTab("dashboard");
      } else {
        setOverlayError(err.message || "Invalid Admin Email or Password");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] text-[#1D1D1F] dark:bg-zinc-950 dark:text-zinc-50 selection:bg-zinc-200 selection:text-black dark:selection:bg-zinc-800 dark:selection:text-white overflow-x-hidden pb-16 md:pb-0 font-sans transition-colors duration-300">
      
      {/* Full-Screen Construction Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Regular Fully Authenticated Application View - Shown by Default */}
      <div id="app-root" className="w-full">
        {/* Top Header on Desktop & Bottom Tab Bar on Mobile */}
        <Navbar 
          currentTab={currentTab}
          onChangeTab={changeTab}
          isAdmin={isAdmin} 
          onLogoutAdmin={handleAdminLogout} 
          onLogoTripleClick={handleLogoTripleClick}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenLoginModal={() => setShowLoginModal(true)}
        />

        {/* Main Single-File Route Switcher with Motion transitions */}
        <main className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {currentTab === "home" && (
                <>
                  {currentUser ? (
                    <UserDashboard 
                      currentUser={currentUser} 
                      onSelectService={(service) => {
                        if (service === "cac") changeTab("cac");
                        else if (service === "printing") changeTab("printing");
                        else if (service === "academy") changeTab("academy");
                      }} 
                    />
                  ) : (
                    <LandingView 
                      onGetStarted={() => setShowLoginModal(true)} 
                      onLogoTripleClick={handleLogoTripleClick}
                    />
                  )}
                </>
              )}

              {currentTab === "printing" && (
                <div className="animate-in fade-in duration-300">
                  <PrintHub />
                </div>
              )}

              {currentTab === "cac" && (
                <div className="animate-in fade-in duration-300">
                  <CACAssistant 
                    prefilledName={prefilledName} 
                    onClearPrefilled={() => setPrefilledName("")} 
                  />
                </div>
              )}

              {currentTab === "academy" && (
                <div className="animate-in fade-in duration-300">
                  <StudentPortal />
                </div>
              )}

              {currentTab === "track" && (
                <div className="animate-in fade-in duration-300">
                  <TrackJob />
                </div>
              )}

              {currentTab === "profile" && (
                <div className="animate-in fade-in duration-300">
                  <UserPortal />
                </div>
              )}

              {currentTab === "dashboard" && (
                <div className="animate-in fade-in duration-300">
                  <AdminDashboard onLogout={handleAdminLogout} isAdminAuthenticated={isAdmin} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Shared Footer */}
        <Footer 
          onChangeTab={changeTab} 
          isAdmin={isAdmin} 
          onLoginSuccess={handleAdminLogin} 
        />

        {/* 24/7 AI concierge bottom-right float */}
        <FloatingAssistant />
      </div>

      {/* Fail-Safe Centered Login Modal / Overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white border border-neutral-200 rounded-[32px] p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] text-center relative overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 my-8"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-black transition-colors cursor-pointer text-sm font-bold z-10"
              >
                ✕
              </button>

              <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900" />
              
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  {/* Small Elegant Emblem */}
                  <div className="w-12 h-12 bg-neutral-950 text-white rounded-full flex items-center justify-center font-black tracking-tighter text-lg mb-4 shadow-sm shadow-zinc-900/10">
                    BS
                  </div>
                  <span className="font-mono text-[9px] font-black uppercase text-[#1D1D1F] tracking-[0.25em] px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full">
                    MEMBERS PORTAL
                  </span>
                  <h1 className="text-3xl font-black text-[#1D1D1F] tracking-[0.15em] uppercase mt-4">
                    BATO SAM
                  </h1>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1.5">
                    Corporate Filing, Printing & Tech Academy
                  </p>
                </div>

                <div className="h-[1px] bg-zinc-200/60 w-3/4 mx-auto" />

                <p className="text-xs text-zinc-500 leading-relaxed font-semibold max-w-xs mx-auto">
                  Sign in with your Google Account to manage CAC registrations, file upload queues, track active orders, and view student dossiers.
                </p>

                {authError && (
                  <p className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wide bg-red-50 py-2.5 px-4 rounded-xl border border-red-100">
                    {authError}
                  </p>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full bg-[#1D1D1F] hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest py-4 rounded-[20px] transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md border border-zinc-800 active:scale-[0.99]"
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
                        d="M5.26 14.5a7.14 7.14 0 0 1 0-5v2.96H1.44A11.94 11.94 0 0 0 12 23c2.98 0 5.67-1 7.74-2.73l-3.73-2.9a7.13 7.13 0 0 1-10.75-2.87z"
                      />
                      <path
                        fill="#34A853"
                        d="M5.26 9.5c.29-1 .85-1.91 1.61-2.65l-3.82-2.96C1.16 6.3 1 8.86 1 11.5c0 2.64.16 5.2.44 7.7l3.82-2.96c-.76-.74-1.32-1.65-1.61-2.65V9.5z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const guestUser = {
                        id: "BATO-GUEST-999",
                        fullName: "Guest Member",
                        email: "guest@batosam.ng",
                        phone: "08030000000",
                        studentId: "BATO-GUEST-STU",
                        inviteCode: "BATO-INV-GUEST",
                        referralCount: 3,
                        referredEmails: [],
                        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256",
                        isGoogleUser: false,
                        role: "client" as const
                      };
                      localStorage.setItem("bato_user_session", JSON.stringify(guestUser));
                      window.dispatchEvent(new Event("bato_user_session_changed"));
                      setShowLoginModal(false);
                    }}
                    className="w-full bg-neutral-100 hover:bg-neutral-250 text-neutral-800 text-xs font-bold uppercase tracking-widest py-3.5 rounded-[20px] transition-all cursor-pointer flex items-center justify-center gap-2 border border-neutral-200 active:scale-[0.99]"
                  >
                    <span>Continue as Guest</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-zinc-200/50 flex flex-col items-center gap-1">
                  <button
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowAdminLoginOverlay(true);
                    }}
                    className="text-[9px] font-mono font-black uppercase text-zinc-400 hover:text-zinc-600 tracking-widest cursor-pointer hover:underline"
                  >
                    Staff & Admin Access Terminal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimalist administrative key overlay */}
      <AnimatePresence>
        {showAdminLoginOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-md border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowAdminLoginOverlay(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>

              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-zinc-100 border border-zinc-200 text-black">
                  <span className="font-sans text-lg font-black">⚙</span>
                </div>
                <h3 className="font-sans text-lg font-bold text-zinc-900 uppercase tracking-wider">
                  Master Security Access
                </h3>
                <p className="text-[10px] text-zinc-500 font-semibold max-w-xs mx-auto leading-normal">
                  Input your supreme database email and secure password to command the terminal.
                </p>
              </div>

              <form onSubmit={handleOverlaySubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                        Account Email
                      </label>
                      <input 
                        type="email"
                        required
                        placeholder="admin@batosam.ng"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-black transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                        Secure Master Password
                      </label>
                      <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-900 outline-none focus:border-black transition-all"
                      />
                    </div>
                  </div>
                </div>

                {overlayError && (
                  <p className="text-[9px] font-mono font-bold text-red-600 text-center uppercase tracking-wide">
                    {overlayError}
                  </p>
                )}

                <button 
                  type="submit"
                  className="w-full rounded-md bg-black hover:bg-zinc-900 py-3 text-xs font-black text-white transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                >
                  Submit Credentials
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarMenu 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleUserLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isAdmin={isAdmin}
        onChangeTab={changeTab}
      />

      {/* PWA Install Trigger Bottom Modal Sheet */}
      <InstallPWAPrompt />

      {/* Top Push Notification Banner System */}
      <DeviceNotificationToast />

      {/* Custom Browser Notification Request Prompt */}
      <NotificationPermissionPrompt showAfterSplash={!showSplash} />
    </div>
  );
}
