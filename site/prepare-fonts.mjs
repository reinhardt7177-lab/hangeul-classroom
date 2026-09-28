import fs from 'node:fs';
import path from 'node:path';

// Include the teacher deck and student pages in the same Korean font subset.
const lessonFiles = fs.readdirSync('dist')
  .filter(name => /\.(?:js|html)$/.test(name))
  .map(name => path.join('dist', name));
const lessonText = lessonFiles.map(file => fs.readFileSync(file, 'utf8')).join('');
// ㄱ-ㆎ covers all compatibility jamo, including the obsolete ㅿ·ㆁ·ㆆ·ㆍ used when explaining the original 28 letters.
const chars = [...new Set((lessonText.match(/[가-힣ㄱ-ㆎA-Za-z0-9.,!?·→←]/g) || []))]
  .sort().join('');

fs.mkdirSync('dist/fonts', { recursive: true });
const fontFiles = [];
let css = '/* Noto fonts by Google, SIL Open Font License. Subset includes all classroom pages. */\n';

for (const [family, name] of [
  ['Noto Sans KR', 'noto-sans-kr'],
  ['Noto Serif KR', 'noto-serif-kr']
]) {
  const url = new URL('https://fonts.googleapis.com/css2');
  url.searchParams.set('family', `${family}:wght@400;500;600;700;800;900`);
  url.searchParams.set('display', 'swap');
  url.searchParams.set('text', chars);
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36' }
  });
  if (!response.ok) throw Error(`Font CSS ${response.status}`);
  let rules = await response.text();
  const urls = [...new Set([...rules.matchAll(/url\(([^)]+)\)/g)].map(match => match[1]))];
  let count = 0;
  for (const source of urls) {
    const fontUrl = new URL(source);
    if (fontUrl.hostname !== 'fonts.gstatic.com') throw Error('Unexpected font host');
    const fontResponse = await fetch(fontUrl);
    if (!fontResponse.ok) throw Error(`Font ${fontResponse.status}`);
    const bytes = Buffer.from(await fontResponse.arrayBuffer());
    const signature = bytes.subarray(0, 4).toString('ascii');
    const extension = signature === 'wOF2' ? 'woff2' :
      signature === 'wOFF' ? 'woff' :
      bytes.subarray(0, 4).equals(Buffer.from([0, 1, 0, 0])) ? 'ttf' : null;
    if (!extension) throw Error(`Unknown font format: ${signature}`);
    const format = { woff2: 'woff2', woff: 'woff', ttf: 'truetype' }[extension];
    const file = `${name}-${++count}.${extension}`;
    fontFiles.push([path.join('dist', 'fonts', file), bytes]);
    rules = rules.split(source).join(`./fonts/${file}`);
    rules = rules.replace(new RegExp(`url\\(\\./fonts/${file.replaceAll('.', '\\.')}\\) format\\('[^']+'\\)`, 'g'),
      `url(./fonts/${file}) format('${format}')`);
  }
  css += `${rules}\n`;
  console.log(`${name}: ${count} font files`);
}

// Replace only generated font files after every download succeeds.
for (const [file, bytes] of fontFiles) fs.writeFileSync(file, bytes);
fs.writeFileSync('dist/fonts.css', css);
const currentNames = new Set(fontFiles.map(([file]) => path.basename(file)));
for (const oldName of fs.readdirSync('dist/fonts')) {
  if (/^noto-(?:sans|serif)-kr-\d+\.(?:woff2|woff|ttf)$/.test(oldName) && !currentNames.has(oldName)) {
    fs.unlinkSync(path.join('dist', 'fonts', oldName));
  }
}
console.log(`Content subset glyphs: ${chars.length}`);
