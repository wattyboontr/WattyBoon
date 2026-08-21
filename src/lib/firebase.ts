import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { 
  initializeAuth, 
  indexedDBLocalPersistence, 
  browserLocalPersistence, 
  inMemoryPersistence, 
  getAuth 
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: "AIzaSyBTtB_MP70tOJ-gZa0B6YF8OOJaKIloabk",
  authDomain: "wattyboon-94c69.firebaseapp.com",
  databaseURL: "https://wattyboon-94c69-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wattyboon-94c69",
  storageBucket: "wattyboon-94c69.firebasestorage.app",
  messagingSenderId: "227047858074",
  appId: "1:227047858074:web:fcbbb65ae4256bcd3be423"
};

if ((appletConfig as any).measurementId) {
  firebaseConfig.measurementId = (appletConfig as any).measurementId;
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with robust auto-detect long polling and databaseId support
let firestoreInstance;
const targetDbId = appletConfig.firestoreDatabaseId && appletConfig.firestoreDatabaseId !== '(default)' 
  ? appletConfig.firestoreDatabaseId 
  : undefined;

try {
  if (targetDbId) {
    firestoreInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    }, targetDbId);
  } else {
    firestoreInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    });
  }
} catch {
  try {
    firestoreInstance = getFirestore(app, targetDbId);
  } catch {
    try {
      firestoreInstance = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true,
      });
    } catch {
      firestoreInstance = getFirestore(app);
    }
  }
}

export const db = firestoreInstance;

// Resilient Auth initialization with fallback persistence to prevent "Database is closing" errors on mobile IndexedDB
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: [browserLocalPersistence, indexedDBLocalPersistence, inMemoryPersistence]
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;

// Safe Analytics Initialization for Web only if measurementId is actually configured
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
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



