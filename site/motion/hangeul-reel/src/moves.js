// 키네틱 동작 모음 — kinetic-type-reel 의 moves.py 와 같은 이름, 같은 시간감.
import { W, H, FPS, S32, S16, BEAT } from './timeline.js'
import { C, layout, drawGlyphs, drawLine, clamp, lerp, u, e_out3, e_in3, e_outx, e_back, spring, hash, fontStr, scramble } from './engine.js'

/** 기준선 가림막 아래에서 글자가 솟는다 */
export function rise(c, t, ln, x, y, t0, color, { dur = 0.32, stagger = 0.018, align = 'l', out = null, outDur = 0.22 } = {}) {
  if (t < t0) return
  const x0 = align === 'c' ? x - ln.width / 2 : align === 'r' ? x - ln.width : x
  c.save()
  c.beginPath()
  c.rect(x0 - ln.size, y - ln.size * 1.05, ln.width + ln.size * 2, ln.size * 1.35)
  c.clip()
  drawGlyphs(c, ln, x, y, (i) => {
    const k = e_out3(u(t, t0 + i * stagger, dur))
    const ko = out != null ? e_in3(u(t, out + i * stagger * 0.5, outDur)) : 0
    // 가림막(아래 0.3em) 밖으로 완전히 나가도록 1.4em 움직인다 — 1.1em 이면 글자 끝이 한 줄 남았다
    return { dy: (1 - k) * ln.size * 1.4 - ko * ln.size * 1.4 }
  }, align, color)
  c.restore()
}

/** 크게 떨어져 박힌다 */
export function slam(c, t, ln, x, y, t0, color, { s0 = 1.7, align = 'l', a = 1 } = {}) {
  if (t < t0) return
  const k = u(t, t0, 0.12)
  const s = k < 1 ? lerp(s0, 0.96, e_in3(k)) : 1 - 0.04 * Math.exp(-(t - t0 - 0.12) * 18) * Math.cos((t - t0 - 0.12) * 40)
  const x0 = align === 'c' ? x : align === 'r' ? x - ln.width / 2 : x + ln.width / 2
  c.save()
  c.globalAlpha *= a * clamp(k * 3)
  c.translate(x0, y - ln.size * 0.36)
  c.scale(s, s)
  c.translate(-x0, -(y - ln.size * 0.36))
  drawLine(c, ln, x, y, color, 1, align)
  c.restore()
}

/** 글자마다 16분에 하나씩 박힌다 */
export function letterSlams(c, t, ln, x, y, times, color, align = 'l') {
  drawGlyphs(c, ln, x, y, (i) => {
    const t0 = times[i]
    if (t0 == null || t < t0) return null
    const k = u(t, t0, 0.1)
    return { s: k < 1 ? lerp(1.8, 1, e_in3(k)) : 1 + 0.05 * Math.exp(-(t - t0 - 0.1) * 16), a: clamp(k * 4) }
  }, align, color)
}

/** 원근 뒤집기 (아래 모서리를 축으로 올라선다) */
export function flipUp(c, t, ln, x, y, t0, color, { align = 'l', dur = 0.24 } = {}) {
  if (t < t0) return
  const k = e_back(u(t, t0, dur), 1.4)
  c.save()
  c.translate(0, y)
  c.transform(1, 0, 0, Math.max(0.001, Math.sin((k * Math.PI) / 2)), 0, 0)
  c.translate(0, -y)
  drawLine(c, ln, x, y, color, clamp(k * 2), align)
  c.restore()
}

/** 흩어진 자리에서 날아와 모인다 */
export function assemble(c, t, ln, x, y, t0, color, { step = S32, dur = 0.34, align = 'c', seed = 3 } = {}) {
  drawGlyphs(c, ln, x, y, (i) => {
    const k = e_out3(u(t, t0 + i * step, dur))
    if (k <= 0) return null
    const ang = hash(seed + i) * Math.PI * 2
    const d = (1 - k) * (600 + hash(seed * 7 + i) * 500)
    return { dx: Math.cos(ang) * d, dy: Math.sin(ang) * d, rot: (1 - k) * (hash(i + 11) - 0.5) * 3, s: lerp(2.2, 1, k), a: clamp(k * 1.6) }
  }, align, color)
}

/** 줄 긋기 (u: 0→1) */
export function strike(c, ln, x, y, k, color, { align = 'l', thick = 0.08 } = {}) {
  if (k <= 0) return
  const x0 = align === 'c' ? x - ln.width / 2 : align === 'r' ? x - ln.width : x
  c.fillStyle = color
  c.fillRect(x0 - ln.size * 0.05, y - ln.size * 0.36 - (ln.size * thick) / 2, (ln.width + ln.size * 0.1) * e_outx(k), ln.size * thick)
}

// ── 타자 ──
export function typewriter(c, t, lines, xPrompt, xText, y0, lh, size, color, pop) {
  let cur = { x: xText, y: y0 }
  let active = false
  lines.forEach(([s, t0], li) => {
    if (t < t0 - 0.001) return
    const y = y0 + li * lh
    const n = clamp(Math.floor((t - t0) / S32) + 1, 0, [...s].length)
    const shown = [...s].slice(0, n).join('')
    c.font = fontStr('MONO', size, 500)
    c.fillStyle = pop
    c.fillText('>', xPrompt, y)
    const ln = layout(shown, 'MONO', size, 500, 0)
    drawLine(c, ln, xText, y, color)
    cur = { x: xText + ln.width + size * 0.12, y }
    if (n < [...s].length) active = true
  })
  return { ...cur, active }
}
export function cursor(c, x, y, size, color, on) {
  if (!on) return
  c.fillStyle = color
  c.fillRect(x, y - size * 0.8, size * 0.52, size * 0.95)
}

