import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'dist');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'gaecheon-data.js'),'utf8'),ctx);
const data=ctx.window.GAECHEON_DATA;
assert.deepEqual(Object.keys(data.grades).sort(),['1-2','3-4','5-6']);
const expectedQuiz={'1-2':3,'3-4':4,'5-6':5};
for(const [id,g] of Object.entries(data.grades)){
 assert.equal(g.slides.reduce((n,s)=>n+s.minutes,0),40,`${id} must fit one class period`);
 assert.equal(g.slides.filter(s=>s.kind==='quiz').length,expectedQuiz[id]);
 assert.ok(g.slides.some(s=>s.kind==='activity'),`${id} requires tablet activity`);
 assert.ok(g.slides.some(s=>/전승/.test(s.answer)),`${id} must describe the transmission as a tradition`);
 for(const s of g.slides){
  assert.ok(s.title&&s.question&&s.answer&&s.note,`${id} slide needs teacher-ready content`);
  assert.ok(fs.existsSync(path.join(root,'assets',s.image+'.png')),`${id} missing ${s.image}`);
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
assert.ok(app.includes("student/${state.grade}"),'teacher QR must target the grade tablet route');
assert.ok(app.includes("data-action=\"replay\""),'teacher motion replay missing');
assert.ok(app.includes('PageDown'),'teacher slide shortcut missing');
assert.ok(fs.existsSync(path.join(root,'assets','gaecheon-fact-skia.png')),'Skia fact graphic missing');
assert.ok(!fs.readdirSync(path.join(root,'videos')).some(x=>x.startsWith('gaecheon-')),'Gaecheonjeol video must await approval');
console.log('Gaecheonjeol: 3 × 40-minute lessons, 12 questions, six PDFs, QR route, Skia still and history labels verified.');
