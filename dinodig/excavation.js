'use strict';
// Frame-paced preparation: three materials, three distinct tool marks.
const reducedDigMotion=matchMedia('(prefers-reduced-motion: reduce)');
let digFrame=0,digTime=0,lastStamp=0,toolAngle=-.6,toolPulse=0;
let digPointer={x:0,y:0,visible:false},pendingStroke=null,sectionSweep=null,layerFade=null;
let digGeneration=0,transitioning=false;
const toolShapes={
 shovel:'<path d="M29 35 57 7" stroke="#a97942" stroke-width="7"/><path d="M51 8 59 0 67 8 59 16Z" fill="none" stroke="#b9925b" stroke-width="4"/><path d="M15 31 31 24 41 36 29 51Q19 55 12 44Z" fill="#b4b9b6" stroke="#313734" stroke-width="2"/><path d="M17 35 31 30" stroke="#e9ece2" stroke-width="2"/>',
 pick:'<path d="M22 46 55 12" stroke="#b88953" stroke-width="7"/><path d="M13 11Q36-1 61 14L47 13 27 18 15 16Z" fill="#a6b0ad" stroke="#333c37" stroke-width="2"/><path d="M23 45 16 54" stroke="#d7dfd7" stroke-width="5"/>',
 air:'<path d="M28 30 56 2Q60-2 65 4L66 9 38 38Z" fill="#a67c48" stroke="#403527" stroke-width="2"/><path d="m28 28 13 13-9 9-13-13Z" fill="#aeb6b1" stroke="#30362e" stroke-width="2"/><path d="m19 36 14 13-13 13L5 48Z" fill="#d6b984" stroke="#957750" stroke-width="1.5"/><path d="m19 41-9 9m14-4-9 9m14-4-8 9" stroke="#f0d7a1" stroke-width="2"/>'
};
function toolRadius(){return TOOLS[tool].r*Math.min(1,Math.max(.65,W/700));}
function updateDigCursor(){
 cursor.className='cursor tool-cursor';
 cursor.innerHTML='<span class="tool-ring"></span><svg class="dig-tool" viewBox="0 0 72 72">'+toolShapes[tool]+'</svg>';
 cursor.dataset.tool=tool;
 const r=toolRadius();cursor.style.width=cursor.style.height=r*2+'px';
}
const originalDigTool=setTool;
setTool=function(t,silent){originalDigTool(t,silent);updateDigCursor();};
function resetDigAnimation(){
 digGeneration++;isDown=false;pendingStroke=null;sectionSweep=null;layerFade=null;transitioning=false;
 parts=[];digPointer.visible=false;cursor.style.display='none';
 [cOver,cRock,cDust].forEach(c=>c.style.opacity='1');
 document.getElementById('clearSection').disabled=false;pit.classList.remove('preparing');
 fxCtx.clearRect(0,0,W,H);lastSample=-Infinity;
}
const originalDigLoad=loadSite;
loadSite=function(i,redig=false){resetDigAnimation();originalDigLoad(i,redig);updateDigCursor();refreshToolLocks();};

function fillMatrix(ctx,base,dark,light,rock){
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,W,H);
 ctx.fillStyle=base;ctx.fillRect(0,0,W,H);
 for(let i=0;i<90;i++){
  const x=Math.random()*W,y=Math.random()*H,r=20+Math.random()*Math.min(W,H)*.4;
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,i%2?dark:light);g.addColorStop(1,'transparent');
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
 }
 ctx.lineWidth=rock?1.1:.7;
 for(let i=0;i<(rock?18:12);i++){
  let x=Math.random()*W,y=Math.random()*H;ctx.beginPath();ctx.moveTo(x,y);
  for(let j=0;j<7;j++){x+=Math.random()*65-24;y+=Math.random()*30-12;ctx.lineTo(x,y);}
  ctx.strokeStyle=rock?'rgba(31,24,17,.38)':'rgba(21,14,9,.13)';ctx.stroke();
 }
 grainPass(ctx,rock?25:19,.22,.18);
 for(let i=0;i<W*H/(rock?1600:900);i++){
  const x=Math.random()*W,y=Math.random()*H,r=1.2+Math.random()*(rock?4:6);
  ctx.beginPath();ctx.ellipse(x,y,r,r*.65,Math.random()*6,0,Math.PI*2);
  ctx.fillStyle='rgba(16,12,8,.30)';ctx.fill();
  ctx.beginPath();ctx.ellipse(x,y-1,r*.8,r*.45,0,0,Math.PI*2);
  ctx.fillStyle='rgba(227,205,166,.22)';ctx.fill();
 }
}
paintOver=function(){const p=PALETTES[SITES[current].palette];fillMatrix(oCtx,p.soil[0],'rgba(16,10,7,.35)','rgba(191,150,95,.24)',false);};
paintRock=function(){const p=PALETTES[SITES[current].palette];fillMatrix(rCtx,p.rock[0],'rgba(18,18,17,.40)','rgba(217,203,167,.24)',true);};
paintDust=function(){sCtx.globalCompositeOperation='source-over';sCtx.clearRect(0,0,W,H);sCtx.fillStyle='rgba(174,153,120,.67)';sCtx.fillRect(0,0,W,H);grainPass(sCtx,24,.15,.14);};

