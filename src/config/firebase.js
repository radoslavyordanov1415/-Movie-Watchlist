import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: 'AIzaSyDOx5SUWAPedmpwYeMBpv-a4Jbqu9PonRM',
  authDomain: 'moviewatchlist-67571.firebaseapp.com',
  projectId: 'moviewatchlist-67571',
  storageBucket: 'moviewatchlist-67571.firebasestorage.app',
  messagingSenderId: '840892195421',
  appId: '1:840892195421:web:9edfe7e2caec53bc2723b4',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;
