/** Typed access to Vite environment variables. */
export const env = {
  API_BASE_URL:
    (import.meta.env.VITE_API_BASE_URL as string) ??
    "https://home-physio-india-backend.onrender.com/api/v1",
  APP_NAME:
    (import.meta.env.VITE_APP_NAME as string) ??
    "Home Physio India",

  // Firebase
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY as string,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID as string,
} as const;

export const STORAGE_KEYS = {
  accessToken: "hpi.access_token",
  refreshToken: "hpi.refresh_token",
  user: "hpi.user",
  theme: "hpi.theme",
  sidebar: "hpi.sidebar_collapsed",
} as const;
