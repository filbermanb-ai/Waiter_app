
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhF4IHry3xh-dyv0OUVOTwlZ5KZmqS5WM",
  authDomain: "waiter-bf409.firebaseapp.com",
  projectId: "waiter-bf409",
  storageBucket: "waiter-bf409.firebasestorage.app",
  messagingSenderId: "156879781789",
  appId: "1:156879781789:web:cbc0cf21127516a06d3974"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let user = null;
let data = {};
let selected = null;
let date = new Date();

/* 🔥 FIX 1: кнопка всегда кликается */
document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.log("login error", e);
  }
});

/* 🔥 FIX 2: защита от "ложного logout" */
let authReady = false;

onAuthStateChanged(auth, async u => {

  if (!authReady) {
    authReady = true;
  }

  if (!u) {
    document.getElementById("login").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
    return;
  }

  user = u;

  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("userEmail").innerText = u.email;

  showProfile(u);

  await load();
});

/* PROFILE */
function showProfile(u){
  const div=document.getElementById("profile");

  if(u.photoURL){
    div.innerHTML=`<img src="${u.photoURL}">`;
  }else{
    div.innerHTML="👤";
  }
}

/* LOAD */
async function load(){
  const snap = await getDocs(collection(db,`users/${user.uid}/shifts`));

  data = {};

  snap.forEach(d => {
    data[d.id] = d.data();
  });

  render();
}

/* SAVE */
document.getElementById("save").onclick = async () => {

  const obj = {
    rate: +rate.value || 0,
    rev: +rev.value || 0,
    percent: +percent.value || 4.5,
    work: work.checked
  };

  data[selected] = obj;

  await setDoc(doc(db,`users/${user.uid}/shifts`,selected), obj);

  close();
  render();
};

/* RENDER */
function render(){
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const y = date.getFullYear();
  const m = date.getMonth();
  const days = new Date(y,m+1,0).getDate();

  for(let d=1; d<=days; d++){

    const key = `${y}-${m}-${d}`;

    const div = document.createElement("div");
    div.className = "day" + (data[key]?.work ? " work" : "");
    div.innerText = d;

    div.onclick = () => open(key);

    cal.appendChild(div);
  }

  calc();
}

/* OPEN */
function open(key){
  selected = key;

  panel.classList.add("active");
  overlay.classList.add("active");

  const v = data[key] || {};

  rate.value = v.rate || "";
  rev.value = v.rev || "";
  percent.value = v.percent || 4.5;
  work.checked = v.work || false;
}

function close(){
  panel.classList.remove("active");
  overlay.classList.remove("active");
}

overlay.onclick = close;

/* CALC */
function calc(){
  let s1=0, s2=0;

  const y=date.getFullYear();
  const m=date.getMonth();

  for(let k in data){

    const [yy,mm,dd] = k.split("-").map(Number);

    if(yy===y && mm===m && data[k].work){

      const d=data[k];
      const salary = (d.rate||0) + (d.rev||0)*(d.percent/100);

      if(dd<=15) s1 += salary;
      else s2 += salary;
    }
  }

  s1El.textContent = Math.round(s1);
  s2El.textContent = Math.round(s2);
  stEl.textContent = Math.round(s1+s2);
}

/* ELEMENTS */
const rate=document.getElementById("rate");
const rev=document.getElementById("rev");
const percent=document.getElementById("percent");
const work=document.getElementById("work");

const panel=document.getElementById("panel");
const overlay=document.getElementById("overlay");

const s1El=document.getElementById("s1");
const s2El=document.getElementById("s2");
const stEl=document.getElementById("st");

/* SWIPE MONTH */
let startX=0;

document.addEventListener("touchstart",e=>{
  startX=e.touches[0].clientX;
});

document.addEventListener("touchend",e=>{
  let dx=e.changedTouches[0].clientX - startX;

  if(dx>50) date.setMonth(date.getMonth()-1);
  if(dx<-50) date.setMonth(date.getMonth()+1);

  render();
});
