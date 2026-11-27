import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import './dist/samil-data.js';

const { sources, visuals, places, grades, era } = globalThis.SamilData;
const questionCounts = { '1-2': 4, '3-4': 5, '5-6': 6 };
const read = name => fs.readFileSync(new URL('./dist/' + name, import.meta.url));
assert.match(read('index.html').toString(), /<a [^>]+href="samil\.html"[^>]+3·1절 수업 열기/);
assert.deepEqual(Object.keys(grades), ['1-2', '3-4', '5-6']);
assert.deepEqual(places.map(p => p.date), ['3월 1일', '3월 1일', '4월 1일']);
assert.deepEqual(era.map(event => event.iso), ['1910-02', '1910-08', '1919-03-01', '1919-04', '1939', '1942-10', '1945-08-15']);
const score = read('audio/samil-words-left.mp3');
assert.equal(score.subarray(0, 3).toString(), 'ID3');
assert.ok(score.length > 500_000, 'Missing or incomplete 3·1절 score');
assert.equal(read('assets/samil-map.webp').subarray(8, 12).toString(), 'WEBP');
for (const asset of Object.values(visuals)) {
  assert.equal(read('assets/' + asset.file).subarray(8, 12).toString(), 'WEBP');
  assert.ok(sources[asset.source].credit && new URL(sources[asset.source].url).protocol === 'https:');
}
for (const [id, grade] of Object.entries(grades)) {
  assert.equal(grade.slides[0].type, 'cover');
  assert.equal(grade.slides.filter(slide => slide.type === 'activity').length, 1);
  assert.equal(grade.quiz.length, questionCounts[id]);
  for (const question of grade.quiz) {
    assert.ok(question.options[question.correct] && question.explain);
    assert.equal(new Set(question.options).size, question.options.length);
  }
  for (const audience of ['student', 'teacher']) {
    const file = read('worksheets/samil-' + id + '-' + audience + '.pdf');
    assert.equal(file.subarray(0, 5).toString(), '%PDF-');
    assert.equal(file.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length, 2);
  }
}
function renderRoute(hash) {
  const app = { innerHTML: '', querySelector() { return null; } };
  const document = { getElementById: () => app, addEventListener() {} };
  app.addEventListener = () => {};
  const window = { SamilData: globalThis.SamilData, ActivityQr: { register() {} }, addEventListener() {} };
  vm.runInNewContext(read('samil.js').toString(), { window, document, location: { hash } });
  return app.innerHTML;
}
let scenes = 0;
for (const [id, grade] of Object.entries(grades)) {
  const count = grade.slides.length + grade.quiz.length + 1;
  for (let index = 0; index < count; index++) {
    const html = renderRoute('#lesson/' + id + '/' + index);
    assert.ok(html.includes((index + 1) + ' / ' + count), 'Unreachable lesson scene');
    assert.match(html, /class="s-explanation" aria-live="polite" hidden/);
    assert.match(html, /data-action="scenes"/);
    if (grade.slides[index]?.type === 'map') {
      assert.match(html, /samil-map\.webp/);
      assert.match(html, /data-action="place" data-id="pyeongyang"/);
    }
    scenes++;
  }
}
const tabletMap = renderRoute('#student/3-4/activity');
assert.match(tabletMap, /지도에서 날짜 비교하기/);
assert.equal([...tabletMap.matchAll(/data-origin="pin"/g)].length, 3);
assert.equal([...tabletMap.matchAll(/data-origin="list"/g)].length, 3);
for (const [id, grade] of Object.entries(grades)) {
  const quiz = renderRoute('#student/' + id + '/quiz');
  assert.match(quiz, /3·1절 골든벨/);
  assert.equal([...quiz.matchAll(/class="s-student-question"/g)].length, 1);
  assert.equal([...quiz.matchAll(/data-action="choice"/g)].length, grade.quiz[0].options.length);
  assert.match(quiz, /data-action="quiz-next" disabled/);
}
const high = grades['5-6'].slides;
const letterIndex = high.findIndex(slide => slide.record?.links.includes('ahnLetter'));
const letter = renderRoute('#lesson/5-6/' + letterIndex);
assert.match(letter, /어머님 전상서/);
assert.match(letter, /마음 편안히 지내시기를 바랍니다/);
assert.match(letter, /data-action="artifact" data-id="ahn"/);
assert.match(letter, /data-action="toggle-score">음악 재생/);
assert.match(letter, /<audio[^>]+src="audio\/samil-words-left.mp3"/);
assert.doesNotMatch(letter, /<audio[^>]+autoplay/);
const maria = high.find(slide => slide.record?.links.includes('mariaResearch')).record;
assert.match(maria.context, /후대/);
assert.ok(!maria.quotation, 'Unverified words must not be formatted as a quotation');
console.log('3·1절: ' + scenes + ' teacher scenes, historical records and score, QR routes, 15 questions and six two-page PDFs verified.');
