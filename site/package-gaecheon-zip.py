"""Build the separate offline Gaecheonjeol class package with verified video assets."""
from pathlib import Path
from shutil import copy2,copytree
from zipfile import ZipFile,ZIP_DEFLATED

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'site'/'dist'
OUT=ROOT/'output'/'gaecheon'
APP=OUT/'수업앱'
APP.mkdir(parents=True,exist_ok=True)
for name in ['gaecheon.html','gaecheon.css','gaecheon-presenter-v2.css','gaecheon.js','gaecheon-data.js','fonts.css']:
 copy2(SRC/name,APP/name)
copy2(SRC/'gaecheon.html',APP/'index.html')
copytree(SRC/'fonts',APP/'fonts',dirs_exist_ok=True)
for name in (APP/'fonts').iterdir():
 if name.is_file() and name.name.startswith(('noto-sans-kr-','noto-serif-kr-')) and name.suffix in ('.woff2','.woff','.ttf') and not (SRC/'fonts'/name.name).exists():
  name.unlink()
(APP/'vendor').mkdir(exist_ok=True);copy2(SRC/'vendor'/'qrcode.js',APP/'vendor'/'qrcode.js')
(APP/'assets').mkdir(exist_ok=True)
for name in ['gaecheon-dawn','gaecheon-tree','gaecheon-bear-tiger','gaecheon-community','gaecheon-classroom','gaecheon-dolmen','gaecheon-fact-skia','gaecheon-summit-dawn','gaecheon-helping-today','gaecheon-source-study','school-sign','writing-desk','hangul-garden']:
 copy2(SRC/'assets'/f'{name}.png',APP/'assets'/f'{name}.png')
(APP/'videos').mkdir(exist_ok=True)
for name in ['gaecheon-dawn-kling-8s.mp4','gaecheon-bear-tiger-kling-8s.mp4']:
 copy2(SRC/'videos'/name,APP/'videos'/name)
(APP/'worksheets').mkdir(exist_ok=True)
for f in (SRC/'worksheets').glob('gaecheon-*.pdf'):copy2(f,APP/'worksheets'/f.name)
copy2(ROOT/'site'/'server.mjs',OUT/'server.mjs')
copy2(ROOT/'site'/'start-gaecheon-classroom.cmd',OUT/'개천절-교실서버-시작.cmd')
for src,name in [(ROOT/'docs'/'개천절'/'교사용-수업안내.md','교사용-수업안내.md'),(ROOT/'docs'/'개천절'/'영상-제작기록.md','영상-제작기록.md'),(ROOT/'knowledge'/'개천절-사실과-전승-검증.md','사실과-전승-검증.md'),(ROOT/'knowledge'/'개천절-초등교육자료-엄선.md','초등교육자료-엄선.md'),(ROOT/'knowledge'/'개천절-평가-타당도-검토.md','평가-타당도-검토.md')]:copy2(src,OUT/name)
readme=OUT/'사용안내.md'
readme.write_text('# 개천절 오프라인 수업자료\n\n`개천절-교실서버-시작.cmd`를 실행한 뒤 http://localhost:4198/ 를 여세요. Node.js가 필요합니다. 학생 태블릿 QR은 같은 교실 네트워크에서 접근 가능한 교사 컴퓨터 주소로 열어야 합니다. 인터넷 공개 주소는 https://reinhardt7177-lab.github.io/hangeul-classroom/gaecheon.html 입니다. 두 개의 8초 영상과 배경음악이 포함되어 있습니다. 자동재생은 조용히 시작하며, 교사는 화면 위의 소리 켜기와 다시 보기를 사용할 수 있습니다.\n',encoding='utf-8')
target=OUT/'개천절-수업자료.zip';tmp=OUT/'개천절-수업자료.zip.tmp'
with ZipFile(tmp,'w',ZIP_DEFLATED,compresslevel=7) as z:
 for f in sorted(OUT.rglob('*')):
  if f.is_file() and f not in (target,tmp) and f.name!='영상-제작계획.md' and f.suffix.lower()!='.zip':z.write(f,f.relative_to(OUT).as_posix())
with ZipFile(tmp) as z:
 assert z.testzip() is None
 names=set(z.namelist())
 assert '수업앱/index.html' in names and '수업앱/worksheets/gaecheon-5-6-teacher.pdf' in names
 assert '수업앱/videos/gaecheon-dawn-kling-8s.mp4' in names
 assert '수업앱/videos/gaecheon-bear-tiger-kling-8s.mp4' in names
tmp.replace(target)
print(f'{target} / {len(names)} files / {target.stat().st_size} bytes')