eraseAt=function(ctx,x,y){
 const r=toolRadius();ctx.save();ctx.globalCompositeOperation='destination-out';
 if(tool==='pick'){
  // A chipped, angular cavity instead of a circular rubber eraser.
  ctx.beginPath();
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2,rr=r*(.65+Math.random()*.3);const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.8;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.closePath();ctx.fillStyle='rgba(0,0,0,.88)';ctx.fill();
 }else if(tool==='shovel'){
  ctx.translate(x,y);ctx.rotate(toolAngle);
  const g=ctx.createRadialGradient(0,0,r*.5,0,0,r);g.addColorStop(0,'#000');g.addColorStop(1,'transparent');
  ctx.fillStyle=g;ctx.scale(1,.78);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
 }else{
  const g=ctx.createRadialGradient(x,y,r*.15,x,y,r);g.addColorStop(0,'rgba(0,0,0,.82)');g.addColorStop(.65,'rgba(0,0,0,.48)');g.addColorStop(1,'transparent');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  // Fine bristle tracks accumulate into a clean surface.
  ctx.strokeStyle='rgba(0,0,0,.30)';ctx.lineWidth=1.6;
  for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(x-r*.5,y+i*3);ctx.lineTo(x+r*.5,y+i*3+2);ctx.stroke();}
 }
 ctx.restore();
};
strokeLine=function(x0,y0,x1,y1){
 if(transitioning||revealed)return;
 const dist=Math.hypot(x1-x0,y1-y0),r=toolRadius(),step=Math.max(3,r*(tool==='pick'?.85:.22));
 if(dist>2)toolAngle=Math.atan2(y1-y0,x1-x0);
 const count=Math.max(1,Math.ceil(dist/step));
 for(let i=1;i<=count;i++)eraseAt(CTX[stage],x0+(x1-x0)*i/count,y0+(y1-y0)*i/count);
 spawnFx(x1,y1,Math.min(1,dist/20));scrub(Math.min(1,dist/20));toolPulse=1;
};

