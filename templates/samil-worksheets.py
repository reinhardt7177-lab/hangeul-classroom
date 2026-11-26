"""Build six A4 worksheets from the same 3·1절 questions the classroom uses."""

from io import BytesIO
import json
import os
from pathlib import Path
import subprocess
from xml.sax.saxutils import escape

from PIL import Image
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "site" / "dist"
W, H = A4
MARGIN = 44
WIDTH = W - 2 * MARGIN
INK = colors.HexColor("#1b3038")
ACCENT = colors.HexColor("#95392a")
BORDER = colors.HexColor("#a6b5b9")
SHADE = colors.HexColor("#f4f7f6")


def artwork(name):
    with Image.open(DIST / "assets" / name) as image:
        image = image.convert("RGB")
        image.thumbnail((1100, 900))
        output = BytesIO()
        image.save(output, "JPEG", quality=88)
    output.seek(0)
    return ImageReader(output)


class Worksheet:
    def __init__(self, path, grade, title, teacher):
        self.page = 0
        self.grade = grade.replace("–", "-")
        self.title = title
        self.role = "교사용" if teacher else "학생용"
        self.paper = canvas.Canvas(str(path), pagesize=A4, pageCompression=1, invariant=True)
        self.paper.setTitle(f"3·1절 {self.grade} {self.role}")

    def text(self, text, size=12, bold=False, color=INK):
        style = ParagraphStyle("samil", fontName="MalgunBold" if bold else "Malgun",
                               fontSize=size, leading=size * 1.4, textColor=color, wordWrap="CJK")
        paragraph = Paragraph(escape(text), style)
        _, height = paragraph.wrap(WIDTH, H)
        if self.y - height < 49:
            raise ValueError(f"Page overflow in {self.grade} {self.role} page {self.page}")
        paragraph.drawOn(self.paper, MARGIN, self.y - height)
        self.y -= height + 6

    def start(self, subtitle):
        self.page += 1
        self.y = H - 39
        self.text(f"3·1절 · {self.grade} · {self.role}", 12, True, ACCENT)
        self.text(subtitle, 23, True)
        self.paper.setStrokeColor(BORDER)
        self.paper.line(MARGIN, self.y, W - MARGIN, self.y)
        self.y -= 15

    def writing_lines(self, count=2):
        self.paper.setStrokeColor(BORDER)
        for _ in range(count):
            self.y -= 26
            self.paper.line(MARGIN, self.y, W - MARGIN, self.y)
        self.y -= 12
        if self.y < 48:
            raise ValueError(f"Answer lines reach the footer for {self.grade}")

    def gallery(self, image_names, width=WIDTH, height=128, captions=None):
        cell = width / len(image_names)
        for index, image_name in enumerate(image_names):
            image = artwork(image_name)
            iw, ih = image.getSize()
            ratio = min((cell - 12) / iw, (height - 12) / ih)
            x = MARGIN + index * cell
            self.paper.setFillColor(SHADE)
            self.paper.roundRect(x + 2, self.y - height, cell - 4, height, 5, fill=1, stroke=0)
            self.paper.drawImage(image, x + (cell - iw * ratio) / 2,
                                 self.y - (height + ih * ratio) / 2, iw * ratio, ih * ratio)
            if captions:
                self.paper.setFont("Malgun", 10)
                self.paper.setFillColor(INK)
                self.paper.drawCentredString(x + cell / 2, self.y - height - 18, captions[index])
        self.y -= height + (31 if captions else 7)

    def map(self, places):
        image = artwork("samil-map.webp")
        mw, mh = 134, 194
        image_bottom = self.y - mh
        self.paper.drawImage(image, MARGIN, image_bottom, mw, mh)
        for index, item in enumerate(places, 1):
            x = MARGIN + mw * item["x"] / 100
            y = self.y - mh * item["y"] / 100
            self.paper.setFillColor(ACCENT)
            self.paper.circle(x, y, 7, stroke=0, fill=1)
            self.paper.setFont("MalgunBold", 8)
            self.paper.setFillColor(colors.white)
            self.paper.drawCentredString(x, y - 2.5, str(index))
            self.paper.setFillColor(INK)
            self.paper.setFont("Malgun", 12)
            self.paper.drawString(MARGIN + mw + 22, self.y - index * 42,
                                  f'{index}. {item["name"]}    ____월 ____일')
        self.y = image_bottom - 8

    def end(self):
        self.paper.setStrokeColor(BORDER)
        self.paper.line(MARGIN, 41, W - MARGIN, 41)
        self.paper.setFont("Malgun", 9)
        self.paper.setFillColor(INK)
        self.paper.drawString(MARGIN, 28, f"오늘의 국경일 · 3·1절 · {self.title}")
        self.paper.drawRightString(W - MARGIN, 28, f"{self.page} / 2")
        self.paper.showPage()


