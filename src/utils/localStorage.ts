// Local storage helper to manage sessions and admin visibility of jobs

export interface CACJob {
  id: string;
  type: "CAC_REGISTRATION";
  businessName: string;
  entityType: string;
  industry: string;
  status: string;
  timestamp: string;
  whatsappMessage: string;
  paymentRef?: string;
  totalCost?: number;
  cacData?: string;
  assignedTo?: string;
  assignedToName?: string;
  proofUrl?: string;
}

export interface PrintJob {
  id: string;
  type: "PRINT_ORDER";
  jobType: "Print" | "Scan" | "Graphic Design" | "Typing Job";
  fileName: string;
  pages: number;
  colorMode: string;
  finishing: string;
  instructions: string;
  totalCost: number;
  status: string;
  timestamp: string;
  whatsappMessage: string;
  paymentRef?: string;
  assignedTo?: string;
  assignedToName?: string;
  proofUrl?: string;
}

export interface EnrollmentJob {
  id: string;
  type: "ACADEMY_ENROLLMENT";
  fullName: string;
  email: string;
  phone: string;
  course: string;
  skillLevel?: string;
  preferredBatch?: string;
  status: string;
  timestamp: string;
  whatsappMessage: string;
  paymentRef?: string;
  totalCost?: number;
  assignedTo?: string;
  assignedToName?: string;
  proofUrl?: string;

  // Additional 5-step admissions wizard fields
  dob?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  stateOfOrigin?: string;
  lga?: string;
  town?: string;
  religion?: string;
  skillsSelected?: string[];
  commitmentSigned?: boolean;
  paymentOption?: "full" | "installment_1";
}

export type JobItem = CACJob | PrintJob | EnrollmentJob;

export function updateJobStatus(id: string, status: string) {
  const current = getStoredJobs();
  const updated = current.map((job) => (job.id === id ? { ...job, status } : job));
  localStorage.setItem("vanguard_pending_jobs", JSON.stringify(updated));
  
  // Trigger a custom event to notify components of the status change
  window.dispatchEvent(new Event("vanguard_jobs_updated"));
}

export function assignJobToStaff(jobId: string, staffId: string, staffName: string) {
  const current = getStoredJobs();
  const updated = current.map((job) => (job.id === jobId ? { ...job, assignedTo: staffId, assignedToName: staffName } : job));
  localStorage.setItem("vanguard_pending_jobs", JSON.stringify(updated));
  
  // Trigger a custom event to notify components of the status change
  window.dispatchEvent(new Event("vanguard_jobs_updated"));
}

export function getStoredJobs(): JobItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("vanguard_pending_jobs");
  if (!raw) {
    localStorage.setItem("vanguard_pending_jobs", JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveJob(job: JobItem) {
  const current = getStoredJobs();
  const updated = [job, ...current];
  localStorage.setItem("vanguard_pending_jobs", JSON.stringify(updated));
  
  // Trigger a custom event to notify components (e.g. App.tsx) of the update
  window.dispatchEvent(new Event("vanguard_jobs_updated"));
}

export function clearAllJobs() {
  localStorage.removeItem("vanguard_pending_jobs");
  window.dispatchEvent(new Event("vanguard_jobs_updated"));
}
