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
