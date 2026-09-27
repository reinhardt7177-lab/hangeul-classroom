"""Bundle the already-prepared local classroom app and teacher documents."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


root = Path(__file__).resolve().parent.parent / "output" / "hangeul"
target = root / "한글날-수업자료.zip"
temporary = root / "한글날-수업자료.zip.tmp"
documents = [
    "사용안내.md",
    "교사용-수업안내.md",
    "시각고증-검수.md",
    "영상제작-계획.md",
    "모션그래픽-제작현황.md",
    "도입-다큐-교사대본.md",
    "도입다큐-최종내용검증.md",
    "server.mjs",
    "교실서버-시작.cmd",
]
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
    }
    if not required <= names:
        raise RuntimeError(f"Missing video entries: {required - names}")
    count = len(names)

temporary.replace(target)
print(f"Prepared {target} ({count} files, {target.stat().st_size} bytes)")
