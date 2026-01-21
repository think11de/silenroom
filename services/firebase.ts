import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD8Oeh4AMUH0Zk3LjE4RwhOBq-HAg-mXfA",
  authDomain: "silent-room-238de.firebaseapp.com",
  projectId: "silent-room-238de",
  storageBucket: "silent-room-238de.firebasestorage.app",
  messagingSenderId: "459536755261",
  appId: "1:459536755261:web:ff1105720b19918a8a5854"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Login failed", error);
        throw error; // Propagate error to UI
    }
};

export const loginGuest = async () => {
    try {
        await signInAnonymously(auth);
    } catch (error) {
        console.error("Guest login failed", error);
        throw error; // Propagate error to UI
    }
};

export const logout = async () => {
    await signOut(auth);
};

export type { FirebaseUser };