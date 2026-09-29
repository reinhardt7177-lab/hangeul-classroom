// 엔진 — kinetic-type-reel 의 engine.py 를 브라우저 캔버스(Skia)로 옮겼다. 모든 함수는 t 의 순수 함수.
import { W, H, FPS, S32 } from './timeline.js'

export const C = { ink: '#1F3A30', paper: '#FAF8F1', accent: '#ED6B36', yellow: '#EDC367', black: '#050807' }
export const fgOn = (bg) => (bg === C.paper ? C.ink : C.paper)

export const ROLE = {
  SANS: '"KTR Sans", "KTR Serif"', // 옛 자모(ㅿㆁㆆ)는 명조에서 빌린다
  SERIF: '"KTR Serif", "KTR Sans"',
  MONO: '"KTR Mono", "KTR Sans"',
}

export async function loadFonts(base) {
  const faces = [
    ['KTR Sans', 'PretendardVariable.ttf', '45 930'],
    ['KTR Serif', 'NotoSerifKR-VF.ttf', '200 900'],
    ['KTR Mono', 'FiraMono-Medium.ttf', '500'],
  ]
  await Promise.all(faces.map(async ([fam, file, weight]) => {
    const f = new FontFace(fam, `url(${base}${file})`, { weight })
    await f.load()
    document.fonts.add(f)
  }))
}

// ── 곡선 ──
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const lerp = (a, b, k) => a + (b - a) * k
export const u = (t, t0, dur) => clamp((t - t0) / dur)
export const e_out3 = (x) => 1 - Math.pow(1 - clamp(x), 3)
export const e_in3 = (x) => Math.pow(clamp(x), 3)
export const e_io3 = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 }
export const e_outx = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x)))
export const e_back = (x, s = 1.7) => { x = clamp(x) - 1; return 1 + (s + 1) * x * x * x + s * x * x }
export const spring = (x, f = 3.2, d = 5.5) => (x <= 0 ? 0 : 1 - Math.exp(-d * x) * Math.cos(f * Math.PI * 2 * x))

export function pump(t, kicks, tau = 0.12) {
  let v = 0
  for (const k of kicks) if (t >= k && t - k < 1) v = Math.max(v, Math.exp(-(t - k) / tau))
  return v
}
export const blink = (t, period) => (Math.floor(t / period) % 2 === 0 ? 1 : 0)

