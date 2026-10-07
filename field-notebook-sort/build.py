"""Build independent, portable notebook sorts; never rebuild Sorting Lab/Resource Depot."""
from pathlib import Path
import json, html, argparse
ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('folders',nargs='*')
parser.add_argument('--output',type=Path,default=ROOT.parent)
args=parser.parse_args()
OUT=args.output
for datafile in sorted((ROOT/'activities').glob('*.json')):
    d=json.loads(datafile.read_text())
    if args.folders and d['folder'] not in args.folders: continue
    groups=''.join(f'<section class="page" style="--accent:{g["color"]}"><button class="category" type="button" data-group="{g["id"]}" aria-label="Sort selected card into {html.escape(g["label"])}: {html.escape(g["description"])}"><strong>{html.escape(g["label"])}</strong><small>{html.escape(g["description"])}</small></button><div id="{g["id"]}" class="drop-zone" role="region" aria-label="{html.escape(g["label"])} cards"></div></section>' for g in d['groups'])
    values={'TITLE':html.escape(d['title']),'DESCRIPTION':html.escape(d['description']),'CSS':(ROOT/'notebook.css').read_text(),'JS':(ROOT/'notebook.js').read_text(),'CONFIG':json.dumps(d,ensure_ascii=False).replace('<','\\u003c'),'BACKGROUND':d['background'],'ACCENT':d['groups'][0]['color'],'GROUP_COUNT':str(len(d['groups'])),'COLUMNS':str(d.get('columns',8)),'TOPIC':html.escape(d['topic']),'BRIEF':html.escape(d['brief']),'GROUPS':groups,'CLUE_BUTTON':'<button class="hint-control" id="show-clue" type="button">Read field note</button>' if d.get('rounds') else '', 'NOTES':d['notes'],'FOLDER':d['folder']}
    page=(ROOT/'page-template.html').read_text()
    for key,value in values.items():page=page.replace('__'+key+'__',value)
    dest=OUT/d['folder'];dest.mkdir(parents=True,exist_ok=True);(dest/'index.html').write_text(page)
    print(d['folder'],len(page.encode()),'bytes',len(d['items']),'cards')
