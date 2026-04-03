let current = new Date();
let selected = null;

let data = {};

const cal = document.getElementById("calendar");
const title = document.getElementById("monthTitle");

render();

/* 📅 render */
function render(){
  cal.innerHTML = "";

  const y = current.getFullYear();
  const m = current.getMonth();

  title.innerText = current.toLocaleString('ru', {
    month:'long',
    year:'numeric'
  });

  const first = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();

  for(let i=0;i<first;i++){
    cal.innerHTML += `<div></div>`;
  }

  for(let d=1; d<=days; d++){
    const key = `${y}-${m}-${d}`;
    const isWork = data[key]?.work;

    cal.innerHTML += `
      <div class="day ${isWork ? 'work':''}" onclick="openDay('${key}', ${d})">
        ${d}
      </div>
    `;
  }
}

/* 📱 SWIPE */
let startX = 0;

document.addEventListener("touchstart", e=>{
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e=>{
  let endX = e.changedTouches[0].clientX;

  if(startX - endX > 60){
    nextMonth();
  }

  if(endX - startX > 60){
    prevMonth();
  }
});

/* month change with animation */
function animate(dir, cb){
  cal.classList.add(dir);

  setTimeout(()=>{
    cb();
    render();
    cal.classList.remove(dir);
  },200);
}

function nextMonth(){
  animate("anim-left", ()=>{
    current.setMonth(current.getMonth()+1);
  });
}

function prevMonth(){
  animate("anim-right", ()=>{
    current.setMonth(current.getMonth()-1);
  });
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
}

function closePanel(){
  panel.classList.remove("active");
  overlay.classList.remove("active");
}

/* 🟢 toggle */
function toggleWork(){
  const isWork = document.getElementById("work").checked;
  toggleInputs(isWork);
}

function toggleInputs(show){
  document.getElementById("inputs").style.display = show ? "block" : "none";
}

/* save */
function saveDay(){
  const work = document.getElementById("work").checked;

  data[selected] = {
    work,
    rate: work ? +document.getElementById("rate").value || 0 : 0,
    rev: work ? +document.getElementById("rev").value || 0 : 0,
    tips: work ? +document.getElementById("tips").value || 0 : 0
  };

  closePanel();
  render();
}