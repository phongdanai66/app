import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7zGvli2R6ICNWltd9KXIkvYWDdDjoDQE",
  authDomain: "project-8593311812667244846.firebaseapp.com",
  projectId: "project-8593311812667244846",
  storageBucket: "project-8593311812667244846.firebasestorage.app",
  messagingSenderId: "828306978979",
  appId: "1:828306978979:web:69d6536989104517e16716",
  measurementId: "G-1D7RV3F3JB"
};

const hasDefaultApp = getApps().some((firebaseApp) => firebaseApp.name === "[DEFAULT]");

export const app = hasDefaultApp ? getApp() : initializeApp(firebaseConfig);

const createAuth = () => {
  if (Platform.OS === "web") {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    return getAuth(app);
  }
};

export const auth = createAuth();
