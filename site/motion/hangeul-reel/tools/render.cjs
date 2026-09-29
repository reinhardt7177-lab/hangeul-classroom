#!/usr/bin/env node
/**
 * 렌더 — 크로미움(Skia 캔버스)이 프레임을 그리고, ffmpeg(libx264)가 굽는다.
 *
 *   node tools/render.cjs sheet NAME t1 t2 …     검수 시트 out/NAME.png
 *   node tools/render.cjs big NAME t1 [t2 …]     크게 한 장씩 out/NAME-t.png
 *   node tools/render.cjs audio                  out/mix.wav + 마디별 음량·무음 점검
 *   node tools/render.cjs render [--workers 4]   out/hangeul-reel.mp4 (H.264 CRF16 · AAC · -14 LUFS)
 *   node tools/render.cjs review                 컷 앞뒤 프레임 시트 + 음량
 *   node tools/render.cjs cover [t]              out/cover.jpg
 *
 * 필요한 것: Node 18+, playwright-core, 크롬/크로미움, ffmpeg(libx264·aac·loudnorm).
 *   CHROME / FFMPEG / PLAYWRIGHT 환경 변수로 위치를 바꿀 수 있다. 글꼴은 tools/fetch-fonts.sh.
 */
const http = require('http')
const fs = require('fs')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'out')
fs.mkdirSync(OUT, { recursive: true })
const args = process.argv.slice(2)
const mode = args[0]
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d }
const pos = args.slice(1).filter((a, i, all) => !a.startsWith('--') && !(all[i - 1] || '').startsWith('--'))

const first = (...c) => c.find((p) => p && (p.includes('/') ? fs.existsSync(p) : true))
const FFMPEG = first(process.env.FFMPEG, '/projects/sandbox/tools/ffmpeg/bin/ffmpeg', 'ffmpeg')
const CHROME = first(process.env.CHROME, '/opt/playwright/chromium-1232/chrome-linux64/chrome', undefined)
function loadPW() {
  for (const p of [process.env.PLAYWRIGHT, 'playwright-core', 'playwright', '/root/.nvm/versions/node/v22.23.2/lib/node_modules/@playwright/mcp/node_modules/playwright-core'].filter(Boolean)) {
    try { return require(p) } catch {}
  }
  throw new Error('playwright-core 가 없다 — npm i -D playwright-core')
}
const { chromium } = loadPW()

// ── 정적 파일 + 받는 곳 ──
const sinks = new Map()
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf' }
function serve() {
  return new Promise((res) => {
    const s = http.createServer((req, rsp) => {
      const url = decodeURIComponent(req.url.split('?')[0])
      if (req.method === 'POST') {
        const sink = sinks.get(url)
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', async () => {
          if (sink) await sink(Buffer.concat(chunks))
          rsp.writeHead(sink ? 200 : 404).end()
        })
        return
      }
      const p = path.join(ROOT, url)
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) return rsp.writeHead(404).end()
      rsp.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' })
      fs.createReadStream(p).pipe(rsp)
    })
    s.listen(0, '127.0.0.1', () => res(s))
  })
}

async function openPage(port) {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu-vsync'] })
  const page = await browser.newPage()
  page.on('pageerror', (e) => console.error('[page]', e.message))
  page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()))
  await page.goto(`http://127.0.0.1:${port}/index.html?render`)
  await page.waitForFunction(() => window.__reel && (window.__reel.ready || window.__reel.error), null, { timeout: 180000 })
  const err = await page.evaluate(() => window.__reel.error)
  if (err) throw new Error(err)
  return { browser, page }
}

const run = (a, o = {}) => {
  const r = spawnSync(FFMPEG, ['-hide_banner', ...a], { encoding: 'utf8', maxBuffer: 1 << 26, ...o })
  if (r.status !== 0) throw new Error(r.stderr.slice(-2000))
  return r.stderr
}

