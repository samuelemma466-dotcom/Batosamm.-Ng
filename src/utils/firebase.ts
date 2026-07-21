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
import { getCoreConfig } from "./coreConfig";

// Public firebase credentials for client application
const metaEnv = (import.meta as any).env || {};

const config = getCoreConfig();
const firebaseConfig = {
  apiKey: config.firebaseConfig.apiKey,
  authDomain: config.firebaseConfig.authDomain,
  projectId: config.firebaseConfig.projectId,
  storageBucket: config.firebaseConfig.storageBucket,
  messagingSenderId: config.firebaseConfig.messagingSenderId,
  appId: config.firebaseConfig.appId,
  measurementId: config.firebaseConfig.measurementId
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
