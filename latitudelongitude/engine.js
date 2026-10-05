(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CoordinateLab=factory();})(typeof window!=='undefined'?window:this,function(){
'use strict';
function wrap(lon){return ((lon+180)%360+360)%360-180;}
function snap(lat,lon,step){return {lat:Math.max(-85,Math.min(85,Math.round(lat/step)*step)),lon:wrap(Math.round(lon/step)*step)};}
function delta(a,b){return wrap(a-b);}
function same(a,b){return Math.abs(a.lat-b.lat)<.01&&Math.abs(delta(a.lon,b.lon))<.01;}
function label(value,kind){const rounded=Math.round(Math.abs(value)*10)/10;if(rounded===0)return kind==='lat'?'0° (Equator)':'0° (Prime Meridian)';return `${rounded}° ${kind==='lat'?(value>0?'N':'S'):(value>0?'E':'W')}`;}
function validate(lat,lon){if(String(lat).trim()===''||String(lon).trim()==='')return null;const a=Number(lat),b=Number(lon);return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a)<=85&&Math.abs(b)<=180?{lat:a,lon:wrap(b)}:null;}
function feedback(guess,target){const a=target.lat-guess.lat,b=delta(target.lon,guess.lon);const out=[];out.push(Math.abs(a)<.01?'Latitude matches.':`Move ${Math.abs(a)}° ${a>0?'north':'south'} to match the latitude.`);out.push(Math.abs(b)<.01?'Longitude matches.':`Move ${Math.abs(b)}° ${b>0?'east':'west'} to match the longitude.`);return out.join(' ');}
function targets(step,random=Math.random){const candidates=[];for(let lat=-60;lat<=60;lat+=step)for(let lon=-150;lon<=150;lon+=step)candidates.push({lat,lon});for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}return candidates.slice(0,8);}
return {wrap,snap,delta,same,label,validate,feedback,targets};
});
