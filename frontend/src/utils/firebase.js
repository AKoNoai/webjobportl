// Import the functions you need from the SDKs you need
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const localFirebaseConfig = {
  apiKey: "AIzaSyBvhKSgxH4Tw6pX0lOypJgsvn4QNZsl5E8",
  authDomain: "lendsf-3f22c.firebaseapp.com",
  projectId: "lendsf-3f22c",
  storageBucket: "lendsf-3f22c.firebasestorage.app",
  messagingSenderId: "251828972643",
  appId: "1:251828972643:web:c7049937041af97bef9c56",
  measurementId: "G-GCNGBB56DW",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localFirebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || localFirebaseConfig.measurementId,
};

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  console.warn(
    `Using fallback Firebase config because these env vars are missing: ${missingConfigKeys.join(", ")}. Set VITE_FIREBASE_* in Vercel to match your Firebase project.`
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider =new  GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
export { app, auth, provider };