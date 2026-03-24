import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB8YolJ_BofOP2GCllj2jJqZOouAJBtvH0",
    authDomain: "tech-8d6ab.firebaseapp.com",
    projectId: "tech-8d6ab",
    storageBucket: "tech-8d6ab.firebasestorage.app",
    messagingSenderId: "293101454536",
    appId: "1:293101454536:web:4ea46a191738b3520011fd",
    measurementId: "G-92TRE776Q4",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: force account selection every time
googleProvider.setCustomParameters({ prompt: "select_account" });
