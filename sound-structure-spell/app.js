'use strict';
const STORAGE='sss-studio-v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon='<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>';
const blankState=()=>({version:1,topic:'vce',day:1,mode:'learn',completed:{},sessions:{},drafts:{},records:[],settings:{rate:.85,autoAudio:false},groups:{},mixedTopics:[]});
let state=blankState(),storageOK=true,storageMessage='',activeBox=0,toastTimer,audioReady=false;
try{const saved=localStorage.getItem(STORAGE);if(saved){const p=JSON.parse(saved);if(p.version===1&&p.completed&&p.sessions&&p.drafts&&Array.isArray(p.records))state={...blankState(),...p};}}catch(e){storageOK=false;storageMessage='Saving is unavailable. Use Export progress before leaving.';}
if(!COURSE.some(m=>m.id===state.topic)&&state.topic!=='mixed')state.topic='vce';
state.settings={rate:.85,autoAudio:false,...state.settings};
const modes=m=>m.type==='phonics'?['learn','sort','map','analogy','write']:['learn','sort','sums','build','write'];
const labels={learn:'Discover',sort:'Sort',map:'Map & spell',analogy:'Analogies',write:'Write',sums:'Word sums',build:'Build words',mixed:'Mixed review',bank:'Word practice'};
const sessionKey=()=>`${state.topic}:${state.day}:${state.mode}`;
const moduleNow=()=>getModule(state.topic);
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));storageOK=true;storageMessage='';}catch(e){storageOK=false;storageMessage='Saving is unavailable. Export your progress before leaving.';}$('#saveStatus').textContent=storageOK?'Progress saved on this device':storageMessage;}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function say(text,slow=false){
 if(!('speechSynthesis' in window)){toast('Audio is unavailable here. Use Show word or ask a teacher to read it aloud.');return false;}
 speechSynthesis.cancel(); const utter=new SpeechSynthesisUtterance(text);utter.lang='en-CA';utter.rate=slow?.65:state.settings.rate;
 const voices=speechSynthesis.getVoices();utter.voice=voices.find(v=>v.lang==='en-CA')||voices.find(v=>v.lang==='en-US'&&v.localService)||voices.find(v=>/^en/.test(v.lang))||null;
 utter.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))toast('The voice could not play. Use Show word, or ask someone to read it aloud.');};speechSynthesis.speak(utter);audioReady=true;return true;
}
function stopAudio(){if('speechSynthesis'in window)speechSynthesis.cancel();}
function countComplete(m){let n=0;for(let d=1;d<=m.days;d++)for(const mode of modes(m))if(state.completed[`${m.id}:${d}:${mode}`])n++;return n;}
const maxComplete=m=>m.days*modes(m).length;
function groupHTML(title,ids,key){const open=state.groups[key]!==false;return `<details class="nav-group" data-group="${key}" ${open?'open':''}><summary>${title}</summary>${ids.map(id=>{const m=getModule(id),n=countComplete(m),total=maxComplete(m);return `<button class="nav-item ${state.topic===id?'active':''}" data-action="topic" data-id="${id}" ${state.topic===id?'aria-current="page"':''}><span>${esc(m.short)}</span>${n===total?'<span aria-label="Complete">✓</span>':`<span class="mini" aria-label="${n} of ${total} activities completed"><span style="width:${100*n/total}%"></span></span>`}</button>`;}).join('')}</details>`;}
function renderSidebar(){
 const explored=COURSE.filter(m=>countComplete(m)>0).length,done=COURSE.reduce((n,m)=>n+countComplete(m),0),total=COURSE.reduce((n,m)=>n+maxComplete(m),0);
 $('#sidebar').innerHTML=`<button class="close-path secondary" data-action="close-menu" style="margin-bottom:16px" hidden>Close learning path</button><h2>My learning path</h2><p class="summary">${explored} of 11 topics explored</p><div class="progress-track" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${100*done/total}%"></span></div>${groupHTML('Sounds & spellings',['vce','sound-c','sound-g','vowel-teams'],'sounds')}${groupHTML('Helper letters',['final-k','final-j','final-ch'],'helpers')}${groupHTML('Word building',['ed','plurals','ing','ly'],'morphology')}<button class="mixed-button" data-action="mixed-setup"><strong>Mixed review</strong><small>Practise what you have learned</small></button><div class="sidebar-bottom"><button data-action="bank">Word bank</button><button data-action="tools">Teacher notes</button></div>${!storageOK?`<p class="storage-warning small">${esc(storageMessage)}</p>`:''}`;
 $('#sidebar').querySelector('.close-path').hidden=window.innerWidth>800;
 $('#sidebar').querySelectorAll('details').forEach(el=>el.addEventListener('toggle',()=>{state.groups[el.dataset.group]=el.open;save();}));
}
function closeMenu(){$('#sidebar').classList.remove('open');$('#scrim').hidden=true;$('#menuButton').setAttribute('aria-expanded','false');}
function goTopic(id,day=1){stopAudio();state.topic=id;state.day=day;state.mode='learn';save();closeMenu();render();}
function changeMode(mode){stopAudio();state.mode=mode;save();render();}
function markComplete(){if(state.topic==='mixed'||state.mode==='bank')return;const check=document.querySelector(`.steps [data-mode="${state.mode}"] .step-check`);if(check)check.textContent='✓';state.completed[sessionKey()]=new Date().toISOString();save();renderSidebar();}
function nextMode(){const list=modes(moduleNow()),i=list.indexOf(state.mode);if(i<list.length-1)changeMode(list[i+1]);else if(state.day<moduleNow().days){state.day++;changeMode('learn');}else showProgress();}
const heading={learn:'Discover the pattern',sort:'Which group belongs?',map:'Map it. Then spell it.',analogy:'Find the relationship',sums:'Take the word apart',build:'Build a new word',write:'Put your words to work',mixed:'A little of everything',bank:'Word-bank practice'};
const instructions={learn:'Read the examples. Notice what changes, and explain why.',sort:'Read the word. Then choose its group.',map:'Listen to the word. Put the spelling for each sound in its box.',analogy:'Look at the first pair. Complete the second pair in the same way.',sums:'Keep each morpheme’s full spelling in the word sum.',build:'Start with the base, add the suffix, and check the spelling.',write:'Listen, write, and use the pattern in your own sentence.',mixed:'Retrieve a pattern from a different topic each time.',bank:'Practise a word from the full word bank.'};
function render(){
 if(state.topic!=='mixed'&&!modes(moduleNow()).includes(state.mode)&&state.mode!=='bank')state.mode='learn';
 state.day=Math.min(Math.max(1,Number(state.day)||1),moduleNow().days);renderSidebar();
 const m=moduleNow(),isMixed=state.topic==='mixed';
 $('#main').innerHTML=`<div class="lesson-heading"><div><p class="eyebrow">${isMixed?'RETRIEVE & REMEMBER':`${esc(m.group)} · ${esc(m.title)}`}</p><h1>${heading[isMixed?'mixed':state.mode]}</h1><p class="subtitle">${instructions[isMixed?'mixed':state.mode]}</p></div>${!isMixed?`<div class="day-select" aria-label="Lesson day">${Array.from({length:m.days},(_,i)=>`<button data-action="day" data-day="${i+1}" class="${state.day===i+1?'active':''}" ${state.day===i+1?'aria-current="step"':''}>Day ${i+1}</button>`).join('')}</div>`:'<button data-action="mixed-setup">Choose topics</button>'}</div>${!isMixed?`<nav class="steps" aria-label="Lesson activities">${modes(m).map((mode,i)=>`<button data-action="mode" data-mode="${mode}" class="${state.mode===mode?'active':''}" ${state.mode===mode?'aria-current="step"':''}><span class="step-check">${state.completed[`${m.id}:${state.day}:${mode}`]?'✓':i+1}</span>${labels[mode]}</button>`).join('')}</nav><div class="rule-strip"><strong>A pattern to notice</strong><span>${esc(m.rule)}</span></div>`:''}<section class="workspace" aria-label="Student activity"><div class="workspace-inner" id="activity"></div></section><div id="tray"></div>`;
 if(state.mode==='learn'&&!isMixed)renderLearn(m);else if(state.mode==='write'&&!isMixed)renderWriting(m);else renderQuestion();
 save();
}
function renderLearn(m){
 const q=RULE_QUIZZES[m.id],s=getSession(),example=balanced(m,m.categories.length*2,state.day-1);let mini=m.type==='morphology'?`${example[0].base} + ${suffixFor(m,example[0])}`:(m.maps[0]?.word||m.words[0].word);
 $('#activity').innerHTML=`<div class="learn-intro"><div><h2>${state.day===1?'Be a word detective.':'Bring the pattern back.'}</h2><p>${state.day===1?'Read each group aloud. What do the spellings have in common?':'Say the pattern in your own words before you practise again.'}</p></div><div class="pattern-example"><span class="mini-label">Look closely</span><strong>${esc(mini)}</strong>${m.type==='morphology'?`<span>${esc(example[0].word)}</span>`:'<span>Say it. Notice it. Explain it.</span>'}</div></div><div class="example-groups">${m.categories.map((cat,c)=>`<div class="example-group"><h3>${esc(cat)}</h3><div class="example-words">${example.filter(w=>w.c===c).map(w=>`<button data-action="speak" data-text="${esc(w.word)}" aria-label="Hear ${esc(w.word)}">${esc(w.word)}</button>`).join('')}</div></div>`).join('')}</div><p class="thinking-note">${esc(m.notes[(state.day-1)%m.notes.length])}</p><div class="quiz"><h3>${esc(q.prompt)}</h3><div class="quiz-options">${q.options.map((o,i)=>`<button data-action="quiz" data-answer="${i}" ${s.solved?'disabled':''} class="${s.solved&&i===q.correct?'chosen':''}">${esc(o)}</button>`).join('')}</div>${s.feedback?feedbackHTML(s.feedback):''}</div><details class="explain-input"><summary>My explanation</summary><textarea id="explanation" data-draft="${sessionKey()}:explain" aria-label="Explain the pattern in your own words" placeholder="I notice… I think this happens because…">${esc(state.drafts[sessionKey()+':explain']||'')}</textarea><p class="small muted">This is your thinking space. Discuss your explanation with a teacher or partner.</p></details><div class="activity-footer"><div class="footer-left"><button data-action="lesson-notes">More about this pattern</button><button data-action="bank">Word bank</button></div><button class="primary" data-action="next-mode" ${s.solved?'':'disabled'}>Start sorting</button></div>`;
}
function suffixFor(m,w){if(m.id==='plurals')return w.c===0?'s':'es';return m.suffix;}
function getSession(){const key=sessionKey();if(!state.sessions[key])state.sessions[key]={i:0,deck:null,attempts:0,helped:false,solved:false,feedback:null,answer:'',boxes:[],phase:'map',completedWords:[]};return state.sessions[key];}
function makeDeck(m,mode){
 const d=state.day-1;
 if(mode==='sort')return balanced(m,m.type==='morphology'?16:10,d*5).map(w=>({type:'sort',topic:m.id,...w}));
 if(mode==='map')return m.maps.slice(d*5,d*5+5).map(w=>({type:'map',topic:m.id,...w}));
 if(mode==='analogy')return m.analogies.map(w=>({type:'analogy',topic:m.id,...w}));
 if(mode==='sums')return m.sums.map(w=>({type:'sums',topic:m.id,...w}));
 if(mode==='build')return m.build.map(w=>({type:'build',topic:m.id,...w}));
 return [];
}
function ensureDeck(s){if(!s.deck)s.deck=makeDeck(moduleNow(),state.mode);return s.deck;}
function feedbackHTML(f){return `<div class="feedback ${f.kind==='error'?'error':f.kind==='info'?'info':''}" role="status"><span class="feedback-icon" aria-hidden="true">${f.kind==='error'?'!':f.kind==='info'?'i':'✓'}</span><div><strong>${esc(f.title)}</strong>${esc(f.text)}</div></div>`;}
function explainWord(m,q){
 if(m.type==='morphology'){const rule=m.categories[q.c];return `${q.base} + ${suffixFor(m,q)} becomes ${q.word}. ${rule}.${q.word==='quizzes'?' Quiz also doubles its final z.':''}`;}
 if(m.id==='vce')return q.c===0?`${q.word} has a split vowel spelling: the final e helps the earlier vowel say its name.`:`${q.word} does not use final e to make the earlier vowel say its name.`;
 if(m.id==='final-k')return q.c===0?`${q.word} has ck immediately after one short vowel.`:`${q.word} uses k. Look for a vowel team, another consonant, or a split vowel spelling.`;
 if(m.id==='final-j')return q.c===0?`${q.word} uses dge directly after one short vowel.`:`${q.word} uses ge. It is not directly after one short vowel.`;
 if(m.id==='final-ch')return ['rich','such','much','which'].includes(q.word)?`${q.word} is a common exception: it uses ch after a short vowel.`:q.c===0?`${q.word} uses tch immediately after one short vowel.`:`${q.word} uses ch after a vowel team or another consonant.`;
 if(m.id==='sound-c')return `In ${q.word}, the highlighted c spells ${q.c===0?'/s/':'/k/'}. Look at the letter immediately after c.`;
 if(m.id==='sound-g')return `In ${q.word}, the highlighted g spells ${q.c===0?'/j/':'/g/'}.${['get','gift','give','girl','gig','giggle','gimp','begin','forget'].includes(q.word)?' Before e or i, g can still keep its hard sound.':''}`;
 return `${q.word} uses the vowel team ${m.categories[q.c]}. ${['dead','head','bread','spread','tread'].includes(q.word)?'Here ea spells short e.':q.word==='snow'||q.word==='grow'?'Here ow spells long o.':'Read the word aloud to check its vowel sound.'}`;
}
function categoryHelp(m,c){
 const info={'final-k':['Right after one short vowel','Vowel team, split vowel, or consonant'], 'final-j':['Right after one short vowel','Other vowel spellings or a consonant'], 'final-ch':['Right after one short vowel','Vowel team, consonant, or exception']};
 if(info[m.id])return info[m.id][c];if(m.id==='vce')return c===0?'The final e helps the vowel':'A different pattern';
 if(m.id==='sound-c')return c===0?'Usually before e, i, or y':'Usually before other letters';
 if(m.id==='sound-g')return c===0?'Soft g':'Hard g';
 if(m.id==='vowel-teams')return 'Letters working together';
 return 'Look at the base word';
}
function highlightWord(m,q){
 const w=q.word;if(m.id==='final-k'||m.id==='final-j'||m.id==='final-ch'){
  const end=m.categories[q.c],stem=w.slice(0,-end.length),match=stem.match(/^(.*?)([aeiou])$/i);
  return (q.c===0&&match?`${esc(match[1])}<mark>${esc(match[2])}</mark>`:esc(stem))+`<span class="ending">${esc(end)}</span>`;
 }
 if(m.type==='morphology')return esc(w);
 if(m.id==='sound-c'||m.id==='sound-g'){const letter=m.id==='sound-c'?'c':'g',i=w.indexOf(letter);return esc(w.slice(0,i))+`<mark>${letter}</mark>`+esc(w.slice(i+1));}
 if(m.id==='vowel-teams'){const t=m.categories[q.c],i=w.indexOf(t);if(i>=0)return esc(w.slice(0,i))+`<mark>${esc(t)}</mark>`+esc(w.slice(i+t.length));}
 return esc(w);
}
function renderQuestion(){
 const s=getSession(),deck=ensureDeck(s);if(s.i>=deck.length){renderComplete(s);return;}
 const q=deck[s.i],m=getModule(q.topic),isSort=q.type==='sort',isMap=q.type==='map'&&s.phase!=='spell';
 const descriptions={sort:instructions.sort,map:isMap?'One box for each sound. Some spellings use more than one letter.':'Cover the map in your mind. Now spell the whole word.',analogy:instructions.analogy,sums:instructions.sums,build:instructions.build,spell:'Listen carefully. Type the whole word.'};
 let content='';
 if(isSort){content=`<div class="focus-word">${highlightWord(m,q)}</div><div class="hear-row"><button data-action="hear-current">${icon} Hear the word</button></div><div class="category-grid ${m.categories.length>2?'many':''}">${m.categories.map((cat,c)=>`<button class="category ${s.solved&&c===q.c?'correct':''} ${s.wrongCategory===c?'wrong':''}" data-action="category" data-category="${c}" ${s.solved?'disabled':''}><strong>${esc(cat)}</strong><small>${esc(categoryHelp(m,c))}</small></button>`).join('')}</div>`;}
 else if(q.type==='map'){
  content=`<p class="context">${esc(q.context)}</p><div class="hear-row"><button data-action="hear-current" class="secondary">${icon} Hear the word</button><button data-action="hear-slow">Hear it slowly</button></div>`;
  if(isMap){const tiles=[...new Set([...q.graphemes,...(q.graphemes.some(g=>g.includes('…'))?['e','a','i']:['e','k','ch'])])].sort();content+=`<div class="map-row">${q.graphemes.map((g,i)=>`<div class="sound-box"><label for="box${i}">Sound ${i+1}</label><input id="box${i}" data-box="${i}" aria-label="Spelling for sound ${i+1}" value="${esc(s.boxes[i]||'')}" maxlength="5" autocomplete="off" autocapitalize="off" spellcheck="false" ${s.solved?'readonly class="valid"':''}></div>`).join('')}</div><div class="tile-bank" aria-label="Spelling tiles">${tiles.map(t=>`<button data-action="tile" data-tile="${esc(t)}" ${s.solved?'disabled':''}>${esc(t)}</button>`).join('')}</div><p class="map-hint">Tap a box, then a tile, or type its spelling.${q.graphemes.some(g=>g.includes('…'))?(' A tile like a…e is one split vowel spelling. The final e does not get another box.'+(/[cg]e$/.test(q.word)?' Here the final e also helps soften c or g, so we do not write a second e.':'')):''}</p><div class="hear-row"><button class="primary" data-action="check-map" ${s.solved?'disabled':''}>Check my map</button><button data-action="clear-map" ${s.solved?'disabled':''}>Clear boxes</button></div>`;}
  else content+=answerForm(s,'Spell the word','Your spelling');
 }
 else if(q.type==='analogy')content=`<div class="analogy-display">${esc(q.a)} : ${esc(q.b)} &nbsp; :: &nbsp; ${esc(q.c)} : <span class="muted">?</span></div><p class="small muted" style="text-align:center">Complete the spelling relationship. The words do not have to mean the same thing.</p><div class="quiz-options">${analogyOptions(m,q).map(w=>`<button data-action="analogy-choice" data-word="${esc(w)}" ${s.solved?'disabled':''} class="${s.solved&&w===q.answer?'chosen':''}">${esc(w)}</button>`).join('')}</div>`;
 else if(q.type==='sums')content=`<div class="focus-word" style="font-size:clamp(2rem,4vw,3rem)">${esc(q.word)}</div><p class="context small">${q.parts.length} morphemes. Write the base and suffix${q.parts.length>2?'es':''} with + signs.</p>${answerForm(s,'Write the word sum',q.parts.length>2?'base + suffix + suffix + suffix':'base + suffix')}<p class="map-hint">Keep the base’s original spelling. For example, hope + ing = hoping.</p>`;
 else if(q.type==='build')content=`<div class="build-sum"><span class="morpheme">${esc(q.base)}</span><span class="sum-sign">+</span><span class="morpheme suffix">${suffixFor(m,q)}</span><span class="sum-sign">=</span><span class="sum-sign">?</span></div>${answerForm(s,'The new word','Build the new word')}${m.id==='ly'&&m.pos[q.base]?`<div class="pos-fields"><label>Base word is a<select id="basePOS"><option value="">Choose</option>${['noun','adjective','adverb','verb'].map(p=>`<option ${s.basePOS===p?'selected':''}>${p}</option>`).join('')}</select></label><label>New word is an<select id="newPOS"><option value="">Choose</option>${['noun','adjective','adverb','verb'].map(p=>`<option ${s.newPOS===p?'selected':''}>${p}</option>`).join('')}</select></label></div>`:''}`;
 else content=`<p class="context">${esc(q.context||'Listen to the word, then spell it.')}</p><div class="hear-row"><button data-action="hear-current">${icon} Hear the word</button><button data-action="hear-slow">Hear it slowly</button></div>${answerForm(s,'Spell the word','Your spelling')}`;
 const nextLabel=isMap?'Now spell it':s.i===deck.length-1?'Finish this activity':'Next word';
 $('#activity').innerHTML=`<div class="workspace-header"><p>${esc(descriptions[q.type]||instructions.mixed)}</p><span class="counter">${s.i+1} of ${deck.length}${state.topic==='mixed'?' · '+esc(m.short):' words'}</span></div>${content}${s.feedback?feedbackHTML(s.feedback):''}<div class="activity-footer"><div class="footer-left"><button data-action="why">Why does it work?</button><button data-action="reveal" ${s.solved?'disabled':''}>${q.type==='sums'?'Show sum':'Show word'}</button></div><button class="primary" data-action="next-question" ${s.solved?'':'disabled'}>${nextLabel}</button></div>`;
 $('#tray').innerHTML=s.completedWords.length?`<div class="word-tray"><strong>Your ${state.mode==='sort'?'sorted':'practised'} words</strong>${s.completedWords.map(w=>`<span class="chip">${esc(w)}</span>`).join('')}</div>`:'';
 if(state.settings.autoAudio&&['map','spell'].includes(q.type)&&!s.solved&&audioReady)queueMicrotask(()=>say(q.word));
}

