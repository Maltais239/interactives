// Run with: node geography-shared/repair-tests.cjs (from repository root).
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const canada = JSON.parse(fs.readFileSync(path.join(__dirname, 'canada.geojson')));
const civil = JSON.parse(fs.readFileSync(path.join(root, 'curriculum_civilizations.geojson')));
function element() {
  return {style:{}, disabled:true, textContent:'', innerHTML:'', classList:{add(){},remove(){}},
    addEventListener(){}, setAttribute(){}};
}
async function boot(name, data, fail = false) {
  const elements = new Map();
  const map = {layers:new Set(),setView(){return this;},fitBounds(){return this;},on(){return this;},
    hasLayer(l){return this.layers.has(l);},removeLayer(l){this.layers.delete(l);},addLayer(l){this.layers.add(l);}};
  const context = vm.createContext({console, document:{getElementById(id){
    if(!elements.has(id)) elements.set(id, element()); return elements.get(id);
  },querySelectorAll(){return []; }}, addSchoolBasemap(){},
    L:{map(){return map;},Browser:{},DomEvent:{stopPropagation(){}},geoJson(d, options){
      const layers=d.features.map(feature=>({feature,setStyle(){return this;},bringToFront(){},getBounds(){return {};},
        addTo(m){m.layers.add(this);return this;},on(){},bindPopup(){}}));
      const group={addTo(m){layers.forEach(l=>m.layers.add(l));return this;},resetStyle(){},getBounds(){return {};},
        eachLayer(fn){layers.forEach(fn);},toGeoJSON(){return d;}};return group;
    }},fetch:async()=>({ok:!fail,json:async()=>data}),setTimeout});
  const source=fs.readFileSync(path.join(root,name,'index.html'),'utf8');
  for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if(!match[1].includes('src=')) vm.runInContext(match[2],context,{filename:name});
  }
  await new Promise(resolve=>setImmediate(resolve));
  return {run:code=>vm.runInContext(code,context), elements, map};
}
(async()=>{
  assert.equal(canada.features.length,13);
  assert.equal(new Set(canada.features.map(f=>f.properties.name)).size,13);
  for(const name of ['canada-map-challenge','Canadiangeographyhub']) {
    const app=await boot(name,canada), run=app.run;
    if(name==='Canadiangeographyhub') run("setMode('quiz')");
    run("checkAnswer('Never a province')");
    assert.equal(run('correctlyGuessedProvinces.length'),0);
    run('showHint()');assert.equal(run('currentHintIndex'),1);
    run('for(let i=0;i<8;i++)showHint()');assert.equal(app.elements.get('hint-btn').disabled,true);
    for(let i=0;i<13;i++) {
      if(name==='Canadiangeographyhub') {
        const answer=run('currentQuestion.answer');
        run("setMode('explore');setMode('quiz')");
        assert.equal(run('currentQuestion.answer'),answer,'Mode switch must preserve every question, including the last');
        assert.equal(run('correctlyGuessedProvinces.length'),i);
      }
      run('checkAnswer(currentQuestion.answer)');
      run("checkAnswer('Alberta')"); // A completed question cannot score twice.
      assert.equal(run('correctlyGuessedProvinces.length'),i+1);
      run('loadNewQuestion()');
    }
    assert.equal(app.elements.get('play-again-btn').style.display,'block');
    if(name==='Canadiangeographyhub') {
      run("setMode('explore');setMode('quiz')");
      assert.equal(run('currentQuestion'),null,'Completed rounds stay completed until Play Again');
    }
    run(name==='Canadiangeographyhub'?'resetQuiz()':'resetGame()');
    assert.equal(run('correctlyGuessedProvinces.length'),0);
    assert.equal(run('availableQuestions.length'),12);
    const failed=await boot(name,canada,true);
    failed.run('showHint()'); // Loading failures must not crash hint controls.
    assert.equal(failed.elements.get('hint-btn').disabled,true);
    console.log(name+': wrong/correct answers, hints, 13 questions, mode persistence, completion, restart and failed data load passed.');
  }
  const app=await boot('ancientcivilizations',civil);
  for(const feature of civil.features) {
    app.run(`showCivilization(${JSON.stringify(feature.properties.id)},true)`);
    assert.ok(app.elements.get('info-content').innerHTML.includes(feature.properties.name));
  }
  app.run("clearFocus();activeFilter='african';applyVisibility()");
  assert.equal(app.map.layers.size,civil.features.filter(f=>f.properties.category==='african').length);
  app.run("activeFilter='all';applyVisibility()");assert.equal(app.map.layers.size,33);
  console.log('Civilizations: all 33 regions open details; category filters and return-to-all passed.');
  const trade=fs.readFileSync(path.join(root,'Charbonneaumapyouknow/index.html'),'utf8');
  const dataCode=trade.slice(trade.indexOf('const civilizations ='),trade.indexOf('// --- Components ---'));
  const appBody=trade.slice(trade.indexOf('const App = () => {')+'const App = () => {'.length);
  const logic=appBody.slice(0,appBody.search(/return \(\s*<div/));
  const state=[], context=vm.createContext({React:{},useEffect(){},useRef(){return {current:null};},useState(initial){
    const i=context.hookIndex++;if(!(i in state))state[i]=initial;
    return [state[i], value=>{state[i]=typeof value==='function'?value(state[i]):value;}];
  }});
  vm.runInContext(dataCode+`\nfunction render(){hookIndex=0;${logic}\nreturn {handleAnswer,nextQuestion,quizIdx,score,showResult,selectedAnswer,quizCompleted};}`,context);
  const run=code=>vm.runInContext(code,context);
  run('var view=render();view.handleAnswer(quizQuestions[0].answer);view=render();view.handleAnswer(quizQuestions[0].answer);view=render()');
  assert.equal(run('view.score'),1,'An answered question cannot score twice');
  run("view.nextQuestion();view=render();view.handleAnswer('wrong');view=render()");
  assert.equal(run('view.score'),1);assert.equal(run('view.selectedAnswer'),'wrong');
  run('view.nextQuestion();view=render();while(!view.quizCompleted){view.handleAnswer(quizQuestions[view.quizIdx].answer);view=render();view.nextQuestion();view=render();}');
  assert.equal(run('view.score'),14);assert.equal(run('view.quizCompleted'),true);
  console.log('Trade routes: correct/incorrect feedback state, score guard, all 15 questions and completion passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
