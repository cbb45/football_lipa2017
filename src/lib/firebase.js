import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4EJS0oKYfrhuQ5jouQJ5J9smZN3LKX_g",
  authDomain: "footballlipaopenplay.firebaseapp.com",
  projectId: "footballlipaopenplay",
  storageBucket: "footballlipaopenplay.firebasestorage.app",
  messagingSenderId: "1093626507310",
  appId: "1:1093626507310:web:ef81bd34ba1663c2866fbf",
  measurementId: "G-GV6G87P8Y2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);