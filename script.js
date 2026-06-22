// ── CURSOR ──
const cursor=document.getElementById('cursor'),trail=document.getElementById('cursor-trail');
document.addEventListener('mousemove',e=>{
  cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';
  setTimeout(()=>{trail.style.left=e.clientX+'px';trail.style.top=e.clientY+'px';},80);
});

// ── STARS ──
const canvas=document.getElementById('stars-canvas'),ctx=canvas.getContext('2d');
let stars=[];
function initStars(){
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;stars=[];
  for(let i=0;i<220;i++)stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.3+0.2,a:Math.random(),speed:Math.random()*0.003+0.001,phase:Math.random()*Math.PI*2});
}
function drawStars(t){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{s.a=0.25+0.45*Math.sin(t*s.speed+s.phase);ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(196,168,240,${s.a})`;ctx.fill();});
  requestAnimationFrame(drawStars);
}
initStars();requestAnimationFrame(drawStars);
window.addEventListener('resize',initStars);

// ── COPY IP ──
function copyIP(){
  navigator.clipboard.writeText('duskveilsmp.my.id').then(()=>{
    const t=document.getElementById('toast');t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2000);
  });
}

// ── SERVER STATUS ──
async function loadServerStatus(){
  try{
    const r=await fetch('https://api.mcsrvstat.us/3/duskveilsmp.my.id:25410');
    const d=await r.json();
    const dot=document.getElementById('status-dot'),st=document.getElementById('status-text');
    if(d.online){
      document.getElementById('stat-players').textContent=d.players?.online??0;
      document.getElementById('stat-max').textContent=d.players?.max??'—';
      document.getElementById('stat-version').textContent=d.version??'—';
      document.getElementById('stat-latency').textContent=d.debug?.ping??'—';
      dot.classList.remove('offline');st.textContent='Online';st.style.color='#4ce87b';
    }else{
      dot.classList.add('offline');st.textContent='Offline';st.style.color='#e84c4c';
      ['stat-players','stat-max','stat-version','stat-latency'].forEach(id=>document.getElementById(id).textContent='—');
    }
  }catch(e){document.getElementById('status-text').textContent='Gagal terhubung';}
}

// ── JSONBIN CONFIG ──
const BIN_ID='656171b9fc254dc08ac74d6adb744a71'; 
const API_KEY='$2a$10$Qxdf2gFdu/0D/DfUS4cCguFBz1xFE86PN6HX8xoMjb6J/05NjnTg2';
const BIN_URL=`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

// ── LEADERBOARD RENDER ──
function rankClass(i){return['r1','r2','r3','other','other'][i]||'other';}
function rankLabel(i){return['#1','#2','#3','#4','#5'][i]||`#${i+1}`;}

function renderLB(containerId,data){
  const el=document.getElementById(containerId);
  if(!data||data.length===0){el.innerHTML='<div class="lb-empty">Belum ada data</div>';return;}
  el.innerHTML=data.map((p,i)=>`
    <div class="lb-item">
      <span class="lb-rank ${rankClass(i)}">${rankLabel(i)}</span>
      <div class="lb-avatar">
        <img src="https://mc-heads.net/avatar/${encodeURIComponent(p.name)}/32" onerror="this.style.display='none';this.parentElement.textContent='⚔'"/>
      </div>
      <div class="lb-info">
        <div class="lb-name ${i===0?'champion':''}">${p.name}${i===0?' 👑':''}</div>
      </div>
      <div class="lb-value">${p.value}</div>
    </div>
  `).join('');
}

function renderBest(data){
  const card=document.getElementById('best-card');
  if(!data||data.length===0){card.innerHTML='<div class="best-glow"></div><div class="best-empty">Belum ada data champion</div>';return;}
  const p=data[0];
  card.innerHTML=`
    <div class="best-glow"></div>
    <div class="best-crown">👑</div>
    <div class="best-avatar">
      <img src="https://mc-heads.net/avatar/${encodeURIComponent(p.name)}/76" onerror="this.style.display='none';this.parentElement.textContent='⚔'"/>
    </div>
    <div class="best-name">${p.name}</div>
    <div class="best-title-label">✦ &nbsp; Warrior Terbaik DuskVeil &nbsp; ✦</div>
    <div class="best-stats">
      <div class="best-stat-item">
        <div class="best-stat-val">${p.kills??'—'}</div>
        <div class="best-stat-lbl">Kill</div>
      </div>
      <div class="best-stat-item">
        <div class="best-stat-val">${p.playtime??'—'}</div>
        <div class="best-stat-lbl">Playtime</div>
      </div>
      <div class="best-stat-item">
        <div class="best-stat-val">#1</div>
        <div class="best-stat-lbl">Rank</div>
      </div>
    </div>
  `;
}

async function loadLeaderboards(manual=false){
  if(manual){
    ['lb-playtime','lb-kills','lb-deaths'].forEach(id=>{
      document.getElementById(id).innerHTML='<div class="lb-loading">Memuat...</div>';
    });
  }
  try{
    const r=await fetch(BIN_URL,{headers:{'X-Master-Key':API_KEY,'X-Bin-Meta':false}});
    const d=await r.json();
    const rec=d.record??d;
    renderLB('lb-playtime',rec.playtime||[]);
    renderLB('lb-kills',rec.kills||[]);
    renderLB('lb-deaths',rec.deaths||[]);
    // Best player = #1 kills dengan tambahan data
    const best=rec.kills&&rec.kills[0]?[{
      name:rec.kills[0].name,
      kills:rec.kills[0].value,
      playtime:rec.playtime&&rec.playtime[0]&&rec.playtime[0].name===rec.kills[0].name?rec.playtime[0].value:'—'
    }]:[];
    renderBest(best);
    const now=new Date();
    document.getElementById('last-updated').textContent=`Terakhir diperbarui: ${now.toLocaleTimeString('id-ID')}`;
  }catch(e){
    ['lb-playtime','lb-kills','lb-deaths'].forEach(id=>{
      document.getElementById(id).innerHTML='<div class="lb-empty">Gagal memuat data dari JSONBin</div>';
    });
  }
}

// ── INIT ──
loadServerStatus();
loadLeaderboards();
setInterval(loadServerStatus,30000);
setInterval(()=>loadLeaderboards(),60000);
