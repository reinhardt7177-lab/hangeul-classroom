// 장면 — 마디 하나에 함수 하나. 모든 시각은 timeline.js 에서 온다.
import * as T from './timeline.js'
import { W, H, BAR, BEAT, S32, S16, at } from './timeline.js'
import {
  C, fgOn, layout, layoutFit, drawLine, drawGlyphs, text, scaled, odometer, scramble, counterOf, fontStr,
  clamp, lerp, u, e_out3, e_in3, e_io3, e_outx, e_back, spring, pump, blink, hash,
} from './engine.js'
import {
  rise, slam, letterSlams, flipUp, assemble, strike, typewriter, cursor, wipeUp, shutter, glitch,
  stutterScale, shake, label, footnote, hud, codeRain,
} from './moves.js'

const CX = W / 2
let SOURCE = ['// source']
export const setSource = (s) => (SOURCE = s.split('\n').filter((l) => l.trim()))

const BG = [C.ink, C.ink, C.ink, C.ink, C.paper, C.accent, C.ink, C.paper, C.accent, C.ink, C.paper, C.ink, C.ink, C.ink, C.ink, C.ink]
const PROMPT = { xp: 80, xt: 136, y0: 820, lh: 112, size: 64 }

/* ─────────── 1 · 타자 ─────────── */
function s1(c, t) {
  const fg = C.paper
  c.font = fontStr('MONO', PROMPT.size, 500)
  c.fillStyle = C.accent
  c.fillText('>', PROMPT.xp, PROMPT.y0)
  const cur = typewriter(c, t, T.TYPE, PROMPT.xp, PROMPT.xt, PROMPT.y0, PROMPT.lh, PROMPT.size, fg, C.accent)
  cursor(c, cur.x, cur.y, PROMPT.size, C.accent, cur.active || blink(t, BEAT))
}

/* ─────────── 2 · 엔터 → 자모 비 → 눌림 ─────────── */
// 3×3 칸에 하나씩, 칸 안에서 조금씩 비켜 — 서로 겹치지 않고 위로 물러난 타자 줄과도 떨어진다
const RAIN_ORDER = [4, 0, 8, 2, 6, 1, 7, 3, 5]
const RAIN_POS = T.RAIN_JAMO.map((_, i) => {
  const cell = RAIN_ORDER[i]
  return [240 + (cell % 3) * 300 + (hash(i + 3) - 0.5) * 80, 930 + Math.floor(cell / 3) * 230 + (hash(i + 9) - 0.5) * 50]
})
function s2(c, t) {
  const back = e_out3(u(t, T.ENTER, 0.3))
  const sq = e_in3(u(t, T.SQUASH, 0.25))
  c.save()
  c.translate(0, 960)
  c.scale(1, lerp(1, 0.012, sq))
  c.translate(0, -960)
  c.save()
  c.globalAlpha = lerp(1, 0.28, back)
  c.translate(0, -360 * back)
  typewriter(c, T.at(2, 0), T.TYPE, PROMPT.xp, PROMPT.xt, PROMPT.y0, PROMPT.lh, PROMPT.size, C.paper, C.accent)
  c.restore()
  T.RAIN_JAMO.forEach((j, i) => {
    const t0 = T.RAIN[i]
    if (t < t0) return
    const k = u(t, t0, 0.22)
    const [x, y] = RAIN_POS[i]
    const yy = lerp(-200, y, e_outx(k))
    const col = i % 3 === 0 ? C.accent : C.paper
    const ln = layout(j, 'SANS', 190, 820, 0)
    drawLine(c, ln, x, yy + Math.sin(t * 3 + i) * 6 * k, col, 1, 'c')
  })
  if (sq > 0) {
    c.fillStyle = C.paper
    c.fillRect(0, 958, W * sq, 4 / lerp(1, 0.012, sq))
  }
  c.restore()
}

