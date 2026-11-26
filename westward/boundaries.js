// Public geographic references stay separate from the user's private workspace.
const cache=new Map();
const dataURL=name=>new URL('./data/boundaries/'+name,import.meta.url).href;
async function json(name){if(!cache.has(name))cache.set(name,fetch(dataURL(name)).then(r=>{if(!r.ok)throw Error('Boundary reference unavailable: '+name);return r.json();}).catch(err=>{cache.delete(name);throw err;}));return cache.get(name);}
export const readBoundaryManifest=()=>json('manifest.json');
export function resolveBoundaryAccount(accounts,boardId,crosswalk){
 const equivalent=new Set([boardId,...(crosswalk.equivalents??[]).filter(group=>group.includes(boardId)).flat()]);
 const explicit=accounts.find(a=>String(a.boundaryIds??'').split(',').map(v=>v.trim()).some(id=>equivalent.has(id)));
 if(explicit)return explicit;
 const seedIds=[...equivalent].map(id=>crosswalk.links?.[id]).filter(Boolean);
 return accounts.find(a=>seedIds.includes(a.id));
}
export async function addBoundaryLayers(map,options){
 const startingCentre=map.getCenter(),startingZoom=map.getZoom();
 const L=window.L,groups={public:L.geoJSON(null),separate:L.geoJSON(null),francophone:L.geoJSON(null)};
 const titles={public:'Public school-board areas',separate:'Separate / Catholic areas',francophone:'Francophone regions / areas',pins:'District reference pins'};
 const overlays={...Object.fromEntries(Object.entries(groups).map(([key,group])=>[titles[key],group])),[titles.pins]:options.pins};
 for(const [key,group] of Object.entries(groups))if(options.visibility[key])group.addTo(map);
 const control=L.control.layers({},overlays,{collapsed:true,position:'topright'}).addTo(map);
 const fitControl=()=>{control.getContainer().style.maxHeight=Math.max(100,map.getSize().y-20)+'px';};
 map.on('resize',fitControl);fitControl();
 const controlList=control.getContainer().querySelector('.leaflet-control-layers-list');
 const note=document.createElement('p');note.className='boundary-control-note';note.textContent='Government boundary overview. Different authority types can overlap.';controlList.append(note);
 const sources=document.createElement('button');sources.type='button';sources.className='boundary-sources';sources.textContent='Boundary sources & coverage';sources.addEventListener('click',options.onSources);controlList.append(sources);
 map.on('overlayadd overlayremove',event=>{const key=Object.keys(titles).find(k=>titles[k]===event.name);if(key)options.visibility[key]=event.type==='overlayadd';});
 try{
  const [manifest,crosswalk]=await Promise.all([readBoundaryManifest(),json('account-links.json')]);
  if(!options.isCurrent())return;
  const provinces=options.province==='all'?Object.keys(manifest.files):[options.province];
  const results=await Promise.allSettled(provinces.map(p=>json(manifest.files[p].path)));
  if(!options.isCurrent())return;
  let loaded=0,failed=0;
  for(const result of results){
   if(result.status!=='fulfilled'){failed++;continue;}
   if(result.value.type!=='FeatureCollection'||!Array.isArray(result.value.features)){failed++;continue;}
   for(const feature of result.value.features){
    const p=feature.properties,group=groups[p.authorityType];if(!group)continue;
    const getAccount=()=>resolveBoundaryAccount(options.accounts(),p.boardId,crosswalk);
    const status=options.status(getAccount());
    if(options.filter!=='all'&&status!==options.filter)continue;
    const style=()=>{const account=getAccount(),selected=account?.id===options.selected();const color=options.colors[options.status(account)]??options.colors.unknown;return {color,weight:selected?2.3:1.1,opacity:.85,fillColor:color,fillOpacity:selected?0.19:0.065};};
    const layer=L.geoJSON(feature,{style,onEachFeature:(f,shape)=>{
     const container=document.createElement('div');container.className='boundary-popup';
     const title=document.createElement('strong');title.textContent=p.name;container.append(title);
     const meta=document.createElement('p');meta.textContent=p.province+' · '+({public:'Public',separate:'Separate / Catholic',francophone:'Francophone'}[p.authorityType])+' · '+p.boardId;container.append(meta);
     const hint=document.createElement('p');hint.className='boundary-popup-note';hint.textContent='Generalized boundary overview. Verify the source for official decisions.';container.append(hint);
     const button=document.createElement('button');button.type='button';button.className='btn';const account=getAccount();button.textContent=account?'Open district brief':'Add district to workspace';button.addEventListener('click',()=>{const current=getAccount();if(current)options.onOpen(current);else options.onAdd({...p,retrievedOn:manifest.retrievedOn,sourceUrl:manifest.sources.find(s=>s.key===p.sourceKey)?.catalogue},shape.getBounds().getCenter());});container.append(button);
     shape.bindPopup(container,{maxWidth:290});shape.bindTooltip(options.escape(p.name),{sticky:true});
     shape.on('mouseover',()=>shape.setStyle({weight:2.5,fillOpacity:.17}));shape.on('mouseout',()=>shape.setStyle(style()));shape.on('click',()=>{const account=getAccount();if(account)options.onSelect(account.id);});
    }}).addTo(group);loaded++;
   }
  }
  map.attributionControl.addAttribution('School areas: '+provinces.map(p=>`<a href="${manifest.sources.find(s=>s.province===p).catalogue}" target="_blank" rel="noopener">${p}</a>`).join(' · '));
  if(options.fitInitial&&map.getZoom()===startingZoom&&map.getCenter().distanceTo(startingCentre)<1){const bounds=L.latLngBounds();for(const group of Object.values(groups)){const b=group.getBounds();if(b.isValid())bounds.extend(b);}if(bounds.isValid())map.fitBounds(bounds,{padding:[18,18]});}
  options.onStatus(failed?'Some boundary files could not load. Other layers and pins remain available.':'');
  if(!loaded&&!failed)options.onStatus('No boundaries match the selected attention filter.');
 }catch(error){if(options.isCurrent())options.onStatus('Boundary layers unavailable. Pins still work; try reloading.');}
}
