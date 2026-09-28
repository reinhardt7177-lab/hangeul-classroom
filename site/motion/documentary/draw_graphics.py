"""Draw exact Korean documentary cards and overlays with Skia, for Higgsedit assembly."""
import sys, json, zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / '.motion-tools'))
import skia
OUT = ROOT / 'output/hangeul/documentary/graphics'
OUT.mkdir(parents=True, exist_ok=True)
W,H=1280,720
BOLD=skia.Typeface.MakeFromFile(r'C:\Windows\Fonts\malgunbd.ttf')
REG=skia.Typeface.MakeFromFile(r'C:\Windows\Fonts\malgun.ttf')
SERIF=skia.Typeface.MakeFromFile(r'C:\Windows\Fonts\batang.ttc')
def color(h,a=255):
 v=int(h.lstrip('#'),16); return skia.ColorSetARGB(a,v>>16,(v>>8)&255,v&255)
def p(h,a=255): return skia.Paint(Color=color(h,a),AntiAlias=True)
def txt(c,s,x,y,size=36,fill='#f7f1e5',face=BOLD,center=False):
 f=skia.Font(face,size)
 if center:x-=f.measureText(s)/2
 c.drawString(s,x,y,f,p(fill))
def rect(c,x,y,w,h,fill,r=0,a=255):
 c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x,y,w,h),r,r),p(fill,a))
def save(surface,name):
 (OUT/name).write_bytes(bytes(surface.makeImageSnapshot().encodeToData()))
def surface(transparent=False):
 s=skia.Surface(1920,1080);s.getCanvas().clear(skia.ColorTRANSPARENT if transparent else color('#0b2521'));s.getCanvas().scale(1.5,1.5);return s
def base(n):
 s=surface();c=s.getCanvas()
 for i in range(12):
  c.drawLine(50+i*114,0,50+i*114,H,p('#afbd9b',9))
 for i in range(7):c.drawLine(0,42+i*114,W,42+i*114,p('#afbd9b',9))
 rect(c,68,76,42,3,'#d8b67b')
 txt(c,'한글날 · 마음을 잇는 우리 글자',126,85,21,'#d8c8a8',REG)
 rect(c,68,646,1144,1,'#54715c')
 txt(c,'교육용 이야기 · 역사 인물과 공간은 상상 재연',68,680,17,'#aabcb0',REG)
 txt(c,f'{n:02d} / 12',1112,680,17,'#aabcb0',REG)
 return s