/* ─────────── 3–4 · 모아쓰기 → 한글날 ─────────── */
const TITLE_SIZE = 300
const TITLE_Y = 1010
function titleWght(t) {
  if (t >= T.T4.flood - 0.05) return 880
  return 790 + 140 * pump(t, T.KICKS, 0.14)
}
// 자모가 음절 네모 안에서 놓이는 자리 (음절 크기 S 에 대한 비율)
function jamoSlots(syl) {
  if (syl.jamo[1] === 'ㅡ') return [[0, -0.3, 0.5, 1], [0, 0.02, 0.62, 0.6], [0, 0.3, 0.5, 1]]
  return [[-0.2, -0.24, 0.5, 1], [0.27, -0.14, 0.48, 1.35], [-0.04, 0.3, 0.52, 1]]
}
function drawTitle(c, t, { a = 1 } = {}) {
  const wg = titleWght(t)
  const ln = layout('한글날', 'SANS', TITLE_SIZE, wg, -0.02)
  const x0 = CX - ln.width / 2
  T.SYL.forEach((syl, i) => {
    const g = ln.chars[i]
    const cx = x0 + g.x + g.w / 2, cy = TITLE_Y - TITLE_SIZE * 0.36
    const mk = u(t, syl.merge, 0.12)
    if (t >= syl.merge) {
      // 합쳐진 음절 — 부딪치며 제자리에
      const s = 1 + 0.12 * Math.exp(-(t - syl.merge) * 14) * (mk < 1 ? 1 : 1)
      c.save()
      c.globalAlpha = a
      c.translate(cx, cy)
      c.scale(s, s)
      c.font = ln.font
      // 채움 박에 제목이 주황으로 — 종이색으로 차는 구멍이 보이게
      c.fillStyle = t >= T.T4.flood ? C.accent : C.paper
      c.fillText(syl.syl, -g.w / 2, TITLE_SIZE * 0.36)
      c.restore()
      if (t - syl.merge < 0.18) {
        c.save()
        c.globalAlpha = (1 - (t - syl.merge) / 0.18) * 0.9
        c.strokeStyle = C.accent
        c.lineWidth = 6
        const r = TITLE_SIZE * (0.5 + (t - syl.merge) * 2.4)
        c.strokeRect(cx - r, cy - r, r * 2, r * 2)
        c.restore()
      }
      return
    }
    // 흩어진 자모
    const slots = jamoSlots(syl)
    syl.jamo.forEach((j, k) => {
      const t0 = syl.hits[k]
      if (t < t0) return
      const kk = u(t, t0, 0.1)
      const [sx, sy, sc, stretch] = slots[k]
      // 합쳐지기 직전 한 16분 동안 서로를 향해 조인다
      const pull = e_in3(u(t, syl.merge - S16, S16))
      const size = TITLE_SIZE * sc
      const s = kk < 1 ? lerp(1.9, 1, e_in3(kk)) : 1 + 0.06 * Math.exp(-(t - t0 - 0.1) * 16)
      const px = cx + sx * TITLE_SIZE * (1 + 0.5 * (1 - pull)), py = cy + sy * TITLE_SIZE * (1 + 0.5 * (1 - pull))
      c.save()
      c.globalAlpha = a * clamp(kk * 4)
      c.translate(px, py)
      c.scale(s, s * stretch)
      c.font = fontStr('SANS', size, 820)
      c.fillStyle = k === 1 ? C.accent : C.paper
      c.textAlign = 'center'
      c.fillText(j, 0, size * 0.36)
      c.restore()
    })
  })
  return { ln, x0 }
}
function s3(c, t) {
  drawTitle(c, t)
  // 지금 모이는 식
  const cur = T.SYL.findLast((s) => t >= s.hits[0]) || T.SYL[0]
  if (t >= T.SYL[0].hits[0]) {
    const f = `${cur.jamo.join(' + ')} = ${t >= cur.merge ? cur.syl : '?'}`
    text(c, f, CX, 1210, 'MONO', 52, 500, C.paper, 0.8, 'c', 0.02)
  }
  label(c, t, '00', '모아쓰기', T.at(3, 0), C.paper, C.accent)
}
function s4(c, t) {
  const zoomK = e_in3(u(t, T.T4.zoom0, T.T4.cut - 1 / T.FPS - T.T4.zoom0))
  const { ln, x0 } = { ...(() => { const l = layout('한글날', 'SANS', TITLE_SIZE, 880, -0.02); return { ln: l, x0: CX - l.width / 2 } })() }
  const hole = counterOf('한', 'SANS', TITLE_SIZE, 880)
  const hx = x0 + ln.chars[0].x + (hole ? hole.cx : 0), hy = TITLE_Y + (hole ? hole.cy : 0)
  const s = lerp(1, 90, zoomK)
  c.save()
  c.translate(hx, hy)
  c.scale(s, s)
  c.translate(-hx, -hy)
  drawTitle(c, t)
  flipUp(c, t, layout('수업 앱', 'SANS', 130, 760, -0.01), CX, 1230, T.T4.flip, C.accent, { align: 'c' })
  rise(c, t, layout('오늘의 국경일', 'SERIF', 62, 600, 0.02), CX, 640, T.T4.serif, C.paper, { align: 'c' })
  if (t >= T.T4.rule) {
    const k = e_outx(u(t, T.T4.rule, 0.3))
    c.fillStyle = C.paper
    c.fillRect(CX - 380 * k, 1300, 760 * k, 4)
    text(c, '10 · 09', CX, 1380, 'MONO', 40, 500, C.paper, k, 'c', 0.1)
  }
  // ㅎ 의 동그라미가 다음 장면의 종이색으로 찬다
  if (hole && t >= T.T4.flood) {
    const k = e_out3(u(t, T.T4.flood, 0.2))
    const gx = x0 + ln.chars[0].x
    c.save()
    c.beginPath()
    c.arc(hx, hy, hole.r * 2.2 * k + 1, 0, Math.PI * 2)
    c.clip()
    c.drawImage(tinted(hole, C.paper), gx + hole.ox, TITLE_Y + hole.oy)
    c.restore()
  }
  c.restore()
  // 마지막 몇 프레임 — 구멍이 화면을 덮는다
  if (zoomK > 0.93) {
    c.fillStyle = C.paper
    c.globalAlpha = clamp((zoomK - 0.93) / 0.06)
    c.fillRect(0, 0, W, H)
    c.globalAlpha = 1
  }
}
const tintCache = new Map()
function tinted(hole, color) {
  const key = hole.mask.width + color
  if (tintCache.has(key)) return tintCache.get(key)
  const cv = new OffscreenCanvas(hole.mask.width, hole.mask.height)
  const g = cv.getContext('2d')
  g.drawImage(hole.mask, 0, 0)
  g.globalCompositeOperation = 'source-in'
  g.fillStyle = color
  g.fillRect(0, 0, cv.width, cv.height)
  tintCache.set(key, cv)
  return cv
}

