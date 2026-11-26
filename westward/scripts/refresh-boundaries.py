#!/usr/bin/env python3
"""Build small, public boundary reference files; never reads customer workspace data.
Requires shapely >= 2.1. Run from westward/: python scripts/refresh-boundaries.py
Use --cached to rebuild from .boundary-raw during development.
"""
import argparse, collections, datetime, json, pathlib, re, sys, unicodedata
import urllib.parse, urllib.request
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
from shapely import make_valid, set_precision

ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'.boundary-raw'; OUT=ROOT/'data'/'boundaries'
TODAY=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
AB='https://geospatial.alberta.ca/titan/rest/services/'
SK='https://gis.saskatchewan.ca/arcgis/rest/services/Education/SchoolsAndDivisions/MapServer/'
MB='https://services.arcgis.com/mMUesHYPkXjaFGfS/arcgis/rest/services/Manitoba_School_Divisions/FeatureServer/0'
BC='https://openmaps.gov.bc.ca/geo/pub/wfs'
SOURCES=[
 dict(key='bc',province='BC',kind='public',url=BC,name='Government of British Columbia · School Districts of BC',vintage='Source catalogue updated January 28, 2026; not a guarantee of geometry revision date',catalogue='https://catalogue.data.gov.bc.ca/dataset/school-districts-of-bc'),
 dict(key='ab-public-data',province='AB',kind='public',url=AB+'educationmaps2026/public_school_authority_boundary_2026/MapServer/3',name='Government of Alberta · Public school authority boundaries (2026)',vintage='2026 service',catalogue='https://www.alberta.ca/alberta-school-division-maps'),
 dict(key='ab-separate-data',province='AB',kind='separate',url=AB+'educationmaps2026/separate_school_authority_boundary_2026/MapServer/3',name='Government of Alberta · Separate school authority boundaries (2026)',vintage='2026 service',catalogue='https://www.alberta.ca/alberta-school-division-maps'),
 dict(key='ab-french-data',province='AB',kind='francophone',url=AB+'nadc/edu_school_and_school_authority_boundary/MapServer/11',name='Government of Alberta · Francophone education regions',vintage='Active service; geometry revision date not stated',catalogue='https://www.alberta.ca/alberta-school-division-maps'),
 dict(key='sk-public-data',province='SK',kind='public',url=SK+'7',name='Government of Saskatchewan · Public school divisions',vintage='Active service; metadata page references 2020 edition',catalogue='https://gisappl.saskatchewan.ca/WebDocs/SaskInteractive/ED_SD_Public.html'),
 dict(key='sk-separate-data',province='SK',kind='separate',url=SK+'8',name='Government of Saskatchewan · Separate school divisions',vintage='Active service; metadata page references 2020 edition',catalogue='https://gisappl.saskatchewan.ca/WebDocs/SaskInteractive/ED_SD_Separate.html'),
 dict(key='sk-french-data',province='SK',kind='francophone',url=SK+'9',name='Government of Saskatchewan · Francophone school subdivisions',vintage='Active service; geometry revision date not stated',catalogue=SK+'9'),
 dict(key='mb-data',province='MB',kind='public',url=MB,name='Government of Manitoba · School Divisions',vintage='Portal record modified February 5, 2025; geometry revision date not asserted',catalogue='https://open.canada.ca/data/en/dataset/77194d03-9315-70f9-d71f-4052c857ce82')
]

def url_for(source):
 if source['province']=='BC':
  return BC+'?'+urllib.parse.urlencode(dict(service='WFS',version='2.0.0',request='GetFeature',typeNames='pub:WHSE_TANTALIS.TA_SCHOOL_DISTRICTS_SVW',outputFormat='application/json',srsName='EPSG:4326',count=1000,format_options='precision:5'))
 fields={'AB':'Name,Code','SK':'SD_NAME,SD_NUM,SD_TYPE','MB':'School_Div,Source'}[source['province']]
 if source['key']=='sk-french-data':fields='SD_NAME,SD_NUM,SDSD_NAME,SDSD_NUM'
 return source['url']+'/query?'+urllib.parse.urlencode(dict(where='1=1',outFields=fields,returnGeometry='true',outSR=4326,f='geojson',maxAllowableOffset=0.001,geometryPrecision=5))

def slug(text):
 text=unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower()
 return re.sub(r'[^a-z0-9]+','-',text).strip('-')

def identity(source,props):
 p=source['province']
 if p=='BC':return str(props.get('SCHOOL_DISTRICT_NUMBER') or ''),props.get('SCHOOL_DISTRICT_NAME')
 if p=='AB':return str(props.get('Code') or '').strip(),props.get('Name')
 if p=='SK':return str(props.get('SD_NUM') or '').strip(),props.get('SD_NAME')
 name=props.get('School_Div');return slug(name or ''),name

