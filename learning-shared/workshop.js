
window.Workshop={
 esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 shuffle:a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},
 download:(name,text,type='text/plain')=>{const u=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)},
 save:(key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));return true}catch{return false}},
 load:(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},
 speak:text=>{if(!('speechSynthesis' in window))return false;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-CA';window.speechSynthesis.speak(u);return true}
};
