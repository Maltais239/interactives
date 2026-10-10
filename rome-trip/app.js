/* Buildless, browser-local companion. No account integrations or network AI calls. */
(() => {
  'use strict';
  const D=window.ROME, KEY='darren-rome-public-v1';
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const map=query=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
  const directions=destination=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(destination)+'&travelmode=walking';
  const link=(url,label,cls='button')=>`<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const validUrl=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
  const stopIds=new Set(D.days.flatMap(d=>d.stops.map(s=>s.id)));
  let storageAvailable=true,toastTimer,scenario='cafe',storyFilter='All',phraseHidden=false,practiceMode='reply';
  const choices={};
  let replyIndex=0,replyRevealed=false;
  function clean(raw){
    const out={version:1,day:D.days[0].date,done:{},notes:{},tickets:{}};
    if(!raw||typeof raw!=='object')return out;
    if(D.days.some(d=>d.date===raw.day))out.day=raw.day;
    for(const id of stopIds)if(raw.done?.[id]===true)out.done[id]=true;
    for(const d of D.days)if(typeof raw.notes?.[d.date]==='string')out.notes[d.date]=raw.notes[d.date].slice(0,6000);
    for(const t of D.tickets){const r=raw.tickets?.[t.id];if(r&&typeof r==='object'){const url=typeof r.url==='string'?r.url.slice(0,2000):'';const time=typeof r.time==='string'?r.time.slice(0,180):'';out.tickets[t.id]={url:validUrl(url)?url:'',time};}}
    return out;
  }
  let state;
  try{state=clean(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{state=clean(null);storageAvailable=false;}
  if(!localStorageHasDay()){
    const romeDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    if(D.days.some(d=>d.date===romeDate))state.day=romeDate;
  }
  function localStorageHasDay(){try{return !!JSON.parse(localStorage.getItem(KEY)||'null')?.day;}catch{return false;}}
  function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3800);}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageAvailable=true;return true;}catch{storageAvailable=false;toast('This browser cannot save locally. Export a backup to keep your changes.');return false;}}
  function setTab(){
    const tab=location.hash.slice(1).split('/')[0];const current=['days','italian','buildings','stories','tips'].includes(tab)?tab:'days';
    for(const name of ['days','italian','buildings','stories','tips'])$(name+'-view').hidden=name!==current;
    document.body.dataset.view=current;
    document.querySelectorAll('[data-tab]').forEach(a=>{if(a.dataset.tab===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(current==='stories')renderStories();
    if(current==='tips')renderTickets();
    if(current==='italian'){if(location.hash.split('/')[1]==='menus'&&!D.scenarios.find(s=>s.id===scenario)?.menu){scenario=D.scenarios.find(s=>s.menu).id;phraseHidden=false;replyIndex=0;replyRevealed=false;}renderPractice();}
  }
  function renderDay(){
    const day=D.days.find(d=>d.date===state.day)||D.days[0];
    $('week').innerHTML=D.days.map(d=>`<button data-day="${d.date}" aria-pressed="${d.date===state.day}" aria-label="Day ${d.num}"><span>${d.short}</span><span class="day-date">${d.num}</span></button>`).join('');
    $('day-intro').innerHTML=`<div class="day-title"><h2 id="day-heading">${esc(day.title)}</h2></div><p class="day-meta">${esc(day.subtitle)}</p>${day.warning?`<div class="notice"><strong>One thing to check</strong>${esc(day.warning)}</div>`:''}${day.note?`<p class="notice">${esc(day.note)}</p>`:''}`;
    $('stops').innerHTML=day.stops.map(s=>{
      const ticket=state.tickets[s.ticket],done=!!state.done[s.id];
      return `<article class="stop${done?' completed':''}" id="stop-${s.id}"><div class="stop-header"><span class="time">${esc(s.time)}</span><div class="stop-text">${s.badge?`<span class="status-tag">${esc(s.badge)}</span>`:''}<h3>${esc(s.title)}</h3><div class="location">${esc(s.location)}${s.duration?' · '+esc(s.duration):''}</div><p>${esc(s.text)}</p>${ticket?.time?`<p class="saved-time">Your reminder: ${esc(ticket.time)}</p>`:''}<div class="actions">${s.query?link(map(s.query),'Map ↗'):''}${s.query?link(directions(s.query),'Walk there ↗'):''}${s.story?`<button data-story="${s.story}">Story</button>`:''}${ticket?.url?link(ticket.url,'Open ticket ↗'):''}${s.ticket?`<button data-ticket="${s.ticket}">${ticket?.url?'Edit time / link':'Ticket & time'}</button>`:''}<button class="done-button" data-done="${s.id}" aria-pressed="${done}" aria-label="${done?'Mark not done:':'Mark done:'} ${esc(s.title)}">${done?'✓ Done':'Mark done'}</button></div></div></div></article>`;
    }).join('');
    $('day-note').value=state.notes[day.date]||'';
  }
  function renderStories(){
    const filters=['All','Rome','Naples','Florence'];
    $('story-filters').innerHTML=filters.map(f=>`<button data-filter="${f}" aria-pressed="${f===storyFilter}">${f}</button>`).join('');
    $('stories').innerHTML=D.stories.filter(s=>storyFilter==='All'||s.city===storyFilter).map(s=>`<article class="story-card" id="story-${s.id}"><span class="eyebrow">${esc(s.name)} · ${esc(s.era)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><div class="spot"><strong>WHEN YOU’RE THERE</strong>${esc(s.spot)}</div><div class="actions">${link(map(s.query),'Find this place ↗')}</div><div class="source-links" style="margin-top:18px">${s.sources.map(x=>link(x.url,x.label+' ↗','')).join('')}</div></article>`).join('');
  }
  function openStory(id){storyFilter='All';location.hash='stories';setTab();requestAnimationFrame(()=>{const el=$('story-'+id);if(el){el.setAttribute('tabindex','-1');el.scrollIntoView({behavior:'smooth',block:'start'});el.focus({preventScroll:true});}});}
  function fieldValue(s,f){const v=choices[s.id]?.[f.id];return f.options.find(o=>o[0]===v)||f.options[0];}
  function order(){
    const s=D.scenarios.find(s=>s.id===scenario),v={};s.fields.forEach(f=>v[f.id]=fieldValue(s,f));
    if(v.request)return {it:v.request[0],en:v.request[1]};
    if(s.id==='cafe')return {it:`Buongiorno. Vorrei ${v.drink[0]}${v.pastry[0]?' e '+v.pastry[0]:''}, per favore.`,en:`Good morning. I’d like ${v.drink[1]}${v.pastry[0]?' and '+v.pastry[1]:''}, please.`};
    if(s.id==='gelato')return {it:`Vorrei ${v.serve[0]} ${v.flavour[0]}, per favore.`,en:`I’d like ${v.serve[1]} of ${v.flavour[1]} gelato, please.`};
    if(s.id==='meal')return {it:`Vorrei ${v.food[0]} e ${v.water[0]}, per favore.`,en:`I’d like ${v.food[1]} and ${v.water[1]}, please.`};
    if(s.id==='train')return {it:`Scusi, da quale binario parte il treno per ${v.city[0]}?`,en:`Excuse me, which platform does the train to ${v.city[1]} leave from?`};
    return {it:`Scusi, dov’è ${v.place[0]}?`,en:`Excuse me, where is ${v.place[1]}?`};
  }
  function updatePhrase(){const p=order();$('order-italian').textContent=p.it;$('order-italian').hidden=phraseHidden;$('order-hidden').hidden=!phraseHidden;$('order-english').textContent=p.en;$('hide-italian').textContent=phraseHidden?'Show Italian':'Hide Italian & try';$('order-slow').dataset.say=p.it;$('order-normal').dataset.say=p.it;}
  function menuDetails(menu){
    return `<details class="venue-menu"><summary>Menu items & place info</summary><h4>${esc(menu.venue)}</h4><p class="small">${esc(menu.address)}</p><ul class="menu-items">${menu.items.map(([it,en])=>`<li><div><strong lang="it">${esc(it)}</strong><span>${esc(en)}</span></div><button data-say="${esc(it)}" data-rate="0.65" aria-label="Hear ${esc(it)} slowly">Hear</button></li>`).join('')}</ul><div class="actions">${link(menu.url,menu.sourceLabel+' ↗')}${link(map(menu.venue+' '+menu.address),'Map ↗')}</div><p class="small menu-source">Published menu checked ${esc(menu.checked)}. These are practice conversations using listed items; daily availability can change.</p></details>`;
  }
  function renderPractice(){
    const s=D.scenarios.find(s=>s.id===scenario);
    $('scenarios').innerHTML=`<label for="scenario-select"><span class="picker-label">Situation</span><select id="scenario-select">${[false,true].map(isMenu=>`<optgroup label="${isMenu?'Menus in Prati':'Everyday Italian'}">${D.scenarios.filter(x=>!!x.menu===isMenu).map(x=>`<option value="${x.id}"${x.id===scenario?' selected':''}>${esc(x.label)}</option>`).join('')}</optgroup>`).join('')}</select></label><div class="practice-modes scenario-tabs" aria-label="Speaking practice mode"><button data-practice-mode="reply" aria-pressed="${practiceMode==='reply'}">Try a reply</button><button data-practice-mode="builder" aria-pressed="${practiceMode==='builder'}">Build a phrase</button></div>`;
    $('practice').innerHTML=`<section id="phrase-builder"${practiceMode==='builder'?'':' hidden'}><h3>${esc(s.title)}</h3><p class="scenario-context">${esc(s.context)}</p><div class="order-builder">${s.fields.map(f=>`<label for="choice-${f.id}">${esc(f.label)}<select id="choice-${f.id}" data-field="${f.id}">${f.options.map(o=>`<option value="${esc(o[0])}"${fieldValue(s,f)[0]===o[0]?' selected':''}>${esc(o[1])}</option>`).join('')}</select></label>`).join('')}</div><div class="phrase-stage"><p id="order-italian" class="italian-text" lang="it"></p><p id="order-hidden" class="phrase-hidden" hidden>Your turn. Say it aloud.</p><p id="order-english" class="translation"></p></div><div class="actions"><button id="order-slow" data-say="" data-rate="0.65" class="primary">Listen slowly</button><button id="order-normal" data-say="" data-rate="0.95">Natural speed</button><button id="hide-italian">Hide Italian & try</button></div><p class="practice-cue">This is self-practice: listen and compare. The app doesn’t record or score your voice.</p></section><section id="reply-practice"${practiceMode==='reply'?'':' hidden'} class="reply-practice" aria-labelledby="reply-heading"><div class="reply-heading"><div><span class="eyebrow">YOUR TURN TO SPEAK</span><h4 id="reply-heading">${s.menu?esc(s.title):'Try a reply.'}</h4></div><span id="reply-position" class="small"></span></div><div id="reply-stage"></div></section>${s.menu?menuDetails(s.menu):''}<details class="conversation"><summary>${s.menu?'A conversation at the counter or table':'What you might hear next'}</summary>${s.dialogue.map(row=>`<div class="dialogue-row"><span class="dialogue-label">${esc(row.who.toUpperCase())}</span><div class="dialogue-italian" lang="it">${esc(row.it)}</div><div class="dialogue-translation">${esc(row.en)}</div><button data-say="${esc(row.it)}" data-rate="0.65">Hear this slowly</button></div>`).join('')}<p class="notice" style="margin-top:22px;margin-bottom:0">${esc(s.tip)}</p></details>`;
    updatePhrase();
    renderReply();
  }
  function renderReply(){
    const drills=D.scenarios.find(s=>s.id===scenario).drills,p=drills[replyIndex];
    $('reply-position').textContent=`${replyIndex+1} of ${drills.length}`;
    $('reply-stage').innerHTML=`<div class="reply-question"><span class="dialogue-label">YOU HEAR</span><p class="dialogue-italian" lang="it">${esc(p.question)}</p><p class="dialogue-translation">${esc(p.questionEn)}</p><button data-say="${esc(p.question)}" data-rate="0.65">Hear the prompt</button></div><div class="reply-cue"><span class="dialogue-label">SAY THIS IN ITALIAN</span><p>${esc(p.en)}</p></div>${replyRevealed?`<div class="reply-answer" id="reply-answer" tabindex="-1"><span class="dialogue-label">A POSSIBLE REPLY</span><p class="dialogue-italian" lang="it">${esc(p.it)}</p><div class="actions"><button data-say="${esc(p.it)}" data-rate="0.65">Hear reply slowly</button><button data-say="${esc(p.it)}" data-rate="0.95">Natural speed</button></div></div>`:'<p class="practice-cue">Try it aloud, then check a possible reply.</p>'}<div class="actions reply-actions"><button id="reply-reveal" class="primary" aria-expanded="${replyRevealed}">${replyRevealed?'Hide reply & try again':'Show a possible reply'}</button><button id="reply-next">${replyIndex===drills.length-1?'Start this set again ↻':'Next reply →'}</button></div>`;
  }
  let voice=null;
  function findVoice(){if(!('speechSynthesis' in window))return;voice=window.speechSynthesis.getVoices().find(v=>/^it[-_]/i.test(v.lang))||null;$('voice-note').textContent=voice?'Italian audio is ready on this device. Listen slowly first, then try natural speed.':'Audio needs an Italian voice on this device. If none is available, use the phrases as reading practice.';}
  function say(text,rate){
    if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){toast('Audio isn’t supported here. You can still read and practise the phrase.');return;}
    findVoice();if(!voice){toast('No Italian voice is available here. Try a browser or device with Italian text-to-speech.');return;}
    window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='it-IT';u.voice=voice;u.rate=Number(rate)||0.65;u.onstart=()=>toast(rate>0.8?'Speaking at natural speed…':'Speaking slowly…');u.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))toast('Audio couldn’t play. Try again or check your device’s Italian voice.');};window.speechSynthesis.speak(u);
  }
  function renderPhrasebook(){
    $('rescue-phrases').innerHTML=D.rescue.map(p=>`<div class="rescue-item"><p lang="it">${esc(p[0])}</p><div class="translation">${esc(p[1])}</div><button data-say="${esc(p[0])}" data-rate="0.65">Listen slowly</button></div>`).join('');
    $('phrasebook').innerHTML='<div class="phrasebook-grid">'+D.phrases.map(p=>`<div class="pocket-phrase"><div><p lang="it">${esc(p[0])}</p><span>${esc(p[1])}</span></div><button data-say="${esc(p[0])}" data-rate="0.65">Listen</button></div>`).join('')+'</div>';
  }
  function renderTickets(){
    $('ticket-list').innerHTML=D.tickets.map(t=>{const saved=state.tickets[t.id];return `<div class="ticket-row"><div><strong>${esc(t.title)}</strong><p>${esc(saved?.time||t.status)}</p></div><div class="actions">${saved?.url?link(saved.url,'Open ticket ↗'):''}<button data-ticket="${t.id}">${saved?.url||saved?.time?'Edit':'Add link / time'}</button></div></div>`;}).join('');
  }
  function openTicket(id){
    const t=D.tickets.find(x=>x.id===id);if(!t)return;
    const saved=state.tickets[id]||{};$('ticket-id').value=id;$('ticket-heading').textContent=t.title;$('ticket-url').value=saved.url||'';$('ticket-time').value=saved.time||'';$('official-ticket').hidden=!t.official;if(t.official)$('official-ticket').href=t.official;
    const dialog=$('ticket-dialog');if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');$('ticket-url').focus();}
  }
  function closeTicket(){const d=$('ticket-dialog');if(typeof d.close==='function')d.close();else d.removeAttribute('open');}
  function renderNearby(){
    const nearby=[['Find groceries','supermarket near Rome city centre'],['Find a café','cafe near Rome city centre'],['Find a pharmacy','pharmacy near Rome city centre'],['Ottaviano metro station','Ottaviano metro station Roma'],['Museums entrance','Vatican Museums entrance Viale Vaticano']];
    $('nearby-links').innerHTML=nearby.map(x=>link(map(x[1]),x[0]+' ↗')).join('');$('base-map').href=map(D.base);
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.day){state.notes[state.day]=$('day-note').value;state.day=b.dataset.day;persist();renderDay();return;}
    if(b.dataset.done){state.notes[state.day]=$('day-note').value;state.done[b.dataset.done]=!state.done[b.dataset.done];persist();renderDay();return;}
    if(b.dataset.story){openStory(b.dataset.story);return;}
    if(b.dataset.ticket){openTicket(b.dataset.ticket);return;}
    if(b.dataset.scenario){scenario=b.dataset.scenario;phraseHidden=false;replyIndex=0;replyRevealed=false;renderPractice();return;}
    if(b.dataset.pratiMenus){scenario=D.scenarios.find(s=>s.menu).id;practiceMode='reply';phraseHidden=false;replyIndex=0;replyRevealed=false;renderPractice();$('scenario-select').focus({preventScroll:true});return;}
    if(b.dataset.practiceMode){practiceMode=b.dataset.practiceMode;$('phrase-builder').hidden=practiceMode!=='builder';$('reply-practice').hidden=practiceMode!=='reply';$('scenarios').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.practiceMode===practiceMode)));return;}
    if(b.dataset.filter){storyFilter=b.dataset.filter;renderStories();return;}
    if(b.hasAttribute('data-say')){say(b.dataset.say,b.dataset.rate);return;}
    if(b.id==='hide-italian'){phraseHidden=!phraseHidden;updatePhrase();return;}
    if(b.id==='reply-reveal'){replyRevealed=!replyRevealed;renderReply();$(replyRevealed?'reply-answer':'reply-reveal').focus({preventScroll:true});return;}
    if(b.id==='reply-next'){const drills=D.scenarios.find(s=>s.id===scenario).drills;replyIndex=(replyIndex+1)%drills.length;replyRevealed=false;renderReply();$('reply-reveal').focus({preventScroll:true});return;}
  });
  $('scenarios').addEventListener('change',e=>{if(e.target.id!=='scenario-select'||!D.scenarios.some(s=>s.id===e.target.value))return;scenario=e.target.value;phraseHidden=false;replyIndex=0;replyRevealed=false;renderPractice();$('scenario-select').focus({preventScroll:true});});
  $('practice').addEventListener('change',e=>{if(e.target.dataset.field){choices[scenario]??={};choices[scenario][e.target.dataset.field]=e.target.value;phraseHidden=false;updatePhrase();}});
  $('save-day-note').addEventListener('click',()=>{state.notes[state.day]=$('day-note').value.slice(0,6000);if(persist())toast('Day note saved on this device.');});
  $('day-note').addEventListener('change',()=>{state.notes[state.day]=$('day-note').value.slice(0,6000);persist();});
  $('ticket-form').addEventListener('submit',e=>{e.preventDefault();const url=$('ticket-url').value.trim();if(url&&!validUrl(url)){toast('Use a full http or https link.');return;}const id=$('ticket-id').value;if(!D.tickets.some(t=>t.id===id))return;state.tickets[id]={url,time:$('ticket-time').value.trim().slice(0,180)};const saved=persist();closeTicket();renderTickets();renderDay();if(saved)toast('Ticket details saved on this device.');});
  $('close-dialog').addEventListener('click',closeTicket);
  $('export-backup').addEventListener('click',()=>{state.notes[state.day]=$('day-note').value.slice(0,6000);const blob=new Blob([JSON.stringify({app:'darren-rome',exported:new Date().toISOString(),...state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='darrens-rome-notes-and-links.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exported. Import it on your other device.');});
  $('import-backup').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2000000)throw new Error('size');const raw=JSON.parse(await file.text());if(raw.app!=='darren-rome'||raw.version!==1)throw new Error('format');state=clean(raw);const saved=persist();renderDay();renderTickets();if(saved)toast('Backup imported on this device.');}catch{toast('That isn’t a valid Rome backup. No changes were imported.');}e.target.value='';});
  window.addEventListener('hashchange',setTab);
  if('speechSynthesis' in window){window.speechSynthesis.addEventListener('voiceschanged',findVoice);findVoice();}
  renderDay();renderPhrasebook();renderNearby();renderStories();renderPractice();renderTickets();setTab();
  if(!storageAvailable)setTimeout(()=>toast('Local saving may be unavailable. Use Export to keep a backup.'),500);
  const OFFLINE_CACHE='darrens-rome-public-menus5';
  function offlineStatus(status){
    const ready=status==='ready',pending=status==='saving';
    $('offline-badge').textContent=ready?'Ready offline':pending?'Saving offline…':'Online only';
    $('offline-badge').dataset.ready=String(ready);
    $('offline-status').textContent=ready?'Text, menu practice, and all landmark photos are saved for offline reopening in this browser. Before your flight, test Italian audio in airplane mode; it needs a downloaded Italian voice. Maps and ticket websites need internet.':pending?'Saving text and all landmark photos. Keep this page open online until the badge says “Ready offline”.':'Offline saving is not available yet. Reopen online to try again. Maps and ticket websites need internet.';
  }
  async function checkOffline(){
    if(!('caches' in window))return false;
    // addAll commits the complete offline set together; also check this build's scripts.
    const names=await caches.keys();if(!names.includes(OFFLINE_CACHE))return false;
    const cache=await caches.open(OFFLINE_CACHE);
    const saved=await Promise.all(['./index.html','./styles.css?v=menus5','./app.js?v=menus5','./buildings.js?v=menus5','./menu-data.js?v=menus5'].map(url=>cache.match(url)));
    if(saved.every(Boolean)){offlineStatus('ready');return true;}return false;
  }
  async function prepareOffline(){
    if(!('serviceWorker' in navigator)||!('caches' in window)){offlineStatus('unavailable');return;}
    offlineStatus('saving');
    try{
      const registration=await navigator.serviceWorker.register('./sw.js');
      const watch=worker=>{if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='activated')checkOffline().catch(()=>offlineStatus('unavailable'));else if(worker.state==='redundant')offlineStatus('unavailable');});};
      watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));
      navigator.serviceWorker.addEventListener('controllerchange',()=>checkOffline().catch(()=>offlineStatus('unavailable')));
      await navigator.serviceWorker.ready;
      await checkOffline();
      // Detect a stalled or failed download without claiming an older cache is ready.
      setTimeout(()=>checkOffline().then(ready=>{if(!ready)offlineStatus('unavailable');}).catch(()=>offlineStatus('unavailable')),90000);
    }catch{offlineStatus('unavailable');}
  }
  prepareOffline();
})();
