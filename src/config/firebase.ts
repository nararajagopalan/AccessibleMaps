import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAGzG_dTtSLNoz0WOf1O0VcjvKx8wf6Tpw",
  authDomain: "trusty-server-451220-a3.firebaseapp.com",
  projectId: "trusty-server-451220-a3",
  storageBucket: "trusty-server-451220-a3.firebasestorage.app",
  messagingSenderId: "19064451671",
  appId: "1:19064451671:web:a44cc5f693c51364662912",
  measurementId: "G-KQG19ZEZ2R",
};

const app = initializeApp(firebaseConfig);

// Initialize auth with AsyncStorage persistence as shown in the warning
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
