import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

function getEnv(name) {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export function getFirebaseConfig() {
  const config = {
    apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    databaseURL: getEnv("NEXT_PUBLIC_FIREBASE_DATABASE_URL"),
    projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID")
  };

  const missing = Object.entries(config)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Firebase env vars missing (${missing.join(
        ", "
      )}). Add them to .env.local (see .env.example).`
    );
  }

  return /** @type {import('firebase/app').FirebaseOptions} */ (config);
}

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(getFirebaseConfig());
}

export function getFirebaseDatabase() {
  return getDatabase(getFirebaseApp());
}

