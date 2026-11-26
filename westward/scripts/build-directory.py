#!/usr/bin/env python3
"""Build the district directory from reviewed public boundary references.
Requires shapely. Does not read browser workspaces or private account records.
"""
import collections, json, pathlib
from shapely.geometry import shape

ROOT=pathlib.Path(__file__).resolve().parents[1]
BOUNDARIES=ROOT/'data'/'boundaries'
PROVINCES=['BC','AB','SK','MB']

def main():
 manifest=json.loads((BOUNDARIES/'manifest.json').read_text())
 crosswalk=json.loads((BOUNDARIES/'account-links.json').read_text())
 overrides=json.loads((ROOT/'data'/'directory-overrides.json').read_text())
 old={a['id']:a for a in overrides};order={a['id']:i for i,a in enumerate(overrides)}
 canonical={id:group[0] for group in crosswalk['equivalents'] for id in group}
 grouped=collections.defaultdict(list)
 for province,meta in manifest['files'].items():
  for feature in json.loads((BOUNDARIES/meta['path']).read_text())['features']:
   p=feature['properties'];grouped[canonical.get(p['boardId'],p['boardId'])].append(feature)
 sources={s['key']:s for s in manifest['sources']}
 records=[]
 for key,parts in grouped.items():
  chosen=next((f for f in parts if f['properties']['boardId']==key),parts[0]);p=chosen['properties'];source=sources[p['sourceKey']]
  ids=sorted({f['properties']['boardId'] for f in parts},key=lambda x:(x!=key,x))
  existing_id=next((crosswalk['links'][id] for id in ids if id in crosswalk['links']),None)
  id=existing_id or 'district-'+key.lower();legacy=old.get(id,{})
  geometry=shape(chosen['geometry']);components=list(geometry.geoms) if geometry.geom_type=='MultiPolygon' else [geometry]
  point=max(components,key=lambda g:g.area).representative_point()
  provinces=sorted({f['properties']['province'] for f in parts},key=PROVINCES.index)
  name=p['name'].removeprefix('The ')
  if p['province']=='BC':name+=' (SD'+p['sourceCode']+')'
  record={'id':id,'catalogueId':key,'name':legacy.get('name',name),'officialName':p['name'],'province':legacy.get('province',p['province']),'provinces':provinces,'type':legacy.get('type',{'public':'Public','separate':'Separate / Catholic','francophone':'Francophone'}[p['authorityType']]),'city':legacy.get('city','Office location to confirm'),'lat':legacy.get('lat',round(point.y,6)),'lng':legacy.get('lng',round(point.x,6)),'locationBasis':'Approximate city-centre reference' if legacy else 'Inside-boundary geographic reference; office unconfirmed','boundaryIds':', '.join(ids),'hasBoundary':True,'sourceUrl':source['catalogue'],'checked':manifest['retrievedOn'],'sourceNote':'Public government boundary/directory reference. '+('Pin uses an approximate city centre.' if legacy else 'Pin is an inside-boundary geographic reference, not the district office.')+' Confirm office location before travel. Technology, licensing and priorities need discovery.'}
  records.append(record)
 for id,key in [('csf-bc','BC-93'),('dsfm','MB-dsfm')]:
  a=old[id]
  records.append({**a,'catalogueId':key,'officialName':a['name'],'provinces':[a['province']],'locationBasis':'Approximate city-centre reference; no polygon in selected source','boundaryIds':'','hasBoundary':False,'sourceUrl':'https://studentsuccess.gov.bc.ca/all/school-districts' if a['province']=='BC' else 'https://www.edu.gov.mb.ca/k12/schools/index.html','checked':manifest['retrievedOn'],'sourceNote':'Public authority directory reference. This authority is retained as a pin because the selected geographic layer supplies no matching polygon. Pin uses an approximate city centre; confirm the office before travel.'})
 records.sort(key=lambda a:(0,order[a['id']]) if a['id'] in order else (1,PROVINCES.index(a['province']),a['name']))
 assert len(records)==len({a['id'] for a in records})==len({a['catalogueId'] for a in records})
 counts={p:sum(p in a['provinces'] for a in records) for p in PROVINCES}
 summary={'version':manifest['retrievedOn']+'-directory-v1','sourceSnapshot':manifest['retrievedOn'],'uniqueAccounts':len(records),'byProvince':counts,'boundaryReferences':sum(m['authorityCount'] for m in manifest['files'].values()),'accountsWithBoundaries':sum(a['hasBoundary'] for a in records),'pinOnlyAccounts':[a['id'] for a in records if not a['hasBoundary']],'crossBorderAccounts':[{'id':a['id'],'name':a['name'],'provinces':a['provinces'],'boundaryIds':a['boundaryIds']} for a in records if len(a['provinces'])>1],'locationNote':'Reference pins are approximate and must not be treated as verified offices. Province counts include cross-border boards in each province; the all-provinces list deduplicates them.'}
 text='// Generated public reference data. Rebuild with scripts/build-directory.py.\n'
 text+='export const DIRECTORY_VERSION='+json.dumps(summary['version'])+';\n'
 text+='export const DIRECTORY_COVERAGE='+json.dumps(summary,ensure_ascii=False,indent=2)+';\n'
 text+='export const DISTRICT_DIRECTORY='+json.dumps(records,ensure_ascii=False,indent=2)+';\n'
 (ROOT/'directory-data.js').write_text(text)
 (ROOT/'data'/'directory-coverage.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(summary,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
