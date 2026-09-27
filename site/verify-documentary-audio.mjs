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
function click(action){const button={dataset:{action}};handlers.forEach(h=>h({target:{closest:()=>button}}));}
click('video-music');assert.equal(video.muted,false);assert.equal(prefs.get('documentary-music'),'on');
click('video-music');assert.equal(video.muted,true);assert.equal(prefs.get('documentary-music'),'off');
const old=video;fresh();sandbox.window.runHangeulMotion();await new Promise(r=>setImmediate(r));
assert.equal(old.paused,true);assert.equal(video.muted,true);assert.equal(video.paused,false);
const current=video;stage=null;sandbox.window.runHangeulMotion();assert.equal(current.paused,true);
console.log('Passed: blocked audible autoplay falls back to video with mute; music toggle/persistence; previous video stops on slide change.');
