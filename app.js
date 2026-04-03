import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhF4IHry3xh-dyv0OUVOTwlZK5KmqS5WM",
  authDomain: "waiter-bf409.firebaseapp.com",
  projectId: "waiter-bf409",
  storageBucket: "waiter-bf409.firebasestorage.app",
  messagingSenderId: "156879781789",
  appId: "1:156879781789:web:cbc0cf21127516a06d3974"
};

// init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 фикс сессии
await setPersistence(auth, browserLocalPersistence);

// UI
const login = document.getElementById("login");
const appBox = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const profile = document.getElementById("profile");

// 🚀 LOGIN
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.log("login error", e);
  }
});

// 🔥 AUTH STATE (без возврата на login)
onAuthStateChanged(auth, (user) => {
  if (user) {
    login.classList.add("hidden");
    appBox.classList.remove("hidden");

    const letter = user.email?.charAt(0).toUpperCase() || "U";
    profile.innerText = letter;
  } else {
    login.classList.remove("hidden");
    appBox.classList.add("hidden");
  }
});
