// Session helper to handle minimalist glassmorphic client accounts, unique client IDs, and invite tracking.

import { createUserInSupabase, createReferralInSupabase } from "./supabase";

export interface UserAccount {
  id: string; // Client ID, e.g., BATO-CLI-4921
  fullName: string;
  email: string;
  phone: string;
  studentId?: string; // Optional student ID if registered for training
  password?: string;
  inviteCode: string; // e.g., BATO-INV-4921
  referralCount: number;
  referredEmails: string[];
  avatarUrl?: string;
  isGoogleUser?: boolean;
  role?: "client" | "admin" | "staff";
  idType?: string; // e.g., National ID (NIN), BVN, Driver's License, International Passport, Voter's Card
  idNumber?: string; // ID Number
  emergencyName?: string; // Emergency Contact Name
  emergencyPhone?: string; // Emergency Contact Phone
  idVerified?: boolean; // Verification status
}

export function getStoredUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("bato_sam_registered_users");
  if (!raw) {
    localStorage.setItem("bato_sam_registered_users", JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function getCurrentUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("bato_sam_current_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function loginUser(emailOrId: string, passwordInput: string): UserAccount | null {
  const users = getStoredUsers();
  const cleanTerm = emailOrId.trim().toLowerCase();
  
  // Find by email, studentId or clientId
  const found = users.find(u => 
    u.email.toLowerCase() === cleanTerm || 
    (u.studentId && u.studentId.toLowerCase() === cleanTerm) ||
    u.id.toLowerCase() === cleanTerm
  );

  if (found) {
    // For local simulation, we accept any password or verify if matched
    localStorage.setItem("bato_sam_current_user", JSON.stringify(found));
    window.dispatchEvent(new Event("bato_user_session_changed"));
    return found;
  }
  return null;
}

export function registerUser(fullName: string, email: string, phone: string, courseName?: string): UserAccount {
  const users = getStoredUsers();
  const randId = Math.floor(1000 + Math.random() * 9000);
  
  const id = `BATO-CLI-${randId}`;
  const inviteCode = `BATO-INV-${randId}`;
  
  // If registered with a course, assign a student ID
  let studentId: string | undefined = undefined;
  if (courseName) {
    studentId = `BATO-STU-${randId}`;
  }

  const newUser: UserAccount = {
    id,
    fullName,
    email,
    phone,
    studentId,
    inviteCode,
    referralCount: 0,
    referredEmails: []
  };

  users.push(newUser);
  localStorage.setItem("bato_sam_registered_users", JSON.stringify(users));
  localStorage.setItem("bato_sam_current_user", JSON.stringify(newUser));
  
  // Asynchronously save registered user to Supabase
  createUserInSupabase(newUser).catch(err => console.warn("Supabase user save bypassed:", err));

  // Increment live visitors or share stats as well
  incrementLiveShares();

  window.dispatchEvent(new Event("bato_user_session_changed"));
  return newUser;
}

export function logoutUser() {
  localStorage.removeItem("bato_sam_current_user");
  window.dispatchEvent(new Event("bato_user_session_changed"));
}

export function addReferralToCurrentUser(email: string): UserAccount | null {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const users = getStoredUsers();
  const updatedUser = {
    ...currentUser,
    referralCount: currentUser.referralCount + 1,
    referredEmails: [...currentUser.referredEmails, email]
  };

  // Update in user list
  const updatedList = users.map(u => u.id === currentUser.id ? updatedUser : u);
  localStorage.setItem("bato_sam_registered_users", JSON.stringify(updatedList));
  localStorage.setItem("bato_sam_current_user", JSON.stringify(updatedUser));
  
  // Asynchronously save referral connection to Supabase
  createReferralInSupabase({
    referrerId: currentUser.id,
    referredName: email.split("@")[0] || email,
    referredPhone: "Simulated",
    rewardPoints: 10
  }).catch(err => console.warn("Supabase referral save bypassed:", err));

  // Also track link shares in admin panel
  incrementLiveShares();

  window.dispatchEvent(new Event("bato_user_session_changed"));
  return updatedUser;
}

// Analytics Live counter storage helpers
export function getAdminAnalytics() {
  if (typeof window === "undefined") return { visitors: 0, shares: 0 };
  const visitors = localStorage.getItem("bato_sam_visitors");
  const shares = localStorage.getItem("bato_sam_shares");
  
  const parsedVisitors = visitors ? parseInt(visitors) : 0;
  const parsedShares = shares ? parseInt(shares) : 0;
  
  return {
    visitors: parsedVisitors,
    shares: parsedShares
  };
}

export function incrementLiveVisitors() {
  const stats = getAdminAnalytics();
  localStorage.setItem("bato_sam_visitors", (stats.visitors + 1).toString());
  window.dispatchEvent(new Event("bato_analytics_updated"));
}

export function incrementLiveShares() {
  const stats = getAdminAnalytics();
  localStorage.setItem("bato_sam_shares", (stats.shares + 1).toString());
  window.dispatchEvent(new Event("bato_analytics_updated"));
}

export function registerOrLoginGoogleUser(fullName: string, email: string, avatarUrl: string): UserAccount {
  const users = getStoredUsers();
  const cleanEmail = email.trim().toLowerCase();
  
  // Set role as admin if developer samuelemma466@gmail.com, otherwise client
  const defaultRole = (cleanEmail === "samuelemma466@gmail.com") ? "admin" : "client";
  
  // See if there's already a user with this email
  let found = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
  
  if (found) {
    // Update existing user with Google details
    found.fullName = found.fullName || fullName;
    found.avatarUrl = avatarUrl;
    found.isGoogleUser = true;
    found.role = found.role || defaultRole;
    
    localStorage.setItem("bato_sam_registered_users", JSON.stringify(users));
    localStorage.setItem("bato_sam_current_user", JSON.stringify(found));
    
    // Sync to Supabase in the background
    createUserInSupabase(found).catch(err => console.warn("Supabase user save bypassed:", err));
    
    window.dispatchEvent(new Event("bato_user_session_changed"));
    return found;
  }
  
  // Create a new user account
  const randId = Math.floor(1000 + Math.random() * 9000);
  const id = `BATO-CLI-${randId}`;
  const inviteCode = `BATO-INV-${randId}`;
  
  const newUser: UserAccount = {
    id,
    fullName,
    email: cleanEmail,
    phone: "Google Auth",
    inviteCode,
    referralCount: 0,
    referredEmails: [],
    avatarUrl,
    isGoogleUser: true,
    role: defaultRole
  };
  
  users.push(newUser);
  localStorage.setItem("bato_sam_registered_users", JSON.stringify(users));
  localStorage.setItem("bato_sam_current_user", JSON.stringify(newUser));
  
  // Sync to Supabase in background
  createUserInSupabase(newUser).catch(err => console.warn("Supabase user save bypassed:", err));
  
  window.dispatchEvent(new Event("bato_user_session_changed"));
  return newUser;
}

export function updateUserIdentification(
  idType: string,
  idNumber: string,
  phone: string,
  emergencyName?: string,
  emergencyPhone?: string
): UserAccount | null {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const users = getStoredUsers();
  const updatedUser: UserAccount = {
    ...currentUser,
    idType,
    idNumber,
    phone,
    emergencyName,
    emergencyPhone,
    idVerified: true
  };

  // Update in user list
  const updatedList = users.map(u => u.id === currentUser.id ? updatedUser : u);
  localStorage.setItem("bato_sam_registered_users", JSON.stringify(updatedList));
  localStorage.setItem("bato_sam_current_user", JSON.stringify(updatedUser));

  // Sync update to Supabase in the background
  createUserInSupabase(updatedUser).catch(err => console.warn("Supabase user ID save bypassed:", err));

  window.dispatchEvent(new Event("bato_user_session_changed"));
  return updatedUser;
}

export function clearAllUsers() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bato_sam_registered_users");
    localStorage.removeItem("bato_sam_current_user");
    localStorage.removeItem("bato_sam_visitors");
    localStorage.removeItem("bato_sam_shares");
    window.dispatchEvent(new Event("bato_user_session_changed"));
  }
}

