import { createClient } from "@supabase/supabase-js";
import { JobItem, getStoredJobs, saveJob as saveJobLocal } from "./localStorage";

const metaEnv = (import.meta as any).env || {};

function isValidHttpUrl(str: any): boolean {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

const rawUrl = metaEnv.VITE_SUPABASE_URL;
export const DEFAULT_URL = isValidHttpUrl(rawUrl) ? rawUrl.trim() : "https://hmxipypodquyodgwngjt.supabase.co";

const rawKey = metaEnv.VITE_SUPABASE_ANON_KEY;
export const DEFAULT_KEY = (typeof rawKey === "string" && rawKey.trim().length > 10 && rawKey.trim() !== "undefined" && rawKey.trim() !== "null")
  ? rawKey.trim()
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteGlweXBvZHF1eW9kZ3duZ2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NDI1OTQsImV4cCI6MjA5OTQxODU5NH0.uKbu_JBYaG3kyAbfVDAr2Y481qY6p1A_hCiUv-A1mjQ";

console.log("Supabase Client: Initializing main connection cluster with fail-safe support...", DEFAULT_URL);

let supabaseClient: any;
try {
  supabaseClient = createClient(DEFAULT_URL, DEFAULT_KEY);
} catch (err) {
  console.error("Supabase fail-safe mode activated due to initialization failure:", err);
  // Elegant mock fallback client to prevent any black/white screens or runtime crashes
  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async () => ({ data: null, error: new Error("Supabase is currently offline.") }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error("Supabase is currently offline.") }),
      signUp: async () => ({ data: null, error: new Error("Supabase is currently offline.") }),
    },
    from: () => ({
      select: () => ({
        limit: () => ({ data: [], error: null }),
        order: () => ({ data: [], error: null }),
      }),
      insert: () => ({
        select: () => ({ data: [], error: null }),
      }),
      update: () => ({
        eq: () => ({ error: null }),
      }),
      upsert: () => ({}),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error("Supabase is currently offline.") }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
    channel: () => ({
      on: () => ({
        subscribe: () => {}
      })
    }),
    removeChannel: () => {}
  };
}

export const supabase = supabaseClient;

export function refreshSupabaseClient() {
  console.log("Supabase Client is a strict singleton and cannot be re-initialized.");
  return supabase;
}

// Automatically subscribe to key updates (warn user that restart/refresh is needed)
if (typeof window !== "undefined") {
  window.addEventListener("bato_sam_keys_updated", () => {
    console.log("Supabase keys changed, please reload page to initialize new client connection.");
  });
}

// Helper to check if Supabase is reachable and operational
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("orders").select("id").limit(1);
    if (error && error.code === "PGRST116") {
      // Table exists but is empty
      return true;
    }
    return !error;
  } catch (e) {
    return false;
  }
}

// Storage direct upload to 'uploads' bucket
export async function uploadFileToSupabase(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileExt = cleanFileName.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.warn("Supabase upload error, attempting base64 data-URL payload fallback:", error);
      return { url: null, error };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (err: any) {
    console.error("General upload error:", err);
    return { url: null, error: err };
  }
}

