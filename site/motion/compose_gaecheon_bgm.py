"""Original quiet instrumental for the two Gaecheonjeol classroom video clips.

Modern ambient keys and a warm pad; no sampled recordings and no claim to
reconstruct ancient music. The same 16-second cue is split across two clips.
"""
from pathlib import Path
import wave

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "site" / "motion" / "gaecheon-original-bgm.wav"
SR, SECONDS = 48000, 16
y = np.zeros((SR * SECONDS, 2), dtype=np.float64)


def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def note(midi, at, length, level, pan=0, pad=False):
    start = int(at * SR)
    count = min(int(length * SR), len(y) - start)
    if count <= 0:
        return
    t = np.arange(count) / SR
    f = frequency(midi)
    if pad:
        tone = np.sin(2 * np.pi * f * t) + .13 * np.sin(2 * np.pi * 2 * f * t)
        envelope = np.minimum(t / .7, 1) * np.minimum((length - t) / 1.1, 1)
    else:
        tone = sum(
            amp * np.sin(2 * np.pi * f * harmonic * t) * np.exp(-t * (.38 + .21 * harmonic))
            for harmonic, amp in ((1, 1), (2, .25), (3, .07), (4, .025))
        )
        envelope = (1 - np.exp(-t / .014)) * np.minimum((length - t) / .13, 1)
    sample = tone * envelope * level
    y[start:start + count, 0] += sample * np.sqrt((1 - pan) / 2)
    y[start:start + count, 1] += sample * np.sqrt((1 + pan) / 2)


chords = [
    (50, 57, 62, 65),  # D minor
    (46, 53, 58, 62),  # B flat
    (43, 50, 55, 62),  # G minor
    (48, 55, 60, 64),  # C major
]
melody = [[(0, 69), (2, 72)], [(0, 70), (2, 69)],
          [(0, 67), (2, 69)], [(0, 72), (2, 74)]]
bar = 4
for i, chord in enumerate(chords):
    start = i * bar
    for j, pitch in enumerate(chord[:3]):
        note(pitch - 12, start, bar + .8, .033, (-.27, .03, .27)[j], True)
    for j, pitch in enumerate(chord):
        note(pitch + 12, start + j * .94, 2.4, .06, (-.2, .18, -.12, .22)[j])
    for pos, pitch in melody[i]:
        note(pitch, start + pos * .94 + .3, 2.5, .054, .08)

dry = y.copy()
for delay, gain in ((.151, .09), (.287, .07), (.443, .055)):
    offset = int(delay * SR)
    y[offset:] += dry[:-offset, ::-1] * gain
t = np.arange(len(y)) / SR
fade = np.minimum(t / .8, 1) * np.minimum((SECONDS - t) / 1.4, 1)
y *= fade[:, None]
y *= .46 / max(np.max(np.abs(y)), 1e-9)
OUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT), "wb") as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SR)
    wav.writeframes((y * 32767).astype("<i2").tobytes())
print(OUT)