def student_page(sheet, key, grade, data):
    sheet.start("자료를 보고 생각해요")
    sheet.text("이름 _________________________")
    sheet.text(grade["goal"], 13, True)
    if key == "1-2":
        sheet.text("그림과 말을 읽고, 먼저 일어난 일부터 1, 2, 3을 써 보세요.", 13, True)
        sheet.gallery(
            ["samil-seoul.webp", "samil-map.webp", "samil-declaration.webp"],
            height=126,
            captions=["___ 함께 만세를 외쳤어요", "___ 여러 곳에서 이어졌어요", "___ 선언서를 준비했어요"],
        )
        sheet.text("사진: 한국통신국 간행물 · 지도: Natural Earth · 선언서: 국립중앙박물관 구2766", 9)
        sheet.text("사진 속 사람들이 왜 함께 모였는지 말하거나 그려요.", 13, True)
        sheet.writing_lines(4)
        sheet.text("유관순은 고향 장터의 이웃들과도 만세를 외쳤어요. 함께한 이웃에게 하고 싶은 말이 있나요?", 11)
        sheet.writing_lines(1)
    elif key == "3-4":
        sheet.text("지도와 보기의 기록을 비교해 날짜를 적으세요.", 13, True)
        sheet.map(data["places"])
        sheet.text("기록 가  평양의 만세 시위는 서울과 같은 3월 1일에 열렸어요.")
        sheet.text("기록 나  천안 아우내 장터에서는 4월 1일에 만세 시위가 열렸어요.")
        sheet.text("바탕지도: Natural Earth · 기록: 국가기록원, 독립기념관", 9)
        sheet.text(grade["exit"], 13, True)
        sheet.writing_lines(3)
    else:
        sheet.text("자료 가 · 독립선언서 첫머리의 수업용 현대어 풀이", 13, True)
        sheet.gallery(["samil-declaration.webp"], height=128)
        sheet.text("조선이 독립국이며 조선 사람이 자주민임을 선언한다.", 13)
        sheet.text("실물: 국립중앙박물관 구2766 · 풀이 참고: 독립기념관", 9)
        sheet.text("자료 나 · 서울·평양의 3월 1일 기록과 천안 아우내의 4월 1일 기록", 13, True)
        sheet.text("어느 자료가 ‘스스로 나라의 일을 결정할 권리를 주장했다’를 뒷받침하나요? 이유를 쓰세요.")
        sheet.writing_lines(2)
        sheet.text("어느 자료가 ‘여러 곳과 여러 날에 이어졌다’를 뒷받침하나요? 자료의 한계도 쓰세요.")
        sheet.writing_lines(2)
        sheet.text("자료 다 · 안중근이 1910년 2월 뤼순감옥에서 어머니에게 남긴 글 중", 12, True)
        sheet.text("“마음 편안히 지내시기를 바랍니다.” (독립기념관 수록 서신)", 11)
        sheet.text("이 문장에서는 누구를 걱정하는 마음이 보이나요?", 11)
        sheet.writing_lines(1)
    sheet.end()

    sheet.start("골든벨 · 배운 것을 확인해요")
    for index, item in enumerate(grade["quiz"], 1):
        sheet.text(f"{index}. {item['title']}", 13, True)
        for choice, option in enumerate(item["options"], 1):
            sheet.text(f"    {choice}) {option}", 11)
        sheet.y -= 4
    sheet.text("마무리 한 문장", 14, True, ACCENT)
    sheet.text(grade["exit"], 11)
    sheet.writing_lines(2)
    sheet.end()


