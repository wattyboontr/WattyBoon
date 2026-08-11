import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDBY8gjX8nw0HeKvJJBQmLCljO4L12R220',
  authDomain: 'wattyboon-12bc2.firebaseapp.com',
  databaseURL: 'https://wattyboon-12bc2-default-rtdb.firebaseio.com',
  projectId: 'wattyboon-12bc2',
  storageBucket: 'wattyboon-12bc2.firebasestorage.app',
  messagingSenderId: '367786387423',
  appId: '1:367786387423:web:96cab7a49f8ef98d84466a',
  measurementId: 'G-W3XDXZEJ2T',
};

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


