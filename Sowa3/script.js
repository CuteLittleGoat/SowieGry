const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const stageValue = document.getElementById("stageValue");
const scoreValue = document.getElementById("scoreValue");
const livesValue = document.getElementById("livesValue");

const STAGES = [
  { name: "Supermarket", short: "Market", sky: ["#dff6ff", "#fff8df"], floor: "#d7e3ef", accent: "#ff5e70", length: 980 },
  { name: "Wystawa kwiatów ozdobnych", short: "Kwiaty", sky: ["#ffe6f3", "#e9fff2"], floor: "#d7f0da", accent: "#7ccf72", length: 1080 },
  { name: "Blokowisko PRL", short: "PRL", sky: ["#d9e4ef", "#f5f1df"], floor: "#d6d0c6", accent: "#d65f46", length: 1160 },
];

const state = {
  mode: "title",
  w: 0, h: 0, dpr: 1,
  lane: 0, targetLane: 0,
  stage: 0, distance: 0, score: 0, lives: 3,
  best: Number(localStorage.getItem("sowa3Best") || 0),
  speed: 0.34, spawn: 0, time: 0, inv: 0, shake: 0,
  message: "", messageUntil: 0, finishTimer: 0,
};

const objects = [];
const particles = [];
let pointerStart = null;
let last = 0;

const rand = (a,b)=>Math.random()*(b-a)+a;
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const now = ()=>performance.now();

function resize(){
  state.w = window.innerWidth; state.h = window.innerHeight; state.dpr = Math.min(window.devicePixelRatio||1, 2.5);
  canvas.width = Math.floor(state.w * state.dpr); canvas.height = Math.floor(state.h * state.dpr);
  canvas.style.width = `${state.w}px`; canvas.style.height = `${state.h}px`;
  ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
}

function startGame(){
  state.mode="run"; state.stage=0; state.distance=0; state.score=0; state.lives=3; state.lane=0; state.targetLane=0;
  state.speed=.34; state.spawn=0; state.inv=1200; objects.length=0; particles.length=0;
  say("Sowa3: trzy tory, biegnij wgłąb!", 1600); updateHud();
}
function nextStage(){
  state.stage = (state.stage + 1) % STAGES.length; state.distance = 0; state.speed += .035; state.lane=0; state.targetLane=0;
  objects.length=0; state.spawn=450; state.inv=1300; say(`Plansza: ${STAGES[state.stage].name}`, 1700); updateHud();
}
function gameOver(){
  state.mode="over"; state.best = Math.max(state.best, Math.floor(state.score)); localStorage.setItem("sowa3Best", state.best);
}
function say(text, ms){ state.message=text; state.messageUntil=now()+ms; }

function laneX(lane, z){
  const p = 1 - z;
  const spread = state.w * (0.16 + p * 0.16);
  return state.w/2 + lane * spread;
}
function roadY(z){
  const horizon = state.h * 0.23;
  const p = Math.pow(1 - z, 1.55);
  return horizon + p * (state.h - horizon - 78);
}
function scaleAt(z){ return 0.22 + Math.pow(1-z, 1.25) * 1.35; }

function spawnObject(){
  const stage = state.stage;
  const lane = [-1,0,1][Math.floor(rand(0,3))];
  const r = Math.random();
  let type="leaf";
  if(r<.26) type="leaf";
  else if(r<.46) type="amic";
  else if(r<.68) type="shift";
  else if(r<.86) type="magda";
  else type="cart";
  if(stage===1 && Math.random()<.24) type="pot";
  if(stage===2 && Math.random()<.24) type="block";
  objects.push({type,lane,z:1.08,hit:false,phase:rand(0,Math.PI*2)});
}

function update(dt){
  if(state.mode!=="run") return;
  state.time += dt; state.distance += state.speed * dt * 0.085; state.score += dt * .012;
  state.speed = Math.min(.74, state.speed + dt * 0.000006);
  if(state.inv>0) state.inv -= dt;
  state.lane += (state.targetLane - state.lane) * Math.min(1, dt * .018);
  state.spawn -= dt;
  if(state.spawn<=0){ spawnObject(); state.spawn = rand(430, 780) * Math.max(.66, 1-state.distance/2400); }

  for(let i=objects.length-1;i>=0;i--){
    const o=objects[i]; o.z -= state.speed * dt * .001;
    if(o.z < .12 && !o.hit){
      const sameLane = Math.round(state.lane) === o.lane;
      if(sameLane){
        if(o.type==="leaf"){ state.score += 50; burst(laneX(o.lane,o.z), roadY(o.z), "+50", "#2d9c55"); o.hit=true; }
        else damage(labelFor(o.type));
      }
    }
    if(o.z < -.08 || o.hit) objects.splice(i,1);
  }
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.y+=p.vy*dt*.06; p.life-=dt; if(p.life<=0) particles.splice(i,1); }
  if(state.distance >= STAGES[state.stage].length && state.mode==="run"){
    state.mode="finish"; state.finishTimer=2600; state.score += 250; say("Ogród działkowy! +250", 1800);
  }
  updateHud();
}

