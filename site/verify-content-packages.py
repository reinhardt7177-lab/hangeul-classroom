"""Verify final offline archives match the current learning-content revision."""
from pathlib import Path
from zipfile import ZipFile
from hashlib import sha256
import json

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'site/dist'
common=['learning-resources.js','lesson-library.js','lesson-library.css','gaecheon.html','gaecheon-data.js','gaecheon.js','gaecheon-presenter-v2.css','gaecheon-inquiry.js']
common += [f'assets/gaecheon-story-{scene}.png' for scene in ('hwanung','promise','ungnyeo','dangun')]
common += ['assets/bronze-dagger-songgukri.jpg','assets/gochang-dolmen-steve46814.jpg','videos/gaecheon-documentary-60s.mp4']
common += [f'worksheets/gaecheon-{grade}-{audience}.pdf' for grade in ('1-2','3-4','5-6') for audience in ('student','teacher')]
reports=[]
for topic,filename in [('gaecheon','개천절-수업자료.zip'),('hangeul','한글날-수업자료.zip')]:
    required=common.copy()
    if topic=='hangeul':
        required+=['hangeul.html','hangeul.js','hangeul-presenter.js','hangeul-inquiry.js','assets/hunminjeongeum-haerye-facsimile.jpg']
        required+=[f'worksheets/hangul-{grade}-{audience}.pdf' for grade in ('1-2','3-4','5-6') for audience in ('student','teacher')]
    with ZipFile(ROOT/'output'/topic/filename) as archive:
        assert archive.testzip() is None
        for name in required:
            assert sha256(archive.read('수업앱/'+name)).digest()==sha256((DIST/name).read_bytes()).digest(),name
        for name,source in [('리뉴얼-출처대장.md','knowledge/리뉴얼-출처대장.md'),('이야기카드-이미지-제작기록.md','knowledge/이야기카드-이미지-제작기록.md'),('학습내용과-시각자료-수정계획.md','docs/학습내용과-시각자료-수정계획-2026-10-01.md')]:
            assert archive.read(name)==(ROOT/source).read_bytes(),name
        assert archive.read('교사용-수업안내.md')==(ROOT/'docs'/('한글날' if topic=='hangeul' else '개천절')/'교사용-수업안내.md').read_bytes()
        assert archive.read('전체장면-진행과-학습지-해설-수정기록.md')==(ROOT/'docs/전체장면-진행과-학습지-해설-버튼-수정계획-2026-10-01.md').read_bytes()
        reports.append({'topic':topic,'entries':len(archive.namelist()),'current_revision_files':len(required),'integrity':'passed'})
print(json.dumps(reports,ensure_ascii=False))
