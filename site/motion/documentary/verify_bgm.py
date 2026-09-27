import sys,subprocess,json
from pathlib import Path
r=Path(__file__).resolve().parents[3];sys.path.insert(0,str(r/'.motion-tools'))
import imageio_ffmpeg
ff=imageio_ffmpeg.get_ffmpeg_exe();d=r/'output/hangeul/documentary'
def run(args):return subprocess.run([ff,'-hide_banner',*args],capture_output=True,encoding='utf-8',errors='replace')
hashes=[]
for name in ['hangeul-documentary-kling-60s.mp4','hangeul-documentary-bgm-60s.mp4']:
 result=run(['-v','error','-i',str(d/name),'-map','0:v:0','-c:v','copy','-f','hash','-hash','sha256','-'])
 assert result.returncode==0,result.stderr
 hashes.append(result.stdout.strip())
assert hashes[0]==hashes[1],'The original picture packets must be unchanged.'
probe=run(['-i',str(d/'hangeul-documentary-bgm-60s.mp4'),'-map','0:a:0','-af','ebur128=peak=true','-f','null','-'])
assert probe.returncode==0,probe.stderr
assert '48000 Hz, stereo' in probe.stderr
assert 'Duration: 00:01:00.00' in probe.stderr
report={'picturePacketsIdentical':True,'videoSHA256':hashes[0],'seconds':60,'audioSampleRate':48000,'channels':2,'audioAnalysis':probe.stderr[probe.stderr.rfind('Summary:'):]}
(d/'qc/bgm-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
