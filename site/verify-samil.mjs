import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import './dist/samil-history.js';
import './dist/samil-data.js';

const { sources, visuals, places, grades, era, remembrance, videos } = globalThis.SamilData;
const questionCounts = { '1-2': 4, '3-4': 5, '5-6': 6 };
const read = name => fs.readFileSync(new URL('./dist/' + name, import.meta.url));
assert.match(read('index.html').toString(), /<a [^>]+href="samil\.html"[^>]+3·1절 수업 열기/);
assert.deepEqual(Object.keys(grades), ['1-2', '3-4', '5-6']);
assert.deepEqual(places.map(p => p.date), ['3월 1일', '3월 1일', '4월 1일']);
assert.deepEqual(era.map(event => event.iso),
  ['1905-11', '1910-08', '1918-11', '1919-01-21', '1919-02-08', '1919-03-01', '1919-04-01', '1919-04-11', '1919-04-15', '1945-08-15']);
assert.equal(new Set(remembrance.filter(person => !person.companion).map(person => person.name)).size, 10);
assert.deepEqual(remembrance.slice(0, 2).map(person => person.id), ['ahn', 'maria']);
assert.ok(remembrance[1].context.includes('후대') && !remembrance[1].quotation);
for (const person of remembrance) {
  assert.ok(person.paragraphs.length && person.links.every(key => sources[key]));
  if (person.cues) {
    assert.equal(person.cues[0].at, 0);
    assert.ok(person.cues.every((cue, i) => cue.text && cue.at < 64 && (!i || cue.at > person.cues[i - 1].at)));
  }
}
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
  const dates = grade.slides.filter(scene => scene.iso).map(scene => scene.iso);
  assert.deepEqual(dates, [...dates].sort(), 'Chronology must precede the memorial chapter');
  assert.equal(dates[0], id === '5-6' ? '1905-11' : '1910-08');
  assert.equal(dates.at(-1), '1945-08-15');
  assert.ok(dates.includes('1919-02-08'));
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
  const memoryStart = grade.slides.length + grade.quiz.length;
  const count = memoryStart + remembrance.length + 2;
  for (let index = 0; index < count; index++) {
    const html = renderRoute('#lesson/' + id + '/' + index);
    assert.ok(html.includes((index + 1) + ' / ' + count), 'Unreachable lesson scene');
    if (index >= memoryStart && index < count - 1) {
      assert.match(html, /다음 이야기/);
      assert.doesNotMatch(html, /class="s-explanation"/);
    } else assert.match(html, /class="s-explanation" aria-live="polite" hidden/);
    assert.match(html, /data-action="scenes"/);
    if (grade.slides[index]?.type === 'map') {
      assert.match(html, /samil-map\.webp/);
      assert.match(html, /data-action="place" data-id="pyeongyang"/);
    }
    scenes++;
  }
  assert.match(renderRoute('#lesson/' + id + '/' + memoryStart), /열 사람의 이름을 기억하는 시간/);
  assert.match(renderRoute('#lesson/' + id + '/' + (count - 1)), /어떤 이름을 기억할까요/);
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
const letterIndex = high.length + grades['5-6'].quiz.length + 1;
const letter = renderRoute('#lesson/5-6/' + letterIndex);
assert.match(letter, /어머님 전상서/);
assert.match(letter, /마음 편안히 지내시기를 바랍니다/);
assert.match(letter, /data-action="artifact" data-id="ahn"/);
assert.match(letter, /data-action="toggle-score">교사 낭독 시작/);
assert.match(letter, /data-reading-cue hidden/);
assert.match(letter, /<audio[^>]+src="audio\/samil-words-left.mp3"/);
assert.doesNotMatch(letter, /<audio[^>]+autoplay/);
const maria = renderRoute('#lesson/5-6/' + (letterIndex + 1));
assert.match(maria, /조마리아/);
assert.match(maria, /후대/);
assert.doesNotMatch(maria, /<blockquote>/);
for (const key of Object.keys(videos)) {
  const index = high.findIndex(slide => slide.video === key);
  assert.ok(index > 0);
  assert.ok(renderRoute('#lesson/5-6/' + index).includes('data-action="video" data-id="' + key + '"'));
}
console.log('3·1절: ' + scenes + ' teacher scenes, chronology, 10 memorial biographies, narration cues, videos, QR routes, 15 questions and six PDFs verified.');