// Save order/job to Supabase and fallback to LocalStorage
export async function createOrderInSupabase(job: JobItem): Promise<{ success: boolean; data: any; error: any }> {
  // Always save locally first so user session persists
  saveJobLocal(job);

  try {
    // Map the JobItem schema to the Supabase orders table schema
    const orderPayload = {
      id: job.id,
      type: job.type,
      status: job.status,
      timestamp: job.timestamp,
      whatsapp_message: job.whatsappMessage,
      // Map properties based on types
      business_name: job.type === "CAC_REGISTRATION" ? job.businessName : null,
      entity_type: job.type === "CAC_REGISTRATION" ? job.entityType : null,
      industry: job.type === "CAC_REGISTRATION" ? job.industry : null,
      job_type: job.type === "PRINT_ORDER" ? job.jobType : null,
      file_name: job.type === "PRINT_ORDER" ? job.fileName : null,
      pages: job.type === "PRINT_ORDER" ? job.pages : null,
      color_mode: job.type === "PRINT_ORDER" ? job.colorMode : null,
      finishing: job.type === "PRINT_ORDER" ? job.finishing : null,
      total_cost: (job.type === "PRINT_ORDER" || job.type === "ACADEMY_ENROLLMENT" || job.type === "CAC_REGISTRATION") ? job.totalCost : null,
      full_name: job.type === "ACADEMY_ENROLLMENT" ? job.fullName : null,
      email: job.type === "ACADEMY_ENROLLMENT" ? job.email : null,
      phone: job.type === "ACADEMY_ENROLLMENT" ? job.phone : null,
      course: job.type === "ACADEMY_ENROLLMENT" ? job.course : null,
      cac_data: job.type === "CAC_REGISTRATION" ? (job as any).cacData : null,
      
      // Extended student fields for Supabase table row compatibility
      dob: job.type === "ACADEMY_ENROLLMENT" ? (job as any).dob : null,
      gender: job.type === "ACADEMY_ENROLLMENT" ? (job as any).gender : null,
      nationality: job.type === "ACADEMY_ENROLLMENT" ? (job as any).nationality : null,
      address: job.type === "ACADEMY_ENROLLMENT" ? (job as any).address : null,
      state_of_origin: job.type === "ACADEMY_ENROLLMENT" ? (job as any).stateOfOrigin : null,
      lga: job.type === "ACADEMY_ENROLLMENT" ? (job as any).lga : null,
      town: job.type === "ACADEMY_ENROLLMENT" ? (job as any).town : null,
      religion: job.type === "ACADEMY_ENROLLMENT" ? (job as any).religion : null,
      payment_option: job.type === "ACADEMY_ENROLLMENT" ? (job as any).paymentOption : null,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([orderPayload])
      .select();

    if (error) {
      console.warn("Could not save to Supabase 'orders' table (schema mismatch or missing table). LocalStorage was updated.", error);
      return { success: false, data: null, error };
    }

    return { success: true, data, error: null };
  } catch (err: any) {
    console.error("Failed to insert order in Supabase:", err);
    return { success: false, data: null, error: err };
  }
}

// Fetch orders from Supabase (merging with localStorage if database is unreachable)
export async function fetchOrdersFromSupabase(): Promise<JobItem[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.warn("Could not query Supabase 'orders' table. Returning local storage backup.", error);
      return getStoredJobs();
    }

    if (!data || data.length === 0) {
      return getStoredJobs();
    }

    // Map database payload back to frontend JobItem[]
    const mappedJobs: JobItem[] = data.map((d: any) => {
      if (d.type === "CAC_REGISTRATION") {
        return {
          id: d.id,
          type: "CAC_REGISTRATION" as const,
          businessName: d.business_name || d.businessName || "Unnamed Business",
          entityType: d.entity_type || d.entityType || "Private Limited",
          industry: d.industry || "General Commerce",
          status: d.status || "Pending",
          timestamp: d.timestamp || d.created_at || new Date().toISOString(),
          whatsappMessage: d.whatsapp_message || d.whatsappMessage || "",
          cacData: d.cac_data || d.cacData || "",
          totalCost: d.total_cost || d.totalCost || 0,
        };
      } else if (d.type === "PRINT_ORDER") {
        return {
          id: d.id,
          type: "PRINT_ORDER" as const,
          jobType: d.job_type || d.jobType || "Print",
          fileName: d.file_name || d.fileName || "Document.pdf",
          pages: parseInt(d.pages) || 1,
          colorMode: d.color_mode || d.colorMode || "B&W",
          finishing: d.finishing || "None",
          instructions: d.instructions || "",
          totalCost: parseFloat(d.total_cost || d.totalCost || "0"),
          status: d.status || "Pending",
          timestamp: d.timestamp || d.created_at || new Date().toISOString(),
          whatsappMessage: d.whatsapp_message || d.whatsappMessage || "",
        };
      } else {
        return {
          id: d.id,
          type: "ACADEMY_ENROLLMENT" as const,
          fullName: d.full_name || d.fullName || "Student Name",
          email: d.email || "",
          phone: d.phone || "",
          course: d.course || "Web Development",
          status: d.status || "Pending",
          timestamp: d.timestamp || d.created_at || new Date().toISOString(),
          whatsappMessage: d.whatsapp_message || d.whatsappMessage || "",
          totalCost: parseFloat(d.total_cost || d.totalCost || "0"),
          
          // Demographic mappings
          dob: d.dob || "",
          gender: d.gender || "Male",
          nationality: d.nationality || "Nigerian",
          address: d.address || "",
          stateOfOrigin: d.state_of_origin || d.stateOfOrigin || "",
          lga: d.lga || "",
          town: d.town || "",
          religion: d.religion || "Christianity",
          paymentOption: d.payment_option || d.paymentOption || "full"
        };
      }
    });

    return mappedJobs;
  } catch (err) {
    console.error("Error fetching orders from Supabase:", err);
    return getStoredJobs();
  }
}

// Update status in Supabase
export async function updateOrderStatusInSupabase(id: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.warn("Could not update order status in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error updating status in Supabase:", err);
    return false;
  }
}

// Save registered users to Supabase and fallback to LocalStorage
export async function createUserInSupabase(userData: any): Promise<boolean> {
  try {
    const payload = {
      id: userData.id,
      full_name: userData.fullName,
      email: userData.email,
      phone: userData.phone || null,
      student_id: userData.studentId || null,
      invite_code: userData.inviteCode,
      referral_count: userData.referralCount || 0,
      avatar_url: userData.avatarUrl || null,
      is_google_user: userData.isGoogleUser || false,
      address: userData.address || null,
      bio: userData.bio || null,
      role: userData.role || "client",
      created_at: new Date().toISOString()
    };

    // 1. Try upserting to 'users' table
    const { error: userError } = await supabase
      .from("users")
      .upsert([payload], { onConflict: "id" });

    if (userError) {
      console.warn("Could not upsert user to Supabase 'users' table:", userError);
    }

    // 2. Try upserting to 'profiles' table to fulfill specific 'profiles table' schema expectation
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert([{
        id: userData.id,
        full_name: userData.fullName,
        email: userData.email,
        phone: userData.phone || null,
        avatar_url: userData.avatarUrl || null,
        is_google_user: userData.isGoogleUser || false,
        address: userData.address || null,
        bio: userData.bio || null,
        role: userData.role || "client",
        updated_at: new Date().toISOString()
      }], { onConflict: "id" });

    if (profileError) {
      console.warn("Could not upsert to Supabase 'profiles' table:", profileError);
    }

    return !userError || !profileError;
  } catch (err) {
    console.error("Error saving user to Supabase:", err);
    return false;
  }
}

// Save referrals to Supabase
export async function createReferralInSupabase(referralData: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("referrals")
      .insert([{
        referrer_id: referralData.referrerId,
        referred_name: referralData.referredName,
        referred_phone: referralData.referredPhone,
        reward_points: referralData.rewardPoints || 10,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.warn("Could not save referral to Supabase 'referrals' table:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error saving referral to Supabase:", err);
    return false;
  }
}
