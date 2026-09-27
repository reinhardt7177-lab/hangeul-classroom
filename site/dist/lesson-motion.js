'use strict';
let lastLessonMotion='',lessonAnimations=[],lastMotionStage=null,lastLessonVideo=null;
const lessonMotionDisabled=()=>storage.get('motion-mode')==='off';
window.documentaryMusicLabel=()=>storage.get('documentary-music')==='off'?'배경음악 켜기':'배경음악 끄기';
function syncMusicButton(video){
 const button=document.getElementById('video-music');
 if(!button)return;
 const audible=!video.muted;
 button.textContent=audible?'배경음악 끄기':'배경음악 켜기';
 button.setAttribute('aria-pressed',String(audible));
}
async function playLessonVideo(target){
 try{await target.video.play();}
 catch(error){
  if(error.name==='NotAllowedError'&&target.video.dataset.bgm==='true'&&!target.video.muted){
   target.video.muted=true;
   syncMusicButton(target.video);
   await target.video.play();
  }else throw error;
 }
}
window.motionToggleLabel=()=>lessonMotionDisabled()?'모션 켜기':'모션 끄기';
function motionTargets(){
 const stage=document.querySelector('.presentation-stage');
 if(stage){
  const video=stage.querySelector('.p-backdrop-video');
  if(video)return {kind:'video',stage,video};
  const equation=stage.querySelector('.p-equation.p-revealed .p-equation-result');
  if(equation&&equation.textContent.trim()!=='?')return {kind:'assemble',stage,result:equation,parts:[...stage.querySelectorAll('.p-equation-parts>span')]};
  const cards=[...stage.querySelectorAll('.p-cards.p-revealed .p-card,.p-compare.p-revealed .p-card')];
  if(cards.length)return {kind:'cards',stage,items:cards};
  const notice=stage.querySelector('.p-revealed .p-notice');
  if(notice)return {kind:'notice',stage,items:[notice]};
  const answer=stage.querySelector('.p-option.is-answer,.p-ox-answer');
  if(answer)return {kind:'answer',stage,items:[answer]};
 }
 const syllable=document.querySelector('.tablet-main .syllable');
 return syllable?{kind:'student-letter',stage:syllable.parentElement,items:[syllable]}:null;
}
function animateLessonElement(element,frames,timing){if(typeof element.animate==='function')lessonAnimations.push(element.animate(frames,{fill:'none',easing:'cubic-bezier(.2,.75,.2,1)',...timing}));}
window.runHangeulMotion=function(force=false){
 const target=motionTargets();
 if(lastLessonVideo&&lastLessonVideo!==target?.video)lastLessonVideo.pause();
 lastLessonVideo=target?.video||null;
 const replay=document.getElementById('motion-replay');
 const videoToggle=document.getElementById('video-toggle');
 if(videoToggle)videoToggle.hidden=!target||target.kind!=='video'||lessonMotionDisabled();
 if(replay)replay.hidden=!target;
 const key=[state.view,state.student,state.grade,state.index,state.presenterBeat||0,state.student?composed():''].join(':');
 if(!force&&key===lastLessonMotion&&target?.stage===lastMotionStage)return;
 lastLessonMotion=key;
 lastMotionStage=target?.stage||null;
 lessonAnimations.forEach(a=>a.cancel());lessonAnimations=[];
 if(!target)return;
 if(lessonMotionDisabled()){
  if(target.kind==='video')target.video.pause();
  target.stage.setAttribute('data-motion-state','reduced');
  if(replay){replay.textContent='모션 꺼짐';replay.title='수업 도구의 모션 설정과 기기의 동작 줄이기 설정을 확인해 주세요.';}
  return;
 }
 target.stage.setAttribute('data-motion-state','playing');
 if(replay){replay.textContent=target.kind==='video'?'영상 다시 보기':'모션 다시 보기';replay.title='현재 설명의 움직임을 다시 보여 줍니다.';}
 if(target.kind==='video'){
  target.video.style.display='';
  target.video.currentTime=0;
  if(target.video.dataset.bgm==='true'){
   target.video.muted=storage.get('documentary-music')==='off';
   target.video.volume=.8;
   syncMusicButton(target.video);
  }
  if(videoToggle)videoToggle.textContent='영상 잠시 멈춤';
  target.video.onended=()=>{target.stage.setAttribute('data-motion-state','complete');if(videoToggle)videoToggle.textContent='처음부터 보기'};
  const failed=()=>{target.video.style.display='none';target.stage.setAttribute('data-motion-state','fallback');if(videoToggle)videoToggle.hidden=true};
  target.video.onerror=failed;
  playLessonVideo(target).catch(failed);
  return;
 }
 if(target.kind==='assemble'){
  const r=target.result.getBoundingClientRect();
  target.parts.forEach((part,i)=>{
   const p=part.getBoundingClientRect(),dx=i===0?-r.width*.12:i===1?r.width*.12:0,dy=target.parts.length===3?(i===2?r.height*.2:-r.height*.12):0,x=(r.left+r.width/2+dx)-(p.left+p.width/2),y=(r.top+r.height/2+dy)-(p.top+p.height/2);
   animateLessonElement(part,[{transform:'translate(0,0)',opacity:1,offset:0},{transform:'translate(0,0)',opacity:1,offset:.35},{transform:`translate(${x}px,${y}px) scale(.7)`,opacity:0,offset:.85},{transform:'translate(0,0)',opacity:1,offset:1}],{duration:1700,delay:i*90});
  });
  animateLessonElement(target.result,[{opacity:0,transform:'scale(.7)',offset:0},{opacity:0,transform:'scale(.7)',offset:.55},{opacity:1,transform:'scale(1.08)',offset:.82},{opacity:1,transform:'scale(1)',offset:1}],{duration:2000});
 }else if(target.kind==='notice'){
  animateLessonElement(target.items[0],[{clipPath:'inset(0 100% 0 0)',opacity:.4},{clipPath:'inset(0 0 0 0)',opacity:1}],{duration:1100});
 }else{
  target.items.forEach((el,i)=>animateLessonElement(el,[{opacity:.2,transform:target.kind==='cards'?'translateY(24px)':'scale(.88)'},{opacity:1,transform:'none'}],{duration:650,delay:i*300}));
 }
 const finalAnimation=lessonAnimations[lessonAnimations.length-1];
 if(finalAnimation)finalAnimation.onfinish=()=>target.stage.setAttribute('data-motion-state','complete');
};
document.addEventListener('click',e=>{
 const action=e.target.closest('button')?.dataset.action;
 if(action==='motion-replay')window.runHangeulMotion(true);
 if(action==='documentary-notes')window.presentationDocumentaryNotes?.();
 if(action==='video-music'){
  const target=motionTargets();
  if(target?.kind!=='video'||target.video.dataset.bgm!=='true')return;
  target.video.muted=!target.video.muted;
  storage.set('documentary-music',target.video.muted?'off':'on');
  syncMusicButton(target.video);
 }
 if(action==='video-toggle'){
  const target=motionTargets();
  if(target?.kind!=='video')return;
  const button=e.target.closest('button');
  if(target.video.ended){window.runHangeulMotion(true);return;}
  if(target.video.paused){playLessonVideo(target).then(()=>{target.stage.setAttribute('data-motion-state','playing');button.textContent='영상 잠시 멈춤'}).catch(()=>{target.stage.setAttribute('data-motion-state','fallback');target.video.style.display='none';button.hidden=true});}
  else{target.video.pause();target.stage.setAttribute('data-motion-state','paused');button.textContent='이어서 보기';}
 }
 if(action==='motion-toggle'){
  const enable=lessonMotionDisabled();storage.set('motion-mode',enable?'on':'off');
  lessonAnimations.forEach(a=>a.cancel());lessonAnimations=[];
  e.target.closest('button').textContent=window.motionToggleLabel();
  window.runHangeulMotion(true);
 }
});
window.runHangeulMotion();
