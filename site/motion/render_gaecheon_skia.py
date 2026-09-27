"""Render a static, evidence-qualified Gaecheonjeol typography card with Skia.

No video frames or MP4 are produced before the teacher approves the video plan.
"""
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'.motion-tools'))
import skia

W,H=1400,420
OUT=ROOT/'site'/'dist'/'assets'/'gaecheon-fact-skia.png'
FACE=skia.Typeface.MakeFromFile('C:/Windows/Fonts/malgunbd.ttf')
if FACE is None:raise RuntimeError('Malgun Gothic Bold not found')

def color(h,a=255):
 h=h.lstrip('#');return skia.ColorSetARGB(a,*[int(h[i:i+2],16) for i in (0,2,4)])

def txt(cv,s,x,y,size,fill):
 font=skia.Font(FACE,size);cv.drawString(s,x,y,font,skia.Paint(Color=color(fill),AntiAlias=True))

surf=skia.Surface(W,H);cv=surf.getCanvas();cv.clear(color('#143C30'))
for n in range(14):
 cv.drawCircle(1180+n*18,80+n*12,96+n*5,skia.Paint(Color=color('#E7CC9C',5),AntiAlias=True))
cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(62,70,12,280),6,6),skia.Paint(Color=color('#F4C887'),AntiAlias=True))
txt(cv,'10월 3일',105,176,83,'#F9E7C2')
txt(cv,'기념하는 날',105,247,42,'#FFFFFF')
cv.drawLine(635,98,635,325,skia.Paint(Color=color('#A3BEAA'),StrokeWidth=2,AntiAlias=True))
txt(cv,'정확한 고대 사건 날짜',684,168,44,'#F8F6E9')
txt(cv,'확정된 역사 사실로 단정하지 않아요',684,230,32,'#E3C397')
txt(cv,'전승과 역사 자료를 구분해 읽기',684,292,29,'#C6D9C8')
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_bytes(bytes(surf.makeImageSnapshot().encodeToData()))
print(OUT)
