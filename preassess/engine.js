(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NumberLab=factory();})(typeof window!=='undefined'?window:this,function(){
'use strict';
const skills=['bonds','build','models','trade'];
const names={bonds:'Break a number',build:'Build a number',models:'Read a model',trade:'Trade & regroup'};
const levels=['Within 10','Within 20','Within 100','Within 1,000','Within 100,000'];
const values=[10000,1000,100,10,1];
const places=['Ten thousands','Thousands','Hundreds','Tens','Ones'];
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function parts(n){return values.map(v=>{const c=Math.floor(n/v);n%=v;return c;});}
function total(p){return p.reduce((s,c,i)=>s+c*values[i],0);}
function int(r,a,b){return a+Math.floor(r()*(b-a+1));}
function makeQuestion(skill,level,seed){
 const r=rng(seed),ranges=[[2,10],[11,20],[21,99],[101,999],[1001,99999]],range=ranges[level];
 const n=int(r,...range),p=parts(n),q={skill,level,n,parts:p};
 if(skill==='bonds'){q.first=int(r,0,n);q.answer=n-q.first;q.prompt=`${n.toLocaleString()} = ${q.first.toLocaleString()} + ?`;}
 if(skill==='build'){q.answer=p;q.prompt=`Build ${n.toLocaleString()} using the place-value chart.`;}
 if(skill==='models'){q.answer=n;q.prompt='What number does this model show?';}
 if(skill==='trade'){
  if(level===0){q.first=int(r,0,n);q.answer=n-q.first;q.prompt=`${q.first} ones + ? ones = ${n} ones`;}
  else{
   const available=p.map((c,i)=>c>0&&i<4?i:-1).filter(i=>i>=0);
   const index=available[int(r,0,available.length-1)];q.tradeIndex=index;q.parts=[...p];q.parts[index]--;q.parts[index+1]+=10;q.answer=n;
   q.prompt='These blocks have not all been regrouped. What is their total value?';
  }
 }
 return q;
}
function validNumber(raw){if(String(raw).trim()===''||!/^\d+$/.test(String(raw).trim()))return null;const n=Number(raw);return Number.isSafeInteger(n)?n:null;}
function check(q,input){if(q.skill==='build'){if(!Array.isArray(input)||input.length!==5)return null;const parsed=input.map(validNumber);if(parsed.some(v=>v===null||v>9))return null;return parsed.every((v,i)=>v===q.answer[i]);}const n=validNumber(input);return n===null?null:n===q.answer;}
function fresh(start=1){return Object.fromEntries(skills.map(s=>[s,{level:start,window:[],attempted:0,firstTry:0,supported:0}]));}
function adapt(progress,skill,clean,assisted,adaptive=true){
 const p=progress[skill];p.attempted++;if(clean)p.firstTry++;if(assisted)p.supported++;
 if(!adaptive)return '';p.window.push(clean&&!assisted);p.window=p.window.slice(-3);
 if(p.window.length===3&&p.window.every(Boolean)&&p.level<4){p.level++;p.window=[];return 'Ready for larger numbers. Your next question moves up one level.';}
 if(p.window.filter(v=>!v).length>=2&&p.level>0){p.level--;p.window=[];return 'Your next question uses smaller numbers to practise the same idea.';}
 return '';
}
function explanation(q){if(q.skill==='bonds'||q.skill==='trade'&&q.level===0)return `${q.first.toLocaleString()} + ${q.answer.toLocaleString()} = ${q.n.toLocaleString()}. The parts combine to make the whole.`;return q.parts.map((c,i)=>c?`${c} × ${values[i].toLocaleString()}`:'').filter(Boolean).join(' + ')+` = ${q.n.toLocaleString()}. Ten of one place have the same value as one of the next place.`;}
return {skills,names,levels,values,places,rng,parts,total,makeQuestion,check,validNumber,fresh,adapt,explanation};
});