function updateFinish(dt){
  if(state.mode!=="finish") return;
  state.finishTimer -= dt;
  if(state.finishTimer<=0){ state.mode="run"; nextStage(); }
}
function damage(reason){
  if(state.inv>0 || state.mode!=="run") return;
  state.lives--; state.inv=1500; state.shake=13; say(reason, 1200); burst(state.w/2, state.h*.70, "-1", "#d93343");
  if(state.lives<=0) gameOver();
}
function labelFor(t){
  return t==="amic"?"Stacja Amic blokuje tor!":t==="shift"?"Przyjmiesz zmianę? Nie!":t==="magda"?"Telefon od Magdy!":t==="pot"?"Donica na torze!":t==="block"?"Betonowy słupek!":"Przeszkoda!";
}
function burst(x,y,text,color){ particles.push({x,y,text,color,life:720,vy:-1.8}); }
function updateHud(){ stageValue.textContent=`${state.stage+1}: ${STAGES[state.stage].short}`; scoreValue.textContent=Math.floor(state.score); livesValue.textContent=state.lives; }

function draw(){
  ctx.save(); ctx.clearRect(0,0,state.w,state.h);
  if(state.shake>0){ ctx.translate(rand(-state.shake,state.shake),rand(-state.shake,state.shake)); state.shake*=.86; if(state.shake<.3)state.shake=0; }
  drawScene();
  if(state.mode==="finish") drawAllotment();
  drawObjects(); drawOwl(); drawParticles(); drawOverlay();
  ctx.restore();
}
function drawScene(){
  const st=STAGES[state.stage]; const g=ctx.createLinearGradient(0,0,0,state.h); g.addColorStop(0,st.sky[0]); g.addColorStop(1,st.sky[1]); ctx.fillStyle=g; ctx.fillRect(0,0,state.w,state.h);
  const horizon=state.h*.23; ctx.fillStyle="rgba(255,255,255,.55)"; ctx.fillRect(0,horizon-2,state.w,4);
  drawStageDecor(st);
  const bottom=state.h-48, leftTop=state.w*.43, rightTop=state.w*.57, leftBottom=state.w*.07, rightBottom=state.w*.93;
  ctx.fillStyle=st.floor; path([[leftTop,horizon],[rightTop,horizon],[rightBottom,bottom],[leftBottom,bottom]],true);
  ctx.strokeStyle="rgba(255,255,255,.75)"; ctx.lineWidth=2;
  [-.5,.5].forEach(l=>{ctx.beginPath();ctx.moveTo(laneX(l,horizon/state.h),horizon);ctx.lineTo(state.w/2+l*state.w*.32,bottom);ctx.stroke();});
  ctx.strokeStyle="rgba(40,40,50,.12)"; for(let i=0;i<8;i++){let z=(i/8+(state.time*.00012)%1)%1,y=roadY(z);ctx.beginPath();ctx.moveTo(state.w*.16,y);ctx.lineTo(state.w*.84,y);ctx.stroke();}
}
function drawStageDecor(st){
  const h=state.h,w=state.w;
  if(state.stage===0){
    for(let i=0;i<5;i++){ctx.fillStyle=i%2?"#ffd76a":"#8ed0ff";ctx.fillRect(i*w/5, h*.25, w/7, h*.22); ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillRect(i*w/5+8,h*.27,w/9,12);}
    ctx.fillStyle="#ff5e70"; ctx.font=`bold ${18*unit()}px sans-serif`; ctx.textAlign="center"; ctx.fillText("PROMO", w*.5, h*.19);
  } else if(state.stage===1){
    for(let i=0;i<9;i++){drawPlant(rand(i*w/9,(i+1)*w/9), h*.33+Math.sin(i)*18, .65+Math.sin(i*2)*.1)}
    ctx.fillStyle="rgba(255,255,255,.72)"; round(w*.32,h*.13,w*.36,40,18,true); ctx.fillStyle="#348b4d"; ctx.font=`bold ${16*unit()}px sans-serif`; ctx.textAlign="center"; ctx.fillText("WYSTAWA KWIATÓW",w*.5,h*.155);
  } else {
    for(let i=0;i<6;i++){let x=i*w/6;ctx.fillStyle=i%2?"#b8b4aa":"#c7c1b5";ctx.fillRect(x,h*.18,w*.13,h*.28);ctx.fillStyle="#f4e6aa";for(let r=0;r<4;r++)for(let c=0;c<2;c++)ctx.fillRect(x+16+c*w*.045,h*.205+r*h*.055,18,14)}
    ctx.fillStyle="#6b737c"; ctx.font=`bold ${15*unit()}px sans-serif`; ctx.textAlign="center"; ctx.fillText("OSIEDLE PRL", w*.5, h*.16);
  }
}
function drawAllotment(){
  const y=state.h*.24; ctx.fillStyle="rgba(110,210,120,.78)"; ctx.fillRect(0,y,state.w,state.h-y); ctx.fillStyle="#4aae62"; for(let i=0;i<12;i++)drawPlant(i*state.w/11,y+50+Math.sin(i)*14,.8);
  ctx.fillStyle="#67c7ff"; ctx.strokeStyle="#fff"; ctx.lineWidth=5; ctx.beginPath(); ctx.ellipse(state.w*.52,state.h*.68,state.w*.23,state.h*.075,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,.82)"; round(state.w*.22,state.h*.33,state.w*.56,64,24,true); ctx.fillStyle="#2b2733"; ctx.textAlign="center"; ctx.font=`bold ${24*unit()}px sans-serif`; ctx.fillText("Meta: ogród działkowy z basenem!", state.w*.5, state.h*.365);
}
function drawObjects(){
  const list=[...objects].sort((a,b)=>b.z-a.z);
  for(const o of list){const x=laneX(o.lane,o.z),y=roadY(o.z),sc=scaleAt(o.z); if(o.type==="leaf")drawLeaf(x,y,sc); else if(o.type==="amic")drawAmic(x,y,sc); else if(o.type==="shift")drawPhone(x,y,sc,"przyjmiesz\nzmianę?","#222"); else if(o.type==="magda")drawPhone(x,y,sc,"telefon\nod Magdy","#d93875"); else if(o.type==="pot")drawPot(x,y,sc); else if(o.type==="block")drawBlock(x,y,sc); else drawCart(x,y,sc);}
}
function drawOwl(){
  const x=laneX(state.lane,0), y=state.h*.78, sc=1.05+Math.sin(state.time*.018)*.03; if(state.inv>0&&Math.floor(state.time/90)%2===0)return;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle="rgba(0,0,0,.22)";ctx.beginPath();ctx.ellipse(0,44,44,9,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#9b6a45";wing(-26,0,-.35-Math.sin(state.time*.02)*.22);wing(26,0,.35+Math.sin(state.time*.02)*.22);ctx.fillStyle="#b77b50";ellipse(0,0,58,70);ctx.fillStyle="#f0dfc7";ellipse(0,12,38,44);ctx.fillStyle="#ded0bf";ellipse(-15,-11,24,24);ellipse(15,-11,24,24);ctx.fillStyle="#fff";ellipse(-15,-12,15,15);ellipse(15,-12,15,15);ctx.fillStyle="#222";ellipse(-15,-12,5,5);ellipse(15,-12,5,5);ctx.fillStyle="#f6c74a";tri(0,-1,-7,9,7,9);ctx.restore();
}
function drawLeaf(x,y,sc){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle="rgba(255,255,255,.45)";ellipse(0,0,46,34);ctx.fillStyle="#2fae62";ctx.beginPath();ctx.moveTo(0,-28);ctx.bezierCurveTo(28,-30,34,-6,22,14);ctx.bezierCurveTo(12,32,-12,32,-22,14);ctx.bezierCurveTo(-34,-6,-28,-30,0,-28);ctx.fill();ctx.strokeStyle="#14703d";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,28);ctx.moveTo(0,-6);ctx.lineTo(-16,4);ctx.moveTo(0,-6);ctx.lineTo(16,4);ctx.stroke();ctx.restore();}
function drawAmic(x,y,sc){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle="rgba(0,0,0,.25)";ellipse(0,42,76,12);ctx.fillStyle="#fff";round(-42,-38,84,74,10,true);ctx.fillStyle="#ef4655";round(-50,-48,100,20,10,true);round(-29,-14,58,28,7,true);ctx.fillStyle="#fff";ctx.font="bold 17px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("Amic",0,1);ctx.restore();}
function drawPhone(x,y,sc,text,color){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle="rgba(0,0,0,.25)";ellipse(0,45,60,10);ctx.fillStyle=color;round(-32,-50,64,92,12,true);ctx.fillStyle="#eaf8ff";round(-24,-38,48,64,7,true);ctx.fillStyle=color==="#222"?"#222":"#b71954";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";text.split("\n").forEach((line,i)=>ctx.fillText(line,0,-12+i*15));ctx.restore();}
function drawCart(x,y,sc){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.strokeStyle="#5f7385";ctx.lineWidth=5;ctx.strokeRect(-34,-26,68,44);ctx.beginPath();ctx.moveTo(-44,-35);ctx.lineTo(-34,-26);ctx.stroke();ctx.fillStyle="#333";ellipse(-22,25,10,10);ellipse(24,25,10,10);ctx.restore();}
function drawPot(x,y,sc){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle="#a35f42";round(-30,-4,60,44,8,true);ctx.fillStyle="#2fae62";for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(i*10,-22-Math.abs(i)*4,14,28,i*.4,0,Math.PI*2);ctx.fill()}ctx.restore();}
function drawBlock(x,y,sc){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle="#aaa59c";round(-32,-44,64,86,6,true);ctx.fillStyle="#f2df8a";for(let r=0;r<3;r++)for(let c=0;c<2;c++)ctx.fillRect(-20+c*24,-31+r*22,12,12);ctx.restore();}
function drawPlant(x,y,sc){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle="#7a4b36";round(-10,14,20,18,4,true);ctx.fillStyle="#2da85e";ellipse(-10,4,22,34);ellipse(10,2,22,34);ellipse(0,-10,24,36);ctx.restore();}
function drawParticles(){for(const p of particles){ctx.save();ctx.globalAlpha=clamp(p.life/720,0,1);ctx.fillStyle=p.color;ctx.textAlign="center";ctx.font=`bold ${22*unit()}px sans-serif`;ctx.fillText(p.text,p.x,p.y);ctx.restore();}}
function drawOverlay(){
  if(state.message&&now()<state.messageUntil){ctx.fillStyle="rgba(255,255,255,.82)";round(state.w/2-170,state.h*.12,340,42,18,true);ctx.fillStyle="#2b2733";ctx.textAlign="center";ctx.font=`bold ${17*unit()}px sans-serif`;ctx.fillText(state.message,state.w/2,state.h*.12+26);}
  if(state.mode==="title"||state.mode==="over"){ctx.fillStyle="rgba(255,255,255,.82)";ctx.fillRect(0,0,state.w,state.h);ctx.fillStyle="#2b2733";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`900 ${46*unit()}px sans-serif`;ctx.fillText("Sowa3",state.w/2,state.h*.27);ctx.font=`${17*unit()}px sans-serif`;ctx.fillText("Biegnij wgłąb ekranu, zmieniaj 3 tory i uciekaj przed zmianami.",state.w/2,state.h*.36);ctx.font=`bold ${19*unit()}px sans-serif`;ctx.fillText(state.mode==="over"?`Wynik: ${Math.floor(state.score)} • Rekord: ${state.best}`:"Tap / klik / spacja — start",state.w/2,state.h*.48);ctx.font=`${14*unit()}px sans-serif`;ctx.fillText("Przeszkody: Amic, smartfony „przyjmiesz zmianę?”, telefon od Magdy.",state.w/2,state.h*.57);ctx.fillText("Plansze: supermarket, wystawa kwiatów, blokowisko PRL → ogród działkowy z basenem.",state.w/2,state.h*.63);}
}
function path(points,fill){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();if(fill)ctx.fill();else ctx.stroke();}
function round(x,y,w,h,r,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill)ctx.fill();else ctx.stroke();}
function ellipse(x,y,w,h){ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2);ctx.fill();}
function tri(x1,y1,x2,y2,x3,y3){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fill();}
function wing(x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ellipse(0,0,22,44);ctx.restore();}
function unit(){return clamp(Math.min(state.w/390,state.h/760),.78,1.25)}
function loop(t){const dt=Math.min(40,t-last||16);last=t;update(dt);updateFinish(dt);draw();requestAnimationFrame(loop)}
function moveLane(dir){state.targetLane=clamp(state.targetLane+dir,-1,1)}
window.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){if(state.mode==="title"||state.mode==="over")startGame();e.preventDefault()}if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")moveLane(-1);if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")moveLane(1);});
canvas.addEventListener("pointerdown",e=>{pointerStart={x:e.clientX,y:e.clientY};if(state.mode==="title"||state.mode==="over"){startGame();return}if(e.clientX<state.w*.35)moveLane(-1);else if(e.clientX>state.w*.65)moveLane(1);});
canvas.addEventListener("pointerup",e=>{if(!pointerStart)return;let dx=e.clientX-pointerStart.x;if(Math.abs(dx)>34)moveLane(dx>0?1:-1);pointerStart=null;});
window.addEventListener("resize",()=>{resize();});
resize(); updateHud(); requestAnimationFrame(loop);
