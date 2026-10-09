/* Photo recognition practice. Session progress stays separate from trip notes. */
(() => {
  'use strict';
  const all=window.ROME_BUILDINGS;
  const locations=[...new Set(all.map(b=>b.city))];
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle=list=>{const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  let city='Rome',mode='identify',deck=[],index=0,revealed=false,hint=false,wrong=[],options=[];
  const seen=new Set();
  function start(mix=false){
    deck=all.filter(b=>city==='All'||b.city===city);
    if(mix)deck=shuffle(deck);
    index=0;prepare();
  }
  function prepare(){
    revealed=mode==='learn';hint=false;wrong=[];
    const current=deck[index];
    if(current){
      const others=all.filter(b=>b.id!==current.id&&b.city===current.city);
      const pool=others.length>=3?others:all.filter(b=>b.id!==current.id);
      options=shuffle([current,...shuffle(pool).slice(0,3)]);
      if(revealed)seen.add(current.id);
    }
    render();
  }
  function credits(b){
    return `<div class="building-credits">Photo: ${esc(b.photo.author)} · <a href="${esc(b.photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(b.photo.license)}</a> · <a href="${esc(b.photo.source)}" target="_blank" rel="noopener noreferrer">Original photograph ↗</a><span>Resized and converted to WebP; displayed with the original proportions.</span></div>`;
  }
  function answer(b){
    return `<div class="building-answer" id="building-feedback" tabindex="-1"><span class="eyebrow">${wrong.length?'LOOK FOR THESE DETAILS':'MEET THE PLACE'}</span><h3>${esc(b.name)}</h3><p class="building-location">${esc(b.city)} · ${esc(b.location)}</p><div class="spot"><strong>HOW TO RECOGNISE IT</strong>${esc(b.spot)}</div><p>${esc(b.fact)}</p><div class="actions"><a class="button" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.query)}" target="_blank" rel="noopener noreferrer">Find it on the map ↗</a></div><div class="source-links"><a href="${esc(b.source)}" target="_blank" rel="noopener noreferrer">Read more ↗</a></div>${credits(b)}</div>`;
  }
  function render(){
    $('building-cities').innerHTML=`<label for="building-location-select">LOCATION<select id="building-location-select">${[...locations,'All'].map(c=>`<option value="${esc(c)}"${c===city?' selected':''}>${esc(c==='All'?'All locations':c)} · ${c==='All'?all.length:all.filter(b=>b.city===c).length} places</option>`).join('')}</select></label>`;
    $('building-modes').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.buildingMode===mode)));
    $('building-position').textContent=`${Math.min(index+1,deck.length)} of ${deck.length} · ${deck.filter(b=>seen.has(b.id)).length} explored`;
    const b=deck[index];
    if(!b){
      $('building-stage').innerHTML=`<section class="panel building-finish"><span class="eyebrow">READY FOR THE REAL THING</span><h3>${city==='All'?'You’ve explored all 42 places.':`You’ve explored ${esc(city)}.`}</h3><p>Try them in a different order, or choose another location above.</p><button class="primary" id="building-restart">Try again</button></section>`;return;
    }
    const status=revealed?answer(b):`<div class="building-question"><span class="eyebrow">${esc(b.city.toUpperCase())} · LOOK CLOSELY</span><h3>Which place is this?</h3><p class="small">Look at the shapes, details, and surroundings.</p><div class="building-options">${options.map(o=>`<button data-building-answer="${o.id}" class="${wrong.includes(o.id)?'incorrect':''}"${wrong.includes(o.id)?' disabled':''}>${esc(o.name)}${wrong.includes(o.id)?' · try another':''}</button>`).join('')}</div><p class="building-response" role="status">${wrong.length?'Have another look. That name belongs to a different place.':''}</p><div class="actions"><button id="building-hint" aria-expanded="${hint}">${hint?'Hide clue':'Give me a clue'}</button><button id="building-reveal">Show answer</button></div>${hint?`<div class="spot"><strong>A CLUE</strong>${esc(b.hint)}</div>`:''}</div>`;
    $('building-stage').innerHTML=`<article class="building-card"><div class="identify-layout"><div class="building-photo"><button id="building-zoom" aria-label="Enlarge landmark photograph"><img src="${esc(b.image)}" alt="${revealed?esc(b.name):'Landmark photograph '+(index+1)+' for identification'}" width="${b.photo.width}" height="${b.photo.height}"><span>Tap for a closer look ↗</span></button></div><div class="building-details">${status}</div></div><div class="building-bottom"><span class="small">${mode==='learn'?'Look for these details when you get there.':revealed?'Keep its shape in mind for your walk.':'Take your time. Use a clue if you like.'}</span><button class="primary" id="building-next"${!revealed?' disabled':''}>${index===deck.length-1?'Finish this set':'Next place →'}</button></div></article>`;
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.buildingMode){mode=b.dataset.buildingMode;prepare();return;}
    if(b.dataset.buildingAnswer&&!revealed){
      const current=deck[index];
      if(b.dataset.buildingAnswer===current.id){revealed=true;seen.add(current.id);render();$('building-feedback').focus({preventScroll:true});}
      else{wrong.push(b.dataset.buildingAnswer);render();$('building-hint').focus({preventScroll:true});}
      return;
    }
    if(b.id==='building-hint'){hint=!hint;render();$('building-hint').focus({preventScroll:true});return;}
    if(b.id==='building-reveal'){revealed=true;seen.add(deck[index].id);render();$('building-feedback').focus({preventScroll:true});return;}
    if(b.id==='building-next'){if(!revealed)return;index++;prepare();return;}
    if(b.id==='building-shuffle'||b.id==='building-restart'){start(true);return;}
    if(b.id==='building-zoom'){
      const current=deck[index];const img=$('building-large-photo');img.src=current.image;img.alt=revealed?current.name:'Landmark photograph for identification';
      const dialog=$('building-photo-dialog');if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');return;
    }
    if(b.id==='building-photo-close'){
      const dialog=$('building-photo-dialog');if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');
    }
  });
  $('building-cities').addEventListener('change',event=>{
    if(event.target.id!=='building-location-select')return;
    const selected=event.target.value;
    if(selected!=='All'&&!locations.includes(selected))return;
    city=selected;start();$('building-location-select').focus({preventScroll:true});
  });
  start();
})();