// 결정적 난수 — 호출 순서가 아니라 번호로 정한다
export function hash(n) {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// ── 조판 ──
const measureCtx = new OffscreenCanvas(8, 8).getContext('2d')
const q5 = (w) => Math.round(w / 5) * 5
export const fontStr = (role, size, wght) => `${q5(wght)} ${size}px ${ROLE[role]}`

/** 한 줄 조판. track 은 em */
export function layout(s, role, size, wght = 700, track = -0.02) {
  const font = fontStr(role, size, wght)
  measureCtx.font = font
  const chars = []
  let x = 0
  for (const ch of s) {
    const w = measureCtx.measureText(ch).width
    chars.push({ ch, x, w })
    x += w + track * size
  }
  const width = chars.length ? x - track * size : 0
  return { s, role, size, wght, font, chars, width }
}
/** max_w 에 맞게 줄인다 */
export function layoutFit(s, role, size, wght, track = -0.02, maxW = 920) {
  let ln = layout(s, role, size, wght, track)
  if (ln.width > maxW) ln = layout(s, role, (size * maxW) / ln.width, wght, track)
  return ln
}
const alignX = (ln, x, align) => (align === 'c' ? x - ln.width / 2 : align === 'r' ? x - ln.width : x)

export function drawLine(c, ln, x, y, color, a = 1, align = 'l') {
  if (a <= 0) return ln
  c.save()
  c.globalAlpha *= a
  c.font = ln.font
  c.fillStyle = color
  c.textBaseline = 'alphabetic'
  const x0 = alignX(ln, x, align)
  for (const g of ln.chars) c.fillText(g.ch, x0 + g.x, y)
  c.restore()
  return ln
}
export const text = (c, s, x, y, role, size, wght, color, a = 1, align = 'l', track = -0.02) =>
  drawLine(c, layout(s, role, size, wght, track), x, y, color, a, align)

/**
 * 글자마다 변형. fn(i, ch, gx, gcx) → {dx, dy, s, sx, sy, rot, a, color} 또는 null(안 그림)
 * 변형의 중심은 글자의 광학 중심 (x + adv/2, baseline - 0.36 size)
 */
export function drawGlyphs(c, ln, x, y, fn, align = 'l', color = '#fff') {
  const x0 = alignX(ln, x, align)
  c.save()
  c.font = ln.font
  c.textBaseline = 'alphabetic'
  ln.chars.forEach((g, i) => {
    const o = fn(i, g.ch, x0 + g.x, x0 + g.x + g.w / 2)
    if (!o) return
    const a = o.a ?? 1
    if (a <= 0) return
    const cx = x0 + g.x + g.w / 2, cy = y - 0.36 * ln.size
    c.save()
    c.globalAlpha *= a
    c.fillStyle = o.color || color
    c.translate(cx + (o.dx || 0), cy + (o.dy || 0))
    if (o.rot) c.rotate(o.rot)
    const s = o.s ?? 1
    c.scale((o.sx ?? 1) * s, (o.sy ?? 1) * s)
    c.fillText(g.ch, -g.w / 2, 0.36 * ln.size)
    c.restore()
  })
  c.restore()
}

/** 줄 전체를 한 점을 중심으로 키우기 */
export function scaled(c, cx, cy, s, draw) {
  c.save()
  c.translate(cx, cy)
  c.scale(s, s)
  c.translate(-cx, -cy)
  draw()
  c.restore()
}

// ── 계기판 — 숫자는 고정 폭 칸에서 굴러간다 ──
export function odometer(c, s, x, y, role, size, wght, color, t, t0, t1, { stagger = S32, turns = 2, align = 'c', from = null } = {}) {
  const font = fontStr(role, size, wght)
  c.save()
  c.font = font
  const cell = Math.max(...'0123456789'.split('').map((d) => c.measureText(d).width))
  const chars = [...s]
  const widths = chars.map((ch) => (/\d/.test(ch) ? cell : c.measureText(ch).width))
  const total = widths.reduce((a, b) => a + b, 0)
  let cx = align === 'c' ? x - total / 2 : align === 'r' ? x - total : x
  const digits = chars.filter((ch) => /\d/.test(ch)).length
  let di = 0
  c.beginPath()
  c.rect(cx - size * 0.2, y - size * 0.95, total + size * 0.4, size * 1.2)
  c.clip()
  c.fillStyle = color
  c.textAlign = 'center'
  chars.forEach((ch, i) => {
    const w = widths[i]
    if (/\d/.test(ch)) {
      const end = t1 - (digits - 1 - di) * stagger
      const target = +ch
      const start = from ? +from[i] : 0
      const span = from ? (target - start + 10) % 10 : target + 10 * turns
      const k = e_out3(clamp((t - t0) / Math.max(1e-3, end - t0)))
      const pos = start + span * k
      const d0 = Math.floor(pos), f = pos - d0
      for (let j = 0; j < 2; j++) {
        const dy = (j - f) * size * 1.05
        c.fillText(String((d0 + j) % 10), cx + w / 2, y + dy)
      }
      di++
    } else c.fillText(ch, cx + w / 2, y)
    cx += w
  })
  c.restore()
}
/** 계기판의 칸이 넘어가는 시각들 — 소리(틱)가 이걸 그대로 쓴다 */
export function odometerClicks(t0, t1, steps) {
  const out = []
  for (let i = 1; i <= steps; i++) {
    // e_out3(k) = i/steps 의 역
    const k = 1 - Math.cbrt(1 - i / steps)
    out.push(t0 + (t1 - t0) * k)
  }
  return out
}

const GLYPHS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎABCDEFGHJKLMNPQRSTUVWXYZ0123456789/-.'
/** 왼쪽부터 풀려 나오는 해독 */
export function scramble(s, k, t, seed = 1) {
  const n = [...s].length
  const shown = Math.floor(clamp(k) * n)
  return [...s].map((ch, i) => {
    if (i < shown || ch === ' ') return ch
    const r = hash(seed * 97 + i * 13 + Math.floor(t * 30))
    return GLYPHS[Math.floor(r * GLYPHS.length)]
  }).join('')
}

// ── 글자 속 구멍(카운터) 찾기 — 확대 전환에 쓴다 ──
const holeCache = new Map()
export function counterOf(ch, role, size, wght) {
  const key = [ch, role, size, wght].join('|')
  if (holeCache.has(key)) return holeCache.get(key)
  const pad = Math.ceil(size * 0.3)
  const cw = Math.ceil(size * 1.4) + pad * 2, chh = Math.ceil(size * 1.6)
  const cv = new OffscreenCanvas(cw, chh)
  const g = cv.getContext('2d')
  g.font = fontStr(role, size, wght)
  g.fillStyle = '#000'
  const base = Math.round(size * 1.15)
  g.fillText(ch, pad, base)
  const d = g.getImageData(0, 0, cw, chh).data
  const ink = new Uint8Array(cw * chh)
  for (let i = 0; i < ink.length; i++) ink[i] = d[i * 4 + 3] > 110 ? 1 : 0
  // 바깥에서 닿는 빈칸을 지운다 → 남는 빈칸이 구멍
  const seen = new Uint8Array(cw * chh)
  const stack = []
  for (let x = 0; x < cw; x++) stack.push(x, (chh - 1) * cw + x)
  for (let y = 0; y < chh; y++) stack.push(y * cw, y * cw + cw - 1)
  while (stack.length) {
    const p = stack.pop()
    if (seen[p] || ink[p]) continue
    seen[p] = 1
    const x = p % cw, y = (p / cw) | 0
    if (x > 0) stack.push(p - 1)
    if (x < cw - 1) stack.push(p + 1)
    if (y > 0) stack.push(p - cw)
    if (y < chh - 1) stack.push(p + cw)
  }
  let n = 0, sx = 0, sy = 0
  const mask = new OffscreenCanvas(cw, chh)
  const mg = mask.getContext('2d')
  const md = mg.createImageData(cw, chh)
  for (let p = 0; p < ink.length; p++) {
    if (!ink[p] && !seen[p]) {
      n++
      sx += p % cw
      sy += (p / cw) | 0
      md.data[p * 4 + 3] = 255
    }
  }
  mg.putImageData(md, 0, 0)
  const res = n ? { cx: sx / n - pad, cy: sy / n - base, r: Math.sqrt(n / Math.PI), mask, ox: -pad, oy: -base } : null
  holeCache.set(key, res)
  return res
}

// ── 모션 블러 — 180도 셔터, 앞으로 샘플 ──
export function makeFrameRenderer(draw, isFast) {
  const acc = new OffscreenCanvas(W, H)
  const ac = acc.getContext('2d', { willReadFrequently: true })
  const sub = new OffscreenCanvas(W, H)
  const sc = sub.getContext('2d')
  return (t, samples = null) => {
    const n = samples ?? (isFast(t) ? 16 : 6)
    for (let k = 0; k < n; k++) {
      const ts = t + (k / n) * (0.5 / FPS)
      sc.setTransform(1, 0, 0, 1, 0, 0)
      sc.globalAlpha = 1
      draw(sc, ts)
      ac.globalAlpha = 1 / (k + 1)
      ac.drawImage(sub, 0, 0)
    }
    ac.globalAlpha = 1
    return acc
  }
}
