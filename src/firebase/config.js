/**
 * Firebase Configuration
 *
 * Setup steps (one-time, ~5 min):
 *   1. https://console.firebase.google.com → Create project
 *   2. Authentication → Sign-in method → Enable "Google"
 *   3. Firestore Database → Create database → Start in test mode
 *   4. Project Settings → Your apps → Add web app → copy the config object
 *   5. Paste values below and flip CONFIGURED to true
 */

export const CONFIGURED = true;

export const RTDB_CONFIGURED = true;

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);