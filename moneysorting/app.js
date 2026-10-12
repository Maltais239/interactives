'use strict';
// Canadian denominations in cents; real currency imagery is shared with Cashier Change Challenge.
const moneyTypes = [
  { cents:10000,label:'$100',type:'bill',image:'../makechange/assets/money-0.webp' },
  { cents:5000,label:'$50',type:'bill',image:'../makechange/assets/money-1.webp' },
  { cents:2000,label:'$20',type:'bill',image:'../makechange/assets/money-2.webp' },
  { cents:1000,label:'$10',type:'bill',image:'../makechange/assets/money-3.webp' },
  { cents:500,label:'$5',type:'bill',image:'../makechange/assets/money-4.webp' },
  { cents:200,label:'$2',type:'coin',image:'../makechange/assets/money-5.webp' },
  { cents:100,label:'$1',type:'coin',image:'../makechange/assets/money-6.webp' },
  { cents:25,label:'25¢',type:'coin',image:'../makechange/assets/money-7.webp' },
  { cents:10,label:'10¢',type:'coin',image:'../makechange/assets/money-8.webp' },
  { cents:5,label:'5¢',type:'coin',image:'../makechange/assets/money-9.webp' }
];
const $ = id => document.getElementById(id);
const till=$('moneyTill'), tray=$('changeGivenBox'), check=$('checkButton');
const next=$('nextButton'), newTargetButton=$('newTarget'), reset=$('resetButton'), hint=$('hintButton'), totalToggle=$('toggleTotal');
const dollars = cents => '$'+(cents/100).toFixed(2);
let difficulty='practice',targetCents=0,solved=false,tries=0;
let dragTouch=null,ignoreClickUntil=0,showTotal=false;
function setTotalVisibility(visible){
  showTotal=visible;
  $('currentTotal').hidden=!visible;
  $('totalPlaceholder').hidden=visible;
  totalToggle.textContent=visible?'Hide total':'Show total';
  totalToggle.setAttribute('aria-pressed',String(visible));
}

