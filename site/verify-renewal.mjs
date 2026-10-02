// Full lesson paths, two-PDF resources, click feedback and QR address validation.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const dist=new URL('./dist/',import.meta.url);
const storage=new Map(),nodes=new Map();let reads=0,writes=0,focusRestored=0;
function element(){return {dataset:{},innerHTML:'',handlers:{},setAttribute(){},focus(){},showModal(){this.open=true},close(){this.open=false;this.handlers.close?.()},remove(){nodes.delete(this.id)},querySelectorAll(){return []},addEventListener(type,fn){this.handlers[type]=fn}}}
const previous={isConnected:true,focus(){focusRestored++}};
const document={activeElement:previous,body:{append(el){nodes.set(el.id,el)}},getElementById(id){return nodes.get(id)},createElement:element,addEventListener(){}};
const context=vm.createContext({document,URL,console,localStorage:{getItem:k=>{reads++;return storage.get(k)||null},setItem:(k,v)=>{writes++;storage.set(k,v)}}});context.window=context;
for(const name of ['lesson-library.js','activity-qr.js'])vm.runInContext(fs.readFileSync(new URL(name,dist),'utf8'),context);
const library=context.LessonLibrary;
for(const topic of ['hangeul','gaecheon']){
 const slides=[0,1,2,3].map(index=>({id:`${topic}-stable-${index}`,title:`Activity ${index}`,kind:'story'}));
 const pdf=topic==='hangeul'?'hangul':'gaecheon';
 library.register(topic,{title:topic,pdf,grades:{'3-4':{label:'3–4학년',slides}}});
 const key=`holiday-library:v1:${topic}:3-4`,old=JSON.stringify({ids:[slides[2].id,slides[0].id],last:slides[0].id});storage.set(key,old);
 assert.deepEqual(Array.from(library.path(topic,'3-4')),[0,1,2,3],'Stored selections cannot filter or reorder lessons');
 for(let i=0;i<4;i++){assert.equal(library.adjacent(topic,'3-4',i,1),i<3?i+1:undefined);assert.equal(library.adjacent(topic,'3-4',i,-1),i?i-1:undefined)}
 library.record(topic,'3-4',2);library.clear(topic);library.open(topic,'3-4');
 const dialog=nodes.get('lesson-resources');
 assert.equal((dialog.innerHTML.match(/<a /g)||[]).length,2,'Exactly student worksheet and teacher explanation');
 assert.match(dialog.innerHTML,new RegExp(`worksheets/${pdf}-3-4-student\\.pdf`));
 assert.match(dialog.innerHTML,new RegExp(`worksheets/${pdf}-3-4-teacher\\.pdf`));
 assert.doesNotMatch(dialog.innerHTML,/checkbox|data-module|data-lib|data-filter|선택한 활동|수업 시작/);
 assert.match(dialog.innerHTML,/target="_blank" rel="noopener noreferrer"/);
 dialog.close();assert.equal(nodes.has('lesson-resources'),false);assert.equal(storage.get(key),old,'Other saved preferences are not deleted or rewritten');
}
assert.equal(reads,0,'Old selection storage is never read');assert.equal(writes,0,'Resource window never changes selection or response storage');assert.equal(focusRestored,2);
const qr=context.ActivityQr;
for(const base of ['http://localhost:4198/','http://127.0.0.2/','http://[::1]/','http://app.localhost/','file:///classroom/','https://user:secret@example.com/','javascript:alert(1)'])assert.throws(()=>qr.targetUrl(base,'gaecheon.html','5-6',2),base);
assert.equal(qr.targetUrl('https://example.com/classroom/hangeul.html','gaecheon.html','5-6',2),'https://example.com/classroom/gaecheon.html#student/5-6/2');
assert.equal(qr.targetUrl('http://192.168.1.20:4198/','hangeul.html','3-4',5),'http://192.168.1.20:4198/hangeul.html#student/3-4/5');
context.esc=value=>String(value??'');context.tabHeading=(title,body)=>`${title} ${body}`;
context.state={grade:'5-6',activity:{drafts:{},classes:{}}};
for(const name of ['learning-resources.js','gaecheon-data.js','gaecheon-inquiry.js','hangeul-inquiry.js'])vm.runInContext(fs.readFileSync(new URL(name,dist),'utf8'),context);
assert.match(context.gaecheonInquiryBody('story'),/1949년/,'Independent student inquiry includes chronology');
assert.match(context.gaecheonInquiryBody('story'),/bronze-dagger-songgukri.webp/);
assert.match(context.gaecheonInquiryBody('act'),/역할의 구체성/);
context.state.grade='3-4';assert.match(context.gaecheonInquiryBody('story'),/두 자료가 알려 주는/);
assert.doesNotMatch(context.gaecheonInquiryBody('story'),/gc-claim/);
context.state.grade='1-2';assert.equal(context.gaecheonInquiryBody('story'),null,'Young grade retains original story sequencing');
assert.equal(context.hangeulInquiryBeats('3-4',3).length,4);
assert.equal(context.hangeulInquiryBeats('5-6',2).length,3);
assert.equal(context.hangeulInquiryBeats('1-2',2).length,0);
const resource=context.LEARNING_RESOURCES,gaecheon=context.GAECHEON_DATA;
assert.equal(resource.story.cards.length,4);
assert.deepEqual(Array.from(gaecheon.storyOrder),[2,0,3,1]);
const sequence=gaecheon.grades['1-2'].slides.find(s=>s.kind==='sequence');
assert.match(sequence.question,/네 그림/);
assert.deepEqual(Array.from(sequence.sequence,c=>c.image),Array.from(resource.story.cards,c=>c.image));
const reading=gaecheon.grades['5-6'].slides.find(s=>s.kind==='reading');
assert.match(reading.question,/100일/);assert.match(reading.question,/21일/);
assert.equal(reading.cards[0].text,resource.samguk.quotes[0].original);
assert.equal(reading.cards[1].text,resource.samguk.quotes[1].original);
assert.match(context.dolmenComparison(),/gochang-dolmen-steve46814.webp/);
assert.match(context.dolmenComparison(),/CC BY-SA 3.0/);
assert.match(context.renderHangeulInquiry(context.hangeulInquiryBeats('5-6',2)[0]),/1946년/);
library.register('gaecheon',{title:'개천절',pdf:'gaecheon',grades:gaecheon.grades,start(){}});
for(const grade of ['1-2','3-4','5-6'])for(const module of library.modules('gaecheon',grade)){
 assert.ok(module.goal&&module.result&&module.feedback);
 for(const id of module.needs)assert.ok(gaecheon.grades[grade].slides.some(s=>s.id===id));
}
const gaeSource=fs.readFileSync(new URL('gaecheon.js',dist),'utf8');
const microFragment=gaeSource.slice(gaeSource.indexOf('const microPrompts='),gaeSource.indexOf('// Richer scenes:'));
const buttons=[0,1].map(i=>({dataset:{micro:String(i)},attrs:{},classes:new Set(),classList:{toggle(name,on){on?buttons[i].classes.add(name):buttons[i].classes.delete(name)}},setAttribute(name,value){this.attrs[name]=value}}));
const feedback={innerHTML:'',hidden:true},microRoot={querySelectorAll(){return buttons},querySelector(){return feedback}};
const microCtx=vm.createContext({state:{view:'lesson',grade:'3-4',index:0,beat:0,microSelected:null},D:{grades:{'3-4':{slides:[{kind:'source'}]}}},app:{querySelector(){return microRoot}},esc:value=>String(value??'')});
vm.runInContext(microFragment,microCtx);
assert.match(vm.runInContext('microActivity({kind:"source"})',microCtx),/aria-live="polite" hidden/);
vm.runInContext('selectMicro(0)',microCtx);assert.equal(feedback.hidden,false);assert.match(feedback.innerHTML,/잘 찾았어요/);assert.match(feedback.innerHTML,/고려 시대/);assert.equal(buttons[0].attrs['aria-pressed'],'true');assert.ok(buttons[0].classes.has('right'));
vm.runInContext('selectMicro(1)',microCtx);assert.match(feedback.innerHTML,/다시 살펴봐요/);assert.ok(buttons[1].classes.has('wrong'));assert.equal(buttons[0].attrs['aria-pressed'],'false');assert.equal(microCtx.state.beat,0,'Click does not reveal whole slide or advance');assert.equal(microCtx.state.index,0);
vm.runInContext('selectMicro(0)',microCtx);assert.match(feedback.innerHTML,/잘 찾았어요/);
vm.runInContext('selectMicro(999)',microCtx);assert.equal(microCtx.state.microSelected,0,'Invalid selection ignored');
assert.match(vm.runInContext('state.microSelected=1;microFeedback({kind:"source"})',microCtx),/고조선 당시 사람이 바로 남긴 기록은 아니에요/);
for(const kind of ['observe','source','evidence','inquiry','value']){
 microCtx.D.grades['3-4'].slides[0]={kind};microCtx.state.microSelected=null;
 assert.match(vm.runInContext(`microActivity({kind:"${kind}"})`,microCtx),/aria-live="polite" hidden/);
 const correct=vm.runInContext(`microPrompts.${kind}.correct`,microCtx);
 vm.runInContext(`selectMicro(${1-correct})`,microCtx);assert.match(feedback.innerHTML,/다시 살펴봐요/);
 vm.runInContext(`selectMicro(${correct})`,microCtx);assert.match(feedback.innerHTML,/잘 찾았어요/);
 assert.equal(microCtx.state.beat,0);assert.equal(microCtx.state.index,0);
 microCtx.state.beat=1;vm.runInContext(`selectMicro(${1-correct})`,microCtx);assert.equal(microCtx.state.microSelected,correct,'Whole reveal locks choice until teacher goes back');microCtx.state.beat=0;
}
assert.ok(gaeSource.includes('href="#lesson/${id}/0"'),'Grade cards directly open first scene');
assert.doesNotMatch(gaeSource,/state\.view='home';home\(\);window\.LessonLibrary\?\.open\('gaecheon',choice/);
const hangeulSource=fs.readFileSync(new URL('hangeul.js',dist),'utf8');
assert.ok(hangeulSource.includes('function setupGrade(id){startLesson(id)}'));
assert.doesNotMatch(gaeSource,/>활동 선택<|>선택한 자료</);
assert.doesNotMatch(hangeulSource,/btn\('목차','contents'/);
// Run the complete Gaecheon renderer and navigation, not only the shared path helper.
const rendered={innerHTML:'',querySelector(){return null}},navModal={open:false,close(){this.open=false}};
const navLocation={hash:''};
const navCtx=vm.createContext({console,URL,location:navLocation,history:{replaceState(_a,_b,hash){navLocation.hash=hash}},document:{body:{className:''},querySelector(selector){return selector==='#app'?rendered:selector==='#modal'?navModal:null},querySelectorAll(){return []},addEventListener(){}},addEventListener(){},localStorage:{getItem(){throw Error('Must not read old activity selection')},setItem(){throw Error('Must not save selection')}}});navCtx.window=navCtx;
for(const name of ['learning-resources.js','gaecheon-data.js','lesson-library.js','gaecheon.js','gaecheon-inquiry.js'])vm.runInContext(fs.readFileSync(new URL(name,dist),'utf8'),navCtx);
let sceneCount=0;
for(const grade of ['1-2','3-4','5-6']){
 navLocation.hash=`#choose/${grade}`;vm.runInContext('route()',navCtx);
 assert.equal(navLocation.hash,`#lesson/${grade}/0`,'Legacy choose link directly starts full lesson');
 const count=navCtx.GAECHEON_DATA.grades[grade].slides.length;sceneCount+=count;
 for(let index=0;index<count;index++){
  assert.equal(vm.runInContext('state.index',navCtx),index);assert.equal(vm.runInContext('state.beat',navCtx),0);
  assert.match(rendered.innerHTML,/전체 장면/);assert.ok(rendered.innerHTML.includes(`${index+1} / ${count}`));
  for(const [,asset] of rendered.innerHTML.matchAll(/(?:src|poster)="assets\/([^"?]+)"/g)){
   assert.ok(asset.endsWith('.webp')&&!asset.includes('.webp.webp'),`Invalid rendered image: ${asset}`);
   assert.ok(fs.existsSync(new URL('assets/'+asset,dist)),`Missing rendered image: ${asset}`);
  }
  vm.runInContext('next()',navCtx);assert.equal(vm.runInContext('state.beat',navCtx),1);
  if(index<count-1)vm.runInContext('next()',navCtx);
 }
 for(let index=count-1;index>=0;index--){
  vm.runInContext('prev()',navCtx);assert.equal(vm.runInContext('state.beat',navCtx),0);assert.equal(vm.runInContext('state.index',navCtx),index);
  if(index)vm.runInContext('prev(); next()',navCtx);
 }
 navLocation.hash=`#lesson/${grade}/${count-1}`;vm.runInContext('route(); next(); next(); route()',navCtx);assert.equal(vm.runInContext('state.view',navCtx),'home');
}
assert.equal(sceneCount,49);console.log(`PASS Gaecheon navigation: ${sceneCount} full scenes, reveal steps, reverse traversal, legacy routes and final home.`);
console.log('PASS renewal: full lesson paths ignore old selections; current-grade two-PDF dialog and focus restoration; immediate right/wrong/reselect micro feedback; QR validation; all inquiry and source content retained.');
