const assert=require('node:assert/strict');
const {COURSE,RULE_QUIZZES,spellingMatch,sentenceMatch,sumMatch,balanced}=require('../data.js');
assert.equal(COURSE.length,11);assert.equal(COURSE.reduce((n,m)=>n+m.days,0),29);
function expandMap(gs){let out='';let final='';for(const g of gs){if(g.includes('…')){const[a,b]=g.split('…');out+=a;final=b;}else out+=g;}return out+final;}
for(const m of COURSE){
 assert(m.words.length>35,m.id+' has a full bank');assert.equal(new Set(m.words.map(w=>w.word)).size,m.words.length,m.id+' has no duplicates');
 for(const w of m.words){assert(/^[a-z]+$/i.test(w.word),w.word);assert(w.c>=0&&w.c<m.categories.length);if(m.type==='morphology')assert(w.base);}
 const quiz=RULE_QUIZZES[m.id];assert(quiz.options[quiz.correct]);
 if(m.type==='phonics'){
  assert.equal(m.maps.length,15);assert.equal(m.analogies.length,5);assert.equal(m.sentences.length,3);
  for(const q of m.maps){assert.equal(expandMap(q.graphemes),q.word,'Map spells '+q.word);assert(q.context.includes('____'));assert(q.graphemes.length>=2);}
  for(const q of m.analogies)assert(q.a&&q.b&&q.c&&q.answer&&q.why);
 }else{assert.equal(m.sums.length,7);assert(m.build.length>=7);assert(m.build.every(Boolean));for(const q of m.sums){assert(sumMatch(q.parts.join(' + '),q.parts));assert(!sumMatch(q.word,q.parts));}}
 for(let d=0;d<m.days;d++){const bank=balanced(m,m.type==='phonics'?10:16,d*5);assert.equal(new Set(bank.map(w=>w.word)).size,bank.length);assert.equal(new Set(bank.map(w=>w.c)).size,m.categories.length);}
}
const get=id=>COURSE.find(m=>m.id===id);const group=(id,word)=>get(id).words.find(w=>w.word===word).c;
assert.equal(group('final-k','muck'),0);assert.equal(group('final-k','neck'),0);assert.equal(group('final-k','milk'),1);
assert.equal(group('final-j','unhinge'),1);assert.equal(group('final-ch','much'),1);
assert.equal(group('sound-g','gift'),1);assert.equal(group('sound-g','get'),1);assert.equal(group('sound-g','gem'),0);
assert(!get('ed').words.some(w=>w.base==='slide'));
for(const [id,base,word] of [['ed','play','played'],['ed','admit','admitted'],['ed','open','opened'],['ing','party','partying'],['ing','open','opening'],['plurals','city','cities'],['plurals','donkey','donkeys'],['plurals','quiz','quizzes'],['ly','gentle','gently'],['ly','tragic','tragically']])assert(get(id).words.some(w=>w.base===base&&w.word===word));
assert(spellingMatch('  HAPPILY ','happily'));assert(!spellingMatch('happilly','happily'));
assert(sentenceMatch('The cat sat.','the cat sat!'));assert(!sentenceMatch('The cats sat.','The cat sat.'));
assert(sumMatch(' GENTLE + ly ','gentle ly'.split(' ')));assert(!sumMatch('gent + ly',['gentle','ly']));
console.log('PASS: 11 topics, 29 days, '+COURSE.reduce((n,m)=>n+m.words.length,0)+' bank entries, 105 explicit sound maps; exception keys and answer normalization verified.');


const workbook=require('../workbook.js');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'..');
const audio=vm.runInNewContext(fs.readFileSync(path.join(assets,'audio-index.js'),'utf8')+'; AUDIO_RANGES');
for(const topic of COURSE){
  const lesson=workbook.LESSONS[topic.id], clips=audio[topic.id];
  assert(lesson.groups.length>=2&&lesson.groups.length<=4);
  const hasClip=text=>assert(clips[text]&&clips[text][0]>=0&&clips[text][1]>clips[text][0],topic.id+' missing pronunciation for '+text);
  for(const group of lesson.groups){const list=group.split(' ');list.forEach(hasClip);hasClip(list.join('. ')+'.');}
  assert(fs.statSync(path.join(assets,'assets/audio',topic.id+'.mp3')).size>0);
  for(let day=1;day<=topic.days;day++){
    const sequence=workbook.activities(topic,day);
    assert.equal(sequence.length,new Set(sequence).size);
    if(sequence.includes('sort')){
      const list=workbook.sortItems(topic.id,day),labels=workbook.sortLabels(topic.id,day);
      assert.equal(new Set(list.map(i=>i.group)).size,labels.length);
      assert.equal(new Set(list.map(i=>i.word)).size,list.length);
      for(const item of list)assert(labels[item.group]&&item.word);
    }
    if(sequence.includes('spell')){
      const items=workbook.spellingItems(topic,day);assert.equal(items.length,5);
      for(const item of items){assert.equal(item.boxes.join(''),item.word);hasClip(item.word);}
    }
    if(sequence.includes('analogy'))for(const pair of workbook.pairs(topic))assert.equal(pair.length,4);
  }
}
assert.deepEqual(workbook.spellingItems(COURSE[0],1).map(x=>x.word),['spike','flame','stoke','bride','grim']);
assert.deepEqual(workbook.activities(COURSE[0],1),['pattern','sort','spell']);
console.log('PASS: workbook sequence, sorting keys, sound-box spellings and bundled audio coverage for all 29 days.');
