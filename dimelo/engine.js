import {entries,numberEs,moneyEs} from './content.js';
export const abilities=['recognize','recall','listen','use'];
export const abilityLabels={recognize:'Recognize',recall:'Recall',listen:'Understand by ear',use:'Use in a sentence'};
export const normalize=(s,accents=false)=>String(s).normalize('NFD').replace(accents?/$^/g:/\p{Diacritic}/gu,'').toLowerCase().replace(/[’']/g,'').replace(/[¿?¡!.,;:…]/g,' ').replace(/\s+/g,' ').trim();
export function matchesEntry(input,entry){
  const strict=entry.id==='es-tu'||entry.id==='es-tu-pronoun';
  const text=normalize(input,strict);
  return [entry.es,...entry.answers].some(x=>normalize(x,strict)===text);
}
export function initialState(){return {schema:1,pack:'es',progress:{},numbers:{},sentences:{},missions:{},history:[],settings:{voiceURI:'',rate:0.9,locale:'es-MX',name:'Darren',home:'Edmonton',country:'Canadá'},custom:[]};}
export function sanitizeState(raw){
  if(!raw||raw.schema!==1||raw.pack!=='es'||typeof raw.progress!=='object'||Array.isArray(raw.progress))throw new Error('Choose a Dímelo Spanish backup (version 1).');
  const s=initialState();
  for(const key of ['progress','numbers','sentences','missions'])s[key]=raw[key]&&typeof raw[key]==='object'&&!Array.isArray(raw[key])?raw[key]:{};
  s.history=Array.isArray(raw.history)?raw.history.slice(-2000):[];
  s.custom=Array.isArray(raw.custom)?raw.custom.filter(e=>typeof e.es==='string'&&typeof e.en==='string').slice(0,1000).map((e,i)=>({id:/^custom-[a-z0-9-]+$/.test(e.id||'')?e.id:'custom-'+i,es:e.es.slice(0,200),en:e.en.slice(0,300),lessons:['custom'],kind:e.es.trim().split(' ').length>1?'phrase':'word',notes:'Added by you.',answers:[],sources:[]})):[];
  if(raw.settings&&typeof raw.settings==='object')for(const k of Object.keys(s.settings)){if(typeof raw.settings[k]===typeof s.settings[k])s.settings[k]=raw.settings[k];}
  s.settings.rate=Math.min(1.2,Math.max(.5,Number(s.settings.rate)||.9));
  return s;
}
export function stat(state,id,ability){return state.progress[id]?.[ability]||{attempts:0,correct:0,independent:0,streak:0,due:0,interval:0};}
export function record(state,id,ability,correct,{assisted=false,now=Date.now()}={}){
  if(!abilities.includes(ability))throw new Error('Unknown practice ability');
  const p=stat(state,id,ability),qualified=correct&&!assisted;
  const laterDay=!p.lastIndependent||Math.floor(now/86400000)>Math.floor(p.lastIndependent/86400000);
  const streak=qualified?(laterDay?(p.streak||0)+1:Math.max(1,p.streak||0)):0;
  const interval=qualified?(streak===1?1:laterDay?Math.min(60,Math.max(2,(p.interval||1)*2.2)):(p.interval||1)):0;
  const next={attempts:(p.attempts||0)+1,correct:(p.correct||0)+(correct?1:0),independent:(p.independent||0)+(qualified?1:0),streak,interval,due:now+(qualified?interval*86400000:600000),last:now,lastIndependent:qualified?now:(p.lastIndependent||0)};
  if(!state.progress[id])state.progress[id]={};state.progress[id][ability]=next;
  state.history.push({id,ability,correct:!!correct,assisted:!!assisted,at:now});state.history=state.history.slice(-2000);
  return next;
}
export function status(state,id){
  const p=state.progress[id]||{};const values=Object.values(p);
  if(!values.some(s=>s.attempts))return 'unseen';
  const productive=[p.recall,p.listen,p.use];
  if(productive.every(s=>s&&s.streak>=2))return 'retaining';
  if(productive.some(s=>s&&s.independent>0))return 'independent';
  return 'learning';
}
export function summary(state,items=entries){
  const out={total:items.length,seen:0,unseen:0,learning:0,independent:0,retaining:0,due:0};
  for(const e of items){const v=status(state,e.id);out[v]++;if(v!=='unseen')out.seen++;if(Object.values(state.progress[e.id]||{}).some(p=>p.attempts&&p.due<=Date.now()))out.due++;}
  return out;
}
export function shuffled(a,random=Math.random){const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function wordQueue(state,items,{limit=12,mode='mixed',now=Date.now()}={}){
  const unseen=items.filter(e=>status(state,e.id)==='unseen');
  const due=items.filter(e=>Object.values(state.progress[e.id]||{}).some(p=>p.attempts&&p.due<=now));
  // Reserve space for unseen content even when reviews accumulate.
  const fresh=unseen.slice(0,Math.min(4,limit));
  const selected=[...fresh,...shuffled(due)].filter((e,i,a)=>a.findIndex(x=>x.id===e.id)===i).slice(0,limit);
  const remaining=[...unseen.slice(fresh.length),...shuffled(items)].filter(e=>!selected.some(x=>x.id===e.id));
  selected.push(...remaining.slice(0,limit-selected.length));
  return selected.map((e,i)=>({entry:e,mode:mode==='mixed'?['recall','recognize','listen'][i%3]:mode,new:status(state,e.id)==='unseen'}));
}
export function numberFromText(text){
 const cleaned=normalize(text).replace(/\b(son|cuesta|cuestan|pesos?|en total|por persona)\b/g,'').trim();
 const digits=cleaned.replace(/[\s,$€]/g,'');if(/^\d+$/.test(digits)){const n=Number(digits);return n<=1000000?n:null;}
 const tokens=cleaned.split(' ').filter(w=>w&&w!=='y');
 const values={cero:0,un:1,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,dieciseis:16,diecisiete:17,dieciocho:18,diecinueve:19,veinte:20,veintiuno:21,veintiun:21,veintidos:22,veintitres:23,veinticuatro:24,veinticinco:25,veintiseis:26,veintisiete:27,veintiocho:28,veintinueve:29,treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90,cien:100,ciento:100,doscientos:200,trescientos:300,cuatrocientos:400,quinientos:500,seiscientos:600,setecientos:700,ochocientos:800,novecientos:900};
 let total=0,current=0;if(!tokens.length)return null;
 for(const word of tokens){if(word==='mil'){total+=(current||1)*1000;current=0;}else if(word==='millon'||word==='millones'){total+=(current||1)*1000000;current=0;}else if(Object.hasOwn(values,word))current+=values[word];else return null;}
 const n=total+current;
 if(n<0||n>1000000)return null;
 return [numberEs(n),numberEs(n,{apocope:true})].some(s=>normalize(s)===cleaned)?n:null;
}
export function stageValue(stage,random=Math.random){const count=Math.floor((stage.max-stage.min)/stage.step)+1;return stage.min+Math.floor(random()*count)*stage.step;}
export function numberTargets(stage){return Math.floor((stage.max-stage.min)/stage.step)+1;}
export const findEntry=es=>entries.find(e=>normalize(e.es)===normalize(es));
export const missions=[
 {id:'hello',title:'Meet Lucía',label:'Names, home & work',lesson:'Episodes 1–4, 7–8',intro:'Meet someone new. Say who you are, where you live, and keep the conversation going.',pattern:'Me llamo… · Soy de… · Vivo en…',turns:[
  {say:'Hola, me llamo Lucía. ¿Cómo te llamas?',en:'Hi, my name is Lucía. What’s your name?',task:'Introduce yourself. Use your name or an imaginary one.',sample:'Me llamo Darren.',hint:'Start with me llamo…',accept:s=>/^(hola )?(me llamo|soy) .+/.test(s),entry:'Me llamo Darren.'},
  {say:'Encantada. ¿De dónde eres?',en:'Pleased to meet you. Where are you from?',task:'Tell her where you’re from.',sample:'Soy de Canadá.',hint:'Soy de + your country.',accept:s=>/^(yo )?(soy de|de) .+/.test(s),entry:'Soy de Canadá.'},
  {say:'¿Dónde vives?',en:'Where do you live?',task:'Say where you live.',sample:'Vivo en Edmonton.',hint:'For where you live, use vivo en…',accept:s=>/^(yo )?(vivo en|en) .+/.test(s),entry:'Vivo en Edmonton.'},
  {say:'Soy profesora. ¿Te gusta tu trabajo?',en:'I’m a teacher. Do you like your job?',task:'Answer yes or no. Add a phrase if you can.',sample:'Sí, me gusta mi trabajo. ¿Y tú?',hint:'Sí, me gusta… / No, no me gusta…',accept:s=>/^(si|no)( |$)/.test(s)||/^(me gusta|me encanta|no me gusta)/.test(s),entry:'Sí, me gusta mi trabajo.'}
 ]},
 {id:'family',title:'Meet the family',label:'Family & numbers',lesson:'Episodes 5–6',intro:'Use your real family or an imaginary one. New question: ¿Tienes hermanos? = Do you have siblings?',pattern:'Tengo… · Se llama… · Este es… / Esta es…',turns:[
  {say:'Hola. ¿Tienes hermanos?',en:'Hi. Do you have siblings?',task:'Say you have a brother or sister, or that you don’t have siblings.',sample:'Tengo una hermana.',hint:'Tengo un hermano / Tengo una hermana / No tengo hermanos.',accept:s=>/^(si )?(tengo|no tengo) .*herman/.test(s),entry:'Tengo una hermana.'},
  {say:'Este es mi hermano. Se llama Jorge.',en:'This is my brother. His name is Jorge.',task:'Introduce a member of your family. You can invent a name.',sample:'Esta es mi hermana. Se llama Ana.',hint:'Este es mi… / Esta es mi… Se llama…',accept:s=>/^(este es mi (hermano|padre|hijo|marido)|esta es mi (hermana|madre|hija|mujer))( |$)/.test(s),entry:'Esta es mi hermana.'},
  {say:'¿Cómo se llama?',en:'What is his or her name?',task:'Give the person’s name.',sample:'Se llama Ana.',hint:'Se llama…',accept:s=>/^se llama .+/.test(s),entry:'Se llama…'}
 ]},
 {id:'interests',title:'Find something in common',label:'Interests & activities',lesson:'Episode 8',intro:'Talk about things you like. Both positive and negative answers are welcome.',pattern:'Me gusta… · No me gusta… · Me encanta…',turns:[
  {say:'Me gusta el cine. ¿Te gusta el cine?',en:'I like the cinema. Do you like the cinema?',task:'Tell her whether you like the cinema.',sample:'Sí, me gusta el cine.',hint:'Sí, me gusta… / No, no me gusta…',accept:s=>/^(si|no)( |$)/.test(s)||/^(me gusta|me encanta)/.test(s),entry:'El cine.'},
  {say:'¿Te gusta leer?',en:'Do you like reading?',task:'Answer, then ask it back with ¿Y tú? if you like.',sample:'Me encanta leer. ¿Y tú?',hint:'Me gusta leer / No me gusta leer / Me encanta leer.',accept:s=>/^(si|no)( |$)/.test(s)||/^(me gusta|me encanta)/.test(s),entry:'Leer.'},
  {say:'Me gusta aprender español. ¿Y tú?',en:'I like learning Spanish. And you?',task:'Tell her you’re learning Spanish, or say you like learning it.',sample:'Estoy aprendiendo español.',hint:'Estoy aprendiendo español. / Me gusta aprender español.',accept:s=>/aprend(iendo|er) espanol/.test(s)||/^(si|yo tambien|tambien)/.test(s),entry:'Estoy aprendiendo español.'}
 ]},
 {id:'formal',title:'A polite introduction',label:'Usted & formal questions',lesson:'Episodes 2–3, 8',intro:'Practise polite questions using usted. Your own name and answers stay the same.',pattern:'¿Y usted? · Me llamo… · Soy de…',turns:[
  {say:'Buenas tardes. ¿Cómo se llama usted?',en:'Good afternoon. What is your name? (formal)',task:'Introduce yourself politely.',sample:'Buenas tardes. Me llamo Darren.',hint:'Me llamo… works with both formal and informal questions.',accept:s=>/(^| )me llamo .+/.test(s),entry:'Me llamo Darren.'},
  {say:'¿De dónde es usted?',en:'Where are you from? (formal)',task:'Tell her where you’re from, then ask ¿Y usted? if you can.',sample:'Soy de Canadá. ¿Y usted?',hint:'Soy de… ¿Y usted?',accept:s=>/^soy de .+/.test(s),entry:'Soy de Canadá.'},
  {say:'¿Le gusta su trabajo?',en:'Do you like your job? (formal)',task:'Tell her whether you like your job.',sample:'Sí, me gusta mi trabajo.',hint:'Your answer is still me gusta…',accept:s=>/^(si|no)( |$)/.test(s)||/^(me gusta|me encanta)/.test(s),entry:'Sí, me gusta mi trabajo.'}
 ]},
 {id:'taxi',title:'Understand the taxi fare',label:'Hear the price',lesson:'Numbers & travel helpers',intro:'Ask the price, understand the spoken amount, and confirm it. You can ask for a repeat or slower speech.',pattern:'¿Cuánto cuesta? · Son… pesos. · ¿Puede repetirlo?',taxi:true}
];
export function taxiTurns(fare=250){return [
 {say:'Buenos días.',en:'Good morning.',task:'Ask how much the taxi costs.',sample:'¿Cuánto cuesta?',hint:'¿Cuánto cuesta? / ¿Cuánto es?',accept:s=>/cuanto (cuesta|es|vale|cobra)/.test(s),entry:'¿Cuánto cuesta?'},
 {say:'Son '+moneyEs(fare)+'.',en:'It’s '+fare.toLocaleString('en-CA')+' pesos.',task:'What amount did you hear? Enter the digits.',sample:String(fare),hint:'Listen to the hundreds, then the rest. You can ask for a repeat.',accept:s=>numberFromText(s)===fare,entry:numberEs(fare),audioOnly:true,number:fare},
 {say:'Sí. '+numberEs(fare)+'.',en:'Yes. '+fare.toLocaleString('en-CA')+'.',task:'Confirm the price in Spanish. Type the number in words or say it.',sample:'¿'+numberEs(fare)+'?',hint:'Repeat the amount as a question.',accept:s=>numberFromText(s)===fare,entry:numberEs(fare)}
];}
