import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhF4IHry3xh-dyv0OUVOTwlZ5KZmqS5WM",
  authDomain: "waiter-bf409.firebaseapp.com",
  projectId: "waiter-bf409",
  storageBucket: "waiter-bf409.firebasestorage.app",
  messagingSenderId: "156879781789",
  appId: "1:156879781789:web:cbc0cf21127516a06d3974"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

let user = null;
let data = {};
let selected = null;
let current = new Date();

// UI
const loginScreen = document.getElementById("loginScreen");
const appDiv = document.getElementById("app");

// LOGIN
document.getElementById("loginBtn").onclick = async () => {
  await signInWithPopup(auth, provider);
};

document.getElementById("logoutBtn").onclick = () => signOut(auth);

// AUTH STATE
onAuthStateChanged(auth, async (u) => {
  if (!u) {
    loginScreen.classList.remove("hidden");
    appDiv.classList.add("hidden");
    return;
  }

  user = u;
  document.getElementById("userEmail").innerText = u.email;

  loginScreen.classList.add("hidden");
  appDiv.classList.remove("hidden");

  await load();
});

// LOAD
async function load() {
  const snap = await getDocs(collection(db, `users/${user.uid}/shifts`));
  snap.forEach(d => data[d.id] = d.data());
  render();
}

// SAVE
async function saveDay() {
  const obj = {
    work: work.checked,
    rate: +rate.value || 0,
    rev: +rev.value || 0,
    percent: +percent.value || 4.5,
    tipsEnabled: tipsEnabled.checked,
    tips: tipsEnabled.checked ? (+tips.value || 0) : 0
  };

  data[selected] = obj;

  await setDoc(doc(db, `users/${user.uid}/shifts`, selected), obj);

  closePanel();
  render();
}

// CALC
function calc() {
  let s1 = 0, s2 = 0, t1 = 0, t2 = 0;

  const y = current.getFullYear();
  const m = current.getMonth();

  for (let k in data) {
    const [yy, mm, dd] = k.split("-").map(Number);

    if (yy === y && mm === m && data[k].work) {
      const d = data[k];

      const salary = (d.rate || 0) + (d.rev || 0) * (d.percent / 100);
      const tips = d.tipsEnabled ? (d.tips || 0) : 0;

      if (dd <= 15) { s1 += salary; t1 += tips; }
      else { s2 += salary; t2 += tips; }
    }
  }

  salary1.textContent = Math.round(s1);
  salary2.textContent = Math.round(s2);
  salaryT.textContent = Math.round(s1 + s2);

  tips1.textContent = Math.round(t1);
  tips2.textContent = Math.round(t2);
  tipsT.textContent = Math.round(t1 + t2);
}

// SWIPE + RENDER (упрощённо)
function render() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const y = current.getFullYear();
  const m = current.getMonth();

  const days = new Date(y, m + 1, 0).getDate();

  for (let d = 1; d <= days; d++) {
    const key = `${y}-${m}-${d}`;

    const div = document.createElement("div");
    div.className = "day" + (data[key]?.work ? " work" : "");
    div.innerText = d;

    div.onclick = () => openDay(key, d);

    cal.appendChild(div);
  }

  calc();
}

// OPEN PANEL
function openDay(key, d) {
  selected = key;
  panel.classList.add("active");
  overlay.classList.add("active");

  const v = data[key] || {};

  rate.value = v.rate || "";
  rev.value = v.rev || "";
  percent.value = v.percent || 4.5;
  tips.value = v.tips || "";

  work.checked = v.work || false;
  tipsEnabled.checked = v.tipsEnabled || false;
}

function closePanel() {
  panel.classList.remove("active");
  overlay.classList.remove("active");
}

// LIVE CALC
["rate", "rev", "percent", "tips"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateLive);
});

function updateLive() {
  const salary =
    (+rate.value || 0) +
    (+rev.value || 0) * ((+percent.value || 0) / 100);

  const tipsVal = tipsEnabled.checked ? (+tips.value || 0) : 0;

  liveSalary.textContent = Math.round(salary);
  liveTips.textContent = Math.round(tipsVal);
}

// EVENTS
document.getElementById("saveBtn").onclick = saveDay;
overlay.onclick = closePanel;

// expose
window.openDay = openDay;
window.closePanel = closePanel;