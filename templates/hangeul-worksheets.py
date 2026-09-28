"""Generate and visually verify printable Hangeul Day worksheets.

Source of truth: content/hangeul-data.js (exported by the content author).
Final artifacts: output/hangeul/worksheets/hangul-*-student|teacher.pdf.
The worksheet data adapter is defined below once the content file is ready.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import hashlib
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "hangeul" / "worksheets"
QA = ROOT / "tmp" / "pdfs" / "hangeul"
RUNTIME = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies"
NODE = RUNTIME / "node/bin/node.exe"
PDFTOPPM = RUNTIME / "native/poppler/Library/bin/pdftoppm.exe"
W, H = A4
MARGIN = 43
CONTENT_W = W - MARGIN * 2
INK = colors.HexColor("#182C39")
TEAL = colors.HexColor("#145B58")
MUTED = colors.HexColor("#58646A")
LINE = colors.HexColor("#B8C6C8")
PALE = colors.HexColor("#F1F5F4")
WHITE = colors.white


def register_fonts():
    for name, filename in (("Malgun", "malgun.ttf"), ("MalgunBold", "malgunbd.ttf")):
        path = Path("C:/Windows/Fonts") / filename
        if not path.is_file():
            raise FileNotFoundError(path)
        pdfmetrics.registerFont(TTFont(name, str(path)))
    pdfmetrics.registerFontFamily("Malgun", normal="Malgun", bold="MalgunBold")


def clean(value):
    return str(value).replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")


def make_para(text, size=12, leading=None, bold=False, color=INK):
    style = ParagraphStyle(
        "worksheet", fontName="MalgunBold" if bold else "Malgun", fontSize=size,
        leading=leading or size * 1.5, textColor=color, wordWrap="CJK", alignment=TA_LEFT,
        allowWidows=0, allowOrphans=0,
    )
    return Paragraph(escape(clean(text)).replace("\n", "<br/>"), style)


class Sheet:
    def __init__(self, path, grade, title, audience, total_pages):
        self.path = path
        self.grade = grade
        self.title = title
        self.audience = audience
        self.total_pages = total_pages
        self.page = 0
        self.positions = []
        self.c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
        self.c.setTitle(f"한글날 {grade}학년 {audience}")
        self.c.setAuthor("국경일 교육 자료")
        self.c.setSubject("한글날 학습목표 확인 자료" if audience == "학생용" else "한글날 정답 및 지도 해설")
        self.c.setKeywords(f"한글날, {grade}학년, {audience}")

    def paragraph(self, text, x, y, width, size=12, bold=False, color=INK, leading=None):
        p = make_para(text, size=size, leading=leading, bold=bold, color=color)
        _, ph = p.wrap(width, H)
        if y - ph < 45:
            raise ValueError(f"Text falls below footer: {self.path.name}, page {self.page}: {text[:60]}")
        p.drawOn(self.c, x, y - ph)
        self.positions.append({"page": self.page, "x": x, "top": y, "bottom": y-ph, "text": str(text)})
        return y - ph

    def new_page(self, subtitle, objective=None):
        if self.page:
            self.footer()
            self.c.showPage()
        self.page += 1
        c = self.c
        c.setFillColor(TEAL if self.audience == "학생용" else INK)
        c.rect(0, H - 9, W, 9, fill=1, stroke=0)
        c.setFont("MalgunBold", 10)
        c.setFillColor(TEAL)
        c.drawString(MARGIN, H - 39, f"한글날  ·  {self.grade}학년")
        c.setFont("Malgun", 9)
        c.setFillColor(MUTED)
        c.drawRightString(W - MARGIN, H - 39, self.audience)
        y = self.paragraph(subtitle, MARGIN, H - 56, CONTENT_W, size=24, bold=True, leading=33)
        y -= 11
        if objective:
            y = self.paragraph(objective, MARGIN, y, CONTENT_W, size=10.5, color=MUTED, leading=16)
            y -= 14
        else:
            y -= 5
        c.setStrokeColor(LINE)
        c.setLineWidth(.6)
        c.line(MARGIN, y, W - MARGIN, y)
        self.y = y - 20
        return self.y

    def question(self, number, title, prompt, size=12.2):
        c = self.c
        c.setFillColor(TEAL)
        c.roundRect(MARGIN, self.y - 23, 26, 26, 7, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("MalgunBold", 12)
        c.drawCentredString(MARGIN + 13, self.y - 15, str(number))
        y = self.paragraph(title, MARGIN + 37, self.y + 2, CONTENT_W - 37, size=15.5, bold=True, leading=23)
        self.y = min(self.y - 32, y - 11)
        if prompt:
            self.y = self.paragraph(prompt, MARGIN, self.y, CONTENT_W, size=size, leading=size*1.6) - 12

    def box(self, height, label=None, lines=0):
        y = self.y
        if y-height < 65:
            raise ValueError(f"Answer box below margin: {self.path.name}, page {self.page}, y={y}, height={height}")
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(.8)
        self.c.roundRect(MARGIN, y-height, CONTENT_W, height, 8, stroke=1, fill=0)
        if label:
            self.paragraph(label, MARGIN+12, y-10, CONTENT_W-24, size=9.5, color=MUTED)
        if lines:
            usable_top = y - (33 if label else 12)
            usable_bottom = y-height+13
            step = (usable_top-usable_bottom) / lines
            self.c.setStrokeColor(colors.HexColor("#D2DADC"))
            self.c.setLineWidth(.45)
            for i in range(lines):
                ly = usable_bottom + i*step
                self.c.line(MARGIN+12, ly, W-MARGIN-12, ly)
        self.y = y-height-22

    def note(self, text, size=10.2, fill=PALE):
        p = make_para(text, size=size, leading=size*1.6, color=MUTED)
        _, ph = p.wrap(CONTENT_W-24, H)
        height = ph+20
        if self.y-height < 61:
            raise ValueError(f"Note below margin: {self.path.name}, page {self.page}")
        self.c.setFillColor(fill)
        self.c.roundRect(MARGIN, self.y-height, CONTENT_W, height, 7, fill=1, stroke=0)
        p.drawOn(self.c, MARGIN+12, self.y-height+10)
        self.y -= height+16

    def choices(self, values, size=12.5, columns=1):
        gap = 12
        width = (CONTENT_W-gap*(columns-1))/columns
        rows = []
        for start in range(0, len(values), columns):
            row = values[start:start+columns]
            phs = [make_para(v,size=size).wrap(width-38,H)[1] for v in row]
            height = max(phs)+24
            if self.y-height < 65:
                raise ValueError("Choice area overflows")
            for j,v in enumerate(row):
                x = MARGIN+j*(width+gap)
                self.c.setStrokeColor(LINE)
                self.c.setFillColor(WHITE)
                self.c.roundRect(x,self.y-height,width,height,7,stroke=1,fill=1)
                self.c.rect(x+12,self.y-24,8,8,stroke=1,fill=0)
                self.paragraph(v,x+29,self.y-11,width-39,size=size)
            self.y -= height+gap
        self.y -= 9

    def footer(self):
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(.5)
        self.c.line(MARGIN,42,W-MARGIN,42)
        self.c.setFillColor(MUTED)
        self.c.setFont("Malgun",8)
        self.c.drawString(MARGIN,28,f"한글날 · {self.grade}학년 · {self.audience}")
        self.c.drawRightString(W-MARGIN,28,f"{self.page} / {self.total_pages}")

    def save(self):
        if self.page != self.total_pages:
            raise ValueError(f"Expected {self.total_pages} pages; rendered {self.page}")
        self.footer()
        self.c.save()
        return self.positions


QUESTION_TITLES = {
    "1-2": ["한글날을 찾아요", "글자는 어디에 있을까요?", "낱자를 모아요", "친구에게 마음을 전해요"],
    "3-4": ["만든 때와 알린 때", "낱자가 모이면", "세종의 마음을 생각해요", "쉬운 안내문을 만들어요"],
    "5-6": ["말과 문자를 구별해요", "사실에 맞게 고쳐요", "핵심 정보를 지켜요", "수정한 까닭을 설명해요"],
}
GRADE_HELP = {
    "1-2": [
        "1번: 10월 9일을 선택하면 날짜를 이해한 것으로 봅니다. 5월 5일이나 1월 1일을 골랐다면 한글날 달력을 다시 확인하고 고쳐 답하게 합니다.",
        "2번: 이름표·책·안내판처럼 실제 글자가 있는 곳을 말하면 인정합니다. 한 낱말·그림·구술도 가능합니다. ‘글자가 어떤 것을 알려 주었나요?’라고 한 번 더 묻습니다.",
        "3번: 수업의 ㄴ+ㅏ=나를 새 글자에 옮겨 ㅁ과 ㅏ를 모아 쓴 ‘마’를 고릅니다. ‘머’는 모음이 다르고 ‘나’는 자음이 다릅니다. 빠른 읽기보다 조합을 살펴보았는지 확인합니다.",
        "4번: 고마움·초대·응원처럼 친구에게 전하려는 뜻이 있으면 인정합니다. 그림만 있는 경우 교사가 뜻을 물어 구술 응답을 받습니다. 글씨 모양과 그림 솜씨는 평가하지 않습니다.",
    ],
    "3-4": [
        "1번: 1443년-창제, 1446년-반포를 모두 연결하면 충분합니다. 하나만 맞으면 사건의 뜻을 다시 확인합니다. ‘만들기’와 ‘널리 알리기’라는 쉬운 표현도 인정합니다.",
        "2번: 모아 쓰면 ‘글’, 받침 ㄹ을 빼면 ‘그’가 됩니다. 수업에서 본 ‘한→하’와 같은 원리를 새 글자에 적용하는지 봅니다. 하나만 맞으면 낱자 카드로 받침이 있는 경우와 없는 경우를 비교하게 합니다.",
        "3번: 쉽게 배우고 쓰기, 자기 뜻을 글로 전하기 중 핵심 취지가 드러나면 인정합니다. ‘글자가 멋져서’만 적었다면 자료에서 누구의 어떤 어려움을 돕고자 했는지 다시 찾습니다.",
        "4번: ‘들어가기 전’이라는 때, 급식실이라는 장소, 손을 씻는 행동이 살아 있어야 합니다. ‘입장·세정·요망’을 1학년이 알 만한 말로 바꾸었는지 봅니다. 표현이 예시와 달라도 인정합니다. ‘손을 깨끗이 해요’처럼 때·장소가 빠진 문장은 보완합니다.",
    ],
    "5-6": [
        "1번: 한글은 문자, 한국어는 언어라는 구별을 확인합니다. 다른 보기는 말과 문자를 혼동합니다. ‘안녕’과 ‘annyeong’은 같은 한국어를 다른 문자로 적은 사례로 보충할 수 있습니다.",
        "2번: 1443년 창제와 1446년 반포를 모두 구별하면 충분합니다. ‘처음’만 지우기보다 각각의 사건을 설명하게 합니다. 10월 9일을 확인된 창제 날짜로 설명하지 않습니다.",
        "3번: 수업 활동의 체육관 안내와 다른 새 문장입니다. 오늘·오후 1시·도서관·필기구와 모이기·가져오기 행동을 보존해야 합니다. 13:00을 오후 1시로 바르게 옮겼는지, 원문에 없는 정보를 추가하거나 준비물을 없애지 않았는지 봅니다. 문장 수는 제한하지 않습니다.",
        "4번: 구체적인 수정, 독자가 이해하기 쉬워진 점, 뜻을 쉽게 전하도록 돕는 창제 목적의 연결을 확인합니다. 한 요소가 빠지면 그 요소를 묻고 보완하게 합니다. 꾸미기나 짧은 길이만을 이유로 제시한 답은 다시 생각합니다.",
    ],
}


def load_data():
    text = (ROOT / "content/hangeul-data.js").read_text(encoding="utf-8-sig")
    match = re.fullmatch(r"\s*window\.HANGEUL_DATA\s*=\s*(\{.*\})\s*;?\s*", text, flags=re.S)
    if not match:
        raise ValueError("Unexpected content data format")
    data = json.loads(match.group(1))
    for grade in ("1-2", "3-4", "5-6"):
        assert len(data["grades"][grade]["worksheet"]) == 4
    return data


def draw_tiles(sheet, tiles, captions=None, size=30, blank=False):
    width = (CONTENT_W-24*(len(tiles)-1))/len(tiles)
    height = 70
    for i, txt in enumerate(tiles):
        x = MARGIN+i*(width+24)
        sheet.c.setStrokeColor(LINE)
        sheet.c.roundRect(x, sheet.y-height, width, height, 8, fill=0, stroke=1)
        sheet.c.setFont("MalgunBold",size)
        sheet.c.setFillColor(INK)
        sheet.c.drawCentredString(x+width/2,sheet.y-45,clean(txt))
        if captions:
            sheet.paragraph(captions[i],x+6,sheet.y-height-7,width-12,size=9.5,color=MUTED)
    sheet.y -= height+(36 if captions else 22)


def student_pdf(grade, lesson):
    sheet=Sheet(OUT/f"hangul-{grade}-student.pdf",grade,lesson["title"],"학생용",2)
    qs=lesson["worksheet"]
    titles=QUESTION_TITLES[grade]
    sheet.new_page(lesson["title"],"생각하고, 표현하고, 설명을 들은 뒤 다시 고쳐 보세요.")
    if grade=="1-2":
        sheet.note("문제는 선생님과 함께 읽어요. 쓰기 어려우면 가리키거나 말해도 좋아요.",size=11)
        sheet.question(1,titles[0],qs[0]["prompt"],size=14)
        sheet.choices(qs[0]["options"],size=17,columns=3)
        sheet.question(2,titles[1],qs[1]["prompt"],size=14)
        sheet.box(90,label="글자나 그림으로 나타내도 좋아요.",lines=0)
        sheet.question(3,titles[2],qs[2]["prompt"],size=14)
        draw_tiles(sheet,qs[2]["options"],size=35)
        sheet.new_page("내 마음을 담은 쪽지","친구에게 전하고 싶은 말을 생각해요.")
        sheet.question(4,titles[3],qs[3]["prompt"],size=14)
        sheet.note("받는 친구를 떠올리고, 전하고 싶은 말을 글자와 그림으로 표현해요.",size=11.5)
        sheet.box(350,label="쪽지 꾸미는 곳",lines=0)
        sheet.note("친구에게 내 쪽지의 뜻을 말해 보아요.",size=12)
    elif grade=="3-4":
        sheet.question(1,titles[0],qs[0]["prompt"])
        draw_tiles(sheet,["1443년", "1446년"],captions=["일어난 일: __________________", "일어난 일: __________________"],size=22)
        sheet.question(2,titles[1],qs[1]["prompt"])
        draw_tiles(sheet,["", ""],captions=["ㄱ, ㅡ, ㄹ을 모아 쓰면", "ㄹ을 빼면"],size=30)
        sheet.question(3,titles[2],qs[2]["prompt"])
        sheet.box(102,lines=3)
        sheet.new_page("읽는 사람을 위한 안내","뜻은 정확하게, 표현은 이해하기 쉽게 바꾸어요.")
        sheet.question(4,titles[3],qs[3]["prompt"])
        sheet.note("읽을 사람: 1학년 동생\n원래 안내: 급식실 입장 시 손 세정 요망",size=12)
        sheet.box(133,label="내가 바꾼 안내문",lines=4)
        sheet.box(112,label="동생에게 도움이 되는 점",lines=3)
        sheet.note("다시 읽어 보기  |  1학년 동생이 언제, 어디에서, 무엇을 해야 할지 알 수 있나요?",size=10.5)
    else:
        sheet.question(1,titles[0],qs[0]["prompt"])
        sheet.choices(qs[0]["options"],size=12)
        sheet.question(2,titles[1],qs[1]["prompt"])
        sheet.box(112,lines=3)
        sheet.note("정확히 구별했나요?  |  말과 문자 / 새로 만든 일과 널리 알린 일",size=10.5)
        sheet.new_page("읽는 사람을 생각하는 글","원래의 정보를 지키면서, 이해하기 어려운 표현을 바꾸어요.")
        sheet.question(3,titles[2],qs[2]["prompt"])
        sheet.box(112,label="내가 고친 안내문",lines=3)
        sheet.question(4,titles[3],qs[3]["prompt"])
        sheet.note("생각을 돕는 자료 | 국립한글박물관의 창제 목적 설명을 쉬운 말로 다시 쓴 내용입니다.\n세종은 사람들이 쉽게 배우고 자기 뜻을 글로 전할 수 있도록 새 글자를 만들었습니다.",size=10.2)
        sheet.box(135,label="수정한 표현 + 읽는 사람에게 도움이 되는 점 + 창제 목적과의 연결",lines=4)
    positions=sheet.save()
    return sheet.path, positions


def teacher_pdf(grade,lesson,data):
    sheet=Sheet(OUT/f"hangul-{grade}-teacher.pdf",grade,lesson["title"],"교사용 정답·해설",2)
    qs=lesson["worksheet"]
    titles=QUESTION_TITLES[grade]
    sheet.new_page("정답과 수업 피드백","학생용 4문항에 대응하는 교사용 자료입니다. 학생 배부용과 구분해 주세요.")
    sheet.note("학습목표\n"+"\n".join(lesson["objectives"]),size=10.8)
    for i in (0,1):
        sheet.question(i+1,titles[i],qs[i]["prompt"],size=10.8)
        sheet.note("정답·허용 답: "+qs[i]["answer"],size=11)
        sheet.y=sheet.paragraph(GRADE_HELP[grade][i],MARGIN,sheet.y,CONTENT_W,size=10.4,leading=16)-21
    sheet.new_page("표현과 적용을 확인해요","말·글·그림 중 학생이 뜻을 드러낼 수 있는 방식으로 응답하게 합니다.")
    for i in (2,3):
        sheet.question(i+1,titles[i],qs[i]["prompt"],size=10.8)
        sheet.note("정답·허용 답: "+qs[i]["answer"],size=10.5)
        sheet.y=sheet.paragraph(GRADE_HELP[grade][i],MARGIN,sheet.y,CONTENT_W,size=10.1,leading=15.5)-17
    sheet.note("관찰 기준: 목표에 맞게 설명하면 ‘충분함’, 핵심 일부만 보이면 ‘보완하기’, 아직 연결하지 못하면 ‘함께 다시 보기’로 피드백합니다. 빠른 답·글씨 모양·그림 솜씨로 판단하지 않습니다.",size=9.4)
    source_text="내용 근거: 국립한글박물관 ‘훈민정음, 천년의 문자 계획’ · 국립국어원 ‘한글의 탄생’, ‘한글의 구성’. 안내문·학습 활동은 수업용 창작 예시입니다."
    sheet.y=sheet.paragraph(source_text,MARGIN,sheet.y,CONTENT_W,size=8.4,color=MUTED,leading=12.5)
    positions=sheet.save()
    return sheet.path,positions


def verify_and_render(paths,data_hash):
    report={"data_sha256":data_hash,"pdfs":[]}
    images=[]
    for path in paths:
        reader=PdfReader(str(path))
        assert len(reader.pages)==2
        student="student" in path.name
        text="\n".join(p.extract_text() or "" for p in reader.pages)
        assert "한글" in text and "\ufffd" not in text
        if student:
            assert "정답·허용 답" not in text and "교사용" not in str(reader.metadata)
        font_count=0
        for page in reader.pages:
            assert abs(float(page.mediabox.width)-W)<.1
            assert abs(float(page.mediabox.height)-H)<.1
            for ref in page["/Resources"]["/Font"].values():
                font=ref.get_object()
                descriptor=font.get("/FontDescriptor")
                if descriptor:
                    desc=descriptor.get_object()
                    if desc.get("/FontFile2"):
                        font_count+=1
        assert font_count>=2
        prefix=QA/path.stem
        subprocess.run([str(PDFTOPPM),"-png","-r","110",str(path),str(prefix)],check=True,capture_output=True)
        rendered=sorted(QA.glob(path.stem+"-*.png"))
        assert len(rendered)==2
        images.extend(rendered)
        report["pdfs"].append({"file":str(path.relative_to(ROOT)),"pages":len(reader.pages),"embedded_ttf_font_occurrences":font_count,"audience":"student" if student else "teacher","renders":[p.name for p in rendered],"size_bytes":path.stat().st_size})
    # Contact sheets are QA intermediates, never delivered as worksheet pages.
    for kind in ("student","teacher"):
        selected=[p for p in images if kind in p.stem]
        thumbs=[]
        for path in selected:
            im=Image.open(path).convert("RGB")
            im.thumbnail((620,877))
            thumb=Image.new("RGB",(650,917),"#e1e5e7")
            thumb.paste(im,((650-im.width)//2,20))
            ImageDraw.Draw(thumb).text((12,897),path.name,fill="black")
            thumbs.append(thumb)
        contact=Image.new("RGB",(650*3,917*2),"white")
        for i,im in enumerate(thumbs):
            contact.paste(im,((i//2)*650,(i%2)*917))
        contact.save(QA/f"contact-{kind}.png")
    (QA/"verification.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--prepare-only", action="store_true")
    args = parser.parse_args()
    register_fonts()
    OUT.mkdir(parents=True, exist_ok=True)
    QA.mkdir(parents=True, exist_ok=True)
    if args.prepare_only:
        print(json.dumps({"fonts": ["Malgun", "MalgunBold"], "output": str(OUT), "renderer": str(PDFTOPPM), "renderer_exists": PDFTOPPM.is_file()}, ensure_ascii=False))
        return
    data=load_data()
    paths=[]
    positions={}
    for grade,lesson in data["grades"].items():
        for builder in (student_pdf,teacher_pdf):
            path,boxes=builder(grade,lesson) if builder is student_pdf else builder(grade,lesson,data)
            paths.append(path)
            positions[path.name]=boxes
    (QA/"layout-positions.json").write_text(json.dumps(positions,ensure_ascii=False,indent=2),encoding="utf-8")
    data_hash=hashlib.sha256((ROOT/"content/hangeul-data.js").read_bytes()).hexdigest()
    report=verify_and_render(paths,data_hash)
    print(json.dumps({"files":len(report["pdfs"]),"pages":sum(p["pages"] for p in report["pdfs"]),"qa":str(QA)},ensure_ascii=True))


if __name__ == "__main__":
    main()