def polygonal(g):
 if g.geom_type in ('Polygon','MultiPolygon'):return g
 items=[polygonal(x) for x in getattr(g,'geoms',[])];items=[x for x in items if x is not None and not x.is_empty]
 return unary_union(items) if items else None

def rounded(obj):
 if isinstance(obj,(list,tuple)):return [rounded(x) for x in obj]
 if isinstance(obj,dict):return {k:rounded(v) for k,v in obj.items()}
 return round(obj,5) if isinstance(obj,float) else obj

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--cached',action='store_true');args=parser.parse_args()
 RAW.mkdir(exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
 grouped=collections.defaultdict(list);manifest={'schema':1,'retrievedOn':TODAY,'crs':'EPSG:4326','coordinateOrder':'longitude, latitude','displayToleranceDegrees':0.001,'purpose':'Generalized territory-planning overview, not legal or enrolment eligibility determinations.','files':{},'sources':[], 'coverageNotes':[
  'BC source has 59 geographic districts. SD93 francophone coverage is not supplied as a polygon in this layer; its account pin remains available.',
  'Manitoba source has 36 named divisions/districts. It does not supply a DSFM polygon; its account pin remains available.',
  'Public, separate/Catholic and francophone areas can overlap. Alberta source explicitly warns of approximate geometry, slivers and gaps.',
  'Francophone regions/subdivisions are shown as supplied by government; they do not establish individual student eligibility.',
  'Charter, independent and First Nations authorities are not comprehensively represented by these geographic layers.',
  'Lloydminster public and Catholic boundaries appear in both AB and SK source systems; the identity crosswalk links each to one account.',
  'Coordinates are generalized for a responsive overview. Source revision dates are separate from retrieval dates.'
 ]}
 for source in SOURCES:
  path=RAW/(source['key']+'.json')
  if not args.cached or not path.exists():
   request=urllib.request.Request(url_for(source),headers={'User-Agent':'Westward-boundary-reference-builder/1.0'})
   with urllib.request.urlopen(request,timeout=90) as r:obj=json.load(r)
   path.write_text(json.dumps(obj))
  else:obj=json.loads(path.read_text())
  if obj.get('error') or obj.get('exceededTransferLimit') or obj.get('type')!='FeatureCollection':raise ValueError('Incomplete or invalid response: '+source['key'])
  if obj.get('totalFeatures') not in (None,len(obj['features'])):raise ValueError('Truncated WFS download')
  by_board=collections.defaultdict(list);names={};skipped=0;repaired=0
  for feature in obj['features']:
   code,name=identity(source,feature.get('properties',{}))
   if not name or not code or not feature.get('geometry'):skipped+=1;continue
   g=shape(feature['geometry'])
   if not g.is_valid:g=make_valid(g);repaired+=1
   g=polygonal(g)
   if g is None or g.is_empty:skipped+=1;continue
   by_board[code].append(g);names[code]=name
  for code,parts in by_board.items():
   g=unary_union(parts).simplify(0.001,preserve_topology=True)
   g=polygonal(set_precision(g,0.00001,mode='valid_output'))
   if g.is_empty:raise ValueError('Simplification removed '+names[code])
   geometry=rounded(mapping(g))
   if not shape(geometry).is_valid:raise ValueError('Invalid output geometry: '+names[code])
   feature={'type':'Feature','id':source['province']+'-'+code,'properties':{'boardId':source['province']+'-'+code,'name':names[code],'province':source['province'],'authorityType':source['kind'],'sourceCode':code,'idBasis':'Derived name key; not an official authority number' if source['province']=='MB' else 'Government authority/district code','sourceKey':source['key']},'geometry':geometry}
   grouped[source['province']].append(feature)
  manifest['sources'].append({**source,'queryUrl':url_for(source),'retrievedOn':TODAY,'rawFeatureCount':len(obj['features']),'authorityCount':len(by_board),'unnamedFeaturesSkipped':skipped,'sourceGeometriesRepairedForDisplay':repaired})
 for province,features in grouped.items():
  features.sort(key=lambda f:f['properties']['boardId'])
  path=OUT/(province.lower()+'.geojson');path.write_text(json.dumps({'type':'FeatureCollection','features':features},ensure_ascii=False,separators=(',',':')))
  manifest['files'][province]={'path':path.name,'authorityCount':len(features),'bytes':path.stat().st_size,'countsByType':dict(collections.Counter(f['properties']['authorityType'] for f in features))}
 (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(manifest['files'],indent=2))

if __name__=='__main__':main()
