import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDhF4IHry3xh-dyv0OUVOTwlZ5KZmqS5WM",
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

// UI
const login = document.getElementById("login");
const appDiv = document.getElementById("app");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userText = document.getElementById("user");

// LOGIN
loginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Ошибка: " + e.message);
  }
};

// LOGOUT
logoutBtn.onclick = async () => {
  await signOut(auth);
};

// AUTH STATE
onAuthStateChanged(auth, (user) => {

  if (!user) {
    login.classList.remove("hidden");
    appDiv.classList.add("hidden");
    return;
  }

  login.classList.add("hidden");
  appDiv.classList.remove("hidden");

  userText.innerText = user.email;
});
