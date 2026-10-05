(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PirateMap=factory();})(typeof window!=='undefined'?window:this,function(){
'use strict';const width=10,height=7;
function reference(p){return String.fromCharCode(65+p.x)+(height-p.y);}
function clues(a,b){const h=b.x-a.x,v=b.y-a.y;const out=[];if(h)out.push(`${Math.abs(h)} ${Math.abs(h)===1?'pace':'paces'} ${h>0?'east':'west'}`);if(v)out.push(`${Math.abs(v)} ${Math.abs(v)===1?'pace':'paces'} ${v>0?'south':'north'}`);return out;}
function journey(mode,r=Math.random){const start={x:Math.floor(r()*width),y:Math.floor(r()*height)},waypoints=[];let from=start;const count=mode==='route'?3:1;for(let i=0;i<count;i++){let p,tries=0;do{p={x:Math.floor(r()*width),y:Math.floor(r()*height)};if(++tries>100){p={x:(from.x+1)%width,y:from.y};break;}}while(p.x===from.x&&p.y===from.y);waypoints.push(p);from=p;}return {start,waypoints};}
function move(p,d){const dirs={north:[0,-1],south:[0,1],west:[-1,0],east:[1,0]};const a=dirs[d];if(!a)return {...p};return {x:Math.max(0,Math.min(width-1,p.x+a[0])),y:Math.max(0,Math.min(height-1,p.y+a[1]))};}
function at(a,b){return a.x===b.x&&a.y===b.y;}
return {width,height,reference,clues,journey,move,at};
});
