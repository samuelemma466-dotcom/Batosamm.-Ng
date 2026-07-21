// BATO SAM. NG - High-End Master Production System Core
// Hard-injected, auto-provisioned configuration architecture.

export const BATO_SUPABASE_URL = "https://hmxipypodquyodgwngjt.supabase.co";
export const BATO_SUPABASE_KEY = "sb_publishable_zWeQHBetKMtBcy3ZMEY_Xg_w4jujMFG";

export const BATO_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCoJYXzyyE6lTWS3gy1nvZPjsXo9Y87ipI",
  authDomain: "batosamdg.firebaseapp.com",
  projectId: "batosamdg",
  storageBucket: "batosamdg.firebasestorage.app",
  messagingSenderId: "12640642475",
  appId: "1:12640642475:web:92bc56c23543df3ad21eee",
  measurementId: "G-SWY0V4WXVC"
};

// Default high-performance Gemini credentials
export const BATO_GEMINI_KEY = "AIzaSyCoJYXzyyE6lTWS3gy1nvZPjsXo9Y87ipI";

export interface BatoCorePayload {
  supabaseUrl: string;
  supabaseKey: string;
  firebaseConfig: typeof BATO_FIREBASE_CONFIG;
  geminiKey: string;
  initializedAt: string;
}

// Auto-provisioning routine on module load
export function initBatoCore() {
  if (typeof window === "undefined") return null;

  let existing = localStorage.getItem("_BATO_CORE_");
  if (!existing) {
    const payload: BatoCorePayload = {
      supabaseUrl: BATO_SUPABASE_URL,
      supabaseKey: BATO_SUPABASE_KEY,
      firebaseConfig: BATO_FIREBASE_CONFIG,
      geminiKey: BATO_GEMINI_KEY,
      initializedAt: new Date().toISOString()
    };
    localStorage.setItem("_BATO_CORE_", JSON.stringify(payload));
    
    // Seed standard localStorage parameters to ensure zero-setup compatibility for legacy modules
    localStorage.setItem("bato_gemini_api_key", BATO_GEMINI_KEY);
    localStorage.setItem("bato_gemini_model", "gemini-2.5-flash");
    localStorage.setItem("bato_sam_paystack_public_key", "pk_live_bato_sam_digital_hub_production");
    
    console.log("⚙️ [Bato Core] Hardcoded engine parameters auto-provisioned successfully.");
    return payload;
  }

  try {
    return JSON.parse(existing) as BatoCorePayload;
  } catch (e) {
    console.warn("Failed to parse existing core, re-initializing defaults:", e);
    return null;
  }
}

// Retrieve config parameters reactively
export function getCoreConfig(): BatoCorePayload {
  const local = typeof window !== "undefined" ? localStorage.getItem("_BATO_CORE_") : null;
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  return {
    supabaseUrl: BATO_SUPABASE_URL,
    supabaseKey: BATO_SUPABASE_KEY,
    firebaseConfig: BATO_FIREBASE_CONFIG,
    geminiKey: BATO_GEMINI_KEY,
    initializedAt: new Date().toISOString()
  };
}