/* ── 소리 점검: 마디별 RMS, 무음 창의 최고값 ── */
function audioStats(file) {
  const b = fs.readFileSync(file)
  const n = (b.length - 44) / 4, sr = 48000
  const rows = []
  for (let bar = 0; bar < 16; bar++) {
    let s = 0, c = 0, pk = 0
    for (let i = bar * 2 * sr; i < Math.min(n, (bar + 1) * 2 * sr); i++) { const v = b.readInt16LE(44 + i * 4) / 32768; s += v * v; c++; pk = Math.max(pk, Math.abs(v)) }
    rows.push(`bar ${String(bar + 1).padStart(2)}  rms ${(10 * Math.log10(s / c + 1e-12)).toFixed(1).padStart(6)} dB  peak ${pk.toFixed(2)}`)
  }
  const gaps = [[3.875, 4], [23.875, 24]].map(([a, z]) => {
    let pk = 0
    for (let i = Math.floor(a * sr); i < Math.floor(z * sr) - Math.floor(0.025 * sr); i++) pk = Math.max(pk, Math.abs(b.readInt16LE(44 + i * 4) / 32768))
    return `silent ${a}-${z}s peak ${pk.toFixed(4)}`
  })
  return rows.concat(gaps).join('\n')
}

function loudness(file) {
  const e = run(['-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
  const I = e.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()
  const tp = e.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop()
  return `${I}  true peak ${tp}`
}

;(async () => {
  const server = await serve()
  const port = server.address().port
  const post = (name, fn) => { sinks.set('/post/' + name, fn); return `http://127.0.0.1:${port}/post/${name}` }

  if (mode === 'sheet' || mode === 'big' || mode === 'cover') {
    const { browser, page } = await openPage(port)
    const samples = opt('samples', null) == null ? null : +opt('samples')
    if (mode === 'sheet') {
      const [name, ...ts] = pos
      const url = post('sheet', (b) => fs.writeFileSync(path.join(OUT, name + '.png'), b))
      await page.evaluate(([u, ts, cols, sc, sm]) => window.__reel.sheet(u, ts, cols, sc, sm), [url, ts.map(Number), +opt('cols', 4), +opt('scale', 0.25), samples])
      console.log('out/' + name + '.png')
    } else if (mode === 'big') {
      const [name, ...ts] = pos
      for (const t of ts) {
        const url = post('big', (b) => fs.writeFileSync(path.join(OUT, `${name}-${t}.png`), b))
        await page.evaluate(([u, t, sm]) => window.__reel.big(u, t, sm), [url, +t, samples])
        console.log(`out/${name}-${t}.png`)
      }
    } else {
      const t = +(pos[0] || 29.9)
      const png = path.join(OUT, 'cover.png')
      const url = post('big', (b) => fs.writeFileSync(png, b))
      await page.evaluate(([u, t]) => window.__reel.big(u, t, 16), [url, t])
      run(['-y', '-i', png, '-q:v', '2', path.join(OUT, 'cover.jpg')])
      fs.unlinkSync(png)
      console.log('out/cover.jpg')
    }
    await browser.close()
  } else if (mode === 'audio') {
    const { browser, page } = await openPage(port)
    const url = post('wav', (b) => fs.writeFileSync(path.join(OUT, 'mix.wav'), b))
    await page.evaluate((u) => window.__reel.wav(u), url)
    await browser.close()
    console.log(audioStats(path.join(OUT, 'mix.wav')))
  } else if (mode === 'render') {
    const workers = +opt('workers', 4)
    const total = 1920
    const from = +opt('from', 0), to = +opt('to', total)
    const per = Math.ceil((to - from) / workers)
    const segs = []
    const t0 = Date.now()
    await Promise.all([...Array(workers)].map(async (_, w) => {
      const a = from + w * per, z = Math.min(to, a + per)
      if (a >= z) return
      const seg = path.join(OUT, `seg-${String(a).padStart(4, '0')}.mp4`)
      segs[w] = seg
      const ff = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', '1080x1920', '-r', '60', '-i', 'pipe:0',
        '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', opt('preset', 'slow'), '-crf', '16', '-g', '120',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-threads', '2', seg], { stdio: ['pipe', 'inherit', 'inherit'] })
      const done = new Promise((r) => ff.on('close', r))
      const url = post('w' + w, (b) => new Promise((r) => (ff.stdin.write(b) ? r() : ff.stdin.once('drain', r))))
      const { browser, page } = await openPage(port)
      for (let fi = a; fi < z; fi++) {
        await page.evaluate(([fi, u]) => window.__reel.send(fi, u), [fi, url])
        if ((fi - a) % 60 === 0) console.log(`w${w} frame ${fi} (${((Date.now() - t0) / 1000).toFixed(0)}s)`)
      }
      ff.stdin.end()
      await done
      await browser.close()
    }))
    console.log(`frames done in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
    // 이어 붙이기
    const list = path.join(OUT, 'segs.txt')
    fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s}'`).join('\n'))
    const video = path.join(OUT, 'video.mp4')
    run(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video])
    // 소리 — 두 번 재는 loudnorm, -14 LUFS / -2 dBTP
    const wav = path.join(OUT, 'mix.wav')
    if (!fs.existsSync(wav)) throw new Error('먼저 audio 를 돌린다')
    const m1 = run(['-i', wav, '-af', 'loudnorm=I=-14:TP=-2:LRA=11:print_format=json', '-f', 'null', '-'])
    const j = JSON.parse(m1.slice(m1.lastIndexOf('{'), m1.lastIndexOf('}') + 1))
    const ln = `loudnorm=I=-14:TP=-2:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`
    const final = path.join(OUT, 'hangeul-reel.mp4')
    run(['-y', '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', `${ln},aresample=48000`, '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', final])
    for (const s of segs.filter(Boolean)) fs.unlinkSync(s)
    fs.unlinkSync(list)
    fs.unlinkSync(video)
    console.log('→', final, (fs.statSync(final).size / 1e6).toFixed(1) + ' MB')
    console.log(loudness(final))
  } else if (mode === 'timeline') {
    // 블렌더가 읽는 박자표 — 릴스와 같은 timeline.js 에서
    const T = await import(require('url').pathToFileURL(path.join(ROOT, 'src', 'timeline.js')).href)
    const out = {
      FPS: T.FPS, BEAT: T.BEAT, BPM: T.BPM, KICKS: T.KICKS,
      title: { start: T.at(3, 0), end: T.at(5, 0), zoom0: T.T4.zoom0, syl: T.SYL },
    }
    fs.mkdirSync(path.join(ROOT, 'blender'), { recursive: true })
    fs.writeFileSync(path.join(ROOT, 'blender', 'timeline.json'), JSON.stringify(out, null, 1))
    console.log('blender/timeline.json')
  } else if (mode === 'review') {
    const final = path.join(OUT, 'hangeul-reel.mp4')
    // 컷마다: 마지막 프레임과 첫 프레임
    // 컷마다 앞 마디의 마지막 프레임, 뒤 마디의 첫 프레임 (프레임 번호로 정확히)
    const frames = []
    for (let bar = 1; bar < 16; bar++) frames.push(bar * 120 - 1, bar * 120)
    const dir = path.join(OUT, 'cuts')
    fs.mkdirSync(dir, { recursive: true })
    const sel = frames.map((n) => `eq(n\\,${n})`).join('+')
    run(['-y', '-i', final, '-vf', `select='${sel}',scale=270:480`, '-fps_mode', 'passthrough', path.join(dir, '%02d.png')])
    run(['-y', '-framerate', '1', '-start_number', '1', '-i', path.join(dir, '%02d.png'), '-vf', 'tile=10x3:padding=6:color=0x222222', '-frames:v', '1', path.join(OUT, 'cuts.png')])
    fs.rmSync(dir, { recursive: true })
    console.log('out/cuts.png')
    console.log(loudness(final))
    console.log(spawnSync(FFMPEG, ['-hide_banner', '-i', final], { encoding: 'utf8' }).stderr.split('\n').filter((l) => /Duration|Stream/.test(l)).join('\n'))
  } else {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 14).join('\n'))
  }
  server.close()
})().catch((e) => { console.error(e); process.exit(1) })
