// Import the functions you need from the SDKs you need
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBvhKSgxH4Tw6pX0lOypJgsvn4QNZsl5E8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lendsf-3f22c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lendsf-3f22c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lendsf-3f22c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "251828972643",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:251828972643:web:c7049937041af97bef9c56",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GCNGBB56DW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider =new  GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
export { app, auth, provider };