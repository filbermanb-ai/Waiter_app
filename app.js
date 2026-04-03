const rate = document.getElementById("rate");
const rev = document.getElementById("rev");
const percent = document.getElementById("percent");
const tips = document.getElementById("tips");

const work = document.getElementById("work");
const tipsEnabled = document.getElementById("tipsEnabled");

const panel = document.getElementById("panel");
const overlay = document.getElementById("overlay");
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhF4IHry3xh-dyv0OUVOTwlZ5KZmqS5WM",
  authDomain: "waiter-bf409.firebaseapp.com",
  projectId: "waiter-bf409",
  storageBucket: "waiter-bf409.firebasestorage.app",
  messagingSenderId: "156879781789",
  appId: "1:156879781789:web:cbc0cf21127516a06d3974",
  measurementId: "G-JHEXQL2R44"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const cal = document.getElementById("calendar");
const title = document.getElementById("monthTitle");

const rate = document.getElementById("rate");
const rev = document.getElementById("rev");
const percent = document.getElementById("percent");
const tips = document.getElementById("tips");

const tipsEnabled = document.getElementById("tipsEnabled");
const tipsField = document.getElementById("tipsField");

const work = document.getElementById("work");
const inputs = document.getElementById("inputs");

const panel = document.getElementById("panel");
const overlay = document.getElementById("overlay");

const liveSalary = document.getElementById("liveSalary");
const liveTips = document.getElementById("liveTips");

let current = new Date();
let selected = null;
let data = {};

async function loadData(){
  const snapshot = await getDocs(collection(db, "shifts"));
  snapshot.forEach(docSnap=>{
    data[docSnap.id] = docSnap.data();
  });
  render();
}

loadData();

function render(){
  cal.innerHTML = "";

  const y = current.getFullYear();
  const m = current.getMonth();

  title.innerText = current.toLocaleString('ru', {month:'long', year:'numeric'});

  const first = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();

  for(let i=0;i<first;i++) cal.innerHTML += `<div></div>`;

  for(let d=1; d<=days; d++){
    const key = `${y}-${m}-${d}`;
    const isWork = data[key]?.work;

    cal.innerHTML += `
      <div class="day ${isWork?'work':''}" onclick="openDay('${key}', ${d})">
        ${d}
      </div>
    `;
  }

  renderStats();
}

window.openDay = function(key, day){
  selected = key;

  const d = data[key] || {percent:4.5};

  document.getElementById("panelTitle").innerText = `День ${day}`;

  rate.value = d.rate || "";
  rev.value = d.rev || "";
  percent.value = d.percent || 4.5;
  tips.value = d.tips || "";

  tipsEnabled.checked = d.tipsEnabled || false;
  work.checked = d.work || false;

  inputs.style.display = work.checked ? "block" : "none";
  tipsField.style.display = tipsEnabled.checked ? "block" : "none";

  panel.classList.add("active");
  overlay.classList.add("active");

  updateLive();
}

window.closePanel = function(){
  panel.classList.remove("active");
  overlay.classList.remove("active");
}

window.toggleWork = function(){
  inputs.style.display = work.checked ? "block" : "none";
}

window.toggleTips = function(){
  tipsField.style.display = tipsEnabled.checked ? "block" : "none";
}

window.saveDay = async function(){
  const obj = {
    work: work.checked,
    rate: +rate.value || 0,
    percent: +percent.value || 0,
    rev: +rev.value || 0,
    tipsEnabled: tipsEnabled.checked,
    tips: tipsEnabled.checked ? (+tips.value || 0) : 0
  };

  data[selected] = obj;

  await setDoc(doc(db, "shifts", selected), obj);

  closePanel();
  render();
}

function renderStats(){
  // можно оставить как было
}

function updateLive(){
  const salary = (+rate.value || 0) + (+rev.value || 0) * ((+percent.value || 0)/100);
  const tipsVal = tipsEnabled.checked ? (+tips.value || 0) : 0;

  liveSalary.innerText = Math.round(salary);
  liveTips.innerText = Math.round(tipsVal);
}

["rate","rev","tips","percent"].forEach(id=>{
  document.getElementById(id).addEventListener("input", updateLive);
});
onAuthStateChanged(auth, async (u) => {
  console.log("auth:", u);

  if (!u) {
    loginScreen.style.display = "flex";
    appDiv.style.display = "none";
    return;
  }

  user = u;

  loginScreen.style.display = "none";
  appDiv.style.display = "block";

  document.getElementById("userEmail").innerText = u.email;

  await load();
});
