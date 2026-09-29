// 소리 — 화면과 같은 timeline.js 를 읽는다. 음원 파일 없이 Web Audio 로 합성한다.
// kinetic-type-reel 의 references/audio.md 설계를 그대로 따랐다 (Surge XT·샘플 대신 내장 합성음).
import * as T from './timeline.js'
import { BAR, BEAT, S16, S32, DURATION, at } from './timeline.js'
import { odometerClicks } from './engine.js'

const SR = 48000
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12)
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const QUAL = { maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], m: [0, 3, 7], sus4: [0, 5, 7], sus2: [0, 2, 7], '': [0, 4, 7] }
function parse(name) {
  const m = name.match(/^([A-G])([#b]?)(.*)$/)
  const pc = (PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12
  return { pc, iv: QUAL[m[3]] ?? QUAL[''] }
}
export function chord(name) {
  const { pc, iv } = parse(name)
  let r = 48 + pc
  while (r < 53) r += 12
  return iv.map((i) => { let n = r + i; while (n > 67) n -= 12; return n }).sort((a, b) => a - b)
}
export const root = (name) => 36 + parse(name).pc
/** t초의 화음 이름 */
export function chordAt(t) {
  const bar = Math.min(16, Math.floor(t / BAR) + 1)
  const c = T.CHORDS[bar - 1]
  if (Array.isArray(c)) return c[t - (bar - 1) * BAR < BAR / 2 ? 0 : 1]
  return c
}

function rngOf(seed) {
  let s = seed >>> 0 || 1
  return () => ((s ^= s << 13), (s ^= s >>> 17), (s ^= s << 5), (s >>> 0) / 4294967296)
}

/* ── 한 번에 굽는 버스 ── */
function makeCtx() {
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * (DURATION + 1.5)), SR)
  const r = rngOf(9)
  const noise = ctx.createBuffer(1, SR * 2, SR)
  const d = noise.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1
  // 방 울림
  const len = SR * 2.4
  const ir = ctx.createBuffer(2, len, SR)
  for (let ch = 0; ch < 2; ch++) {
    const x = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) x[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3)
  }
  const out = ctx.createGain()
  out.connect(ctx.destination)
  const verb = ctx.createConvolver()
  verb.buffer = ir
  const verbIn = ctx.createGain()
  verbIn.gain.value = 0.35
  verbIn.connect(verb).connect(out)
  return { ctx, noise, out, verbIn }
}

function env(g, t, a, peak, hold, rel) {
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + a)
  g.gain.setValueAtTime(peak, t + a + hold)
  g.gain.setTargetAtTime(0, t + a + hold, rel / 3)
}

