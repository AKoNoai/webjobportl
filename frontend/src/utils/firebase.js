// Import the functions you need from the SDKs you need
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyBvhKSgxH4Tw6pX0lOypJgsvn4QNZsl5E8",
  authDomain: "lendsf-3f22c.firebaseapp.com",
  projectId: "lendsf-3f22c",
  storageBucket: "lendsf-3f22c.firebasestorage.app",
  messagingSenderId: "251828972643",
  appId: "1:251828972643:web:c7049937041af97bef9c56",
  measurementId: "G-GCNGBB56DW",
};

const firebaseConfig = import.meta.env.PROD
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackFirebaseConfig.measurementId,
    };

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  if (import.meta.env.PROD) {
    throw new Error(
      `Missing Firebase config in production: ${missingConfigKeys.join(", ")}. Set VITE_FIREBASE_* on Vercel to the correct Firebase project.`
    );
  }

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