import {
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { ReCaptchaV3Provider, initializeAppCheck } from "firebase/app-check";
import { getAuth, indexedDBLocalPersistence, initializeAuth } from "firebase/auth";
import { getRemoteConfig } from "firebase/remote-config";

import App from "./App";
import { Capacitor } from "@capacitor/core";
import { Providers } from "./Providers";
import { createRoot } from "react-dom/client";
import { initializeApp } from "firebase/app";
import { isPlatform } from "@ionic/react";

const firebaseConfig = {
  apiKey: "AIzaSyDpRsaLBzTnR1hN1YCkePRqI6BpVdq_NQw",
  authDomain: "the-coffee-lounge.firebaseapp.com",
  projectId: "the-coffee-lounge",
  storageBucket: "the-coffee-lounge.appspot.com",
  messagingSenderId: "929442369121",
  appId: "1:929442369121:web:862ca3b3cc78aed7192420",
  measurementId: "G-MENXM5XNW8",
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
});
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LfXQEonAAAAAAjWlyLuYkL040qQff7DhZVxVCip"),
});
export const remoteConfig = getRemoteConfig(app);

if (Capacitor.isNativePlatform()) {
  initializeAuth(app, {
    persistence: indexedDBLocalPersistence,
  })
} else {
  getAuth(app);
}

// Check if the app is running in a native Capacitor environment
const isNative = isPlatform("capacitor");

// register service worker if we're not capacitor
if (!isNative) {
  // Register the service worker only for web deployments
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  }
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <Providers>
    <App />
  </Providers>
);
