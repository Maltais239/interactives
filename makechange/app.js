'use strict';
const moneyTypes = [
            { value: 100, label: '$100', type: 'bill', imageUrl: 'assets/money-0.webp' }, { value: 50, label: '$50', type: 'bill', imageUrl: 'assets/money-1.webp' },
            { value: 20, label: '$20', type: 'bill', imageUrl: 'assets/money-2.webp' }, { value: 10, label: '$10', type: 'bill', imageUrl: 'assets/money-3.webp' },
            { value: 5, label: '$5', type: 'bill', imageUrl: 'assets/money-4.webp' }, { value: 2, label: '$2', type: 'coin', imageUrl: 'assets/money-5.webp' },
            { value: 1, label: '$1', type: 'coin', imageUrl: 'assets/money-6.webp' }, { value: 0.25, label: '25¢', type: 'coin', imageUrl: 'assets/money-7.webp' },
            { value: 0.10, label: '10¢', type: 'coin', imageUrl: 'assets/money-8.webp' }, { value: 0.05, label: '5¢', type: 'coin', imageUrl: 'assets/money-9.webp' }
];

const $ = id => document.getElementById(id);
const moneyTill = $('moneyTill'), tray = $('changeGivenBox');
const checkButton = $('checkButton'), nextButton = $('newTransactionButton');
let difficulty = 'normal', completed = 0, independent = 0;
let solved = false, attempted = false, usedHint = false;
let priceCents = 0, cashCents = 0, paidCents = 0, dueCents = 0;
let timerInterval = null, touchDrag = null, suppressClickUntil = 0;
const dollars = cents => '$' + (cents / 100).toFixed(2);
const valueCents = money => Math.round(money.value * 100);

