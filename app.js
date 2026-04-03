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

let user=null;
let data={};
let selected=null;
let date=new Date();

// UI
const login=document.getElementById("login");
const appDiv=document.getElementById("app");

document.getElementById("loginBtn").onclick=()=>signInWithPopup(auth,provider);
document.getElementById("logoutBtn").onclick=()=>signOut(auth);

// AUTH
onAuthStateChanged(auth,async u=>{
  if(!u){
    login.classList.remove("hidden");
    appDiv.classList.add("hidden");
    return;
  }

  user=u;
  login.classList.add("hidden");
  appDiv.classList.remove("hidden");

  document.getElementById("userEmail").innerText=u.email;

  await load();
});

// LOAD
async function load(){
  const snap=await getDocs(collection(db,`users/${user.uid}/shifts`));
  snap.forEach(d=>data[d.id]=d.data());
  render();
}

// SAVE
async function save(){
  const obj={
    work:work.checked,
    rate:+rate.value||0,
    rev:+rev.value||0,
    percent:+percent.value||4.5,
    tipsEnabled:tipsEnabled.checked,
    tips:tipsEnabled.checked?(+tips.value||0):0
  };

  data[selected]=obj;

  await setDoc(doc(db,`users/${user.uid}/shifts`,selected),obj);

  close();
  render();
}

// RENDER
function render(){
  const cal=document.getElementById("calendar");
  cal.innerHTML="";

  const y=date.getFullYear();
  const m=date.getMonth();
  const days=new Date(y,m+1,0).getDate();

  for(let d=1;d<=days;d++){
    const key=`${y}-${m}-${d}`;

    const div=document.createElement("div");
    div.className="day"+(data[key]?.work?" work":"");
    div.innerText=d;

    div.onclick=()=>open(key,d);

    cal.appendChild(div);
  }

  calc();
}

// OPEN
function open(key,d){
  selected=key;
  panel.classList.add("active");
  overlay.classList.add("active");

  const v=data[key]||{};

  rate.value=v.rate||"";
  rev.value=v.rev||"";
  percent.value=v.percent||4.5;
  tips.value=v.tips||"";

  work.checked=v.work||false;
  tipsEnabled.checked=v.tipsEnabled||false;
}

// CLOSE
function close(){
  panel.classList.remove("active");
  overlay.classList.remove("active");
}

overlay.onclick=close;

// CALC
function calc(){
  let s1=0,s2=0,t1=0,t2=0;

  const y=date.getFullYear();
  const m=date.getMonth();

  for(let k in data){
    const [yy,mm,dd]=k.split("-").map(Number);

    if(yy===y&&mm===m&&data[k].work){

      const d=data[k];
      const salary=(d.rate||0)+(d.rev||0)*(d.percent/100);
      const tips=d.tipsEnabled?(d.tips||0):0;

      if(dd<=15){s1+=salary;t1+=tips;}
      else{s2+=salary;t2+=tips;}
    }
  }

  s1El.textContent=Math.round(s1);
  s2El.textContent=Math.round(s2);
  stEl.textContent=Math.round(s1+s2);

  t1El.textContent=Math.round(t1);
  t2El.textContent=Math.round(t2);
  ttEl.textContent=Math.round(t1+t2);
}

// LIVE
["rate","rev","percent","tips"].forEach(id=>{
  document.getElementById(id).addEventListener("input",()=>{
    const salary=(+rate.value||0)+(+rev.value||0)*(+percent.value||0)/100;
    liveSalary.textContent=Math.round(salary);
    liveTips.textContent=Math.round(tipsEnabled.checked?(+tips.value||0):0);
  });
});

// SWIPE
let x=0;
document.addEventListener("touchstart",e=>x=e.touches[0].clientX);
document.addEventListener("touchend",e=>{
  let dx=e.changedTouches[0].clientX-x;

  if(dx>50) date.setMonth(date.getMonth()-1);
  if(dx<-50) date.setMonth(date.getMonth()+1);

  render();
});

// SAVE BTN
document.getElementById("save").onclick=save;

// ELEMENTS
const work=document.getElementById("work");
const rate=document.getElementById("rate");
const rev=document.getElementById("rev");
const percent=document.getElementById("percent");
const tips=document.getElementById("tips");
const tipsEnabled=document.getElementById("tipsEnabled");

const panel=document.getElementById("panel");
const overlay=document.getElementById("overlay");

const s1El=document.getElementById("s1");
const s2El=document.getElementById("s2");
const stEl=document.getElementById("st");

const t1El=document.getElementById("t1");
const t2El=document.getElementById("t2");
const ttEl=document.getElementById("tt");

const liveSalary=document.getElementById("liveSalary");
const liveTips=document.getElementById("liveTips");
