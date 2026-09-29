// 박자 그리드 — 그림(reel.js)과 소리(audio.js)가 이 파일 하나에서 시간을 읽는다.
export const BPM = 120
export const FPS = 60
export const W = 1080
export const H = 1920
export const BARS = 16
export const BEAT = 60 / BPM // 0.5s
export const BAR = BEAT * 4 // 2s
export const S8 = BEAT / 2
export const S16 = BEAT / 4
export const S32 = BEAT / 8
export const DURATION = BAR * BARS // 32s
export const FRAMES = Math.round(DURATION * FPS) // 1920

/** 마디(1부터) · 박(0부터) → 초 */
export const at = (bar, beat = 0) => (bar - 1) * BAR + beat * BEAT

// ── 1마디: 타자 ──
export const TYPE = [
  ['10월 9일,', at(1, 0) + S32],
  ['한글날 수업,', at(1, 1)],
  ['무엇으로 할까?', at(1, 2)],
]
export const typeTimes = () => {
  const out = []
  for (const [s, t0] of TYPE) [...s].forEach((ch, i) => ch !== ' ' && out.push({ t: t0 + i * S32, ch }))
  return out
}

// ── 2마디: 자모 비 ──
export const RAIN_JAMO = ['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ', 'ㄴ', 'ㅏ', 'ㄹ']
export const RAIN = RAIN_JAMO.map((j, i) => at(2, 0.5 + i * 0.25))
export const ENTER = at(2, 0)
export const SQUASH = at(2, 3)

// ── 3마디: 모아쓰기 ──
export const SYL = [
  { syl: '한', jamo: ['ㅎ', 'ㅏ', 'ㄴ'], hits: [at(3, 0), at(3, 0.25), at(3, 0.5)], merge: at(3, 1) },
  { syl: '글', jamo: ['ㄱ', 'ㅡ', 'ㄹ'], hits: [at(3, 1.25), at(3, 1.5), at(3, 1.75)], merge: at(3, 2) },
  { syl: '날', jamo: ['ㄴ', 'ㅏ', 'ㄹ'], hits: [at(3, 2.25), at(3, 2.5), at(3, 2.75)], merge: at(3, 3) },
]

// ── 4마디 ──
export const T4 = { flip: at(4, 0), serif: at(4, 1), rule: at(4, 2), flood: at(4, 3), zoom0: at(4, 3.5), cut: at(5, 0) }

// ── 5마디: 1443 → 1446 ──
export const T5 = { odo0: at(5, 0), odo1: at(5, 0.75), made: at(5, 1), roll0: at(5, 2), roll1: at(5, 2.5), book: at(5, 2.5), foot: at(5, 3) }

// ── 6마디: 28 → 24 ──
// 훈민정음 초성 17자 · 중성 11자 (『훈민정음』 차례)
export const JAMO28 = [...'ㄱㅋㆁㄷㅌㄴㅂㅍㅁㅈㅊㅅㆆㅎㅇㄹㅿ', ...'ㆍㅡㅣㅗㅏㅜㅓㅛㅑㅠㅕ']
export const LOST = new Set(['ㆁ', 'ㆆ', 'ㅿ', 'ㆍ'])
export const GRID = JAMO28.map((_, i) => at(6, 0) + i * (BEAT * 0.9) / 28)
export const T6 = { head: at(6, 1), fall: at(6, 2), now: at(6, 2.5) }

// ── 7마디: 학년 ──
export const T7 = { head: at(7, 0), bars: [at(7, 1), at(7, 1.5), at(7, 2)], land: 0.5, sub: at(7, 3) }
export const GRADES = [['1–2학년', 32], ['3–4학년', 35], ['5–6학년', 37]]

// ── 8마디: 다음 ──
export const T8 = { head: at(8, 0), steps: [at(8, 1), at(8, 1.5), at(8, 2), at(8, 2.5)], sub: at(8, 3) }
export const STEPS = ['질문', '설명', '활동', '정답']

// ── 9마디: QR ──
export const T9 = { head: at(9, 0), grid0: at(9, 0.5), grid1: at(9, 2), chips: [at(9, 2.5), at(9, 2.75), at(9, 3)] }

// ── 10마디: 골든벨 ──
export const T10 = { bell: at(10, 0), line: at(10, 1), strike: at(10, 1.5), fall: at(10, 1.75), all: at(10, 2), sub: at(10, 3) }

// ── 11마디: 오프라인 ──
export const T11 = { head: at(11, 0), drops: [0, 1, 2, 3].map((i) => at(11, 1 + i * 0.25)), slam: at(11, 2), foot: at(11, 3), glitch: at(11, 3.5) }

// ── 12마디: 40분 + 빌드 ──
export const T12 = { zoom0: at(12, 0), zoom1: at(12, 1), unit: at(12, 1), stutter: [2.5, 2.75, 3, 3.25, 3.375, 3.5, 3.625].map((b) => at(12, b)) }

// ── 13마디: 드러남 ──
export const REVEAL = [['사람마다', 'ink'], ['쉽게 익혀', 'paper'], ['날마다', 'accent'], ['편하게.', 'ink']]

// ── 14마디: 만든 방법 ──
export const TOOLS = ['캔버스 = Chromium의 Skia', '120 BPM · 16마디 · 60fps', '소리도 코드로 합성', '모든 움직임이 박 위에']

// ── 15–16마디 ──
export const T15 = { assemble: at(15, 0), rule: at(15, 1), url: at(15, 2), tags: [at(15, 2.5), at(15, 3), at(15, 3.5)] }
export const URL_TEXT = 'reinhardt7177-lab.github.io/hangeul-classroom'
export const T16 = { collapse: at(16, 2), cursor: at(16, 2.5), stop: at(16, 2) }

// ── 킥: 화면이 같은 곡선으로 숨 쉰다 ──
export const KICKS = []
for (let b = 1; b <= BARS; b++) {
  if (b === 1) for (let k = 0; k < 4; k++) KICKS.push(at(b, k))
  if (b === 2) for (let k = 0; k < 3; k++) KICKS.push(at(b, k))
  if (b >= 3 && b <= 11) for (let k = 0; k < 4; k++) KICKS.push(at(b, k))
  if (b === 12) for (let k = 0; k < 2; k++) KICKS.push(at(b, k))
  if (b >= 13 && b <= 15) for (let k = 0; k < 4; k++) KICKS.push(at(b, k))
  if (b === 16) for (let k = 0; k < 2; k++) KICKS.push(at(b, k))
}

// 드롭 앞 죽은 16분 — 화면은 검정, 소리는 완전한 무음
export const SILENT = [[at(2, 3.75), at(3, 0)], [at(12, 3.75), at(13, 0)]]

// 빠른 구간 — 모션 블러 16샘플
export const FAST = [
  [at(3, 0), at(3, 3.3)], [at(4, 3.4), at(5, 0)], [at(5, 0), at(5, 0.8)], [at(5, 2), at(5, 2.6)],
  [at(7, 0), at(7, 0.3)], [at(10, 0), at(10, 0.3)], [at(11, 2), at(11, 2.3)], [at(12, 0), at(12, 1.1)],
  [at(12, 2.5), at(12, 3.75)], [at(13, 0), at(14, 0)], [at(15, 0), at(15, 0.8)], [at(16, 2), at(16, 2.6)],
]

// 마디마다의 화음
export const CHORDS = ['Fmaj7', ['Dm7', 'G7'], 'C', 'C', 'Fmaj7', 'G', 'Em7', 'Am7', 'Fmaj7', 'G', 'Em7', ['Dm7', 'G7'], 'C', 'Am', 'F', 'Gsus4']
