// Focused behavior checks for shared selection paths and QR address validation.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const dist=new URL('./dist/',import.meta.url);
const storage=new Map(),nodes=new Map(),starts=[];
function element(){return {dataset:{},innerHTML:'',handlers:{},setAttribute(){},focus(){},showModal(){},close(){},remove(){nodes.delete(this.id)},querySelectorAll(){return []},addEventListener(type,fn){this.handlers[type]=fn}}}
const document={activeElement:null,body:{append(el){nodes.set(el.id,el)}},getElementById(id){return nodes.get(id)},createElement:element,addEventListener(){}};
const context=vm.createContext({document,URL,console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});context.window=context;
for(const name of ['lesson-library.js','activity-qr.js'])vm.runInContext(fs.readFileSync(new URL(name,dist),'utf8'),context);
const library=context.LessonLibrary;
for(const topic of ['hangeul','gaecheon']){
 const slides=[0,1,2,3].map(index=>({id:`${topic}-stable-${index}`,title:`Activity ${index}`,kind:'story'}));
 library.register(topic,{title:topic,pdf:topic,grades:{'3-4':{label:'3–4',slides}},start:(grade,index)=>starts.push([grade,index])});
 storage.set(`holiday-library:v1:${topic}:3-4`,JSON.stringify({ids:[slides[2].id,slides[0].id],last:slides[0].id}));
 library.open(topic,'3-4');
 function click(dataset){nodes.get('activity-library').handlers.click({target:{closest:()=>({dataset,disabled:false})}})}
 click({lib:'start'});
 assert.deepEqual(Array.from(library.path(topic,'3-4')),[2,0]);
 assert.equal(library.adjacent(topic,'3-4',2,1),0);
 assert.equal(library.adjacent(topic,'3-4',0,-1),2);
 assert.equal(library.adjacent(topic,'3-4',0,1),undefined);
 library.record(topic,'3-4',0);library.open(topic,'3-4');click({lib:'resume'});
 assert.equal(starts.at(-1)[1],0,'Resume restores last selected activity');
 library.open(topic,'3-4');click({up:slides[0].id});click({lib:'start'});
 assert.deepEqual(Array.from(library.path(topic,'3-4')),[0,2]);
 library.open(topic,'3-4');click({preview:slides[1].id});
 assert.deepEqual(Array.from(library.path(topic,'3-4')),[1]);library.record(topic,'3-4',1);
 assert.deepEqual(JSON.parse(storage.get(`holiday-library:v1:${topic}:3-4`)).ids,[slides[0].id,slides[2].id],'Preview must preserve saved teacher selection');
 library.clear(topic);assert.deepEqual(Array.from(library.path(topic,'3-4')),[0,1,2,3],'Legacy direct entry keeps full path');
}
const qr=context.ActivityQr;
for(const base of ['http://localhost:4198/','http://127.0.0.2/','http://[::1]/','http://app.localhost/','file:///classroom/','https://user:secret@example.com/','javascript:alert(1)'])assert.throws(()=>qr.targetUrl(base,'gaecheon.html','5-6',2),base);
assert.equal(qr.targetUrl('https://example.com/classroom/hangeul.html','gaecheon.html','5-6',2),'https://example.com/classroom/gaecheon.html#student/5-6/2');
assert.equal(qr.targetUrl('http://192.168.1.20:4198/','hangeul.html','3-4',5),'http://192.168.1.20:4198/hangeul.html#student/3-4/5');
context.esc=value=>String(value??'');context.tabHeading=(title,body)=>`${title} ${body}`;
context.state={grade:'5-6',activity:{drafts:{},classes:{}}};
for(const name of ['learning-resources.js','gaecheon-data.js','gaecheon-inquiry.js','hangeul-inquiry.js'])vm.runInContext(fs.readFileSync(new URL(name,dist),'utf8'),context);
assert.match(context.gaecheonInquiryBody('story'),/1949년/,'Independent student inquiry includes chronology');
assert.match(context.gaecheonInquiryBody('story'),/bronze-dagger-songgukri.jpg/);
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
assert.match(context.dolmenComparison(),/gochang-dolmen-steve46814.jpg/);
assert.match(context.dolmenComparison(),/CC BY-SA 3.0/);
assert.match(context.renderHangeulInquiry(context.hangeulInquiryBeats('5-6',2)[0]),/1946년/);
library.register('gaecheon',{title:'개천절',pdf:'gaecheon',grades:gaecheon.grades,start(){}});
for(const grade of ['1-2','3-4','5-6'])for(const module of library.modules('gaecheon',grade)){
 assert.ok(module.goal&&module.result&&module.feedback);
 for(const id of module.needs)assert.ok(gaecheon.grades[grade].slides.some(s=>s.id===id));
}
console.log('PASS renewal: both-topic selection/order/reverse/resume/preview/legacy paths; QR target and unsafe-address validation; grade-specific inquiry and chronology.');
