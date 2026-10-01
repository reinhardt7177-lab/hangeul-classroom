'use strict';
// Full grade-band lessons. Old selection storage is intentionally ignored.
// Metadata is retained; this module only opens the current grade's two PDFs.
window.LessonLibrary=(()=>{
 const configs={};
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const groups={cover:'이야기 알기',intro:'이야기 알기',story:'이야기 알기',history:'자료 탐구',source:'자료 탐구',reading:'자료 탐구',evidence:'자료 탐구',inquiry:'자료 탐구',law:'자료 탐구',timeline:'자료 탐구',observe:'자료 탐구',letters:'글자 실험',principle:'글자 실험',activity:'표현·창작',classwork:'토론·실천',value:'토론·실천',quiz:'배움 확인',assessment:'배움 확인',exit:'배움 확인',summary:'배움 확인'};
 groups.check='배움 확인';groups.outro='배움 확인';groups.video='자료 탐구';groups.youtube='자료 탐구';
 function modules(topic,grade){return configs[topic].grades[grade].slides.map((s,index)=>({id:s.id,index,title:s.title,question:s.question||s.body,category:groups[s.kind]||'이야기 알기',internet:!!s.youtube||s.kind==='video',...s.learning}))}
 function register(topic,config){configs[topic]=config;for(const [grade,g]of Object.entries(config.grades))g.slides.forEach((s,index)=>{
  if(!s.id)throw Error(`Missing stable activity id: ${topic}/${grade}/${index}`);
  const assessment=/quiz|assessment|check/.test(s.kind),practice=/activity|classwork/.test(s.kind);
  let needs=[];
  if(assessment)needs=topic==='hangeul'?g.slides.filter(x=>['story','principle','letters'].includes(x.kind)):g.slides.filter(x=>['timeline','reading','source','evidence'].includes(x.kind));
  if(s.kind==='inquiry')needs=g.slides.filter(x=>['timeline','reading'].includes(x.kind));
  s.learning={goal:assessment?'자료를 근거로 답과 이유를 설명한다':practice?'배운 뜻을 표현하고 다른 의견을 듣고 고친다':'자료에서 단서를 찾아 질문에 자기 말로 설명한다',result:s.result||(assessment?'답과 선택 이유':practice?'처음 표현과 질문 후 고친 결과물':'관찰한 점과 나의 설명'),feedback:assessment?'답뿐 아니라 자료에서 찾은 이유를 확인해요.':practice?'상대의 반응과 수정한 까닭을 함께 확인해요.':'직접 본 내용과 짐작한 내용을 나누어 말해요.',needs:needs.map(x=>x.id),sources:(s.links||[]).map(x=>x.url),...s.learning};
  if(s.kind==='sequence')Object.assign(s.learning,{goal:'네 사건을 순서대로 놓고 옛이야기로 말한다',result:'네 카드의 순서와 한 장면 설명',feedback:'“옛이야기 속에서는”을 붙여 사건을 설명해요.'});
  if(s.artifact)Object.assign(s.learning,{goal:'사진 관찰과 소장품 정보 및 확인 범위를 구별한다',result:'사진에서 본 것 / 설명에서 알게 된 것 / 확인할 수 없는 것',feedback:'재질·출토지는 사진이 아니라 소장품 설명에서 확인해요.',sources:[s.artifact.url]});
  const resources=window.LEARNING_RESOURCES;
  if(resources&&topic==='gaecheon'&&['sequence','story','reading'].includes(s.kind))s.learning.sources=[...new Set([...s.learning.sources,resources.samguk.url])];
  if(resources&&topic==='gaecheon'&&s.kind==='reading')Object.assign(s.learning,{goal:'원문에서 약속의 기간과 변화의 기간을 구별한다',result:'100일과 21일이 각각 가리키는 일',feedback:'숫자뿐 아니라 연결되는 구절과 사건을 함께 설명해요.'});
  if(resources&&topic==='hangeul'&&s.kind==='story')Object.assign(s.learning,{goal:'글자를 만든 목적을 자료의 구절과 연결한다',result:'누구의 어떤 어려움을 덜고자 했는지에 대한 설명',feedback:'기록에 적힌 내용과 오늘의 적용을 구별해요.',sources:[resources.hangeulDate.url,'https://sillok.history.go.kr/id/kda_12809029_004','https://kyudb.snu.ac.kr/book/view.do?book_cd=GG43224_00']});
 })}
 function path(topic,grade){return modules(topic,grade).map(m=>m.index)}
 function adjacent(topic,grade,index,delta){const order=path(topic,grade),position=order.indexOf(index);return order[position+delta]}
 // Compatibility hooks for existing renderers; never read or rewrite old selections.
 function record(){}
 function clear(){}
 function open(topic,grade){
  const config=configs[topic],g=config?.grades[grade];if(!g)return;
  const previous=document.activeElement;
  document.getElementById('lesson-resources')?.close();
  const dialog=document.createElement('dialog');dialog.id='lesson-resources';dialog.className='lesson-resources';dialog.setAttribute('aria-labelledby','lesson-resources-title');
  dialog.innerHTML=`<header class="resources-heading"><h2 id="lesson-resources-title">${esc(config.title)} · ${esc(g.label)} 학습자료</h2><button type="button" data-resource-close aria-label="학습자료 닫기">×</button></header><div class="resources-links"><a href="worksheets/${config.pdf}-${grade}-student.pdf" target="_blank" rel="noopener noreferrer">학생 학습지 PDF 열기 ↗</a><a href="worksheets/${config.pdf}-${grade}-teacher.pdf" target="_blank" rel="noopener noreferrer">교사 해설 PDF 열기 ↗</a></div>`;
  dialog.addEventListener('click',e=>{if(e.target.closest('[data-resource-close]'))dialog.close()});
  dialog.addEventListener('close',()=>{dialog.remove();if(previous?.isConnected)previous.focus({preventScroll:true})},{once:true});
  document.body.append(dialog);dialog.showModal();
 }
 return {register,modules,path,adjacent,record,clear,open};
})();
