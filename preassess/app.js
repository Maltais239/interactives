'use strict';
// Visual-first Number Studio. The shared NumberLab engine supplies the math and adaptive levels.
const N=NumberLab,$=id=>document.getElementById(id),key='bgsd-number-studio-v2';
const startRecord=Studio.read(key,null);
let record={progress:N.fresh(),history:[],session:null};
const validRecord=r=>r&&r.version===2&&N.skills.every(s=>r.progress?.[s]&&Number.isInteger(r.progress[s].level)&&r.progress[s].level>=0&&r.progress[s].level<=4&&Array.isArray(r.progress[s].window))&&Array.isArray(r.history);
if(validRecord(startRecord))record=startRecord;
let skill='build',view='practice',round=0,q=null,answered=false,wrong=false,assisted=false,adjustment='',practiceParts=[0,0,0,0,0],lab=[0,0,3,5,2];
const names={bonds:'Break a number',build:'Build a number',models:'Read a model',trade:'Trade'};
const shortHelp={bonds:'Count on from the known part to the whole.',build:'Look at each place. Ten ones can make one ten.',models:'Count the hundreds, then tens, then ones.',trade:'Ten smaller blocks have the same value as one larger block.'};
function persist(){record.version=2;if(!Studio.save(key,record))$('storage-status').textContent='Saving is unavailable here. You can download your record from Progress.'}
function rememberSession(){record.session={skill,round,q,answered,wrong,assisted,adjustment,practiceParts:[...practiceParts],adaptive:$('adaptive').checked};persist()}
const number=n=>n.toLocaleString();
const onesWords=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tensWords=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function underThousand(n){
 if(n<20)return n?onesWords[n]:'';
 if(n<100)return tensWords[Math.floor(n/10)]+(n%10?'-'+onesWords[n%10]:'');
 const remainder=n%100;
 return onesWords[Math.floor(n/100)]+' hundred'+(remainder?' '+underThousand(remainder):'');
}
function numberWords(n){
 // The five adaptive ranges stop at 99,999.
 if(!Number.isSafeInteger(n)||n<0||n>99999)return number(n);
 if(n===0)return 'zero';
 if(n<1000)return underThousand(n);
 return underThousand(Math.floor(n/1000))+' thousand'+(n%1000?' '+underThousand(n%1000):'');
}
function stageModel(p){
 // Keep every place as a tangible base-ten model; don't suddenly switch
 // to numbered counters when thousands are added.
 const styles=['ten-thousand','thousand','hundred','ten','one'];
 const containers=['ten-thousands','thousands','hundreds','tens','ones'];
 const labels=['Ten thousands','Thousands','Hundreds','Tens','Ones'];
 const caption=p.map((count,i)=>count?count+' '+labels[i]:'').filter(Boolean).join(', ')||'No blocks';
 const groups=p.map((count,i)=>{
  if(!count)return '';
  const shown=Math.min(count,20),remaining=count-shown;
  const pieces='<i class="'+styles[i]+'" aria-hidden="true"></i>'.repeat(shown);
  const overflow=remaining?'<span class="more-blocks">+'+remaining+'</span>':'';
  // Only label higher places and crowded groups, avoiding text-heavy early practice.
  const heading=i<2||count>9?'<span class="group-label">'+count+' '+labels[i]+'</span>':'';
  return '<div class="model-group model-'+containers[i]+'"><div class="model-pieces">'+pieces+overflow+'</div>'+heading+'</div>';
 }).join('');
 return '<div class="blocks" role="img" aria-label="'+caption+'">'+groups+'</div>';
}
function indices(level){
 // Include a tens column even in Within 10, since 10 must be buildable.
 const first=level>=4?0:level>=2?2:3;
 return Array.from({length:5-first},(_,j)=>j+first);
}
function placeChart(p,mode,level){
 const cols=mode==='lab'?[0,1,2,3,4]:indices(level);
 return '<div class="place-chart" style="--places:'+cols.length+'" role="group" aria-label="Place value chart">'+cols.map(i=>{
  const value=p[i],disablePlus=value>= (mode==='lab'?30:9) || mode==='lab' && N.total(p)+N.values[i]>99999;
  return '<div class="place-column"><header>'+N.places[i]+'</header><div class="place-value" aria-label="'+value+' '+N.places[i]+'">'+value+'</div><div class="column-actions"><button type="button" data-place="'+i+'" data-delta="-1" '+(!value?'disabled':'')+' aria-label="Remove one '+N.places[i]+'">−</button><button type="button" data-place="'+i+'" data-delta="1" '+(disablePlus?'disabled':'')+' aria-label="Add one '+N.places[i]+'">+</button></div></div>'
 }).join('')+'</div>';
}
function setFeedback(msg,type=''){$('feedback').textContent=msg;$('feedback').className=type}
function showButtons(){
 $('check').hidden=answered;$('next').hidden=!answered;
 $('hint').disabled=answered;$('reveal').disabled=answered;
}
function updateSelector(){
 $('skill-select').innerHTML=N.skills.map(s=>'<option value="'+s+'">'+names[s]+'</option>').join('');
 $('skill-select').value=skill;
 $('skill-tabs').innerHTML=N.skills.map(s=>'<button type="button" data-skill="'+s+'" aria-pressed="'+(s===skill)+'">'+names[s]+'</button>').join('');
}
function renderDots(){
 $('question-dots').innerHTML=Array.from({length:10},(_,i)=>'<i class="dot '+(i<round?'done':'')+'"></i>').join('');
 $('question-dots').setAttribute('aria-label',(round+1)+' of 10 questions');
}
function renderPractice(){
 updateSelector();renderDots();
 $('question-count').textContent=(round+1)+' / 10';
 $('level-tag').textContent=N.levels[q.level];
 $('skill-title').textContent=names[skill];
 $('start-level').value=record.progress[skill].level;
 const stage=$('stage-content'),answer=$('answer-area'),prompt=$('question');
 $('help-text').textContent=shortHelp[skill];
 $('help-panel').open=false;
 if(skill==='build'){
  prompt.innerHTML='<h2>Build '+numberWords(q.n)+'</h2>';
  stage.innerHTML=N.total(practiceParts)?stageModel(practiceParts):'<div class="stage-empty">Tap + to add blocks</div>';
  answer.innerHTML=placeChart(practiceParts,'practice',q.level);
 } else if(skill==='bonds'){
  prompt.innerHTML='<h2>'+number(q.n)+' = '+number(q.first)+' + ?</h2>';
  stage.innerHTML=stageModel(N.parts(q.first));
  answer.innerHTML='<label class="sr-only" for="answer">Missing part</label><input id="answer" type="number" min="0" step="1" inputmode="numeric" placeholder="?" aria-label="Missing part">';
 } else if(skill==='models'){
  prompt.innerHTML='<h2>What number?</h2>';
  stage.innerHTML=stageModel(q.parts);
  answer.innerHTML='<label class="sr-only" for="answer">Number shown</label><input id="answer" type="number" min="0" step="1" inputmode="numeric" placeholder="?" aria-label="Number shown">';
 } else {
  prompt.innerHTML='<h2>How many altogether?</h2>';
  stage.innerHTML=stageModel(q.parts);
  answer.innerHTML='<label class="sr-only" for="answer">Total value</label><input id="answer" type="number" min="0" step="1" inputmode="numeric" placeholder="?" aria-label="Total value">';
 }
 // A restored completed question remains readable; Next is the only required action.
 if(answered){
  if(skill==='build')answer.querySelectorAll('button').forEach(b=>b.disabled=true);
  else {const input=$('answer');if(input){input.value=q.answer;input.disabled=true}}
  setFeedback(N.explanation(q)+' '+adjustment);
 }else setFeedback('');
 showButtons();
}
function startQuestion(){
 answered=false;wrong=false;assisted=false;adjustment='';practiceParts=[0,0,0,0,0];
 q=N.makeQuestion(skill,record.progress[skill].level,Math.floor(Math.random()*0x7fffffff));
 rememberSession();renderPractice();
}
function chooseSkill(s){
 if(!N.skills.includes(s)||s===skill)return;
 skill=s;round=0;startQuestion();
}
function setView(name){
 if(!['practice','lab','progress'].includes(name))return;
 view=name;
 for(const v of ['practice','lab','progress'])$(v+'-view').hidden=v!==name;
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
 if(name==='lab')renderLab();
 if(name==='progress')renderProgress();
}
function updateBuild(i,delta){
 if(answered||skill!=='build'||!indices(q.level).includes(i))return;
 practiceParts[i]=Math.min(9,Math.max(0,practiceParts[i]+delta));
 $('stage-content').innerHTML=N.total(practiceParts)?stageModel(practiceParts):'<div class="stage-empty">Tap + to add blocks</div>';
 const chart=$('answer-area');
 // Update the existing controls in place so repeated taps don't rebuild buttons
 // or steal focus as the learner changes a number.
 chart.querySelectorAll('.place-column').forEach(column=>{
  const plus=column.querySelector('[data-delta="1"]');
  const minus=column.querySelector('[data-delta="-1"]');
  if(!plus||!minus)return;
  const place=Number(plus.dataset.place);
  const digit=practiceParts[place];
  const count=column.querySelector('.place-value');
  if(count){count.textContent=String(digit);count.setAttribute('aria-label',digit+' '+N.places[place]);}
  plus.disabled=digit>=9;
  minus.disabled=digit<=0;
 });
 rememberSession();
}
function hint(){
 if(answered)return;
 assisted=true;rememberSession();
 setFeedback(shortHelp[skill]);
}
function finish(correct){
 if(answered)return;
 answered=true;
 const independent=correct&&!wrong&&!assisted;
 adjustment=N.adapt(record.progress,skill,independent,wrong||assisted,$('adaptive').checked);
 record.history.push({skill,level:q.level,number:q.n,firstTry:independent,supported:wrong||assisted,date:new Date().toISOString().slice(0,10)});
 record.history=record.history.slice(-100);
 rememberSession();
 setFeedback((correct?'Great work! ':'Here is the answer. ')+N.explanation(q)+' '+adjustment);
 if(skill==='build')$('answer-area').querySelectorAll('button').forEach(b=>b.disabled=true);
 else if($('answer'))$('answer').disabled=true;
 showButtons();
 $('help-panel').open=false;
}
function checkAnswer(){
 if(answered)return;
 const response=skill==='build'?practiceParts:$('answer')?.value;
 const ok=N.check(q,response);
 if(ok===null){setFeedback(skill==='build'?'Choose some blocks first.':'Enter a whole number.', 'error');return}
 if(ok){finish(true);return}
 wrong=true;assisted=true;rememberSession();
 setFeedback(skill==='build'?'Check each place. Try adding or removing blocks.':'Not quite. Count the blocks and try again.','error');
}
function nextQuestion(){
 if(!answered)return;
 round++;
 if(round===10){
  $('question').innerHTML='<h2>Great work!</h2>';
  $('stage-content').innerHTML='<div class="stage-empty">You finished ten questions ★</div>';
  $('answer-area').innerHTML='';
  $('question-count').textContent='10 / 10';
  $('question-dots').innerHTML=Array.from({length:10},()=>'<i class="dot done"></i>').join('');
  $('check').hidden=true;$('next').textContent='Play again';$('next').hidden=false;
  setFeedback('Choose Play again or pick another activity.');
  record.session=null;persist();return;
 }
 $('next').textContent='Next →';startQuestion();
}
function restartRound(){
 record.progress[skill].level=Number($('start-level').value);
 record.progress[skill].window=[];
 round=0;$('next').textContent='Next →';startQuestion();
}
function renderLab(){
 $('lab-total').textContent=number(N.total(lab));
 $('lab-model').innerHTML=N.total(lab)?stageModel(lab):'<div class="stage-empty">Tap + to add blocks</div>';
 $('lab-controls').innerHTML=placeChart(lab,'lab',4);
 $('lab-number').value=N.total(lab);
 $('lab-trade').disabled=!canTrade();
}
function canTrade(){return lab.some((v,i)=>i<4&&v>0&&lab[i+1]<=20)||lab.some((v,i)=>i>0&&v>=10&&lab[i-1]<30)}
function adjustLab(i,delta){
 if(i<0||i>4)return;
 const next=[...lab];next[i]=Math.max(0,Math.min(30,next[i]+delta));
 if(N.total(next)>99999)return;
 lab=next;
 $('lab-feedback').textContent='';
 renderLab();
}
function tradeLab(){
 const old=N.total(lab);
 // Split one larger unit into ten smaller ones, with the smallest available place first.
 let i=-1;
 for(let at=3;at>=0;at--)if(lab[at]>0&&lab[at+1]<=20){i=at;break}
 if(i>=0){
  lab[i]--;lab[i+1]+=10;
  $('lab-feedback').textContent='1 '+N.places[i].toLowerCase().replace(/s$/,'')+' = 10 '+N.places[i+1].toLowerCase()+'. Still '+number(old)+'!';
 }else{
  for(let at=4;at>=1;at--)if(lab[at]>=10&&lab[at-1]<30){i=at;break}
  if(i>=1){lab[i]-=10;lab[i-1]++;$('lab-feedback').textContent='10 '+N.places[i].toLowerCase()+' = 1 '+N.places[i-1].toLowerCase().replace(/s$/,'')+'. Still '+number(old)+'!';}
  else $('lab-feedback').textContent='Add more blocks to try a trade.';
 }
 if(N.total(lab)!==old)throw Error('A trade must not change the total');
 renderLab();
}
function loadLab(){
 const n=N.validNumber($('lab-number').value);
 if(n===null||n>99999){$('lab-feedback').textContent='Choose a number from 0 to 99,999.';return}
 lab=N.parts(n);$('lab-feedback').textContent='Try changing the blocks or making a trade.';renderLab();
}
function renderProgress(){
 $('progress-table').innerHTML='<table><thead><tr><th>Activity</th><th>Level</th><th>Practised</th><th>On my own</th></tr></thead><tbody>'+N.skills.map(s=>{const p=record.progress[s];return '<tr><td>'+names[s]+'</td><td>'+(p.level+1)+'</td><td>'+p.attempted+'</td><td>'+p.firstTry+'</td></tr>'}).join('')+'</tbody></table>';
 $('history').innerHTML=record.history.length?'<table><thead><tr><th>Activity</th><th>Number</th><th>How it went</th></tr></thead><tbody>'+record.history.slice(-15).reverse().map(r=>'<tr><td>'+names[r.skill]+'</td><td>'+number(r.number)+'</td><td>'+(r.firstTry?'Independent':'With help')+'</td></tr>').join('')+'</tbody></table>':'<p>No questions yet.</p>';
}
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)setView(b.dataset.view)});
$('skill-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-skill]');if(b)chooseSkill(b.dataset.skill)});
$('skill-select').addEventListener('change',e=>chooseSkill(e.target.value));
$('answer-area').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(b)updateBuild(Number(b.dataset.place),Number(b.dataset.delta))});
$('answer-area').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkAnswer()}});
$('check').onclick=checkAnswer;
$('next').onclick=()=>{if(round===10){round=0;$('next').textContent='Next →';startQuestion()}else nextQuestion()};
$('hint').onclick=hint;
$('reveal').onclick=()=>{if(!answered){assisted=true;finish(false)}};
$('start').onclick=restartRound;
$('lab-controls').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(b)adjustLab(Number(b.dataset.place),Number(b.dataset.delta))});
$('lab-load').onclick=loadLab;
$('lab-trade').onclick=tradeLab;
$('lab-reset').onclick=()=>{lab=[0,0,0,0,0];$('lab-feedback').textContent='Start building with the + buttons.';renderLab()};
$('export').onclick=()=>Studio.download('number-practice.csv',Studio.csv([['Date','Skill','Range','Number','Independent','Supported'],...record.history.map(r=>[r.date,N.names[r.skill],N.levels[r.level],r.number,r.firstTry,r.supported])]),'text/csv');
$('print').onclick=()=>window.print();
$('reset').onclick=()=>{if(!confirm('Clear the practice record saved on this browser?'))return;record={progress:N.fresh(),history:[],session:null};round=0;startQuestion();renderProgress();$('save-notice').textContent='Record cleared.'};
$('start-level').innerHTML=N.levels.map((l,i)=>'<option value="'+i+'">'+l+'</option>').join('');
const saved=record.session;
if(saved&&N.skills.includes(saved.skill)&&saved.q?.skill===saved.skill&&Number.isInteger(saved.q.level)&&saved.q.level>=0&&saved.q.level<=4&&Array.isArray(saved.q.parts)&&saved.round>=0&&saved.round<10){
 skill=saved.skill;round=saved.round;q=saved.q;answered=!!saved.answered;wrong=!!saved.wrong;assisted=!!saved.assisted;adjustment=saved.adjustment||'';
 const arr=Array.isArray(saved.practiceParts)?saved.practiceParts:null;practiceParts=arr&&arr.length===5&&arr.every(n=>Number.isInteger(n)&&n>=0&&n<=9)?arr:[0,0,0,0,0];
 $('adaptive').checked=saved.adaptive!==false;renderPractice();
}else startQuestion();
