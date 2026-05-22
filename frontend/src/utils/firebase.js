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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (import.meta.env.DEV ? localFirebaseConfig.apiKey : undefined),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta.env.DEV ? localFirebaseConfig.authDomain : undefined),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (import.meta.env.DEV ? localFirebaseConfig.projectId : undefined),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (import.meta.env.DEV ? localFirebaseConfig.storageBucket : undefined),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (import.meta.env.DEV ? localFirebaseConfig.messagingSenderId : undefined),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (import.meta.env.DEV ? localFirebaseConfig.appId : undefined),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (import.meta.env.DEV ? localFirebaseConfig.measurementId : undefined),
};

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  throw new Error(
    `Missing Firebase config for production: ${missingConfigKeys.join(", ")}. Set the VITE_FIREBASE_* env vars in Vercel.`
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider =new  GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
export { app, auth, provider };