/* ─────────── 5 · 1443 → 1446 ─────────── */
function s5(c, t) {
  const fg = C.ink
  label(c, t, '01', '역사', T.at(5, 0), fg, C.accent)
  rise(c, t, layout('훈민정음', 'SERIF', 96, 700, 0.02), CX, 700, T.at(5, 0), fg, { align: 'c' })
  const rolling = t >= T.T5.roll0
  if (!rolling) odometer(c, '1443', CX, 1060, 'SANS', 330, 820, fg, t, T.T5.odo0, T.T5.odo1, { turns: 2 })
  else odometer(c, '1446', CX, 1060, 'SANS', 330, 820, C.accent, t, T.T5.roll0, T.T5.roll1, { from: '1443', stagger: 0 })
  rise(c, t, layout('창제', 'SANS', 110, 760, -0.01), CX, 1240, T.T5.made, fg, { align: 'c', out: T.T5.roll0, outDur: 0.18 })
  rise(c, t, layout('해례본 간행', 'SANS', 110, 760, -0.01), CX, 1240, T.T5.book, C.accent, { align: 'c' })
  footnote(c, t, '창제(1443)와 해설 책 간행(1446)을 구분 · 국립한글박물관, 국사편찬위원회', T.T5.foot, fg)
  shutter(c, t, T.at(5, 3.5), T.at(6, 0), C.accent)
}

