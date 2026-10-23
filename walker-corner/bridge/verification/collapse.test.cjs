const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../engine.js');
const source=fs.readFileSync(path.join(__dirname,'..',process.env.BRIDGE_APP_SOURCE||'app.js'),'utf8');
// Exercise the real animation and drawing functions without adding game debug hooks.
const section=(from,to)=>source.slice(source.indexOf(from),source.indexOf(to,source.indexOf(from)));
const functions=[section('  function fail(', '  function finish('),section('  function tick(', '  function line('),section('  function roadY(', '  function connectionAllowed('),section('  function draw(){','  function loop(')].join('\n');
function runtime(vehicle,slow,members=E.starter('beam')){
  const state={vehicle,members,mode:'testing',carX:100,wind:0,loadPercent:100,model:E.prepare(members),response:null,display:[],peakStress:0,peakDeflection:0,failedReason:'',fallTime:0,debris:[],particles:[],gaps:[],guides:false,grid:false};
  const gradient={addColorStop(){}},ctx=new Proxy({createLinearGradient:()=>gradient},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  const sandbox={E,state,ctx,Math,Set,Map,width:1200,height:675,dpr:1,ox:0,oy:0,scale:1,reducedMotion:true,images:{valley:{}},points:[],pose:null,$:()=>({checked:slow,style:{}}),busy:()=>state.mode==='testing'||state.mode==='fall',line(){},beam(){},drawVehicle(x,y,angle=0){sandbox.pose={x,y,angle};},finish(){state.mode='result';state.display=[];state.debris=[];}};
  vm.createContext(sandbox);vm.runInContext(functions+'\nthis.animate={tick,draw,fail};',sandbox);return sandbox;
}
const near=(a,b,message,tolerance=1e-8)=>assert(Math.abs(a-b)<tolerance,`${message}: ${a} vs ${b}`);
let cases=0,largestJump=0;
for(const vehicle of Object.keys(E.vehicles))for(const slow of [false,true]){
  const run=runtime(vehicle,slow),{state,animate}=run,dt=1/60;
  let previous;
  for(let frame=0;frame<2400&&state.mode==='testing';frame++){
    animate.draw();previous={...run.pose};animate.tick(dt);
  }
  assert.equal(state.mode,'fall',`${vehicle} should fail on the road-only bridge`);
  animate.draw();const first={...run.pose},speed=slow?42:140;
  const jump=first.y-previous.y;largestJump=Math.max(largestJump,Math.abs(jump));
  assert(Math.abs(jump)<3,`${vehicle} must not jump vertically at collapse: ${jump}`);
  assert(Math.abs(first.angle-previous.angle)<.03,`${vehicle} must retain its tilt`);
  near(first.x-previous.x,speed*dt,`${vehicle} keeps forward movement at failure`);
  animate.tick(dt);animate.draw();const next={...run.pose};
  near((next.x-first.x)/dt,speed,`${vehicle} keeps its driving speed during the fall`);
  assert(next.y>first.y,`${vehicle} falls down from the sagging deck`);
  assert(Math.abs(next.angle-first.angle)<.01,`${vehicle} tips smoothly`);
  for(let frame=0;frame<120;frame++){animate.tick(dt);animate.draw();assert(Number.isFinite(run.pose.x)&&Number.isFinite(run.pose.y)&&Number.isFinite(run.pose.angle));}
  assert.equal(state.mode,'result');const end={...run.pose};animate.draw();assert.deepEqual(run.pose,end,'Result must retain the final falling pose');cases++;
}
// All failure paths preserve the same position and angle, including gaps and an unstable structure.
for(const reason of ['gap','unstable','stress','sag']){
  const run=runtime('car',false),{state,animate}=run;state.carX=450;state.response=E.solve(state.model,'car',state.carX,0,100);state.display=state.response.displacements;
  animate.draw();const before={...run.pose};animate.fail(reason,state.response);animate.draw();
  near(run.pose.x,before.x,reason+' position');near(run.pose.y,before.y,reason+' height');near(run.pose.angle,before.angle,reason+' angle');cases++;
}
console.log(JSON.stringify({cases,vehicles:7,speeds:2,largestFrameMovement:+largestJump.toFixed(4),continuousCollapse:true}));
