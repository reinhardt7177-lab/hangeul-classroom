import sys,subprocess,io,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'.motion-tools'))
import imageio_ffmpeg
from PIL import Image,ImageDraw
ff=imageio_ffmpeg.get_ffmpeg_exe()
movie=ROOT/'output/hangeul/documentary/hangeul-documentary-kling-60s.mp4'
out=ROOT/'output/hangeul/documentary/qc'
sheet=Image.new('RGB',(1280,4*384),'#f2ede1')
for i,t in enumerate([2.5,7.5,12.5,17.5,22.5,27.5,32.5,37.5,42.5,47.5,52.5,57.5]):
 b=subprocess.check_output([ff,'-v','error','-ss',str(t),'-i',str(movie),'-frames:v','1','-vf','scale=640:360','-f','image2pipe','-vcodec','png','-'])
 im=Image.open(io.BytesIO(b)).convert('RGB')
 # Four rows of three at 426px, preserving readable source frames separately.
 im.save(out/f'final-{i+1:02d}.jpg',quality=95)
 small=im.resize((426,240))
 x=(i%3)*426;y=(i//3)*384
 sheet.paste(small,(x,y+24))
 ImageDraw.Draw(sheet).text((x+8,y+6),f'{i+1:02d} / {t}s',fill='#13291f')
sheet=sheet.crop((0,0,1280,4*384-120))
sheet.save(out/'final-overview.jpg',quality=93)
metadata=subprocess.run([ff,'-hide_banner','-i',str(movie)],capture_output=True,text=True,encoding='utf-8',errors='replace').stderr
(out/'ffmpeg-probe.txt').write_text(metadata,encoding='utf-8')
print(metadata.split('Stream mapping:')[0])
