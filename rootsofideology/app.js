(function () {
  'use strict';
  const D = window.ROOTS_DATA;
  const IMAGES = {community:'assets/community.webp',school:'assets/school.webp',market:'assets/market.webp'};
  const STORAGE = 'roots-of-ideology-v2';
  const views = ['home','learn','decide','sort','write'];
  const lanes = {individual:'Individualism',shared:'Collectivism',both:'A combination'};
  const root = document.getElementById('workspace');
  const nav = document.getElementById('navigation');
  let noticeTimer, storageWorks = true;
  const text = value => typeof value === 'string' ? value.slice(0,3000) : '';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const valueName = id => D.values.find(v => v.id === id)?.name || '';
  function clean(input) {
    const a = input && typeof input === 'object' ? input : {};
    const s = {view:views.includes(a.view)?a.view:'home',learnTab:['lenses','values','history'].includes(a.learnTab)?a.learnTab:'lenses',caseIndex:Number.isInteger(a.caseIndex)?Math.max(0,Math.min(D.cases.length,a.caseIndex)):0,sortIndex:Number.isInteger(a.sortIndex)?Math.max(0,Math.min(D.sort.length-1,a.sortIndex)):0,writeCase:D.cases.some(c=>c.id===a.writeCase)?a.writeCase:D.cases[0].id,answers:{},placements:{},attempts:{},drafts:{},sourceNotes:{},expanded:[]};
    D.cases.forEach(c => {
      const x = a.answers?.[c.id] || {};
      s.answers[c.id] = {choice:Number.isInteger(x.choice)&&x.choice>=0&&x.choice<c.options.length?x.choice:null,reason:text(x.reason),concern:text(x.concern)};
      const w = a.drafts?.[c.id] || {};
      s.drafts[c.id] = {claim:text(w.claim),evidence:text(w.evidence),challenge:text(w.challenge),response:text(w.response),values:Array.isArray(w.values)?[...new Set(w.values.filter(id=>D.values.some(v=>v.id===id)))].slice(0,3):[]};
    });
    D.sort.forEach(c => {
      if(a.placements?.[c.id]===c.lane)s.placements[c.id]=c.lane;
      s.attempts[c.id]=Number.isInteger(a.attempts?.[c.id])?Math.max(0,Math.min(99,a.attempts[c.id])):0;
    });
    D.sources.forEach(c=>s.sourceNotes[c.id]=text(a.sourceNotes?.[c.id]));
    s.expanded=Array.isArray(a.expanded)?a.expanded.filter(id=>D.values.some(v=>v.id===id)):[];
    return s;
  }
  let state;
  try {state=clean(JSON.parse(localStorage.getItem(STORAGE)));} catch {state=clean();}
  let sortRetry = '';
  const image = (key, cls='', alt='') => `<img class="${cls}" src="${IMAGES[key]}" alt="${esc(alt)}" width="1008" height="672" decoding="async">`;
  function notify(message) {
    const node=document.getElementById('notice');node.textContent=message;node.classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>node.classList.remove('visible'),4500);
  }
  function save() {
    try {localStorage.setItem(STORAGE,JSON.stringify(state));storageWorks=true;} catch {storageWorks=false;}
    document.getElementById('save-status').textContent=storageWorks?'Progress saved in this browser':'Use Save project to keep your work';
  }
  function answeredCount(){return D.cases.filter(c=>state.answers[c.id].choice!==null).length;}
  function sortedCount(){return Object.keys(state.placements).length;}
  function changeView(view) {
    if(!views.includes(view))return;
    stopReading();state.view=view;save();render();root.focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:'instant'});
  }
  function render() {
    const names={home:'Start',learn:'Learn',decide:'Decide',sort:'Sort',write:'Write'};
    nav.innerHTML=views.map((v,i)=>`<button class="nav-button" data-view="${v}" ${state.view===v?'aria-current="page"':''}><span aria-hidden="true">${i===0?'↗':i}</span>${names[v]}</button>`).join('');
    const renders={home:renderHome,learn:renderLearn,decide:renderDecide,sort:renderSort,write:renderWrite};
    root.innerHTML=renders[state.view]();
  }
  function renderHome() {
    const routes=[
      {view:'learn',image:'community',title:'See the two lenses',desc:'Explore the values behind individual choice and shared responsibility.',next:'Learn the ideas'},
      {view:'decide',image:'market',title:'Make the call',desc:'Six decisions. Three possible policies. What would you choose—and why?',next:answeredCount()?`Continue · ${answeredCount()} of 6 chosen`:'Try a scenario'},
      {view:'sort',image:'school',title:'Spot the value',desc:'Sort twelve everyday examples. Some bring both lenses together.',next:sortedCount()?`Continue · ${sortedCount()} of 12 sorted`:'Play the sorting game'},
      {view:'write',image:'community',title:'Build your case',desc:'Turn a choice into a reasoned argument with evidence and a counterargument.',next:'Create an argument'}
    ];
    return `<section class="hero"><div><span class="eyebrow">Roots of Ideology</span><h1>Your choice.<br><em>Our community.</em></h1><p>Who gets to decide? Who shares the responsibility? Explore <strong>individualism and collectivism</strong> through decisions that matter.</p><div class="actions"><button class="primary" data-view="decide">Make a decision <span aria-hidden="true">→</span></button><button class="secondary" data-view="learn">Learn the ideas</button></div><p class="home-note">Start anywhere. Your choices and writing stay with you.</p></div><div class="hero-image">${image('community','','Illustration of a neighbourhood garden, public bus, independent shop and residents.')}<span class="hero-caption">One community. Different priorities.</span></div></section><section aria-labelledby="route-title"><div class="section-line"><h2 id="route-title">Ideas become clearer when you use them.</h2><p>Four ways to explore</p></div><div class="route-grid">${routes.map((r,i)=>`<button class="route-card" data-view="${r.view}">${image(r.image)}<span class="route-body"><span class="step-tag">0${i+1} · ${r.view}</span><h3>${r.title}</h3><p>${r.desc}</p><span class="route-next">${r.next} <span aria-hidden="true">→</span></span></span></button>`).join('')}</div></section>`;
  }
  function renderLearn() {
    const tabs={lenses:'The two lenses',values:'Explore 12 values',history:'Read a historical source'};
    let content;
    if(state.learnTab==='lenses')content=`<div class="lens-grid"><article class="paper-panel lens"><span class="eyebrow">Lens 01 · Individualism</span><h3>The individual matters.</h3><p class="lens-question">What can a person choose, own and do?</p><p>Individualism emphasizes individual rights, personal choice and responsibility. People can pursue their own goals and make decisions about their lives.</p><ul><li>Protect rights and freedoms.</li><li>Allow personal and economic choices.</li><li>Recognize initiative and self-reliance.</li></ul><button class="secondary" data-learn="values">Explore the values</button></article><article class="paper-panel lens shared"><span class="eyebrow">Lens 02 · Collectivism</span><h3>The community matters.</h3><p class="lens-question">What can people share and achieve together?</p><p>Collectivism emphasizes common interests, cooperation and shared responsibility. People can pool resources and make decisions for a group’s well-being.</p><ul><li>Work toward common goals.</li><li>Share resources and responsibilities.</li><li>Consider unequal access to basic needs.</li></ul><button class="secondary" data-learn="values">Explore the values</button></article></div><aside class="connection"><strong>Real communities use both.</strong><p>A public library is a shared service that helps individuals choose what to read. Ask which values a policy emphasizes, how it affects people and what tradeoffs it creates.</p></aside>`;
    else if(state.learnTab==='values')content=`<p class="muted">Select a value to reveal an everyday example. These are lenses for analyzing actions; they do not define a person.</p><div class="value-grid">${D.values.map(v=>`<button class="value-card ${v.lane}" data-value="${v.id}" aria-expanded="${state.expanded.includes(v.id)}"><span class="step-tag">${lanes[v.lane]}</span><h3>${esc(v.name)}</h3><p>${esc(v.text)}</p>${state.expanded.includes(v.id)?`<p class="example"><strong>In everyday life:</strong> ${esc(v.example)}</p>`:'<small>Reveal an example +</small>'}</button>`).join('')}</div>`;
    else content=`<p class="muted">Read a short excerpt, connect it to a value, and ask a question. The explanations below are interpretations of the sources.</p><div class="source-grid">${D.sources.map(s=>`<article class="source paper-panel"><div><span class="step-tag">${s.date} · Primary-source excerpt</span><h3>${esc(s.name)}</h3><p class="source-meta"><em>${esc(s.title)}</em><br>${esc(s.location)}</p><blockquote>“${esc(s.quote)}”</blockquote><p>${esc(s.explain)}</p><a href="${s.url}" target="_blank" rel="noopener">Read the full source ↗</a></div><div><label class="field" for="source-${s.id}">${esc(s.question)}</label><textarea id="source-${s.id}" data-source="${s.id}" maxlength="3000" placeholder="Connect the excerpt to a value, then explain your thinking.">${esc(state.sourceNotes[s.id])}</textarea></div></article>`).join('')}</div>`;
    return `<div class="intro"><span class="eyebrow">01 · Learn</span><h1>Two lenses. A wider view.</h1><p>An <strong>ideology</strong> is a set of ideas about how society should be organized. These two lenses help us explore the values behind those ideas.</p></div><div class="subnav">${Object.entries(tabs).map(([key,title])=>`<button class="pill" data-learn="${key}" aria-pressed="${state.learnTab===key}">${title}</button>`).join('')}</div>${content}<div class="page-actions"><span class="muted">Try using the ideas in a real decision.</span><button class="primary" data-view="decide">Make the call →</button></div>`;
  }
  function renderDecide() {
    if(state.caseIndex===D.cases.length)return renderSummary();
    const c=D.cases[state.caseIndex],a=state.answers[c.id],o=c.options[a.choice];
    return `<div class="intro"><span class="eyebrow">02 · Decide · ${answeredCount()} of 6 policies chosen</span><h1>Make the call.</h1><p>Choose a policy, explore its tradeoff, and explain what matters to you. You can revise any choice.</p></div><nav class="case-tabs" aria-label="Choose a scenario">${D.cases.map((c,i)=>`<button class="case-tab ${state.answers[c.id].choice!==null?'answered':''}" data-case="${i}" aria-pressed="${i===state.caseIndex}">${i+1}. ${esc(c.title)}</button>`).join('')}</nav><section aria-labelledby="case-title"><div class="case-overview">${image(c.image,'','Illustration of the modern community setting for this fictional scenario.')}<div><span class="step-tag">Scenario ${state.caseIndex+1} · ${c.tag}</span><h2 id="case-title">${esc(c.title)}</h2><p>${esc(c.context)}</p><p class="case-question">${esc(c.question)}</p></div></div><div class="options">${c.options.map((p,i)=>`<button class="option" data-choice="${i}" aria-pressed="${a.choice===i}" aria-label="Option ${'ABC'[i]}: ${esc(p.title)}"><span class="option-letter" aria-hidden="true">${'ABC'[i]}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><small>${a.choice===i?'Your current choice ✓':'Choose this policy →'}</small></button>`).join('')}</div>${o?`<div class="decision-feedback" aria-label="Your policy analysis"><span class="step-tag">What your choice emphasizes</span><h3>${lanes[o.lane]}</h3><div>${o.values.map(v=>`<span class="badge">${esc(valueName(v))}</span>`).join('')}</div><div class="feedback-grid"><div><h4>A possible benefit</h4><p>${esc(o.benefit)}</p></div><div><h4>A tradeoff to consider</h4><p>${esc(o.tradeoff)}</p></div></div><p><strong>Think further:</strong> ${esc(o.question)}</p><div class="reason-grid"><div><label class="field" for="reason">Why do you support this policy?<span>Name a value and explain why it matters in this situation.</span></label><textarea id="reason" data-answer="reason" maxlength="3000" placeholder="I support this policy because…">${esc(a.reason)}</textarea></div><div><label class="field" for="concern">Who could disagree, and why?<span>Consider someone whose needs might be different.</span></label><textarea id="concern" data-answer="concern" maxlength="3000" placeholder="Someone might be concerned that…">${esc(a.concern)}</textarea></div></div></div>`:'<p class="connection"><strong>Choose A, B or C.</strong>Then see the values, a possible benefit and a tradeoff. There is no single correct policy.</p>'}</section><div class="page-actions"><button class="secondary" data-action="previous-case" ${state.caseIndex===0?'disabled':''}>← Previous</button><div class="actions"><button class="secondary" data-action="summary">See my choices</button><button class="primary" data-action="next-case" ${!o?'disabled':''}>${state.caseIndex===D.cases.length-1?'Review my choices':'Next scenario'} →</button></div></div>`;
  }
  function renderSummary() {
    const counts={individual:0,shared:0,both:0};D.cases.forEach(c=>{const n=state.answers[c.id].choice;if(n!==null)counts[c.options[n].lane]++;});
    return `<div class="intro"><span class="eyebrow">02 · Your decisions</span><h1>Different situations.<br>Different priorities.</h1><p>You chose ${answeredCount()} of 6 policies. This summary describes those choices. Your reasons and the context matter.</p></div><div class="summary-band">${Object.entries(counts).map(([k,v])=>`<div><strong>${v}</strong><span>${k==='both'?'Combined approaches':k==='individual'?'Individual choice emphasized':'Shared responsibility emphasized'}</span></div>`).join('')}</div><div class="summary-list">${D.cases.map((c,i)=>{const a=state.answers[c.id],o=c.options[a.choice];return `<article class="summary-card"><span class="step-tag">${i+1}. ${c.tag}</span><h3>${esc(c.title)}</h3><p><strong>${o?esc(o.title):'No choice yet'}</strong></p>${a.reason?`<p>${esc(a.reason)}</p>`:''}<div class="actions"><button class="quiet" data-case="${i}">${o?'Revisit':'Choose a policy'}</button>${o?`<button class="quiet" data-write-case="${c.id}">Build an argument →</button>`:''}</div></article>`;}).join('')}</div><div class="page-actions"><button class="secondary" data-view="sort">Spot the value →</button><button class="primary" data-view="write">Build your case →</button></div>`;
  }
  function renderSort() {
    const count=sortedCount(),s=D.sort[state.sortIndex],accepted=!!state.placements[s.id];
    const review=`<details class="sort-review paper-panel"><summary>Review ${count} sorted examples</summary><ol>${D.sort.filter(c=>state.placements[c.id]).map(c=>`<li><strong>${esc(c.value)}</strong><br>${esc(c.text)}<br><span class="muted">${esc(c.why)}</span></li>`).join('')}</ol></details>`;
    if(count===D.sort.length)return `<div class="intro"><span class="eyebrow">03 · Sort complete</span><h1>You spotted the values.</h1><p>All twelve examples are sorted. The last two combine individual choices with shared resources or action.</p></div><div class="paper-panel"><h3>Take the idea further</h3><p>Find a new example in your school or community. Which values are involved? What detail would change your classification?</p><div class="actions" style="margin-top:20px"><button class="primary" data-view="write">Build your case →</button><button class="secondary" data-action="restart-sort">Play again</button></div></div>${review}`;
    return `<div class="intro"><span class="eyebrow">03 · Sort</span><h1>Spot the value.</h1><p>Classify the main idea in each example. Click a category, use keys 1–3, or drag the card to a category.</p></div><div class="sort-top"><strong>${count} of 12 sorted</strong><progress value="${count}" max="12" aria-label="Sorting progress"></progress></div><article class="sort-card" draggable="${!accepted}" data-sort-card="${s.id}" tabindex="0" aria-label="Example ${state.sortIndex+1}: ${esc(s.text)}">${image(s.image)}<div><span class="step-tag">Example ${state.sortIndex+1} of 12</span><p>${esc(s.text)}</p></div></article><div class="bins">${Object.entries(lanes).map(([key,title],i)=>`<button class="bin" data-bin="${key}" ${accepted?'disabled':''}><strong>${i+1}. ${title}</strong><small>${key==='individual'?'Personal choice, ownership or initiative':key==='shared'?'Common goals, resources or responsibility':'Both lenses are clearly present'}</small></button>`).join('')}</div>${accepted?`<div class="sort-feedback" role="status"><strong>Yes · ${esc(s.value)}</strong><p>${esc(s.why)}</p></div><div class="page-actions"><button class="primary" data-action="next-sort">Next example →</button></div>`:sortRetry?`<div class="sort-feedback retry" role="status"><strong>Look at the main action again.</strong><p>${esc(sortRetry)}</p></div>`:''}${count?review:''}`;
  }
  function paragraph(w) {
    const pieces=[];if(w.claim.trim())pieces.push(w.claim.trim());if(w.values.length)pieces.push('This prioritizes '+w.values.map(valueName).join(' and ').toLowerCase()+'.');if(w.evidence.trim())pieces.push('For example, '+w.evidence.trim());if(w.challenge.trim())pieces.push('A possible concern is '+w.challenge.trim());if(w.response.trim())pieces.push('I would respond by '+w.response.trim());return pieces.join('\n\n');
  }
  function checks(w){return [['A clear policy claim',!!w.claim.trim()],['At least one named value',w.values.length>0],['A specific example or piece of evidence',!!w.evidence.trim()],['A fair counterargument',!!w.challenge.trim()],['A response to that concern',!!w.response.trim()]];}
  function preview(w){return `<h3>Your argument</h3><p class="muted">Use this draft as a starting point. Read it aloud and edit for clarity.</p><div class="draft">${esc(paragraph(w))||'<span class="muted">Your ideas will appear here as you write.</span>'}</div><ul class="checklist">${checks(w).map(([t,done])=>`<li class="${done?'done':''}">${done?'✓ ':''}${t}</li>`).join('')}</ul><div class="actions"><button class="primary" data-action="copy">Copy argument</button><button class="secondary" data-action="print">Print my work</button></div>`;}
  function renderWrite() {
    const c=D.cases.find(c=>c.id===state.writeCase),w=state.drafts[c.id],choice=state.answers[c.id].choice,o=c.options[choice];
    return `<div class="intro"><span class="eyebrow">04 · Write</span><h1>Build your case.</h1><p>Choose a scenario and defend a policy. Use a value, a specific example, and a fair response to someone who disagrees.</p></div><div class="write-layout"><section class="paper-panel write-form"><label class="field" for="write-case">Your scenario</label><select id="write-case" data-write-select>${D.cases.map(c=>`<option value="${c.id}" ${c.id===state.writeCase?'selected':''}>${esc(c.title)}</option>`).join('')}</select><p class="muted" style="margin-top:14px;font-size:.9rem">${esc(c.context)}</p>${o?`<p style="margin-top:12px;font-size:.9rem"><strong>Your choice:</strong> ${esc(o.title)}</p><button class="quiet" data-action="use-choice">Use my saved choice and reason</button>`:`<button class="quiet" data-case="${D.cases.indexOf(c)}">Compare the policies first →</button>`}<label class="field" for="claim">1. Make a claim<span>Which policy should be used? Be specific.</span></label><textarea id="claim" data-draft="claim" maxlength="3000" placeholder="I think the community should…">${esc(w.claim)}</textarea><span class="field">2. Connect a value<span>Select up to three values you can explain.</span></span><div class="chip-row">${D.values.map(v=>`<button class="chip" data-write-value="${v.id}" aria-pressed="${w.values.includes(v.id)}">${esc(v.name)}</button>`).join('')}</div><label class="field" for="evidence">3. Use a specific example<span>Choose a scenario detail below, or write your own evidence.</span></label>${c.evidence.map((e,i)=>`<button class="evidence-button" data-evidence="${i}">+ ${esc(e)}</button>`).join('')}<textarea id="evidence" data-draft="evidence" maxlength="3000" placeholder="This matters here because…">${esc(w.evidence)}</textarea><label class="field" for="challenge">4. Consider a different view<span>Who might disagree? What is their strongest concern?</span></label><textarea id="challenge" data-draft="challenge" maxlength="3000" placeholder="Someone might argue that…">${esc(w.challenge)}</textarea><label class="field" for="response">5. Respond thoughtfully<span>Address the concern, adjust your plan, or explain the tradeoff you accept.</span></label><textarea id="response" data-draft="response" maxlength="3000" placeholder="addressing this concern by…">${esc(w.response)}</textarea></section><aside class="paper-panel write-preview" id="argument-preview">${preview(w)}</aside></div>`;
  }
  function updatePreview(){document.getElementById('argument-preview').innerHTML=preview(state.drafts[state.writeCase]);}
  function classify(lane) {
    if(state.view!=='sort'||!Object.hasOwn(lanes,lane)||sortedCount()===D.sort.length)return;
    const c=D.sort[state.sortIndex];if(state.placements[c.id])return;
    state.attempts[c.id]=(state.attempts[c.id]||0)+1;
    if(lane===c.lane){state.placements[c.id]=lane;sortRetry='';notify('Yes. '+c.value+'.');}
    else {sortRetry=c.lane==='both'?'This example includes a personal choice or independent activity AND a shared service or cooperative action.':c.lane==='individual'?'Look for a personal right, goal, ownership decision or independent initiative.':'Look for shared ownership, resources, expectations or a common goal.';notify('Try again. Look for the main action in the example.');}
    save();render();if(state.placements[c.id])root.querySelector('[data-action="next-sort"]')?.focus({preventScroll:true});
  }
  function download(name,content,type) {
    const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  async function copyArgument() {
    const p=paragraph(state.drafts[state.writeCase]);if(!p){notify('Add a claim or an idea first.');return;}
    try {await navigator.clipboard.writeText(p);notify('Argument copied.');} catch {
      const t=document.createElement('textarea');t.value=p;t.style.position='fixed';t.style.top='-1000px';document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();notify(ok?'Argument copied.':'Copy is unavailable here. Use Print my work to keep your argument.');
    }
  }
  function preparePrint() {
    const cases=D.cases.filter(c=>state.answers[c.id].choice!==null);
    document.getElementById('print-area').innerHTML=`<h1>Roots of Ideology</h1><p>Individualism, collectivism and decisions in a community</p><h2>My policy choices</h2>${cases.length?cases.map(c=>{const a=state.answers[c.id],o=c.options[a.choice];return `<section><h3>${esc(c.title)}</h3><p><strong>Policy:</strong> ${esc(o.title)}<br><strong>Values:</strong> ${o.values.map(valueName).map(esc).join(', ')}</p>${a.reason?`<p><strong>My reason:</strong> ${esc(a.reason)}</p>`:''}${a.concern?`<p><strong>Another perspective:</strong> ${esc(a.concern)}</p>`:''}</section>`;}).join(''):'<p>No policies chosen yet.</p>'}<h2>My arguments</h2>${D.cases.filter(c=>paragraph(state.drafts[c.id])).map(c=>`<section><h3>${esc(c.title)}</h3><p>${esc(paragraph(state.drafts[c.id]))}</p></section>`).join('')||'<p>No argument drafted yet.</p>'}<h2>Historical-source reflections</h2>${D.sources.filter(s=>state.sourceNotes[s.id]).map(s=>`<section><h3>${esc(s.name)} · ${esc(s.title)}</h3><p>${esc(state.sourceNotes[s.id])}</p></section>`).join('')||'<p>No source reflections recorded yet.</p>'}<h2>Sorting</h2><p>${sortedCount()} of ${D.sort.length} examples sorted.</p>`;
  }
  function stopReading(){if('speechSynthesis' in window)window.speechSynthesis.cancel();}
  function readView() {
    if(!('speechSynthesis' in window)){notify('Read aloud is unavailable in this browser.');return;}
    stopReading();const content=Array.from(root.querySelectorAll('h1,h2,h3,h4,p,blockquote,label')).map(e=>e.innerText).join('. ');
    const chunks=content.match(/[^.!?]+[.!?]*/g)||[content];
    const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang==='en-CA')||voices.find(v=>v.lang==='en-US')||voices.find(v=>v.lang.startsWith('en'));
    chunks.forEach(chunk=>{const u=new SpeechSynthesisUtterance(chunk);u.lang=voice?.lang||'en-CA';if(voice)u.voice=voice;u.rate=.95;speechSynthesis.speak(u);});notify('Reading this view. Use Stop reading to stop.');
  }
  async function exportHTML(button) {
    button.disabled=true;notify('Preparing your HTML with the illustrations…');
    try {
      const read=async p=>{const r=await fetch(p,{cache:'no-cache'});if(!r.ok)throw Error(p);return r.text();};
      const [html,css,data,app]=await Promise.all(['index.html','styles.css','data.js','app.js'].map(read));
      const uris={};await Promise.all(Object.entries(IMAGES).map(async([key,path])=>{const r=await fetch(path);if(!r.ok)throw Error(path);const blob=await r.blob();uris[path]=await new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result);f.onerror=reject;f.readAsDataURL(blob);});}));
      let code=app;Object.entries(uris).forEach(([path,uri])=>{code=code.split(path).join(uri);});
      const inline=s=>s.replace(/<\/script/gi,'<\\/script');
      const output=html.replace(/<link rel="stylesheet" href="styles.css[^\"]*">/,()=>'<style>'+css+'</style>').replace(/<script src="data.js[^\"]*"><\/script>/,()=>'<script>'+inline(data)+'</script>').replace(/<script src="app.js[^\"]*"><\/script>/,()=>'<script>'+inline(code)+'</script>').replace(/<button class="quiet" data-action="own">Make it my own<\/button>/,'');
      download('Roots-of-Ideology.html',output,'text/html');notify('Your complete HTML is ready.');
    } catch {notify('The download could not be prepared. Check your connection and try again.');} finally {button.disabled=false;}
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.view){changeView(b.dataset.view);return;}
    if(b.dataset.learn){state.learnTab=b.dataset.learn;save();render();root.querySelector(`[data-learn="${state.learnTab}"]`)?.focus({preventScroll:true});return;}
    if(b.dataset.value){const id=b.dataset.value;state.expanded=state.expanded.includes(id)?state.expanded.filter(x=>x!==id):[...state.expanded,id];save();render();root.querySelector(`[data-value="${id}"]`)?.focus({preventScroll:true});return;}
    if(b.hasAttribute('data-case')){state.caseIndex=Number(b.dataset.case);changeView('decide');return;}
    if(b.hasAttribute('data-choice')){const choice=Number(b.dataset.choice);state.answers[D.cases[state.caseIndex].id].choice=choice;save();render();root.querySelector(`[data-choice="${choice}"]`)?.focus({preventScroll:true});notify('Policy selected. Review its benefit and tradeoff below.');return;}
    if(b.dataset.bin){classify(b.dataset.bin);return;}
    if(b.dataset.writeCase){state.writeCase=b.dataset.writeCase;changeView('write');return;}
    if(b.dataset.writeValue){const w=state.drafts[state.writeCase],id=b.dataset.writeValue;if(w.values.includes(id))w.values=w.values.filter(x=>x!==id);else if(w.values.length<3)w.values.push(id);else {notify('Choose up to three values. Deselect one to change it.');return;}save();b.setAttribute('aria-pressed',String(w.values.includes(id)));updatePreview();return;}
    if(b.hasAttribute('data-evidence')){const c=D.cases.find(c=>c.id===state.writeCase);const w=state.drafts[c.id];const snippet=c.evidence[Number(b.dataset.evidence)];w.evidence=[w.evidence.trim(),snippet].filter(Boolean).join(' ').slice(0,3000);document.getElementById('evidence').value=w.evidence;save();updatePreview();return;}
    switch(b.dataset.action){
      case 'teacher':document.getElementById('teacher-dialog').showModal();break;
      case 'close-teacher':document.getElementById('teacher-dialog').close();break;
      case 'save':download('Roots-of-Ideology-project.json',JSON.stringify({app:'roots-of-ideology',version:2,state},null,2),'application/json');notify('Project saved as a file.');break;
      case 'open':document.getElementById('project-file').click();break;
      case 'read':readView();break;
      case 'stop':stopReading();notify('Reading stopped.');break;
      case 'print':preparePrint();window.print();break;
      case 'copy':copyArgument();break;
      case 'own':exportHTML(b);break;
      case 'reset':document.getElementById('reset-dialog').showModal();break;
      case 'cancel-reset':document.getElementById('reset-dialog').close();break;
      case 'confirm-reset':stopReading();state=clean();sortRetry='';save();document.getElementById('reset-dialog').close();render();root.focus({preventScroll:true});notify('New project started.');break;
      case 'previous-case':state.caseIndex=Math.max(0,state.caseIndex-1);save();render();root.focus({preventScroll:true});break;
      case 'next-case':state.caseIndex=Math.min(D.cases.length,state.caseIndex+1);save();render();root.focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:'instant'});break;
      case 'summary':state.caseIndex=D.cases.length;save();render();root.focus({preventScroll:true});break;
      case 'next-sort':state.sortIndex=D.sort.findIndex(c=>!state.placements[c.id]);if(state.sortIndex<0)state.sortIndex=0;sortRetry='';save();render();root.querySelector('[data-sort-card]')?.focus({preventScroll:true});break;
      case 'restart-sort':state.placements={};state.attempts={};state.sortIndex=0;sortRetry='';save();render();root.focus({preventScroll:true});break;
      case 'use-choice':{const c=D.cases.find(c=>c.id===state.writeCase),a=state.answers[c.id],o=c.options[a.choice],w=state.drafts[c.id];if(o){if(!w.claim.trim())w.claim='I support this policy: '+o.title+'.';if(!w.values.length)w.values=[...o.values];if(!w.evidence.trim()&&a.reason.trim())w.evidence=a.reason;if(!w.challenge.trim()&&a.concern.trim())w.challenge=a.concern;save();render();notify('Saved ideas added to empty fields. Your existing writing was kept.');}break;}
    }
  });
  root.addEventListener('input',e=>{
    const t=e.target;
    if(t.dataset.answer){state.answers[D.cases[state.caseIndex].id][t.dataset.answer]=text(t.value);save();}
    if(t.dataset.draft){state.drafts[state.writeCase][t.dataset.draft]=text(t.value);save();updatePreview();}
    if(t.dataset.source){state.sourceNotes[t.dataset.source]=text(t.value);save();}
  });
  root.addEventListener('change',e=>{if(e.target.hasAttribute('data-write-select')){state.writeCase=e.target.value;save();render();document.getElementById('write-case').focus({preventScroll:true});}});
  root.addEventListener('dragstart',e=>{const card=e.target.closest('[data-sort-card]');if(card&&card.draggable)e.dataTransfer.setData('text/plain',card.dataset.sortCard);});
  root.addEventListener('dragover',e=>{const bin=e.target.closest('[data-bin]');if(bin&&!bin.disabled){e.preventDefault();bin.classList.add('drag-over');}});
  root.addEventListener('dragleave',e=>e.target.closest('[data-bin]')?.classList.remove('drag-over'));
  root.addEventListener('drop',e=>{const bin=e.target.closest('[data-bin]');if(bin){e.preventDefault();bin.classList.remove('drag-over');if(e.dataTransfer.getData('text/plain')===D.sort[state.sortIndex].id)classify(bin.dataset.bin);}});
  document.addEventListener('keydown',e=>{if(state.view==='sort'&&['1','2','3'].includes(e.key)&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!document.querySelector('dialog[open]')&&!e.target.matches('input,textarea,select,[contenteditable]')){e.preventDefault();classify(['individual','shared','both'][Number(e.key)-1]);}});
  document.getElementById('project-file').addEventListener('change',async e=>{
    const file=e.target.files[0];e.target.value='';if(!file)return;
    try {if(file.size>250000)throw Error('size');const a=JSON.parse(await file.text());if(a.app!=='roots-of-ideology'||a.version!==2||!a.state||typeof a.state!=='object')throw Error('format');state=clean(a.state);sortRetry='';save();render();notify('Project opened.');} catch {notify('Choose a Roots of Ideology project JSON file. Your current work has been kept.');}
  });
  window.addEventListener('beforeprint',preparePrint);
  save();render();
})();
