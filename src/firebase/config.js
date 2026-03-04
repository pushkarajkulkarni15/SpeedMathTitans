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

export const CONFIGURED = false;

export const firebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
};
