// Behavioral regression checks for teacher presentation and student activities.
// Run from any directory: node site/verify-presenter.mjs
// This checks state/render/event logic. Actual browser layout and pointer accuracy
// must still be verified in a browser.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const dist=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const elements=new Map();
const listeners=new Map();
let dialogOpen=false;
function makeElement(){
 return {innerHTML:'',textContent:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},
  focus(){},scrollIntoView(){},setAttribute(){},removeAttribute(){},querySelector(){return null},
  querySelectorAll(){return []},animate(){},getBoundingClientRect(){return {width:1440,height:900}},
  addEventListener(){}};
}
function element(id){if(!elements.has(id))elements.set(id,makeElement());return elements.get(id)}
function listen(scope,type,handler,options){
 const key=scope+':'+type;
 if(!listeners.has(key))listeners.set(key,[]);
 listeners.get(key).push({handler,capture:options===true||!!options?.capture});
}
const document={
 getElementById:element,querySelector(selector){return selector==='dialog[open]'&&dialogOpen?{}:null},
 querySelectorAll(){return []},addEventListener(type,handler,options){listen('document',type,handler,options)},
 documentElement:makeElement(),body:makeElement(),activeElement:null,
};
const sandbox={document,location:{hash:'',href:'http://localhost:4198/'},
 localStorage:{getItem(){return null},setItem(){}},
 setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},
 requestAnimationFrame(fn){fn();return 1},cancelAnimationFrame(){},
 URL,console,AbortController,matchMedia(){return {matches:false}},scrollTo(){},
 addEventListener(type,handler,options){listen('window',type,handler,options)},
};
sandbox.window=sandbox;
sandbox.history={replaceState(_state,_title,url){sandbox.location.hash=String(url).includes('#')?'#'+String(url).split('#')[1]:String(url)}};
const context=vm.createContext(sandbox);
const run=code=>vm.runInContext(code,context);
const html=()=>element('app').innerHTML;
const position=()=>JSON.parse(run('JSON.stringify({grade:state.grade,index:state.index,beat:state.presenterBeat,view:state.view,student:state.student})'));
const plain=s=>String(s).replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
function key(keyName,tagName='BODY',editable=false){
 let prevented=false,stopped=false,propagationStopped=false;
 const target={tagName,isContentEditable:editable,closest(selector){
  return selector.split(',').some(s=>s.trim().toUpperCase()===tagName||(editable&&s.includes('contenteditable')))?this:null;
 }};
 const event={key:keyName,code:keyName===' '?'Space':keyName,target,
  get defaultPrevented(){return prevented},
  preventDefault(){prevented=true},stopPropagation(){propagationStopped=true},stopImmediatePropagation(){stopped=true}};
 const entries=[...(listeners.get('document:keydown')||[])].sort((a,b)=>Number(b.capture)-Number(a.capture));
 for(const item of entries){if(stopped)break;if(propagationStopped&&!item.capture)continue;item.handler(event)}
 return prevented;
}

