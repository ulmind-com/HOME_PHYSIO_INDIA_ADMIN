/**
 * Firebase client-side SDK initialization.
 *
 * Uses environment variables (VITE_FIREBASE_*) to configure the Firebase app.
 * Exports the `auth` instance for use in Phone Auth flows.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { env } from "./env";

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
