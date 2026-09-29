// 렌더러 페이지 — tools/render.cjs 가 이 페이지를 띄워 프레임과 소리를 받아 간다.
// 브라우저에서 그냥 열면(정적 서버) 미리보기로 재생된다.
import { W, H, FPS, FRAMES, DURATION } from './timeline.js'
import { loadFonts, makeFrameRenderer } from './engine.js'
import { draw, isFast, setSource } from './reel.js'
import { renderScore, wavBytes } from './audio.js'

const params = new URLSearchParams(location.search)
const view = document.getElementById('view')
const vc = view.getContext('2d')

async function boot() {
  await loadFonts(new URL('../fonts/', import.meta.url).href)
  setSource(await (await fetch(new URL('./reel.js', import.meta.url))).text())
  const frame = makeFrameRenderer(draw, isFast)
  const readCtx = new OffscreenCanvas(W, H).getContext('2d', { willReadFrequently: true })

  window.__reel = {
    ready: true,
    FRAMES, FPS,
    /** 한 프레임을 그려 RGBA 를 렌더 서버로 보낸다 */
    async send(fi, url, samples = null) {
      const acc = frame(fi / FPS, samples)
      readCtx.drawImage(acc, 0, 0)
      const px = readCtx.getImageData(0, 0, W, H).data
      const r = await fetch(url, { method: 'POST', body: px })
      return r.ok
    },
    /** 스틸 — 여러 시각을 한 장의 시트로 (검수용) */
    async sheet(url, times, cols = 4, scale = 0.25, samples = null) {
      const w = W * scale, h = H * scale, rows = Math.ceil(times.length / cols)
      const sh = new OffscreenCanvas(w * cols, (h + 28) * rows)
      const g = sh.getContext('2d')
      g.fillStyle = '#222'
      g.fillRect(0, 0, sh.width, sh.height)
      times.forEach((t, i) => {
        const acc = frame(t, samples)
        const x = (i % cols) * w, y = Math.floor(i / cols) * (h + 28)
        g.drawImage(acc, x, y + 28, w - 4, h - 4)
        g.fillStyle = '#fff'
        g.font = '18px monospace'
        const bar = Math.floor(t / 2) + 1, beat = ((t % 2) / 0.5).toFixed(2)
        g.fillText(`${t.toFixed(3)}s  bar ${bar} beat ${beat}`, x + 6, y + 20)
      })
      const blob = await sh.convertToBlob({ type: 'image/png' })
      await fetch(url, { method: 'POST', body: blob })
      return true
    },
    async big(url, t, samples = null) {
      const acc = frame(t, samples)
      const blob = await acc.convertToBlob({ type: 'image/png' })
      await fetch(url, { method: 'POST', body: blob })
      return true
    },
    async wav(url) {
      const bytes = wavBytes(await renderScore())
      await fetch(url, { method: 'POST', body: bytes })
      return bytes.length
    },
  }

  if (params.has('render')) return
  // 미리보기 — 소리 없이 실시간
  const t0 = performance.now()
  const loop = () => {
    const t = ((performance.now() - t0) / 1000) % DURATION
    vc.drawImage(frame(t, 1), 0, 0)
    requestAnimationFrame(loop)
  }
  loop()
}
boot().catch((e) => { console.error(e); window.__reel = { error: String(e.stack || e) } })
