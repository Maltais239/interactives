'use strict';
const ITEMS = [
  {id:'food',label:'Food',category:'needs',tint:'#fff0d8',why:'Nutritious food gives our bodies energy and helps us grow.'},
  {id:'water',label:'Water',category:'needs',tint:'#e4f4ff',why:'Clean drinking water keeps our bodies working.'},
  {id:'clothing',label:'Clothing',category:'needs',tint:'#e9efff',why:'Suitable clothing protects us from the weather.'},
  {id:'doctor',label:'Doctor',category:'needs',tint:'#def5ef',why:'Health care helps us stay well and treats illness or injury.'},
  {id:'house',label:'House',category:'needs',tint:'#ffe8dc',why:'Everyone needs safe shelter. It does not have to be a house; an apartment or another safe home also provides shelter.'},
  {id:'school',label:'School',category:'needs',tint:'#fff2cb',why:'Education helps us learn skills and participate in our communities. Learning can happen in different places.'},
  {id:'air',label:'Fresh air',category:'needs',tint:'#e5f5df',why:'We need clean air to breathe and stay healthy.'},
  {id:'candy',label:'Candy',category:'wants',tint:'#ffe9f0',why:'Candy is a treat. Nutritious food is a need; candy is an extra.'},
  {id:'games',label:'Video games',category:'wants',tint:'#ebe9ff',why:'In this example, video games are an optional way to have fun.'},
  {id:'tv',label:'TV',category:'wants',tint:'#e8efff',why:'A TV used for entertainment is an extra in this example.'},
  {id:'hockey',label:'Hockey stick',category:'wants',tint:'#ffefda',why:'Being active is important, but a particular piece of sports equipment is an extra in this example.'},
  {id:'bike',label:'Bike',category:'wants',tint:'#e2f4f4',why:'This bike is for recreation. A bike used as someone’s essential transportation could be a need.'},
  {id:'teddy',label:'Teddy bear',category:'wants',tint:'#fff1df',why:'This toy is an extra in our example. A comfort object could play an important role for a particular person.'},
  {id:'movie',label:'Movie',category:'wants',tint:'#ffe6e4',why:'Going to a movie is one optional way to enjoy ourselves.'}
];
const zones = ['pool','needs','wants'].map(id => document.getElementById(id));
const selectedStatus = document.getElementById('selection-status');
const placeButtons = [...document.querySelectorAll('[data-place]')];
const result = document.getElementById('result');
let selected = null, checked = false, dragged = null, suppressClick = false;
function updateCounts() {
  const needs = document.querySelectorAll('#needs .picture-card').length;
  const wants = document.querySelectorAll('#wants .picture-card').length;
  document.getElementById('needs-count').textContent = needs;
  document.getElementById('wants-count').textContent = wants;
  document.getElementById('placed-count').textContent = needs + wants;
  zones.slice(1).forEach(zone => {zone.querySelector('.empty-label').hidden = !!zone.querySelector('.picture-card');});
}
function selectCard(card) {
  if (selected) selected.setAttribute('aria-pressed','false');
  selected = selected === card ? null : card;
  if (selected) selected.setAttribute('aria-pressed','true');
  selectedStatus.textContent = selected ? `${selected.dataset.label} selected. Choose a group.` : 'Select a picture to begin.';
  placeButtons.forEach(button => {button.disabled = !selected;});
}
function clearFeedback() {
  if (!checked) return;
  checked = false;
  document.querySelectorAll('.picture-card').forEach(card => {card.classList.remove('correct','revise','unplaced');card.querySelector('.card-feedback').textContent='';card.removeAttribute('aria-describedby');});
  result.classList.remove('success');
  result.textContent = 'Choices changed. Check again when you’re ready.';
  document.getElementById('review').hidden = true;
}
function placeCard(card, zoneId, keyboard = false) {
  if (!card || !zones.some(zone => zone.id === zoneId)) return;
  clearFeedback();
  const label = card.dataset.label;
  document.getElementById(zoneId).appendChild(card);
  card.setAttribute('aria-pressed','false');
  if (selected) selected.setAttribute('aria-pressed','false');
  selected = null;
  placeButtons.forEach(button => {button.disabled = true;});
  selectedStatus.textContent = `${label} moved to ${zoneId === 'pool' ? 'the tray' : zoneId}. Select another picture.`;
  updateCounts();
  if (keyboard) (document.querySelector('#pool .picture-card') || card).focus({preventScroll:true});
}
function checkAnswers() {
  checked = true;
  let correct = 0, unplaced = 0;
  const list = document.getElementById('review-list');list.replaceChildren();
  ITEMS.forEach(item => {
    const card = document.getElementById('card-'+item.id);
    const location = card.parentElement.id;
    const good = location === item.category, waiting = location === 'pool';
    if (good) correct++;if (waiting) unplaced++;
    card.classList.remove('correct','revise','unplaced');
    card.classList.add(good ? 'correct' : waiting ? 'unplaced' : 'revise');
    const feedback = card.querySelector('.card-feedback');
    feedback.textContent = good ? '✓ Correct' : waiting ? 'Not sorted yet' : '↻ Try again';
    card.setAttribute('aria-describedby',feedback.id);
    const li = document.createElement('li'), strong = document.createElement('strong');
    strong.textContent = `${item.label} — ${item.category === 'needs' ? 'Need' : 'Want'}: `;
    li.append(strong,document.createTextNode(item.why));list.appendChild(li);
  });
  const wrong = ITEMS.length - correct - unplaced;
  result.classList.toggle('success', correct === ITEMS.length);
  result.textContent = correct === ITEMS.length ? 'All 14 match our sorting rule! Now talk about a choice that could change.' : `${correct} of 14 match our rule. ${unplaced ? `${unplaced} still to sort. ` : ''}${wrong ? `Revisit ${wrong} marked ${wrong === 1 ? 'picture' : 'pictures'}. ` : ''}You can move pictures and check again.`;
  document.getElementById('review').hidden = false;
}
function startOver() {
  selected = null;checked = false;dragged = null;suppressClick = false;
  placeButtons.forEach(button => {button.disabled=true;});
  document.querySelectorAll('.picture-card').forEach(card => card.remove());
  const shuffled = [...ITEMS];
  for (let i=shuffled.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  shuffled.forEach(item => {
    const card = document.createElement('button');
    card.type = 'button';card.className='picture-card';card.id='card-'+item.id;card.draggable=true;
    card.dataset.label=item.label;card.dataset.category=item.category;
    card.setAttribute('aria-label',item.label);card.setAttribute('aria-pressed','false');card.style.setProperty('--tint',item.tint);
    const picture = document.createElement('span');picture.className='picture';
    const image = document.createElement('img');image.src=`assets/${item.id}.webp?v=20261006-flat`;image.alt='';image.width=200;image.height=200;image.draggable=false;picture.appendChild(image);
    const name = document.createElement('span');name.className='card-name';name.textContent=item.label;
    const feedback = document.createElement('span');feedback.className='card-feedback';feedback.id='feedback-'+item.id;
    card.append(picture,name,feedback);
    card.addEventListener('click',()=>{if(!suppressClick)selectCard(card);});
    card.addEventListener('dragstart',event=>{dragged=card;suppressClick=true;event.dataTransfer.setData('text/plain',card.id);event.dataTransfer.effectAllowed='move';card.classList.add('dragging');});
    card.addEventListener('dragend',()=>{card.classList.remove('dragging');dragged=null;zones.forEach(zone=>zone.classList.remove('over'));setTimeout(()=>{suppressClick=false;},0);});
    document.getElementById('pool').appendChild(card);
  });
  selectedStatus.textContent='Select a picture to begin.';
  result.textContent='Sort all 14 pictures, then check your choices.';result.classList.remove('success');
  document.getElementById('review').hidden=true;document.getElementById('review').open=false;updateCounts();
}
placeButtons.forEach(button=>button.addEventListener('click',event=>placeCard(selected,button.dataset.place,event.detail===0)));
zones.forEach(zone=>{
  zone.addEventListener('dragover',event=>{if(dragged){event.preventDefault();event.dataTransfer.dropEffect='move';zone.classList.add('over');}});
  zone.addEventListener('dragleave',event=>{if(!zone.contains(event.relatedTarget))zone.classList.remove('over');});
  zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('over');if(dragged && event.dataTransfer.getData('text/plain')===dragged.id)placeCard(dragged,zone.id);});
});
document.addEventListener('keydown',event=>{
  if(!selected || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select'))return;
  const target={n:'needs',w:'wants',Backspace:'pool'}[event.key.length===1?event.key.toLowerCase():event.key];
  if(target){event.preventDefault();placeCard(selected,target,true);}else if(event.key==='Escape'){event.preventDefault();selectCard(selected);}
});
document.getElementById('check-btn').addEventListener('click',checkAnswers);
document.getElementById('reset-btn').addEventListener('click',startOver);
startOver();
