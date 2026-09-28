"""Create six self-contained, historically qualified Gaecheonjeol worksheets.

Run from the repository root:  python templates/gaecheon-worksheets.py
Pages are laid out top-down. Any block that would cross the footer raises instead of
overflowing silently, and every PDF must come out at exactly two pages.
"""
from pathlib import Path
import shutil
import tempfile
from xml.sax.saxutils import escape
from PIL import Image
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
ASSETS=ROOT/'site'/'dist'/'assets'
W,H=A4
L=50;R=W-50;CW=R-L;TOP=H-102;BOTTOM=62
INK=colors.HexColor('#214838'); GOLD=colors.HexColor('#BA754E'); MUTED=colors.HexColor('#64766B'); PALE=colors.HexColor('#EAF1E8')
RULE=colors.HexColor('#CBD9CC'); GREEN=colors.HexColor('#2F6B4F'); CREAM=colors.HexColor('#FFF4E0'); SOFT=colors.HexColor('#F6F8F4'); WHITE=colors.white
pdfmetrics.registerFont(TTFont('Malgun','C:/Windows/Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('MalgunBold','C:/Windows/Fonts/malgunbd.ttf'))
pdfmetrics.registerFontFamily('Malgun',normal='Malgun',bold='MalgunBold',italic='Malgun',boldItalic='MalgunBold')
TMP=Path(tempfile.mkdtemp(prefix='gaecheon-worksheets-'))

LOOK='그림을 보며 “무엇이 보이나요?”와 “무엇을 짐작하나요?”를 나누어 질문하세요.'
GOJOSEON='고조선은 우리 역사에서 처음 등장하는 국가로 배우되, 단군 서사의 모든 장면이 확인된 사건이라고 단정하지 않습니다.'
SOURCE_LINE='근거: 행정안전부 국경일 안내 / 우리역사넷 「우리 역사 속 최초의 국가, 고조선」 / 한국민족문화대백과 개천절'
LEVELS=(('충분함',GREEN),('보완하기',GOLD),('함께 다시 보기',MUTED))

SHEETS={
 '1-2':{'name':'1–2학년','title':'하늘이 열린 이야기','page2':'그림을 보고 말해요','image':'gaecheon-bear-tiger',
        'goal':'개천절 날짜를 알고, 옛이야기를 순서대로 말해요.',
        'footer':'옛이야기는 “옛이야기 속에서는”을 붙여 말해요.',
        # Shuffled display order; the number is the story order written in the box (tablet uses the same cards).
        'story':[('gaecheon-bear-tiger','곰과 범',2),('gaecheon-community','단군왕검과 고조선',3),('gaecheon-tree','환웅이 내려옴',1)],
        'teacher_notes':[LOOK,
                         '앞쪽 ②의 정답 순서: 환웅이 내려옴(1) → 곰과 범(2) → 단군왕검과 고조선(3). ③의 빈칸은 ‘시작’입니다.',
                         '뒤쪽 ①의 정답: 곰·범·동굴·소나무. 자동차와 비행기는 그림에 없어요. 보이는 것과 짐작한 것을 나누어 말하게 합니다.',
                         '뒤쪽 ②는 쓰지 않고 말하기로 확인합니다. 예: “옛이야기 속에서는 곰이 끝까지 참아서 웅녀가 되었대요.”',
                         '동물이 사람으로 변했다는 이야기는 “옛이야기 속에서”로 말해요. 실제 사실이라고 가르치지 않아요.',
                         GOJOSEON],
        'levels':['10월 3일을 고르고, 세 그림을 이야기 순서(환웅 → 곰과 범 → 단군왕검)로 놓으며, 한 장면을 “옛이야기 속에서는”을 붙여 말한다.',
                  '날짜나 순서 가운데 하나를 헷갈리거나, 이야기 장면을 진짜 있었던 일처럼 말한다. 그림을 다시 보며 “옛이야기 속에서는”을 붙여 말하게 한다.',
                  '날짜와 순서를 모두 어려워한다. 교사 화면의 그림으로 한 장면씩 다시 짚고, 날짜 카드로 10월 3일을 함께 찾는다.']},
 '3-4':{'name':'3–4학년','title':'이야기와 자료를 구분해요','page2':'우리 반 홍익인간 약속 카드','image':'gaecheon-helping-today',
        'goal':'개천절의 뜻을 설명하고, 전승과 기록이 알려 주는 것을 구분해요.',
        'tasks':[('1. 개천절을 설명해요.','개천절은 ______월 ______일이며, ______________________________________________________ 기립니다.','10월 3일 / 하늘이 열렸다는 이야기(전승)와 고조선의 시작',[]),
                 ('2. 알맞은 말에 ○ 해요.','“곰이 사람이 되었다는 이야기” → ( 사실 / 전승 )','전승. 『삼국유사』에 전해지는 이야기',['까닭:']),
                 ('3. 기록이 알려 주는 것','『삼국유사』에 단군 이야기가 실려 있다는 것이 알려 주는 것에 ○ 해요:\n( 곰이 실제로 사람이 되었다 / 이 이야기가 오래전부터 전해졌다 )','이 이야기가 오래전부터 전해졌다. 기록이 있다는 것과 장면이 사실이라는 것은 다름',['까닭:']),
                 ('4. 개천절이 국경일이 된 길','10월 3일은 ( 옛 기록에 적힌 나라를 세운 날 / 1949년에 국경일로 정한 기념일 )입니다.','1949년에 국경일로 정한 기념일. 옛 기록에는 나라를 세운 달·날이 없고, 1909년 대종교가 음력으로 기념하던 날을 1949년 법으로 양력에 정함',['까닭:'])],
        'teacher_notes':['뒤쪽 약속 카드 예시: 누구에게 — 새로 온 친구에게 / 어떤 도움을 — 급식실과 도서관 가는 길을 함께 가 줄게요 / 왜 — 낯선 학교에서 덜 불안하도록 / 먼저 물어볼 말 — “같이 가 줄까?”',
                         '도움받는 사람의 뜻을 묻지 않고 대신 해 주는 약속은 “먼저 물어보기”를 넣어 고치게 합니다. 특정 학생을 도움받는 사람으로 적지 않고 상황을 중심으로 씁니다.',
                         '『삼국유사』는 고려 시대에 편찬된 기록입니다. 기록의 존재와 장면 전체의 실증은 다른 문제예요.',GOJOSEON],
        'levels':['개천절을 날짜와 뜻(하늘이 열렸다는 이야기·고조선의 시작)으로 설명하고, 곰 이야기를 ‘전승’으로, 『삼국유사』가 알려 주는 것을 ‘오래전부터 전해졌다’로, 10월 3일을 ‘1949년에 정한 기념일’로 고르며 까닭을 말한다.',
                  '답은 맞지만 까닭을 말하지 못하거나, 기록이 남아 있으니 이야기 장면도 사실이라고 생각한다. “기록이 있다는 것과 장면이 사실이라는 것은 같을까?”를 다시 묻는다.',
                  '전승과 사실을 구분하지 못한다. “진짜 있었던 일일까, 전해 오는 이야기일까?” 질문으로 문장을 하나씩 다시 분류한다.']},
 '5-6':{'name':'5–6학년','title':'전승과 증거를 비교해요','page2':'기록으로 짐작하고 실천을 제안해요','image':'gaecheon-community',
        'goal':'문헌, 유물, 상상 재구성을 구분하고 근거를 들어 설명해요.',
        'tasks':[('1. 자료의 종류를 적어요.','『삼국유사』 / 비파형 동검 / 교육용 생성 마을 그림','문헌 / 실제 출토 유물 / 상상 재구성',['']),
                 ('2. 주장과 근거','“단군이 정확히 양력 10월 3일 나라를 세웠다.”를 근거에 맞게 고쳐 써요.','예: 개천절은 해마다 10월 3일에 고조선의 시작을 기념하는 날이다. 『삼국유사』 등 옛 기록에는 건국한 달·날이 없고, 10월 3일은 대종교가 음력으로 기념하던 날을 1949년 법으로 양력에 정한 기념일임',['','']),
                 ('3. 유물이 알려 주는 범위','비파형 동검의 분포로 알 수 있는 것 1개와 알 수 없는 것 1개를 적어요.','청동기 문화의 분포는 탐구 가능 / 특정 인물의 대화나 정확한 건국일은 알 수 없음',['알 수 있는 것:','알 수 없는 것:']),
                 ('4. 원문 읽기','『삼국유사』 원문에서 곰이 여자의 몸이 되기까지 걸린 날은? ( 100일 / 21일 ) — 흔히 알려진 이야기와 다른 점을 적어요.','21일(삼칠일). 원문은 100일 동안 햇빛을 보지 말라고 했지만 곰은 금기한 지 21일 만에 여자의 몸이 되었다고 적음. 흔히 말하는 “100일 뒤”와 다름',['다른 점:'])],
        'teacher_notes':['뒤쪽 ①(범금 8조) 예시 답: 첫째 → 생명을 소중히 여김 / 둘째 → 농사를 지어 곡식이 중요함 / 셋째 → 개인 재산과 노비라는 신분이 있었고 돈(화폐)으로 죄를 갚기도 함. 출처: 『한서』 지리지(8개 조항 가운데 3개만 전함).',
                         '뒤쪽 ②(실천 제안서) 기준: 도움받는 사람에게 먼저 묻는 계획이 있는가, 실행 방법과 역할이 구체적인가, 까닭에 근거가 있는가. 특정 학생을 ‘도움이 필요한 사람’으로 지목하는 제안은 상황·환경을 바꾸는 방법으로 고치게 합니다.',
                         LOOK,
                         '기원전 2333년은 『동국통감』(1485)이 요 임금 즉위 25년 무진년을 건국 해로 본 데서 나온 연도입니다(『삼국유사』는 ‘요 즉위 50년 경인년’). 실증된 건국 연도로 제시하지 않아요.',
                         GOJOSEON,
                         '그림 속 반지하 움집·옷·밭·마을 배치는 청동기 생활을 설명하기 위한 교육용 재구성입니다. 특정 발굴터를 그대로 복원한 장면이 아니므로 세부 모양만으로 역사 사실을 단정하지 않습니다.'],
        'levels':['문헌·출토 유물·상상 재구성을 구분하고, 날짜 문장을 ‘기념일’과 ‘옛 기록에 달·날이 없음’을 근거로 고쳐 쓰며, 유물로 알 수 있는 것과 없는 것, 원문의 21일을 찾아 널리 알려진 이야기와 비교한다.',
                  '자료의 종류는 구분하지만 고쳐 쓴 문장에 근거(옛 기록, 1949년 법)가 빠졌거나, 실천 제안서의 까닭이 ‘착하게’처럼 막연하다. 근거 한 가지를 더 찾게 한다.',
                  '기록이 있다는 사실을 곧 실증으로 보거나 기념일과 건국일을 같게 본다. 자료 판단 문항과 교사 노트의 연표(1909 대종교 → 1949 법)로 다시 확인한다.']}
}

def style(size,bold=False,color=INK,leading=None):
 # Korean separates words with spaces, so wrap at spaces (like CSS keep-all) instead of CJK per-character breaks.
 return ParagraphStyle('k',fontName='MalgunBold' if bold else 'Malgun',fontSize=size,leading=leading or size*1.65,textColor=color)

def guard(y,path,what):
 if y<BOTTOM:raise RuntimeError(f'{path.name}: {what} runs into the footer (y={y:.0f})')

def para(c,text,x,y,width,size=11,bold=False,color=INK,markup=False,leading=None):
 p=Paragraph(text if markup else escape(text).replace('\n','<br/>'),style(size,bold,color,leading)); _,height=p.wrap(width,900);p.drawOn(c,x,y-height);return y-height

def line(c,y,x0=L,x1=R):
 c.setStrokeColor(RULE);c.setLineWidth(.8);c.line(x0,y,x1,y)

def picture(name,ratio,px):
 """Centre-crop the illustration to the box ratio and cache a JPEG: no stretching, small PDFs."""
 path=TMP/f'{name}-{round(ratio*1000)}-{px}.jpg'
 if not path.exists():
  im=Image.open(ASSETS/f'{name}.png').convert('RGB');w,h=im.size
  if w/h>ratio:nw=round(h*ratio);x0=(w-nw)//2;im=im.crop((x0,0,x0+nw,h))
  else:nh=round(w/ratio);y0=(h-nh)//2;im=im.crop((0,y0,w,y0+nh))
  im.thumbnail((px,px));im.save(path,'JPEG',quality=84,optimize=True)
 return str(path)

def image_box(c,name,x,top,w,h,radius=9,px=1200):
 c.saveState();p=c.beginPath();p.roundRect(x,top-h,w,h,radius);c.clipPath(p,stroke=0,fill=0)
 c.drawImage(picture(name,w/h,px),x,top-h,width=w,height=h);c.restoreState()
 c.setStrokeColor(RULE);c.setLineWidth(.8);c.roundRect(x,top-h,w,h,radius,stroke=1,fill=0)
 return top-h

def header(c,spec,audience,title,page):
 c.setFillColor(INK);c.rect(0,H-84,W,84,fill=1,stroke=0)
 c.setFillColor(colors.HexColor('#F8F3E8'));c.setFont('MalgunBold',10);c.drawString(L,H-36,'오늘의 국경일  /  개천절')
 c.setFont('MalgunBold',20);c.drawString(L,H-65,title)
 c.setFont('Malgun',10);c.drawRightString(R,H-39,f'{spec["name"]} · {audience}')
 c.setFillColor(MUTED);c.setFont('Malgun',9);c.drawString(L,32,spec.get('footer','전승은 전승으로, 발굴 자료는 근거로 살펴보아요.'))
 c.drawRightString(R,32,f'{page} / 2');line(c,47)

# ---- 1–2학년: 큰 글씨, 고르기·번호 쓰기·그리기·말하기 중심 ----
def pill(c,x,top,text,size=12.5,fill=CREAM,color=GOLD):
 h=size+13;w=pdfmetrics.stringWidth(text,'MalgunBold',size)+30
 c.setFillColor(fill);c.roundRect(x,top-h,w,h,h/2,stroke=0,fill=1)
 c.setFillColor(color);c.setFont('MalgunBold',size);c.drawString(x+15,top-h+7.6,text)
 return top-h

def ask(c,n,text,y):
 c.setFillColor(INK);c.circle(L+12,y-11,12,stroke=0,fill=1)
 c.setFillColor(WHITE);c.setFont('MalgunBold',13);c.drawCentredString(L+12,y-15.5,str(n))
 return para(c,text,L+34,y+2,CW-34,15,True,leading=22)-6

def word_boxes(c,words,top,h,size,circled=()):
 gap=12;w=(CW-gap*(len(words)-1))/len(words)
 for i,word in enumerate(words):
  x=L+i*(w+gap);assert pdfmetrics.stringWidth(word,'MalgunBold',size)<w-10,word
  c.setFillColor(WHITE);c.setStrokeColor(RULE);c.setLineWidth(1.3);c.roundRect(x,top-h,w,h,10,stroke=1,fill=1)
  c.setFillColor(INK);c.setFont('MalgunBold',size);c.drawCentredString(x+w/2,top-h/2-size*.36,word)
  if word in circled:c.setStrokeColor(GOLD);c.setLineWidth(2.6);c.ellipse(x-5,top-h-5,x+w+5,top+5,stroke=1,fill=0)
 return top-h

def story_cards(c,spec,top,teacher):
 gap=18;w=(CW-gap*2)/3;h=w/2.2;box=30
 for i,(image,label,number) in enumerate(spec['story']):
  x=L+i*(w+gap);image_box(c,image,x,top,w,h,8,700)
  assert pdfmetrics.stringWidth(label,'MalgunBold',16)<w-6,label
  c.setFillColor(INK);c.setFont('MalgunBold',16);c.drawCentredString(x+w/2,top-h-19,label)
  bx=x+w/2-box/2;by=top-h-26-box
  c.setFillColor(WHITE);c.setStrokeColor(INK);c.setLineWidth(1.5);c.roundRect(bx,by,box,box,6,stroke=1,fill=1)
  if teacher:c.setFillColor(GOLD);c.setFont('MalgunBold',20);c.drawCentredString(bx+box/2,by+8.5,str(number))
 return top-h-26-box

def boxed(c,text,top,size,markup=True,fill=PALE,pad=11,leading=None):
 p=Paragraph(text if markup else escape(text),style(size,False,INK,leading));_,ph=p.wrap(CW-pad*2,900)
 c.setFillColor(fill);c.roundRect(L,top-ph-pad*2,CW,ph+pad*2,10,stroke=0,fill=1);p.drawOn(c,L+pad,top-pad-ph)
 return top-ph-pad*2

def young_page1(c,spec,teacher,path):
 y=para(c,f'<font name="MalgunBold" color="#BA754E">오늘의 목표</font>  {escape(spec["goal"])}',L,TOP,CW,14,markup=True)-6
 bottom=pill(c,L,y,'선생님이 읽어 주면 따라 읽어요')
 if teacher:c.setFillColor(GOLD);c.setFont('MalgunBold',11);c.drawRightString(R,y-17,'정답과 지도 예시는 주황색으로 적었어요')
 else:c.setFillColor(MUTED);c.setFont('Malgun',12);c.drawRightString(R,y-17,'이름: ______________________')
 y=bottom-14
 y=ask(c,1,'개천절은 언제일까요? 알맞은 날짜에 동그라미 해요.',y)
 y=word_boxes(c,['3월 1일','7월 17일','10월 3일','10월 9일'],y-2,46,20,('10월 3일',) if teacher else ())-18
 y=ask(c,2,'이야기 순서대로 □ 안에 1, 2, 3을 써요.',y)
 y=story_cards(c,spec,y-2,teacher)-18
 y=ask(c,3,'빈칸에 알맞은 말을 써요.',y)
 blank='<font name="MalgunBold" color="#BA754E"><u>&nbsp;&nbsp;&nbsp;시작&nbsp;&nbsp;&nbsp;</u></font>' if teacher else '______________'
 y=boxed(c,f'개천절은 10월 3일,<br/>우리 역사에서 처음 세워진 나라의 {blank}을 기억하는 날',y-2,16,leading=25)-18
 y=ask(c,4,'모두에게 도움이 되는 행동을 그려요.',y)
 top=y-2;guard(top-180,path,'drawing box')
 c.setFillColor(WHITE);c.setStrokeColor(INK);c.setLineWidth(1.3);c.roundRect(L,BOTTOM,CW,top-BOTTOM,12,stroke=1,fill=1)
 if teacher:para(c,'예: 친구와 함께 교실 물건을 정리하는 모습, 넘어진 친구를 일으켜 주는 모습. 그림을 가리키며 누구에게 어떤 도움이 되는지 말하게 합니다. 글로 쓰지 않아도 됩니다.',L+14,top-12,CW-28,11,False,GOLD)
 else:c.setFillColor(MUTED);c.setFont('Malgun',12);c.drawString(L+14,BOTTOM+12,'다 그리면 누구에게 도움이 되는지 짝에게 말해요.')

def check_row(c,labels,top,size=16):
 x=L
 for label in labels:
  c.setFillColor(WHITE);c.setStrokeColor(INK);c.setLineWidth(1.4);c.roundRect(x,top-22,22,22,4,stroke=1,fill=1)
  c.setFillColor(INK);c.setFont('MalgunBold',size);c.drawString(x+32,top-17,label)
  x+=32+pdfmetrics.stringWidth(label,'MalgunBold',size)+40
 return top-22

def young_page2(c,spec,path):
 y=image_box(c,spec['image'],L,TOP,CW,235,10)
 y=para(c,'옛이야기를 상상해서 그린 그림이에요. 진짜 사진이 아니에요.',L,y-5,CW,10,False,MUTED)-16
 y=ask(c,1,'그림에서 보이는 것에 동그라미 해요.',y)
 y=word_boxes(c,['곰','범','동굴','소나무','자동차','비행기'],y-4,50,19)-26
 y=ask(c,2,'짝에게 옛이야기 한 장면을 말해요.',y)
 y=boxed(c,'<font name="MalgunBold">“옛이야기 속에서는 ……”</font> 하고 시작해 보아요.',y-2,17,leading=26)
 c.setFillColor(PALE);p=c.beginPath();p.moveTo(L+40,y);p.lineTo(L+58,y);p.lineTo(L+44,y-14);p.close();c.drawPath(p,stroke=0,fill=1)
 y=para(c,'이런 말을 넣어도 좋아요',L,y-20,CW,13,True,MUTED)-8
 x=L;top=y
 for word in ['환웅','신단수','곰과 범','쑥과 마늘','웅녀','단군왕검']:
  w=pdfmetrics.stringWidth(word,'MalgunBold',16)+22
  if x+w>R:x=L;top-=40
  c.setFillColor(CREAM);c.roundRect(x,top-32,w,32,16,stroke=0,fill=1);c.setFillColor(INK);c.setFont('MalgunBold',16);c.drawString(x+11,top-22,word);x+=w+8
 y=check_row(c,['짝에게 말했어요','짝의 이야기를 들었어요'],top-32-26)
 guard(y,path,'speaking checklist')

# ---- 3–4 / 5–6학년 ----
def task_page1(c,spec,teacher,path):
 y=para(c,'오늘의 목표',L,TOP,CW,12,True,GOLD)-3
 y=para(c,spec['goal'],L,y,CW,12)-18
 if not teacher:c.setFont('Malgun',10);c.setFillColor(MUTED);c.drawString(L,y,'이름: ___________________     날짜: ___________________');y-=30
 for question,prompt,answer,lines in spec['tasks']:
  c.setFillColor(PALE);c.roundRect(L-2,y-32,CW+4,38,8,stroke=0,fill=1)
  y=para(c,question,L+8,y-3,CW-16,12,True)-20
  y=para(c,prompt,L+8,y,CW-16,11)-8
  if teacher:y=para(c,'지도·예상 답: '+answer,L+8,y,CW-16,10,False,GOLD);guard(y,path,question);y-=24
  else:
   for label in lines:
    y-=29;x0=L+8
    if label:c.setFont('Malgun',10);c.setFillColor(MUTED);c.drawString(x0,y+4,label);x0+=pdfmetrics.stringWidth(label,'Malgun',10)+8
    line(c,y,x0,R-8)
   guard(y,path,question);y-=24 if lines else 14

# ---- 3–4 / 5–6 뒤쪽: 발표 화면의 교실 활동(약속 카드·범금 8조·실천 제안서)과 같은 칸 ----
def form_box(c,title,rows,top,path,hint=None):
 """Titled box of labelled writing rows; each row is (label, number of ruled lines)."""
 y=para(c,title,L+2,top,CW-4,13,True)-4
 if hint:y=para(c,hint,L+2,y,CW-4,10,False,MUTED)-2
 box_top=y-4;y=box_top
 lw=max(pdfmetrics.stringWidth(label,'MalgunBold',11) for label,_ in rows)+22
 for label,count in rows:
  c.setFillColor(INK);c.setFont('MalgunBold',11);c.drawString(L+12,y-20,label)
  for _ in range(count):y-=27;line(c,y,L+12+lw,R-12)
  y-=9
 c.setStrokeColor(RULE);c.setLineWidth(1);c.roundRect(L,y,CW,box_top-y,10,stroke=1,fill=0)
 guard(y,path,title)
 return y

def promise_page2(c,spec,path):
 y=image_box(c,spec['image'],L,TOP,CW,150,10)
 y=para(c,'교육용 생성 삽화 · 실제 교실 사진이 아닙니다.',L,y-5,CW,9,False,MUTED)-20
 y=form_box(c,'모둠 약속 카드',[('누구에게',1),('어떤 도움을',2),('왜',2),('먼저 물어볼 말',1)],y,path,'도움받는 사람의 생각을 먼저 물어보는 약속을 만들어요.')-24
 y=para(c,'이야기 속 장면 하나를 “~라고 전해요”로 적어요.',L+2,y,CW-4,12,True)
 for _ in range(2):y-=30;line(c,y,L+2,R-2)
 guard(y,path,'story sentence')

def proposal_page2(c,spec,path):
 y=image_box(c,spec['image'],L,TOP,CW,120,10)
 y=para(c,'교육용 생성 삽화 · 실제 발굴 현장이나 특정 마을의 복원이 아닙니다.',L,y-5,CW,9,False,MUTED)-18
 y=form_box(c,'① 범금 8조로 짐작한 고조선 사회',[('첫째: 사람을 죽이면 사형 →',1),('둘째: 다치게 하면 곡식으로 갚음 →',1),('셋째: 훔치면 노비, 50만 전으로 용서 →',1)],y,path,'각 조항으로 알 수 있는 사회의 모습을 한 가지씩 적어요.')-22
 y=form_box(c,'② 홍익인간 실천 제안서',[('문제',1),('도움받는 사람 · 먼저 물어볼 질문',1),('실행 방법과 역할',2),('모두에게 이로운 까닭',2)],y,path,'우리 학교의 작은 문제 하나를 골라 모둠에서 제안해요.')

def levels(c,rows,y,path):
 y=para(c,'평가 기준  ·  학습지는 골든벨 대신 쓰거나 다음 시간·가정에서 씁니다.',L,y,CW,11,True)-8
 for (label,fill),text in zip(LEVELS,rows):
  p=Paragraph(escape(text),style(10.2,leading=16));_,ph=p.wrap(CW-116,900);rh=max(ph,22)+14
  guard(y-rh,path,label)
  c.setFillColor(SOFT);c.roundRect(L,y-rh,CW,rh,8,stroke=0,fill=1)
  c.setFillColor(fill);c.roundRect(L+9,y-7-21,94,21,10.5,stroke=0,fill=1)
  c.setFillColor(WHITE);c.setFont('MalgunBold',10);c.drawCentredString(L+9+47,y-7-14.5,label)
  p.drawOn(c,L+114,y-7-ph);y-=rh+6
 return y

def teacher_page2(c,spec,path):
 y=image_box(c,spec['image'],L,TOP,CW,150 if spec['name']=='1–2학년' else 110,10)
 y=para(c,'교육용 생성 삽화 · 실제 사건이나 발굴 현장의 사진이 아닙니다.',L,y-5,CW,9,False,MUTED)-16
 for text in spec['teacher_notes']:
  y=para(c,'• '+text,L+2,y,CW-4,10.5,leading=16.5)-7;guard(y,path,text[:20])
 y=levels(c,spec['levels'],y-8,path)-6
 y=para(c,SOURCE_LINE,L+2,y,CW-4,9.5,False,MUTED);guard(y,path,'source line')

def draw(grade,audience,spec):
 teacher=audience=='교사용';path=OUT/f'gaecheon-{grade}-{"teacher" if teacher else "student"}.pdf'
 c=canvas.Canvas(str(path),pagesize=A4,pageCompression=1);c.setTitle(f'개천절 {spec["name"]} {audience}');c.setAuthor('오늘의 국경일')
 c.setSubject('개천절 학습지' if not teacher else '개천절 학습지 정답·지도 해설')
 header(c,spec,audience,spec['title'],1)
 (young_page1 if grade=='1-2' else task_page1)(c,spec,teacher,path)
 c.showPage();header(c,spec,audience,spec['page2'],2)
 if teacher:teacher_page2(c,spec,path)
 elif grade=='1-2':young_page2(c,spec,path)
 elif grade=='3-4':promise_page2(c,spec,path)
 else:proposal_page2(c,spec,path)
 c.save();assert len(PdfReader(str(path)).pages)==2
 return path

if __name__=='__main__':
 OUT.mkdir(parents=True,exist_ok=True)
 try:
  for grade,spec in SHEETS.items():
   for audience in ('학생용','교사용'):
    print(draw(grade,audience,spec))
 finally:shutil.rmtree(TMP,ignore_errors=True)
