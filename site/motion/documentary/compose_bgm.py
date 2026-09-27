"""Original quiet instrumental cue; no sampled/commercial recordings.

64 BPM, 16 bars, 60 seconds. Soft additive keys and a low warm pad.
This is modern educational background music, not a reconstruction of Joseon music.
"""
import sys, wave, json
from pathlib import Path
import numpy as np

out=Path(sys.argv[1] if len(sys.argv)>1 else 'bgm-raw.wav')
sr=48000; seconds=60; beat=60/64; bar=4*beat
y=np.zeros((sr*seconds,2),dtype=np.float64)
def freq(n):return 440*2**((n-69)/12)
def add(n,start,duration,level,pan=0,pad=False):
 start=int(start*sr);count=min(int(duration*sr),len(y)-start)
 if count<=0:return
 t=np.arange(count)/sr;f=freq(n)
 if pad:
  tone=(np.sin(2*np.pi*f*t)+.16*np.sin(2*np.pi*f*2*t)+.09*np.sin(2*np.pi*(f*1.0018)*t))
  env=np.minimum(t/.8,1)*np.minimum((duration-t)/1.3,1)
 else:
  tone=sum(a*np.sin(2*np.pi*f*k*t)*np.exp(-t*(.38+.2*k)) for k,a in [(1,1),(2,.26),(3,.09),(4,.025)])
  env=(1-np.exp(-t/.018))*np.minimum((duration-t)/.15,1)
 tone*=env*level
 y[start:start+count,0]+=tone*np.sqrt((1-pan)/2)
 y[start:start+count,1]+=tone*np.sqrt((1+pan)/2)

chords=[(48,55,60,64),(45,52,57,60),(41,48,57,60),(43,50,55,62),
        (48,55,59,64),(45,52,57,60),(41,48,55,60),(43,50,57,62),
        (45,52,57,60),(41,48,57,60),(48,55,60,64),(43,50,55,62),
        (41,48,55,60),(43,50,55,62),(48,55,60,64),(48,55,60,64)]
melody=[[(0,72),(2,76)],[(1,74),(3,72)],[(0,69),(2,72)],[(1,71)],
        [(0,72),(2,79)],[(1,76),(3,74)],[(0,72),(2,69)],[(1,67)],
        [(0,69),(2,72)],[(1,74),(3,72)],[(0,76),(2,72)],[(1,71)],
        [(0,69),(2,72)],[(0,74),(2,71)],[(0,72)],[]]
for i,c in enumerate(chords):
 at=i*bar
 for j,n in enumerate(c[:3]):add(n,at,bar+1.2,.032,(-.3,0,.3)[j],True)
 for j,n in enumerate(c):add(n+12,at+j*beat,2.6,.065 if j else .08,(-.25,.15,-.1,.25)[j])
 for pos,n in melody[i]:add(n,at+pos*beat,3,.07,.1)
# Low-level stereo ambience, delayed from dry signal without feedback instability.
dry=y.copy()
for delay,gain in [(.137,.10),(.229,.085),(.383,.065),(.619,.04)]:
 d=int(sr*delay);y[d:]+=dry[:-d,::-1]*gain
t=np.arange(len(y))/sr
fade=np.minimum(t/2,1)*np.minimum(np.maximum((60-t)/4,0),1)
y*=fade[:,None]
y*=.55/max(np.max(np.abs(y)),1e-9)
out.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(out),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((y*32767).astype('<i2').tobytes())
print(json.dumps({'seconds':seconds,'sampleRate':sr,'channels':2,'bpm':64,'source':'original additive synthesis','fadeIn':2,'fadeOut':4}))
