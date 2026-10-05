'use strict';
const config=JSON.parse(document.getElementById('game-data').textContent);
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let roundIndex=0,selected=null,placements={},checked={},showClues=false,order=[];
const itemsById=new Map(config.items.map(item=>[item.id,item]));
const round=()=>config.rounds[roundIndex];
const currentItems=()=>order.map(id=>itemsById.get(id));
const answer=item=>item[round().answerKey];
const category=id=>round().categories.find(c=>c.id===id);
const clue=item=>item[round().clueKey||'clue'];
const explanation=item=>item[round().explanationKey||'explanation'];
function announce(text){$('liveStatus').textContent=text;}
function shuffle(values){const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function cardHTML(item){
 const state=checked[item.id],place=placements[item.id],name=item.name;
 return `<button type="button" class="card ${state||''}" data-card="${esc(item.id)}" draggable="true" aria-pressed="${selected===item.id}" aria-label="${esc(name)}, ${place?esc(category(place).name):'not sorted'}, select to move"><img src="${esc(item.image)}" alt="" width="600" height="450" draggable="false"><span class="card-name">${esc(name)}</span>${showClues?`<span class="card-clue">${esc(clue(item))}</span>`:''}${state?`<span class="card-status">${state==='correct'?'✓ Supported':'↻ Revisit'}</span>`:''}</button>`;
}
function renderBoard(focusId){
 $('roundTitle').textContent=round().title;$('roundBrief').textContent=round().brief;
 $('roundTabs').innerHTML=config.rounds.map((r,i)=>`<button type="button" class="round-tab" data-round="${i}" aria-pressed="${i===roundIndex}">${i+1}. ${esc(r.tab)}</button>`).join('');
 $('zones').style.setProperty('--zone-count',round().categories.length);
 $('zones').innerHTML=round().categories.map(c=>{
  const items=currentItems().filter(item=>placements[item.id]===c.id);
  return `<section class="zone" data-zone="${esc(c.id)}" aria-label="${esc(c.name)}"><button type="button" class="zone-head" data-move="${esc(c.id)}" aria-label="Move selected card to ${esc(c.name)}"><span><strong>${esc(c.name)}</strong><small>${esc(c.desc)}</small></span><span class="zone-count" aria-hidden="true">${items.length}</span></button><div class="zone-items">${items.length?items.map(cardHTML).join(''):'<p class="zone-placeholder">Place cards here</p>'}</div></section>`;
 }).join('');
 const unplaced=currentItems().filter(item=>!placements[item.id]);
 $('tray').innerHTML=unplaced.length?unplaced.map(cardHTML).join(''):'<div class="empty-tray">All cards placed. Check your evidence, or move a card to revise.</div>';
 $('trayTitle').textContent=unplaced.length?'Field cards · '+unplaced.length+' to place':'Field cards · all placed';
 $('progressText').textContent=(order.length-unplaced.length)+' / '+order.length+' placed';
 $('progressFill').style.width=((order.length-unplaced.length)/order.length*100)+'%';
 $('toggleClues').setAttribute('aria-pressed',String(showClues));$('toggleClues').textContent=showClues?'Hide field notes':'Show field notes';
 renderMoveBar();
 if(focusId){const card=document.querySelector(`[data-card="${focusId}"]`);card?.focus({preventScroll:true});}
}
function renderMoveBar(){
 $('moveBar').hidden=!selected;
 if(!selected)return;
 $('selectedName').textContent=itemsById.get(selected).name;
 $('moveButtons').innerHTML=round().categories.map(c=>`<button type="button" data-move="${esc(c.id)}">${esc(c.name)}</button>`).join('')+'<button type="button" class="return" data-move="tray">Return to cards</button>';
}
function selectCard(id){selected=selected===id?null:id;renderBoard(id);announce(selected?itemsById.get(id).name+' selected. Choose a group using the move buttons or a group heading.':'Selection cleared.');}
function moveCard(id,target){
 if(!itemsById.has(id)||!order.includes(id)||!(target==='tray'||category(target)))return;
 const item=itemsById.get(id);placements[id]=target==='tray'?null:target;delete checked[id];selected=null;
 $('finish').hidden=true;$('results').hidden=true;
 renderBoard(id);announce(item.name+(target==='tray'?' returned to field cards.':' moved to '+category(target).name+'.')+' Check your sort when ready.');
}
function startRound(index,focus=false){
 if(!config.rounds[index])return;
 roundIndex=index;selected=null;placements={};checked={};order=shuffle(round().items);$('results').hidden=true;$('finish').hidden=true;$('reasoning').value='';
 $('reflectionPrompt').textContent=round().reflection;renderBoard();
 if(focus)$('roundTitle').focus({preventScroll:true});
 announce(round().title+'. '+order.length+' cards to sort.');
}
function checkSort(){
 checked={};let correct=0,unplaced=0;
 const feedback=currentItems().map(item=>{
  const place=placements[item.id];
  if(!place){unplaced++;return `<article class="feedback-item"><h4>${esc(item.name)} · not placed yet</h4><p>Read its field note, then choose a group.</p></article>`;}
  const ok=place===answer(item);checked[item.id]=ok?'correct':'revisit';if(ok)correct++;
  return `<article class="feedback-item ${ok?'correct':'revisit'}"><h4>${ok?'✓ Supported':'↻ Revisit'} · ${esc(item.name)}</h4><p>${esc(explanation(item))}</p>${item.source?`<a href="${esc(item.source)}" target="_blank" rel="noopener">Read the animal profile ↗</a>`:''}</article>`;
 }).join('');
 renderBoard();$('results').hidden=false;$('resultsTitle').textContent=correct===order.length?'Your evidence fits every group.':correct+' of '+order.length+' placements supported';
 $('resultsSummary').textContent=correct===order.length?'Now explain one choice, then try another challenge.':unplaced?unplaced+' card'+(unplaced===1?' is':'s are')+' still unplaced. Use the notes below to complete and revise your sort.':'Use the notes below to rethink the cards marked “Revisit.”';
 $('feedbackList').innerHTML=feedback;$('finish').hidden=correct!==order.length;
 $('finishTitle').textContent=round().finishTitle||'Field report complete';$('finishPrompt').textContent=round().reflection;
 const nextIndex=(roundIndex+1)%config.rounds.length;$('nextRound').textContent='Try '+config.rounds[nextIndex].tab;
 $('resultsTitle').focus({preventScroll:true});$('results').scrollIntoView({block:'nearest',behavior:'smooth'});
 announce(correct+' of '+order.length+' placements supported.'+(unplaced?' '+unplaced+' still unplaced.':'')+(correct===order.length?' Challenge complete.':''));
}
document.addEventListener('click',event=>{
 const card=event.target.closest('[data-card]');if(card){selectCard(card.dataset.card);return;}
 const move=event.target.closest('[data-move]');if(move){if(selected)moveCard(selected,move.dataset.move);else announce('Select a card first, then choose a group.');return;}
 const tab=event.target.closest('[data-round]');if(tab){startRound(Number(tab.dataset.round),true);}
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&selected){const id=selected;selected=null;renderBoard(id);announce('Selection cleared.');}
 const card=event.target.closest('[data-card]');if(card&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
  event.preventDefault();const cards=[...document.querySelectorAll('[data-card]')],index=cards.indexOf(card),delta=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;cards[(index+delta+cards.length)%cards.length]?.focus();
 }
});
document.addEventListener('dragstart',event=>{const card=event.target.closest('[data-card]');if(!card)return;event.dataTransfer.setData('text/plain',card.dataset.card);event.dataTransfer.effectAllowed='move';selected=card.dataset.card;renderMoveBar();});
document.addEventListener('dragover',event=>{const zone=event.target.closest('[data-zone]');if(zone){event.preventDefault();event.dataTransfer.dropEffect='move';zone.classList.add('over');}});
document.addEventListener('dragleave',event=>{const zone=event.target.closest('[data-zone]');if(zone&&!zone.contains(event.relatedTarget))zone.classList.remove('over');});
document.addEventListener('drop',event=>{const zone=event.target.closest('[data-zone]');if(!zone)return;event.preventDefault();const id=event.dataTransfer.getData('text/plain');moveCard(id,zone.dataset.zone);document.querySelectorAll('.over').forEach(el=>el.classList.remove('over'));});
document.addEventListener('dragend',()=>document.querySelectorAll('.over').forEach(el=>el.classList.remove('over')));
$('checkSort').onclick=checkSort;$('resetRound').onclick=()=>startRound(roundIndex,true);
$('toggleClues').onclick=()=>{showClues=!showClues;renderBoard();$('toggleClues').focus({preventScroll:true});announce(showClues?'Field notes shown.':'Field notes hidden.');};
$('nextRound').onclick=()=>startRound((roundIndex+1)%config.rounds.length,true);
$('help').onclick=()=>$('helpDialog').showModal();$('closeHelp').onclick=()=>$('helpDialog').close();$('helpDialog').addEventListener('close',()=>$('help').focus({preventScroll:true}));
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement){event.target.hidden=true;const note=document.createElement('span');note.className='card-clue';note.textContent='Image unavailable. Use the card name and field note.';event.target.after(note);}},true);
startRound(0);
