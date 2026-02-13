import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBmQRJFY-cJwiOrcLSxr7gD6wB_eBH4IZg",
    authDomain: "jobpeel-8e825.firebaseapp.com",
    projectId: "jobpeel-8e825",
    storageBucket: "jobpeel-8e825.firebasestorage.app",
    messagingSenderId: "472190588105",
    appId: "1:472190588105:web:ae69cf4d56182b15be2918",
    measurementId: "G-ZBS2N56X2M"
};

import { getStorage } from "firebase/storage";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app, "jobpeel2");
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };
