// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuL67uLPlKuJyLXdqcAuM4JJAK-Ze06GM",
  authDomain: "autogrid-bmw-47cc0.firebaseapp.com",
  projectId: "autogrid-bmw-47cc0",
  storageBucket: "autogrid-bmw-47cc0.firebasestorage.app",
  messagingSenderId: "1078320473673",
  appId: "1:1078320473673:web:cb728f484673a01f628198",
  measurementId: "G-591SCTTS2R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };