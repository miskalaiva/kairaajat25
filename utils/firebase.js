// utils/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Hae ympäristömuuttujat Nuxtin runtimeConfigista.
// Tämä on Nuxtin suositeltu tapa lukea `NUXT_PUBLIC_` -muuttujat.
const config = useRuntimeConfig().public;

const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId: config.firebaseProjectId,
  storageBucket: config.firebaseStorageBucket,
  messagingSenderId: config.firebaseMessagingSenderId,
  appId: config.firebaseAppId,
};

// Alusta Firebase
const app = initializeApp(firebaseConfig);

// Alusta ja eksportoi käyttämäsi palvelut
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
