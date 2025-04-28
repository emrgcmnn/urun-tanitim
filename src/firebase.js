import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyANBGSoET2McXoUoDLQTyncEW1XVULNsdg",
    authDomain: "urun-listeleme-121ba.firebaseapp.com",
    projectId: "urun-listeleme-121ba",
    storageBucket: "urun-listeleme-121ba.firebasestorage.app",
    messagingSenderId: "840043372246",
    appId: "1:840043372246:web:62007fc85e091acf4db377",
    measurementId: "G-ENDB1RLME9"
  };
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);