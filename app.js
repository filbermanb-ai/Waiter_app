import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDhF4IHry3xh-dyv0OUVOTwlZ5KKmqS5WM",
  authDomain: "waiter-bf409.firebaseapp.com",
  projectId: "waiter-bf409",
  storageBucket: "waiter-bf409.firebasestorage.app",
  messagingSenderId: "156879781789",
  appId: "1:156879781789:web:cbc0cf21127516a06d3974",
  measurementId: "G-JHEXQL2R44"
};

// init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
await setPersistence(auth, browserLocalPersistence);

// state
let data = {};
let current = new Date();
let user = null;
const root = document.getElementById("app");

// -------------------- LOAD DATA --------------------
async function loadData() {
  const snapshot = await getDocs(collection(db, "shifts"));
  snapshot.forEach(docSnap => {
    data[docSnap.id] = docSnap.data();
  });
}

// -------------------- RENDER --------------------
function render() {
  if (!user) {
    renderLogin();
    return;
  }

  const letter = user.email?.charAt(0).toUpperCase() || "U";

  const y = current.getFullYear();
  const m = current.getMonth();
  const days = new Date(y, m + 1, 0).getDate();

  let html = `<div>
    <div class="profile">${letter}</div>
    <h2>Календарь</h2>
    <p>${current.toLocaleString('ru',{month:'long',year:'numeric'})}</p>
  `;

  for (let d = 1; d <= days; d++) {
    const key = `${y}-${m}-${d}`;
    const isWork = data[key]?.work;

    html += `<div class="day ${isWork?'work':''}" onclick="openDay('${key}',${d})">
      День ${d}
    </div>`;
  }

  html += `</div>`;
  root.innerHTML = html;
}

// -------------------- LOGIN --------------------
function renderLogin() {
  root.innerHTML = `<div style="padding:20px">
    <h2>Вход</h2>
    <button id="loginBtn">Войти через Google</button>
  </div>`;

  document.getElementById("loginBtn").onclick = async () => {
    try {
      await signInWithPopup(auth, provider);
      user = auth.currentUser;
      await loadData();
      render();
    } catch (e) {
      console.log("Login error:", e);
    }
  };
}

// -------------------- AUTH STATE --------------------
onAuthStateChanged(auth, async u => {
  user = u;
  if(user) await loadData();
  render();
});

// -------------------- OPEN DAY --------------------
window.openDay = function(key, day) {
  alert(`День ${day} открыт`);
};
