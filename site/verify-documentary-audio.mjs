import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const prefs=new Map(),buttons=new Map(),handlers=[];
for(const id of ['motion-replay','video-toggle','video-music'])buttons.set(id,{textContent:'',hidden:false,setAttribute(k,v){this[k]=v}});
let video,stage;
function fresh(block=false){
 video={dataset:{bgm:'true'},muted:true,paused:true,currentTime:0,volume:0,style:{},calls:0,
  async play(){this.calls++;if(block&&!this.muted){const e=new Error('gesture required');e.name='NotAllowedError';throw e;}this.paused=false;},pause(){this.paused=true;}};
 stage={querySelector(s){return s==='.p-backdrop-video'?video:null},setAttribute(k,v){this[k]=v}};
}
fresh(true);
const sandbox={window:{},document:{querySelector(s){return s==='.presentation-stage'?stage:null},getElementById(id){return buttons.get(id)},addEventListener(_,fn){handlers.push(fn)}},storage:{get:k=>prefs.get(k),set:(k,v)=>prefs.set(k,v)},state:{view:'lesson',student:false,grade:'3-4',index:0,presenterBeat:0}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(new URL('./dist/lesson-motion.js',import.meta.url),'utf8'),sandbox);
await new Promise(r=>setImmediate(r));
assert.equal(video.calls,2);assert.equal(video.paused,false);assert.equal(video.muted,true);assert.equal(video.style.display,'');assert.equal(buttons.get('video-music').textContent,'배경음악 켜기');
function click(action){const button=buttons.get(action)||{};button.dataset={action};handlers.forEach(h=>h({target:{closest:()=>button}}));}
click('video-music');assert.equal(video.muted,false);assert.equal(prefs.get('documentary-music'),'on');
click('video-music');assert.equal(video.muted,true);assert.equal(prefs.get('documentary-music'),'off');
const old=video;fresh();sandbox.window.runHangeulMotion();await new Promise(r=>setImmediate(r));
assert.equal(old.paused,true);assert.equal(video.muted,true);assert.equal(video.paused,false);
const current=video;stage=null;sandbox.window.runHangeulMotion();assert.equal(current.paused,true);
console.log('Passed: blocked audible autoplay falls back to video with mute; music toggle/persistence; previous video stops on slide change.');

// A user's pause can reject a still-pending play() promise. That is not a media failure.
fresh();let rejectPending;
video.play=function(){this.calls++;this.paused=false;return new Promise((_resolve,reject)=>{rejectPending=reject})};
sandbox.window.runHangeulMotion(true);
click('video-toggle');
const aborted=Object.assign(new Error('play interrupted by pause'),{name:'AbortError'});
rejectPending(aborted);await new Promise(resolve=>setImmediate(resolve));
assert.equal(stage['data-motion-state'],'paused','Immediate pause must not enter fallback');
assert.notEqual(video.style.display,'none','Paused video remains visible');
click('video-toggle');click('video-toggle');
rejectPending(aborted);await new Promise(resolve=>setImmediate(resolve));
assert.equal(stage['data-motion-state'],'paused','Interrupted resume must not announce playback');
assert.equal(buttons.get('video-toggle').textContent,'이어서 보기');
fresh();video.play=async()=>{throw Object.assign(new Error('unsupported media'),{name:'NotSupportedError'})};
sandbox.window.runHangeulMotion(true);await new Promise(resolve=>setImmediate(resolve));
assert.equal(stage['data-motion-state'],'fallback','Real media failures still use the poster fallback');
assert.equal(video.style.display,'none');
console.log('Passed: immediate pause and interrupted resume stay paused; genuine media error retains fallback.');
