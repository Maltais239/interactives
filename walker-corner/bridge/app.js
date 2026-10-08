/* UI, drawing and illustrative failure animation. The structural solver is in engine.js. */
(()=>{
  'use strict';
  const E=BridgeEngine,$=id=>document.getElementById(id),canvas=$('bridgeCanvas'),ctx=canvas.getContext('2d');
  const STORE='bgsd-walker-bridge-game-v1';
  const challenges={
    supply:{name:'Supply run',vehicle:'truck',budget:1400,text:'Get the truck across. Build smart and stay within budget.'},
    first:{name:'First crossing',vehicle:'car',budget:1100,text:'Make a safe crossing for the car. Try a simple, well-braced design.'},
    school:{name:'School run',vehicle:'bus',budget:1900,text:'Carry the school bus. It is the heaviest load in the lab.'},
    lean:{name:'Lean build',vehicle:'truck',budget:900,text:'Carry the truck for $900 or less. Where can you use fewer pieces?'},
    sandbox:{name:'Free build',vehicle:null,budget:Infinity,text:'Your canyon, your experiment. Choose any vehicle and try an idea.'}
  };
  let saved=null;try{saved=JSON.parse(localStorage.getItem(STORE));if(saved){E.validate(saved.members);if(!challenges[saved.challenge]||!E.vehicles[saved.vehicle])saved=null;}}catch{saved=null;}
  const state={members:saved?.members||E.starter('truss'),challenge:saved?.challenge||'supply',vehicle:saved?.vehicle||'truck',wind:saved?.wind||0,trials:Array.isArray(saved?.trials)?saved.trials.slice(-40):[],reflection:saved?.reflection||'',tool:saved&&!E.roadComplete(saved.members)?'road':'wood',mode:'build',selected:null,hover:null,cursor:{x:E.LEFT,y:E.DECK},keyboard:false,history:[],grid:true,stress:false,zoom:false,model:null,response:null,display:[],peakStress:0,peakDeflection:0,carX:100,lastTime:0,fallTime:0,debris:[],particles:[],failedReason:'',critical:-1,gaps:[],gapHit:null};
  const images={valley:new Image(),vehicles:new Image()};images.valley.src='assets/valley.webp';images.vehicles.src='assets/vehicles.webp';
  const sprite={car:{x:413,y:12,w:707,h:305},truck:{x:265,y:315,w:965,h:343},bus:{x:185,y:660,w:1165,h:354}};
  let width=1000,height=450,scale=1,ox=0,oy=0,dpr=1,resizeFrame=0,statusTimer=0,assetWarning=false;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const busy=()=>state.mode==='testing'||state.mode==='fall';
  function persist(){try{localStorage.setItem(STORE,JSON.stringify({members:state.members,challenge:state.challenge,vehicle:state.vehicle,wind:state.wind,trials:state.trials,reflection:$('reflection').value}));}catch{status('Browser storage is unavailable. Use Save bridge or Export trials to keep your work.');}}
  function status(text){$('status').textContent=text;}
  function clone(m){return m.map(e=>({type:e.type,a:{...e.a},b:{...e.b}}));}
  function remember(){state.history.push(clone(state.members));if(state.history.length>35)state.history.shift();}
  function resetView(){state.mode='build';state.selected=null;state.gapHit=null;state.response=null;state.display=[];state.debris=[];state.particles=[];$('resultCard').hidden=true;$('testMeter').hidden=true;$('modeBadge').textContent='BUILD MODE';$('testBtn').hidden=false;$('resetTestBtn').hidden=true;setEditing(true);}
  function setEditing(enabled){document.querySelectorAll('[data-tool],[data-vehicle],#challenge,#starter,#starterBtn,#undoBtn,#saveBtn,#loadBtn,#wind,#connectBtn,#removeBtn').forEach(b=>b.disabled=!enabled);if(enabled)$('undoBtn').disabled=!state.history.length;}
  function refresh(){
    state.gaps=E.roadGaps(state.members);
    const c=challenges[state.challenge],cost=E.cost(state.members);$('challenge').value=state.challenge;$('wind').value=String(state.wind);$('cost').textContent='$'+cost.toLocaleString();$('budgetLimit').textContent=Number.isFinite(c.budget)?' / $'+c.budget.toLocaleString():' / unlimited';$('budgetFill').style.width=(Number.isFinite(c.budget)?Math.min(100,cost/c.budget*100):20)+'%';document.querySelector('.budget').classList.toggle('over',cost>c.budget);$('missionText').textContent=c.text;$('pieces').textContent=state.members.length+' pieces';$('trialCount').textContent=state.trials.length;$('undoBtn').disabled=!state.history.length||busy();
    document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===state.tool));document.querySelectorAll('[data-vehicle]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.vehicle===state.vehicle));
    $('designDescription').textContent=`Driving surface: ${8-state.gaps.length} of 8 Road sections. Your bridge has ${state.members.filter(m=>m.type==='wood').length} wood beams and ${state.members.filter(m=>m.type==='steel').length} steel beams. Cost: $${cost}. ${state.gaps.length?'Add Road along the highlighted gaps; wood and steel are braces.':'The road reaches both banks. Add triangular bracing to support the load.'}`;
    updateHint();persist();
  }
  function updateHint(){if(busy())return;if(state.selected)$('sceneHint').textContent='Choose the next point. Escape cancels.';else if(state.tool==='erase')$('sceneHint').textContent='Tap a piece to remove it. Undo brings it back.';else if(state.gaps.length)$('sceneHint').textContent='Road first: fill the highlighted gaps. Wood and steel are braces.';else if(state.tool==='road')$('sceneHint').textContent='Road connected. Choose Wood or Steel to add triangular bracing.';else $('sceneHint').textContent=`${E.materials[state.tool].name}: connect two points. Triangles help distribute the load.`;}
  function setTool(tool){if(busy())return;state.tool=tool;state.selected=null;refresh();}
  function changed(text){state.response=null;state.display=[];$('resultCard').hidden=true;if(state.mode==='result')resetView();state.selected=null;refresh();status(text);}
  function addPiece(a,b){
    if(busy())return;if(E.key(a)===E.key(b)){state.selected=null;updateHint();return;}
    if(state.tool==='erase'){removeBetween(a,b);return;}
    const m={a:{...a},b:{...b},type:state.tool};
    const existing=state.members.findIndex(piece=>(E.key(piece.a)===E.key(a)&&E.key(piece.b)===E.key(b))||(E.key(piece.b)===E.key(a)&&E.key(piece.a)===E.key(b)));
    if(state.tool==='road'&&existing>=0&&state.members[existing].type!=='road'){
      try{E.validate([m]);}catch(err){status(err.message);state.selected=null;updateHint();return;}
      remember();state.members[existing]=m;changed('Converted that beam to Road for the driving surface. Undo restores the previous beam.');return;
    }
    try{E.validate([...state.members,m]);}catch(err){status(err.message);state.selected=null;updateHint();return;}
    remember();state.members.push(m);changed(`${E.materials[m.type].name} added. ${E.roadComplete(state.members)?'Ready to test.':'Keep connecting the road across the canyon.'}`);
  }
  function removeBetween(a,b){const i=state.members.findIndex(m=>(E.key(m.a)===E.key(a)&&E.key(m.b)===E.key(b))||(E.key(m.b)===E.key(a)&&E.key(m.a)===E.key(b)));if(i<0){status('There is no piece between those points.');return;}removeAt(i);}
  function removeAt(i){if(busy()||i<0)return;remember();const type=state.members[i].type;state.members.splice(i,1);changed(`${E.materials[type].name} removed. Try the same vehicle to compare the effect.`);}
  function choosePoint(p){if(busy())return;if(state.mode==='result')resetView();if(state.selected)addPiece(state.selected,p);else {state.selected={...p};updateHint();status(`Start point: ${pointName(p)}. Choose another point.`);}}
  const pointName=p=>`${(p.x-E.LEFT)/E.STEP+1}${p.y===E.DECK?' · road':p.y<E.DECK?' · '+(E.DECK-p.y)/E.STEP+' above':' · '+(p.y-E.DECK)/E.STEP+' below'}`;
  const points=[];for(let row=-2;row<=2;row++)for(let col=0;col<=8;col++)points.push({x:E.LEFT+col*E.STEP,y:E.DECK+row*E.STEP});
  for(const id of['fromPoint','toPoint'])for(const p of points){const option=document.createElement('option');option.value=E.key(p);option.textContent=pointName(p);$(id).append(option);}$('fromPoint').value=E.key({x:E.LEFT,y:E.DECK});$('toPoint').value=E.key({x:E.LEFT+E.STEP,y:E.DECK});
  const readPoint=id=>{const [x,y]=$(id).value.split(',').map(Number);return {x,y};};
  $('connectBtn').onclick=()=>{if(state.tool==='erase')setTool('wood');addPiece(readPoint('fromPoint'),readPoint('toPoint'));};$('removeBtn').onclick=()=>removeBetween(readPoint('fromPoint'),readPoint('toPoint'));
  document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
  document.querySelectorAll('[data-vehicle]').forEach(b=>b.onclick=()=>{if(busy())return;state.vehicle=b.dataset.vehicle;resetView();refresh();const target=challenges[state.challenge].vehicle;status(target&&target!==state.vehicle?`You can compare this ${E.vehicles[state.vehicle].name.toLowerCase()} test. The challenge still needs the ${E.vehicles[target].name.toLowerCase()}.`:`Ready to test the ${E.vehicles[state.vehicle].name.toLowerCase()}.`);});
  $('challenge').onchange=()=>{state.challenge=$('challenge').value;state.vehicle=challenges[state.challenge].vehicle||state.vehicle;resetView();refresh();status('New challenge selected. Your bridge is still here.');};
  $('wind').onchange=()=>{state.wind=Number($('wind').value);resetView();refresh();status('Wind changed. Keep your design and vehicle the same to compare conditions.');};
  $('undoBtn').onclick=()=>{if(state.history.length&&!busy()){state.members=state.history.pop();changed('Last design change undone.');}};
  $('starterBtn').onclick=()=>{if(busy())return;remember();state.members=E.starter($('starter').value);state.tool=$('starter').value==='blank'?'road':'wood';resetView();refresh();status($('starter').value==='truss'?'Wood truss loaded. Test it, then try removing a diagonal.':$('starter').value==='frame'?'Unbraced frame loaded. Test first, then add triangles.':$('starter').value==='beam'?'Road-only design loaded. The car can drive on it; add Wood or Steel triangles to support it.':'Empty canyon loaded. Road is selected: connect the highlighted sections first, then add bracing.');};
  $('gridBtn').onclick=()=>{state.grid=!state.grid;$('gridBtn').setAttribute('aria-pressed',state.grid);};$('stressBtn').onclick=()=>{state.stress=!state.stress;$('stressBtn').setAttribute('aria-pressed',state.stress);if(state.stress&&!state.response)status('Stress colours appear during a test. Green is low; red is at the failure limit.');};
  $('zoomBtn').onclick=()=>{state.zoom=!state.zoom;$('zoomBtn').textContent=state.zoom?'−':'＋';$('zoomBtn').setAttribute('aria-label',state.zoom?'Show whole canyon':'Zoom construction grid');resize();};
  function resize(){
    const scene=$('scene'),shell=document.querySelector('.workspace'),dock=document.querySelector('.build-dock'),bench=document.querySelector('.workbench');
    const available=window.innerHeight-shell.getBoundingClientRect().top-dock.offsetHeight-bench.offsetHeight-45;
    const desired=Math.min(scene.clientWidth*.5625,Math.max(window.innerWidth<=650?260:235,available));
    document.documentElement.style.setProperty('--scene-height',Math.round(Math.min(660,desired))+'px');
    width=scene.clientWidth;height=scene.clientHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    scale=width/(state.zoom?850:1200);ox=(width-1200*scale)/2;oy=Math.min(0,height*.45-E.DECK*scale);
  }
  window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(resize);});new ResizeObserver(()=>{if(width!==$('scene').clientWidth||height!==$('scene').clientHeight)resize();}).observe($('scene'));document.fonts?.ready.then(resize);
  function position(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left-ox)/scale,y:(event.clientY-r.top-oy)/scale};}
  function nearest(p){const x=Math.max(E.LEFT,Math.min(E.RIGHT,E.LEFT+Math.round((p.x-E.LEFT)/E.STEP)*E.STEP)),y=Math.max(E.DECK-2*E.STEP,Math.min(E.DECK+2*E.STEP,E.DECK+Math.round((p.y-E.DECK)/E.STEP)*E.STEP));return Math.hypot((p.x-x)*scale,(p.y-y)*scale)<=Math.max(24,E.STEP*scale*.45)?{x,y}:null;}
  function nearestMember(p){let index=-1,distance=18/scale;state.members.forEach((m,i)=>{const dx=m.b.x-m.a.x,dy=m.b.y-m.a.y,t=Math.max(0,Math.min(1,((p.x-m.a.x)*dx+(p.y-m.a.y)*dy)/(dx*dx+dy*dy))),d=Math.hypot(p.x-m.a.x-t*dx,p.y-m.a.y-t*dy);if(d<distance){distance=d;index=i;}});return index;}
  canvas.addEventListener('pointermove',e=>{if(!busy()){state.hover=nearest(position(e));state.keyboard=false;}});canvas.addEventListener('pointerleave',()=>state.hover=null);
  canvas.addEventListener('pointerdown',e=>{if(busy())return;e.preventDefault();canvas.focus({preventScroll:true});state.keyboard=false;const p=position(e);if(state.mode==='result')resetView();if(state.tool==='erase'){const i=nearestMember(p);if(i>=0)removeAt(i);else status('Tap close to a beam to erase it.');}else {const n=nearest(p);if(n)choosePoint(n);else status('Choose a construction grid point. Zoom in or use the point controls below.');}});
  canvas.addEventListener('keydown',e=>{
    if(busy())return;const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(moves[e.key]){e.preventDefault();state.keyboard=true;const [x,y]=moves[e.key];state.cursor.x=Math.max(E.LEFT,Math.min(E.RIGHT,state.cursor.x+x*E.STEP));state.cursor.y=Math.max(E.DECK-2*E.STEP,Math.min(E.DECK+2*E.STEP,state.cursor.y+y*E.STEP));state.hover=state.cursor;status(`Point ${pointName(state.cursor)}${state.selected?'. Enter connects.':'. Enter starts a piece.'}`);}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();state.keyboard=true;choosePoint(state.cursor);}
    else if(e.key==='Escape'){state.selected=null;updateHint();status('Connection cancelled.');}
    else if(['1','2','3','4'].includes(e.key)){e.preventDefault();setTool(['road','wood','steel','erase'][Number(e.key)-1]);}
    else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();const i=nearestMember(state.cursor);if(i>=0)removeAt(i);}
  });
  function startTest(){
    if(busy())return;resetView();state.selected=null;state.model=E.prepare(state.members);state.response=null;state.display=[];state.peakStress=0;state.peakDeflection=0;state.carX=100;state.critical=-1;state.gapHit=null;state.mode='testing';state.failedReason='';state.fallTime=0;setEditing(false);$('modeBadge').textContent='TEST RUN';$('testMeter').hidden=false;$('testBtn').hidden=true;$('resetTestBtn').hidden=false;$('sceneHint').textContent='Watch the load move. Where does the stress build?';$('stressReadout').textContent='0%';$('stressFill').style.left='0%';status(`Testing the ${E.vehicles[state.vehicle].name.toLowerCase()} in ${state.wind===0?'calm':state.wind===12?'breezy':'gusty'} conditions. Your design is saved.`);
  }
  $('testBtn').onclick=startTest;$('resetTestBtn').onclick=()=>{resetView();refresh();status('Test stopped. Edit your bridge and test again.');};$('editBtn').onclick=()=>{resetView();refresh();status('Change one thing, then repeat the test to compare.');};
  function fail(reason,r){state.mode='fall';state.failedReason=reason;state.critical=r?.critical??-1;state.fallTime=0;const critical=state.members[state.critical];state.debris=[];
    for(let i=0;i<state.members.length;i++){const m=state.members[i];if(i===state.critical||(m.type==='road'&&Math.abs((m.a.x+m.b.x)/2-state.carX)<150)){
      const a=drawPoint(m.a),b=drawPoint(m.b);state.debris.push({a,b,type:m.type,index:i,x:0,y:0,vy:0,vx:((m.a.x+m.b.x)/2-state.carX)*.25,angle:0,spin:(i%2?1:-1)*.5});
    }}
    for(let i=0;i<18;i++)state.particles.push({x:critical?(critical.a.x+critical.b.x)/2:state.carX,y:critical?(critical.a.y+critical.b.y)/2:E.DECK,vx:(Math.random()-.5)*120,vy:-Math.random()*100,life:1.3,size:2+Math.random()*4});
    $('modeBadge').textContent='BRIDGE FAILED';$('sceneHint').textContent=reason==='gap'?'Road is missing at the highlighted section.':reason==='unstable'?'Part of the structure has no stable support.':reason==='sag'?'The road bent too far under the load.':'A beam reached its strength limit.';
  }
  function finish(pass){
    state.mode='result';const c=challenges[state.challenge],cost=E.cost(state.members),budgetOk=cost<=c.budget,vehicleOk=!c.vehicle||c.vehicle===state.vehicle,mission=pass&&budgetOk&&vehicleOk;
    const stress=Number.isFinite(state.peakStress)?Math.round(state.peakStress*100):null,deflection=Number.isFinite(state.peakDeflection)?Math.round(state.peakDeflection*10)/10:null;
    const trial={id:Date.now(),challenge:state.challenge,vehicle:state.vehicle,wind:state.wind,cost,pass,mission,reason:pass?'crossed':state.failedReason,stress,deflection,members:clone(state.members)};state.trials.push(trial);if(state.trials.length>40)state.trials.shift();state.lastTrial=trial;
    const card=$('resultCard');card.classList.toggle('failed',!mission);$('resultIcon').textContent=mission?'✓':pass?'$':'!';$('resultKicker').textContent=mission?'CHALLENGE COMPLETE':pass?'CROSSING COMPLETE':'TEST SAVED';$('resultTitle').textContent=mission?'Your bridge held!':pass?'It crossed. Keep improving!':'Back to the drawing board.';
    let feedback;if(pass)feedback=!budgetOk?`The ${E.vehicles[state.vehicle].name.toLowerCase()} crossed, but your $${cost} design is over the $${c.budget} budget. Can you make it lighter?`:!vehicleOk?`Good crossing. This challenge needs the ${E.vehicles[c.vehicle].name.toLowerCase()}; try that load next.`:`The ${E.vehicles[state.vehicle].name.toLowerCase()} made it across. Peak stress: ${stress}%. Can you achieve the same result with fewer pieces?`;
    else if(state.failedReason==='gap'){const gap=state.gapHit||state.gaps[0];feedback=`Road is missing${gap?' between points '+gap.section+' and '+(gap.section+1):''}. Choose Road and connect the highlighted points. Wood and steel beams provide bracing; they are not the driving surface.`;}
    else if(state.failedReason==='unstable')feedback='Connect every part of your structure to a supported bridge. Separate pieces cannot carry the load.';
    else if(state.failedReason==='sag')feedback='The deck bent too far. Add triangular bracing to give the load another path to the banks.';
    else {const response=state.response?.stress[state.critical];feedback=`A ${state.members[state.critical]?.type||'bridge'} piece failed${response?' in '+response.mode:''}. Try a shorter beam, more bracing, or steel at the weak spot.`;}
    $('resultText').textContent=feedback;card.hidden=false;$('modeBadge').textContent=mission?'CHALLENGE COMPLETE':pass?'CROSSING COMPLETE':'TEST COMPLETE';$('testBtn').hidden=false;$('testBtn').innerHTML='<span aria-hidden="true">▶</span> TEST AGAIN';$('resetTestBtn').hidden=true;setEditing(true);refresh();status(`${pass?'Crossing complete.':'Bridge failed.'} Trial ${state.trials.length} saved. ${feedback}`);
  }
  function tick(dt){
    if(state.mode==='testing'){
      state.carX+=dt*($('slow').checked?42:140);
      const v=E.vehicles[state.vehicle];
      if(state.carX+v.wheelbase/2>=E.LEFT&&state.carX-v.wheelbase/2<=E.RIGHT){
        if(!state.model.complete){const front=state.carX+v.wheelbase/2;const gap=state.model.gaps.find(g=>front>=g.a.x&&front<g.b.x);if(gap){state.gapHit=gap;fail('gap',null);return;}}
        const r=E.solve(state.model,state.vehicle,state.carX,state.wind);state.response=r;
        if(r.unstable){state.peakStress=Infinity;state.peakDeflection=Infinity;fail('unstable',r);return;}
        state.peakStress=Math.max(state.peakStress,r.maxStress);state.peakDeflection=Math.max(state.peakDeflection,r.maxDeflection);
        state.display=r.displacements;const percent=Math.round(state.peakStress*100);$('stressReadout').textContent=percent+'%';$('stressFill').style.left=Math.min(98,percent)+'%';
        if(r.maxStress>1||r.maxDeflection>45){fail(r.maxDeflection>45?'sag':'stress',r);return;}
      }
      if(state.carX-v.width/2>E.RIGHT+110)finish(true);
    }else if(state.mode==='fall'){
      state.fallTime+=dt;for(const d of state.debris){d.vy+=330*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.angle+=d.spin*dt;}
      for(const p of state.particles){p.vy+=250*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}
      if(state.fallTime>1.6)finish(false);
    }
  }
  function drawPoint(p){if(!state.response||!state.display.length)return {...p};const idx=state.model.map.get(E.key(p));if(idx===undefined)return {...p};return {x:p.x+Math.max(-45,Math.min(45,state.display[idx*3]*E.STEP))*1.35,y:p.y-Math.max(-70,Math.min(70,state.display[idx*3+1]*E.STEP))*1.35};}
  function line(a,b,color,width,dash=[]){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
  function stressColor(r){if(r>.95)return '#e95735';if(r>.65)return '#efb53e';if(r>.38)return '#a9bd67';return '#55a374';}
  function beam(m,a,b,index,ghost=false){
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(dy,dx));if(ghost)ctx.globalAlpha=.45;
    if(m.type==='road'){ctx.fillStyle='#594e40';ctx.fillRect(0,-4,L,13);ctx.fillStyle='#c8b18a';ctx.fillRect(0,3,L,3);ctx.fillStyle='#e1cfac';for(let x=7;x<L;x+=12)ctx.fillRect(x,5,1,4);line({x:0,y:-2},{x:L,y:-2},'#e7dbc1',2);}
    else if(m.type==='wood'){ctx.fillStyle='#694329';ctx.fillRect(-1,-6,L+2,13);const g=ctx.createLinearGradient(0,-5,0,5);g.addColorStop(0,'#e0b26d');g.addColorStop(.45,'#ba854a');g.addColorStop(1,'#a16838');ctx.fillStyle=g;ctx.fillRect(0,-5,L,10);line({x:4,y:-2},{x:L-4,y:-2},'#e6c38e',1);line({x:10,y:3},{x:L-7,y:3},'#83532e',.8);}
    else {ctx.fillStyle='#334d4c';ctx.fillRect(-1,-6,L+2,12);const g=ctx.createLinearGradient(0,-4,0,4);g.addColorStop(0,'#b6ceca');g.addColorStop(.5,'#5c827d');g.addColorStop(1,'#8faaa7');ctx.fillStyle=g;ctx.fillRect(0,-4,L,8);line({x:0,y:-5},{x:L,y:-5},'#d4e2d8',1.5);line({x:0,y:5},{x:L,y:5},'#a2bcb5',1);}
    if((state.stress||busy()||state.mode==='result')&&state.response?.stress[index]){ctx.globalAlpha=ghost?.25:.65;line({x:2,y:0},{x:L-2,y:0},stressColor(state.response.stress[index].ratio),m.type==='road'?7:6);}
    ctx.restore();
  }
  function drawVehicle(x,y,angle=0){const v=E.vehicles[state.vehicle],s=sprite[state.vehicle],h=v.width*s.h/s.w;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.shadowColor='#17372b80';ctx.shadowBlur=7;ctx.shadowOffsetY=4;if(images.vehicles.complete&&images.vehicles.naturalWidth)ctx.drawImage(images.vehicles,s.x,s.y,s.w,s.h,-v.width/2,-h+2,v.width,h);else{ctx.fillStyle='#dfae38';ctx.fillRect(-v.width/2,-30,v.width,24);ctx.fillStyle='#273932';for(const offset of[-v.wheelbase/2,v.wheelbase/2]){ctx.beginPath();ctx.arc(offset,-2,8,0,Math.PI*2);ctx.fill();}}ctx.restore();}
  function roadY(x){if(x<E.LEFT||x>E.RIGHT||!state.model||!state.display.length)return E.DECK;const i=Math.max(0,Math.min(7,Math.floor((x-E.LEFT)/E.STEP))),a=drawPoint({x:E.LEFT+i*E.STEP,y:E.DECK}),b=drawPoint({x:E.LEFT+(i+1)*E.STEP,y:E.DECK});return a.y+(b.y-a.y)*(x-a.x)/E.STEP;}
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle='#629796';ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';
    if(images.valley.complete&&images.valley.naturalWidth)ctx.drawImage(images.valley,0,0,1200,675);else{const g=ctx.createLinearGradient(0,0,0,675);g.addColorStop(0,'#accdd6');g.addColorStop(.6,'#62998b');g.addColorStop(1,'#315e58');ctx.fillStyle=g;ctx.fillRect(0,0,1200,675);}
    // A narrow approach joins the painted roads exactly to the fixed anchors.
    for(const [a,b]of[[{x:0,y:E.DECK},{x:E.LEFT,y:E.DECK}],[{x:E.RIGHT,y:E.DECK},{x:1200,y:E.DECK}]]){line(a,b,'#766452',11);line({x:a.x,y:a.y-2},{x:b.x,y:b.y-2},'#d5c5a0',3);}
    if(state.grid&&state.mode==='build'){
      ctx.save();line({x:E.LEFT,y:E.DECK},{x:E.RIGHT,y:E.DECK},'#f6e4ab90',1.5,[6,7]);
      for(const p of points){const occupied=state.members.some(m=>E.key(m.a)===E.key(p)||E.key(m.b)===E.key(p));if(!occupied){ctx.beginPath();ctx.arc(p.x,p.y,2.5/Math.max(.7,scale),0,Math.PI*2);ctx.fillStyle='#fff4ce85';ctx.fill();}}ctx.restore();
    }
    const debrisIndices=new Set(state.debris.map(d=>d.index));
    // Draw supports, then the road, so the driving surface remains visible.
    for(const road of[false,true])state.members.forEach((m,i)=>{if((m.type==='road')!==road||debrisIndices.has(i))return;beam(m,drawPoint(m.a),drawPoint(m.b),i);});
    const occupied=new Map();for(const m of state.members)for(const p of[m.a,m.b])occupied.set(E.key(p),p);
    for(const p of occupied.values()){const d=drawPoint(p);ctx.beginPath();ctx.arc(d.x,d.y,4.5,0,Math.PI*2);ctx.fillStyle='#cfbb90';ctx.fill();ctx.strokeStyle='#6a5b40';ctx.lineWidth=1.4;ctx.stroke();ctx.beginPath();ctx.arc(d.x,d.y,1.2,0,Math.PI*2);ctx.fillStyle='#665e48';ctx.fill();}
    for(const x of[E.LEFT,E.RIGHT]){ctx.fillStyle='#536659';ctx.fillRect(x-12,E.DECK+4,24,14);ctx.fillStyle='#d7b363';ctx.fillRect(x-10,E.DECK-5,20,13);ctx.strokeStyle='#795a30';ctx.lineWidth=2;ctx.strokeRect(x-10,E.DECK-5,20,13);for(const dx of[-5,5]){ctx.beginPath();ctx.arc(x+dx,E.DECK+1,1.6,0,Math.PI*2);ctx.fillStyle='#655133';ctx.fill();}}
    if(state.gaps.length){
      for(const gap of state.gaps){line(gap.a,gap.b,'#823c25',5/scale);line(gap.a,gap.b,'#ffe3ad',3/scale,[7/scale,5/scale]);}
      const gap=state.gapHit||state.gaps[0],label='ADD ROAD',x=(gap.a.x+gap.b.x)/2,y=E.DECK+24/scale;
      ctx.save();ctx.font=`800 ${12/scale}px "Nunito Sans",system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';const w=ctx.measureText(label).width+14/scale;ctx.fillStyle='#fff0cdef';ctx.fillRect(x-w/2,y-11/scale,w,22/scale);ctx.fillStyle='#813c25';ctx.fillText(label,x,y);ctx.restore();
    }
    if(state.mode==='build'){
      if(state.selected&&state.hover&&E.key(state.selected)!==E.key(state.hover))beam({type:state.tool==='erase'?'wood':state.tool},state.selected,state.hover,-1,true);
      for(const [p,color]of[[state.hover,'#fff2b4'],[state.selected,'#efac43']])if(p){ctx.beginPath();ctx.arc(p.x,p.y,10/scale,0,Math.PI*2);ctx.fillStyle=color+'45';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2/scale;ctx.stroke();}
      drawVehicle(155,E.DECK);
    }else if(state.mode==='testing'||(state.mode==='result'&&!state.failedReason)){
      const v=E.vehicles[state.vehicle],y1=roadY(state.carX-v.wheelbase/2),y2=roadY(state.carX+v.wheelbase/2);drawVehicle(state.carX,(y1+y2)/2,Math.atan2(y2-y1,v.wheelbase));
    }
    if(state.mode==='fall'||(state.mode==='result'&&state.failedReason)){
      for(const d of state.debris){ctx.save();const mx=(d.a.x+d.b.x)/2,my=(d.a.y+d.b.y)/2;ctx.translate(mx+d.x,my+d.y);ctx.rotate(d.angle);beam({type:d.type},{x:d.a.x-mx,y:d.a.y-my},{x:d.b.x-mx,y:d.b.y-my},-1);ctx.restore();}
      const ft=Math.min(state.fallTime,1.6),drop=165*ft*ft;drawVehicle(state.carX+ft*40,E.DECK+drop,ft*.42);
      for(const p of state.particles)if(p.life>0){ctx.globalAlpha=Math.min(1,p.life);ctx.fillStyle='#deb46d';ctx.fillRect(p.x,p.y,p.size,p.size);}ctx.globalAlpha=1;
      if(ft>1.25){ctx.strokeStyle='#ecf8eaaa';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(state.carX+ft*40,E.DECK+265,(ft-1.25)*110,8+(ft-1.25)*15,0,0,Math.PI*2);ctx.stroke();}
    }
    // Gentle glints follow the painted river; reduced-motion users get a still scene.
    if(!reducedMotion){const phase=performance.now()/1400;ctx.globalAlpha=.18;ctx.strokeStyle='#e9f5dc';ctx.lineWidth=1.3;for(let i=0;i<5;i++){const x=480+i*47+Math.sin(phase+i)*12,y=525+i*20;line({x,y},{x:x+15,y:y-3},'#eff9eb',1.3);}ctx.globalAlpha=1;}
    ctx.restore();
  }
  function loop(time){const elapsed=Math.min(1,state.lastTime?(time-state.lastTime)/1000:0);state.lastTime=time;let remaining=elapsed;while(remaining>0){const step=Math.min(.025,remaining);tick(step);remaining-=step;}draw();requestAnimationFrame(loop);}
  document.addEventListener('visibilitychange',()=>{state.lastTime=0;});
  function openDialog(id){const dlg=$(id);if(!dlg.open)dlg.showModal();}
  $('helpBtn').onclick=()=>openDialog('helpDialog');$('notebookBtn').onclick=()=>{renderTrials();openDialog('notebookDialog');};$('viewTrialBtn').onclick=()=>{renderTrials();openDialog('notebookDialog');};
  document.querySelectorAll('.close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  function renderTrials(){
    const target=$('trialList');target.replaceChildren();if(!state.trials.length){const empty=document.createElement('p');empty.className='empty-notebook';empty.textContent='Your first test starts the story. Send a vehicle across to record a trial.';target.append(empty);return;}
    state.trials.slice().reverse().forEach((t,i)=>{const article=document.createElement('article');article.className='trial';const body=document.createElement('div'),title=document.createElement('strong');title.textContent=`Trial ${state.trials.length-i} · ${E.vehicles[t.vehicle]?.name||'Vehicle'}`;const outcome=document.createElement('span');outcome.className='trial-status'+(t.pass?'':' failed');outcome.textContent=t.pass?' · crossed':' · failed';title.append(outcome);body.append(title);const desc=document.createElement('p');desc.textContent=`${challenges[t.challenge]?.name||'Free build'} · ${t.wind===0?'Calm':t.wind===12?'Breezy':'Gusty'} · ${t.members.length} pieces`;body.append(desc);const metrics=document.createElement('div');metrics.className='trial-metrics';metrics.textContent=`Cost $${t.cost}   ·   Peak stress ${t.stress===null?'unsupported':t.stress+'%'}   ·   Bend ${t.deflection===null?'—':t.deflection+' px'}`;body.append(metrics);article.append(body);const restore=document.createElement('button');restore.className='quiet';restore.textContent='Restore design';restore.disabled=busy();restore.onclick=()=>{remember();state.members=clone(E.validate(t.members));state.challenge=t.challenge;state.vehicle=t.vehicle;state.wind=t.wind;state.tool=E.roadComplete(state.members)?'wood':'road';resetView();refresh();$('notebookDialog').close();status('Trial design and test conditions restored. Ready to repeat or improve.');};article.append(restore);target.append(article);});
  }
  $('reflection').value=state.reflection;$('reflection').addEventListener('input',()=>{clearTimeout(statusTimer);statusTimer=setTimeout(persist,400);});
  function download(name,type,content){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('saveBtn').onclick=()=>{download('my-bridge.json','application/json',JSON.stringify({format:'bridge-test-lab',version:1,members:state.members,challenge:state.challenge,vehicle:state.vehicle,wind:state.wind},null,2));status('Bridge file saved. Open it later to continue the design.');};
  $('loadBtn').onclick=()=>$('bridgeFile').click();$('bridgeFile').onchange=async()=>{const file=$('bridgeFile').files[0];if(!file)return;try{if(file.size>100000)throw new Error('That bridge file is too large.');const data=JSON.parse(await file.text());if(data.format!=='bridge-test-lab'||data.version!==1)throw new Error('Choose a Bridge Test Lab design file.');const members=E.validate(data.members);if(!challenges[data.challenge]||!E.vehicles[data.vehicle]||![0,12,28].includes(data.wind))throw new Error('This file has invalid test settings.');remember();state.members=members;state.challenge=data.challenge;state.vehicle=data.vehicle;state.wind=data.wind;state.tool=E.roadComplete(members)?'wood':'road';resetView();refresh();status(E.roadComplete(members)?'Your bridge is open. Ready to build and test.':'Your bridge is open. Add Road in the highlighted sections before the vehicle can cross.');}catch(err){status(err instanceof SyntaxError?'That file is not valid JSON. Choose a saved bridge file.':err.message);}$('bridgeFile').value='';};
  const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';$('exportBtn').onclick=()=>{const rows=[['Trial','Challenge','Vehicle','Wind','Cost','Crossed','Challenge complete','Peak stress %','Peak bend px','Pieces'],...state.trials.map((t,i)=>[i+1,challenges[t.challenge]?.name,E.vehicles[t.vehicle]?.name,t.wind===0?'Calm':t.wind===12?'Breezy':'Gusty',t.cost,t.pass?'Yes':'No',t.mission?'Yes':'No',t.stress,t.deflection,t.members.length]),[],['My evidence',$('reflection').value]];download('bridge-test-notebook.csv','text/csv',rows.map(row=>row.map(csv).join(',')).join('\r\n'));};$('printBtn').onclick=()=>window.print();
  for(const image of Object.values(images))image.onerror=()=>{if(!assetWarning){assetWarning=true;status('The artwork could not load. Building and bridge tests are still available.');}};
  resize();refresh();status(state.gaps.length?'Road is selected. Fill the highlighted Road sections first, then add Wood or Steel bracing.':'Road connected. Wood and Steel add bracing; test the design or try removing a diagonal.');requestAnimationFrame(loop);
})();
