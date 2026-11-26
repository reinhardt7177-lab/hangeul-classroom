"""Render the original classroom underscoring '남겨진 말' as an MP3."""

from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import wave

import numpy as np

RATE = 44100
BEAT = 60 / 64
TAIL = 4
TARGET = Path(__file__).resolve().parents[2] / "dist" / "audio" / "samil-words-left.mp3"

# Each bar pairs a quiet piano voicing with sparse melody notes (beat, MIDI note, hold).
SCORE = [
    ((38, 57, 62, 64, 65), [(0.75, 69, 1.5), (2.5, 65, 1.2)]),
    ((34, 53, 57, 60, 62), [(0.5, 64, 1.2), (2.25, 62, 1.4)]),
    ((43, 55, 58, 62, 65), [(1.25, 65, 1.6), (3.25, 67, 0.8)]),
    ((45, 57, 62, 64, 65), [(0.5, 69, 1.6), (2.75, 62, 1.2)]),
    ((38, 53, 57, 62, 64), [(1.0, 69, 1.4), (2.75, 72, 1.0)]),
    ((41, 53, 57, 60, 64), [(0.25, 69, 1.7), (2.75, 65, 1.0)]),
    ((34, 53, 57, 60, 62), [(0.75, 67, 1.3), (2.5, 65, 1.0)]),
    ((43, 55, 58, 62, 65), [(0.5, 62, 1.8)]),
    ((38, 53, 57, 62, 64), [(1.0, 65, 1.4), (2.8, 69, 1.1)]),
    ((41, 53, 57, 60, 64), [(0.5, 72, 1.5), (2.6, 69, 1.1)]),
    ((34, 53, 57, 60, 62), [(0.75, 65, 1.2), (2.75, 64, 1.2)]),
    ((45, 55, 57, 62, 64), [(0.5, 62, 2.1)]),
    ((38, 53, 57, 60, 64), [(0.7, 69, 1.4), (2.5, 65, 1.3)]),
    ((34, 53, 57, 60, 62), [(0.65, 64, 1.3), (2.75, 65, 1.1)]),
    ((43, 55, 60, 62, 65), [(0.6, 67, 1.25), (2.3, 65, 1.5)]),
    ((41, 53, 57, 60, 67), [(0.75, 64, 1.4), (2.35, 65, 2.9)]),
]


def add_note(mix, start, pitch, hold, gain, pan, soft_pad=False):
    offset = round(start * RATE)
    length = min(round((hold + 1.4) * RATE), len(mix) - offset)
    t = np.arange(length, dtype=np.float64) / RATE
    frequency = 440 * 2 ** ((pitch - 69) / 12)
    phase = 2 * np.pi * frequency * t
    release = np.exp(-4.25 * np.maximum(t - hold, 0))
    if soft_pad:
        vibrato = 0.22 * np.sin(2 * np.pi * 3.5 * t)
        voice = (np.sin(phase + vibrato) + 0.12 * np.sin(2 * phase)) * np.minimum(t / 0.7, 1)
    else:
        voice = (
            np.sin(phase) + 0.31 * np.sin(2.002 * phase) * np.exp(-2.7 * t)
            + 0.115 * np.sin(3.007 * phase) * np.exp(-4.8 * t)
        ) * (1 - np.exp(-t * 105)) * np.exp(-t * 0.78)
    signal = gain * release * voice
    mix[offset:offset + length, 0] += signal * np.sqrt((1 - pan) / 2)
    mix[offset:offset + length, 1] += signal * np.sqrt((1 + pan) / 2)


def mix_score():
    duration = len(SCORE) * 4 * BEAT + TAIL
    dry = np.zeros((round(duration * RATE), 2), dtype=np.float64)
    for bar, (chord, melody) in enumerate(SCORE):
        start = bar * 4 * BEAT
        add_note(dry, start, chord[0], 2.2, 0.073, -0.18)
        for index, pitch in enumerate(chord[1:]):
            add_note(dry, start + BEAT * (0.3 + 0.48 * index), pitch, 1.45, 0.039, (index - 1.5) * 0.13)
        if bar >= 4:
            add_note(dry, start + 0.3, chord[1] - 12, 3.1, 0.015, -0.19, soft_pad=True)
            add_note(dry, start + 0.55, chord[3], 2.8, 0.009, 0.25, soft_pad=True)
        for beat, pitch, hold in melody:
            add_note(dry, start + beat * BEAT, pitch, hold * BEAT, 0.086, 0.16)
    wet = dry.copy()
    for delay, level in ((0.074, 0.13), (0.153, 0.091), (0.246, 0.064), (0.372, 0.03)):
        samples = round(delay * RATE)
        wet[samples:] += level * dry[:-samples, ::-1]
    fade = round(3 * RATE)
    wet[-fade:] *= np.linspace(1, 0, fade)[:, None]
    wet *= (10 ** (-15 / 20)) / np.max(np.abs(wet))
    return (np.clip(wet, -1, 1) * 32767).astype("<i2")


def main():
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix="samil-score-") as temp:
        pcm = Path(temp) / "score.wav"
        with wave.open(str(pcm), "wb") as output:
            output.setparams((2, 2, RATE, 0, "NONE", "not compressed"))
            output.writeframes(mix_score().tobytes())
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(pcm),
            "-c:a", "libmp3lame", "-b:a", "128k", "-metadata", "title=남겨진 말",
            "-metadata", "artist=오늘의 국경일", str(TARGET),
        ], check=True)
    print(TARGET)


if __name__ == "__main__":
    main()