/* ─────────── 6 · 28 → 24 ─────────── */
function s6(c, t) {
  const fg = C.paper
  const reflow = e_io3(u(t, T.T6.now, 0.35))
  let kept = 0
  T.JAMO28.forEach((j, i) => {
    const t0 = T.GRID[i]
    if (t < t0) return
    const lost = T.LOST.has(j)
    const x28 = 120 + (i % 7) * 140 + 60, y28 = 660 + Math.floor(i / 7) * 140
    let x = x28, y = y28, rot = 0, a = 1
    const ki = kept
    if (!lost) {
      kept++
      const x24 = 150 + (ki % 6) * 156, y24 = 660 + Math.floor(ki / 6) * 140
      x = lerp(x28, x24, reflow)
      y = lerp(y28, y24, reflow)
    } else if (t >= T.T6.fall) {
      const ft = t - T.T6.fall - T.JAMO28.filter((q) => T.LOST.has(q)).indexOf(j) * S32
      if (ft > 0) {
        y += 2600 * ft * ft
        rot = ft * (hash(i) - 0.5) * 8
        a = clamp(1 - ft * 1.4)
      }
    }
    const k = u(t, t0, 0.1)
    const s = k < 1 ? lerp(1.6, 1, e_in3(k)) : 1
    c.save()
    c.globalAlpha = a * clamp(k * 4)
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s, s)
    c.font = fontStr('SERIF', 104, 700)
    c.fillStyle = lost && t >= T.T6.fall - S16 ? C.ink : fg
    c.textAlign = 'center'
    c.fillText(j, 0, 38)
    c.restore()
  })
  label(c, t, '02', '훈민정음 스물여덟 자', T.at(6, 0), fg, C.ink)
  rise(c, t, layoutFit('처음엔 28자', 'SANS', 130, 860, -0.02), CX, 1330, T.T6.head, fg, { align: 'c', out: T.T6.now - 0.12, outDur: 0.12 })
  rise(c, t, layoutFit('지금 기본 자모 24자', 'SANS', 118, 860, -0.02, 920), CX, 1330, T.T6.now, C.ink, { align: 'c' })
  footnote(c, t, '사라진 넷 ㆁ ㆆ ㅿ ㆍ · 24는 기본 자모의 수 — 국립한글박물관, 국립국어원', T.T6.fall + BEAT, fg)
}

/* ─────────── 7 · 학년별 ─────────── */
function s7(c, t) {
  const fg = C.paper
  label(c, t, '03', '학년별 수업', T.at(7, 0), fg, C.accent)
  slam(c, t, layoutFit('학년마다 따로', 'SANS', 130, 880, -0.02), CX, 640, T.T7.head, fg, { align: 'c' })
  rise(c, t, layout('학년군마다 독립된 발표 화면', 'SANS', 40, 500, 0.02), CX, 730, T.T7.sub - BEAT * 1.5, fg, { align: 'c' })
  const base = 1360
  T.GRADES.forEach(([g, n], i) => {
    const t0 = T.T7.bars[i]
    if (t < t0) return
    const k = spring(u(t, t0, 0.9), 1.4, 5.5)
    const cx = 240 + i * 300
    const h = n * 12 * k // 막대 높이 = 장 수 (0부터, 비율 그대로)
    c.fillStyle = i === 2 ? C.accent : fg
    c.fillRect(cx - 100, base - h, 200, h)
    odometer(c, String(n), cx, base - h - 34, 'SANS', 104, 820, fg, t, t0, t0 + T.T7.land, { turns: 1 })
    text(c, '장', cx + 78, base - h - 34, 'SANS', 40, 600, fg, clamp((t - t0) * 4), 'l')
    text(c, g, cx, base + 70, 'SANS', 42, 650, fg, clamp((t - t0) * 4), 'c', 0.01)
  })
  wipeUp(c, t, T.at(7, 3.5), T.at(8, 0), C.paper)
}