timeline=[
 {'index':1,'at':0,'kind':'card','eyebrow':'한글이 태어난 까닭','title':['누구나 마음을','전할 수 있도록'],'detail':'세종이 꿈꾼 새로운 글자의 이야기'},
 {'index':2,'at':5,'kind':'video','clip':1,'eyebrow':'글로 전하기 어려운 마음','lines':['우리말은 있었지만, 글로 뜻을','전하기 어려운 이들이 있었어요.']},
 {'index':3,'at':10,'kind':'video','clip':2,'eyebrow':'백성을 생각하는 마음','lines':['세종은 그 어려움을','안타깝게 여겼어요.']},
 {'index':4,'at':15,'kind':'video','clip':3,'eyebrow':'쉽게 배우고 편히 쓰는 글자','lines':['누구나 쉽게 배우고 쓸','새 글자를 만들고자 했어요.']},
 {'index':5,'at':20,'kind':'card','year':'1443','eyebrow':'새 글자의 탄생','title':['훈민정음 창제'],'detail':'세종이 새로운 글자 스물여덟 자를 만들었어요.'},
 {'index':6,'at':25,'kind':'video','clip':4,'eyebrow':'1445 · 새로운 글자로 지은 노래','lines':['새 글자로 지은 노래,','『용비어천가』가 만들어졌어요.']},
 {'index':7,'at':30,'kind':'video','clip':5,'eyebrow':'원리와 쓰임을 설명하다','lines':['학자들은 세종의 명을 받아 새 글자의','원리와 쓰임을 설명했어요.']},
 {'index':8,'at':35,'kind':'card','year':'1446','eyebrow':'글자를 설명하는 책','title':['『훈민정음』 해례본 간행'],'detail':'왜 만들었는지, 어떻게 쓰는지 밝혔어요.'},
 {'index':9,'at':40,'kind':'card','year':'1447','eyebrow':'노래에서 책으로','title':['『용비어천가』 간행'],'detail':'1445년 노래 작성 → 1447년 책 간행'},
 {'index':10,'at':45,'kind':'video','clip':6,'eyebrow':'시간이 흐른 뒤','lines':['시간이 흐르며 한글을 배우고','쓰는 사람들이 늘어났어요.']},
 {'index':11,'at':50,'kind':'video','clip':7,'eyebrow':'오늘, 우리 곁의 한글','lines':['그 글자는 오늘도 우리의','마음과 생각을 이어 줘요.']},
 {'index':12,'at':55,'kind':'card','eyebrow':'이제 함께 생각해요','title':['세종은 왜','새 글자를 만들었을까요?'],'detail':'영상에서 찾은 까닭을 이야기해 봐요.'}
]
for a in timeline:
 i=a['index']
 if a['kind']=='card':
  b=base(i);save(b,f'card{i:02d}-bg.png')
  s=surface(True);c=s.getCanvas()
  txt(c,a['eyebrow'],W/2,182,26,'#d8b67b',BOLD,True)
  if a.get('year'):
   txt(c,a['year'],W/2,344,144,'#f7f1e5',BOLD,True)
   txt(c,a['title'][0],W/2,443,49,'#f7f1e5',BOLD,True)
   txt(c,a['detail'],W/2,525,28,'#b7c8b8',REG,True)
  else:
   for k,line in enumerate(a['title']):txt(c,line,W/2,306+k*87,66,'#f7f1e5',SERIF,True)
   txt(c,a['detail'],W/2,502,28,'#b7c8b8',REG,True)
  save(s,f'card{i:02d}-fg.png')
  if i==1:
   b.getCanvas().save();b.getCanvas().resetMatrix();b.getCanvas().drawImage(s.makeImageSnapshot(),0,0);b.getCanvas().restore()
   save(b,'documentary-poster.png')
 else:
  s=surface(True);c=s.getCanvas()
  gradient=skia.GradientShader.MakeLinear([(0,350),(0,720)],[color('#071c17',0),color('#071c17',248)])
  c.drawRect(skia.Rect.MakeXYWH(0,340,W,380),skia.Paint(Shader=gradient))
  label='교육용 상징 재연' if a['clip']!=7 else '현대 한국 도서관 · 상상 영상'
  label_width=skia.Font(REG,17).measureText(label)+24
  rect(c,62,61,label_width,33,'#0b2521',5,235)
  txt(c,label,74,85,17,'#f1e6ce',REG)
  txt(c,a['eyebrow'],68,513,23,'#eed39e',BOLD)
  for k,line in enumerate(a['lines']):txt(c,line,68,573+k*53,39,'#fffaf0',BOLD)
  rect(c,68,660,1144,2,'#e4d4b0',0,90)
  rect(c,68,660,1144*i/12,2,'#eed39e')
  if a['clip'] in [2,3]:txt(c,'복식은 1444년 이후 자료를 참고한 인물 상상화',68,693,16,'#d6d8c9',REG)
  else:txt(c,'한글날 · 마음을 잇는 우리 글자',68,693,16,'#d6d8c9',REG)
  txt(c,f'{i:02d} / 12',1125,693,16,'#d6d8c9',REG)
  save(s,f'overlay{i:02d}.png')
(OUT/'timeline.json').write_text(json.dumps(timeline,ensure_ascii=False,indent=2),encoding='utf-8')
with zipfile.ZipFile(OUT.parent/'graphics.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in OUT.glob('*'):z.write(f,f.name)
print(f'Drew {len(timeline)} Skia scenes and packaged graphics.zip')
