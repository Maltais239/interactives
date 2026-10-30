import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const data = readFileSync(new URL('coffee-break-data.js', root), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map(m=>m[1]).join('\n').replace('loadState(); saveState(); render();','');
const legacy = JSON.parse(readFileSync(new URL('legacy-indexes.json',import.meta.url),'utf8'));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function app(saved) {
  const storage = new Map(saved ? [['tmSpanish_v2',JSON.stringify(saved)]] : []);
  const ctx = vm.createContext({localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
  vm.runInContext(data+'\n'+script+`;globalThis.api={COFFEE_BREAK_EPISODES,RAW,RAW_CBE,PHRASES,NUM_GROUPS,STORAGE_KEY,state,buildSeeded,loadState,saveState,coreWords,selectedWords,matchesAnswer,spanishKey,buildCard};`, ctx);
  ctx.api.loadState();
  return {a:ctx.api, storage};
}

test('all 102 supplied note entries resolve to their episode bank, including corrected spellings',()=>{
  const {a}=app();
  assert.equal(a.COFFEE_BREAK_EPISODES.reduce((sum,e)=>sum+e.notes.length,0),102);
  assert.equal(a.COFFEE_BREAK_EPISODES.length,10);
  for(const ep of a.COFFEE_BREAK_EPISODES) {
    const words=a.state.lessons.find(l=>l.id===1000+ep.episode).vocab;
    for(const note of ep.notes) assert.ok(words.some(w=>a.spanishKey(w.spanish)===a.spanishKey(note.spanish)),`E${ep.episode}: ${note.original}`);
    for(const [sp] of ep.components) assert.ok(words.some(w=>a.spanishKey(w.spanish)===a.spanishKey(sp)),`E${ep.episode} component: ${sp}`);
  }
});

test('original Coffee Break entries and phrase indexes are unchanged',()=>{
  const {a}=app();
  for(const e of legacy.coffee) {
    const current=a.RAW_CBE.find(([id])=>id===e.episode)[1].slice(0,e.count);
    assert.equal(digest(current),e.sha256,`E${e.episode} original prefix`);
  }
  assert.equal(digest(a.PHRASES.slice(0,legacy.phraseCount)),legacy.phraseSha256);
  assert.ok(a.PHRASES.length>legacy.phraseCount);
});

test('existing word IDs, practice records, selections and custom vocabulary survive migration and reload',()=>{
  const oldWord={id:'saved-canada',lessonId:1003,spanish:'soy de',english:"I'm from",pack:null,attempts:12,correct:10,level:4,dueAt:'2026-11-15T00:00:00.000Z',lastReviewedAt:'2026-10-29T00:00:00.000Z',mastered:false};
  const custom={...oldWord,id:'custom',spanish:'mi frase personal',english:'my personal phrase',attempts:5};
  const fixture={lessons:[{id:1003,title:'Old title',vocab:[oldWord,custom]}],selLessons:[7,1003],selPacks:['7::Numbers 100+'],phraseProgress:[{level:3,attempts:4,correct:3,dueAt:'2026-11-15T00:00:00.000Z'}],challengeProgress:[{correct:2,attempts:4}]};
  const {a,storage}=app(fixture);
  const migrated=a.state.lessons.find(l=>l.id===1003).vocab;
  assert.deepEqual(JSON.parse(JSON.stringify(migrated.find(w=>w.id===oldWord.id))),{...oldWord,note:''});
  assert.ok(migrated.some(w=>w.id==='custom'&&w.attempts===5));
  assert.ok(migrated.some(w=>w.spanish==='Canadá'));
  assert.equal(JSON.stringify(a.state.selLessons),JSON.stringify([7,1003]));
  assert.equal(a.state.selPacks[0],'7::Numbers 100+');
  assert.equal(a.state.phraseProgress[0].attempts,4);
  assert.equal(a.state.challengeProgress[0].correct,2);
  a.saveState();
  const restored=app(JSON.parse(storage.get(a.STORAGE_KEY))).a;
  assert.equal(restored.state.lessons.find(l=>l.id===1003).vocab.find(w=>w.id==='saved-canada').level,4);
});

test('E9 reuses every earlier core word and its current progress',()=>{
  const {a}=app();
  const early=a.state.lessons.filter(l=>l.course==='CBE'&&l.id<=1008).flatMap(l=>l.vocab.filter(w=>!w.pack));
  const known=early[0];known.attempts=7;known.level=3;
  const review=a.coreWords(1009);
  for(const word of early) assert.ok(review.includes(word));
  assert.equal(review.find(w=>w.id===known.id).level,3);
  assert.ok(review.some(w=>a.spanishKey(w.spanish)==='hablo un poco de español'));
  a.state.selLessons=[1001,1009];a.state.selPacks=[];
  const selected=a.selectedWords();
  assert.equal(new Set(selected.map(w=>w.id)).size,selected.length);
});

test('tu and tú and the comma in No, me llamo Mark keep their distinct meanings',()=>{
  const {a}=app();
  assert.ok(a.matchesAnswer('tu','tu'));assert.ok(!a.matchesAnswer('tú','tu'));
  assert.ok(a.matchesAnswer('tú','tú'));assert.ok(!a.matchesAnswer('tu','tú'));
  assert.ok(a.matchesAnswer('como estas','¿Cómo estás?'));
  assert.ok(a.matchesAnswer('No, me llamo Mark','No, me llamo Mark.'));
  assert.ok(!a.matchesAnswer('No me llamo Mark','No, me llamo Mark.'));
  assert.ok(!a.matchesAnswer('No, me llamo Mark','No me llamo Mark.'));
  const ep=a.state.lessons.find(l=>l.id===1004).vocab;
  assert.ok(ep.some(w=>w.spanish==='No me llamo Mark.'));
  assert.ok(ep.some(w=>w.spanish==='No, me llamo Mark.'));
});

test('typed meanings accept ordinary apostrophes and omit explanatory parenthetical labels',()=>{
  const {a}=app();
  assert.ok(a.matchesAnswer("I'm a teacher",'I’m a teacher (male speaker).'));
  assert.ok(a.matchesAnswer('you are','you are (identity / origin, informal)'));
  assert.ok(a.matchesAnswer('shop','shop / store'));
  assert.ok(a.matchesAnswer('store','shop / store'));
  assert.ok(!a.matchesAnswer('hotel','shop / store'));
});

test('all number groups remain available and include the missing 800 in the hundreds pack',()=>{
  const {a}=app();
  assert.equal(a.NUM_GROUPS.length,5);
  const hundreds=a.NUM_GROUPS.at(-1).pairs;
  for(const word of ['cien','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos','mil','un millón']) assert.ok(hundreds.some(([sp])=>sp===word),word);
  const numWords=a.state.lessons.find(l=>l.id===7).vocab.filter(w=>w.pack==='Numbers 100+');
  assert.ok(numWords.some(w=>w.spanish==='ochocientos'));
});

test('new vocabulary generates valid practice cards without losing its source ID',()=>{
  const {a}=app();
  const pool=a.state.lessons.filter(l=>l.course==='CBE').flatMap(l=>l.vocab);
  for(let pass=0;pass<6;pass++) for(let i=0;i<pool.length;i++) {
    const w={...pool[i],lessonTitle:'Coffee Break Spanish'};
    const c=a.buildCard(w,i,pool);
    assert.equal(c.id,w.id);assert.ok(c.answer);assert.ok(c.prompt);
    if(c.choices) assert.ok(c.choices.includes(c.answer));
  }
});
