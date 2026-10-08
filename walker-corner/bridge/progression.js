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
    {id:'tankTrial',name:'Tank',vehicle:'tank',minLoad:90,budget:2200,text:'Carry the 90-unit tank. Its tracks spread the weight, but your bridge must be strong.'},
    {id:'efficientTruss',name:'Efficient truss',vehicle:'truck',minLoad:25,budget:1000,bridgeType:'truss',wind:0,text:'Design mission: carry the pickup on a bridge with at least four triangles for $1,000 or less.'},
    {id:'steelBeam',name:'Steel beam',vehicle:'bus',minLoad:45,budget:1250,bridgeType:'girder',wind:0,text:'Design mission: build a continuous steel frame below the road and carry the school bus for $1,250 or less.'},
    {id:'archCrossing',name:'Arch crossing',vehicle:'trailer',minLoad:37.5,budget:1300,bridgeType:'arch',wind:0,text:'Design mission: build a raised steel arch between the banks and carry the pickup with trailer for $1,300 or less.'},
    {id:'cableCrossing',name:'Suspension',vehicle:'car',minLoad:10,budget:1250,bridgeType:'suspension',wind:0,text:'Design mission: use two steel towers, a main cable, backstays and hangers to carry the car for $1,250 or less.'},
    {id:'stormCrossing',name:'Storm crossing',vehicle:'tank',minLoad:90,budget:1900,wind:28,text:'The final mission: carry the tank in gusty wind for $1,900 or less. Choose your own bridge design.'}
  ];
  const tips={
    first:['Turn rectangles into triangles with diagonal Wood beams. A triangle gives the road another path to the banks.','Build a row of joints above or below the road. Connect that row to the road and brace between neighbouring joints.','Beams join only at their endpoints. Two pieces crossing in the middle do not make a joint. Look at the Truss example for the pattern.'],
    supply:['Watch the red or amber pieces as the pickup moves. Improve the busiest part instead of adding beams everywhere.','A long beam under compression can buckle. Divide it into shorter sections and brace the new joints.','Keep the vehicle and wind the same while you change one beam. Compare peak stress and bending in your notebook.'],
    trailerTrial:['The trailer adds a third axle. Strengthen the whole load path, including the pieces near each bank.','Try Steel only at the weakest members. It costs more than Wood, so compare the strength gained with the extra cost.','Make sure every diagonal ends at a road or support joint. A floating brace cannot carry the deck load.'],
    school:['The bus spreads weight over two widely spaced axles. Watch the middle of the deck as both axles enter.','A deeper frame can resist bending better. Connect its top or bottom row back to the road with verticals and diagonals.','If the road sags, add another route to the banks. Extra disconnected beams add cost without supporting the deck.'],
    heavy:['Trace the load from the road, through the braces, to both gold bank anchors. Reinforce weak links along that route.','The long semi loads several road sections at once. Check the centre and the end braces during the same run.','Use the stress colours to choose where Steel is useful. Change one section, then repeat the test.'],
    tankerTrial:['Balance strength and cost. Replace the members that reach the highest stress before strengthening every piece.','Low stress in one member is a clue, not proof that it is unnecessary. Remove one piece, test again, and use Undo if needed.','A suspension bridge needs braced towers and bank-anchored backstays. Cable carries tension; it cannot replace a compressed brace.'],
    tankTrial:['The tracks spread the load, but every link to the banks still matters. Keep the deck well connected to its supports.','Short, braced members resist compression better than long unbraced ones. Watch for a compression failure in the test result.','Compare your first car bridge with this one in the notebook. Which reinforcement produced the biggest improvement?'],
    efficientTruss:['Use Wood triangles to carry the pickup. This mission checks for at least four real triangles and a $1,000 budget.','Keep a continuous upper or lower row and diagonals between joints. The Road can form one side of a triangle.','To explore a new shape, use Start over · road only; Undo restores your last bridge. The Truss example is a guide to study.'],
    steelBeam:['Build a continuous Steel row one grid space below the road, connected to both bank anchors. Add vertical Steel ties up to the deck.','The depth between the road and the lower row helps resist bending. Start with a frame, then watch how the bus loads it.','This mission needs a connected lower Steel frame, not just one Steel piece. Study the Beam example and construct your own version.'],
    archCrossing:['Raise the Steel arch two grid spaces above the road. Its sloping ends must reach the gold anchors on both banks.','Connect the arch down to road joints with vertical ties. The arch carries compression while the ties support the deck.','Keep the arch continuous from bank to bank. A tall beam standing by itself does not form an arch. Study the Arch example.'],
    cableCrossing:['Build two braced Steel towers, two grid spaces high. Anchor Cable backstays from the tower tops to the banks.','Connect the tower tops with a segmented main Cable. Add vertical Cable hangers from the main cable to several road joints.','Cables pull but go slack under compression. Use rigid beams to brace the towers and watch the taut/slack count during the car crossing.'],
    stormCrossing:['Gusty wind is fixed for this finale. Brace tall members and give sideways forces a continuous route to the banks.','The $1,900 budget rewards targeted reinforcement. Replace the most stressed pieces before adding another entire layer.','Compare this trial with the calm Tank level. Keep the design the same first, then strengthen the members affected by the wind.'],
    sandbox:['Choose a design to investigate: triangles, a deep beam, a raised arch or suspension cables. The examples show each load path.','Keep the vehicle and wind the same while changing one part of your bridge. Then compare cost, stress and bending.','Road provides the driving surface. Wood and Steel can push and pull; Cable can only pull. Connect every support to shared endpoints.']
  };
  for(const level of levels)level.hints=tips[level.id];
  const challenges=Object.fromEntries(levels.map((level,index)=>[level.id,{...level,index}]));
  challenges.sandbox={name:'Free build',vehicle:null,budget:Infinity,text:'Choose any vehicle and build your own experiment. Bridge examples are guides to look at; build the supports yourself.',hints:tips.sandbox};
  const levelIndex=id=>levels.findIndex(level=>level.id===id);
  function readProgress(value){return {version:VERSION,completed:value?.version===VERSION&&Number.isInteger(value.completed)&&value.completed>=0&&value.completed<=levels.length?value.completed:0};}
  function isUnlocked(id,progress){const index=levelIndex(id);return id==='sandbox'||index>=0&&index<=Math.min(readProgress(progress).completed,levels.length-1);}
  function nextFor(id){const index=levelIndex(id);return index<0?null:levels[index+1]?.id||'sandbox';}
  function recordWin(progress,id,result){
    const updated=readProgress(progress),index=levelIndex(id),level=levels[index];
    const earned=Boolean(level&&isUnlocked(id,updated)&&result.pass===true&&result.vehicle===level.vehicle&&result.loadPercent===100&&Number.isFinite(result.cost)&&result.cost>=0&&result.cost<=level.budget&&(!level.bridgeType||result.designOk===true)&&(level.wind===undefined||result.wind===level.wind));
    if(earned&&index===updated.completed)updated.completed++;
    return {progress:updated,earned,next:earned?nextFor(id):null};
  }
  function bootstrap(saved,road){
    const progress=readProgress(saved?.progress),current=Boolean(saved?.progress?.version===VERSION);
    const challenge=current&&isUnlocked(saved.challenge,progress)?saved.challenge:'first',level=challenges[challenge];
    return {
      progress,challenge,members:current?saved.members:road,bridgeType:current?saved.bridgeType||'custom':'custom',
      vehicle:challenge==='sandbox'?saved.vehicle:level.vehicle,loadPercent:challenge==='sandbox'?saved.loadPercent||100:100,wind:level.wind??(current?saved.wind||0:0),
      campaignDraft:current?saved.campaignDraft||null:null,
      freeBuildDraft:current?saved.freeBuildDraft||null:saved?{members:saved.members,bridgeType:saved.bridgeType||'custom',vehicle:saved.vehicle,loadPercent:saved.loadPercent||100,wind:saved.wind||0,challenge:'sandbox'}:null
    };
  }
  return {VERSION,levels,challenges,levelIndex,readProgress,isUnlocked,nextFor,recordWin,bootstrap};
});
