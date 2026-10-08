const assert=require('node:assert/strict');
const E=require('../engine.js');
const truss=E.starter('truss'),frame=E.starter('frame'),beam=E.starter('beam');
const truck=E.scan(truss,'truck'),plain=E.scan(beam,'truck'),unbraced=E.scan(frame,'truck');
assert(truck.pass,'Braced wood starter must carry the truck');
assert(!plain.pass&&plain.reason==='sag','Unbraced road must sag under the truck');
assert(!unbraced.pass&&unbraced.maxStress>truck.maxStress,'Triangles must improve capacity versus the same frame without diagonals');
assert(truck.maxDeflection<unbraced.maxDeflection/2,'Bracing must reduce deck bending');
assert(!E.scan(truss,'bus').pass,'A heavier bus must exceed the basic wood truss capacity');
const upgraded=truss.map(m=>m.type==='wood'&&(m.a.x===E.LEFT||m.b.x===E.RIGHT||(m.a.y===166&&m.b.y===166))?{...m,type:'steel'}:m);
assert(E.scan(upgraded,'bus').pass,'Steel at the compressed end struts and upper chord must carry the bus');
assert(E.cost(upgraded)>E.cost(truss),'Steel reinforcement must increase cost');
assert.equal(E.scan(truss.filter(m=>m!==truss[3]),'truck').reason,'gap','Missing deck segment must fail continuity');
assert.deepEqual(E.roadGaps(truss),[],'The complete starter must have no missing Road');
assert.deepEqual(E.roadGaps(truss.filter((m,i)=>![0,3,7].includes(i))).map(g=>g.section),[1,4,8],'Report the actual missing Road sections, including both banks');
assert(E.roadComplete(beam.map(m=>({...m,a:m.b,b:m.a}))),'Road endpoint order must not change continuity');
const woodDeck=beam.map(m=>({...m,type:'wood'}));
assert.equal(E.roadGaps(woodDeck).length,8,'Wood along the deck is bracing, not the driving surface');
assert.equal(E.roadGaps(beam.map((m,i)=>i===3?{...m,a:{...m.a,y:166},b:{...m.b,y:166},type:'steel'}:m))[0].section,4,'An overhead steel beam must not fill a Road gap');
const incomplete=E.prepare(truss.filter(m=>m!==truss[3]));
assert(!incomplete.complete&&incomplete.gaps.length===1&&incomplete.gaps[0].a.x===516&&incomplete.gaps[0].b.x===600,'Prepared model must identify the reached gap for feedback');
const floating={a:{x:432,y:334},b:{x:516,y:334},type:'wood'};
assert.equal(E.scan([...truss,floating],'truck').reason,'unstable','Unsupported island must not be given fake capacity');
assert.throws(()=>E.validate([...truss,truss[0]]),/already a piece/);
assert.throws(()=>E.validate([{a:{x:264,y:250},b:{x:432,y:250},type:'road'}]),/neighbouring/);
assert.throws(()=>E.validate([{a:{x:265,y:250},b:{x:348,y:250},type:'wood'}]),/grid/);
assert.throws(()=>E.validate([{a:{x:264,y:250},b:{x:264,y:250},type:'wood'}]),/different/);
const model=E.prepare(truss),a=E.solve(model,'truck',600),b=E.solve(model,'truck',600);
assert.deepEqual(a.displacements,b.displacements,'Repeated conditions must give identical results');
assert(Math.abs(a.displacements[model.map.get('264,250')*3+1])<1e-9,'Bank supports must remain fixed');
const wind=E.scan(truss,'truck',28);assert(wind.maxStress>truck.maxStress,'Wind must alter the solved forces');
const light=E.scan(truss,'truck',0,50),heavy=E.scan(truss,'truck',0,150);
assert(light.pass&&!heavy.pass&&heavy.maxStress>truck.maxStress&&truck.maxStress>light.maxStress,'The same truss must reach its strength limit as load increases');
assert.equal(E.loadFor('truck',150),37.5,'Cargo percentage must scale the actual moving axle load');
assert.equal(E.loadFor('bus',200),90,'Legacy bus load scaling must remain reproducible');
assert.throws(()=>E.loadFor('truck',201),/50% to 200%/);
assert.throws(()=>E.loadFor('truck',NaN),/50% to 200%/);
const starters=['girder','truss','arch','suspension'];
for(const type of starters){assert.equal(E.inferType(E.validate(E.starter(type))),type,'Recognize the structural features of '+type);}
assert(!E.matchesType(beam,'truss')&&!E.matchesType(beam,'arch')&&!E.matchesType(beam,'suspension'),'A road alone must not earn a bridge-type challenge');
assert(E.scan(E.starter('girder'),'truck').pass,'Steel beam starter must carry the standard truck');
assert(E.scan(E.starter('arch'),'truck',0,150).pass,'Steel arch starter must carry the heavy-haul load');
const suspension=E.starter('suspension'),suspended=E.scan(suspension,'car');
assert(suspended.pass,'The braced suspension starter must carry the standard car');
assert(!E.scan(suspension,'truck').pass,'The suspension starter must need reinforcement for a heavier truck');
const noBackstays=suspension.filter(m=>!(m.type==='cable'&&(m.a.x===E.LEFT||m.b.x===E.RIGHT)));
const unanchored=E.scan(noBackstays,'car');
assert(!unanchored.pass&&unanchored.maxDeflection>suspended.maxDeflection,'Removing bank-anchored backstays must reduce suspension capacity');
assert(!E.matchesType(noBackstays,'suspension'),'Suspension challenge must require its bank anchors');
const cableModel=E.prepare(suspension),cable=cableModel.cables[0],shortened=new Float64Array(cableModel.N);
shortened[cable.ib*3]=-cable.c*cable.L*.02;shortened[cable.ib*3+1]=-cable.s*cable.L*.02;
const slack=E.cableResponse(cable,shortened);
assert.equal(slack.axial,0,'A shortened cable must have no compression force');
assert(slack.force.every(f=>f===0)&&slack.tangent.every(row=>row.every(k=>k===0)),'A slack cable must contribute neither force nor stiffness');
const stretched=new Float64Array(cableModel.N);stretched[cable.ib*3]=cable.c*cable.L*.01;stretched[cable.ib*3+1]=cable.s*cable.L*.01;
const taut=E.cableResponse(cable,stretched);
assert(taut.active&&taut.axial>0&&Math.abs(taut.force[0]+taut.force[2])<1e-10&&Math.abs(taut.force[1]+taut.force[3])<1e-10,'A stretched cable must pull equally at both ends');
const cableRun=E.solve(cableModel,'car',600);
assert(!cableRun.unstable&&cableRun.stress.filter((_,i)=>cableModel.elements[i].m.type==='cable').every(s=>s.axial>=0&&s.moment===0),'Cable results must have tension or slack, and no bending');
let supportReaction=0,bankWeight=0;
for(const [i,p]of cableModel.nodes.entries())if(p.y===E.DECK&&(p.x===E.LEFT||p.x===E.RIGHT)){
  supportReaction+=cableModel.K[i*3+1].reduce((sum,k,j)=>sum+k*cableRun.displacements[j],0);
  for(const el of cableModel.cables){const cr=E.cableResponse(el,cableRun.displacements);for(let j=0;j<4;j++)if(cr.dofs[j]===i*3+1)supportReaction+=cr.force[j];}
  for(const m of suspension)if(E.key(m.a)===E.key(p)||E.key(m.b)===E.key(p))bankWeight+=E.materials[m.type].weight*E.length(m)/2;
}
const totalWeight=suspension.reduce((sum,m)=>sum+E.materials[m.type].weight*E.length(m),0);
assert(Math.abs(supportReaction+bankWeight-totalWeight-E.vehicles.car.load)<1e-4,'Suspension support reactions must balance the vehicle and bridge weight');
const legacy={format:'bridge-test-lab',version:1,members:truss,challenge:'supply',vehicle:'truck',wind:0};
assert.equal(E.readDesign(legacy).loadPercent,100,'Old saved designs must retain their original load');
const modern={...legacy,version:2,members:suspension,bridgeType:'suspension',vehicle:'car',loadPercent:150};
assert.equal(E.readDesign(JSON.parse(JSON.stringify(modern))).loadPercent,150,'New export/import must preserve cargo load');
assert.equal(E.readDesign(modern).bridgeType,'suspension','New export/import must preserve the bridge design');
assert.throws(()=>E.readDesign({...modern,loadPercent:0}),/invalid test settings/);
assert.throws(()=>E.readDesign({...modern,loadPercent:55}),/invalid test settings/);
assert.throws(()=>E.readDesign({...modern,vehicle:'airplane'}),/invalid test settings/);
assert.throws(()=>E.readDesign({...modern,bridgeType:'unknown'}),/invalid test settings/);
// Fleet load paths: each axle/track contact contributes its share of the total weight.
for(const [vehicle,v]of Object.entries(E.vehicles)){
  const axles=E.axlesFor(vehicle);
  assert(Math.abs(axles.reduce((sum,a)=>sum+a[1],0)-1)<1e-12,'Contact loads must sum to the total weight for '+vehicle);
  assert(axles.every(([x,f])=>Math.abs(x)<v.width/2&&f>0),'Load contacts must sit inside the vehicle for '+vehicle);
  const run=E.solve(model,vehicle,600);let reactions=0,bankWeight=0;
  for(const [i,p]of model.nodes.entries())if(p.y===E.DECK&&(p.x===E.LEFT||p.x===E.RIGHT)){
    reactions+=model.K[i*3+1].reduce((sum,k,j)=>sum+k*run.displacements[j],0);
    for(const m of truss)if(E.key(m.a)===E.key(p)||E.key(m.b)===E.key(p))bankWeight+=E.materials[m.type].weight*E.length(m)/2;
  }
  const bridgeWeight=truss.reduce((sum,m)=>sum+E.materials[m.type].weight*E.length(m),0);
  assert(Math.abs(reactions+bankWeight-bridgeWeight-v.load)<1e-6,'Bank reactions must balance every vehicle weight for '+vehicle);
}
assert(E.scan(E.starter('arch'),'trailer').pass,'The arch mission must carry the pickup and trailer');
assert(E.scan(E.starter('girder'),'semi').pass,'The steel beam must carry the freight semi');
assert(!E.scan(truss,'semi').pass,'The wood starter must need strengthening for a semi');
const steelTruss=truss.map(m=>m.type==='wood'?{...m,type:'steel'}:m);
assert(E.scan(steelTruss,'tank').pass&&E.cost(steelTruss)<=2200,'The tank mission must be achievable under budget by reinforcing the truss');
const fleetFile={...modern,version:3,vehicle:'tanker',loadPercent:100};
assert.equal(E.readDesign(fleetFile).vehicle,'tanker','Version 3 must preserve the selected fleet vehicle');
console.log(JSON.stringify({checks:76,vehicles:Object.keys(E.vehicles).length,originalTruck:truck.pass,suspensionCar:suspended.pass,semiOnWood:E.scan(truss,'semi').pass,tankOnSteel:E.scan(steelTruss,'tank').pass},null,2));
