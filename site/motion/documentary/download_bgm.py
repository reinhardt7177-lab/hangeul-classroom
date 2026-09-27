from pathlib import Path
from urllib.request import urlopen
import json,shutil
r=Path(__file__).resolve().parents[3]
out=r/'output/hangeul/documentary'
for item in json.loads((r/'tmp/bgm-downloads.json').read_text(encoding='utf-8')):
 with urlopen(item['url'],timeout=180) as response:(out/item['path']).write_bytes(response.read())
 print(item['path'],(out/item['path']).stat().st_size)
shutil.copy2(out/'hangeul-documentary-bgm-60s.mp4',r/'site/dist/videos/hangeul-documentary-kling-60s.mp4')
