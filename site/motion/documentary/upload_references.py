"""Upload generated project reference frames to reserved Higgsfield media slots."""
import json
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
for entry in json.loads((ROOT / 'tmp/hangul-ref-uploads.json').read_text(encoding='utf-8')):
    source = ROOT / 'output/hangeul/documentary/frames' / (entry['name'] + '.png')
    target = source.with_suffix('.jpg')
    im = Image.open(source).convert('RGB')
    im.thumbnail((1672, 940))
    im.save(target, quality=94)
    request = Request(entry['upload_url'], data=target.read_bytes(), method='PUT', headers={'Content-Type': 'image/jpeg'})
    with urlopen(request, timeout=90) as response:
        if response.status != 200:
            raise RuntimeError('Upload did not return HTTP 200')
        print(entry['name'] + ': HTTP 200')
