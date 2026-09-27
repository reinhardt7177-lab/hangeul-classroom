"""Create six self-contained, historically qualified Gaecheonjeol worksheets."""
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'site'/'dist'/'worksheets'
W,H=A4
INK=colors.HexColor('#214838'); GOLD=colors.HexColor('#BA754E'); MUTED=colors.HexColor('#64766B'); PALE=colors.HexColor('#EAF1E8')
pdfmetrics.registerFont(TTFont('Malgun','C:/Windows/Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('MalgunBold','C:/Windows/Fonts/malgunbd.ttf'))

SHEETS={
 '1-2':{'name':'1–2학년','title':'하늘이 열린 이야기','goal':'개천절의 날짜를 알고 전해지는 이야기를 순서대로 말해요.',
        'tasks':[('1. 날짜를 찾아 동그라미 해요.','3월 1일     7월 17일     10월 3일     10월 9일','10월 3일'),
                 ('2. 이야기를 순서대로 이어요.','곰과 범의 이야기  /  하늘이 열린 이야기  /  단군왕검 이야기','하늘이 열린 이야기 → 곰과 범의 이야기 → 단군왕검 이야기'),
                 ('3. 나의 말로 한 문장','개천절은 ________________________________________________','10월 3일, 하늘이 열린 전승과 고조선의 시작을 기리는 국경일'),
                 ('4. 모두를 이롭게 하는 행동을 그리거나 써요.','________________________________________________________','친구의 의견을 듣고 함께 정리하는 행동 등')],
        'note':'동물이 사람으로 변했다는 이야기는 “옛이야기 속에서”로 말해요. 실제 사실이라고 가르치지 않아요.'},
 '3-4':{'name':'3–4학년','title':'이야기와 자료를 구분해요','goal':'개천절을 설명하고 전승과 교육용 상상 그림을 구분해요.',
        'tasks':[('1. 개천절을 설명해요.','개천절은 ______월 ______일이며, ____________________________ 기립니다.','10월 3일 / 하늘이 열린 전승과 고조선의 시작'),
                 ('2. 알맞은 말을 붙여요.','“곰이 사람이 되었다.” → ( 사실 / 전승 )','전승. 『삼국유사』에 전해지는 이야기'),
                 ('3. 그림과 유물','화면 속 청동기 마을 그림은 ( 실제 사진 / 상상 재구성 )입니다.','상상 재구성. 발굴된 유물과 구분'),
                 ('4. 우리 반 홍익인간','친구 의견을 존중하며 모두에게 도움이 되는 방법을 제안해요.','사람을 널리 이롭게 한다는 뜻을 존중과 협력으로 적용')],
        'note':'『삼국유사』는 고려 시대에 편찬된 기록입니다. 기록의 존재와 장면 전체의 실증은 다른 문제예요.'},
 '5-6':{'name':'5–6학년','title':'전승과 증거를 비교해요','goal':'문헌, 유물, 상상 재구성을 구분하고 근거를 들어 설명해요.',
        'tasks':[('1. 자료의 종류를 적어요.','『삼국유사』 / 비파형 동검 / 교육용 생성 마을 그림','문헌 / 실제 출토 유물 / 상상 재구성'),
                 ('2. 주장과 근거','“단군이 정확히 양력 10월 3일 나라를 세웠다.”를 확정 사실로 말할 수 있을까요?','아니요. 10월 3일은 기념일이며 정확한 고대 건국 날짜는 실증되지 않음'),
                 ('3. 유물이 알려 주는 범위','비파형 동검의 분포로 알 수 있는 것 1개와 알 수 없는 것 1개를 적어요.','청동기 문화의 분포는 탐구 가능 / 특정 인물의 대화나 정확한 건국일은 알 수 없음'),
                 ('4. 홍익인간의 현재적 적용','상대의 의사를 존중하면서 모두에게 이로운 교실 규칙을 제안해요.','의견을 듣고 함께 결정하는 실천 및 그 이유')],
        'note':'기원전 2333년은 전승과 기년 체계의 연도입니다. 실증된 정확한 건국 연도로 제시하지 않아요.'}
}

def para(c,text,x,y,width,size=11,bold=False,color=INK):
 style=ParagraphStyle('k',fontName='MalgunBold' if bold else 'Malgun',fontSize=size,leading=size*1.65,textColor=color,wordWrap='CJK')
 p=Paragraph(escape(text),style); _,height=p.wrap(width,900);p.drawOn(c,x,y-height);return y-height

def line(c,y):
 c.setStrokeColor(colors.HexColor('#CBD9CC'));c.line(50,y,W-50,y)

def header(c,grade,audience,title,page):
 c.setFillColor(INK);c.rect(0,H-84,W,84,fill=1,stroke=0)
 c.setFillColor(colors.HexColor('#F8F3E8'));c.setFont('MalgunBold',10);c.drawString(50,H-36,'오늘의 국경일  /  개천절')
 c.setFont('MalgunBold',20);c.drawString(50,H-65,title)
 c.setFont('Malgun',10);c.drawRightString(W-50,H-39,f'{grade} · {audience}')
 c.setFillColor(MUTED);c.setFont('Malgun',9);c.drawString(50,32,'전승은 전승으로, 발굴 자료는 근거로 살펴보아요.')
 c.drawRightString(W-50,32,str(page));line(c,47)

def draw(grade,audience,spec):
 teacher=audience=='교사용';path=OUT/f'gaecheon-{grade}-{"teacher" if teacher else "student"}.pdf'
 c=canvas.Canvas(str(path),pagesize=A4,pageCompression=1);c.setTitle(f'개천절 {spec["name"]} {audience}');c.setAuthor('오늘의 국경일')
 header(c,spec['name'],audience,spec['title'],1)
 y=H-105
 y=para(c,'오늘의 목표',50,y,W-100,12,True,GOLD)-3
 y=para(c,spec['goal'],50,y,W-100,12)-18
 if not teacher:
  c.setFont('Malgun',10);c.setFillColor(MUTED);c.drawString(50,y,'이름: ___________________     날짜: ___________________');y-=30
 for idx,(question,prompt,answer) in enumerate(spec['tasks']):
  c.setFillColor(PALE);c.roundRect(48,y-32,W-96,38,8,stroke=0,fill=1)
  y=para(c,question,58,y-3,W-116,12,True)-20
  y=para(c,prompt,58,y,W-116,11)-15
  if teacher:y=para(c,'지도·예상 답: '+answer,58,y,W-116,10,False,GOLD)-21
  else:
   line(c,y);y-=29
   if idx in (2,3):line(c,y);y-=22
  if y<100:raise RuntimeError(f'Page 1 overflow {path}: {y}')
 c.showPage();header(c,spec['name'],audience,'그림을 보고 생각을 넓혀요',2)
 img=ROOT/'site'/'dist'/'assets'/('gaecheon-community.png' if grade=='5-6' else 'gaecheon-bear-tiger.png')
 c.drawImage(str(img),50,H-342,width=W-100,height=220,preserveAspectRatio=False)
 c.setFillColor(MUTED);c.setFont('Malgun',9);c.drawString(50,H-355,'교육용 생성 삽화 · 실제 사건이나 발굴 현장의 사진이 아닙니다.')
 y=H-395
 if teacher:
  for text in ['그림을 보며 “무엇이 보이나요?”와 “무엇을 짐작하나요?”를 나누어 질문하세요.',spec['note'],
               '고조선은 우리 역사에서 처음 등장하는 국가로 배우되, 단군 서사의 모든 장면이 확인된 사건이라고 단정하지 않습니다.',
               '근거: 행정안전부 국경일 안내 / 우리역사넷 단군과 고조선 / 한국민족문화대백과 개천절']:
   y=para(c,'• '+text,52,y,W-104,11)-22
 else:
  for text in ['그림에서 직접 보이는 것 2개를 적어요.','옛이야기로 전해지는 내용 1개를 적어요.','이 그림만으로는 확인할 수 없는 것 1개를 적어요.']:
   y=para(c,text,52,y,W-104,12,True)-13
   line(c,y);y-=47
 c.save();assert len(PdfReader(str(path)).pages)==2
 return path

if __name__=='__main__':
 OUT.mkdir(parents=True,exist_ok=True)
 for grade,spec in SHEETS.items():
  for audience in ('학생용','교사용'):
   print(draw(grade,audience,spec))
