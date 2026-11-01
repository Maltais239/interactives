import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const html=readFileSync(new URL('index.html',root),'utf8');
const code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n').replace('loadState(); saveState(); render();','');
function setup(initialVoices=[]){
  const spoken=[],timers=new Map(),hosts=new Map(),controls=new Map();
  let nextTimer=0,cancels=0,voices=initialVoices;
  const host=()=>({innerHTML:'',querySelectorAll:()=>[]});
  hosts.set('reviewArea',host());hosts.set('numDrillArea',host());
  for(const id of ['speakBtn','nSpeakBtn']) controls.set(id,{addEventListener:(name,fn)=>{controls.get(id)[name]=fn;}});
  const context=vm.createContext({
    window:{speechSynthesis:{cancel:()=>cancels++,speak:u=>spoken.push(u),getVoices:()=>voices}},
    SpeechSynthesisUtterance:class {constructor(text){this.text=text;}},
    setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},
    clearTimeout:id=>timers.delete(id),
    document:{getElementById:id=>hosts.get(id)||controls.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[]},
  });
  vm.runInContext(readFileSync(new URL('coffee-break-data.js',root),'utf8')+'\n'+code+';globalThis.api={state,renderReview,renderNumDrill,syncListeningAutoplay,playPracticeSpanish};',context);
  const a=context.api;
  const card=(ex='listen',speak='hola')=>({id:'word-'+speak,ex,speak,spanish:speak,prompt:'Listen to the Spanish word.',answer:'hello',taskText:'Listen, then choose.',promptLabel:'Listening recognition',lessonTitle:'Episode 1',choices:['hello','goodbye']});
  a.state.started=true;
  a.state.rev={queue:[card(),card('dictation','adiós'),card('typed','gracias')],idx:0,reveal:false,typed:'',correct:0,total:0};
  return {a,spoken,card,hosts,controls,timers,setVoices:value=>{voices=value;},get cancels(){return cancels;},flush(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}};
}

test('a listening card autoplays once across repeated renders; dictation autoplays and typed recall stays quiet',()=>{
  const x=setup();
  x.a.renderReview();x.a.renderReview();
  assert.equal(x.timers.size,1);
  assert.match(x.hosts.get('reviewArea').innerHTML,/Replay Spanish/);
  x.flush();assert.equal(x.spoken.length,1);assert.equal(x.spoken[0].text,'hola');assert.equal(x.spoken[0].lang,'es-MX');
  x.a.renderReview();x.flush();assert.equal(x.spoken.length,1);
  x.a.state.rev.idx=1;x.a.renderReview();x.flush();assert.equal(x.spoken.at(-1).text,'adiós');
  x.a.state.rev.idx=2;x.a.renderReview();x.flush();assert.equal(x.spoken.length,2);
});

test('skipping, revealing, finishing, or leaving practice cancels stale autoplay',()=>{
  const x=setup();
  x.a.renderReview();x.a.state.rev.idx=1;x.a.renderReview();x.flush();
  assert.deepEqual(x.spoken.map(u=>u.text),['adiós']);
  x.a.state.rev.idx=0;x.a.renderReview();x.a.state.rev.reveal=true;x.a.renderReview();x.flush();
  assert.equal(x.spoken.length,1);
  x.a.state.rev.reveal=false;x.a.renderReview();x.a.state.tab='verbs';x.a.syncListeningAutoplay();x.flush();
  assert.equal(x.spoken.length,1);
  x.a.state.tab='practice';x.a.renderReview();x.a.state.rev.idx=3;x.a.renderReview();x.flush();
  assert.equal(x.spoken.length,1);assert.ok(x.cancels>0);
});

test('number listening autoplays once despite both renderers running, and replay replaces pending autoplay',()=>{
  const x=setup();
  x.a.state.started=false;
  x.a.state.numDrill={active:true,group:0,queue:[x.card('listen','cero'),x.card('dictation','uno')],idx:0,reveal:false,correct:0,total:0};
  x.a.renderNumDrill();x.a.renderReview();x.a.renderNumDrill();
  assert.equal(x.timers.size,1);assert.match(x.hosts.get('numDrillArea').innerHTML,/Replay Spanish/);
  x.controls.get('nSpeakBtn').click();x.flush();
  assert.deepEqual(x.spoken.map(u=>u.text),['cero']);
  x.a.renderNumDrill();x.flush();assert.equal(x.spoken.length,1);
  x.a.state.numDrill.idx=1;x.a.renderNumDrill();x.flush();
  assert.deepEqual(x.spoken.map(u=>u.text),['cero','uno']);
  x.controls.get('nSpeakBtn').click();assert.equal(x.spoken.at(-1).text,'uno');assert.equal(x.spoken.length,3);
});

test('every playback prefers Mexico over a default Spain voice and accepts other Latin American voices',()=>{
  const spain={lang:'es-ES',name:'Spain',default:true};
  const mexico={lang:'es-MX',name:'Mexico'};
  const regional={lang:'es-419',name:'Latin America'};
  const us={lang:'es-US',name:'US Spanish'};
  const colombia={lang:'es-CO',name:'Colombia'};
  const x=setup([spain,us,regional,mexico,colombia]);
  x.a.playPracticeSpanish('hola');assert.equal(x.spoken.at(-1).voice,mexico);
  x.setVoices([spain,us,regional]);x.a.playPracticeSpanish('dos');assert.equal(x.spoken.at(-1).voice,regional);
  x.setVoices([spain,us]);x.a.playPracticeSpanish('tres');assert.equal(x.spoken.at(-1).voice,us);
  x.setVoices([spain,colombia]);x.a.playPracticeSpanish('cuatro');assert.equal(x.spoken.at(-1).voice,colombia);
});

test('an empty or Spain-only voice list keeps the Mexican locale and picks up late-loading voices',()=>{
  const x=setup();
  x.a.playPracticeSpanish('hola');assert.equal(x.spoken.at(-1).lang,'es-MX');assert.equal(x.spoken.at(-1).voice,undefined);
  x.setVoices([{lang:'es-ES',name:'Spain'}]);x.a.playPracticeSpanish('hola');assert.equal(x.spoken.at(-1).lang,'es-MX');assert.equal(x.spoken.at(-1).voice,undefined);
  const mexico={lang:'es-MX',name:'Mexico'};
  x.setVoices([mexico]);x.a.playPracticeSpanish('hola');assert.equal(x.spoken.at(-1).lang,'es-MX');assert.equal(x.spoken.at(-1).voice,mexico);
});

