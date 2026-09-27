'use strict';
const tabletStages=[{index:3,label:'글자 탐험',kind:'letters'},{index:5,label:'만들기 활동',kind:'activity'},{index:8,label:'나의 골든벨',kind:'assessment'}];
window.moveTablet=function(delta){if(state.index===9&&delta<0){state.index=8;enterSlide();renderLesson();return;}const i=tabletStages.findIndex(s=>s.index===state.index);state.index=delta>0?(tabletStages[i+1]?.index??9):(tabletStages[Math.max(0,i-1)]?.index??8);enterSlide();renderLesson();};
window.renderTablet=function(){
 document.body.classList.remove('presentation-mode');document.body.classList.add('tablet-mode');
 if(![3,5,8,9].includes(state.index)){state.index=3;enterSlide();}const stage=tabletStages.find(s=>s.index===state.index);
 app.innerHTML=`<header class="tablet-header"><span class="brand-icon">ㅎ</span><div><b>나의 한글 탐험</b><small>${getGrade().label} · 태블릿 학생 활동</small></div><span class="tablet-personal">내 기기에서 활동해요</span></header><nav class="tablet-tabs" aria-label="학생 활동 선택">${tabletStages.map((s,i)=>`<button data-action="tablet-stage" data-tablet-stage="${s.index}" ${state.index===s.index?'aria-current="page"':''}>${i+1}. ${s.label}</button>`).join('')}</nav><main id="main" class="tablet-main"><div class="tablet-heading"><span class="mini-label">선생님의 안내에 맞춰 참여해요</span><h1 id="slide-title" tabindex="-1">${esc(stage?getGrade().slides[state.index].title:'오늘의 활동을 마쳤어요!')}</h1><p>${esc(stage?getGrade().slides[state.index].body:'태블릿의 활동 결과를 선생님이나 짝에게 보여 주세요.')}</p></div>${stage?renderScene(stage.kind):'<div class="tablet-complete"><span>✓</span><h2>내 생각을 표현한 나, 잘했어요!</h2><p>위의 활동을 눌러 만든 내용을 다시 볼 수 있어요.</p></div>'}<p class="tablet-footnote">작성한 내용은 이 화면에서만 사용해요. 선생님에게 자동으로 전송되지 않아요. 페이지를 닫기 전에 완성한 화면을 보여 주세요.</p></main>`;window.runHangeulMotion?.();
};
let classroomQrRequest=0;
const isLoopback=host=>['localhost','127.0.0.1','0.0.0.0','[::1]','::1'].includes(host.toLowerCase());
window.openClassroomQr=async function(){
 const request=++classroomQrRequest;
 const suggested=storage.get('share-base')||location.href.split('#')[0];
 const target=tabletStages.some(s=>s.index===state.index)?state.index:5;
 modal(`${getGrade().label} · 태블릿으로 참여하기`,`<div class="classroom-qr-grid"><div><p class="modal-lead">태블릿 카메라로 QR을 비춰 주세요.</p><div id="qr-result" class="qr-result classroom-code"><p>접속 주소를 확인하고 있어요.</p></div></div><div class="classroom-qr-setup"><label for="tablet-target">열어 줄 학생 활동</label><select id="tablet-target">${tabletStages.map(s=>`<option value="${s.index}" ${s.index===target?'selected':''}>${s.label}</option>`).join('')}</select><label for="share-base">태블릿에서 접속할 수업 주소</label><input id="share-base" type="url" value="${esc(suggested)}" placeholder="http://교사컴퓨터주소:4198/"><div id="classroom-addresses"></div><button class="btn orange" data-action="classroom-qr-build">이 활동 QR 만들기</button><p id="classroom-connection" role="status" class="feedback">전자칠판 컴퓨터와 태블릿을 같은 교실 와이파이에 연결해 주세요.</p><ol class="classroom-steps"><li>태블릿 카메라로 QR 스캔</li><li>표시된 주소 열기</li><li>내 태블릿에서 활동하기</li></ol><p class="note">교사 화면과 학생 화면은 독립적으로 움직입니다. 실시간 응답 집계는 제공하지 않습니다.</p></div></div>`,true);
 const input=document.getElementById('share-base');
 try{
  const u=new URL(input.value);
  if(isLoopback(u.hostname)){
   const response=await fetch('/classroom-addresses',{cache:'no-store'});
   if(!response.ok)throw Error('address unavailable');
   const info=await response.json();
   if(request!==classroomQrRequest||!document.getElementById('share-base'))return;
   const addresses=(info.addresses||[]).filter(a=>{try{return new URL(a.url).protocol==='http:'}catch{return false}});
   if(addresses.length){input.value=addresses[0].url;document.getElementById('classroom-addresses').innerHTML=addresses.length>1?`<label for="network-choice">교실 네트워크 주소 선택</label><select id="network-choice"><option value="">직접 입력</option>${addresses.map((a,i)=>`<option value="${esc(a.url)}" ${i===0?'selected':''}>${esc(a.name)} · ${esc(a.url)}</option>`).join('')}</select>`:'';}
  }
 }catch{/* File bundles and hosted sites can use a manually supplied address. */}
 if(request===classroomQrRequest&&document.getElementById('share-base'))window.buildClassroomQr();
};
window.buildClassroomQr=function(){
 const status=document.getElementById('classroom-connection'),result=document.getElementById('qr-result');
 try{
  const url=new URL(document.getElementById('share-base').value.trim());
  if(!['http:','https:'].includes(url.protocol)||isLoopback(url.hostname))throw Error('학생 기기에서 접속할 주소가 필요해요. localhost나 파일 주소로는 다른 태블릿이 접속할 수 없어요.');
  const target=Number(document.getElementById('tablet-target').value);
  if(!tabletStages.some(s=>s.index===target))throw Error('학생 활동을 선택해 주세요.');
  url.hash=`student/${state.grade}/${target}`;
  storage.set('share-base',url.href.split('#')[0]);makeQr(url.href,true);
  const local=/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname);
  status.textContent=local?'QR을 준비했어요. 같은 교실 와이파이에서 태블릿 한 대로 먼저 접속해 보세요.':'공개 수업 QR을 준비했어요. 인터넷에 연결된 태블릿으로 접속하세요. 같은 와이파이가 아니어도 참여할 수 있어요.';
 }catch(error){result.innerHTML='<p class="qr-unavailable">접속 가능한 주소를 입력하면<br>학생용 QR이 표시됩니다.</p>';status.textContent=error.message==='Invalid URL'?'http:// 또는 https://로 시작하는 수업 주소를 입력해 주세요.':error.message;}
};
window.handleTabletAction=function(el){
 if(el.dataset.action==='tablet-stage'&&state.student){const index=Number(el.dataset.tabletStage);if(tabletStages.some(s=>s.index===index)){state.index=index;enterSlide();renderLesson();document.getElementById('slide-title')?.focus({preventScroll:true});}return true;}
 if(el.dataset.action==='classroom-qr-build'){window.buildClassroomQr();return true;}
 return false;
};
document.addEventListener('change',e=>{if(e.target.id==='network-choice'&&e.target.value){document.getElementById('share-base').value=e.target.value;window.buildClassroomQr();}if(e.target.id==='tablet-target')window.buildClassroomQr();});
if(state.view==='lesson'&&state.student)renderLesson();
