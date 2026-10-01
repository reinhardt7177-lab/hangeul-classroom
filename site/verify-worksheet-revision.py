"""Read-only PDF assertions and rendered contact sheets for renewal QA."""
from pathlib import Path
import json
import subprocess
from pypdf import PdfReader
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
POPPLER=Path('C:/Users/JNEPC/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
QA=ROOT/'tmp/pdfs/content-revision'
QA.mkdir(parents=True,exist_ok=True)
results=[]
for topic in ('gaecheon','hangul'):
 for audience in ('student','teacher'):
  images=[]
  for grade in ('1-2','3-4','5-6'):
   path=ROOT/'site/dist/worksheets'/f'{topic}-{grade}-{audience}.pdf'
   reader=PdfReader(path)
   expected=3 if topic=='gaecheon' and grade=='5-6' else 2
   assert len(reader.pages)==expected
   text='\n'.join(p.extract_text() or '' for p in reader.pages)
   assert '\ufffd' not in text
   if topic=='gaecheon':
    if grade=='1-2':assert '1, 2, 3, 4' in text and '웅녀가 된 곰' in text
    else:assert '不見日光百日' in text and '21일' in text
    if grade=='3-4':assert '짝의 질문' in text and '설명에서 알게 된 것' in text or audience=='teacher'
    if grade=='5-6':assert '확인할 수 없는 것' in text and '짝의 질문 후' in text
   elif grade!='1-2' and audience=='student':assert '읽는 사람이 한 질문' in text and '다시 고친 안내문' in text
   subprocess.run([str(POPPLER),'-png','-r','110',str(path),str(QA/path.stem)],check=True,capture_output=True)
   renders=sorted(QA.glob(path.stem+'-*.png'))
   assert len(renders)==expected
   images.extend(renders)
   results.append({'file':path.name,'pages':expected,'size':path.stat().st_size})
  cols=3;rows=(len(images)+cols-1)//cols
  contact=Image.new('RGB',(cols*640,rows*932),'#dbe2df')
  for i,path in enumerate(images):
   im=Image.open(path).convert('RGB');im.thumbnail((620,877))
   x=(i%cols)*640;y=(i//cols)*932
   contact.paste(im,(x+(640-im.width)//2,y+10))
   ImageDraw.Draw(contact).text((x+10,y+900),path.name,fill='black')
  contact.save(QA/f'{topic}-{audience}-contact.png')
(QA/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pdfs':len(results),'pages':sum(r['pages'] for r in results)},ensure_ascii=False))
