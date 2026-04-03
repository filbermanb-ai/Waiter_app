let current = new Date();
let selected = null;

let data = JSON.parse(localStorage.getItem("data") || "{}");

const cal = document.getElementById("calendar");
const title = document.getElementById("monthTitle");

render();

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

/* swipe */
let startX = 0;

document.addEventListener("touchstart", e=>{
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e=>{
  let dx = e.changedTouches[0].clientX - startX;

  if(dx < -60) nextMonth();
  if(dx > 60) prevMonth();
});

function nextMonth(){
  current.setMonth(current.getMonth()+1);
  render();
}

function prevMonth(){
  current.setMonth(current.getMonth()-1);
  render();
}

/* panel */
const panel = document.getElementById("panel");
const overlay = document.getElementById("overlay");

function openDay(key, day){
  selected = key;

  const d = data[key] || {rate:"",rev:"",tips:"",work:false};

  document.getElementById("panelTitle").innerText = `День ${day}`;

  document.getElementById("rate").value = d.rate;
  document.getElementById("rev").value = d.rev;
  document.getElementById("tips").value = d.tips;
  document.getElementById("work").checked = d.work;

  toggleInputs(d.work);

  panel.classList.add("active");
  overlay.classList.add("active");

  setTimeout(updateLive, 50);
}

function closePanel(){
  panel.classList.remove("active");
  overlay.classList.remove("active");
}

function toggleWork(){
  toggleInputs(document.getElementById("work").checked);
}

function toggleInputs(show){
  document.getElementById("inputs").style.display = show ? "block" : "none";
}

function saveDay(){
  const work = document.getElementById("work").checked;

  data[selected] = {
    work,
    rate: work ? +document.getElementById("rate").value || 0 : 0,
    rev: work ? +document.getElementById("rev").value || 0 : 0,
    tips: work ? +document.getElementById("tips").value || 0 : 0
  };

  localStorage.setItem("data", JSON.stringify(data));

  closePanel();
  render();
}

/* 📊 stats */
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

      const salary = (d.rate || 0) + (d.rev || 0)*0.045;
      const tips = d.tips || 0;

      if(dd <= 15){
        s1 += salary;
        t1 += tips;
      } else {
        s2 += salary;
        t2 += tips;
      }

      sT += salary;
      tT += tips;
    }
  });

  document.getElementById("salary1").innerText = Math.round(s1);
  document.getElementById("salary2").innerText = Math.round(s2);
  document.getElementById("salaryTotal").innerText = Math.round(sT);

  document.getElementById("tips1").innerText = Math.round(t1);
  document.getElementById("tips2").innerText = Math.round(t2);
  document.getElementById("tipsTotal").innerText = Math.round(tT);
}

/* 💰 live calc */
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
  const rate = +document.getElementById("rate").value || 0;
  const rev = +document.getElementById("rev").value || 0;
  const tips = +document.getElementById("tips").value || 0;

  const salary = rate + rev * 0.045;

  const salaryEl = document.getElementById("liveSalary");
  const tipsEl = document.getElementById("liveTips");

  const currentSalary = +salaryEl.innerText || 0;
  const currentTips = +tipsEl.innerText || 0;

  animateValue(salaryEl, currentSalary, Math.round(salary));
  animateValue(tipsEl, currentTips, Math.round(tips));
}

["rate","rev","tips"].forEach(id=>{
  document.getElementById(id).addEventListener("input", updateLive);
});