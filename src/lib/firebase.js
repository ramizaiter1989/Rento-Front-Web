// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHpErx1BokAVd3CI5QbJ_HdDD0_OCl7Tg",
  authDomain: "rento-lb-2026.firebaseapp.com",
  projectId: "rento-lb-2026",
  storageBucket: "rento-lb-2026.firebasestorage.app",
  messagingSenderId: "34580839980",
  appId: "1:34580839980:web:41d19dff9a28415d551b89",
  measurementId: "G-13QSYTLK5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);