def teacher_page(sheet, key, grade):
    sheet.start("수업 진행과 관찰 기록")
    sheet.text(grade["goal"], 14, True)
    for title, description in [
        ("도입 · 약 5분", "사진에서 관찰한 사실을 말하게 한 뒤 1919년 3월의 서울 시위 사진이라는 자료 정보를 알려 주세요."),
        ("자료 탐구 · 약 12~18분", "교사 화면의 ‘설명 보기’로 장면을 정리합니다. 기록 읽기에서는 자료 한 문장을 읽고 잠시 기다려 주세요."),
        ("학생 활동 · 약 12분", f"‘{grade['activity']}’를 진행합니다. QR이나 1쪽 학습지에서 같은 내용을 탐구할 수 있어요."),
        ("평가 · 약 8분", "학생이 먼저 답을 고르고, 교사가 정답과 이유를 열어 봅니다. 마지막 문장으로 목표 도달을 확인하세요."),
    ]:
        sheet.text(title, 14, True, ACCENT)
        sheet.text(description)
    guidance = {
        "1-2": "1 선언서 준비 → 2 함께 만세 → 3 여러 지역에서 이어짐. 학습지 왼쪽부터 2, 3, 1입니다. 그림을 가리키며 순서를 말해도 됩니다.",
        "3-4": "서울 3월 1일, 평양 3월 1일, 천안 아우내 4월 1일입니다. 날짜와 장소를 쌍으로 읽고 이동 방향을 단정하지 않도록 돕습니다.",
        "5-6": "독립과 자주의 주장은 자료 가, 여러 때·장소에서의 참여는 자료 나로 확인합니다. 자료 다는 안중근이 가족의 평안을 바랐다는 근거예요. 어머니가 어떤 답을 했는지는 이 글로 알 수 없습니다.",
    }
    sheet.text("활동 해설", 14, True, ACCENT)
    sheet.text(guidance[key])
    sheet.text("관찰 메모", 14, True)
    sheet.writing_lines(3)
    sheet.end()

    sheet.start("골든벨 정답과 피드백")
    for index, item in enumerate(grade["quiz"], 1):
        correct = item["correct"]
        sheet.text(f"{index}. 정답 {correct+1}번 · {item['options'][correct]}", 13, True)
        sheet.text(item["explain"], 11)
    sheet.text("마무리 답변 예시", 14, True, ACCENT)
    sheet.text(grade["example"])
    sheet.text("관찰 기준", 14, True)
    criteria = {
        "1-2": "독립을 바랐다는 뜻과 함께 만세를 외쳤다는 행동이 모두 드러나면 목표에 도달했어요.",
        "3-4": "서로 다른 두 장소의 날짜를 정확히 말하고 여러 곳·여러 날에 이어졌다고 설명하면 목표에 도달했어요.",
        "5-6": "주장과 직접 관련되는 자료 두 가지를 연결하고 자료가 보여 주지 못하는 내용을 한 가지 말하면 목표에 도달했어요.",
    }
    sheet.text(criteria[key], 11)
    sheet.end()


def main():
    fonts = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    for name, file in (("Malgun", "malgun.ttf"), ("MalgunBold", "malgunbd.ttf")):
        pdfmetrics.registerFont(TTFont(name, str(fonts / file)))
    data = json.loads(subprocess.check_output(
        ["node", "-e", "require('./site/dist/samil-data.js'); process.stdout.write(JSON.stringify(SamilData));"],
        cwd=ROOT, encoding="utf-8",
    ))
    for key, grade in data["grades"].items():
        for teacher in (False, True):
            role = "teacher" if teacher else "student"
            file = DIST / "worksheets" / f"samil-{key}-{role}.pdf"
            sheet = Worksheet(file, grade["label"], grade["title"], teacher)
            if teacher:
                teacher_page(sheet, key, grade)
            else:
                student_page(sheet, key, grade, data)
            sheet.paper.save()
            reader = PdfReader(file)
            assert len(reader.pages) == 2
            second = reader.pages[1].extract_text()
            assert "골든벨" in second and (
                grade["quiz"][0]["options"][grade["quiz"][0]["correct"]] in second
            ), f"PDF text verification failed: {file}"
            print(f"{file.name}: 2 pages")


if __name__ == "__main__":
    main()
