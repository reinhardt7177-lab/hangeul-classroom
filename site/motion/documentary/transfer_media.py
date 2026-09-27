"""Transfer this documentary's generated assets and graphics only."""
import json
from pathlib import Path
from urllib.request import Request, urlopen
ROOT=Path(__file__).resolve().parents[3]
entry=json.loads((ROOT/'tmp/hangul-graphics-upload.json').read_text(encoding='utf-8'))
with urlopen(Request(entry['upload_url'],data=(ROOT/entry['path']).read_bytes(),method='PUT',headers={'Content-Type':entry['content_type']}),timeout=120) as r:
    if r.status!=200:raise RuntimeError('Upload failed')
    print('graphics.zip: HTTP 200')
jobs=json.loads((ROOT/'output/hangeul/documentary/completed-jobs.json').read_text(encoding='utf-8'))['jobs']
for job in jobs:
    target=ROOT/'output/hangeul/documentary/clips'/('clip%02d.mp4'%job['index'])
    if not target.exists():
        with urlopen(job['result_url'],timeout=120) as r:target.write_bytes(r.read())
    print(target.name+': '+str(target.stat().st_size)+' bytes')
