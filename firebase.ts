import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'COLE_SUA_API_KEY',
  authDomain: 'COLE_SEU_AUTH_DOMAIN',
  projectId: 'COLE_SEU_PROJECT_ID',
  storageBucket: 'COLE_SEU_STORAGE_BUCKET',
  messagingSenderId: 'COLE_SEU_MESSAGING_SENDER_ID',
  appId: 'COLE_SEU_APP_ID'
};

export const firebaseEnabled = false;

export const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();
