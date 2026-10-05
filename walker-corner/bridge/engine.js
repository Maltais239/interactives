(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.BridgeLab=factory();})(typeof window!=='undefined'?window:this,function(){
'use strict';
const types={beam:{name:'Beam',base:42,cost:0},truss:{name:'Truss',base:85,cost:18},arch:{name:'Arch',base:95,cost:24},suspension:{name:'Suspension',base:100,cost:45}};
const materials={timber:{name:'Timber',factor:1,cost:2.5,weight:1},steel:{name:'Structural steel',factor:1.55,cost:6,weight:2},concrete:{name:'Reinforced concrete',factor:1.25,cost:4,weight:3},prestressed:{name:'Prestressed concrete',factor:1.5,cost:5,weight:2.5}};
const scenarios=[{name:'Across the creek',span:20,load:40,wind:0,budget:90},{name:'A wider valley',span:50,load:70,wind:15,budget:210},{name:'Windy crossing',span:60,load:75,wind:30,budget:240}];
const fields=['type','material','span','load','wind','bracing','anchors','pier'];
function validate(d){return types[d.type]&&materials[d.material]&&[d.span,d.load,d.wind].every(Number.isFinite)&&d.span>=10&&d.span<=80&&d.load>=0&&d.load<=120&&d.wind>=0&&d.wind<=50&&['bracing','anchors','pier'].every(k=>typeof d[k]==='boolean');}
// Intentionally simplified classroom model. All quantities are relative units.
// The formula is shown in the teacher notes; it is not a structural calculation.
function calculate(d){if(!validate(d))throw Error('Invalid bridge design.');const t=types[d.type],m=materials[d.material];const unsupported=d.span/(d.pier?2:1);const anchor=d.anchors?(d.type==='arch'?1.35:d.type==='suspension'?1.3:1.08):1;const windFactor=1/(1+d.wind/(d.type==='suspension'?75:150));const selfWeight=m.weight*d.span*.16;const capacity=Math.max(5,Math.round(t.base*m.factor*(d.bracing?1.2:1)*anchor*30/unsupported*windFactor-selfWeight));const cost=Math.round(12+m.cost*d.span*.5+t.cost+(d.bracing?12:0)+(d.anchors?15:0)+(d.pier?30:0));return {capacity,cost,unsupported,margin:capacity-d.load,meetsLoad:capacity>=d.load};}
function changed(a,b){return fields.filter(k=>a[k]!==b[k]);}
function meetsScenario(d,result,s){return d.span===s.span&&d.load===s.load&&d.wind===s.wind&&result.meetsLoad&&result.cost<=s.budget;}
return {types,materials,scenarios,fields,validate,calculate,changed,meetsScenario};
});