/* ════════════════ 음악 ════════════════ */
function music(A) {
  const { ctx, noise, out, verbIn } = A
  const bus = (gain, duck = 0) => {
    const g = ctx.createGain()
    g.gain.value = gain
    const d = ctx.createGain()
    g.connect(d).connect(out)
    if (duck) for (const k of T.KICKS) {
      if (k < at(3, 0)) continue
      d.gain.setValueAtTime(1 - duck, k)
      d.gain.setTargetAtTime(1, k + 0.01, 0.07)
    }
    return g
  }
  const send = (node, amt) => { const g = ctx.createGain(); g.gain.value = amt; node.connect(g).connect(verbIn) }
  const PAD = bus(0.5, 0.55), BASS = bus(0.9, 0.5), ARP = bus(0.4, 0.3), LEAD = bus(0.34, 0.2), DRUM = bus(1.25)
  send(PAD, 0.6)
  send(ARP, 0.4)
  send(LEAD, 0.5)

  const nz = (t, dur) => {
    const s = ctx.createBufferSource()
    s.buffer = noise
    s.loop = true
    s.start(t, (t * 3.7) % 1.5)
    s.stop(t + dur + 0.05)
    return s
  }
  const osc = (type, f, t, dur, detune = 0) => {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = f
    o.detune.value = detune
    o.start(t)
    o.stop(t + dur)
    return o
  }

  // 패드 — 마디마다 한 화음. 1–2마디는 필터가 제곱 곡선으로 열린다
  for (let bar = 1; bar <= 16; bar++) {
    const chords = Array.isArray(T.CHORDS[bar - 1]) ? T.CHORDS[bar - 1] : [T.CHORDS[bar - 1]]
    chords.forEach((cn, hi) => {
      const t0 = at(bar, hi * (4 / chords.length)), dur = BAR / chords.length
      if (bar === 16 && hi === 0) {}
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      if (bar <= 2) {
        const k0 = ((bar - 1 + hi / chords.length) / 2) ** 2, k1 = ((bar - 1 + (hi + 1) / chords.length) / 2) ** 2
        lp.frequency.setValueAtTime(300 + 2500 * k0, t0)
        lp.frequency.linearRampToValueAtTime(300 + 2500 * k1, t0 + dur)
      } else lp.frequency.value = bar === 12 ? 1800 : 3200
      const g = ctx.createGain()
      // 에너지 곡선: 도입 < 주장 < 드롭
      const lvl = bar <= 2 ? 0.28 : bar === 12 ? 0.38 : bar === 16 ? 0.4 : [3, 4, 13, 15].includes(bar) ? 0.8 : 0.45
      env(g, t0, 0.04, lvl, dur - 0.08, 0.25)
      for (const m of chord(cn)) for (const det of [-8, 7]) osc('sawtooth', hz(m), t0, dur + 0.6, det).connect(lp)
      lp.connect(g).connect(PAD)
    })
  }

  // 베이스 — 드롭과 주장 구간의 뒷박
  for (let bar = 3; bar <= 15; bar++) {
    if (bar === 12) continue
    for (let b = 0; b < 4; b++) {
      const t0 = at(bar, b + 0.5)
      const m = root(chordAt(t0))
      const g = ctx.createGain()
      env(g, t0, 0.005, 0.5, S16 * 1.3, 0.06)
      const lp = ctx.createBiquadFilter()
      lp.frequency.setValueAtTime(900, t0)
      lp.frequency.exponentialRampToValueAtTime(200, t0 + 0.18)
      osc('sawtooth', hz(m), t0, 0.3).connect(lp)
      osc('sine', hz(m - 12), t0, 0.3).connect(g)
      lp.connect(g).connect(BASS)
    }
  }
  // 12마디 앞 두 박 — 긴 저음
  { const g = ctx.createGain(); env(g, at(12, 0), 0.01, 0.6, BEAT * 2, 0.3); osc('sine', hz(38), at(12, 0), 1.6).connect(g); g.connect(BASS) }

  // 아르페지오 — 주장 마디의 16분
  const pluck = (t0, m, v, bus = ARP) => {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(v, t0 + 0.003)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35)
    const lp = ctx.createBiquadFilter()
    lp.Q.value = 3
    lp.frequency.setValueAtTime(5200, t0)
    lp.frequency.exponentialRampToValueAtTime(500, t0 + 0.2)
    osc('sawtooth', hz(m), t0, 0.4).connect(lp)
    osc('square', hz(m + 12), t0, 0.4, 5).connect(lp)
    lp.connect(g).connect(bus)
  }
  for (let bar = 5; bar <= 11; bar++) for (let i = 0; i < 16; i++) {
    const t0 = at(bar, i / 4)
    const v = chord(chordAt(t0))
    pluck(t0, v[[0, 1, 2, 3, 2, 1][i % 6] % v.length] + 12, i % 4 === 0 ? 0.3 : 0.22)
  }

  // 훅 가락 — 3·4마디(C), 13마디(C), 15마디(F→C)
  const HOOK_C = [[0, 76], [3, 79], [6, 84], [8, 83], [10, 79], [12, 81], [14, 79]]
  const lead = (t0, m, dur, v = 0.5) => {
    const g = ctx.createGain()
    env(g, t0, 0.01, v, dur - 0.04, 0.15)
    const lp = ctx.createBiquadFilter()
    lp.frequency.value = 4200
    osc('square', hz(m), t0, dur + 0.3).connect(lp)
    osc('sawtooth', hz(m), t0, dur + 0.3, 9).connect(lp)
    lp.connect(g).connect(LEAD)
  }
  for (const bar of [4, 13, 15]) for (const [p, m] of HOOK_C) lead(at(bar, p / 4), m + (bar === 15 ? 5 : 0), S16 * 2.6)

  // 1마디 — 글자마다 화음 음 (뜯는 소리)
  const fm = chord('Fmaj7').map((m) => m + 12)
  T.typeTimes().forEach(({ t }, i) => pluck(t, fm[i % 4] + (i % 8 >= 4 ? 12 : 0), 0.18))
  // 6마디 — 스물여덟 자, G 음계로 오른다
  const G = [67, 69, 71, 72, 74, 76, 78]
  T.GRID.forEach((t0, i) => pluck(t0, G[i % 7] + 12 * Math.floor(i / 14), 0.16))
  // 2마디 자모 비
  T.RAIN.forEach((t0, i) => pluck(t0, chord(chordAt(t0))[i % 3] + 24, 0.2))

  /* ── 북 ── */
  const kick = (t0, v = 1, lpf = 0) => {
    const o = osc('sine', 150, t0, 0.5)
    o.frequency.setValueAtTime(160, t0)
    o.frequency.exponentialRampToValueAtTime(45, t0 + 0.12)
    const g = ctx.createGain()
    g.gain.setValueAtTime(v, t0)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45)
    if (lpf) { const lp = ctx.createBiquadFilter(); lp.frequency.value = lpf; o.connect(lp).connect(g) } else o.connect(g)
    g.connect(DRUM)
  }
  const hat = (t0, v, open = false) => {
    const d = open ? 0.18 : 0.035
    const s = nz(t0, d)
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7500
    const g = ctx.createGain()
    g.gain.setValueAtTime(v, t0)
    g.gain.exponentialRampToValueAtTime(0.0005, t0 + d)
    s.connect(hp).connect(g).connect(DRUM)
  }
  const snare = (t0, v) => {
    const s = nz(t0, 0.2)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2000
    bp.Q.value = 0.7
    const g = ctx.createGain()
    g.gain.setValueAtTime(v, t0)
    g.gain.exponentialRampToValueAtTime(0.0005, t0 + 0.14)
    s.connect(bp).connect(g).connect(DRUM)
    const o = osc('triangle', 200, t0, 0.1)
    const og = ctx.createGain()
    og.gain.setValueAtTime(v * 0.5, t0)
    og.gain.exponentialRampToValueAtTime(0.0005, t0 + 0.08)
    o.connect(og).connect(DRUM)
  }
  const clap = (t0, v) => {
    const s = nz(t0, 0.25)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1400
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t0)
    for (let i = 0; i < 3; i++) { g.gain.setValueAtTime(v, t0 + i * 0.01); g.gain.exponentialRampToValueAtTime(v * 0.2, t0 + i * 0.01 + 0.008) }
    g.gain.exponentialRampToValueAtTime(0.0005, t0 + 0.2)
    s.connect(bp).connect(g).connect(DRUM)
  }
  for (const k of T.KICKS) {
    const bar = Math.floor(k / BAR) + 1
    kick(k, bar <= 2 ? 0.7 : 1, bar <= 2 ? 260 : 0)
  }
  for (let bar = 1; bar <= 16; bar++) for (let b = 0; b < 4; b++) {
    const t0 = at(bar, b)
    const groove = bar >= 3 && bar <= 15 && bar !== 12
    if (bar <= 2) hat(t0 + BEAT / 2, 0.06)
    if (bar === 16 && b >= 2) continue
    if (groove || bar === 16) {
      if (b === 1 || b === 3) clap(t0, 0.45)
      const vel = [0.22, 0.08, 0.14, 0.08]
      for (let s = 0; s < 4; s++) hat(t0 + s * S16, vel[s] * (bar >= 5 && bar <= 11 && s === 2 ? 1.4 : 1), bar >= 5 && bar <= 11 && s === 2)
    }
  }
  // 스네어 롤 — 2마디와 12마디, 16분에서 32분으로 조이고 무음 앞에서 멈춘다
  for (const bar of [2, 12]) {
    const from = bar === 2 ? 1 : 2.5
    for (let b = from; b < 3.75 - 1e-6; b += b < 3 ? 0.25 : 0.125) snare(at(bar, b), 0.1 + 0.3 * ((b - from) / (3.75 - from)))
  }
  // 라이저 — 꼭대기가 무음의 시작에 닿는다
  for (const [a, b] of T.SILENT) {
    const t0 = a - 1.5
    const s = nz(t0, 1.5)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 2
    bp.frequency.setValueAtTime(300, t0)
    bp.frequency.exponentialRampToValueAtTime(8000, a)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(0.3, a - 0.01)
    g.gain.setValueAtTime(0, a)
    s.connect(bp).connect(g).connect(out)
  }
}

