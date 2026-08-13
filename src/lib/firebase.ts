import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBTtB_MP70tOJ-gZa0B6YF8OOJaKIloabk",
  authDomain: "wattyboon-94c69.firebaseapp.com",
  databaseURL: "https://wattyboon-94c69-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wattyboon-94c69",
  storageBucket: "wattyboon-94c69.firebasestorage.app",
  messagingSenderId: "227047858074",
  appId: "1:227047858074:web:44fee655f929bcd83be423",
  measurementId: "G-T8FP8BN0KP"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Safe Analytics Initialization for Web
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;