spawnFx=function(x,y,amount){
 if(reducedDigMotion.matches)return;
 const p=PALETTES[SITES[current].palette],kind=tool==='air'?'dust':tool==='pick'?'chip':'soil';
 const n=kind==='dust'?6:kind==='chip'?10:8;
 for(let i=0;i<n;i++){
  const a=Math.random()*Math.PI*2,speed=kind==='chip'?60+Math.random()*120:20+Math.random()*65;
  parts.push({x:x+(Math.random()-.5)*12,y:y+(Math.random()-.5)*8,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-35,
   life:1,age:0,duration:kind==='dust'?.45+Math.random()*.35:.4+Math.random()*.4,
   r:kind==='dust'?4+Math.random()*9:1+Math.random()*(kind==='chip'?5:3),c:kind==='dust'?'#d5bd96':i%2?p.rock[0]:p.grain,kind,rotation:Math.random()*6,spin:(Math.random()-.5)*8});
 }
 if(parts.length>220)parts.splice(0,parts.length-220);ensureDigFrame();
};
tickFx=function(){ensureDigFrame();};
function ensureDigFrame(){if(!digFrame)digFrame=requestAnimationFrame(animateDig);}
function animateDig(now){
 digFrame=0;const dt=Math.min(.04,(now-(digTime||now-16))/1000);digTime=now;
 if(pendingStroke&&!transitioning&&!revealed){const p=pendingStroke;pendingStroke=null;strokeLine(lastX,lastY,p.x,p.y);lastX=p.x;lastY=p.y;lastStamp=now;sampleProgress();}
 if(isDown&&!revealed&&!transitioning&&now-lastStamp>(tool==='pick'?115:tool==='shovel'?100:40)){
  eraseAt(CTX[stage],lastX,lastY);spawnFx(lastX,lastY,.5);scrub(.3);toolPulse=1;lastStamp=now;sampleProgress();
 }
 if(sectionSweep){
  const sw=sectionSweep,t=Math.min(1,(now-sw.start)/sw.duration),old=sw.progress;
  const x=(sw.col/4)*W,y=(sw.row/3)*H,w=W/4,h=H/3;
  sw.ctx.clearRect(x,y+h*old,w+1,h*(t-old)+1);sw.progress=t;
  digPointer={x:x+w*(.5+.45*Math.sin(t*Math.PI*8)),y:y+h*t,visible:true};toolPulse=1;
  if(now-lastStamp>45){spawnFx(digPointer.x,digPointer.y,.8);scrub(.5);lastStamp=now;}
  if(t===1){sectionSweep=null;digPointer.visible=false;cursor.style.display='none';lastSample=-Infinity;sampleProgress();document.getElementById('clearSection').disabled=revealed||transitioning;}
 }
 if(layerFade){
  const fade=layerFade,t=Math.min(1,(now-fade.start)/fade.duration);fade.canvas.style.opacity=String(1-t);
  if(t===1){fade.ctx.clearRect(0,0,W,H);fade.canvas.style.opacity='1';layerFade=null;transitioning=false;completeDigStage(fade.stage);}
 }
 fxCtx.clearRect(0,0,W,H);
 for(let i=parts.length-1;i>=0;i--){
  const p=parts[i];p.age+=dt;p.life=1-p.age/p.duration;if(p.life<=0){parts.splice(i,1);continue;}
  p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.kind==='dust'?-12:220)*dt;p.rotation+=p.spin*dt;
  fxCtx.save();fxCtx.translate(p.x,p.y);fxCtx.rotate(p.rotation);fxCtx.globalAlpha=p.life*(p.kind==='dust'?.18:.85);fxCtx.fillStyle=p.c;
  if(p.kind==='dust'){fxCtx.beginPath();fxCtx.ellipse(0,0,p.r*(1+p.age),p.r*.7,0,0,Math.PI*2);fxCtx.fill();}
  else{fxCtx.beginPath();fxCtx.moveTo(-p.r,-p.r*.4);fxCtx.lineTo(p.r*.4,-p.r);fxCtx.lineTo(p.r,p.r*.5);fxCtx.lineTo(-p.r*.5,p.r);fxCtx.closePath();fxCtx.fill();}
  fxCtx.restore();
 }
 toolPulse=Math.max(0,toolPulse-dt*6);
 if(digPointer.visible&&!revealed){
  cursor.style.display='block';cursor.style.left=digPointer.x+'px';cursor.style.top=digPointer.y+'px';
  cursor.style.setProperty('--tool-turn',((tool==='pick'?-25:tool==='air'?-12:-30)+toolPulse*(tool==='pick'?24:8))+'deg');
  cursor.style.setProperty('--tool-lift',(-toolPulse*5)+'px');
 }
 if(parts.length||isDown||pendingStroke||sectionSweep||layerFade||toolPulse>0)ensureDigFrame();
}

