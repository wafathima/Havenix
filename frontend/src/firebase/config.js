import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDnkLS2vocJsjWsykC-gjHwztO6Ick66zo",
  authDomain: "havenix-ae7d2.firebaseapp.com",
  projectId: "havenix-ae7d2",
  storageBucket: "havenix-ae7d2.firebasestorage.app",
  messagingSenderId: "449356851991",
  appId: "1:449356851991:web:259fe2ff6969fe7ba9a552"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };