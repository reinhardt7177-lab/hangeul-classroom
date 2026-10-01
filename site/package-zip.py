"""Bundle the prepared local classroom app (run `node site/package.mjs` first) with the teacher documents.

Every document is copied fresh from the repository, so the ZIP never ships an older copy left in output/.
"""

from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile


repo = Path(__file__).resolve().parent.parent
root = repo / "output" / "hangeul"
# name inside the ZIP -> source in the repository
sources = {
    "전체장면-진행과-학습지-해설-수정기록.md": "docs/전체장면-진행과-학습지-해설-버튼-수정계획-2026-10-01.md",
    "리뉴얼-출처대장.md": "knowledge/리뉴얼-출처대장.md",
    "이야기카드-이미지-제작기록.md": "knowledge/이야기카드-이미지-제작기록.md",
    "학습내용과-시각자료-수정계획.md": "docs/학습내용과-시각자료-수정계획-2026-10-01.md",
    "리뉴얼-실행기록.md": "docs/리뉴얼-실행계획과-검증기록.md",
    "사용안내.md": "docs/한글날/오프라인-사용안내.md",
    "교사용-수업안내.md": "docs/한글날/교사용-수업안내.md",
    "시각고증-검수.md": "knowledge/한글날-조선시각고증-검수.md",
    "영상제작-계획.md": "docs/한글날/영상제작-계획.md",
    "모션그래픽-제작현황.md": "docs/한글날/모션그래픽-제작현황.md",
    "도입-다큐-교사대본.md": "docs/한글날/도입-다큐-교사대본.md",
    "도입다큐-최종내용검증.md": "knowledge/한글날-도입다큐-최종내용검증.md",
    "배포-운영안내.md": "docs/한글날/배포-운영안내.md",
}
for name, source in sources.items():
    copy2(repo / source, root / name)
target = root / "한글날-수업자료.zip"
temporary = root / "한글날-수업자료.zip.tmp"
# server.mjs and the start script are written next to the app by package.mjs
documents = [*sources, "server.mjs", "교실서버-시작.cmd"]
files = sorted(p for p in (root / "수업앱").rglob("*") if p.is_file())
files.extend(root / name for name in documents)
for file in files:
    if not file.is_file():
        raise FileNotFoundError(file)

with ZipFile(temporary, "w", ZIP_DEFLATED, compresslevel=7) as archive:
    for file in files:
        archive.write(file, file.relative_to(root).as_posix())

with ZipFile(temporary) as archive:
    damaged = archive.testzip()
    if damaged:
        raise RuntimeError(f"Damaged archive entry: {damaged}")
    names = set(archive.namelist())
    required = {
        "수업앱/videos/classroom-note.mp4",
        "수업앱/videos/writing-tools.mp4",
        "수업앱/videos/sejong-purpose-kling.mp4",
        "수업앱/videos/hangeul-timeline-skia.mp4",
        "수업앱/videos/hangeul-documentary-kling-60s.mp4",
        "수업앱/assets/documentary-poster.png",
        "수업앱/learning-resources.js",
        "수업앱/assets/gochang-dolmen-steve46814.jpg",
        "수업앱/assets/hunminjeongeum-haerye-facsimile.jpg",
        "수업앱/assets/gaecheon-story-hwanung.png",
        "수업앱/assets/gaecheon-story-promise.png",
        "수업앱/assets/gaecheon-story-ungnyeo.png",
        "수업앱/assets/gaecheon-story-dangun.png",
    }
    if not required <= names:
        raise RuntimeError(f"Missing video entries: {required - names}")
    retired = sorted(n for n in names if any(k in n for k in ("gaecheon-dawn", "summit-dawn", "hangeul-reel")))
    if retired:
        raise RuntimeError(f"Retired files in the archive: {retired}")
    count = len(names)

temporary.replace(target)
print(f"Prepared {target} ({count} files, {target.stat().st_size} bytes)")
