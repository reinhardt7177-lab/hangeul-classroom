"""Build the 60-second Gaecheonjeol intro video (12 scenes x 5 s) without generating new AI imagery.

Only illustrations and clips that already passed the visual review are used (Korean ridge tree,
semi-subterranean pit-house village, table-type dolmen, bear and tiger clip, modern classrooms).
The dawn landscape (gaecheon-dawn.png / gaecheon-dawn-kling-8s.mp4, now archived in drafts/replaced/) is left
out on purpose because its cliff pines, granite spires and sea of clouds read like the Chinese Huangshan idiom.
The village picture was cleaned first: chickens and a corn-like drying rack are not attested for Bronze Age Korea.
All Korean text is drawn with Skia (no hanja); the flag scene is a plain pole-and-cloth diagram, not an
AI-drawn Taegeukgi. The music is an original diatonic piano and pad cue (no pentatonic "oriental" motif).

Run from the repository root:  python site/motion/gaecheon-documentary/make_documentary.py
Outputs: site/dist/videos/gaecheon-documentary-60s.mp4, site/dist/assets/gaecheon-documentary-poster.png
Working files go to output/gaecheon/documentary/ (git-ignored).
"""
from pathlib import Path
import shutil
import subprocess
import wave

import numpy as np
import skia

ROOT = Path(__file__).resolve().parents[3]
ASSETS = ROOT / 'site' / 'dist' / 'assets'
VIDEOS = ROOT / 'site' / 'dist' / 'videos'
WORK = ROOT / 'output' / 'gaecheon' / 'documentary'
GRAPHICS = WORK / 'graphics'
SEGMENTS = WORK / 'segments'
FINAL = VIDEOS / 'gaecheon-documentary-60s.mp4'
POSTER = ASSETS / 'gaecheon-documentary-poster.png'
FFMPEG = shutil.which('ffmpeg') or 'ffmpeg'
W, H, FPS, SCENE = 1280, 720, 24, 5
BOLD = skia.Typeface.MakeFromFile(r'C:\Windows\Fonts\malgunbd.ttf')
REG = skia.Typeface.MakeFromFile(r'C:\Windows\Fonts\malgun.ttf')
SERIF = skia.Typeface.MakeFromFile(r'C:\Windows\Fonts\batang.ttc')
if not (BOLD and REG and SERIF):
    raise RuntimeError('Malgun Gothic and Batang fonts are required')

FOOTER = '교육용 영상 · 옛이야기 장면과 그림은 상상 재현'
TIMELINE = [
    {'kind': 'card', 'eyebrow': '10월 3일 개천절', 'title': ['하늘이 열린 이야기,', '나라의 시작을 기억하는 날'], 'detail': '옛이야기와 역사를 함께 살펴봐요'},
    {'kind': 'still', 'image': 'gaecheon-tree', 'move': 'in', 'chip': '옛이야기를 상상한 그림', 'eyebrow': '‘개천’은 하늘을 연다는 뜻',
     'lines': ['옛이야기에서 환웅이 하늘을 열고', '신단수 아래로 내려왔대요.']},
    {'kind': 'clip', 'video': 'gaecheon-bear-tiger-kling-8s', 'start': 1.5, 'chip': '옛이야기를 상상한 영상', 'eyebrow': '곰과 범의 이야기',
     'lines': ['곰은 끝까지 참아 웅녀가 되었고,', '범은 참지 못했대요.']},
    {'kind': 'still', 'image': 'gaecheon-community', 'move': 'left', 'chip': '청동기 마을 교육용 재구성', 'eyebrow': '단군왕검과 고조선',
     'lines': ['단군왕검이 고조선을 세웠다고 전해요.', '우리 역사에서 처음 등장하는 나라예요.']},
    {'kind': 'still', 'image': 'gaecheon-source-study', 'move': 'right', 'chip': '현대 도서관 교육용 삽화', 'eyebrow': '이야기를 적은 옛 책',
     'lines': ['고려의 스님 일연이 1281년 무렵', '『삼국유사』에 이 이야기를 적었어요.']},
    {'kind': 'still', 'image': 'gaecheon-dolmen', 'move': 'in', 'chip': '탁자식 고인돌 교육용 재구성', 'eyebrow': '유물로 살펴보는 고조선',
     'lines': ['탁자식 고인돌과 비파형 동검은', '고조선 시대를 알려 주는 단서예요.']},
    {'kind': 'card', 'eyebrow': '옛이야기에 담긴 마음', 'title': ['홍익인간'], 'detail': '널리 사람을 이롭게 한다는 뜻이에요.'},
    {'kind': 'still', 'image': 'gaecheon-helping-today', 'move': 'left', 'chip': '현대 교실 교육용 삽화', 'eyebrow': '오늘의 홍익인간',
     'lines': ['서로 돕고 배려하는 마음으로', '오늘의 교실에서 이어 가요.']},
    {'kind': 'card', 'year': '1949', 'eyebrow': '나라가 정한 국경일', 'title': ['개천절 10월 3일'], 'detail': '1909년부터 기념해 온 날을 나라가 국경일로 정했어요.'},
    {'kind': 'flag', 'eyebrow': '개천절에 하는 일', 'title': '태극기를 달아요', 'detail': '깃봉과 깃면 사이를 띄우지 않고 달아요.'},
    {'kind': 'compare', 'eyebrow': '옛이야기와 역사', 'title': '두 가지를 나누어 읽어요',
     'left': ('gaecheon-bear-tiger', '옛이야기', '전해 오는 이야기'), 'right': ('gaecheon-dolmen', '유물과 기록', '역사의 단서')},
    {'kind': 'card', 'eyebrow': '이제 함께 생각해요', 'title': ['우리는 개천절을', '어떻게 기억할까요?'], 'detail': '오늘 배울 이야기와 역사를 차근차근 살펴봐요.'},
]


# ---------- Skia graphics (drawn in 1280x720 units on a 1920x1080 surface) ----------
def color(h, a=255):
    v = int(h.lstrip('#'), 16)
    return skia.ColorSetARGB(a, v >> 16, (v >> 8) & 255, v & 255)


def paint(h, a=255):
    return skia.Paint(Color=color(h, a), AntiAlias=True)


def txt(c, s, x, y, size=36, fill='#f7f1e5', face=BOLD, center=False):
    font = skia.Font(face, size)
    width = font.measureText(s)
    if center:
        x -= width / 2
    if x < 40 or x + width > W - 40:
        raise ValueError(f'text runs off the frame: {s}')
    c.drawString(s, x, y, font, paint(fill))
    return width


def rect(c, x, y, w, h, fill, r=0, a=255):
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), r, r), paint(fill, a))


def surface(transparent=False):
    s = skia.Surface(1920, 1080)
    s.getCanvas().clear(skia.ColorTRANSPARENT if transparent else color('#0b2521'))
    s.getCanvas().scale(1.5, 1.5)
    return s


def save(s, name):
    path = GRAPHICS / name
    path.write_bytes(bytes(s.makeImageSnapshot().encodeToData()))
    return path


def footer(c, n):
    rect(c, 68, 646, 1144, 1, '#54715c')
    txt(c, FOOTER, 68, 680, 17, '#aabcb0', REG)
    txt(c, f'{n:02d} / 12', 1112, 680, 17, '#aabcb0', REG)


def card_base(n):
    s = surface()
    c = s.getCanvas()
    for i in range(12):
        c.drawLine(50 + i * 114, 0, 50 + i * 114, H, paint('#afbd9b', 9))
    for i in range(7):
        c.drawLine(0, 42 + i * 114, W, 42 + i * 114, paint('#afbd9b', 9))
    rect(c, 68, 76, 42, 3, '#d8b67b')
    txt(c, '개천절 · 하늘이 열린 이야기', 126, 85, 21, '#d8c8a8', REG)
    footer(c, n)
    return s


