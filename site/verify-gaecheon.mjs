import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'dist');
const ctx={window:{}};for(const name of ['learning-resources.js','gaecheon-data.js'])vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),ctx);
const data=ctx.window.GAECHEON_DATA;
assert.deepEqual(Object.keys(data.grades).sort(),['1-2','3-4','5-6']);
const expectedQuiz={'1-2':3,'3-4':4,'5-6':5};
for(const [id,g] of Object.entries(data.grades)){
 assert.equal(new Set(g.slides.map(s=>s.id)).size,g.slides.length);assert.ok(g.slides.every(s=>s.id&&!('minutes' in s)));
 assert.equal(g.slides.filter(s=>s.kind==='quiz').length,expectedQuiz[id]);
 assert.ok(g.slides.some(s=>s.kind==='activity'),`${id} requires tablet activity`);
 assert.ok(g.slides.some(s=>/전승/.test(s.answer)),`${id} must describe the transmission as a tradition`);
 assert.ok(g.slides[0].documentary,`${id} must open with the local intro video`);
 for(const s of g.slides){
  assert.ok(s.title&&s.question&&s.answer&&s.note,`${id} slide needs teacher-ready content`);
  assert.ok(fs.existsSync(path.join(root,'assets',s.image+'.webp')),`${id} missing ${s.image}`);
  if(s.video)assert.ok(fs.statSync(path.join(root,'videos',s.video+'.mp4')).size>200000,`${id} missing video ${s.video}`);
  if(s.documentary){
   assert.ok(fs.statSync(path.join(root,'videos',s.documentary.file+'.mp4')).size>5000000,`${id} missing intro video`);
   assert.ok(fs.existsSync(path.join(root,'assets',s.documentary.poster+'.webp')),`${id} missing intro poster`);
   assert.equal(s.documentary.script.length,12,`${id} intro script must list all 12 five-second scenes`);
  }
  if(s.choices)for(const option of s.choices)if(typeof option==='object'&&option.image)assert.ok(fs.existsSync(path.join(root,'assets',option.image+'.webp')),`${id} missing quiz image ${option.image}`);
  if(s.kind==='quiz')assert.ok(s.correct>=0&&s.correct<s.choices.length,`${id} invalid answer`);
 }
 for(const who of ['student','teacher']){
  const file=path.join(root,'worksheets',`gaecheon-${id}-${who}.pdf`);
  assert.ok(fs.readFileSync(file).subarray(0,5).toString()==='%PDF-',`${id} ${who} PDF missing`);
 }
}
const landing=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const name of ['3·1절','제헌절','광복절','개천절','한글날'])assert.ok(landing.includes(name),`landing missing ${name}`);
assert.ok(!/[三法光]/.test(landing),'landing must use Korean/number symbols rather than decorative Hanja');
for(const page of ['hangeul.html','gaecheon.html'])assert.ok(landing.includes(`href="${page}"`),`landing missing ${page}`);
const app=fs.readFileSync(path.join(root,'gaecheon.js'),'utf8');
// The dawn landscape reads as the Chinese Huangshan idiom (cliff pines, stone spires), so no page may show it.
for(const [name,text] of [['data',fs.readFileSync(path.join(root,'gaecheon-data.js'),'utf8')],['app',app],['landing',landing]])
 assert.ok(!text.includes('gaecheon-dawn'),`${name} still uses the Huangshan-like dawn image`);
assert.ok(app.includes('class="doc-video"')&&app.includes('controls'),'intro video player missing');
const share=fs.readFileSync(path.join(root,'activity-qr.js'),'utf8');
assert.ok(share.includes('student/${grade}/${target}'),'shared QR must target the grade and activity route');
assert.ok(app.includes("ActivityQr?.register('gaecheon'"),'Gaecheon must register its student activities');
assert.ok(app.includes("data-action=\"replay\""),'teacher motion replay missing');
assert.ok(app.includes("data-action=\"sound\""),'teacher soundtrack toggle missing');
assert.ok(app.includes('video.play()'),'teacher video autoplay missing');
assert.ok(app.includes('PageDown'),'teacher slide shortcut missing');
assert.ok(!app.includes('class="image-credit"'),'image provenance caption must stay off the teacher slide');
assert.ok(fs.existsSync(path.join(root,'assets','gaecheon-fact-skia.webp')),'Skia fact graphic missing');
assert.ok(data.sources.some(source=>source.url.includes('museum.go.kr')),'real museum artifact source missing');
console.log('Gaecheonjeol: three grade-band activity collections, 12 questions, six PDFs, QR route, local 60s intro video on every cover, story clip, images, Skia and history labels verified.');
