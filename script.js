// console.log('hi')
// // Import Firebase Modules
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firebase
// const firebaseConfig = {
//     apiKey: "AIzaSyBxgY40EdFb3EjdIft1WDm-QcYQUSKeAwA",
//     authDomain: "healsmartai.firebaseapp.com",
//     projectId: "healsmartai",
// };
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();

// // Google Sign-In Function
// document.getElementById("google-signin").addEventListener("click", function () {
//     signInWithPopup(auth, provider)
//         .then((result) => {
//             console.log("User signed in:", result.user);
//             alert("Welcome " + result.user.displayName);
//         })
//         .catch((error) => console.error(error));
// });
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxgY40EdFb3EjdIft1WDm-QcYQUSKeAwA",
  authDomain: "healsmartai.firebaseapp.com",
  projectId: "healsmartai",
  storageBucket: "healsmartai.appspot.com",
  messagingSenderId: "606724740125",
  appId: "1:606724740125:web:2756468e65e844bb78a2f4",
  measurementId: "G-W3DMXPSG3K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google Sign-In
document.getElementById("google-signin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      alert("Firebase login success! 🔐");

      // 🔥 Get ID token to send to backend
      user.getIdToken().then((idToken) => {
        // 👉 Send token to backend for verification
        fetch("http://localhost:5000/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("✅ Verified user data from backend:", data);
            alert("Welcome " + data.name || user.displayName);
            window.location.href = "dashboard.html";
          })
          .catch((err) => {
            console.error("❌ Backend verification failed:", err);
            alert("Error verifying user.");
          });
      });
    })
    .catch((error) => {
      console.error("Google sign-in failed:", error);
      alert("Sign-in failed: " + error.message);
    });
});