/* ─────────── 8 · 다음만 누르면 ─────────── */
function s8(c, t) {
  const fg = C.ink
  label(c, t, '04', '교사 화면', T.at(8, 0), fg, C.accent)
  slam(c, t, layoutFit('‘다음’만 누르면', 'SANS', 124, 880, -0.02), CX, 640, T.T8.head, fg, { align: 'c' })
  const x = 140, y = 760, w = 800, h = 450
  c.strokeStyle = fg
  c.lineWidth = 6
  c.strokeRect(x, y, w, h)
  let idx = -1
  T.T8.steps.forEach((ts, i) => { if (t >= ts) idx = i })
  c.save()
  c.beginPath()
  c.rect(x + 3, y + 3, w - 6, h - 6)
  c.clip()
  for (let i = Math.max(0, idx - 1); i <= idx; i++) {
    const k = e_out3(u(t, T.T8.steps[idx], 0.22))
    const off = i === idx ? (1 - k) * w : -k * w
    const col = i === 3 ? C.accent : fg
    text(c, T.STEPS[i], CX + off, y + h / 2 + 54, 'SANS', 160, 820, col, 1, 'c', -0.02)
  }
  c.restore()
  text(c, `${Math.max(0, idx + 1)} / 4`, x + w - 24, y + h - 26, 'MONO', 30, 500, fg, 0.6, 'r')
  // 다음 ▶ 단추 — 박마다 눌린다
  let press = 0
  for (const ts of T.T8.steps) if (t >= ts - 0.03 && t < ts + 0.1) press = 1 - Math.abs(t - ts - 0.02) / 0.1
  const bw = 340, bh = 110, by = 1290
  c.save()
  c.translate(CX, by)
  c.scale(1 - 0.08 * press, 1 - 0.08 * press)
  c.fillStyle = C.accent
  c.beginPath()
  c.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
  c.fill()
  c.restore()
  text(c, '다음 ▶', CX, by + 20, 'SANS', 56, 800, C.paper, 1, 'c', 0)
  footnote(c, t, '전자칠판 16:9 · 질문 → 설명 → 활동 → 정답', T.T8.sub, fg)
  shutter(c, t, T.at(8, 3.5), T.at(9, 0), C.accent)
}

/* ─────────── 9 · QR ─────────── */
const QN = 21
function qrOn(x, y) {
  const inF = (fx, fy) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7
  for (const [fx, fy] of [[0, 0], [QN - 7, 0], [0, QN - 7]]) {
    if (inF(fx, fy)) {
      const dx = Math.max(Math.abs(x - fx - 3), Math.abs(y - fy - 3))
      return { on: dx !== 2, finder: true }
    }
  }
  if ((x === 7 || y === 7) && (x < 8 || x > QN - 9) && (y < 8 || y > QN - 9)) return { on: false }
  if (x === 7 && y > QN - 9) return { on: false }
  return { on: hash(x * 31 + y * 7 + 5) > 0.52, finder: false }
}
function s9(c, t) {
  const fg = C.paper
  label(c, t, '05', '학생 태블릿', T.at(9, 0), fg, C.ink)
  slam(c, t, layoutFit('태블릿은 QR로', 'SANS', 124, 880, -0.02), CX, 580, T.T9.head, fg, { align: 'c' })
  const cell = 26, size = cell * QN, x0 = CX - size / 2, y0 = 650
  if (t >= T.T9.grid0) {
    c.fillStyle = fg
    c.fillRect(x0 - 26, y0 - 26, size + 52, size + 52)
    for (let y = 0; y < QN; y++) for (let x = 0; x < QN; x++) {
      const q = qrOn(x, y)
      if (!q.on) continue
      const order = q.finder ? 0 : hash(x * 13 + y * 101)
      const t0 = lerp(T.T9.grid0, T.T9.grid1, q.finder ? 0 : 0.1 + 0.9 * order)
      if (t < t0) continue
      const k = e_back(u(t, t0, 0.12), 2)
      const s = cell * k
      c.fillStyle = C.ink
      c.fillRect(x0 + x * cell + (cell - s) / 2, y0 + y * cell + (cell - s) / 2, s, s)
    }
  }
  const chips = ['글자 탐험', '만들기', '골든벨']
  const lns = chips.map((s) => layout(s, 'SANS', 46, 750, 0))
  const pad = 34, gap = 22
  const total = lns.reduce((a, l) => a + l.width + pad * 2, 0) + gap * 2
  let x = CX - total / 2
  lns.forEach((ln, i) => {
    const t0 = T.T9.chips[i]
    const k = e_back(u(t, t0, 0.26), 1.6)
    const cw = ln.width + pad * 2
    if (t >= t0) {
      c.save()
      c.globalAlpha = clamp(k * 2)
      c.translate(x + cw / 2, 1330 + (1 - k) * 40)
      c.fillStyle = C.paper
      c.beginPath()
      c.roundRect(-cw / 2, -48, cw, 96, 48)
      c.fill()
      drawLine(c, ln, 0, 17, C.ink, 1, 'c')
      c.restore()
    }
    x += cw + gap
  })
  footnote(c, t, '학생마다 개별 활동 · 같은 와이파이가 아니어도 된다', T.T9.chips[2], fg, 1450)
}

