import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxSui4B1s9zlr5rXbrbK91dOhZoKs1oEY",
  authDomain: "skillswap-d8f6a.firebaseapp.com",
  projectId: "skillswap-d8f6a",
  storageBucket: "skillswap-d8f6a.firebasestorage.app",
  messagingSenderId: "713809334480",
  appId: "1:713809334480:web:3e1e38f5c90a97fbdaced5",
  measurementId: "G-W9MT5LPYXS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
