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
  apiKey: "AIzaSyDdQg7yVE2OzxW4hpgNarQY6SDuzPWjVAo",
  authDomain: "speedmathtitans.firebaseapp.com",
  databaseURL: "https://speedmathtitans-default-rtdb.firebaseio.com",
  projectId: "speedmathtitans",
  storageBucket: "speedmathtitans.firebasestorage.app",
  messagingSenderId: "856359747715",
  appId: "1:856359747715:web:48e28284f262af41cd1bb6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);