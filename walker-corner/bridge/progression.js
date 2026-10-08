/* Sequential classroom challenges. Legacy work remains available in Free build. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BridgeProgression=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=1;
  const levels=[
    {id:'first',name:'Car',vehicle:'car',minLoad:10,budget:1100,text:'Build supports under or above your road. Get the 10-unit car across for $1,100 or less.'},
    {id:'supply',name:'Pickup',vehicle:'truck',minLoad:25,budget:1400,text:'Your next load is the 25-unit pickup. Keep your bridge and strengthen it for this crossing.'},
    {id:'trailerTrial',name:'Pickup + trailer',vehicle:'trailer',minLoad:37.5,budget:1500,text:'Carry the 37.5-unit pickup and loaded trailer. Its three axles spread the load across your bridge.'},
    {id:'school',name:'School bus',vehicle:'bus',minLoad:45,budget:1900,text:'Carry the 45-unit school bus. Watch for the pieces that need reinforcement.'},
    {id:'heavy',name:'Freight semi',vehicle:'semi',minLoad:60,budget:1900,text:'The 60-unit freight semi is ready. Can your design handle its five axle loads?'},
    {id:'tankerTrial',name:'Tanker semi',vehicle:'tanker',minLoad:75,budget:2100,text:'Carry the 75-unit tanker semi. Balance extra strength with the cost of your materials.'},
    {id:'tankTrial',name:'Tank',vehicle:'tank',minLoad:90,budget:2200,text:'The final crossing: a 90-unit tank. Its tracks spread the weight, but your bridge must be strong.'}
  ];
  const challenges=Object.fromEntries(levels.map((level,index)=>[level.id,{...level,index}]));
  challenges.sandbox={name:'Free build',vehicle:null,budget:Infinity,text:'Choose any vehicle and build your own experiment. Bridge examples are guides to look at; build the supports yourself.'};
  const levelIndex=id=>levels.findIndex(level=>level.id===id);
  function readProgress(value){return {version:VERSION,completed:value?.version===VERSION&&Number.isInteger(value.completed)&&value.completed>=0&&value.completed<=levels.length?value.completed:0};}
  function isUnlocked(id,progress){const index=levelIndex(id);return id==='sandbox'||index>=0&&index<=Math.min(readProgress(progress).completed,levels.length-1);}
  function nextFor(id){const index=levelIndex(id);return index<0?null:levels[index+1]?.id||'sandbox';}
  function recordWin(progress,id,result){
    const updated=readProgress(progress),index=levelIndex(id),level=levels[index];
    const earned=Boolean(level&&isUnlocked(id,updated)&&result.pass===true&&result.vehicle===level.vehicle&&result.loadPercent===100&&Number.isFinite(result.cost)&&result.cost>=0&&result.cost<=level.budget);
    if(earned&&index===updated.completed)updated.completed++;
    return {progress:updated,earned,next:earned?nextFor(id):null};
  }
  function bootstrap(saved,road){
    const progress=readProgress(saved?.progress),current=Boolean(saved?.progress?.version===VERSION);
    const challenge=current&&isUnlocked(saved.challenge,progress)?saved.challenge:'first',level=challenges[challenge];
    return {
      progress,challenge,members:current?saved.members:road,bridgeType:current?saved.bridgeType||'custom':'custom',
      vehicle:challenge==='sandbox'?saved.vehicle:level.vehicle,loadPercent:challenge==='sandbox'?saved.loadPercent||100:100,wind:current?saved.wind||0:0,
      campaignDraft:current?saved.campaignDraft||null:null,
      freeBuildDraft:current?saved.freeBuildDraft||null:saved?{members:saved.members,bridgeType:saved.bridgeType||'custom',vehicle:saved.vehicle,loadPercent:saved.loadPercent||100,wind:saved.wind||0,challenge:'sandbox'}:null
    };
  }
  return {VERSION,levels,challenges,levelIndex,readProgress,isUnlocked,nextFor,recordWin,bootstrap};
});