def draw_card(a, n):
    bg = card_base(n)
    fg = surface(True)
    c = fg.getCanvas()
    txt(c, a['eyebrow'], W / 2, 182, 26, '#d8b67b', BOLD, True)
    if a.get('year'):
        txt(c, a['year'], W / 2, 344, 144, '#f7f1e5', BOLD, True)
        txt(c, a['title'][0], W / 2, 443, 49, '#f7f1e5', BOLD, True)
        txt(c, a['detail'], W / 2, 525, 28, '#b7c8b8', REG, True)
    else:
        top = 306 if len(a['title']) > 1 else 350
        for k, line in enumerate(a['title']):
            txt(c, line, W / 2, top + k * 87, 66, '#f7f1e5', SERIF, True)
        txt(c, a['detail'], W / 2, 502, 28, '#b7c8b8', REG, True)
    return save(bg, f'scene{n:02d}-bg.png'), save(fg, f'scene{n:02d}-fg.png')


def draw_overlay(a, n):
    s = surface(True)
    c = s.getCanvas()
    gradient = skia.GradientShader.MakeLinear([(0, 350), (0, 720)], [color('#071c17', 0), color('#071c17', 248)])
    c.drawRect(skia.Rect.MakeXYWH(0, 340, W, 380), skia.Paint(Shader=gradient))
    chip = skia.Font(REG, 17).measureText(a['chip'])
    rect(c, 62, 61, chip + 26, 33, '#0b2521', 5, 200)
    txt(c, a['chip'], 75, 85, 17, '#f1e6ce', REG)
    txt(c, a['eyebrow'], 68, 513, 23, '#eed39e', BOLD)
    for k, line in enumerate(a['lines']):
        txt(c, line, 68, 573 + k * 53, 39, '#fffaf0', BOLD)
    rect(c, 68, 660, 1144, 2, '#e4d4b0', 0, 90)
    rect(c, 68, 660, 1144 * n / 12, 2, '#eed39e')
    txt(c, FOOTER, 68, 693, 16, '#d6d8c9', REG)
    txt(c, f'{n:02d} / 12', 1125, 693, 16, '#d6d8c9', REG)
    return save(s, f'scene{n:02d}-overlay.png')


def draw_flag(a, n):
    """Pole-and-cloth diagram only: it shows where the cloth sits, not the Taegeukgi pattern."""
    bg = card_base(n)
    fg = surface(True)
    c = fg.getCanvas()
    txt(c, a['eyebrow'], W / 2, 150, 26, '#d8b67b', BOLD, True)
    txt(c, a['title'], W / 2, 232, 62, '#f7f1e5', SERIF, True)
    px, top = 560, 262
    line = skia.Paint(Color=color('#eed39e'), StrokeWidth=2, AntiAlias=True)
    c.drawRect(skia.Rect.MakeXYWH(px - 5, top + 26, 10, 262), paint('#c9b48a'))  # pole ends above the caption
    c.drawCircle(px, top + 16, 17, paint('#e8c982'))
    rect(c, px + 5, top + 33, 260, 173, '#fbf7ee', 3)  # cloth starts right under the finial: no gap
    c.drawRect(skia.Rect.MakeXYWH(px + 5, top + 33, 260, 173), skia.Paint(Color=color('#9fb3a4'), Style=skia.Paint.kStroke_Style, StrokeWidth=2, AntiAlias=True))
    txt(c, '깃면', px + 106, top + 130, 30, '#56705f', BOLD)
    txt(c, '깃봉', px - 110, top + 26, 28, '#eed39e', BOLD)
    c.drawLine(px - 44, top + 16, px - 22, top + 16, line)
    txt(c, '붙여 달아요', px - 186, top + 86, 28, '#fffaf0', BOLD)  # points at the finial-cloth junction
    c.drawLine(px - 34, top + 70, px - 6, top + 36, line)
    c.drawCircle(px, top + 34, 5, paint('#eed39e'))
    txt(c, a['detail'], W / 2, 612, 26, '#b7c8b8', REG, True)
    return save(bg, f'scene{n:02d}-bg.png'), save(fg, f'scene{n:02d}-fg.png')


