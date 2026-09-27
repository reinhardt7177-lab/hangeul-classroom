import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const elements=new Map();
const element=()=>({innerHTML:'',textContent:'',classList:{add(){},remove(){}},focus(){}});
const dom={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelector(){return null},addEventListener(){},documentElement:{},body:element(),activeElement:null};
const window={addEventListener(){}};
const context=vm.createContext({window,document:dom,localStorage:{getItem(){return null},setItem(){}},history:{replaceState(){}},location:{hash:'',href:'http://localhost:4198/'},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},URL,console,matchMedia(){return{matches:false}}});
vm.runInContext(fs.readFileSync('dist/hangeul-data.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/hangeul.js','utf8'),context);
let scenes=0,questions=0;
for(const [grade,g]of Object.entries(window.HANGEUL_DATA.grades)){
 assert.equal(g.slides.length,10);assert.equal(g.slides.reduce((n,x)=>n+x.minutes,0),40);
 for(let i=0;i<10;i++){vm.runInContext(`startLesson('${grade}',${i})`,context);assert.ok(elements.get('app').innerHTML.includes(g.slides[i].title));assert.ok(!elements.get('app').innerHTML.includes('undefined'));scenes++;}
 vm.runInContext(`startLesson('${grade}',8);state.quizStarted=true`,context);
 for(let q=0;q<g.quiz.length;q++){vm.runInContext(`state.quiz=${q};state.reveal[getGrade().quiz[${q}].id]=true;renderLesson()`,context);assert.ok(!elements.get('app').innerHTML.includes('undefined'));questions++;}
 vm.runInContext('state.quizFinished=true;renderLesson()',context);assert.ok(elements.get('app').innerHTML.includes('한글 탐험을 마쳤어요'));
 for(const kind of ['student','teacher'])assert.ok(fs.existsSync(`dist/worksheets/hangul-${grade}-${kind}.pdf`));
}
assert.equal(vm.runInContext("state.letters={c:18,v:0,t:4};composed()",context),'한');
assert.equal(vm.runInContext("state.letters={c:0,v:18,t:8};composed()",context),'글');
assert.equal(vm.runInContext("state.letters={c:2,v:4,t:0};composed()",context),'너');
assert.equal(vm.runInContext("esc('<img onerror=1>')",context),'&lt;img onerror=1&gt;');
vm.runInContext("startLesson('3-4',6);state.checkReveal=true;renderLesson()",context);assert.ok(elements.get('app').innerHTML.includes('정답 X'));
vm.runInContext("startLesson('5-6',5)",context);for(const token of ['09:00','체육관','실내화'])assert.ok(elements.get('app').innerHTML.includes(token));
const source=fs.readFileSync('dist/hangeul.js','utf8');assert.ok(!source.includes("picture('village-message'"));
for(const asset of ['hero-sejong','writing-desk','school-sign','classroom-note','library-together','hangul-garden'])assert.ok(fs.existsSync(`dist/assets/${asset}.png`));
assert.ok(fs.existsSync('dist/vendor/qrcode.js'));assert.ok(fs.existsSync('dist/fonts.css'));
console.log(JSON.stringify({status:'passed',renderedScenes:scenes,renderedQuizQuestions:questions,worksheetFiles:6,composition:'한·글·너',inputEscaping:'passed',middleCheck:'X',highActivity:'4 essential facts retained',unverifiedVillageImage:'not referenced'},null,2));