/* ════════════════ 효과음 — 화면 사건마다 ════════════════ */
function sfx(A) {
  const { ctx, noise, out, verbIn } = A
  const SFX = ctx.createGain()
  SFX.gain.value = 0.8
  SFX.connect(out)
  const wet = ctx.createGain()
  wet.gain.value = 0.4
  SFX.connect(wet).connect(verbIn)
  const nz = (t, dur) => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; s.start(t, (t * 5.3) % 1.5); s.stop(t + dur + 0.05); return s }
  const osc = (type, f, t, dur) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.start(t); o.stop(t + dur); return o }
  const vol = (t, v, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0003, t + d); g.connect(SFX); return g }

  const tick = (t, f = 3200, d = 0.006, v = 0.12) => { const s = nz(t, d); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 4; s.connect(bp).connect(vol(t, v * 3, d)) }
  const impact = (t, v = 0.6) => {
    const o = osc('sine', 120, t, 0.6); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.3); o.connect(vol(t, v, 0.5))
    const s = nz(t, 0.15); const lp = ctx.createBiquadFilter(); lp.frequency.value = 3000; s.connect(lp).connect(vol(t, v * 0.5, 0.12))
  }
  const big = (t, v = 0.8) => {
    impact(t, v)
    const s = nz(t, 1.6); const lp = ctx.createBiquadFilter(); lp.frequency.setValueAtTime(9000, t); lp.frequency.exponentialRampToValueAtTime(400, t + 1.3); s.connect(lp).connect(vol(t, v * 0.35, 1.5))
  }
  const low = (t, v = 0.7) => { const o = osc('sine', 55, t, 1.2); o.frequency.exponentialRampToValueAtTime(32, t + 1); o.connect(vol(t, v, 1.1)) }
  const crash = (t, v = 0.3) => { const s = nz(t, 2); const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000; s.connect(hp).connect(vol(t, v, 1.8)) }
  const stab = (t, name, v = 0.22) => {
    const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.3)
    const lp = ctx.createBiquadFilter(); lp.frequency.setValueAtTime(6000, t); lp.frequency.exponentialRampToValueAtTime(800, t + 0.25)
    for (const m of chord(name)) osc('sawtooth', hz(m + 12), t, 0.35).connect(lp)
    lp.connect(g).connect(SFX)
  }
  const sweep = (t, dur, f0, f1, v = 0.2) => {
    const s = nz(t, dur); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.5
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur)
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0003, t + dur)
    s.connect(bp).connect(g).connect(SFX)
  }
  const glide = (t, f0, f1, dur, type = 'square', v = 0.12) => { const o = osc(type, f0, t, dur + 0.05); o.frequency.exponentialRampToValueAtTime(f1, t + dur); const lp = ctx.createBiquadFilter(); lp.frequency.value = 2500; o.connect(lp).connect(vol(t, v, dur)) }
  const bell = (t, m, v = 0.18) => {
    const f = hz(m); const c = osc('sine', f, t, 2.4); const mo = osc('sine', f * 3.5, t, 2.4)
    const ix = ctx.createGain(); ix.gain.setValueAtTime(f * 1.4, t); ix.gain.exponentialRampToValueAtTime(f * 0.05, t + 1.2)
    mo.connect(ix).connect(c.frequency); c.connect(vol(t, v, 2.2))
  }
  const blip = (t, m, v = 0.08) => osc('square', hz(m), t, 0.05).connect(vol(t, v, 0.045))
  const scratch = (t, d = 0.08) => sweep(t, d, 1300, 6800, 0.35)
  const crush = (t, d = 0.2, v = 0.25) => {
    const s = nz(t, d); const ws = ctx.createWaveShaper(); const cv = new Float32Array(64)
    for (let i = 0; i < 64; i++) cv[i] = Math.round(((i / 63) * 2 - 1) * 4) / 4
    ws.curve = cv; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500
    s.connect(ws).connect(hp).connect(vol(t, v, d))
  }
  const reverseInto = (t, len = 0.8, v = 0.3) => {
    const s = nz(t - len, len); const lp = ctx.createBiquadFilter(); lp.frequency.setValueAtTime(600, t - len); lp.frequency.exponentialRampToValueAtTime(9000, t)
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t - len); g.gain.exponentialRampToValueAtTime(v, t - 0.005); g.gain.setValueAtTime(0, t)
    s.connect(lp).connect(g).connect(SFX)
  }
  const subBlast = (t, v = 0.8) => { const o = osc('sine', 70, t, 1); o.frequency.exponentialRampToValueAtTime(30, t + 0.8); o.connect(vol(t, v, 0.9)) }
  const pop = (t) => { const o = osc('sine', 500, t, 0.12); o.frequency.exponentialRampToValueAtTime(1400, t + 0.06); o.connect(vol(t, 0.25, 0.1)) }

  // 1 — 글자마다 키 틱
  T.typeTimes().forEach(({ t }, i) => tick(t, 2800 + (i % 5) * 180))
  // 2
  impact(T.ENTER, 0.25); tick(T.ENTER, 1800, 0.008, 0.2)
  T.RAIN.forEach((t) => sweep(t - 0.05, 0.22, 3000, 600, 0.08))
  glide(T.SQUASH, 900, 120, 0.25, 'square', 0.1)
  // 3 — 드롭
  crash(at(3, 0), 0.35); big(at(3, 0), 0.8); low(at(3, 0))
  T.SYL.forEach((s, si) => {
    s.hits.forEach((t, k) => { stab(t, 'C', 0.14 + 0.04 * k); impact(t, 0.25 + 0.08 * k) })
    big(s.merge, 0.6); stab(s.merge, si === 2 ? 'G' : 'C', 0.2)
  })
  // 4
  impact(T.T4.flip, 0.4); glide(T.T4.flip, 300, 900, 0.12, 'sawtooth', 0.08)
  sweep(T.T4.serif, 0.25, 3000, 600, 0.12)
  for (let i = 0; i < 4; i++) bell(T.T4.rule + i * S32, [84, 88, 91, 96][i], 0.1)
  pop(T.T4.flood); subBlast(T.T4.flood, 0.5)
  reverseInto(T.T4.cut, 0.8, 0.35); sweep(T.T4.zoom0, T.T4.cut - T.T4.zoom0, 500, 9000, 0.25)
  // 5 — 계기판 틱은 숫자가 넘어가는 순간 그대로
  crash(at(5, 0), 0.2)
  odometerClicks(T.T5.odo0, T.T5.odo1, 3 + 20).forEach((t) => tick(t, 2000, 0.003, 0.1))
  bell(T.T5.odo1, 84, 0.14)
  sweep(T.T5.made, 0.25, 3000, 600, 0.1)
  odometerClicks(T.T5.roll0, T.T5.roll1, 3).forEach((t) => tick(t, 2400, 0.004, 0.16))
  bell(T.T5.roll1, 91, 0.16); stab(T.T5.book, 'G', 0.18)
  sweep(at(5, 3.5), BEAT / 2, 800, 5000, 0.15)
  // 6
  T.LOST.forEach(() => {})
  sweep(T.T6.head, 0.25, 3000, 600, 0.1)
  for (let i = 0; i < 4; i++) glide(T.T6.fall + i * S32, 700, 90, 0.5, 'triangle', 0.1)
  stab(T.T6.now, 'Em7', 0.2); impact(T.T6.now, 0.3)
  // 7
  stab(T.T7.head, 'Em7', 0.22); impact(T.T7.head, 0.5)
  T.T7.bars.forEach((t, i) => { glide(t, 200 + i * 80, 600 + i * 150, 0.4, 'sawtooth', 0.07); odometerClicks(t, t + T.T7.land, [2, 5, 7][i] + 10).forEach((c) => tick(c, 2200, 0.003, 0.06)) })
  sweep(at(7, 3.5), BEAT / 2, 600, 3000, 0.15)
  // 8
  stab(T.T8.head, 'Am7', 0.22); impact(T.T8.head, 0.45)
  T.T8.steps.forEach((t) => { tick(t, 1800, 0.008, 0.25); sweep(t, 0.2, 5000, 900, 0.1) })
  sweep(at(8, 3.5), BEAT / 2, 800, 5000, 0.15)
  // 9
  stab(T.T9.head, 'Fmaj7', 0.22); impact(T.T9.head, 0.45)
  for (let i = 0; i < 12; i++) blip(T.T9.grid0 + i * S32, 72 + i * 2)
  T.T9.chips.forEach((t, i) => stab(t, 'Fmaj7', 0.12 + i * 0.03))
  // 10 — 진짜 종소리
  big(T.T10.bell, 0.7); bell(T.T10.bell, 79, 0.25); bell(T.T10.bell + S16, 86, 0.15)
  scratch(T.T10.strike, 0.09)
  glide(T.T10.fall, 500, 70, 0.5, 'triangle', 0.14)
  stab(T.T10.all, 'G', 0.22); bell(T.T10.all, 83, 0.14)
  sweep(at(10, 3.5), BEAT / 2, 600, 3000, 0.15)
  // 11
  stab(T.T11.head, 'Em7', 0.2)
  T.T11.drops.forEach((t) => crush(t, 0.12, 0.22))
  big(T.T11.slam, 0.7); stab(T.T11.slam, 'Em7', 0.2)
  crush(T.T11.glitch, 0.25, 0.3)
  // 12
  subBlast(T.T12.zoom0, 0.9); big(T.T12.zoom0, 0.5)
  stab(T.T12.unit, 'Dm7', 0.2)
  // 13 — 드러남
  crash(at(13, 0), 0.4)
  for (let b = 0; b < 4; b++) { big(at(13, b), b % 2 ? 0.55 : 0.75); low(at(13, b), 0.5); stab(at(13, b), 'C', 0.2) }
  // 14
  for (let b = 0; b < 4; b++) { sweep(at(14, b), 0.25, 3000, 700, 0.1); stab(at(14, b), 'Am', 0.13) }
  blip(at(14, 0.5), 88, 0.08)
  // 15
  reverseInto(T.T15.assemble + 0.62, 1.0, 0.3); big(T.T15.assemble + 0.62, 0.7)
  for (let i = 0; i < 4; i++) bell(T.T15.rule + i * S32, [81, 84, 88, 93][i], 0.1)
  for (let i = 0; i < 10; i++) blip(T.T15.url + i * S32, 84 + (i % 3) * 5, 0.05)
  T.T15.tags.forEach((t, i) => stab(t, 'F', 0.14 + i * 0.03))
  // 16
  glide(T.T16.collapse, 800, 60, 0.42, 'sawtooth', 0.12); sweep(T.T16.collapse, 0.42, 6000, 300, 0.12)
  tick(T.T16.cursor, 1800, 0.008, 0.25)
}