def draw_compare(a, n):
    bg = card_base(n)
    fg = surface(True)
    c = fg.getCanvas()
    txt(c, a['eyebrow'], W / 2, 150, 26, '#d8b67b', BOLD, True)
    txt(c, a['title'], W / 2, 222, 56, '#f7f1e5', SERIF, True)
    for x, (image, label, sub) in ((104, a['left']), (668, a['right'])):
        img = skia.Image.MakeFromEncoded(skia.Data.MakeFromFileName(str(ASSETS / f'{image}.png')))
        dest = skia.Rect.MakeXYWH(x, 262, 508, 286)
        c.save()
        c.clipRRect(skia.RRect.MakeRectXY(dest, 14, 14), True)
        c.drawImageRect(img, dest, skia.SamplingOptions(skia.FilterMode.kLinear), skia.Paint(AntiAlias=True))
        c.restore()
        txt(c, label, x + 254, 598, 34, '#f7f1e5', BOLD, True)
        txt(c, sub, x + 254, 634, 22, '#eed39e', REG, True)
    return save(bg, f'scene{n:02d}-bg.png'), save(fg, f'scene{n:02d}-fg.png')


# ---------- Original music: diatonic piano and warm pad, 60 s ----------
def compose_bgm(path, seconds=60, sr=48000):
    y = np.zeros((sr * seconds, 2))

    def note(midi, at, length, level, pan=0.0, pad=False):
        start = int(at * sr)
        count = min(int(length * sr), len(y) - start)
        if count <= 0:
            return
        t = np.arange(count) / sr
        f = 440 * 2 ** ((midi - 69) / 12)
        if pad:
            tone = np.sin(2 * np.pi * f * t) + .12 * np.sin(2 * np.pi * 2 * f * t)
            env = np.minimum(t / 1.1, 1) * np.minimum((length - t) / 1.4, 1)
        else:
            tone = sum(amp * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (.42 + .22 * h)) for h, amp in ((1, 1), (2, .24), (3, .06), (4, .02)))
            env = (1 - np.exp(-t / .012)) * np.minimum((length - t) / .15, 1)
        sample = tone * env * level
        y[start:start + count, 0] += sample * np.sqrt((1 - pan) / 2)
        y[start:start + count, 1] += sample * np.sqrt((1 + pan) / 2)

    # D major I - V/3 - vi - IV with the leading tone C# and the fourth G in the melody (not pentatonic).
    chords = [(50, 54, 57, 62), (49, 52, 57, 61), (47, 50, 54, 59), (43, 47, 50, 55)]
    melodies = [[(0, 66), (1.5, 69), (3, 71)], [(0, 73), (1.5, 71), (3, 69)], [(0, 71), (1.5, 74), (3, 73)], [(0, 71), (1.5, 67), (3, 69)]]
    bar = 3.75  # 64 BPM, four beats
    for b in range(16):
        chord, melody, start = chords[b % 4], melodies[b % 4], b * bar
        for j, pitch in enumerate(chord[:3]):
            note(pitch - 12, start, bar + 1, .03, (-.3, 0, .3)[j], True)
        for j, pitch in enumerate(chord):
            note(pitch + 12, start + j * .9375, 2.6, .05, (-.22, .16, -.1, .24)[j])
        if 2 <= b < 14:
            for pos, pitch in melody:
                note(pitch, start + pos * .9375 + .2, 2.6, .05, .06)
    dry = y.copy()
    for delay, gain in ((.17, .09), (.31, .07), (.47, .05)):
        o = int(delay * sr)
        y[o:] += dry[:-o, ::-1] * gain
    t = np.arange(len(y)) / sr
    y *= (np.minimum(t / 1.5, 1) * np.minimum((seconds - t) / 3, 1))[:, None]
    y *= .45 / max(np.max(np.abs(y)), 1e-9)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((y * 32767).astype('<i2').tobytes())


