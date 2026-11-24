import {buildDistrict,stops} from './district.js?v=forum2';
import {createRenderer} from './renderer.js?v=forum2';

import {installFountainLion} from './street.js?v=forum2';

const get=id=>document.getElementById(id),canvas=get('world'),dialog=get('map'),status=get('status');
const mesh=buildDistrict(),cam={...stops[0],eye:1.69};
const yawLimit=Math.PI*2;
function heightAt(x,z){
  let height=.025;
  for(const b of mesh.stairs){
    const dx=x-b.x,dz=z-b.z,lx=dx*b.c-dz*b.s,lz=dx*b.s+dz*b.c;
    if(Math.abs(lx)<=b.hx+.005&&Math.abs(lz)<=b.hz+.005)height=Math.max(height,b.back+(b.front-b.back)*(lz+b.hz)/(2*b.hz));
  }
  return height;
}
function free(x,z,feet){
  if(x< -25.5||x>40.3||z< -40.4||z>27.3||Math.abs(heightAt(x,z)-feet)>.31)return false;
  for(const b of mesh.blocks){
    if(b.top<=feet+.29||b.bottom>=feet+1.73)continue;
    const dx=x-b.x,dz=z-b.z,lx=Math.abs(dx*b.c-dz*b.s),lz=Math.abs(dx*b.s+dz*b.c);
    if(Math.max(0,lx-b.hx)**2+Math.max(0,lz-b.hz)**2<.27**2)return false;
  }
  return true;
}
function move(dx,dz){
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.13));
  for(let i=0;i<steps;i++){
    if(free(cam.x+dx/steps,cam.z,heightAt(cam.x,cam.z)))cam.x+=dx/steps;
    if(free(cam.x,cam.z+dz/steps,heightAt(cam.x,cam.z)))cam.z+=dz/steps;
  }
}
const keys=new Set(),stick=get('stick'),knob=get('knob'),joy={x:0,y:0};
let look=null,stickId=null,ready=false;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function turn(dx,dy){cam.yaw=(cam.yaw+dx)%yawLimit;cam.pitch=clamp(cam.pitch+dy,-1.10,1.20);}
function active(){document.body.classList.add('hideHint');}
function stopStick(){stickId=null;joy.x=joy.y=0;knob.style.transform='';}
function resetInput(){keys.clear();look=null;stopStick();}
window.addEventListener('blur',resetInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetInput();});
stick.addEventListener('pointerdown',e=>{if(!ready||dialog.open||stickId!==null)return;stickId=e.pointerId;stick.setPointerCapture(stickId);setStick(e);active();});
function setStick(e){
  if(e.pointerId!==stickId)return;
  const r=stick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.36),y=(e.clientY-r.top-r.height/2)/(r.height*.36),l=Math.max(1,Math.hypot(x,y));
  joy.x=x/l;joy.y=y/l;knob.style.transform='translate('+joy.x*22+'px,'+joy.y*22+'px)';
}
stick.addEventListener('pointermove',setStick);
for(const ev of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(ev,e=>{if(e.pointerId===stickId)stopStick();});
canvas.addEventListener('pointerdown',e=>{
  if(!ready||dialog.open||look||e.button!==0)return;
  canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);look={id:e.pointerId,x:e.clientX,y:e.clientY};active();
});
canvas.addEventListener('pointermove',e=>{
  if(!look||look.id!==e.pointerId)return;
  const sensitivity=e.pointerType==='touch'?.0052:.0043;
  turn((e.clientX-look.x)*sensitivity,(look.y-e.clientY)*sensitivity);look.x=e.clientX;look.y=e.clientY;
});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{if(look?.id===e.pointerId)look=null;});
const place=get('place'),bearing=get('bearing');
function locationName(){
  if(cam.z< -20.5&&cam.x>9)return 'Aqueduct garden';
  if(cam.z< -10&&cam.x<8&&cam.x> -12)return 'Temple portico';
  if(cam.x< -10.2)return 'Market street';
  if(cam.x>11&&cam.z< -14)return 'Aqueduct arcade';
  if(cam.x>17)return 'East lane';
  return 'The Forum';
}
function drawPlan(){
  const c=get('plan'),p=c.getContext('2d'),scale=6.25,ox=283,oz=287;
  const pos=(x,z)=>[ox+x*scale,oz+z*scale];
  p.fillStyle='#e7d9ba';p.fillRect(0,0,c.width,c.height);
  p.save();p.translate(ox,oz);p.scale(scale,scale);
  p.fillStyle='#b5bc92';p.fillRect(8.5,-40,31,18);p.fillStyle='#f1e4c9';p.fillRect(-13.5,-12,27,36);
  p.fillStyle='#ab9780';
  for(const b of mesh.blocks){if(b.bottom>2||b.x< -26.5||b.x>41.5||b.z< -42||b.z>29)continue;p.save();p.translate(b.x,b.z);p.rotate(-Math.atan2(b.s,b.c));p.fillRect(-b.hx,-b.hz,2*b.hx,2*b.hz);p.restore();}
  p.restore();
  const tags=[['Forum',2,9],['Temple',-2,-25],['Market',-18,9],['Garden',25,-31]];
  p.font='italic 22px Georgia';p.textAlign='center';p.textBaseline='middle';
  for(const [name,x,z] of tags){const [px,py]=pos(x,z);p.lineWidth=5;p.strokeStyle='#e4d5b6';p.strokeText(name,px,py);p.fillStyle='#504533';p.fillText(name,px,py);}
  const [px,py]=pos(cam.x,cam.z);p.save();p.translate(px,py);p.rotate(cam.yaw);p.beginPath();p.moveTo(0,-15);p.lineTo(9,9);p.lineTo(0,5);p.lineTo(-9,9);p.closePath();p.fillStyle='#9c462a';p.strokeStyle='#fff5dc';p.lineWidth=3;p.fill();p.stroke();p.restore();
  p.font='17px system-ui';p.fillStyle='#60513a';p.fillText('N',c.width-37,40);p.fillRect(c.width-38,53,2,19);
}
function updateLocation(){
  const d=(Math.round(cam.yaw*180/Math.PI)%360+360)%360;
  bearing.textContent=['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8]+' · '+d+'°';
  place.textContent=locationName();
}
function showMap(){if(!ready||dialog.open)return;resetInput();drawPlan();dialog.showModal();}
function hideMap(){dialog.close();canvas.focus({preventScroll:true});}
get('openMap').onclick=showMap;get('closeMap').onclick=hideMap;dialog.onclick=e=>{if(e.target===dialog)hideMap();};
dialog.addEventListener('close',()=>{resetInput();canvas.focus({preventScroll:true});});
for(const dest of stops){
  const button=document.createElement('button');button.type='button';button.textContent=dest.name;button.onclick=()=>{Object.assign(cam,dest);cam.eye=heightAt(cam.x,cam.z)+1.66;updateLocation();hideMap();active();};get('destinations').append(button);
}
const codes=['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyR','KeyF','ShiftLeft','ShiftRight'];
document.addEventListener('keydown',e=>{
  if(!ready||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.code==='KeyM'&&!e.repeat){e.preventDefault();dialog.open?hideMap():showMap();return;}
  if(dialog.open||!codes.includes(e.code))return;e.preventDefault();keys.add(e.code);active();
});
document.addEventListener('keyup',e=>keys.delete(e.code));
get('retry').onclick=()=>location.reload();
function fail(message){ready=false;get('openMap').disabled=true;get('message').textContent=message;get('retry').hidden=false;status.hidden=false;}
async function start(){
  await installFountainLion(mesh);
  const render=await createRenderer(canvas,mesh,fail);
  let last=0,time=0,hud=0;
  ready=true;get('openMap').disabled=false;
  function tick(now){
    if(!ready)return;
    const dt=Math.min(.08,(now-last)/1000||0);last=now;
    if(!document.hidden&&!dialog.open){
      const key=k=>Number(keys.has(k));
      let forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'))-joy.y,side=key('KeyD')-key('KeyA')+joy.x;
      const norm=Math.max(1,Math.hypot(forward,side)),speed=dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?5.1:3.15)/norm;
      turn((key('ArrowRight')-key('ArrowLeft'))*dt*1.7,(key('KeyR')-key('KeyF'))*dt*1.25);
      if(forward||side)move((Math.sin(cam.yaw)*forward+Math.cos(cam.yaw)*side)*speed,(-Math.cos(cam.yaw)*forward+Math.sin(cam.yaw)*side)*speed);
      cam.eye+=(heightAt(cam.x,cam.z)+1.66-cam.eye)*(1-Math.exp(-dt*18));
      time+=dt;render(cam,time);hud+=dt;
      if(hud>.1){hud=0;updateLocation();}
    }
    requestAnimationFrame(tick);
  }
  render(cam,0);status.hidden=true;requestAnimationFrame(tick);
}
start().catch(e=>{console.error(e);fail(e.message||'The district could not be loaded.');});