// ── 전환 (t_cut - 1/FPS 에 끝난다) ──
export function wipeUp(c, t, t0, tCut, color) {
  if (t < t0) return
  const k = e_in3(clamp((t - t0) / (tCut - 1 / FPS - t0)))
  c.fillStyle = color
  c.fillRect(0, H * (1 - k), W, H * k + 2)
}
export function shutter(c, t, t0, tCut, color, bands = 5) {
  if (t < t0) return
  const bh = H / bands
  for (let i = 0; i < bands; i++) {
    const k = e_out3(clamp((t - t0 - i * 0.012) / (tCut - 1 / FPS - t0 - (bands - 1) * 0.012)))
    c.fillStyle = color
    c.fillRect(W * (1 - k), i * bh, W * k + 2, bh + 1)
  }
}
/** 가로로 찢어 밀기 — 그려진 화면을 띠로 잘라 옮긴다 */
export function glitch(c, canvas, t, t0, tCut, bg) {
  if (t < t0) return
  const k = clamp((t - t0) / (tCut - 1 / FPS - t0))
  const step = Math.floor((t - t0) / S32)
  const n = 9
  const snap = new OffscreenCanvas(W, H)
  snap.getContext('2d').drawImage(canvas, 0, 0)
  for (let i = 0; i < n; i++) {
    const y = Math.floor(hash(step * 31 + i) * H)
    const h = 20 + hash(step * 17 + i) * 160
    const dx = (hash(step * 7 + i) - 0.5) * 420 * (0.3 + k)
    c.drawImage(snap, 0, y, W, h, dx, y, W, h)
    // 밝은 화면에서도 찢김이 보이게 먹 띠를 섞는다
    if (hash(i * 5 + step) > 0.55) { c.fillStyle = C.ink; c.globalAlpha = 0.85; c.fillRect(dx > 0 ? 0 : W + dx, y, Math.abs(dx), h); c.globalAlpha = 1 }
    if (hash(i + step) > 0.7) {
      c.fillStyle = C.accent
      c.globalAlpha = 0.8
      c.fillRect(0, y, W * hash(i * 3 + step), 6)
      c.globalAlpha = 1
    }
  }
  c.fillStyle = bg
  c.globalAlpha = e_in3(clamp((k - 0.55) / 0.45))
  c.fillRect(0, 0, W, H)
  c.globalAlpha = 1
}

// ── 박자와 카메라 ──
export function stutterScale(t, times) {
  let s = 1
  times.forEach((ti, i) => { if (t >= ti) s = 1 + (i + 1) * 0.06 })
  return s
}
export function shake(t, events, amp = 10, tau = 0.12) {
  let dx = 0, dy = 0
  for (const e of events) {
    if (t < e || t - e > 0.6) continue
    const k = Math.exp(-(t - e) / tau) * amp
    dx += Math.sin((t - e) * 90) * k
    dy += Math.cos((t - e) * 77) * k * 0.6
  }
  return [dx, dy]
}

// ── 가구 ──
export function label(c, t, num, name, t0, fg, accent, y = 450) {
  if (t < t0) return
  const k = e_out3(u(t, t0, 0.3))
  c.save()
  c.globalAlpha *= k
  c.font = fontStr('MONO', 30, 500)
  c.fillStyle = accent
  c.fillText(num, 80, y)
  c.fillStyle = fg
  c.fillRect(140, y - 11, 60 * k, 3)
  drawLine(c, layout(name, 'SANS', 30, 600, 0.08), 220, y, fg)
  c.restore()
}
export function footnote(c, t, s, t0, fg, y = 1420) {
  if (t < t0) return
  const k = e_out3(u(t, t0, 0.3))
  const ln = layout(s, 'SANS', 26, 450, 0.01)
  drawLine(c, ln, 80, y + (1 - k) * 16, fg, 0.62 * k)
}
export function hud(c, t, fi, fg, accent, bar, beat) {
  c.save()
  c.globalAlpha = 0.5
  c.fillStyle = fg
  c.font = fontStr('MONO', 22, 500)
  c.fillText(`${String(fi).padStart(4, '0')} / 1920`, 80, 272)
  c.textAlign = 'right'
  c.fillText(`120 BPM   ${String(bar).padStart(2, '0')}/16`, 1000, 272)
  c.textAlign = 'left'
  for (let i = 0; i < 4; i++) {
    c.fillStyle = i === beat ? accent : fg
    c.globalAlpha = i === beat ? 0.9 : 0.35
    c.fillRect(1000 - (3 - i) * 26 - 14, 296, 14, 14)
  }
  c.globalAlpha = 0.5
  c.fillStyle = fg
  const m = 40, l = 36
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    c.fillRect(x, y, l * sx, 3 * sy)
    c.fillRect(x, y, 3 * sx, l * sy)
  }
  c.restore()
}

/** 자기 소스가 흐르는 바탕 */
export function codeRain(c, t, t0, x, speed, a, lines, color, size = 26) {
  c.save()
  c.globalAlpha = a
  c.fillStyle = color
  c.font = fontStr('MONO', size, 500)
  const lh = size * 1.35
  const off = ((t - t0) * speed) % (lines.length * lh)
  const base = Math.floor(off / lh)
  for (let i = 0; i < H / lh + 2; i++) {
    const idx = (i + base) % lines.length
    c.fillText(lines[idx].slice(0, 60), x, i * lh - (off % lh) + lh)
  }
  c.restore()
}
export { scramble }
