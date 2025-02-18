import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { FIREBASE_CONFIG } from "./env";

const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const user = auth.currentUser; // Note: this might be null initially
export const timestamp = serverTimestamp; // Export the function itself
