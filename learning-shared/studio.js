'use strict';
window.Studio={
  esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  read:(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},
  save:(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}},
  download:(name,text,type='text/plain')=>{const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);},
  csv:rows=>rows.map(row=>row.map(v=>'"'+(typeof v==='string'&&/^[=+@-]/.test(v)?"'"+v:String(v??'')).replace(/"/g,'""')+'"').join(',')).join('\r\n'),
  shuffle:items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
  focus:id=>document.getElementById(id)?.focus()
};


/* Opt-in workspace sizing: keep the activity in the visible height without
 * scaling text or limiting a lesson's normal document scroll. */
Studio.fitWorkspace = function (element, { minHeight = 330, maxHeight = 780, bottomGap = 16 } = {}) {
  if (!element) return () => {};
  let frame = 0;
  const update = () => {
    frame = 0;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const documentTop = element.getBoundingClientRect().top + window.scrollY;
    const height = Math.round(Math.max(minHeight, Math.min(maxHeight, viewportHeight - documentTop - bottomGap)));
    const value = height + 'px';
    if (element.style.getPropertyValue('--workspace-height') !== value) element.style.setProperty('--workspace-height', value);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  let observer;
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(schedule);
    for (let sibling = element.previousElementSibling; sibling; sibling = sibling.previousElementSibling) observer.observe(sibling);
  }
  document.fonts?.ready.then(schedule);
  update();
  return () => {
    window.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
    observer?.disconnect();
    cancelAnimationFrame(frame);
  };
};
