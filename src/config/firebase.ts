import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { FIREBASE_CONFIG } from "./env";

const app = initializeApp(FIREBASE_CONFIG);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
export const user = auth.currentUser; // Note: this might be null initially
export const timestamp = serverTimestamp; // Export the function itself
