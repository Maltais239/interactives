import test from 'node:test';
import assert from 'node:assert/strict';
import {entries,sourceCoverage,sourceNotes,numberEs,moneyEs,numberStages} from '../content.js';
import {initialState,sanitizeState,matchesEntry,record,stat,status,wordQueue,numberFromText,stageValue,missions,taxiTurns,normalize} from '../engine.js';
test('every supplied note is mapped, with unique canonical entry IDs',()=>{
 const ids=new Set(entries.map(e=>e.id));assert.equal(ids.size,entries.length);
 assert.equal(sourceCoverage.length,sourceNotes.reduce((n,row)=>n+row.length-1,0));
 for(const c of sourceCoverage)for(const id of c.ids)assert.ok(ids.has(id),c.raw+' missing '+id);
 const tu=sourceCoverage.find(c=>c.raw==='tu vs tú');assert.equal(tu.ids.length,2);assert.notEqual(tu.ids[0],tu.ids[1]);
 for(let ep=1;ep<=8;ep++)assert.ok(sourceCoverage.some(c=>c.episode===ep));
});
test('all numbers 0–100 have a separate bank entry',()=>{
 for(let n=0;n<=100;n++){const e=entries.find(e=>e.kind==='number'&&e.number===n);assert.ok(e,'Missing '+n);assert.equal(e.es,numberEs(n));}
 for(let n=100;n<=1000;n+=100)assert.ok(entries.some(e=>e.number===n));
});
test('Spanish number generation and parsing round-trip across ranges',()=>{
 for(let n=0;n<=1000;n++)assert.equal(numberFromText(numberEs(n)),n);
 for(let i=0;i<1200;i++){const n=(i*7927)%1000001;assert.equal(numberFromText(numberEs(n)),n);assert.equal(numberFromText(moneyEs(n)),n);}
 assert.equal(numberEs(500),'quinientos');assert.equal(numberEs(700),'setecientos');assert.equal(numberEs(900),'novecientos');
 assert.equal(numberEs(100),'cien');assert.equal(numberEs(101),'ciento uno');assert.equal(numberEs(1000),'mil');
 assert.equal(numberEs(21000),'veintiún mil');assert.equal(moneyEs(21),'veintiún pesos');assert.equal(moneyEs(1),'un peso');assert.equal(moneyEs(1000000),'un millón de pesos');
 assert.throws(()=>numberEs(-1));assert.throws(()=>numberEs(1.5));assert.throws(()=>numberEs(1000001));
});
test('prices accept digits, punctuation, or Spanish, and reject invalid sums',()=>{
 assert.equal(numberFromText('1,250'),1250);assert.equal(numberFromText('$250'),250);assert.equal(numberFromText('Son doscientos cincuenta pesos.'),250);
 for(const invalid of ['dos dos','cien cien','not a number','fifty','-50','1000001',''])assert.equal(numberFromText(invalid),null,invalid);
});
test('accents are supportive except where tu / tú changes meaning',()=>{
 const where=entries.find(e=>e.es==='¿Dónde vives?');assert.ok(matchesEntry('donde vives',where));
 const yours=entries.find(e=>e.id==='es-tu'),you=entries.find(e=>e.id==='es-tu-pronoun');
 assert.ok(matchesEntry('tu',yours));assert.ok(!matchesEntry('tú',yours));assert.ok(matchesEntry('tú',you));assert.ok(!matchesEntry('tu',you));
});
test('recognition does not imply recall, hearing, or sentence use',()=>{
 const s=initialState(),id=entries[0].id;record(s,id,'recognize',true,{now:1000000000});assert.equal(stat(s,id,'recall').attempts,0);assert.equal(status(s,id),'learning');
 record(s,id,'recall',true,{now:1000000000});assert.equal(status(s,id),'independent');
});
test('hints and retries cannot count as independent success',()=>{
 const s=initialState(),id=entries[0].id;record(s,id,'recall',false,{now:1000000000});const p=record(s,id,'recall',true,{assisted:true,now:1000001000});
 assert.equal(p.independent,0);assert.equal(p.streak,0);assert.equal(p.interval,0);assert.equal(p.due,1000601000);
});
test('remembered-later status requires practice on separate days',()=>{
 const s=initialState(),id=entries[0].id;const start=20000*86400000+10000;
 for(const a of ['recall','listen','use']){record(s,id,a,true,{now:start});record(s,id,a,true,{now:start+5000});assert.equal(stat(s,id,a).streak,1);}
 assert.notEqual(status(s,id),'retaining');
 for(const a of ['recall','listen','use'])record(s,id,a,true,{now:start+86400000});assert.equal(status(s,id),'retaining');
});
test('review queue reserves unseen coverage while revisiting due entries',()=>{
 const s=initialState(),its=entries.filter(e=>e.kind!=='number').slice(0,30);
 its.slice(0,15).forEach(e=>record(s,e.id,'recall',false,{now:1000}));
 const q=wordQueue(s,its,{limit:12,now:1000000});assert.equal(q.length,12);assert.equal(new Set(q.map(x=>x.entry.id)).size,12);
 assert.ok(q.filter(x=>x.new).length>=4);assert.ok(q.some(x=>!x.new));
});
test('backup restores custom entry identities and separate skill progress',()=>{
 const s=initialState();s.custom=[{id:'custom-123-0',es:'Hasta mañana.',en:'See you tomorrow.'}];record(s,'custom-123-0','recall',true);
 const restored=sanitizeState(JSON.parse(JSON.stringify(s)));assert.equal(restored.custom[0].id,'custom-123-0');assert.equal(restored.progress['custom-123-0'].recall.correct,1);assert.throws(()=>sanitizeState({schema:4}));
});
test('all number stages generate amounts in their ranges',()=>{
 for(const stage of numberStages)for(const r of [0,.1,.49,.999999]){const n=stageValue(stage,()=>r);assert.ok(n>=stage.min&&n<=stage.max);assert.equal((n-stage.min)%stage.step,0);}
});
test('guided conversations accept several valid details and identify key repairs',()=>{
 const hello=missions.find(m=>m.id==='hello').turns;
 assert.ok(hello[0].accept(normalize('Me llamo Ana.')));assert.ok(hello[1].accept(normalize('Soy de México.')));assert.ok(hello[2].accept(normalize('Vivo en Madrid.')));assert.ok(!hello[2].accept(normalize('Soy en Madrid.')));
 const taxi=taxiTurns(250);assert.ok(taxi[0].accept(normalize('¿Cuánto cuesta?')));assert.ok(taxi[1].accept('250'));assert.ok(!taxi[1].accept('350'));assert.ok(taxi[2].accept(normalize('¿Doscientos cincuenta?')));
 const family=missions.find(m=>m.id==='family').turns;assert.ok(family[1].accept(normalize('Esta es mi madre.')));assert.ok(!family[1].accept(normalize('Este es mi madre.')));
});
