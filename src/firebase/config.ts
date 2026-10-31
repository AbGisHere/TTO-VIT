import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  projectId: "innovation-vit",
  appId: "1:32426988435:web:3c3b290afe3dc35ccfce66",
  databaseURL: "https://innovation-vit-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "innovation-vit.firebasestorage.app",
  apiKey: "AIzaSyC9a1IiZWarOvbGmEh2ilVmNoRM7At60f8",
  authDomain: "innovation-vit.firebaseapp.com",
  messagingSenderId: "32426988435",
  measurementId: "G-BW8EFGKLPY"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// TTO uses its own named database so its rules don't collide with other innovation-vit apps.
export const db = getFirestore(app, 'tto-portal');
export const storage = getStorage(app);
export const functions = getFunctions(app, 'asia-south1');
export default app;
