// 🔥 Firebase (НОВЫЙ СИНТАКСИС)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// state
let current = new Date();
let selected = null;
let data = {};

// загрузка
async function loadData(){
  const snapshot = await getDocs(collection(db, "shifts"));

  snapshot.forEach(docSnap=>{
    data[docSnap.id] = docSnap.data();
  });

  render();
}

loadData();

// render
function render(){
  cal.innerHTML = "";

  const y = current.getFullYear();
  const m = current.getMonth();

  title.innerText = current.toLocaleString('ru', {month:'long', year:'numeric'});

  const first = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();

  for(let i=0;i<first;i++){
    cal.innerHTML += `<div></div>`;
  }

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

// свайп
let startX = 0;

document.addEventListener("touchstart", e=>{
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e=>{
  let dx = e.changedTouches[0].clientX - startX;

  if(dx < -60) current.setMonth(current.getMonth()+1);
  if(dx > 60) current.setMonth(current.getMonth()-1);

  render();
});

// панель
window.openDay = function(key, day){
  selected = key;

  const d = data[key] || {
    rate:"",
    rev:"",
    tips:0,
    percent:4.5,
    tipsEnabled:false,
    work:false
  };

  document.getElementById("panelTitle").innerText = `День ${day}`;

  rate.value = d.rate;
  rev.value = d.rev;
  percent.value = d.percent || 4.5;
  tips.value = d.tips || "";

  tipsEnabled.checked = d.tipsEnabled || false;
  work.checked = d.work;

  toggleInputs(d.work);
  toggleTips();

  panel.classList.add("active");
  overlay.classList.add("active");

  setTimeout(updateLive, 50);
}

window.closePanel = function(){
  panel.classList.remove("active");
  overlay.classList.remove("active");
}

window.toggleWork = function(){
  toggleInputs(work.checked);
}

function toggleInputs(show){
  inputs.style.display = show ? "block" : "none";
}

window.toggleTips = function(){
  tipsField.style.display = tipsEnabled.checked ? "block" : "none";
}

// save
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

// stats
function renderStats(){
  const y = current.getFullYear();
  const m = current.getMonth();

  let s1=0, s2=0, sT=0;
  let t1=0, t2=0, tT=0;

  Object.keys(data).forEach(key=>{
    const [yy, mm, dd] = key.split("-").map(Number);

    if(yy===y && mm===m){
      const d = data[key];
      if(!d.work) return;

      const salary = (d.rate || 0) + (d.rev || 0) * ((d.percent || 0)/100);
      const tipsVal = d.tipsEnabled ? (d.tips || 0) : 0;

      if(dd <= 15){
        s1 += salary;
        t1 += tipsVal;
      } else {
        s2 += salary;
        t2 += tipsVal;
      }

      sT += salary;
      tT += tipsVal;
    }
  });

  document.getElementById("salary1").innerText = Math.round(s1);
  document.getElementById("salary2").innerText = Math.round(s2);
  document.getElementById("salaryTotal").innerText = Math.round(sT);

  document.getElementById("tips1").innerText = Math.round(t1);
  document.getElementById("tips2").innerText = Math.round(t2);
  document.getElementById("tipsTotal").innerText = Math.round(tT);
}

// анимация
function animateValue(el, start, end, duration = 300){
  let startTime = null;

  function step(timestamp){
    if(!startTime) startTime = timestamp;
    let progress = timestamp - startTime;
    let percent = Math.min(progress / duration, 1);

    let value = Math.floor(start + (end - start) * percent);
    el.innerText = value;

    if(progress < duration){
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function updateLive(){
  const salary = (+rate.value || 0) + (+rev.value || 0) * ((+percent.value || 0)/100);
  const tipsVal = tipsEnabled.checked ? (+tips.value || 0) : 0;

  animateValue(liveSalary, +liveSalary.innerText || 0, Math.round(salary));
  animateValue(liveTips, +liveTips.innerText || 0, Math.round(tipsVal));
}

["rate","rev","tips","percent"].forEach(id=>{
  document.getElementById(id).addEventListener("input", updateLive);
});