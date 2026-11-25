import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const data = readFileSync(new URL('coffee-break-data.js', root), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map(m=>m[1]).join('\n').split('loadState(); saveState(); render();')[0];
const legacy = JSON.parse(readFileSync(new URL('legacy-indexes.json',import.meta.url),'utf8'));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function app(saved) {
  const storage = new Map(saved ? [['tmSpanish_v2',JSON.stringify(saved)]] : []);
  const ctx = vm.createContext({localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
  vm.runInContext(data+'\n'+script+`;render = () => {}; globalThis.api={COFFEE_BREAK_EPISODES,RAW,RAW_CBE,PHRASES,NUM_GROUPS,STORAGE_KEY,state,buildSeeded,loadState,saveState,coreWords,selectedWords,matchesAnswer,spanishKey,buildCard,matchesCardAnswer,buildPhraseQueue,episodePhrases,reviewWord,reviewPhrase,exportProgress,importProgress};`, ctx);
  ctx.api.loadState();
  return {a:ctx.api, storage};
}

test('every supplied note resolves to its episode’s vocabulary or phrase bank',()=>{
  const {a}=app();
  assert.equal(a.COFFEE_BREAK_EPISODES.reduce((sum,e)=>sum+e.notes.length,0),207);
  assert.equal(a.COFFEE_BREAK_EPISODES.length,15);
  for(const ep of a.COFFEE_BREAK_EPISODES) {
    const words=a.state.lessons.find(l=>l.id===1000+ep.episode).vocab;
    for(const note of ep.notes) {
      const forms = note.kind === 'phrase' ? a.episodePhrases.get(ep.episode).map(i=>a.PHRASES[i][0]) : words.map(w=>w.spanish);
      assert.ok(forms.some(sp=>a.spanishKey(sp)===a.spanishKey(note.spanish)), `E${ep.episode}: ${note.original}`);
    }
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
  assert.equal(digest(a.PHRASES.slice(0,130)), 'f45d8d27b24c26140108e2449ec01530f9519aa76b39aee2b8253d6188d9bfd2');
  assert.ok(a.PHRASES.length>130);
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

test('E9 has a focused 27-card bank and saved progress survives reload',()=>{
  const {a,storage}=app();
  const review=a.coreWords(1009);
  assert.equal(review.length,27);
  assert.ok(review.every(w=>w.lessonId===1009));
  assert.equal(new Set(review.map(w=>a.spanishKey(w.spanish))).size,27);
  assert.ok(review.some(w=>a.spanishKey(w.spanish)==='hablo un poco de español'));
  const early=a.coreWords(1001)[0];early.attempts=7;early.level=3;
  review[0].attempts=5;review[0].level=2;
  a.saveState();
  const restored=app(JSON.parse(storage.get(a.STORAGE_KEY))).a;
  assert.equal(restored.coreWords(1009).length,27);
  assert.equal(restored.coreWords(1009)[0].level,2);
  assert.equal(restored.coreWords(1001)[0].level,3);
  a.state.selLessons=[1009];a.state.selPacks=[];
  assert.equal(a.selectedWords().length,27);
  a.state.selLessons=[1001,1009];
  assert.equal(a.selectedWords().length,27+a.coreWords(1001).length);
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
  assert.equal(a.NUM_GROUPS.length,8);
  const hundreds=a.NUM_GROUPS.filter(g=>g.pack==='Numbers 100+').flatMap(g=>g.pairs);
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


test('a returning learner gets the strongest prior vocabulary history across both courses and packs',()=>{
  const old = app().a;
  const existing = (id,sp) => old.state.lessons.find(l=>l.id===id).vocab.find(w=>w.spanish===sp);
  const records = [[4,'restaurante'], [1007,'un restaurante'], [20,'siga todo recto'], [5,'una caña'], [7,'café']];
  for (const [i,[id,sp]] of records.entries()) {
    Object.assign(existing(id,sp), {attempts:8,correct:7,level:i===1?2:6,mastered:i!==1,
      lastReviewedAt:`2026-11-${20+i}T12:00:00Z`,dueAt:'2027-01-20T12:00:00Z'});
  }
  const oldLessons = old.state.lessons.filter(l => l.id < 1013);
  const {a,storage} = app({lessons:oldLessons,selLessons:[1013,1015],selPacks:['5::Drinks']});
  const word = (ep,sp) => a.coreWords(ep).find(w=>w.spanish===sp);
  for (const [id,sp] of [[1013,'el restaurante'],[1013,'Siga todo recto.'],[1015,'una caña'],[1015,'un café']]) {
    assert.equal(word(id,sp).level,6,sp);
    assert.equal(word(id,sp).dueAt,'2027-01-20T12:00:00Z');
  }
  assert.equal(word(1015,'un café con leche').attempts,0);
  assert.equal(a.selectedWords().filter(w=>w.spanish==='una caña').length,1);
  a.reviewWord(word(1013,'el restaurante').id,'again');
  for(const [id,sp] of [[4,'restaurante'],[1007,'un restaurante'],[1013,'el restaurante']]) {
    assert.equal(word(id,sp).level,5);
    assert.equal(word(id,sp).attempts,9);
  }
  const restored=app(JSON.parse(storage.get(a.STORAGE_KEY))).a;
  assert.equal(restored.coreWords(1013).find(w=>w.spanish==='el restaurante').level,5);
  assert.equal(restored.coreWords(4).find(w=>w.spanish==='restaurante').id,existing(4,'restaurante').id);
});

test('a legacy backup awards existing word mastery on import and can be reimported safely',()=>{
  const {a}=app();
  const oldWord=a.coreWords(20).find(w=>w.spanish==='el banco');
  const row={level:6,attempts:9,correct:8,mastered:true,lastReviewedAt:'2020-11-20T12:00:00Z',dueAt:'2027-01-20T12:00:00Z'};
  const backup={format:'spanish-practice-progress',version:1,words:{[JSON.stringify(['20',oldWord.spanish,oldWord.english])]:row},phrases:{},challenges:{}};
  a.importProgress(backup);
  let bank=a.coreWords(1013).find(w=>w.spanish==='el banco');
  assert.equal(bank.level,6);
  a.reviewWord(bank.id,'again');
  a.importProgress(backup);
  bank=a.coreWords(1013).find(w=>w.spanish==='el banco');
  assert.equal(bank.level,5);
  assert.equal(bank.attempts,10);
  const fresh=app().a;
  fresh.importProgress(a.exportProgress());
  assert.equal(fresh.coreWords(20).find(w=>w.spanish==='el banco').level,bank.level);
});

test('the episode phrase round uses the same phrase records as the full bank',()=>{
  const {a}=app();
  const pick=episodes=>{a.buildPhraseQueue(episodes);return [...a.state.phraseRev.queue];};
  const sets=[13,14,15].map(ep=>pick([ep]));
  assert.deepEqual(sets.map(s=>s.length),[4,7,3]);
  const allNew=pick([13,14,15]);
  assert.equal(new Set(allNew).size,14);
  assert.ok(allNew.every(i=>i>=130));
  assert.ok(!a.coreWords(1014).some(w=>w.spanish==='¿Hay un bar por aquí?'));
  const phrase=sets[1][0];
  a.reviewPhrase(phrase,'got');
  a.reviewPhrase(phrase,'got');
  assert.ok(a.state.phraseProgress[phrase].mastered);
  assert.equal(pick([14]).length,6);
  assert.ok(!pick([]).includes(phrase));
  assert.equal(pick([15]).length,3);
});

test('new English noun cards accept an omitted article while Spanish dictation checks the spoken form',()=>{
  const {a}=app();
  const museum=a.coreWords(1013).find(w=>w.spanish==='el museo');
  assert.ok(a.matchesCardAnswer('museum',{...museum,ex:'typed',answer:museum.english}));
  assert.ok(!a.matchesCardAnswer('museo',{...museum,ex:'dictation',answer:museum.spanish}));
});