function analogyOptions(m,q){
 const category=m.words.find(w=>w.word===q.answer)?.c;
 const pool=m.words.filter(w=>w.word!==q.answer&&w.c!==category).map(w=>w.word);
 const opts=[q.answer,...pool.slice(0,3)];
 const shift=(q.a.length+q.b.length)%opts.length;return opts.slice(shift).concat(opts.slice(0,shift));
}
function answerForm(s,label,placeholder){return `<form id="answerForm" class="answer-form"><label for="answerInput">${esc(label)}</label><div class="answer-line"><input id="answerInput" value="${esc(s.answer)}" placeholder="${esc(placeholder)}" aria-label="${esc(label)}" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="150" ${s.solved?'readonly':''}><button type="submit" class="primary" ${s.solved?'disabled':''}>Check</button></div></form>`;}
function recordSuccess(q,s){state.records.push({topic:q.topic,day:state.day,type:q.type,word:q.word||q.answer,attempts:s.attempts+1,helped:!!s.helped,at:new Date().toISOString()});if(state.records.length>10000)state.records=state.records.slice(-10000);}
function succeed(s,q,text){s.solved=true;s.wrongCategory=null;s.feedback={kind:'correct',title:s.helped?'Good practice. Read it once more.':s.attempts?'You worked it out!':'You found it!',text};if(q.type!=='map'||s.phase==='spell')recordSuccess(q,s);save();renderQuestion();}
function fail(s,text){s.attempts++;s.feedback={kind:'error',title:'Take another look.',text};save();renderQuestion();}
function checkAnswer(){
 const s=getSession(),q=ensureDeck(s)[s.i];if(s.solved||!q)return;
 const input=$('#answerInput');if(input)s.answer=input.value;const a=s.answer.trim();if(!a){toast('Type your answer first.');input?.focus();return;}
 const m=getModule(q.topic);let good=q.type==='sums'?sumMatch(a,q.parts):spellingMatch(a,q.answer||q.word);
 if(q.type==='build'&&m.id==='ly'&&m.pos[q.base]){
  s.basePOS=$('#basePOS').value;s.newPOS=$('#newPOS').value;
  if(good&&(!s.basePOS||!s.newPOS)){toast('Choose the part of speech for both words.');save();return;}
  if(good&&(s.basePOS!==m.pos[q.base][0]||s.newPOS!==m.pos[q.base][1])){fail(s,`${q.base} describes ${m.pos[q.base][0]==='noun'?'a person or thing':'a quality'}. Think about what the new word does in a sentence.`);return;}
 }
 if(good)succeed(s,q,q.type==='analogy'?q.why:q.type==='sums'?`${q.parts.join(' + ')} = ${q.word}. The base keeps its full spelling in the sum.`:q.type==='build'?explainWord(m,q):`The word is ${q.word}. Read it aloud and notice its spelling.`);
 else fail(s,q.type==='sums'?`Keep the full base spelling and separate each of the ${q.parts.length} morphemes with +. Spelling changes happen when the morphemes join.`:q.type==='analogy'?'Compare the spelling patterns in the first pair. Try the same kind of change in the second pair.':q.type==='build'?`Look again at the base ${q.base}. Which spelling change does this suffix need?`:'Say the word slowly. Check each sound, then look at the vowel spelling.');
 $('#answerInput')?.focus();
}
function checkMap(){
 const s=getSession(),q=ensureDeck(s)[s.i];if(s.solved)return;
 s.boxes=Array.from($('#activity').querySelectorAll('[data-box]')).map(el=>el.value);
 const norm=x=>normalise(x).replace(/[_.\-…\s]/g,'');
 if(s.boxes.some(x=>!x.trim())){toast('Give every sound a spelling first.');return;}
 const good=q.graphemes.every((g,i)=>norm(g)===norm(s.boxes[i]));
 if(good){s.solved=true;s.feedback={kind:'correct',title:'Your sounds are mapped.',text:`${q.graphemes.join(' · ')} spells ${q.word}. Read the word, then cover the map and spell it.`};save();renderQuestion();}
 else fail(s,`Listen again and stretch the word. It has ${q.graphemes.length} sound boxes in this map. Some sounds need more than one letter.`);
}
function nextQuestion(){
 const s=getSession(),q=ensureDeck(s)[s.i];if(!s.solved)return;stopAudio();
 if(q.type==='map'&&s.phase!=='spell'){s.phase='spell';s.solved=false;s.feedback=null;s.answer='';}
 else {s.completedWords.push(q.word||q.answer);s.i++;activeBox=0;s.phase='map';s.solved=false;s.feedback=null;s.answer='';s.boxes=[];s.attempts=0;s.helped=false;s.wrongCategory=null;s.basePOS='';s.newPOS='';}
 save();renderQuestion();
}
function renderComplete(s){
 if(state.topic!=='mixed'&&state.mode!=='bank')markComplete();
 const deck=s.deck||[],records=state.records.filter(r=>deck.some(q=>(q.word||q.answer)===r.word&&q.topic===r.topic));
 $('#activity').innerHTML=`<div class="complete-panel"><div class="complete-mark" aria-hidden="true">✓</div><p class="eyebrow">ACTIVITY COMPLETE</p><h2>You gave those words some thought.</h2><p>You practised ${deck.length} words. Say the pattern aloud, and tell someone why one of these words belongs.</p><div class="word-tray" style="justify-content:center">${s.completedWords.map(w=>`<span class="chip">${esc(w)}</span>`).join('')}</div><div class="complete-actions">${state.topic!=='mixed'&&state.mode!=='bank'?'<button class="primary" data-action="next-mode">Continue the lesson</button>':'<button class="primary" data-action="mixed-setup">Choose more practice</button>'}<button data-action="restart-activity">Practise again</button><button data-action="progress">My progress</button></div></div>`;
 $('#tray').innerHTML='';save();
}
function writingKey(){return `${state.topic}:${state.day}:write`;}
function writingData(){const key=writingKey();if(!state.sessions[key])state.sessions[key]={dictationIndex:0,dictations:[],attempts:0,helped:false,answer:'',feedback:null,checked:false,checks:[false,false,false],saved:false};return state.sessions[key];}
function renderWriting(m){
 const s=writingData(),i=s.dictationIndex,sentence=m.sentences[i],draft=state.drafts[writingKey()+':sentence']||'',finished=i>=m.sentences.length;
 $('#activity').innerHTML=`<div class="workspace-header"><p>Listen and write</p><span class="counter">${finished?'Dictation complete':`Sentence ${i+1} of ${m.sentences.length}`}</span></div>${finished?'<p class="note-box">Your dictated sentences are saved. Now use the pattern in a sentence of your own.</p>':`<p class="muted">Listen to the full sentence, then write it below. You can hear it as often as you need.</p><div class="writing-tools"><button data-action="hear-sentence">${icon} Hear the sentence</button><button data-action="show-sentence" ${s.checked?'disabled':''}>Show model</button></div><form id="dictationForm" class="writing-form"><label for="dictationInput">My sentence</label><textarea id="dictationInput" autocomplete="off" spellcheck="false" placeholder="Listen, then write…" maxlength="1000" ${s.checked?'readonly':''}>${esc(s.answer||'')}</textarea><div class="writing-tools"><button type="submit" class="primary" ${s.checked?'disabled':''}>Check spelling</button>${s.checked?'<button data-action="next-dictation">Next sentence</button>':''}</div></form>${s.feedback?feedbackHTML(s.feedback):''}`}<div class="writing-form"><h2 style="font-size:1.25rem;margin-top:25px">Make it your own</h2><p class="muted">Use at least two words from this topic. Explain a spelling choice to your teacher or partner.</p><div class="word-tray" style="border:0;padding:0">${balanced(m,4,(state.day-1)*3).map(w=>`<span class="chip">${esc(w.word)}</span>`).join('')}</div><label for="ownSentence" style="margin-top:15px">My own sentence</label><textarea id="ownSentence" data-draft="${writingKey()}:sentence" placeholder="Write something only you could write…" maxlength="5000">${esc(draft)}</textarea><div class="checklist">${['I checked my spellings.','I used capitals and punctuation.','I can explain a spelling choice.'].map((t,i)=>`<label><input type="checkbox" data-writing-check="${i}" ${s.checks[i]?'checked':''}>${t}</label>`).join('')}</div><p class="small muted">Your own sentence is saved for teacher review. The app does not automatically judge its meaning or grammar.</p></div><div class="activity-footer"><button data-action="bank">Word bank</button><button class="primary" data-action="save-writing">${s.saved?'Writing saved · review again':'Save my writing'}</button></div>`;$('#tray').innerHTML='';
}
function checkDictation(){const m=moduleNow(),s=writingData(),target=m.sentences[s.dictationIndex];if(s.checked||!target)return;s.answer=$('#dictationInput').value;if(!s.answer.trim()){toast('Write the sentence first.');return;}if(sentenceMatch(s.answer,target)){s.checked=true;s.feedback={kind:'correct',title:'Your words match.',text:'Now check your capitals and punctuation against the model: '+target};s.dictations.push(s.answer);recordSuccess({topic:m.id,type:'dictation',word:target},s);}else{s.attempts++;s.feedback={kind:'error',title:'Compare the words carefully.',text:'Listen again. Check for missing words, then check the vowel spellings and endings. Capitals and punctuation do not affect this spelling check.'};}save();renderWriting(m);}
function dialog(body){$('#dialogContent').innerHTML=`<div class="dialog-body">${body}</div>`;if(!$('#dialog').open)$('#dialog').showModal();}
function dialogHeader(title,subtitle=''){return `<div class="dialog-heading"><div><h2>${esc(title)}</h2>${subtitle?`<p class="muted">${esc(subtitle)}</p>`:''}</div><button data-action="close-dialog" aria-label="Close dialog">Close</button></div>`;}
function showProgress(){
 const done=COURSE.reduce((n,m)=>n+countComplete(m),0),total=COURSE.reduce((n,m)=>n+maxComplete(m),0),attempted=state.records.length,first=state.records.filter(r=>r.attempts===1&&!r.helped).length;
 const writing=Object.entries(state.drafts).filter(([k,v])=>k.endsWith(':sentence')&&v.trim());
 dialog(`${dialogHeader('My progress','Your practice belongs to you. Export it to continue on another device.')}<div class="report-grid"><div class="stat"><strong>${done}/${total}</strong><span>Activities completed</span></div><div class="stat"><strong>${attempted}</strong><span>Words & sentences practised</span></div><div class="stat"><strong>${attempted?Math.round(first/attempted*100)+'%':'—'}</strong><span>Correct on the first try</span></div></div><div class="progress-list">${COURSE.map(m=>{const n=countComplete(m),t=maxComplete(m);return `<div class="progress-row"><button data-action="topic" data-id="${m.id}">${esc(m.title)}<small>${n} of ${t} activities · ${state.records.filter(r=>r.topic===m.id).length} practice answers</small></button><div class="progress-track"><span style="width:${100*n/t}%"></span></div><span>${Math.round(100*n/t)}%</span></div>`;}).join('')}</div><div class="dialog-toolbar"><button class="primary" data-action="export">Export progress</button><button data-action="import">Import progress</button><button data-action="csv">Download practice log</button><button data-action="print">Print report</button></div><p class="small muted">First-try accuracy counts practice answers, including repeated practice. Answers shown with help are excluded from first-try successes. Writing is reviewed separately.</p>${writing.length?'<h3>My writing</h3>'+writing.map(([key,value])=>{const [id,d]=key.split(':');return `<div class="writing-record"><strong>${esc(getModule(id).title)} · Day ${d}</strong><br>${esc(value)}</div>`;}).join(''):''}`);
}
function showTools(){
 const m=moduleNow();dialog(`${dialogHeader('Settings & teacher notes','Small steps, good questions, thoughtful practice.')}<div class="field"><label for="speechRate">Reading speed</label><select id="speechRate"><option value="0.65" ${state.settings.rate===.65?'selected':''}>Slower</option><option value="0.85" ${state.settings.rate===.85?'selected':''}>Steady</option><option value="1" ${state.settings.rate===1?'selected':''}>Natural</option></select><button data-action="voice-test" style="margin-left:8px">Test voice</button></div><div class="field"><label><input type="checkbox" id="autoAudio" ${state.settings.autoAudio?'checked':''}> Automatically read new spelling words</label><p class="small muted">The browser needs one click on a Hear button before automatic audio can begin. Voices depend on the device.</p></div><div class="note-box"><h3>Teaching with the studio</h3><p>Use the activities with guided discussion. Ask “Why did you choose that spelling?” after correct and incorrect answers. Move from focused daily lessons to mixed review, then apply the patterns in connected writing.</p><p>Each phonics topic has three practice days. Each suffix topic has two. All topics are open so you can select the right starting point. Day 2 and Day 3 retrieve the same pattern with new mapping words and different sorting samples.</p><p>Map & spell uses one box per sound and grouped spelling tiles. A split spelling such as a…e occupies one box. After mapping, students cover the map and spell the whole word. Audio reads whole words, not isolated phonemes.</p><p>The full word bank supports extra practice. Automatic checks use explicit answer keys; student explanations and original writing are saved for adult discussion.</p></div><div class="note-box"><h3>${esc(m.title)}</h3>${m.notes.map(n=>`<p>${esc(n)}</p>`).join('')}<p class="small">Source PDF pages: student workbook ${esc(m.pages.workbook)}; teacher manual ${esc(m.pages.manual)}. These are PDF page positions, including covers.</p></div><div class="note-box"><h3>About these materials</h3><p>Adapted from <i>Sound, Structure, Spell: Exploring Phonics Pathways and Morphology Rules</i> by Dr. Shelley Blackwell, SLP.D, 2025. The author permits educational sharing and asks that the work not be altered and sold. This is a free educational adaptation, not an official app or endorsement.</p><p>The adaptation retains all 11 topics and activity types, expands reusable practice, and corrects inconsistent source examples. Examples: slide → slid is irregular; unhinge belongs with ge; muck and neck belong with ck; doubling requires attention to stress and w/x/y; ly is a derivational suffix. A few unclear or ambiguous analogies have been replaced.</p></div><div class="note-box"><h3>Progress & privacy</h3><p>No sign-in, analytics, microphone recording, or student data server. Practice and writing are stored in this browser. Anyone using the same browser profile sees the same progress. Export a separate file for each learner, and import it when switching devices or learners.</p><p>Import replaces this browser’s progress after you confirm. Export a backup first. Browser voices may use the device’s speech service; this app makes no audio uploads. The optional font is loaded from Google Fonts; a readable local font is used if it is unavailable.</p></div><div class="dialog-toolbar"><button data-action="export">Export progress</button><button data-action="import">Import progress</button><button data-action="reset-confirm">Reset this device’s progress</button></div>`);
}
function lessonNotes(){const m=moduleNow();dialog(`${dialogHeader(m.title,'Notice, explain, and try another example.')}<p class="note-box">${esc(m.rule)}</p>${m.notes.map(n=>`<p style="line-height:1.65">${esc(n)}</p>`).join('')}<button class="primary" data-action="close-dialog">Back to practice</button>`);}
function showBank(){
 const m=moduleNow();dialog(`${dialogHeader('The word bank','Explore the complete practice bank. Hear a word or start extra practice.')}<div class="bank-filters"><select id="bankTopic" aria-label="Word bank topic">${COURSE.map(t=>`<option value="${t.id}" ${t.id===m.id?'selected':''}>${esc(t.title)}</option>`).join('')}</select><input id="bankSearch" type="search" placeholder="Find a word…" aria-label="Find a word"><select id="bankCategory" aria-label="Spelling group"></select></div><p class="small muted" id="bankCount"></p><div class="bank-list" id="bankList"></div>`);bankCategories();renderBank();
}
function bankCategories(){const m=getModule($('#bankTopic').value);$('#bankCategory').innerHTML='<option value="all">All groups</option>'+m.categories.map((c,i)=>`<option value="${i}">${esc(c)}</option>`).join('');}
function renderBank(){const m=getModule($('#bankTopic').value),query=normalise($('#bankSearch').value),cat=$('#bankCategory').value,list=m.words.filter(w=>(cat==='all'||w.c===Number(cat))&&(`${w.base||''} ${w.word}`).toLowerCase().includes(query));$('#bankCount').textContent=`${list.length} of ${m.words.length} words · ${m.categories.length} groups`;$('#bankList').innerHTML=list.map(w=>`<div class="bank-word"><span>${esc(w.base?`${w.base} → ${w.word}`:w.word)}<small>${esc(m.categories[w.c])}</small></span><button class="hear" data-action="speak" data-text="${esc(w.word)}" aria-label="Hear ${esc(w.word)}">${icon}</button><button data-action="bank-practice" data-topic="${m.id}" data-word="${esc(w.word)}">Practise</button></div>`).join('')||'<p>No words match. Try a different spelling or group.</p>';}
function bankPractice(id,word){const m=getModule(id),w=m.words.find(w=>w.word===word);if(!w)return;state.topic=id;state.mode='bank';state.day=1;state.sessions[sessionKey()]={i:0,deck:[{...w,type:m.type==='morphology'?'build':'spell',topic:id,context:m.maps.find(x=>x.word===word)?.context||'Listen to the word, then spell it.'}],attempts:0,helped:false,solved:false,feedback:null,answer:'',boxes:[],phase:'map',completedWords:[]};$('#dialog').close();render();}
function mixedSetup(){
 const selected=state.mixedTopics.length?state.mixedTopics:COURSE.filter(m=>countComplete(m)>0).map(m=>m.id);
 dialog(`${dialogHeader('Build your mixed review','Choose the patterns you want to remember. You will practise 12 words.')}<div class="topic-checks">${COURSE.map(m=>`<label><input type="checkbox" name="mixedTopic" value="${m.id}" ${selected.includes(m.id)?'checked':''}>${esc(m.title)}</label>`).join('')}</div><div class="dialog-toolbar"><button data-action="select-all-topics">Select all</button><button data-action="select-explored">Explored topics</button><button class="primary" data-action="start-mixed">Begin review</button></div><p class="small muted">Review alternates word sorting, spelling, and word building. Topics do not have to be completed first.</p>`);
}
function startMixed(){
 const ids=Array.from(document.querySelectorAll('[name="mixedTopic"]:checked')).map(x=>x.value);if(!ids.length){toast('Choose at least one topic to review.');return;}
 state.mixedTopics=ids;state.topic='mixed';state.day=1;state.mode='mixed';const deck=[];const offset=Math.floor(Math.random()*20);
 for(let i=0;i<12;i++){const m=getModule(ids[i%ids.length]),round=Math.floor(i/ids.length);if(i%2===0){const w=balanced(m,1,offset+i)[0];deck.push({type:'sort',topic:m.id,...w});}else if(m.type==='morphology'){const w=m.words[(offset+i*7)%m.words.length];deck.push({type:'build',topic:m.id,...w});}else{const w=m.maps[(offset+i)%m.maps.length];deck.push({type:'spell',topic:m.id,...w});}}
 state.sessions[sessionKey()]={i:0,deck,attempts:0,helped:false,solved:false,feedback:null,answer:'',boxes:[],phase:'map',completedWords:[]};$('#dialog').close();closeMenu();save();render();
}
function download(content,type,name){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function exportProgress(){download(JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2),'application/json','sound-structure-spell-progress.json');toast('Progress exported. Keep this file to move your practice to another device.');}
function csv(){const quote=s=>'"'+String(s??'').replace(/"/g,'""')+'"';const rows=[['Date','Topic','Day','Activity','Word or sentence','Attempts','Used help'],...state.records.map(r=>[r.at,getModule(r.topic).title,r.day,r.type,r.word,r.attempts,r.helped?'Yes':'No'])];download(rows.map(r=>r.map(quote).join(',')).join('\r\n'),'text/csv','sound-structure-spell-practice-log.csv');}
function importProgress(){const f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.hidden=true;f.addEventListener('cancel',()=>f.remove());document.body.append(f);f.addEventListener('change',async()=>{try{const file=f.files[0];f.remove();if(!file)return;if(file.size>3000000)throw Error('This file is too large. Choose a progress file exported by this app.');const p=JSON.parse(await file.text());validateImport(p);p.sessions=restoreSessions(p.sessions||{});window.pendingImport=p;dialog(`${dialogHeader('Replace this device’s progress?','The imported file will replace current progress and writing.')}<p>Import contains ${p.records.length} practice answers and ${Object.keys(p.completed).length} completed activities. Export your current work first if you want to keep it.</p><div class="dialog-toolbar"><button data-action="export">Export current progress</button><button data-action="close-dialog">Keep current work</button><button class="primary" data-action="confirm-import">Replace with imported progress</button></div>`);}catch(e){toast(e.message||'This file could not be read.');}});f.click();}

function restoreSessions(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length>200)throw Error('This file contains invalid saved sessions.');
 const out={};const string=(x,max=5000)=>typeof x==='string'?x.slice(0,max):'';
 for(const [key,s] of Object.entries(input)){
  const [id,day,mode]=key.split(':');const m=COURSE.find(m=>m.id===id);
  if(!s||typeof s!=='object'||(!m&&id!=='mixed')||(m&&(Number(day)<1||Number(day)>m.days))||!['learn','sort','map','analogy','sums','build','write','mixed','bank'].includes(mode))throw Error('This file contains an invalid saved activity.');
  if(mode==='write'){
   out[key]={dictationIndex:Math.min(m.sentences.length,Math.max(0,Number(s.dictationIndex)||0)),dictations:Array.isArray(s.dictations)?s.dictations.map(x=>string(x,1000)):[],attempts:Math.max(0,Number(s.attempts)||0),helped:!!s.helped,answer:string(s.answer,1000),feedback:null,checked:!!s.checked,checks:[0,1,2].map(i=>!!s.checks?.[i]),saved:!!s.saved};continue;
  }
  let deck=null;
  if(s.deck!==null&&s.deck!==undefined){
   if(!Array.isArray(s.deck)||s.deck.length>30)throw Error('This file contains an invalid practice deck.');
   deck=s.deck.map(q=>{
    const topic=COURSE.find(t=>t.id===q.topic);if(!topic)throw Error('Unknown practice topic.');let original;
    if(['sort','build'].includes(q.type))original=topic.words.find(w=>w.word===q.word);
    else if(q.type==='map'||q.type==='spell')original=topic.maps.find(w=>w.word===q.word)||(q.type==='spell'?topic.words.find(w=>w.word===q.word):null);
    else if(q.type==='sums')original=topic.sums?.find(w=>w.word===q.word);
    else if(q.type==='analogy')original=topic.analogies.find(w=>w.a===q.a&&w.b===q.b&&w.c===q.c&&w.answer===q.answer);
    if(!original)throw Error('This file contains an unknown practice answer.');return {...original,type:q.type,topic:topic.id};
   });
  }
  out[key]={i:Math.min(deck?.length||0,Math.max(0,Number(s.i)||0)),deck,attempts:Math.max(0,Number(s.attempts)||0),helped:!!s.helped,solved:!!s.solved,feedback:s.solved?{kind:'correct',title:'Your saved answer',text:'This answer was completed before exporting.'}:null,answer:string(s.answer,150),boxes:Array.isArray(s.boxes)?s.boxes.slice(0,10).map(x=>string(x,5)):[],phase:s.phase==='spell'?'spell':'map',completedWords:Array.isArray(s.completedWords)?s.completedWords.slice(0,30).map(x=>string(x,50)):[],basePOS:string(s.basePOS,20),newPOS:string(s.newPOS,20)};
 }
 return out;
}

function validateImport(p){
 const ids=new Set(COURSE.map(m=>m.id)),plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
 if(!plain(p)||p.version!==1||!plain(p.completed)||!plain(p.drafts)||!Array.isArray(p.records)||p.records.length>10000)throw Error('Choose a valid progress file exported by this app.');
 const validKey=k=>{const [id,d,mode]=k.split(':');return ids.has(id)&&Number(d)>=1&&Number(d)<=getModule(id).days&&modes(getModule(id)).includes(mode);};
 if(Object.keys(p.completed).some(k=>!validKey(k))||Object.values(p.completed).some(v=>typeof v!=='string'))throw Error('This file contains invalid activity progress.');
 if(Object.entries(p.drafts).some(([k,v])=>!validKey(k)||typeof v!=='string'||v.length>10000))throw Error('This file contains invalid writing data.');
 if(p.records.some(r=>!plain(r)||!ids.has(r.topic)||typeof r.word!=='string'||r.word.length>1000||!Number.isInteger(r.attempts)||r.attempts<1||typeof r.at!=='string'||!['sort','map','spell','analogy','sums','build','dictation'].includes(r.type)||typeof r.helped!=='boolean'))throw Error('This file contains an invalid practice log.');
}
function reveal(){
 const s=getSession(),q=ensureDeck(s)[s.i];if(s.solved)return;s.helped=true;
 if(q.type==='map'&&s.phase!=='spell'){s.boxes=[...q.graphemes];s.feedback={kind:'info',title:'Look at the map, then try it.',text:`${q.graphemes.join(' · ')} spells ${q.word}. Tap Check my map, then practise the whole word.`};}
 else{s.answer=q.type==='sums'?q.parts.join(' + '):q.answer||q.word;s.feedback={kind:'info',title:'Read it, then check your work.',text:`${q.type==='sums'?q.parts.join(' + ')+' = ':''}${q.answer||q.word}. Select or check this answer. It will be recorded as practice with help.`};}
 save();renderQuestion();
}
function hearCurrent(slow=false){const s=getSession(),q=ensureDeck(s)[s.i];if(q)say(q.word||q.answer,slow);}
const actions={
 'topic':el=>{if($('#dialog').open)$('#dialog').close();goTopic(el.dataset.id);},
 'day':el=>{state.day=Number(el.dataset.day);changeMode('learn');},'mode':el=>changeMode(el.dataset.mode),'close-menu':closeMenu,'next-mode':nextMode,
 'quiz':el=>{const s=getSession();if(s.solved)return;const q=RULE_QUIZZES[moduleNow().id];if(Number(el.dataset.answer)===q.correct){s.solved=true;s.feedback={kind:'correct',title:'That is the pattern.',text:q.why};markComplete();}else{s.attempts++;s.feedback={kind:'error',title:'Think about the examples.',text:q.why};}save();renderLearn(moduleNow());},
 'category':el=>{const s=getSession(),q=ensureDeck(s)[s.i];if(s.solved)return;if(Number(el.dataset.category)===q.c)succeed(s,q,explainWord(getModule(q.topic),q));else{s.wrongCategory=Number(el.dataset.category);fail(s,'Look closely at the vowel and the letters around it. '+getModule(q.topic).rule);}},
 'speak':el=>say(el.dataset.text),'hear-current':()=>hearCurrent(),'hear-slow':()=>hearCurrent(true),
 'tile':el=>{const s=getSession();if(s.solved)return;const inputs=[...document.querySelectorAll('[data-box]')];const index=Math.min(activeBox,inputs.length-1);if(index<0)return;inputs[index].value=el.dataset.tile;s.boxes[index]=el.dataset.tile;activeBox=Math.min(index+1,inputs.length-1);inputs[activeBox].focus();save();},
 'analogy-choice':el=>{getSession().answer=el.dataset.word;checkAnswer();},'check-map':checkMap,'clear-map':()=>{const s=getSession();s.boxes=[];s.feedback=null;activeBox=0;save();renderQuestion();},'next-question':nextQuestion,'reveal':reveal,
 'why':()=>{const s=getSession(),q=ensureDeck(s)[s.i],m=getModule(q.topic);dialog(`${dialogHeader('Why does it work?')}<p class="note-box">${esc(q.type==='analogy'?q.why:q.type==='sums'?`Write the separate morphemes with their full spellings. Then show the spelling changes when they join. ${q.parts.length>2?'This word has more than one suffix.':''}`:m.rule)}</p><p>Say the word aloud. Explain the spelling choice to someone before continuing.</p><button class="primary" data-action="close-dialog">Back to my word</button>`);},
 'restart-activity':()=>{const s=getSession();state.sessions[sessionKey()]={i:0,deck:s.deck,attempts:0,helped:false,solved:false,feedback:null,answer:'',boxes:[],phase:'map',completedWords:[]};save();renderQuestion();},
 'hear-sentence':()=>say(moduleNow().sentences[writingData().dictationIndex]),
 'show-sentence':()=>{const s=writingData();s.helped=true;s.feedback={kind:'info',title:'Read the model.',text:moduleNow().sentences[s.dictationIndex]};save();renderWriting(moduleNow());},
 'next-dictation':()=>{const s=writingData();if(!s.checked)return;s.dictationIndex++;s.answer='';s.feedback=null;s.checked=false;s.attempts=0;s.helped=false;save();renderWriting(moduleNow());},
 'save-writing':()=>{const s=writingData(),value=$('#ownSentence').value.trim();state.drafts[writingKey()+':sentence']=$('#ownSentence').value;if(value.split(/\s+/).length<3){toast('Write a sentence before saving.');return;}if(!s.checks.every(Boolean)){toast('Review your writing and tick each check first.');return;}if(s.dictationIndex<moduleNow().sentences.length){toast('Finish the dictated sentences, then save your own writing.');return;}s.saved=true;markComplete();save();renderWriting(moduleNow());toast('Writing saved for teacher review.');},
 'progress':showProgress,'tools':showTools,'lesson-notes':lessonNotes,'bank':showBank,'bank-practice':el=>bankPractice(el.dataset.topic,el.dataset.word),
 'close-dialog':()=>$('#dialog').close(),'voice-test':()=>say('A little practice. A lot of discovery.'),'export':exportProgress,'csv':csv,'import':importProgress,'print':()=>window.print(),
 'mixed-setup':mixedSetup,'select-all-topics':()=>document.querySelectorAll('[name="mixedTopic"]').forEach(e=>e.checked=true),
 'select-explored':()=>document.querySelectorAll('[name="mixedTopic"]').forEach(e=>e.checked=countComplete(getModule(e.value))>0),'start-mixed':startMixed,
 'confirm-import':()=>{const p=window.pendingImport;if(!p)return;validateImport(p);state={...blankState(),topic:COURSE.some(m=>m.id===p.topic)||p.topic==='mixed'?p.topic:'vce',day:Number(p.day)||1,mode:['learn','sort','map','analogy','sums','build','write','mixed','bank'].includes(p.mode)?p.mode:'learn',sessions:p.sessions,completed:p.completed,drafts:p.drafts,records:p.records,settings:{rate:[.65,.85,1].includes(p.settings?.rate)?p.settings.rate:.85,autoAudio:!!p.settings?.autoAudio}};delete window.pendingImport;$('#dialog').close();save();render();toast('Your progress, writing, and unfinished activities are imported.');},
 'reset-confirm':()=>dialog(`${dialogHeader('Reset progress on this device?')}<p>This clears saved activities, practice answers, and writing in this browser. Export a backup first if you want to keep them.</p><div class="dialog-toolbar"><button data-action="export">Export backup</button><button data-action="close-dialog">Keep my work</button><button data-action="confirm-reset">Clear saved progress</button></div>`),
 'confirm-reset':()=>{state=blankState();save();$('#dialog').close();render();toast('This device’s progress is reset.');}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el&&!el.disabled){const fn=actions[el.dataset.action];if(fn)fn(el);}});
