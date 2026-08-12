import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey || 'AIzaSyA7VbszpQ3-IZG7VpauHG_9pOytSFIDTZo',
  authDomain: config.authDomain || 'halogen-silicon-s6shk.firebaseapp.com',
  projectId: config.projectId || 'halogen-silicon-s6shk',
  storageBucket: config.storageBucket || 'halogen-silicon-s6shk.firebasestorage.app',
  messagingSenderId: config.messagingSenderId || '563390609693',
  appId: config.appId || '1:563390609693:web:b8d6d46cae02475f6409f4',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore using default database or custom ID if specified
const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? config.firestoreDatabaseId
  : undefined;

export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
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