/* ════════════════ 굽기 · 마스터 ════════════════ */
export async function renderScore() {
  const M = makeCtx(); music(M)
  const S = makeCtx(); sfx(S)
  const [mb, sb] = await Promise.all([M.ctx.startRendering(), S.ctx.startRendering()])
  const n = Math.ceil(SR * DURATION)
  const L = new Float32Array(n), R = new Float32Array(n)
  const stop = T.T16.stop, stopLen = 0.42
  for (let ch = 0; ch < 2; ch++) {
    const m = mb.getChannelData(ch), s = sb.getChannelData(ch), o = ch ? R : L
    for (let i = 0; i < n; i++) {
      const t = i / SR
      let v
      if (t < stop) v = m[i]
      else {
        // 테이프 스톱 — 재생 속도가 0.42초 동안 0으로 떨어진다
        const x = t - stop
        if (x >= stopLen) v = 0
        else {
          const pos = stop + x - (x * x) / (2 * stopLen)
          const j = pos * SR, j0 = Math.floor(j), f = j - j0
          v = (m[j0] * (1 - f) + m[j0 + 1] * f) * (1 - x / stopLen)
        }
      }
      o[i] = v + s[i]
    }
  }
  // 게이트 — 드롭 앞 16분은 완전한 무음
  for (const [a, b] of T.SILENT) {
    const i0 = Math.floor(a * SR), i1 = Math.floor(b * SR), f = 96
    for (let i = i0 - f; i < i1; i++) {
      const g = i < i0 ? (i0 - i) / f : 0
      L[i] *= g
      R[i] *= g
    }
  }
  let pk = 0
  for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]))
  const k = 0.7 / pk
  for (let i = 0; i < n; i++) { L[i] *= k; R[i] *= k }
  // 끝 가장자리
  for (let i = 0; i < 480; i++) { L[n - 1 - i] *= i / 480; R[n - 1 - i] *= i / 480 }
  return { L, R, sr: SR }
}

export function wavBytes({ L, R, sr }) {
  const n = L.length
  const dv = new DataView(new ArrayBuffer(44 + n * 4))
  const w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)))
  w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt ')
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true)
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true)
  w(36, 'data'); dv.setUint32(40, n * 4, true)
  let o = 44
  for (let i = 0; i < n; i++) for (const x of [L[i], R[i]]) { const s = Math.max(-1, Math.min(1, x)); dv.setInt16(o, s < 0 ? s * 32768 : s * 32767, true); o += 2 }
  return new Uint8Array(dv.buffer)
}