const progressSample=document.createElement('canvas');progressSample.width=80;progressSample.height=60;
const progressCtx=progressSample.getContext('2d',{willReadFrequently:true});
sampleProgress=function(){
 if(revealed||transitioning||!CTX[stage])return;
 const now=performance.now();if(now-lastSample<120)return;lastSample=now;
 progressCtx.clearRect(0,0,80,60);progressCtx.drawImage(CANVAS[stage],0,0,80,60);
 const data=progressCtx.getImageData(0,0,80,60).data;let count=0;
 for(let i=3;i<data.length;i+=4)if(data[i]<40)count++;
 stageProg[stage]=count/4800;updateGauge();if(stageProg[stage]>=THRESH)advanceStage();
};
advanceStage=function(){
 if(transitioning||revealed)return;transitioning=true;isDown=false;pendingStroke=null;
 document.getElementById('clearSection').disabled=true;
 layerFade={stage,canvas:CANVAS[stage],ctx:CTX[stage],start:performance.now(),duration:reducedDigMotion.matches?1:420};ensureDigFrame();
};
function completeDigStage(finished){
 stageProg[finished]=1;
 if(finished==='over'){stage='rock';setTool('pick',true);setHint('Rock exposed. Tap or drag the fine chisel to loosen the matrix.');}
 else if(finished==='rock'){stage='dust';setTool('air',true);setHint('Fossil exposed. Sweep the brush to clear the last dust.');}
 else{stage='done';reveal();cursor.style.display='none';digPointer.visible=false;}
 tick();updateGauge();lastSample=-Infinity;
 document.getElementById('clearSection').disabled=revealed;pit.classList.remove('preparing');
}
function clearNextSection(index){
 if(revealed||transitioning||sectionSweep)return;
 sectionSweep={ctx:CTX[stage],col:index%4,row:Math.floor(index/4),start:performance.now(),duration:reducedDigMotion.matches?1:650,progress:0};
 document.getElementById('clearSection').disabled=true;pit.classList.add('preparing');setHint('Carefully clearing this section…');ensureDigFrame();
}
function digPosition(e){const r=pit.getBoundingClientRect();return{x:Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)),y:Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height)),visible:true};}
cOver.addEventListener('pointerdown',e=>{
 if(revealed||transitioning||sectionSweep||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
 e.preventDefault();cOver.setPointerCapture(e.pointerId);digPointer=digPosition(e);isDown=true;lastX=digPointer.x;lastY=digPointer.y;
 audio();eraseAt(CTX[stage],lastX,lastY);spawnFx(lastX,lastY,.6);toolPulse=1;lastStamp=performance.now();ensureDigFrame();
});
cOver.addEventListener('pointermove',e=>{if(!e.isPrimary||sectionSweep)return;digPointer=digPosition(e);if(isDown)pendingStroke={...digPointer};ensureDigFrame();});
function endDig(e){
 if(isDown&&pendingStroke&&!transitioning){strokeLine(lastX,lastY,pendingStroke.x,pendingStroke.y);pendingStroke=null;}
 isDown=false;lastSample=-Infinity;sampleProgress();
 if(e&&cOver.hasPointerCapture(e.pointerId))cOver.releasePointerCapture(e.pointerId);
}
cOver.addEventListener('pointerup',endDig);cOver.addEventListener('pointercancel',()=>{isDown=false;pendingStroke=null;digPointer.visible=false;cursor.style.display='none';});
cOver.addEventListener('lostpointercapture',()=>{isDown=false;pendingStroke=null;});
cOver.addEventListener('pointerleave',()=>{if(!isDown){digPointer.visible=false;cursor.style.display='none';}});
window.addEventListener('blur',()=>{isDown=false;pendingStroke=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){isDown=false;pendingStroke=null;}});

function fitDigViewport(){pit.style.setProperty('--pit-height',Math.max(230,Math.min(680,innerHeight-150))+'px');}
function preserveDigSize(){
 const r=pit.getBoundingClientRect();if(Math.round(r.width)===W&&Math.round(r.height)===H)return;
 const copies=[cOver,cRock,cDust].map(c=>{const n=document.createElement('canvas');n.width=c.width;n.height=c.height;n.getContext('2d').drawImage(c,0,0);return n;});
 const oldW=W,oldH=H;sizeCanvases();
 [oCtx,rCtx,sCtx].forEach((ctx,i)=>{ctx.globalCompositeOperation='source-over';ctx.drawImage(copies[i],0,0,W,H);});
 if(oldW&&oldH){digPointer.x*=W/oldW;digPointer.y*=H/oldH;lastX*=W/oldW;lastY*=H/oldH;parts.forEach(p=>{p.x*=W/oldW;p.y*=H/oldH;});}
 updateDigCursor();updateGauge();
}
fitDigViewport();new ResizeObserver(preserveDigSize).observe(pit);
window.addEventListener('resize',()=>{fitDigViewport();fitFallbackMap();try{if(map)map.invalidateSize();}catch(e){}});
updateDigCursor();
