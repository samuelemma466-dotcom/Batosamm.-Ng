import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Public firebase credentials for client application
const metaEnv = (import.meta as any).env || {};

function getEnvValue(val: any, fallback: string): string {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed && trimmed !== "undefined" && trimmed !== "null") {
      return trimmed;
    }
  }
  return fallback;
}

const firebaseConfig = {
  apiKey: getEnvValue(metaEnv.VITE_FIREBASE_API_KEY, "AIzaSyCoJYXzyyE6lTWS3gy1nvZPjsXo9Y87ipI"),
  authDomain: getEnvValue(metaEnv.VITE_FIREBASE_AUTH_DOMAIN, "batosamdg.firebaseapp.com"),
  projectId: getEnvValue(metaEnv.VITE_FIREBASE_PROJECT_ID, "batosamdg"),
  storageBucket: getEnvValue(metaEnv.VITE_FIREBASE_STORAGE_BUCKET, "batosamdg.firebasestorage.app"),
  messagingSenderId: getEnvValue(metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID, "12640642475"),
  appId: getEnvValue(metaEnv.VITE_FIREBASE_APP_ID, "1:12640642475:web:92bc56c23543df3ad21eee"),
  measurementId: getEnvValue(metaEnv.VITE_FIREBASE_MEASUREMENT_ID, "G-SWY0V4WXVC")
};

let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | null = null;
const googleProvider = new GoogleAuthProvider();

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  googleProvider.setCustomParameters({
    prompt: "select_account"
  });

  // Safely check and initialize Firebase Analytics if supported by the browser context
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized successfully.");
    }
  }).catch((err) => {
    console.warn("Firebase Analytics check failed or not supported in this environment:", err);
  });
} catch (error) {
  console.warn("Firebase Auth initialized in simulation/fail-safe fallback mode:", error);
}

export { 
  app, 
  auth, 
  analytics,
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
};
export type { FirebaseUser };
