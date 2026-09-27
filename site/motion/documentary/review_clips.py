import sys,subprocess,io
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'.motion-tools'))
import imageio_ffmpeg
from PIL import Image,ImageDraw
ff=imageio_ffmpeg.get_ffmpeg_exe()
out=ROOT/'output/hangeul/documentary/qc'
combined=Image.new('RGB',(1280,7*266),'#f2ede1')
for n in range(1,8):
 p=ROOT/'output/hangeul/documentary/clips'/f'clip{n:02d}.mp4'
 strip=Image.new('RGB',(1536,312),'#f2ede1')
 for j,t in enumerate([0.3,2.5,4.7]):
  b=subprocess.check_output([ff,'-v','error','-ss',str(t),'-i',str(p),'-frames:v','1','-vf','scale=512:288','-f','image2pipe','-vcodec','png','-'])
  im=Image.open(io.BytesIO(b)).convert('RGB')
  strip.paste(im,(j*512,24))
  ImageDraw.Draw(strip).text((j*512+8,6),f'Clip {n:02d} / {t:.1f}s',fill='#13291f')
 strip.save(out/f'clip{n:02d}-review.jpg',quality=92)
 combined.paste(strip.resize((1280,260)),(0,(n-1)*266))
combined.save(out/'all-clips-review.jpg',quality=90)
print('Saved 7 review sheets and overview')

