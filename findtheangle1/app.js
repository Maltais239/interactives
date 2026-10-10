(()=>{'use strict';
const $=id=>document.getElementById(id),svgNS='http://www.w3.org/2000/svg',C={x:320,y:305},R=250;
const modes=['build','measure','classify','missing','triangle'];
const state={mode:'build',level:'starter',round:0,score:0,angle:0,target:90,correct:0,locked:false,attempts:0,supported:false,known:[],answer:''};
function clamp(x){return Math.max(0,Math.min(180,Math.round(Number(x)||0)))}
function point(angle,r=R){const t=angle*Math.PI/180;return{x:C.x+r*Math.cos(t),y:C.y-r*Math.sin(t)}}
function node(tag,attrs={},value){let n=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(value!==undefined)n.textContent=value;return n}
for(let a=0;a<=180;a+=5){const p=point(a),q=point(a,R-(a%10?10:18));$('ticks').append(node('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y}));if(a%10===0){const p=point(a,R-38);$('ticks').append(node('text',{x:p.x,y:a===0||a===180?330:p.y+3},String(a)))}}
const nextButton=$('next'),checkButton=$('check'),hintButton=$('hint');
function classOf(a){return a===180?'straight':a===90?'right':a<90?'acute':'obtuse'}
function random(min,max,step=1){const count=Math.floor((max-min)/step)+1;return min+Math.floor(Math.random()*count)*step}
function setFeedback(message,type=''){$('feedback').textContent=message;$('feedback').className='feedback '+type}
function updateAngle(v){if(state.locked)return;state.angle=clamp(v);const p=point(state.angle),small=point(state.angle,65);
$('arm').setAttribute('x2',p.x);$('arm').setAttribute('y2',p.y);
$('handle').setAttribute('cx',p.x);$('handle').setAttribute('cy',p.y);
$('arc').setAttribute('d',state.angle===0?'':`M320 305 L385 305 A65 65 0 0 0 ${small.x} ${small.y} Z`);
$('angle-slider').value=state.angle;
$('protractor').setAttribute('aria-label',`Angle protractor; angle ${state.angle} degrees. Use arrow keys to adjust.`);
if(state.mode==='build'&&$('measure').checked){state.supported=true;$('target').textContent=state.target+'°';setFeedback('Current angle: '+state.angle+'°. Try matching the target.')}
}
function resetVisual(){state.locked=false;state.attempts=0;state.supported=false;state.answer='';$('answer').value='';$('angle-slider').disabled=false;checkButton.disabled=false;nextButton.hidden=true;checkButton.hidden=false;hintButton.hidden=false;setFeedback('Try for a first-try star!');}
function start(){resetVisual();const step=state.level==='starter'?10:1;const mode=state.mode;
const isProtractor=['build','measure','classify','missing'].includes(mode);
$('triangle').hidden=mode!=='triangle';$('protractor').hidden=!isProtractor;
$('build-controls').hidden=mode!=='build';$('answer-controls').hidden=!['measure','missing','triangle'].includes(mode);$('choices').hidden=mode!=='classify';
$('live-wrap').hidden=mode!=='build';
$('protractor').classList.toggle('draggable',mode==='build');
$('round').textContent=`${state.round+1} / 8`;$('score').textContent=state.score+' ★';
if(mode==='build'){state.target=random(1,17,1)*10;if(step===1)state.target=random(10,170);$('target').textContent=state.target+'°';$('question').textContent='Build this angle. Drag the blue arm!';}
if(mode==='measure'){state.target=random(1,17)*10;if(step===1)state.target=random(10,170);$('target').textContent='?';$('question').textContent='How many degrees is the blue angle?';}
if(mode==='classify'){state.target=[90,180,random(1,8)*10,random(10,17)*10][random(0,3)];$('target').textContent='Name it';$('question').textContent='What type of angle is this?';}
if(mode==='missing'){const total=Math.random()<.5?90:180;state.target=random(1,Math.floor((total-10)/step))*step;state.correct=total-state.target;$('target').textContent='?';$('question').textContent=`The two angles total ${total}°. One is ${state.target}°. What is the other?`;}
if(mode==='triangle'){const a=random(3,8)*10,b=random(3,Math.floor((160-a)/10))*10;state.known=[a,b];state.correct=180-a-b;$('tri-a').textContent=a+'°';$('tri-b').textContent=b+'°';$('target').textContent='?';$('question').textContent='A triangle has 180°. Find the missing angle.'}
state.angle=0; // visual display is updated directly to support read-only question modes
const displayed=mode==='build'?0:state.target;
state.locked=false;updateAngle(displayed); if(mode!=='build')state.angle=displayed;
$('angle-slider').disabled=mode!=='build';
if(mode==='measure'||mode==='classify'||mode==='missing'){$('arm').setAttribute('opacity','1')}
}
function selectMode(mode){if(!modes.includes(mode))return;state.mode=mode;state.round=0;state.score=0;
document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));start()}
function finish(correct,text){if(correct){if(state.attempts===0&&!state.supported)state.score++;state.locked=true;$('score').textContent=state.score+' ★';setFeedback(text,'good');checkButton.hidden=true;hintButton.hidden=true;nextButton.hidden=false;nextButton.textContent=state.round===7?'See results →':'Next challenge →';$('angle-slider').disabled=true;
}else{state.attempts++;setFeedback(text,'warn')}}
function check(){if(state.locked)return;const m=state.mode;if(m==='classify')return;let response=m==='build'?state.angle:Number($('answer').value);if(m!=='build'&&$('answer').value.trim()===''){setFeedback('Enter your answer in degrees first.','warn');$('answer').focus();return}
if(!Number.isFinite(response)||response<0||response>180){setFeedback('Enter an angle from 0° to 180°.','warn');return}
const actual=m==='build'||m==='measure'?state.target:state.correct;
const diff=Math.abs(actual-response),tolerance=m==='build'?2:0;
finish(diff<=tolerance,diff<=tolerance?`Yes! ${response}° is correct. ${state.attempts===0&&!state.supported?'First try! ★':'Nice work!'}`:`${response}° is ${response<actual?'too small':'too large'}. Try again!`)}
function hint(){state.supported=true;const m=state.mode;
if(m==='triangle')setFeedback('The three interior angles of a triangle add to 180°. Subtract the two given angles.');
else if(m==='missing')setFeedback('Subtract '+state.target+'° from '+(state.target+state.correct)+'°.');
else if(m==='classify')setFeedback('Acute < 90°, right = 90°, obtuse is between 90° and 180°, straight = 180°.');
else if(m==='measure')setFeedback('Read the scale starting at 0° on the right. Count the tick marks.');
else setFeedback('Use the small tick marks on the protractor. 90° is straight up.');}
function complete(){state.locked=true;$('round').textContent='8 / 8';$('target').textContent='★';$('question').textContent='Round complete!';$('triangle').hidden=true;$('protractor').hidden=true;
$('build-controls').hidden=true;$('answer-controls').hidden=true;$('choices').hidden=true;
checkButton.hidden=true;hintButton.hidden=true;nextButton.hidden=true;
setFeedback(`You finished 8 challenges and earned ${state.score} first-try stars! Choose another activity or start over.`,'good')}
function pointerAngle(e){const svg=$('protractor'),ctm=svg.getScreenCTM();if(!ctm)return null;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(ctm.inverse());return Math.atan2(Math.max(0,C.y-p.y),p.x-C.x)*180/Math.PI}
let active=null;const protractor=$('protractor');
protractor.addEventListener('pointerdown',e=>{if(state.mode!=='build'||state.locked||e.button>0)return;active=e.pointerId;protractor.setPointerCapture?.(e.pointerId);const a=pointerAngle(e);if(a!==null)updateAngle(a);e.preventDefault()});
protractor.addEventListener('pointermove',e=>{if(active!==e.pointerId)return;const a=pointerAngle(e);if(a!==null)updateAngle(a)});
function release(e){if(active===e.pointerId){active=null;try{protractor.releasePointerCapture(e.pointerId)}catch(_){}}}
protractor.addEventListener('pointerup',release);protractor.addEventListener('pointercancel',release);protractor.addEventListener('lostpointercapture',()=>{active=null});
protractor.addEventListener('keydown',e=>{if(state.mode!=='build'||state.locked)return;let delta={'ArrowRight':1,'ArrowUp':1,'ArrowLeft':-1,'ArrowDown':-1,'PageUp':10,'PageDown':-10}[e.key];if(delta){e.preventDefault();updateAngle(state.angle+delta)}else if(e.key==='Home'||e.key==='End'){e.preventDefault();updateAngle(e.key==='Home'?0:180)}});
$('angle-slider').addEventListener('input',e=>updateAngle(e.target.value));$('minus').onclick=()=>updateAngle(state.angle-1);$('plus').onclick=()=>updateAngle(state.angle+1);
$('measure').onchange=()=>{if($('measure').checked){state.supported=true;setFeedback('Current angle: '+state.angle+'°')}else setFeedback('Degrees hidden. Use the marks to measure.')};
checkButton.onclick=check;hintButton.onclick=hint;
$('answer').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();check()}});
document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{if(state.mode!=='classify'||state.locked)return;const chosen=b.dataset.answer,correct=classOf(state.target);finish(chosen===correct,chosen===correct?`Correct! ${state.target}° is a ${correct} angle.`:`Not quite. ${chosen} is not the right classification. Try again.`)}));
nextButton.onclick=()=>{if(!state.locked)return;if(state.round===7){complete();return}state.round++;start()};
$('restart').onclick=()=>{state.round=0;state.score=0;start()};
$('level').onchange=e=>{state.level=e.target.value;state.round=0;state.score=0;start()};
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.mode)));
start();
})();