/* ─────────── 10 · 골든벨, 탈락 없이 ─────────── */
function s10(c, t) {
  const fg = C.paper
  label(c, t, '06', '골든벨', T.at(10, 0), fg, C.accent)
  const [dx, dy] = shake(t, [T.T10.bell], 12)
  c.save()
  c.translate(dx, dy)
  slam(c, t, layout('골든벨', 'SANS', 230, 900, -0.03), CX, 800, T.T10.bell, C.yellow, { align: 'c', s0: 2 })
  c.restore()
  text(c, '4 · 5 · 6 문항', CX, 900, 'MONO', 46, 500, fg, clamp((t - T.T10.bell - 0.25) * 4), 'c', 0.06)
  const lnA = layout('탈락', 'SANS', 136, 820, -0.02)
  const lnB = layout(' 없이', 'SANS', 136, 820, -0.02)
  const tot = lnA.width + lnB.width
  const xa = CX - tot / 2, y = 1110
  const fallT = t - T.T10.fall
  if (t >= T.T10.line) {
    // 탈락이 떨어지고 나면 없이가 가운데로
    const slide = e_out3(u(t, T.T10.fall + 0.15, 0.3)) * (lnA.width / 2)
    rise(c, t, lnB, xa + lnA.width - slide, y, T.T10.line + 0.04, fg)
    if (fallT <= 0) rise(c, t, lnA, xa, y, T.T10.line, fg)
    else drawGlyphs(c, lnA, xa, y, (i) => ({ dy: 2400 * fallT * fallT * (1 + i * 0.3), rot: fallT * (i ? 3 : -2.4), a: clamp(1 - fallT * 1.5) }), 'l', fg)
    if (fallT <= 0) strike(c, lnA, xa, y, u(t, T.T10.strike, 0.1), C.accent)
  }
  rise(c, t, layoutFit('모두 끝까지', 'SANS', 136, 880, -0.02), CX, 1290, T.T10.all, C.accent, { align: 'c' })
  footnote(c, t, '해설을 듣고 다시 생각할 기회까지', T.T10.sub, fg)
  wipeUp(c, t, T.at(10, 3.5), T.at(11, 0), C.paper)
}

/* ─────────── 11 · 인터넷이 끊겨도 ─────────── */
function s11(c, t) {
  const fg = C.ink
  label(c, t, '07', '오프라인', T.at(11, 0), fg, C.accent)
  const l1 = layout('인터넷이', 'SANS', 160, 860, -0.02)
  const l2 = layout('끊겨도', 'SANS', 160, 860, -0.02)
  const drop = (i) => T.T11.drops[i]
  if (t >= T.T11.head) {
    c.save()
    c.beginPath()
    c.rect(0, 560, W, 420)
    c.clip()
    drawGlyphs(c, l1, CX, 730, (i) => {
      const k = e_out3(u(t, T.T11.head + i * 0.02, 0.3))
      const d = drop(i)
      if (t >= d + S32 * 2) return null // 끊겼다
      const flick = t >= d ? (Math.floor((t - d) / (S32 / 2)) % 2 ? 0.15 : 1) : 1
      const jx = t >= d ? (hash(Math.floor(t * 60) + i) - 0.5) * 40 : 0
      return { dy: (1 - k) * 180, a: flick, dx: jx }
    }, 'c', fg)
    // 끊긴 자리에 남는 점선 칸
    const x0 = CX - l1.width / 2
    l1.chars.forEach((g, i) => {
      if (t < drop(i) + S32 * 2) return
      c.save()
      c.strokeStyle = fg
      c.globalAlpha = 0.35
      c.setLineDash([10, 10])
      c.lineWidth = 3
      c.strokeRect(x0 + g.x + 12, 730 - 130, g.w - 24, 140)
      c.restore()
    })
    rise(c, t, l2, CX, 900, T.T11.head + 0.08, fg, { align: 'c' })
    c.restore()
  }
  const l3 = layoutFit('수업은 그대로', 'SANS', 136, 900, -0.02)
  slam(c, t, l3, CX, 1170, T.T11.slam, C.accent, { align: 'c' })
  if (t >= T.T11.slam + 0.1) {
    const k = e_outx(u(t, T.T11.slam + 0.1, 0.25))
    c.fillStyle = C.accent
    c.fillRect(CX - (l3.width / 2) * k, 1210, l3.width * k, 10)
  }
  footnote(c, t, '오프라인 수업자료 ZIP · 학생용·교사용 학습지 6종', T.T11.foot, fg)
}

