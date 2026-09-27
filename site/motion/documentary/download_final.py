from pathlib import Path
from urllib.request import urlopen
import shutil
ROOT=Path(__file__).resolve().parents[3]
url="https://d2ol7oe51mr4n9.cloudfront.net/user_3Bq2wIbaBo4Vg8SI4iYBCY9cXC4/05d627d1-3495-4c81-a171-d4ac7c271f4c.mp4"
dest=ROOT/'output/hangeul/documentary/hangeul-documentary-kling-60s.mp4'
with urlopen(url,timeout=120) as r:dest.write_bytes(r.read())
shutil.copy2(dest,ROOT/'site/dist/videos'/dest.name)
shutil.copy2(ROOT/'output/hangeul/documentary/graphics/documentary-poster.png',ROOT/'site/dist/assets/documentary-poster.png')
print('Downloaded final movie: '+str(dest.stat().st_size)+' bytes')
