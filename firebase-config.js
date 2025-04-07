// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCtlAOBdM7bQ5Tmth4UeAw-QBoIU3Vl4BA",
    authDomain: "healsmart-ai-836ef.firebaseapp.com",
    projectId: "healsmart-ai-836ef",
    storageBucket: "healsmart-ai-836ef.firebasestorage.app",
    messagingSenderId: "640558731428",
    appId: "1:640558731428:web:6c8835703f31d6635f9631",
    measurementId: "G-QMDR2L0SVJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth }; 