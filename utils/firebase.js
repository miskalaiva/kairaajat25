import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // <--- LISÄÄ TÄMÄ RIVI

const firebaseConfig = {
  apiKey: "AIzaSyAoO1ntqX4XsgllnyCqwNq4tTOUGo1Su1M",
  authDomain: "kairaajat-c699b.firebaseapp.com",
  projectId: "kairaajat-c699b",
  storageBucket: "kairaajat-c699b.firebasestorage.app",
  messagingSenderId: "471935822967",
  appId: "1:471935822967:web:e389ad8d42f29d3838aa72",
};
// Alusta Firebase
const app = initializeApp(firebaseConfig);

// Alusta ja eksportoi käyttämäsi palvelut
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // <--- LISÄÄ TÄMÄ RIVI

export { db, storage, auth }; // <--- MUOKKAA TÄMÄ RIVI
