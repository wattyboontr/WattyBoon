import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey || 'AIzaSyDBY8gjX8nw0HeKvJJBQmLCljO4L12R220',
  authDomain: config.authDomain || 'wattyboon-12bc2.firebaseapp.com',
  databaseURL: 'https://wattyboon-12bc2-default-rtdb.firebaseio.com',
  projectId: config.projectId || 'wattyboon-12bc2',
  storageBucket: config.storageBucket || 'wattyboon-12bc2.firebasestorage.app',
  messagingSenderId: config.messagingSenderId || '367786387423',
  appId: config.appId || '1:367786387423:web:96cab7a49f8ef98d84466a',
  measurementId: config.measurementId || 'G-W3XDXZEJ2T',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore using configured databaseId or fallback
const getFirestoreInstance = () => {
  const customDbId = config.firestoreDatabaseId;
  if (customDbId && customDbId !== '(default)') {
    try {
      return getFirestore(app, customDbId);
    } catch (err) {
      console.warn(`Firestore initialization with custom databaseId '${customDbId}' failed, falling back:`, err);
    }
  }
  return getFirestore(app);
};

export const db = getFirestoreInstance();
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