function feedback(message,type='info'){
  const el=$('feedback');el.textContent=message;el.dataset.type=type;
}
function total(){
  return Array.from(tray.querySelectorAll('.money-item')).reduce((n,item)=>n+Number(item.dataset.cents),0);
}
function refresh(){
  const amount=total();
  $('currentTotal').textContent=dollars(amount);
  tray.classList.toggle('empty',tray.children.length===0);
  check.disabled=solved||amount===0;
}
function moneyButton(money,inTray=false){
  const item=document.createElement('button');
  item.type='button';item.className='money-item '+money.type;
  item.dataset.value=money.cents/100;item.dataset.cents=money.cents;
  item.setAttribute('aria-label',(inTray?'Remove ':'Add ')+money.label);
  const img=document.createElement('img');img.className='money-image '+money.type;img.src=money.image;
  img.alt=money.label;img.draggable=false;
  img.addEventListener('error',()=>{item.textContent=money.label;item.classList.add('image-fallback');});
  item.append(img);
  item.addEventListener('click',()=>{
    if(solved||Date.now()<ignoreClickUntil)return;
    if(inTray)item.remove();else addMoney(money);
    refresh();feedback('');
  });
  if(!inTray){
    item.draggable=true;
    item.addEventListener('dragstart',e=>{
      if(solved){e.preventDefault();return;}
      e.dataTransfer.setData('text/plain',String(money.cents));
      e.dataTransfer.effectAllowed='copy';
    });
    item.addEventListener('dragend',()=>tray.classList.remove('drag-over'));
    item.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='touch'||solved||dragTouch)return;
      dragTouch={id:e.pointerId,money,item,x:e.clientX,y:e.clientY,ghost:null};
      item.setPointerCapture(e.pointerId);
    });
    item.addEventListener('pointermove',e=>{
      const t=dragTouch;
      if(!t||t.id!==e.pointerId)return;
      if(!t.ghost&&Math.hypot(e.clientX-t.x,e.clientY-t.y)>10){
        t.ghost=item.cloneNode(true);
        t.ghost.classList.add('ghost-image');
        t.ghost.style.width=item.offsetWidth+'px';
        t.ghost.setAttribute('aria-hidden','true');
        t.ghost.removeAttribute('tabindex');
        document.body.append(t.ghost);
      }
      if(t.ghost){
        t.ghost.style.left=(e.clientX-item.offsetWidth/2)+'px';
        t.ghost.style.top=(e.clientY-item.offsetHeight/2)+'px';
        const r=tray.getBoundingClientRect();
        tray.classList.toggle('drag-over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom);
      }
    });
    item.addEventListener('pointerup',e=>finishTouch(e,false));
    item.addEventListener('pointercancel',e=>finishTouch(e,true));
  }
  return item;
}
function finishTouch(e,cancelled){
  const t=dragTouch;
  if(!t||t.id!==e.pointerId)return;
  if(t.ghost){
    if(!cancelled&&tray.classList.contains('drag-over'))addMoney(t.money);
    t.ghost.remove();
    ignoreClickUntil=Date.now()+450;
  }
  dragTouch=null;tray.classList.remove('drag-over');
}
function addMoney(money){
  if(solved)return;
  tray.append(moneyButton(money,true));
  refresh();feedback('');
}
function newAmount(){
  const max=difficulty==='starter'?500:difficulty==='practice'?2595:10000;
  const min=difficulty==='starter'?5:100;
  let candidate=targetCents;
  // All targets must be representable using Canadian nickels, coins and bills.
  while(candidate===targetCents){
    candidate=(Math.floor(Math.random()*((max-min)/5+1))*5)+min;
  }
  targetCents=candidate;solved=false;tries=0;
  setTotalVisibility(false);
  tray.replaceChildren(); $('targetAmount').textContent=dollars(targetCents);
  $('round-status').textContent='Canadian money · Place value in action';
  next.disabled=true;hint.disabled=false;reset.disabled=false;
  refresh();feedback('');
}
function clearTray(){
  if(solved)return;
  tray.replaceChildren();refresh();feedback('');
}
function checkAnswer(){
  if(solved)return;
  tries++;
  const amount=total(),diff=targetCents-amount;
  if(diff===0){
    solved=true;
    feedback(tries===1?'Perfect! You made the amount! 🎉':'You got it! Nice counting! 🎉','success');
    next.disabled=false;hint.disabled=true;reset.disabled=true;
    $('round-status').textContent='Great work! Ready for another amount?';
  }else if(diff>0){
    feedback('Not quite! You need '+dollars(diff)+' more. Keep building.','error');
  }else{
    feedback('A little too much! Remove '+dollars(-diff)+' to match.','error');
  }
  refresh();
}
function giveHint(){
  if(solved)return;
  const diff=targetCents-total();
  if(diff<0){feedback('Try removing some money until your total matches the target.','info');return;}
  if(diff===0){feedback('Your total matches! Select Check amount.','info');return;}
  const possible=moneyTypes.find(m=>m.cents<=diff);
  feedback('Try adding '+(possible?possible.label:'a smaller coin')+'. Keep checking the total as you go.','info');
}
moneyTypes.forEach(m=>till.append(moneyButton(m)));
tray.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';tray.classList.add('drag-over');});
tray.addEventListener('dragleave',e=>{if(!tray.contains(e.relatedTarget))tray.classList.remove('drag-over');});
tray.addEventListener('drop',e=>{
  e.preventDefault();tray.classList.remove('drag-over');
  const cents=Number(e.dataTransfer.getData('text/plain'));
  const m=moneyTypes.find(x=>x.cents===cents);
  if(m&&!solved)addMoney(m);
});
document.querySelectorAll('[data-difficulty]').forEach(btn=>btn.addEventListener('click',()=>{
  difficulty=btn.dataset.difficulty;
  document.querySelectorAll('[data-difficulty]').forEach(b=>{
    b.classList.toggle('active',b===btn);
    b.setAttribute('aria-pressed',String(b===btn));
  });
  newAmount();
}));
totalToggle.addEventListener('click',()=>setTotalVisibility(!showTotal));
check.addEventListener('click',checkAnswer);
reset.addEventListener('click',clearTray);
hint.addEventListener('click',giveHint);
next.addEventListener('click',newAmount);
newTargetButton.addEventListener('click',newAmount);
newAmount();
