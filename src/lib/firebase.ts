import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyZD67svnT_tILcU-08c7jwLGLObbF9Wg",
  authDomain: "hoocar-8806f.firebaseapp.com",
  projectId: "hoocar-8806f",
  storageBucket: "hoocar-8806f.appspot.com",
  messagingSenderId: "70723011185",
  appId: "1:70723011185:web:3ca361a6c9ea2d9eadd1d0",
  measurementId: "G-F37R1CB8CW",
};

// Initialize Firebase (prevent re-initialization in dev)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