document.addEventListener('submit',e=>{if(e.target.id==='answerForm'){e.preventDefault();checkAnswer();}if(e.target.id==='dictationForm'){e.preventDefault();checkDictation();}});
document.addEventListener('focusin',e=>{if(e.target.matches('[data-box]'))activeBox=Number(e.target.dataset.box);});
document.addEventListener('input',e=>{const el=e.target;if(el.dataset.draft){state.drafts[el.dataset.draft]=el.value;save();}if(el.matches('[data-box]')){getSession().boxes[Number(el.dataset.box)]=el.value;save();}if(el.id==='answerInput'){getSession().answer=el.value;save();}if(el.id==='dictationInput'){writingData().answer=el.value;save();}if(el.id==='bankSearch')renderBank();});
document.addEventListener('change',e=>{const el=e.target;if(el.id==='bankTopic'){bankCategories();renderBank();}if(el.id==='bankCategory')renderBank();if(el.id==='speechRate'){state.settings.rate=Number(el.value);save();}if(el.id==='autoAudio'){state.settings.autoAudio=el.checked;save();}if(el.dataset.writingCheck){writingData().checks[Number(el.dataset.writingCheck)]=el.checked;save();}if(el.id==='basePOS'||el.id==='newPOS'){getSession()[el.id]=el.value;save();}});
$('#menuButton').addEventListener('click',()=>{const open=!$('#sidebar').classList.contains('open');$('#sidebar').classList.toggle('open',open);$('#scrim').hidden=!open;$('#menuButton').setAttribute('aria-expanded',String(open));});$('#scrim').addEventListener('click',closeMenu);
$('.brand').addEventListener('click',e=>{e.preventDefault();goTopic('vce');});
$('#progressButton').addEventListener('click',showProgress);$('#toolsButton').addEventListener('click',showTools);
$('#directionsButton').addEventListener('click',()=>say(state.topic==='mixed'?instructions.mixed:instructions[state.mode]+' '+moduleNow().rule));
$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
window.addEventListener('resize',()=>{if(window.innerWidth>800)closeMenu();const close=$('.close-path');if(close)close.hidden=window.innerWidth>800;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();if(e.key==='Enter'&&e.target.matches('[data-box]')){e.preventDefault();checkMap();}});
render();
