import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuL67uLPlKuJyLXdqcAuM4JJAK-Ze06GM",
  authDomain: "autogrid-bmw-47cc0.firebaseapp.com",
  projectId: "autogrid-bmw-47cc0",
  storageBucket: "autogrid-bmw-47cc0.firebasestorage.app",
  messagingSenderId: "1078320473673",
  appId: "1:1078320473673:web:cb728f484673a01f628198",
  measurementId: "G-591SCTTS2R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };