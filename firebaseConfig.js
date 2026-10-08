import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1HENG3kPUTcvndvxKNhb3KHsBqWLY8",
  authDomain: "match-bb30c.firebaseapp.com",
  projectId: "match-bb30c",
  storageBucket: "match-bb30c.appspot.com",
  messagingSenderId: "781816318930",
  appId: "1:781816318930:web:305f91f32626086aef560b"
};

// 🔥 กัน error duplicate app
const MATCHES_APP_NAME = "matchesApp";

const app = getApps().some((firebaseApp) => firebaseApp.name === MATCHES_APP_NAME)
  ? getApp(MATCHES_APP_NAME)
  : initializeApp(firebaseConfig, MATCHES_APP_NAME);

export const db = getFirestore(app);
