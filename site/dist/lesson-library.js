'use strict';
// Independent teacher paths. Legacy numbered URLs remain valid; only an explicit
// library start activates a selected path. No student responses enter storage.
window.LessonLibrary=(()=>{
 const configs={},active={},key=(topic,grade)=>`holiday-library:v1:${topic}:${grade}`;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(topic,grade)=>{try{return JSON.parse(localStorage.getItem(key(topic,grade))||'null')}catch{return null}};
 const save=(topic,grade,value)=>{try{localStorage.setItem(key(topic,grade),JSON.stringify(value))}catch{}};
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
 function path(topic,grade){return active[topic]?.grade===grade?active[topic].ids.map(id=>modules(topic,grade).find(m=>m.id===id)?.index).filter(Number.isInteger):modules(topic,grade).map(m=>m.index)}
 function adjacent(topic,grade,index,delta){const order=path(topic,grade),position=order.indexOf(index);return order[position+delta]}
 function record(topic,grade,index){if(active[topic]?.grade!==grade)return;const value=read(topic,grade)||{};save(topic,grade,{...value,ids:value.ids||active[topic].ids,last:configs[topic].grades[grade].slides[index].id})}
 function clear(topic){delete active[topic]}
 function open(topic,grade){
  const config=configs[topic],g=config.grades[grade],items=modules(topic,grade),stored=read(topic,grade);
  const valid=ids=>(ids||[]).filter((id,i,all)=>items.some(m=>m.id===id)&&all.indexOf(id)===i);
  let selected=valid(stored?.ids);if(!stored)selected=items.map(m=>m.id);
  let filter='전체';const previous=document.activeElement;
  let dialog=document.getElementById('activity-library');if(dialog)dialog.remove();
  dialog=document.createElement('dialog');dialog.id='activity-library';dialog.className='activity-library';dialog.setAttribute('aria-labelledby','library-title');document.body.append(dialog);
  const close=()=>{dialog.close();dialog.remove();if(previous?.isConnected)previous.focus()};
  function render(focus){
   const chosen=selected.map(id=>items.find(m=>m.id===id)),categories=['전체',...new Set(items.map(m=>m.category))];
   dialog.innerHTML=`<header class="library-heading"><div><span>${esc(config.title)} · ${esc(g.label)}</span><h2 id="library-title">우리 반의 탐구를 골라요</h2></div><button data-lib="close" aria-label="활동 선택 닫기">×</button></header><p class="library-lead">자료와 활동을 필요한 만큼 골라 연결하세요. 모든 활동을 끝낼 필요는 없어요.</p><ul class="library-objectives">${(g.objectives||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="library-toolbar"><button data-lib="all">모두 선택</button><button data-lib="none">선택 비우기</button><a href="worksheets/${config.pdf}-${grade}-student.pdf" target="_blank" rel="noopener">학생 학습지 ↗</a><a href="worksheets/${config.pdf}-${grade}-teacher.pdf" target="_blank" rel="noopener">교사 해설 ↗</a></div><nav class="library-filters" aria-label="활동 종류">${categories.map(c=>`<button data-filter="${esc(c)}" aria-pressed="${filter===c}">${esc(c)}</button>`).join('')}</nav><div class="library-layout"><section class="library-cards" aria-label="선택할 자료와 활동">${items.filter(m=>filter==='전체'||m.category===filter).map(m=>`<article class="library-card ${selected.includes(m.id)?'is-selected':''}"><span class="library-category">${esc(m.category)}${m.internet?' · 인터넷 필요':''}</span><label><input type="checkbox" data-module="${esc(m.id)}" ${selected.includes(m.id)?'checked':''}><strong>${esc(m.title)}</strong></label><p>${esc(m.question)}</p><small>목표 · ${esc(m.goal)}</small><small>남길 것 · ${esc(m.result)}</small><small>확인 · ${esc(m.feedback)}</small>${m.needs.length?`<div class="library-needs"><span>먼저 보면 좋은 자료</span>${m.needs.map(id=>items.find(x=>x.id===id)).filter(Boolean).map(n=>`<button data-preview="${esc(n.id)}">${esc(n.title)} ↗</button>`).join('')}</div>`:''}<button data-preview="${esc(m.id)}">이 자료만 열기 ↗</button></article>`).join('')}</section><aside class="library-selection"><h3>선택한 활동 ${selected.length}개</h3><p>순서를 바꿀 수 있어요. 자료를 먼저 살펴보고 자기 생각을 나누세요.</p><ol>${chosen.map((m,i)=>`<li><span>${esc(m.title)}</span><div><button data-up="${esc(m.id)}" ${i===0?'disabled':''} aria-label="${esc(m.title)} 위로">↑</button><button data-down="${esc(m.id)}" ${i===chosen.length-1?'disabled':''} aria-label="${esc(m.title)} 아래로">↓</button><button data-remove="${esc(m.id)}" aria-label="${esc(m.title)} 선택 해제">×</button></div></li>`).join('')}</ol><p class="library-privacy">선택 목록과 교사의 마지막 위치만 이 브라우저에 저장합니다. 학생 이름·응답은 저장하지 않습니다.</p></aside></div><footer class="library-footer"><span role="status">${selected.length?`${selected.length}개 활동을 선택했어요.`:'활동을 하나 이상 골라 주세요.'}</span><div><button data-lib="resume" ${!selected.includes(stored?.last)?'disabled':''}>이어서 보기</button><button class="library-start" data-lib="start" ${!selected.length?'disabled':''}>선택한 활동 시작 →</button></div></footer>`;
   if(focus){const el=[...dialog.querySelectorAll('button,input')].find(e=>e.dataset.module===focus||e.dataset.up===focus||e.dataset.down===focus||e.dataset.filter===focus||e.dataset.lib===focus);el?.focus({preventScroll:true})}
  }
  function launch(ids,index){active[topic]={grade,ids:[...ids]};save(topic,grade,{ids:[...selected],last:items[index].id});close();config.start(grade,index)}
  dialog.addEventListener('change',e=>{if(!e.target.dataset.module)return;const id=e.target.dataset.module;selected=e.target.checked?[...selected,id]:selected.filter(x=>x!==id);save(topic,grade,{ids:selected,last:stored?.last});render(id)});
  dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
   if(b.dataset.filter){filter=b.dataset.filter;render(filter);return}
   if(b.dataset.preview){const m=items.find(x=>x.id===b.dataset.preview);launch([m.id],m.index);return}
   const id=b.dataset.up||b.dataset.down||b.dataset.remove;
   if(id){const i=selected.indexOf(id);if(b.dataset.remove)selected.splice(i,1);else{const j=i+(b.dataset.up?-1:1);[selected[i],selected[j]]=[selected[j],selected[i]]}save(topic,grade,{ids:selected,last:stored?.last});render(id);return}
   switch(b.dataset.lib){case'close':close();break;case'all':selected=items.map(m=>m.id);save(topic,grade,{ids:selected,last:stored?.last});render('all');break;case'none':selected=[];save(topic,grade,{ids:selected,last:stored?.last});render('none');break;case'start':case'resume':{const id=b.dataset.lib==='resume'&&selected.includes(stored?.last)?stored.last:selected[0];launch(selected,items.find(x=>x.id===id).index);break}}
  });
  dialog.addEventListener('cancel',e=>{e.preventDefault();close()});render();dialog.showModal();
 }
 return {register,modules,path,adjacent,record,clear,open};
})();