function createMoney(money, inTray = false) {
  const item = document.createElement('div');
  item.className = 'money-item ' + money.type;
  item.dataset.value = money.value;
  item.dataset.cents = valueCents(money);
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', (inTray ? 'Remove ' : 'Add ') + money.label);
  item.tabIndex = 0;
  const img = document.createElement('img');
  img.src = money.imageUrl; img.alt = money.label;
  img.className = 'money-image ' + money.type; img.draggable = false;
  img.addEventListener('error', () => { item.textContent = money.label; });
  item.append(img);
  item.addEventListener('click', () => {
    if (solved || Date.now() < suppressClickUntil) return;
    if (inTray) item.remove(); else addMoney(money);
    updateTotal(); feedback('');
  });
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
  });
  if (!inTray) {
    item.draggable = true;
    item.addEventListener('dragstart', e => {
      if (solved) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', String(money.value));
      e.dataTransfer.effectAllowed = 'copy';
    });
    item.addEventListener('dragend', () => tray.classList.remove('drag-over'));
    item.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch' || solved || touchDrag) return;
      touchDrag = { id:e.pointerId, item, money, x:e.clientX, y:e.clientY, ghost:null };
      item.setPointerCapture(e.pointerId);
    });
    item.addEventListener('pointermove', e => {
      if (!touchDrag || touchDrag.id !== e.pointerId) return;
      if (!touchDrag.ghost && Math.hypot(e.clientX-touchDrag.x, e.clientY-touchDrag.y) > 10) {
        touchDrag.ghost = item.cloneNode(true);
        touchDrag.ghost.classList.add('ghost-image');
        touchDrag.ghost.style.width = item.offsetWidth + 'px';
        touchDrag.ghost.removeAttribute('role'); touchDrag.ghost.removeAttribute('tabindex');
        touchDrag.ghost.setAttribute('aria-hidden','true');
        document.body.append(touchDrag.ghost);
      }
      if (touchDrag.ghost) {
        touchDrag.ghost.style.left = e.clientX - item.offsetWidth/2 + 'px';
        touchDrag.ghost.style.top = e.clientY - item.offsetHeight/2 + 'px';
        const r=tray.getBoundingClientRect();
        tray.classList.toggle('drag-over', e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom);
      }
    });
    item.addEventListener('pointerup', e => finishTouch(e, false));
    item.addEventListener('pointercancel', e => finishTouch(e, true));
  }
  return item;
}
function finishTouch(e, cancelled) {
  if (!touchDrag || touchDrag.id !== e.pointerId) return;
  if (touchDrag.ghost) {
    if (!cancelled && tray.classList.contains('drag-over')) addMoney(touchDrag.money);
    touchDrag.ghost.remove(); suppressClickUntil = Date.now()+500;
  }
  touchDrag=null; tray.classList.remove('drag-over');
}
function addMoney(money) {
  if (solved) return;
  tray.append(createMoney(money, true)); updateTotal(); feedback('');
}
function totalInTray() { return [...tray.children].reduce((sum,item)=>sum+Number(item.dataset.cents),0); }
function updateTotal() {
  $('currentTotal').textContent = dollars(totalInTray());
  tray.classList.toggle('empty', tray.children.length===0);
  checkButton.disabled=solved;
}
function feedback(message, type='info') {
  $('feedback').textContent=message; $('feedback').dataset.type=type;
}
function progress() {
  $('round-status').textContent = completed===8 ? 'Round complete · '+independent+' of 8 first-try solutions' : solved ? completed+' of 8 complete · '+independent+' first-try solutions' : 'Transaction '+(completed+1)+' of 8';
  $('round-dots').replaceChildren(...Array.from({length:8},(_,i)=>{
    const dot=document.createElement('span');
    dot.className = i<completed ? 'done' : i===completed ? 'current' : '';
    return dot;
  }));
  document.querySelectorAll('.money-item').forEach(item=>item.setAttribute('aria-disabled',String(solved)));
}
function clearTray() {
  if(solved)return;
  tray.replaceChildren(); updateTotal(); feedback('');
}
function newTransaction() {
  stopTimer(); solved=false; attempted=false; usedHint=false;
  nextButton.disabled=true; $('clearButton').disabled=false; $('hint-change').disabled=false;
  const max=difficulty==='easy'?499:difficulty==='normal'?1999:9999;
  priceCents = 1+Math.floor(Math.random()*max);
  cashCents = Math.round(priceCents/5)*5;
  const cap=difficulty==='easy'?1000:difficulty==='normal'?2000:10000;
  const payments=[500,1000,2000,5000,10000].filter(b=>b>=cashCents && b<=cap);
  paidCents=payments[Math.floor(Math.random()*payments.length)];
  dueCents=paidCents-cashCents;
  $('totalCost').textContent=dollars(priceCents); $('roundedTotal').textContent=dollars(cashCents);
  $('amountPaid').textContent=dollars(paidCents); $('changeDue').textContent=dollars(dueCents);
  $('changeDueContainer').style.display=difficulty==='easy'?'block':'none';
  clearTray(); progress(); refreshTimer();
}
function checkChange() {
  if(solved)return;
  const total=totalInTray();
  if(total===dueCents) {
    stopTimer(); solved=true; completed++; if(!attempted && !usedHint)independent++;
    let remaining=dueCents, optimal=0;
    for(const money of moneyTypes){const cents=valueCents(money); optimal+=Math.floor(remaining/cents); remaining%=cents;}
    feedback(completed===8 ? 'Round complete! You solved all eight transactions. Restart round to play again.' : tray.children.length===optimal ? 'Perfect change! You used the fewest bills and coins.' : 'Correct! You gave exactly the right change.', 'success');
    nextButton.disabled=completed===8; $('clearButton').disabled=true; $('hint-change').disabled=true;
    updateTotal(); progress();
  } else {
    attempted=true;
    feedback(total>dueCents ? 'Too much! You gave '+dollars(total)+'. Try removing some.' : 'Not enough! You gave '+dollars(total)+'. Try adding more.', 'error');
  }
}
function stopTimer(){clearInterval(timerInterval);timerInterval=null;}
function refreshTimer(){
  stopTimer(); $('timerContainer').style.display=$('timed').checked?'block':'none';
  if(!$('timed').checked || solved)return;
  let remaining=30; $('timer').textContent=remaining;
  timerInterval=setInterval(()=>{
    $('timer').textContent=--remaining;
    if(remaining<=0){stopTimer();attempted=true;feedback('Time is up. Keep working, then check your change.','info');}
  },1000);
}
tray.addEventListener('dragover',e=>{if(solved)return;e.preventDefault();tray.classList.add('drag-over');e.dataTransfer.dropEffect='copy';});
tray.addEventListener('dragleave',e=>{if(!tray.contains(e.relatedTarget))tray.classList.remove('drag-over');});
tray.addEventListener('drop',e=>{
  e.preventDefault();tray.classList.remove('drag-over');
  const money=moneyTypes.find(m=>String(m.value)===e.dataTransfer.getData('text/plain'));
  if(money)addMoney(money);
});
checkButton.addEventListener('click',checkChange);
nextButton.addEventListener('click',()=>{if(solved && completed<8)newTransaction();});
$('clearButton').addEventListener('click',clearTray);
$('hint-change').addEventListener('click',()=>{
  if(solved)return; usedHint=true;
  feedback('Count up from the cash total '+dollars(cashCents)+' to the amount paid '+dollars(paidCents)+'. Each bill or coin is one step. The amount you add is the change.');
});
$('restart-round').addEventListener('click',()=>{completed=0;independent=0;newTransaction();});
$('timed').addEventListener('change',refreshTimer);
document.querySelectorAll('.difficulty-btn').forEach(btn=>btn.addEventListener('click',()=>{
  if(btn.dataset.difficulty===difficulty)return;
  difficulty=btn.dataset.difficulty; completed=0; independent=0;
  document.querySelectorAll('.difficulty-btn').forEach(b=>{const active=b.dataset.difficulty===difficulty;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  newTransaction();
}));
document.addEventListener('visibilitychange',()=>{
  if(document.hidden && timerInterval){stopTimer();feedback('Timer paused while the page is hidden. Continue without time pressure.');}
});
// Bills descend in value; coins match the reference's loonie, toonie, quarter row.
const displayOrder=[100,50,20,10,5,1,2,.25,.1,.05];
moneyTill.replaceChildren(...displayOrder.map(value=>createMoney(moneyTypes.find(m=>m.value===value))));
newTransaction();