/* ─────────── 12 · 40분 → 빌드 ─────────── */
function s12(c, t) {
  const fg = C.paper
  const k = e_out3(u(t, T.T12.zoom0, T.T12.zoom1 - T.T12.zoom0))
  const st = stutterScale(t, T.T12.stutter)
  scaled(c, CX, 960, st, () => {
    scaled(c, CX, 900, lerp(9, 1, k), () => {
      text(c, '40분', CX, 1020, 'SANS', 360, 900, fg, 1, 'c', -0.03)
    })
    rise(c, t, layout('한 차시 수업, 처음부터 끝까지', 'SANS', 52, 600, 0.01), CX, 1160, T.T12.unit, fg, { align: 'c' })
    text(c, '학년군별 수업 · 모두 40분', CX, 1240, 'SANS', 34, 500, fg, 0.6 * clamp((t - T.T12.unit - BEAT) * 3), 'c', 0.02)
  })
}

/* ─────────── 13 · 드러남 ─────────── */
function s13(c, t) {
  const bi = clamp(Math.floor((t - T.at(13, 0)) / BEAT), 0, 3)
  const [word, bgk] = T.REVEAL[bi]
  const bg = C[bgk]
  c.fillStyle = bg
  c.fillRect(0, 0, W, H)
  const fg = bg === C.paper ? C.ink : C.paper
  const t0 = T.at(13, bi)
  const wg = bi === 3 ? lerp(420, 930, e_io3(u(t, t0, BEAT))) : 880
  const ln = layoutFit(word, 'SANS', 230, bi === 3 ? 930 : 880, -0.03)
  const l2 = layout(word, 'SANS', ln.size, wg, -0.03)
  slam(c, t, l2, CX, 1040, t0, fg, { align: 'c', s0: 1.5 })
  footnote(c, t, '『훈민정음』 서문의 뜻을 풀어 씀', T.at(13, 0), fg)
}

/* ─────────── 14 · 코드로 ─────────── */
function s14(c, t, fi) {
  const fg = C.paper
  codeRain(c, t, T.at(12, 0), 60, 70, 0.09, SOURCE, fg)
  codeRain(c, t, T.at(10, 0), 560, 115, 0.07, SOURCE.slice(40).concat(SOURCE.slice(0, 40)), fg)
  slam(c, t, layout('이 영상도', 'SANS', 130, 860, -0.02), CX, 620, T.at(14, 0), fg, { align: 'c' })
  slam(c, t, layout('코드로.', 'SANS', 130, 860, -0.02), CX, 770, T.at(14, 0.5), C.accent, { align: 'c' })
  // 도구 줄 뒤는 흐르는 소스를 가라앉힌다 — 글이 읽히게
  c.fillStyle = C.ink
  c.globalAlpha = 0.88
  c.fillRect(80, 900, 920, 360)
  c.globalAlpha = 1
  T.TOOLS.forEach((s, i) => {
    c.fillStyle = C.accent
    if (t >= T.at(14, i)) c.fillRect(120, 960 + i * 86 - 30, 14 * e_outx(u(t, T.at(14, i), 0.1)), 14)
    rise(c, t, layout(s, 'MONO', 42, 500, 0), 160, 960 + i * 86, T.at(14, i), fg)
  })
  text(c, `frame ${String(fi).padStart(4, '0')}`, CX, 1400, 'MONO', 64, 500, C.accent, 1, 'c', 0.04)
}

