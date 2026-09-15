import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: rawConfig.apiKey,
  authDomain: rawConfig.authDomain,
  projectId: rawConfig.projectId,
  storageBucket: rawConfig.storageBucket,
  messagingSenderId: rawConfig.messagingSenderId,
  appId: rawConfig.appId,
};

let app: FirebaseApp;
if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to configured database instance
const databaseId = rawConfig.firestoreDatabaseId || '(default)';
export const db: Firestore = getFirestore(app, databaseId);

export default app;
