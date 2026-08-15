import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: appletConfig.apiKey || "AIzaSyBTtB_MP70tOJ-gZa0B6YF8OOJaKIloabk",
  authDomain: appletConfig.authDomain || "wattyboon-94c69.firebaseapp.com",
  databaseURL: (appletConfig as any).databaseURL || "https://wattyboon-94c69-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: appletConfig.projectId || "wattyboon-94c69",
  storageBucket: appletConfig.storageBucket || "wattyboon-94c69.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || "227047858074",
  appId: appletConfig.appId || "1:227047858074:web:44fee655f929bcd83be423",
  measurementId: appletConfig.measurementId || "G-T8FP8BN0KP"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const databaseId = (appletConfig as any).firestoreDatabaseId || '(default)';

// Initialize Firestore with robust long-polling to prevent WebChannelConnection stream transport errors in container/proxy environments
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  }, databaseId === '(default)' ? undefined : databaseId);
} catch {
  firestoreInstance = getFirestore(app, databaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);

// Safe Analytics Initialization for Web
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {});
}

// Connection test helper (silently verify or log only if critical)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase running in offline / cache fallback mode.");
    }
  }
}
testConnection().catch(() => {});

// Standard Firestore Error Handling Helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export default app;