/* ─────────── 15–16 · 잠금 ─────────── */
function lockup(c, t) {
  const fg = C.paper
  rise(c, t, layout('오늘의 국경일', 'SERIF', 64, 600, 0.02), CX, 700, T.T15.assemble, C.yellow, { align: 'c' })
  assemble(c, t, layoutFit('한글날 수업', 'SANS', 176, 880, -0.02), CX, 910, T.T15.assemble, fg, { align: 'c' })
  if (t >= T.T15.rule) {
    const k = e_outx(u(t, T.T15.rule, 0.35))
    c.fillStyle = C.accent
    c.fillRect(CX - 380 * k, 990, 760 * k, 6)
  }
  if (t >= T.T15.url) {
    const s = scramble(T.URL_TEXT, u(t, T.T15.url, BEAT * 1.2), t, 7)
    text(c, s, CX, 1080, 'MONO', 30, 500, fg, 0.85, 'c', 0)
  }
  const tags = ['1–2학년', '3–4학년', '5–6학년']
  const lns = tags.map((s) => layout(s, 'SANS', 58, 760, -0.01))
  const gap = 60
  const tot = lns.reduce((a, l) => a + l.width, 0) + gap * 2
  let x = CX - tot / 2
  lns.forEach((ln, i) => {
    rise(c, t, ln, x, 1240, T.T15.tags[i], i === 1 ? C.accent : fg)
    x += ln.width + gap
  })
}
function s15(c, t) {
  lockup(c, t)
}
function s16(c, t) {
  const k = e_in3(u(t, T.T16.collapse, 0.42))
  const tx = PROMPT.xt, ty = PROMPT.y0 - PROMPT.size * 0.35
  if (k < 1) {
    c.save()
    c.translate(tx, ty)
    c.scale(1 - k, 1 - k)
    c.rotate(k * 0.3)
    c.translate(-tx, -ty)
    c.globalAlpha = 1 - k * 0.3
    lockup(c, t)
    c.restore()
  }
  if (t >= T.T16.cursor) {
    // 첫 프레임과 같은 자리, 같은 모양
    c.font = fontStr('MONO', PROMPT.size, 500)
    c.fillStyle = C.accent
    c.fillText('>', PROMPT.xp, PROMPT.y0)
    const on = t >= T.at(16, 3.5) ? 1 : blink(t - T.T16.cursor, BEAT) // 마지막 박은 켜 둔다 = 0프레임
    cursor(c, PROMPT.xt, PROMPT.y0, PROMPT.size, C.accent, on)
  }
}

const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16]

export function isFast(t) {
  return T.FAST.some(([a, b]) => t >= a && t < b)
}

/** t초의 한 장 */
export function draw(c, t) {
  const fi = Math.floor(t * T.FPS + 1e-6)
  const bar = clamp(Math.floor(t / BAR) + 1, 1, 16)
  const beat = Math.floor((t - (bar - 1) * BAR) / BEAT)
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.globalAlpha = 1
  c.globalCompositeOperation = 'source-over'
  c.textAlign = 'left'
  // 드롭 앞 죽은 16분 — 검정
  if (T.SILENT.some(([a, b]) => t >= a && t < b)) {
    c.fillStyle = C.black
    c.fillRect(0, 0, W, H)
    return
  }
  const bg = BG[bar - 1]
  c.fillStyle = bg
  c.fillRect(0, 0, W, H)
  // 페이지가 킥에 맞춰 숨 쉰다 + 주장 마디에서 천천히 다가간다
  const push = bar >= 5 && bar <= 11 ? 0.022 * ((t - (bar - 1) * BAR) / BAR) : 0
  const s = 1 + 0.007 * pump(t, T.KICKS) + push
  c.save()
  c.translate(W / 2, H / 2)
  c.scale(s, s)
  c.translate(-W / 2, -H / 2)
  SCENES[bar - 1](c, t, fi)
  c.restore()
  if (bar === 11 && t >= T.T11.glitch) glitch(c, c.canvas, t, T.T11.glitch, T.at(12, 0), C.ink)
  const hbg = bar === 13 ? C[T.REVEAL[clamp(beat, 0, 3)][1]] : bg
  // 4마디 줌의 끝은 종이색 — HUD 도 종이 위의 먹으로
  const zoomPaper = bar === 4 && t > T.T4.cut - 0.06
  const hudBg = zoomPaper ? C.paper : bar === 5 && t >= T.at(5, 3.5) ? C.accent : hbg
  hud(c, t, fi, fgOn(hudBg), hudBg === C.accent ? C.ink : C.accent, bar, beat)
}
