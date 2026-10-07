/* Edit the CONFIG JSON above to change cards, categories and explanations. */
const CONFIG=JSON.parse(document.getElementById('game-config').textContent);
const bank=document.getElementById('items'),feedback=document.getElementById('feedback');
const groups=[...document.querySelectorAll('.drop-zone')];
let selected=null,dragged=null,sorted=0,roundIndex=0;
const currentItems=()=>CONFIG.rounds?CONFIG.items.filter(item=>CONFIG.rounds[roundIndex].items.includes(item.key)):CONFIG.items;
function say(message,kind=''){feedback.textContent=message;feedback.dataset.kind=kind;}
function select(card){
  if(card.disabled)return;
  if(selected)selected.setAttribute('aria-pressed','false');
  selected=card;card.setAttribute('aria-pressed','true');document.getElementById('clue').textContent='';
  say(card.dataset.label+' selected. Choose '+CONFIG.groups.map(g=>g.label).join(', ')+'.');
}
function place(card,group){
  if(!card||card.disabled){say('Choose a card first, then choose a group.');return;}
  const item=CONFIG.items.find(x=>x.key===card.dataset.key);
  if(group!==item.group){say('Try again. '+item.why,'retry');return;}
  card.disabled=true;card.draggable=false;card.setAttribute('aria-pressed','false');
  card.setAttribute('aria-label',item.label+', sorted into '+CONFIG.groups.find(g=>g.id===group).label);
  document.getElementById(group).append(card);sorted++;
  if(selected===card)selected=null;
  document.getElementById('progress').textContent=sorted+' / '+currentItems().length+' sorted';
  document.getElementById('bank-hint').textContent=(currentItems().length-sorted)+' cards left';
  document.getElementById('clue').textContent='';say('Correct! '+item.why);
  if(sorted===currentItems().length){
    const done=document.createElement('p');done.className='finished-bank';done.textContent='All observations sorted!';bank.append(done);
    say('Notebook complete! '+(CONFIG.rounds?CONFIG.rounds[roundIndex].reflection:CONFIG.reflection),'complete');
  }
}
function reset(){
  selected=null;dragged=null;sorted=0;bank.replaceChildren();document.getElementById('clue').textContent='';
  groups.forEach(g=>{g.replaceChildren();g.classList.remove('over');});
  const cards=[...currentItems()];
  for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
  cards.forEach(item=>{
    const card=document.createElement('button');card.type='button';card.className='card';card.draggable=true;
    card.dataset.key=item.key;card.dataset.label=item.label;card.setAttribute('aria-pressed','false');card.setAttribute('aria-label',item.label+', choose card');
    const picture=document.createElement('span');picture.className='specimen';picture.setAttribute('aria-hidden','true');
    if(item.image){const img=document.createElement('img');img.src=item.image;img.alt='';img.draggable=false;picture.append(img);card.classList.add('photo');}
    else picture.innerHTML=item.art;
    const label=document.createElement('span');label.className='card-label';label.textContent=item.label;card.append(picture,label);
    card.addEventListener('click',()=>select(card));
    card.addEventListener('dragstart',event=>{select(card);dragged=card;card.classList.add('dragging');event.dataTransfer.setData('text/plain',item.key);event.dataTransfer.effectAllowed='move';});
    card.addEventListener('dragend',()=>{card.classList.remove('dragging');groups.forEach(g=>g.classList.remove('over'));dragged=null;});bank.append(card);
  });
  document.getElementById('progress').textContent='0 / '+cards.length+' sorted';
  document.getElementById('bank-hint').textContent=window.matchMedia('(max-width:700px)').matches?'Swipe for more cards':cards.length+' cards to sort';
  say('Choose any card to begin.');bank.scrollLeft=0;
}
document.querySelectorAll('.category').forEach(button=>button.addEventListener('click',()=>{
  const card=selected;place(card,button.dataset.group);
  if(card?.disabled){const next=bank.querySelector('.card:not(:disabled)');if(next)next.focus({preventScroll:true});}
}));
groups.forEach(zone=>{
  zone.addEventListener('click',event=>{if(event.target===zone)place(selected,zone.id);});
  zone.addEventListener('dragover',event=>{if(dragged){event.preventDefault();event.dataTransfer.dropEffect='move';zone.classList.add('over');}});
  zone.addEventListener('dragleave',()=>zone.classList.remove('over'));
  zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('over');if(dragged)place(dragged,zone.id);});
});
if(CONFIG.rounds)CONFIG.rounds.forEach((round,index)=>{
  const button=document.createElement('button');button.type='button';button.textContent=round.label;button.setAttribute('aria-pressed',String(index===0));
  button.addEventListener('click',()=>{if(roundIndex===index)return;roundIndex=index;document.querySelectorAll('#rounds button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));document.getElementById('brief').textContent=round.brief;reset();});document.getElementById('rounds').append(button);
});
const clueButton=document.getElementById('show-clue');
if(clueButton)clueButton.addEventListener('click',()=>{document.getElementById('clue').textContent=selected?CONFIG.items.find(i=>i.key===selected.dataset.key).clue:'Choose an animal first to read its field note.';});
document.getElementById('reset').addEventListener('click',reset);reset();
/* Fetch original source, never export a student's current answers. Embed photos for portable copies. */
const dialog=document.getElementById('own-dialog'),copyStatus=document.getElementById('copy-status');
const downloadButton=document.getElementById('download'),copyButton=document.getElementById('copy');let copySource='';
document.getElementById('make-own').addEventListener('click',async()=>{
  dialog.showModal();copyStatus.textContent='Preparing your copy…';downloadButton.disabled=copyButton.disabled=true;
  try{
    const response=await fetch('https://raw.githubusercontent.com/Maltais239/interactives/main/'+CONFIG.folder+'/index.html',{cache:'no-cache'});
    if(!response.ok)throw new Error('Could not load the source. Use the source-files link below.');
    const documentCopy=new DOMParser().parseFromString(await response.text(),'text/html');
    documentCopy.querySelectorAll('script[data-lab-analytics],script[src*="googletagmanager"],script[src*="analytics.js"]').forEach(s=>s.remove());
    const configNode=documentCopy.getElementById('game-config'),portable=JSON.parse(configNode.textContent);
    await Promise.all(portable.items.filter(i=>i.image&&!i.image.startsWith('data:')).map(async item=>{
      const imageResponse=await fetch(new URL(item.image,'https://raw.githubusercontent.com/Maltais239/interactives/main/'+CONFIG.folder+'/').href);
      if(!imageResponse.ok)throw new Error('Could not include a photograph. Use the source-files link below.');
      item.image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;imageResponse.blob().then(blob=>reader.readAsDataURL(blob),reject);});
    }));
    configNode.textContent=JSON.stringify(portable).replace(/</g,'\\u003c');
    copySource='<!doctype html>\n'+documentCopy.documentElement.outerHTML;
    downloadButton.disabled=copyButton.disabled=false;copyStatus.textContent='Ready. Your copy includes the pictures and game.';
  }catch(error){copyStatus.textContent=error.message;}
});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
downloadButton.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([copySource],{type:'text/html'}));const link=document.createElement('a');link.href=url;link.download=CONFIG.folder+'-field-notebook.html';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);copyStatus.textContent='HTML downloaded. Open the file in a browser to try it.';});
copyButton.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(copySource);copyStatus.textContent='HTML copied.';}catch{copyStatus.textContent='Your browser could not copy the HTML. Download it instead.';}});
