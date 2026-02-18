import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const hasFirebaseConfig = missingKeys.length === 0;

if (missingKeys.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn(
    `[MFLIX] Missing Firebase env vars: ${missingKeys.join(
      ", "
    )}. Add them in .env.local before running.`
  );
}

let app;
let database;

function getFirebaseApp() {
  if (!hasFirebaseConfig) {
    throw new Error(
      "Firebase environment variables are missing. Configure .env.local before fetching data."
    );
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseDatabase() {
  if (!database) {
    database = getDatabase(getFirebaseApp());
  }
  return database;
}
