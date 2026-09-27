from pathlib import Path; from PIL import Image; import io,base64,json,sys; d=Path('output/hangeul/documentary/frames'); result={};
for n in [sys.argv[1]]:
 im=Image.open(d/(n+'.png')).convert('RGB'); im.thumbnail((960,540)); b=io.BytesIO(); im.save(b,format='JPEG',quality=70,optimize=True); result[n]=base64.b64encode(b.getvalue()).decode()
print(json.dumps(result))
