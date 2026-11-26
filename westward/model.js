export const KEY='westward.workspace.v1';
export const PROVINCES={BC:'British Columbia',AB:'Alberta',SK:'Saskatchewan',MB:'Manitoba'};
export const CHANNELS=['Call','Online meeting','Visit','Email'];
export function today(d=new Date()){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Edmonton',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-');}
export function addDays(day,n){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function days(a,b){return Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/86400000);}
export function lastContact(s,id,visit=false){return s.contacts.filter(c=>c.accountId===id&&(!visit||c.channel==='Visit')).sort((a,b)=>b.date.localeCompare(a.date))[0];}
export function actions(s){return s.actions.filter(a=>!a.done).sort((a,b)=>a.due.localeCompare(b.due)||(a.priority==='High'?-1:1)-(b.priority==='High'?-1:1));}
export function status(s,id,now=today()){const pending=actions(s).filter(x=>x.accountId===id),last=lastContact(s,id),a=s.accounts.find(x=>x.id===id);if(pending.some(x=>x.due<=now))return 'due';if(pending.some(x=>x.channel==='Visit'))return 'planned';if(last)return days(last.date,now)>(a?.cadence??60)?'due':'current';return pending.length?'planned':'unknown';}
export function km(a,b){const r=x=>x*Math.PI/180,dlat=r(b.lat-a.lat),dlon=r(b.lng-a.lng),v=Math.sin(dlat/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dlon/2)**2;return 12742*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));}
export const HOME={lat:53.541,lng:-113.295};
export function tripPoints(t,s){return [HOME,...t.accountIds.map(id=>s.accounts.find(a=>a.id===id)).filter(Boolean)];}
export function routeKm(t,s){const p=tripPoints(t,s);return Math.round(p.slice(1).reduce((n,a,i)=>n+km(p[i],a),0));}
export function routeURL(t,s){const p=tripPoints(t,s).slice(1);if(!p.length)return '';const q=new URLSearchParams({api:'1',origin:'Sherwood Park, Alberta',destination:`${p.at(-1).lat},${p.at(-1).lng}`,travelmode:'driving'});if(p.length>1)q.set('waypoints',p.slice(0,-1).map(a=>`${a.lat},${a.lng}`).join('|'));return 'https://www.google.com/maps/dir/?'+q;}
export function safeURL(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
export function clearDemo(s){const n=structuredClone(s);n.mode='live';for(const k of ['contacts','actions','trips','opportunities'])n[k]=n[k].filter(x=>!x.isDemo);n.accounts=n.accounts.map(a=>({...a,assigned:a.demoAssigned?false:a.assigned,demoAssigned:false}));return n;}
export function validate(s){
 if(!s||s.schema!==1)throw Error('Not a supported Westward backup.');
 const str=(v,max=20000)=>typeof v==='string'&&v.length<=max;
 const date=v=>str(v,10)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
 for(const k of ['accounts','contacts','actions','trips','opportunities','resources']){if(!Array.isArray(s[k])||s[k].length>20000||!s[k].every(x=>x&&str(x.id,100)&&x.id)||new Set(s[k].map(x=>x.id)).size!==s[k].length)throw Error('Invalid or duplicate '+k+' records.');}
 const ids=new Set(s.accounts.map(a=>a.id));
 if(!s.accounts.every(a=>str(a.name,200)&&a.name.trim()&&PROVINCES[a.province]&&str(a.city,200)&&Number.isFinite(a.lat)&&Math.abs(a.lat)<=90&&Number.isFinite(a.lng)&&Math.abs(a.lng)<=180&&Number.isFinite(a.cadence)&&a.cadence>0&&Array.isArray(a.stakeholders)&&a.stakeholders.every(x=>str(x.id,100)&&str(x.name,200)&&str(x.role,300)&&(!x.email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email)))))throw Error('Invalid district or stakeholder details.');
 if(!s.actions.every(a=>ids.has(a.accountId)&&str(a.title,500)&&a.title.trim()&&date(a.due)&&CHANNELS.includes(a.channel)&&typeof a.done==='boolean'))throw Error('Invalid next-step details.');
 if(!s.contacts.every(c=>ids.has(c.accountId)&&date(c.date)&&CHANNELS.includes(c.channel)&&str(c.notes??'')&&str(c.person??'',200)))throw Error('Invalid contact details.');
 if(!s.trips.every(t=>str(t.name,200)&&date(t.date)&&Array.isArray(t.accountIds)&&t.accountIds.length<=9&&new Set(t.accountIds).size===t.accountIds.length&&t.accountIds.every(id=>ids.has(id))))throw Error('Invalid itinerary.');
 if(!s.opportunities.every(o=>ids.has(o.accountId)&&str(o.title,500)&&['Discovery','In progress','Proven value'].includes(o.stage)&&(!o.reviewDate||date(o.reviewDate))))throw Error('Invalid opportunity.');
 if(!s.resources.every(r=>str(r.title,300)&&str(r.category,100)&&str(r.note??'')&&safeURL(r.url)))throw Error('Invalid resource link.');
 const out=structuredClone(s);out.mode=out.mode==='demo'?'demo':'live';return out;
}
export function calendar(t,s){const esc=v=>String(v).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Westward//Territory Planner//EN','BEGIN:VEVENT',`UID:${t.id}@westward`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${t.date.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${addDays(t.date,1).replace(/-/g,'')}`,`SUMMARY:${esc(t.name+' — proposed')}`,`DESCRIPTION:${esc('Not booked. Confirm appointments.\n'+t.accountIds.map(id=>s.accounts.find(a=>a.id===id)?.name).join('\n'))}`,'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR'];return lines.map(line=>{const enc=new TextEncoder();let out='',bytes=0;for(const ch of line){const size=enc.encode(ch).length;if(bytes+size>75){out+='\r\n ';bytes=1;}out+=ch;bytes+=size;}return out;}).join('\r\n')+'\r\n';}