const index=fs.readFileSync(path.join(dist,'hangeul.html'),'utf8');
const scripts=[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(x=>x[1]);
for(const src of scripts){
 if(/^https?:/.test(src)||src.startsWith('vendor/'))continue;
 const file=path.join(dist,src.split('?')[0]);
 vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
assert.equal(typeof sandbox.renderPresentation,'function','Presentation renderer must load from hangeul.html');
assert.equal(typeof sandbox.movePresentation,'function','Presentation navigation must load from hangeul.html');
assert.equal(typeof sandbox.presentationBeats,'function','Presentation beat lookup must load from hangeul.html');
assert.ok(sandbox.HANGEUL_PRESENTATION,'Presentation data must load before use');

// Historical imagery gate: only reviewed assets may appear in teacher scenes.
const approvedAssets=new Set(['hero-sejong.png','writing-desk.png','school-sign.png','classroom-note.png','library-together.png','hangul-garden.png']);
const presentationSource=fs.readFileSync(path.join(dist,'presenter-data.js'),'utf8');
for(const [,asset] of presentationSource.matchAll(/"image": "([^"]+)"/g)){
 assert.ok(approvedAssets.has(asset),`Unreviewed historical/visual asset in presentation: ${asset}`);
 assert.ok(fs.existsSync(path.join(dist,'assets',asset)),`Missing reviewed asset: ${asset}`);
}
assert.ok(!presentationSource.includes('village-message'), 'Unverified early-Joseon village scene must stay out of class');
const presenterSource=fs.readFileSync(path.join(dist,'hangeul-presenter.js'),'utf8');
assert.ok(presenterSource.includes('1443년 창제 현장이나 실제 초상은 아님'), 'Sejong portrait must disclose its historical limit');
assert.ok(sandbox.HANGEUL_DATA.sources.some(s=>s.url.includes('gogung.go.kr')), 'Official Joseon costume reference must be in teacher sources');

let renderedBeats=0,quizQuestions=0,chapterBoundaries=0;
const gradeResults=[];
for(const [grade,lesson] of Object.entries(sandbox.HANGEUL_DATA.grades)){
 const chapters=sandbox.HANGEUL_PRESENTATION[grade]??sandbox.HANGEUL_PRESENTATION.grades?.[grade];
 assert.ok(Array.isArray(chapters),`${grade}: chapter arrays required`);
 assert.equal(chapters.length,lesson.slides.length,`${grade}: chapter count matches activity data`);
 const expected=[];
 for(let chapter=0;chapter<lesson.slides.length;chapter++){
  const beats=sandbox.presentationBeats(grade,chapter);
  assert.ok(Array.isArray(beats)&&beats.length,`${grade}/${chapter}: no empty chapter`);
  if(chapter===8)assert.equal(beats.length,2+lesson.quiz.length*2,`${grade}: intro + question/explanation pairs + finish`);
  for(let beat=0;beat<beats.length;beat++)expected.push({index:chapter,beat});
 }
 run(`startLesson('${grade}',0,false)`);
 assert.deepEqual({index:position().index,beat:position().beat},expected[0],`${grade}: fresh teacher start`);
 sandbox.movePresentation(-1);
 assert.deepEqual({index:position().index,beat:position().beat},expected[0],`${grade}: beginning clamps`);
 for(let n=0;n<expected.length;n++){
  const got=position();
  assert.equal(got.student,false);
  assert.deepEqual({index:got.index,beat:got.beat},expected[n],`${grade}: forward beat ${n}`);
  assert.ok(html().length>100,`${grade}: nonempty render`);
  assert.ok(!/\bundefined\b|\bNaN\b/.test(html()),`${grade}: no unresolved values`);
  assert.ok(!html().includes('class="p-art-caption"'),`${grade}: image provenance caption must stay off the presentation`);
  assert.ok(!/class="p-notice[^\"]*">[^<]*(그림|삽화|사진|실제|상징|교육용)/.test(html()),`${grade}: image provenance notice must stay off the presentation`);
  if(n&&expected[n].index!==expected[n-1].index)chapterBoundaries++;
  renderedBeats++;
  if(n<expected.length-1)sandbox.movePresentation(1);
 }
 // Reverse through every chapter boundary, including the dynamic quiz chapter.
 for(let n=expected.length-2;n>=0;n--){
  sandbox.movePresentation(-1);
  assert.deepEqual({index:position().index,beat:position().beat},expected[n],`${grade}: reverse beat ${n}`);
 }
 // Direct chapter start cannot retain a beat from the previous chapter.
 run(`startLesson('${grade}',8,false)`);
 assert.equal(position().beat,0);
 for(let q=0;q<lesson.quiz.length;q++){
  sandbox.movePresentation(1);
  const question=lesson.quiz[q];
  const questionText=plain(html());
  assert.ok(questionText.includes(plain(question.question)),`${grade}/${q}: question shown before explanation`);
  assert.ok(!questionText.includes(plain(question.explanation)),`${grade}/${q}: explanation must not leak into question beat`);
  sandbox.movePresentation(1);
  assert.ok(plain(html()).includes(plain(question.explanation)),`${grade}/${q}: explanation included`);
  quizQuestions++;
 }
 sandbox.movePresentation(1); // quiz finish
 assert.equal(position().index,8);
 sandbox.movePresentation(1); // last chapter
 assert.equal(position().index,9);
 const last=sandbox.presentationBeats(grade,9).length;
 for(let i=0;i<last;i++)sandbox.movePresentation(1);
 assert.equal(position().view,'home',`${grade}: final next returns home`);
 gradeResults.push({grade,beats:expected.length,quizQuestions:lesson.quiz.length});
}

// One keyboard event must advance one beat, not both beat and old chapter handlers.
run("startLesson('3-4',0,false)");
const first=position();
key('ArrowRight');
const advanced=position();
const oneStep=sandbox.presentationBeats('3-4',0).length>1?{index:0,beat:1}:{index:1,beat:0};
assert.deepEqual({index:advanced.index,beat:advanced.beat},oneStep,'ArrowRight advances exactly one beat');
key('ArrowLeft');
assert.deepEqual(position(),first,'ArrowLeft returns to previous beat exactly');
for(const tag of ['INPUT','TEXTAREA','SELECT']){
 const before=position();key('ArrowRight',tag);assert.deepEqual(position(),before,`Typing in ${tag} must not navigate`);
}
const editableBefore=position();key('ArrowRight','DIV',true);assert.deepEqual(position(),editableBefore);
dialogOpen=true;
const dialogBefore=position();key('ArrowRight');assert.deepEqual(position(),dialogBefore,'Open dialog owns keyboard');
dialogOpen=false;

// QR student mode keeps editable tasks and moves within the tablet activity flow.
for(const grade of Object.keys(sandbox.HANGEUL_DATA.grades)){
 run(`startLesson('${grade}',5,true)`);
 assert.equal(position().student,true);
 assert.ok(html().includes('data-draft='),`${grade}: student activity inputs retained`);
 key('ArrowRight');
 assert.equal(position().index,8,`${grade}: tablet moves from creation to Golden Bell`);
 assert.ok(html().includes('quiz-start'),`${grade}: Golden Bell start retained`);
 assert.ok(!html().includes('data-action="home"'),`${grade}: tablet does not expose teacher home`);
 assert.ok(!html().includes('data-action="notes"'),`${grade}: tablet does not expose teacher notes`);
 key('ArrowLeft');assert.equal(position().index,5,`${grade}: tablet returns to creation`);
}

// Teacher-only silent video inserts retain a still-image fallback and local files.
for(const asset of ['writing-tools.mp4','classroom-note.mp4','sejong-purpose-kling.mp4']){
 assert.ok(fs.statSync(path.join(dist,'videos',asset)).size>100_000,`Missing or empty video: ${asset}`);
}
assert.ok(presenterSource.includes('sejong-purpose-kling'),'Reviewed Sejong purpose clip must be referenced by the presenter');
assert.ok(fs.statSync(path.join(dist,'videos','hangeul-timeline-skia.mp4')).size>40_000,'Missing Skia typography video');
assert.ok(fs.statSync(path.join(dist,'assets','timeline-skia.png')).size>10_000,'Missing Skia final-frame poster');
assert.ok(fs.statSync(path.join(dist,'videos','hangeul-documentary-kling-60s.mp4')).size>1_000_000,'Missing documentary video');
run("startLesson('1-2',0,false)");
assert.ok(html().includes('videos/hangeul-documentary-kling-60s.mp4'),'Teacher lesson must begin with the documentary');
sandbox.movePresentation(1);
assert.ok(html().includes('videos/classroom-note.mp4'),'Low-grade opener must include the classroom insert');
for(const grade of Object.keys(sandbox.HANGEUL_DATA.grades)){
 run(`startLesson('${grade}',0,false)`);
 assert.ok(html().includes('videos/hangeul-documentary-kling-60s.mp4'),`${grade}: documentary opener missing`);
 assert.ok(html().includes('data-action="video-toggle"'),`${grade}: documentary needs pause/resume`);
 assert.ok(html().includes('poster="assets/documentary-poster.png"'),`${grade}: documentary needs a fallback poster`);
 run(`startLesson('${grade}',2,false)`);
 assert.ok(html().includes('videos/writing-tools.mp4'),`${grade}: story insert must be present`);
 assert.ok(html().includes('poster="assets/writing-desk.png"'),`${grade}: still-image video fallback required`);
 sandbox.movePresentation(1);
 assert.ok(html().includes('videos/sejong-purpose-kling.mp4'),`${grade}: reviewed Sejong purpose clip must play`);
 assert.ok(html().includes('poster="assets/hero-sejong.png"'),`${grade}: Sejong clip needs the reviewed still fallback`);
 assert.ok(html().includes('src="assets/hero-sejong.png"'),`${grade}: Sejong's purpose beat must show the reviewed still hero-sejong.png`);
 if(grade!=='1-2'){
  sandbox.movePresentation(1);
  assert.ok(html().includes('videos/hangeul-timeline-skia.mp4'),`${grade}: typography timeline should follow Sejong's purpose`);
  assert.ok(html().includes('poster="assets/timeline-skia.png"'),`${grade}: timeline needs an exact-text fallback`);
 }
}
run("startLesson('3-4',3,true)");
assert.ok(!html().includes('videos/'),'Student tablet activity must not require watching the teacher video');
run("startLesson('5-6',2,false)");
assert.ok(!html().includes('상징적인 쓰기 도구 그림입니다'),'Writing-desk provenance box must not appear on the student-facing slide');

console.log(JSON.stringify({status:'passed',gradeResults,renderedBeats,quizQuestions,chapterBoundaries,
 forwardAndReverse:'passed',finalExit:'passed',questionExplanationSeparation:'passed',
 keyboard:'passed',inputAndDialogGuards:'passed',studentActivities:'passed',
 limitation:'State/render/event checks only. Browser layout and pointer hit testing are separate.'},null,2));
