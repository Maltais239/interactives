'use strict';
const $ = selector => document.querySelector(selector);
const html = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const icons = {
  sound:'<path d="M11 5 6 9H3v6h3l5 4zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  pencil:'<path d="m4 16-1 5 5-1L20 8l-4-4ZM14 6l4 4M4 16l4 4"/>',
  book:'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/>'
};
function icon(name){return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';}
const storeKey = 'sss-student-book-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storeKey)) || {}; } catch {}
const work = saved.work && typeof saved.work==='object' && !Array.isArray(saved.work) ? saved.work : {};
function parsePlace(value){
  const path=String(value||'').replace(/^#/,'').split('/');
  const topic=COURSE.find(t=>t.id===path[0]);
  if(!topic)return null;
  const day=Math.min(Math.max(1,Math.floor(Number(path[1])||1)),topic.days);
  const steps=activities(topic,day);
  const mode=[...steps,'bank','end'].includes(path[2])?path[2]:steps[0];
  return {topic,day,mode};
}
let place=parsePlace(location.hash)||parsePlace(saved.place)||parsePlace('vce');
let menuTopic,menuDay,voiceTimer,storageFailed=false,voiceSerial=0;
const route=()=>[place.topic.id,place.day,place.mode].join('/');
function state(){
  const key=route();
  if(!work[key]||typeof work[key]!=='object')work[key]={};
  return work[key];
}
function save(){
  try{localStorage.setItem(storeKey,JSON.stringify({place:route(),work}));}
  catch{if(!storageFailed){storageFailed=true;notice('Your browser can’t save this workbook. Keep the tab open while you work.');}}
}
function notice(msg){
  const el=$('#notice');el.className='notice-on';el.textContent=msg;clearTimeout(voiceTimer);
  voiceTimer=setTimeout(()=>{el.className='';el.textContent='';},4800);
}
let clipAudio;
function stopSpeech(){
  if(clipAudio){clipAudio.pause();clipAudio=null;}
  voiceSerial++;
  if(window.speechSynthesis)window.speechSynthesis.cancel();
  document.querySelectorAll('.playing').forEach(b=>b.classList.remove('playing'));
}
function speak(text,button){
  stopSpeech();
  const failed=()=>notice(place.mode==='spell'?'Audio is unavailable. Open “Peek at word” to continue.':'Audio is unavailable. Read the words with a partner.');
  const serial=voiceSerial,synth=window.speechSynthesis;
  function playClip(){
    if(serial!==voiceSerial)return;
    const range=AUDIO_RANGES[place.topic.id]?.[text];if(!range){failed();return;}
    const [start,end]=range,audio=new Audio('assets/audio/'+place.topic.id+'.mp3#t='+start+','+end);
    clipAudio=audio;button.classList.add('playing');
    const finish=()=>{if(clipAudio===audio){button.classList.remove('playing');clipAudio=null;}};
    audio.onloadedmetadata=()=>{if(serial===voiceSerial&&Math.abs(audio.currentTime-start)>.08)audio.currentTime=start;};
    audio.ontimeupdate=()=>{if(audio.currentTime>=end){audio.pause();finish();}};
    audio.onpause=finish;audio.onended=finish;
    audio.play().catch(()=>{finish();if(serial===voiceSerial)failed();});
  }
  if(!synth||!window.SpeechSynthesisUtterance||!synth.getVoices().some(v=>/^en/i.test(v.lang))){playClip();return;}
  const u=new SpeechSynthesisUtterance(text);
  u.lang='en-CA';u.rate=.82;
  const voices=synth.getVoices();
  const local=voices.find(v=>v.lang==='en-CA')||voices.find(v=>/^en[-_]/i.test(v.lang)&&v.localService);
  if(local)u.voice=local;
  button.classList.add('playing');
  u.onend=()=>{if(voiceSerial===serial)button.classList.remove('playing');};
  u.onerror=e=>{if(voiceSerial!==serial)return;button.classList.remove('playing');if(!['canceled','interrupted'].includes(e.error))playClip();};
  try{synth.speak(u);}catch{button.classList.remove('playing');playClip();}
}
function go(topic,day,mode){
  stopSpeech();place=parsePlace([topic.id,day,mode].join('/'));history.pushState(null,'','#'+route());save();render(true);
}
function goNext(){
  const {topic,day,mode}=place,steps=activities(topic,day);
  if(mode==='end'){
    if(day<topic.days)go(topic,day+1,activities(topic,day+1)[0]);
    else if(COURSE.indexOf(topic)<COURSE.length-1){const next=COURSE[COURSE.indexOf(topic)+1];go(next,1,activities(next,1)[0]);}
    else openMenu();
    return;
  }
  go(topic,day,steps[steps.indexOf(mode)+1]||'end');
}
function goBack(){
  const {topic,day,mode}=place,steps=activities(topic,day);
  go(topic,day,mode==='end'?steps[steps.length-1]:steps[Math.max(0,steps.indexOf(mode)-1)]);
}
function input(key,value='',label='',extra=''){
  return '<input class="entry" type="text" data-field="'+html(key)+'" value="'+html(value)+'" aria-label="'+html(label)+'" autocomplete="off" '+extra+'>';
}
function action(id,label,cl='primary'){return '<button type="button" class="'+cl+'" data-action="'+id+'">'+label+'</button>';}
function feedback(message,kind='ok'){
  return message?'<p class="feedback '+(kind==='retry'?'retry':'')+'" role="status"><span class="mark" aria-hidden="true">'+(kind==='retry'?'·':'✓')+'</span><span>'+html(message)+'</span></p>':'';
}
const letters='ABCD';
const directions={
  pattern:'Read the words in each group aloud.',review:'Think back to the pattern you learned.',
  sort:'Read the word. Choose the group it belongs to.',spell:'Listen to the word. Write one spelling in each sound box.',
  analogy:'Read the first pair. Complete the second pair in a similar way.',
  words:'Write nine words that use this spelling pattern.',sentences:'Use your practice words to write three sentences.',
  sums:'Split each word into its base and suffix or suffixes.',build:'Add the ending and write the new word.',
  bank:'Read these words or use them in your writing.',end:''
};
function hero(){
  const {topic,day,mode}=place;
  return '<header class="hero"><div class="hero-copy"><p class="lesson-meta"><span class="lesson-label">'+html(LESSONS[topic.id].name)+'</span><span>Day '+day+'</span></p><h1>'+(mode==='end'?'End of Day '+day:ACTIVITY_NAMES[mode])+'</h1>'+(directions[mode]?'<p class="directions">'+directions[mode]+'</p>':'')+'</div><div class="art" aria-hidden="true"><i class="spark"></i><img class="blocks" src="assets/blocks.webp" alt=""><img class="pencil" src="assets/pencil.webp" alt=""><i class="spark s2"></i></div></header>';
}
function footer(primary,back=true){
  const {topic,day,mode}=place,steps=activities(topic,day),n=steps.indexOf(mode);
  const bar=n>=0?'<div class="step">Activity '+(n+1)+' of '+steps.length+'<span class="bars" aria-hidden="true">'+steps.map((_,i)=>'<i class="'+(i<=n?'on':'')+'"></i>').join('')+'</span></div>':'<span></span>';
  return '<footer class="nav">'+bar+'<div class="buttons">'+(back&&(n>0||mode==='end')?action('back','Back','plain'):'')+primary+'</div></footer>';
}
function wrap(body,nav){return '<section class="work">'+body+'</section>'+nav;}
function groupHTML(list,i){
  const words=list.split(' '),group='Group '+letters[i];
  return '<section class="group tone'+i+'"><div class="group-top"><h2>'+group+'</h2><button type="button" class="group-audio" aria-label="Hear '+group+'" title="Hear '+group+'" data-say="'+html(words.join('. ')+'.')+'">'+icon('sound')+'</button></div><div class="tiles">'+words.map(w=>'<button type="button" class="tile" aria-label="Hear '+html(w)+'" data-say="'+html(w)+'">'+html(w)+'</button>').join('')+'</div></section>';
}
function pattern(){
  const {topic,mode}=place,p=LESSONS[topic.id],s=state(),review=mode==='review';
  let groups=review?'':'<div class="groups '+(['','','','three-groups','four-groups'][p.groups.length]||'')+'">'+p.groups.map(groupHTML).join('')+'</div>';
  const prompt=review?'What spelling pattern do you remember?':'What do you notice?';
  const field='<div class="'+(review?'':'observation')+'"><label class="field-label" for="observation">'+icon('pencil')+prompt+'</label>'+input('note',s.note,prompt,'id="observation" placeholder="'+(review?'I remember…':'I notice…')+'"')+'</div>';
  const reviewRule=topic.id==='vce'?'When a vowel is followed by one consonant and silent e, the vowel often says its name, as in cake.':topic.rule;
  return wrap(groups+field+(s.revealed?feedback(review?reviewRule:p.rule):''),footer(s.revealed?action('next','Next activity'):action('reveal','Show pattern')));
}
function queue(){
  const {mode,topic,day}=place;
  switch(mode){
    case 'sort':return sortItems(topic.id,day);
    case 'spell':return spellingItems(topic,day);
    case 'analogy':return pairs(topic);
    case 'sums':return topic.sums;
    case 'build':return topic.build;
    default:return [];
  }
}
function itemState(n){
  const s=state();if(!s.items||typeof s.items!=='object')s.items={};
  if(!s.items[n]||typeof s.items[n]!=='object')s.items[n]={};
  return s.items[n];
}
function model(summary,body){return '<details class="model"><summary>'+summary+'</summary><p class="hint">'+html(body)+'</p></details>';}
function posSelect(key,label,answer){
  return '<label>'+label+'<select class="menu-select" data-field="'+key+'"><option value="">Choose…</option>'+['noun','verb','adjective','adverb'].map(v=>'<option '+(answer===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label>';
}
function itemBody(item,a){
  const {mode,topic,day}=place;
  if(mode==='sort'){
    const opts=sortLabels(topic.id,day);
    const items=queue(),answers=state().items, sorted=opts.map(()=>[]);
    items.forEach((entry,i)=>{if(answers[i]?.done)sorted[entry.group].push(entry.word);});
    const columns=opts.map((label,i)=>{
      const chips=sorted[i].map(w=>'<span>'+html(w)+'</span>').join('');
      return '<button type="button" data-sort="'+i+'" aria-label="'+html(label)+'" class="choice sort-bin tone'+i+' '+(a.group===i?(a.done?'selected':'wrong'):'')+'" '+(a.done?'disabled':'')+'><strong>'+html(label)+'</strong><span class="sorted-words">'+chips+'</span></button>';
    });
    return '<div class="task-face"><span class="word-card">'+html(item.word)+'</span></div><div class="choices">'+columns.join('')+'</div>';
  }
  if(mode==='spell'){
    return '<div class="task-face"><button class="listen" type="button" data-say="'+html(item.word)+'">'+icon('sound')+'Hear word</button></div><div class="boxes" role="group" aria-label="Sound boxes">'+item.boxes.map((_,i)=>'<input class="box" aria-label="Sound box '+(i+1)+'" data-field="box'+i+'" value="'+html(a['box'+i])+'" maxlength="6" autocapitalize="none" autocomplete="off" spellcheck="false">').join('')+'</div>'+model('Peek at word',item.word);
  }
  if(mode==='analogy'){
    return '<div class="task-face"><div class="pair"><span>'+html(item[0])+'</span><b>to</b><span>'+html(item[1])+'</span></div><div class="pair"><span>'+html(item[2])+'</span><b>to</b><span>?</span></div></div>'+input('answer',a.answer,'Your matching word','placeholder="Your matching word" spellcheck="false"');
  }
  if(mode==='sums'){
    const parts=sumParts(topic,item);
    return '<div class="task-face"><span class="word-card">'+html(item.word)+'</span></div><div class="sum-row">'+parts.map((_,i)=>input('part'+i,a['part'+i],i?'Suffix '+i:'Base word','placeholder="'+(i?'suffix':'base')+'" spellcheck="false"')).join('<span aria-hidden="true">+</span>')+'</div>'+model('See word sum',parts.join(' + '));
  }
  const ending=topic.id==='plurals'?'plural':('-'+topic.suffix);
  return '<div class="task-face"><span class="word-card">'+html(item.base)+'</span><span>'+ (topic.id==='plurals'?'Write the plural.':'Add '+html(ending)+'.')+'</span></div>'+input('answer',a.answer,'New word','placeholder="Write the new word" spellcheck="false"')+(topic.id==='ly'?'<div class="pos">'+posSelect('basePos','Base word’s part of speech',a.basePos)+posSelect('newPos','New word’s part of speech',a.newPos)+'</div>':'')+model('See example',topic.id==='ly'?item.base+' ('+topic.pos[item.base][0]+') becomes '+item.word+' ('+topic.pos[item.base][1]+')':item.word);
}
function position(items){
  const s=state();s.index=Math.min(Math.max(Math.floor(Number(s.index)||0),0),items.length-1);return s.index;
}
function practice(){
  const s=state(),items=queue(),i=position(items),item=items[i],a=itemState(i),mode=place.mode;
  const counter=(mode==='analogy'?'Pair ':'Word ')+(i+1)+' of '+items.length;
  const head='<div class="task-top"><span>'+counter+'</span>'+(i>0?action('previous-item','Previous '+(mode==='analogy'?'pair':'word'),'text-btn'):'')+'</div>';
  const last=i===items.length-1,steps=activities(place.topic,place.day);
  const nextLabel=last?(steps[steps.length-1]===mode?'Finish day':'Next activity'):(mode==='analogy'?'Next pair':'Next word');
  let primary=a.done?action('advance',nextLabel):mode==='sort'?'':action('check',mode==='analogy'?'Compare words':'Check answer');
  return wrap('<div class="task">'+head+itemBody(item,a)+feedback(a.message,a.done?'ok':'retry')+'</div>',footer(primary));
}
function writing(){
  const {mode}=place,s=state(),sentences=mode==='sentences',count=sentences?3:9;
  const fields=Array.from({length:count},(_,i)=>{
    const key='write'+i,label=(sentences?'Sentence ':'Word ')+(i+1);
    if(sentences)return '<label class="small"><span>'+label+'</span><textarea class="entry area" data-field="'+key+'" rows="2">'+html(s[key])+'</textarea></label>';
    return input(key,s[key],label,'placeholder="'+label+'"');
  });
  return wrap('<div class="'+(sentences?'sentence-lines':'word-grid')+'">'+fields.join('')+'</div>',footer(action('next',sentences?'Finish day':'Next activity')));
}
function bank(){
  const {topic}=place;
  const columns=topic.categories.map((name,i)=>'<section><h2>'+html(name)+'</h2><p class="bank-words">'+topic.words.filter(w=>w.c===i).map(w=>'<span>'+html(w.word)+'</span>').join('')+'</p></section>');
  return wrap('<div class="bank-grid">'+columns.join('')+'</div>',footer(action('return','Back to activity')));
}
function end(){
  const {topic,day}=place,last=day===topic.days,lastTopic=topic===COURSE[COURSE.length-1];
  return wrap('<div class="center"><img class="end-art" src="assets/book.webp" alt=""><p class="end-copy">You’ve reached the end of '+html(LESSONS[topic.id].name)+', Day '+day+'.</p></div>',footer(action('next',last?(lastTopic?'Contents':'Next lesson'):'Start Day '+(day+1))));
}
function render(focus=false){
  const {mode}=place;
  const body=mode==='pattern'||mode==='review'?pattern():mode==='words'||mode==='sentences'?writing():mode==='bank'?bank():mode==='end'?end():practice();
  $('#page').innerHTML=hero()+body;
  document.title=ACTIVITY_NAMES[mode]+' · '+LESSONS[place.topic.id].name+' · Sound, Structure, Spell';
  if(focus){$('#page').focus({preventScroll:true});window.scrollTo(0,0);}
}
function checkItem(){
  const items=queue(),n=position(items),item=items[n],a=itemState(n),{mode,topic}=place;
  let correct=false,message='';
  if(mode==='spell'){
    correct=item.boxes.every((v,i)=>spellingMatch(a['box'+i]||'',v));
    message=correct?'You spelled '+item.word+'!':(/e$/.test(item.word)&&item.boxes.at(-1).length>1?'Try again. Keep the silent e in the last box with the letter before it.':'Try again. Put the letters for one sound in each box.');
  }else if(mode==='analogy'){
    correct=Boolean(a.answer?.trim());message=correct?'One possible match is '+item[2]+' to '+item[3]+'. How does your pair fit the pattern?':'Write a word to compare it with one possible match.';
  }else if(mode==='sums'){
    correct=sumParts(topic,item).every((v,i)=>spellingMatch(a['part'+i]||'',v));
    message=correct?'Yes! '+sumParts(topic,item).join(' + ')+' makes '+item.word+'.':'Try again. Write the base in its original spelling, then add the suffix.';
  }else if(mode==='build'){
    const spelled=spellingMatch(a.answer||'',item.word);
    const pos=topic.id!=='ly'||(a.basePos===topic.pos[item.base][0]&&a.newPos===topic.pos[item.base][1]);
    correct=spelled&&pos;message=correct?'Yes! The new word is '+item.word+'.':spelled?'The spelling is right. Check both parts of speech.':'Try again. Check the ending and any change to the base word.';
  }
  a.done=correct;a.message=message;save();render();
  if(correct)document.querySelector('[data-action="advance"]')?.focus({preventScroll:true});
  else document.querySelector('.task input, .task select')?.focus({preventScroll:true});
}
function chooseSort(group){
  const items=queue(),i=position(items),item=items[i],a=itemState(i);
  if(a.done)return;
  a.group=group;a.done=group===item.group;
  a.message=a.done?'Yes! '+item.word+' belongs in “'+sortLabels(place.topic.id,place.day)[group]+'”.':'Try another group. Look closely at '+item.word+'.';
  if(a.done&&i<items.length-1){
    state().index=i+1;save();render();
    const status=document.createElement('p');status.className='sr';status.setAttribute('role','status');
    document.querySelector('.task').append(status);status.textContent=item.word+' sorted. Next word: '+items[i+1].word+'.';
    document.querySelector('[data-sort="'+group+'"]')?.focus({preventScroll:true});return;
  }
  save();render();document.querySelector(a.done?'[data-action="advance"]':'[data-sort="'+group+'"]')?.focus({preventScroll:true});
}
function openMenu(){
  menuTopic=place.topic;menuDay=place.day;drawMenu();stopSpeech();
  if(!$('#chooser').open)$('#chooser').showModal();
  $('#lesson-choice').focus();
}
function drawMenu(){
  const steps=activities(menuTopic,menuDay);
  const select='<label class="small" for="lesson-choice">Lesson</label><select class="menu-select" id="lesson-choice">'+COURSE.map(t=>'<option value="'+t.id+'" '+(t===menuTopic?'selected':'')+'>'+html(LESSONS[t.id].name)+'</option>').join('')+'</select>';
  const days='<div class="tabs" role="group" aria-label="Practice day">'+Array.from({length:menuTopic.days},(_,i)=>'<button type="button" class="tab '+(i+1===menuDay?'active':'')+'" data-day="'+(i+1)+'" aria-pressed="'+(i+1===menuDay)+'">Day '+(i+1)+'</button>').join('')+'</div>';
  const links='<div class="activity-list">'+steps.map((m,i)=>'<button type="button" data-destination="'+m+'" '+(place.topic===menuTopic&&place.day===menuDay&&place.mode===m?'aria-current="step"':'')+'><span class="index">'+(i+1)+'</span>'+ACTIVITY_NAMES[m]+'</button>').join('')+'</div>';
  const used=Object.keys(work).some(k=>k.startsWith(menuTopic.id+'/'+menuDay+'/')&&Object.keys(work[k]).some(v=>!['index','returnMode'].includes(v)));
  $('#choices').innerHTML=select+days+links+'<button class="text-btn bank-link" data-destination="bank">'+icon('book')+'Word bank</button>'+(used?action('restart','Start day again','text-btn'):'');
}
$('#contents').addEventListener('click',openMenu);
$('#chooser').addEventListener('click',e=>{if(e.target===$('#chooser')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
document.addEventListener('change',e=>{
  if(e.target.id==='lesson-choice'){menuTopic=getModule(e.target.value);menuDay=1;drawMenu();$('#lesson-choice').focus();}
});
document.addEventListener('input',e=>{
  const key=e.target.dataset.field;if(!key)return;
  const items=queue(),s=items.length?itemState(position(items)):state();
  s[key]=e.target.value;
  if(items.length&&(s.done||s.message)){s.done=false;s.message='';const pos=e.target.selectionStart;render();const target=document.querySelector('[data-field="'+key+'"]');target.focus({preventScroll:true});if(typeof pos==='number')target.setSelectionRange(pos,pos);}
  if(place.mode==='spell'&&/^box[0-9]+$/.test(key)&&e.inputType?.startsWith('insert')&&!e.isComposing){
    const index=Number(key.slice(3)),boxes=items[position(items)].boxes;
    if(e.target.value.trim().length>=boxes[index].length){
      document.querySelector('[data-field="box'+(index+1)+'"]')?.focus();
    }
  }
  save();
});
document.addEventListener('paste',e=>{
  if(place.mode!=='spell'||e.target.dataset.field!=='box0')return;
  const text=e.clipboardData?.getData('text').trim(),items=queue(),item=items[position(items)];
  if(!text||text.length!==item.word.length)return;
  e.preventDefault();const a=itemState(position(items));let start=0;
  item.boxes.forEach((box,i)=>{a['box'+i]=text.slice(start,start+box.length);start+=box.length;});
  a.done=false;a.message='';save();render();document.querySelector('[data-action="check"]').focus();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.isComposing&&e.target.matches('.task input')){
    e.preventDefault();const inputs=[...document.querySelectorAll('.task input')],next=inputs[inputs.indexOf(e.target)+1];
    if(next)next.focus();else checkItem();
  }
});
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.say){speak(b.dataset.say,b);return;}
  if(b.dataset.day){menuDay=Number(b.dataset.day);drawMenu();document.querySelector('[data-day="'+menuDay+'"]').focus();return;}
  if(b.dataset.destination){const dest=b.dataset.destination;$('#chooser').close();
    if(dest==='bank'){
      const k=[menuTopic.id,menuDay,'bank'].join('/');work[k]={returnMode:menuTopic===place.topic&&menuDay===place.day&&place.mode!=='bank'?place.mode:activities(menuTopic,menuDay)[0]};
    }
    go(menuTopic,menuDay,dest);return;}
  if(b.hasAttribute('data-sort')){chooseSort(Number(b.dataset.sort));return;}
  switch(b.dataset.action){
    case 'restart':
      if(window.confirm('Start Day '+menuDay+' again? This clears the answers for this lesson and day on this device.')){
        const prefix=menuTopic.id+'/'+menuDay+'/';Object.keys(work).filter(k=>k.startsWith(prefix)).forEach(k=>delete work[k]);
        $('#chooser').close();go(menuTopic,menuDay,activities(menuTopic,menuDay)[0]);
      }
      break;
    case 'close':$('#chooser').close();break;
    case 'back':goBack();break;
    case 'next':goNext();break;
    case 'return':go(place.topic,place.day,state().returnMode||activities(place.topic,place.day)[0]);break;
    case 'reveal':state().revealed=true;save();render();document.querySelector('[data-action="next"]').focus({preventScroll:true});break;
    case 'check':checkItem();break;
    case 'advance':{
      const items=queue(),i=position(items);if(!itemState(i).done)return;
      if(i===items.length-1){goNext();break;}
      state().index=i+1;stopSpeech();save();render(true);break;
    }
    case 'previous-item':state().index=Math.max(0,(state().index||0)-1);stopSpeech();save();render(true);break;
  }
});
window.addEventListener('hashchange',()=>{stopSpeech();place=parsePlace(location.hash)||parsePlace('vce');save();render(true);});
render();
