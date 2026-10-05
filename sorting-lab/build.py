"""Rebuild the two sorting pages after editing their JSON content or the shared UI."""
import hashlib,json
from pathlib import Path

SHARED=Path(__file__).resolve().parent
ROOT=SHARED.parent
for folder in ['animaldiets','naturalresourcessort2']:
    config=json.loads((ROOT/folder/'game-data.json').read_text())
    values=json.loads((ROOT/folder/'page-data.json').read_text())
    for item in config['items']:
        assert (ROOT/folder/item['image']).is_file(),item['image']
    assert len({i['id'] for i in config['items']})==len(config['items'])
    items={i['id']:i for i in config['items']}
    for r in config['rounds']:
        assert len(r['items'])==len(set(r['items']))
        for i in r['items']:
            assert items[i][r['answerKey']] in [c['id'] for c in r['categories']]
    values['CONFIG']=json.dumps(config,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    values['STYLE_VERSION']=hashlib.sha256((SHARED/'sort-lab.css').read_bytes()).hexdigest()[:12]
    values['SCRIPT_VERSION']=hashlib.sha256((SHARED/'sort-lab.js').read_bytes()).hexdigest()[:12]
    content=(SHARED/'page-template.html').read_text()
    for k,v in values.items():content=content.replace('__'+k+'__',v)
    assert '__' not in content,'Unfilled page token'
    (ROOT/folder/'index.html').write_text(content)
    print('Built',folder)
