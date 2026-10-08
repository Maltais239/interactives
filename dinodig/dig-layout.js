'use strict';
// Keep the dig on one screen. Maps, writing and collections open independently.
const digHeader=document.querySelector('header');
const digBrand=document.createElement('div');digBrand.className='dig-brand';digBrand.append(digHeader.querySelector('h1'),document.getElementById('quadReadout'));digHeader.prepend(digBrand);
const digNav=document.createElement('nav');digNav.className='dig-nav';digNav.setAttribute('aria-label','Field tools');digHeader.append(digNav);
const digDialogs=[];
function makeDigDialog(id,title,node){
 const d=document.createElement('dialog');d.id=id;d.className='dig-dialog';
 const bar=document.createElement('div');bar.className='dialog-heading';
 const h=document.createElement('h2');h.textContent=title;const close=document.createElement('button');close.className='study-button';close.textContent='Back to dig';close.onclick=()=>d.close();
 bar.append(h,close);d.append(bar);if(node)d.append(node);document.body.append(d);digDialogs.push(d);return d;
}
function openDigDialog(dialog){digDialogs.forEach(d=>{if(d.open&&d!==dialog)d.close();});if(!dialog.open)dialog.showModal();}
const mapDialog=makeDigDialog('site-dialog','Choose an Alberta dig site',document.querySelector('.mapwrap'));
const notebookDialog=makeDigDialog('notebook-dialog','Your field notebook',document.getElementById('field-study'));
notebookDialog.append(document.querySelector('.colophon'));
const catalogDialog=makeDigDialog('catalog-dialog','Your fossil collection',document.querySelector('.catalog'));
const specimenDialog=makeDigDialog('specimen-dialog','Your discovery',document.getElementById('discovery'));
const settings=document.createElement('div');settings.className='discovery-settings';settings.append(document.getElementById('bMute'),document.getElementById('bReset'));specimenDialog.append(settings);
function navButton(text,dialog){const b=document.createElement('button');b.className='study-button';b.textContent=text;b.onclick=()=>{openDigDialog(dialog);if(dialog===mapDialog)requestAnimationFrame(()=>{fitFallbackMap();try{if(map)map.invalidateSize();}catch(e){}});};digNav.append(b);return b;}
navButton('Sites',mapDialog);navButton('Notebook',notebookDialog);navButton('Collection',catalogDialog);
const infoButton=navButton('Fossil info',specimenDialog);infoButton.disabled=!found[current];
const field=document.querySelector('.field'),gauge=document.querySelector('.gauge'),workspace=document.querySelector('.stage-wrap');
gauge.querySelector('h2').textContent='Dig progress';
document.getElementById('tPick').childNodes[document.getElementById('tPick').childNodes.length-1].textContent='Chisel';
document.getElementById('tAir').childNodes[document.getElementById('tAir').childNodes.length-1].textContent='Brush';
document.getElementById('clearSection').textContent='Help dig';
document.getElementById('clearSection').title='Carefully clear one small section for me';
document.querySelector('.dock .label').hidden=true;document.querySelector('.dock .spacer').hidden=true;
document.body.classList.add('dig-screen');
fitDigViewport=function(){
 const r=workspace.getBoundingClientRect(),dock=document.querySelector('.dock'),note=document.querySelector('.reconstruction-note');
 const available=innerHeight-r.top-dock.getBoundingClientRect().height-note.getBoundingClientRect().height-28;
 pit.style.setProperty('--pit-height',Math.max(90,Math.min(900,available))+'px');
};
new ResizeObserver(()=>requestAnimationFrame(fitDigViewport)).observe(digHeader);
new ResizeObserver(()=>requestAnimationFrame(fitDigViewport)).observe(gauge);
new ResizeObserver(()=>requestAnimationFrame(fitDigViewport)).observe(document.querySelector('.dock'));
requestAnimationFrame(()=>requestAnimationFrame(fitDigViewport));

let suppressDiscoveryDialog=false;
const displayDigDiscovery=showDiscovery;
showDiscovery=function(){displayDigDiscovery();infoButton.disabled=!found[current];if(!suppressDiscoveryDialog)openDigDialog(specimenDialog);};
const selectDigSite=loadSite;
loadSite=function(i,redig=false){digDialogs.forEach(d=>{if(d.open)d.close();});suppressDiscoveryDialog=true;selectDigSite(i,redig);suppressDiscoveryDialog=false;infoButton.disabled=!found[current];requestAnimationFrame(fitDigViewport);};
// A short picture-based identification question precedes registration of a new find.
const identificationDialog=makeDigDialog('identification-dialog','What did you uncover?',null);
const identificationBody=document.createElement('div');identificationBody.className='identification-body';identificationDialog.append(identificationBody);
const fossilClues={DPP:'Look for the nose horn and the bony frill.',DRY:'Look for sharp teeth in the long skull.',MAC:'Look for preserved armour and long shoulder spikes.',PIP:'Look for a thick bony pad on the nose.',HSC:'Look for a broad duck-billed snout without a tall crest.',DEV:'Look for fossil eggs and broken eggshells.',MAN:'Look for the heavy tail club and armour plates.',COR:'Look for the rounded helmet-shaped crest.'};
const registerDigDiscovery=reveal;
let waitingForIdentification=false;
function identifyDig(){
 const s=SITES[current],other=SITES[(current+1)%SITES.length],choices=Math.random()<.5?[s,other]:[other,s];
 identificationBody.innerHTML='<p>Match the fossil to an animal or find. A grown-up can read the names with you.</p><img class="id-fossil" src="'+PHOTOS[s.grid]+'" alt="The fossil you just excavated"><div class="id-choices">'+choices.map(c=>'<button class="id-choice" data-identify="'+c.grid+'"><img src="'+(LIFE_IMAGES[c.grid]||PHOTOS[c.grid])+'" alt="'+Studio.esc(c.name)+'"><strong>'+Studio.esc(c.name)+'</strong>'+(c.grid==='DEV'?'<span>Dinosaur eggs and nest</span>':'')+'</button>').join('')+'</div><div class="id-feedback" role="status"></div><button class="study-button id-hint">Show a hint</button>';
 identificationBody.querySelector('.id-hint').onclick=()=>{identificationBody.querySelector('.id-feedback').textContent=fossilClues[s.grid];};
 identificationBody.querySelectorAll('[data-identify]').forEach(b=>b.onclick=()=>{
  if(b.dataset.identify!==s.grid){identificationBody.querySelector('.id-feedback').textContent='Try another picture. '+fossilClues[s.grid];return;}
  waitingForIdentification=false;identificationDialog.close();revealed=false;registerDigDiscovery();infoButton.disabled=false;saveField();renderStudy();
 });
 openDigDialog(identificationDialog);
}
reveal=function(){
 if(revealed)return;
 if(found[current]){registerDigDiscovery();return;}
 revealed=true;stage='done';pit.classList.add('revealed');setHint('Fossil uncovered! Match it to a picture.');updateGauge();
 waitingForIdentification=true;document.getElementById('clearSection').disabled=true;identifyDig();
};
identificationDialog.addEventListener('close',()=>{if(waitingForIdentification){infoButton.disabled=false;infoButton.textContent='Identify fossil';}});
infoButton.onclick=()=>{if(waitingForIdentification)identifyDig();else openDigDialog(specimenDialog);};
const chooseSiteWithIdentification=loadSite;
loadSite=function(i,redig=false){waitingForIdentification=false;infoButton.textContent='Fossil info';chooseSiteWithIdentification(i,redig);};