# ---------- ffmpeg assembly ----------
def run(args):
    subprocess.run([FFMPEG, '-loglevel', 'error', '-y', *args], check=True)


def encode(inputs, graph, out):
    run([*inputs, '-filter_complex', graph, '-map', '[v]', '-frames:v', str(SCENE * FPS), '-r', str(FPS),
         '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-an', str(out)])


def pan_expr(move):
    frames = SCENE * FPS
    if move == 'left':
        return "1.06", f"(iw-iw/zoom)*(1-on/{frames})", "(ih-ih/zoom)/2"
    if move == 'right':
        return "1.06", f"(iw-iw/zoom)*on/{frames}", "(ih-ih/zoom)/2"
    return f"1+0.06*on/{frames}", "(iw-iw/zoom)/2", "(ih-ih/zoom)/2"


def build_segment(a, n):
    out = SEGMENTS / f'scene{n:02d}.mp4'
    loop = ['-loop', '1', '-framerate', str(FPS), '-t', str(SCENE)]
    if a['kind'] in ('card', 'flag', 'compare'):
        bg, fg = {'card': draw_card, 'flag': draw_flag, 'compare': draw_compare}[a['kind']](a, n)
        graph = "[1:v]format=rgba,fade=in:st=0:d=0.7:alpha=1[f];[0:v][f]overlay=x=0:y='32*max(0\\,1-t/0.7)'[v]"
        encode([*loop, '-i', str(bg), *loop, '-i', str(fg)], graph, out)
        return out, bg, fg
    overlay = draw_overlay(a, n)
    if a['kind'] == 'still':
        z, x, y = pan_expr(a['move'])
        base = f"[0:v]scale=3840:2160:flags=lanczos,zoompan=z='{z}':x='{x}':y='{y}':d=1:s=1920x1080:fps={FPS}[b]"
        encode([*loop, '-i', str(ASSETS / f"{a['image']}.png"), *loop, '-i', str(overlay)],
               base + ";[1:v]format=rgba,fade=in:st=0:d=0.45:alpha=1[o];[b][o]overlay=0:0[v]", out)
    else:
        base = "[0:v]scale=1920:-2,crop=1920:1080,fps=24[b]"
        encode(['-ss', str(a['start']), '-t', str(SCENE), '-i', str(VIDEOS / f"{a['video']}.mp4"), *loop, '-i', str(overlay)],
               base + ";[1:v]format=rgba,fade=in:st=0:d=0.45:alpha=1[o];[b][o]overlay=0:0[v]", out)
    return out, None, None


def main():
    for folder in (GRAPHICS, SEGMENTS):
        folder.mkdir(parents=True, exist_ok=True)
    segments = []
    for n, scene in enumerate(TIMELINE, 1):
        out, bg, fg = build_segment(scene, n)
        segments.append(out)
        if n == 1:
            poster = card_base(1)
            poster.getCanvas().resetMatrix()
            poster.getCanvas().drawImage(skia.Image.MakeFromEncoded(skia.Data.MakeFromFileName(str(fg))), 0, 0)
            POSTER.write_bytes(bytes(poster.makeImageSnapshot().encodeToData()))
    listing = WORK / 'segments.txt'
    listing.write_text(''.join(f"file '{p.as_posix()}'\n" for p in segments), encoding='utf-8')
    bgm = WORK / 'bgm.wav'
    compose_bgm(bgm)
    run(['-f', 'concat', '-safe', '0', '-i', str(listing), '-i', str(bgm), '-map', '0:v', '-map', '1:a',
         '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', str(FPS),
         '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-shortest', '-movflags', '+faststart', str(FINAL)])
    print(FINAL)
    print(POSTER)


if __name__ == '__main__':
    main()
