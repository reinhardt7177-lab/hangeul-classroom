'use strict';

// Teacher presentation uses an ordered sequence. Student activities keep their own UI.
const presentationChapters=['생각 열기','오늘의 미션','세종의 이야기','원리 탐험','그림으로 생각하기','함께하는 활동','잠깐 확인','배움 정리','한글 골든벨','마음에 담기'];
const presentationCaptions={
 'hero-sejong':'세종을 상상한 교육용 삽화 · 1443년 창제 현장이나 실제 초상은 아님',
 'writing-desk':'전통 쓰기 도구를 표현한 교육용 정물',
 'school-sign':'현대 한국 학교를 상상한 교육용 삽화',
 'classroom-note':'현대 한국 교실을 상상한 교육용 삽화',
 'library-together':'현대 한국 학교 도서관을 상상한 교육용 삽화',
 'hangul-garden':'한글 배움을 상징한 창작 정물'
};
window.presentationBeats=function(grade,index){
 if(index<0||index>=data.grades[grade].slides.length)return [];
 if(index!==8){
  const beats=window.HANGEUL_PRESENTATION?.grades[grade]?.[index]||[{type:'image',title:data.grades[grade].slides[index].title,subtitle:data.grades[grade].slides[index].body,image:'writing-desk',cue:'그림을 보고 생각을 나누어 보세요.'}];
  return index===0?[{type:'documentary',title:'한글이 태어난 까닭',kicker:'60초 이야기',cue:grade==='1-2'?'60초 영상이에요. 배경음악을 켜거나 끌 수 있어요. 세종은 누구를 생각하며 새 글자를 만들었을까요?':'60초 영상이에요. 배경음악을 켜거나 끌 수 있어요. 창제·해례본 간행·용비어천가 간행의 순서와 창제 목적을 살펴보세요.'},...beats,...(window.hangeulInquiryBeats?.(grade,index)||[])]:[...beats,...(window.hangeulInquiryBeats?.(grade,index)||[])];
 }
 const questions=data.grades[grade].quiz;
 return [
  {type:'image',image:'hangul-garden',kicker:'모두 함께 도전',title:'도전, 한글 골든벨!',subtitle:`${questions.length}가지 질문을 함께 풀어요. 틀려도 다시 생각하면 괜찮아요.`,cue:'종이나 손가락으로 답을 보여 주세요. 탈락 없이 모두 끝까지 참여해요.'},
  ...questions.flatMap((q,i)=>[
   {type:'quiz',question:q,number:i+1,title:q.question,reveal:false,kicker:`문제 ${i+1} / ${questions.length}`,cue:q.type==='open'?'짝에게 내 생각과 그 까닭을 말해 주세요.': '답을 생각한 뒤 손이나 종이로 보여 주세요. 왜 골랐는지도 들어 볼까요?'},
   {type:'quiz',question:q,number:i+1,title:q.question,reveal:true,kicker:q.type==='open'?'예시와 기준':'정답과 이유',cue:q.type==='open'?'표현이 달라도 뜻과 까닭이 타당하면 좋은 답이에요.':'내 생각과 비교해 보세요. 틀렸다면 이유를 듣고 다시 답해 보세요.'}
  ]),
  {type:'finish',kicker:'모두의 골든벨',title:'끝까지 함께한 우리, 잘했어요!',subtitle:'새롭게 알게 된 것 한 가지를 옆 친구에게 들려주세요.',image:'library-together',cue:'맞힌 개수보다 생각하고 설명한 과정을 칭찬해 주세요.'}
 ];
};

function presentationPosition(){
 const order=window.LessonLibrary?.path('hangeul',state.grade)||getGrade().slides.map((_,i)=>i);
 const lengths=order.map(i=>window.presentationBeats(state.grade,i).length),position=order.indexOf(state.index);
 return {total:lengths.reduce((a,b)=>a+b,0),current:lengths.slice(0,Math.max(0,position)).reduce((a,b)=>a+b,0)+(state.presenterBeat||0)+1};
}

window.movePresentation=function(delta){
 stopClock();
 const beats=window.presentationBeats(state.grade,state.index);
 const beat=state.presenterBeat||0;
 if(delta>0){
  if(beat<beats.length-1)state.presenterBeat=beat+1;
  else if((window.LessonLibrary?.adjacent('hangeul',state.grade,state.index,1)??(window.LessonLibrary?undefined:state.index+1))!==undefined&&(!window.LessonLibrary?state.index<getGrade().slides.length-1:true)){state.index=window.LessonLibrary?window.LessonLibrary.adjacent('hangeul',state.grade,state.index,1):state.index+1;enterSlide();}
  else {stopClock();closeModal();state.view='home';history.replaceState(null,'','#home');home();return;}
 }else if(delta<0){
  if(beat>0)state.presenterBeat=beat-1;
  else {const previous=window.LessonLibrary?window.LessonLibrary.adjacent('hangeul',state.grade,state.index,-1):state.index-1;if(previous===undefined||previous<0)return;state.index=previous;enterSlide();state.presenterBeat=window.presentationBeats(state.grade,state.index).length-1;}
 }
 closeModal(false);
 const currentBeat=window.presentationBeats(state.grade,state.index)[state.presenterBeat||0];
 window.LessonLibrary?.record('hangeul',state.grade,state.index);
 renderLesson();
 document.getElementById('slide-title')?.focus({preventScroll:true});
};

function presentationCards(cards){
 return `<div class="p-cards-grid">${(cards||[]).map((card,i)=>`<article class="p-card"><span class="p-card-number">${String(i+1).padStart(2,'0')}</span><h2>${esc(card.title)}</h2>${card.text?`<p>${esc(card.text)}</p>`:''}</article>`).join('')}</div>`;
}

function presentationVisual(beat){
 if(beat.type==='equation')return `<div class="p-equation-parts">${(beat.equation?.parts||[]).map((part,i)=>`${i?'<b>+</b>':''}<span>${esc(part)}</span>`).join('')}</div><div class="p-equation-result ${beat.reveal?'is-revealed':''}">${esc(beat.equation?.result||'?')}</div>`;
 if(beat.type==='ox')return beat.reveal?`<div class="p-ox-answer">${esc(beat.title.match(/^[OX]/)?.[0]||'✓')}</div>`:'<div class="p-ox-choices"><span>O</span><span>X</span></div>';
 if(beat.cards)return presentationCards(beat.cards);
 if(beat.notice&&!/그림|삽화|사진|실제|재서술|인용문|상징|교육용|수업용 예시|수업을 위해 만든/.test(beat.notice))return `<div class="p-notice ${beat.reveal?'is-revealed':''}">${esc(beat.notice).replace(/\n/g,'<br>')}</div>`;
 return '';
}

function presentationQuiz(beat){
 const q=beat.question;
 const open=q.type==='open';
 const answers=open?`<div class="p-open-answer"><span>${beat.reveal?'이렇게 말할 수 있어요':'나의 생각은…'}</span><p>${esc(beat.reveal?q.answer:'말이나 그림으로 표현하고, 까닭도 함께 나누어요.')}</p></div>`:`<div class="p-quiz-options">${q.options.map((option,i)=>`<div class="p-option ${beat.reveal&&i===q.answerIndex?'is-answer':''}"><span>${i+1}</span><p>${esc(option)}</p>${beat.reveal&&i===q.answerIndex?'<b aria-label="정답">✓</b>':''}</div>`).join('')}</div>`;
 return `<article class="p-slide p-quiz ${open?'p-quiz-open':''} ${beat.reveal?'p-revealed':''}"><div class="p-copy"><span class="p-kicker">${esc(beat.kicker)}</span><h1 id="slide-title" tabindex="-1">${esc(beat.title)}</h1></div>${answers}${beat.reveal?`<div class="p-feedback"><strong>${open?'생각을 나누어요':`정답 ${q.answerIndex+1}`}</strong><p>${esc(q.explanation)}</p></div>`:'<p class="p-wait-message">먼저 생각을 나누고, 다음 화면에서 확인해요.</p>'}</article>`;
}

function presentationYoutube(beat){
 const y=beat.youtube,clock=t=>`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;
 return `<article class="p-slide p-youtube"><div class="p-copy"><span class="p-kicker">${esc(beat.kicker||presentationChapters[state.index])}</span><h1 id="slide-title" tabindex="-1">${esc(beat.title)}</h1>${beat.subtitle?`<p class="p-subtitle">${esc(beat.subtitle)}</p>`:''}</div><figure class="p-youtube-figure"><div class="p-youtube-frame"><iframe src="https://www.youtube-nocookie.com/embed/${esc(y.id)}?start=${y.start}&amp;end=${y.end}&amp;rel=0&amp;playsinline=1&amp;hl=ko" title="${esc(y.title)}" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><figcaption><span>${esc(y.channel)} · ${clock(y.start)}–${clock(y.end)} 구간 · 인터넷 연결 필요</span><a href="https://www.youtube.com/watch?v=${esc(y.id)}&amp;t=${y.start}s" target="_blank" rel="noopener noreferrer">YouTube에서 열기 ↗</a></figcaption></figure></article>`;
}

function presentationSlide(beat){
 if(beat.type==='inquiry-card')return window.renderHangeulInquiry(beat);
 if(beat.type==='youtube')return presentationYoutube(beat);
 if(beat.type==='documentary')return `<article class="p-slide p-documentary has-image"><h1 id="slide-title" class="p-sr-only" tabindex="-1">${esc(beat.title)}</h1><p class="p-sr-only">세종은 글로 뜻을 전하기 어려운 백성을 위해 1443년 훈민정음을 창제했어요. 정인지 등 학자들이 세종의 명을 받아 해례를 지었고, 1446년 훈민정음 해례본이 간행됐어요. 용비어천가는 1445년 노래를 짓고 1447년 책으로 간행했어요.</p><img class="p-backdrop" src="assets/documentary-poster.webp" alt="누구나 마음을 전할 수 있도록 · 세종이 꿈꾼 새로운 글자의 이야기"><video class="p-backdrop p-backdrop-video" src="videos/hangeul-documentary-kling-60s.mp4?v=visual3" data-bgm="true" poster="assets/documentary-poster.webp" muted playsinline preload="auto" aria-hidden="true"></video><p class="p-video-fallback">영상을 열지 못했어요. ‘세종은 왜 새 글자를 만들었을까?’를 이야기하고 다음으로 이어 가세요.</p></article>`;
 if(beat.type==='quiz')return presentationQuiz(beat);
 if(beat.motionVideo)return `<article class="p-slide p-motion-video has-image"><img class="p-backdrop" src="assets/timeline-skia.webp" alt="1443년 창제에서 1446년 반포로 이어지는 도식"><video class="p-backdrop p-backdrop-video" src="videos/${esc(beat.motionVideo)}" poster="assets/timeline-skia.webp" muted playsinline preload="auto" aria-hidden="true"></video><div class="p-copy"><span class="p-kicker">${esc(beat.kicker||presentationChapters[state.index])}</span><h1 id="slide-title" tabindex="-1">${esc(beat.title)}</h1><p class="p-subtitle">${esc(beat.subtitle||'1443년 창제, 1446년 반포를 구분해요.')}</p></div></article>`;
 if(beat.image)beat={...beat,image:beat.image.replace(/\.webp$/,'')};
 const hasImage=!!beat.image;
 const clip=state.index===2&&(state.presenterBeat||0)===0&&beat.image==='writing-desk'?'writing-tools.mp4':state.index===2&&(state.presenterBeat||0)===1&&beat.image==='hero-sejong'?'sejong-purpose-kling.mp4':state.grade==='1-2'&&state.index===0&&(state.presenterBeat||0)===1&&beat.image==='classroom-note'?'classroom-note.mp4':null;
 const visual=presentationVisual(beat);
 return `<article class="p-slide p-${esc(beat.type||'image')} ${hasImage?'has-image':''} ${beat.reveal?'p-revealed':''} ${visual?'has-visual':''}">
 ${hasImage?`<img class="p-backdrop" src="assets/${esc(beat.image)}.webp" alt="${esc(presentationCaptions[beat.image]||'교육용 삽화')}">${clip?`<video class="p-backdrop p-backdrop-video" src="videos/${clip}" poster="assets/${esc(beat.image)}.webp" muted playsinline preload="auto" aria-hidden="true"></video>`:''}<div class="p-shade"></div>`:''}
 <div class="p-copy"><span class="p-kicker">${esc(beat.kicker||presentationChapters[state.index])}</span><h1 id="slide-title" tabindex="-1">${esc(beat.title)}</h1>${beat.subtitle?`<p class="p-subtitle">${esc(beat.subtitle).replace(/\n/g,'<br>')}</p>`:''}</div>
 ${visual?`<div class="p-visual">${visual}</div>`:''}
 </article>`;
}

window.renderPresentation=function(){
 document.body.classList.add('presentation-mode');
 const beats=window.presentationBeats(state.grade,state.index);
 state.presenterBeat=Math.max(0,Math.min(beats.length-1,state.presenterBeat||0));
 const beat=beats[state.presenterBeat];
 const progress=presentationPosition();
 const following=window.LessonLibrary?window.LessonLibrary.adjacent('hangeul',state.grade,state.index,1):state.index+1;
 const next=beats[state.presenterBeat+1]||(following!==undefined?window.presentationBeats(state.grade,following)?.[0]:null);
 const last=!next;
 storage.set('beat:'+state.grade,String(state.presenterBeat));
 app.innerHTML=`<div class="presenter-shell"><header class="presenter-top"><button class="brand" data-action="home" aria-label="한글날 첫 화면"><span class="brand-icon">ㅎ</span><span>한글날 배움 여행</span></button><span class="presenter-grade">${getGrade().label} · ${presentationChapters[state.index]}</span><div class="presenter-top-tools">${btn('태블릿 QR','qr','light small')}${beat.type==='documentary'?btn('영상 잠시 멈춤','video-toggle','ghost small','id="video-toggle"'):''}${btn('모션 다시 보기','motion-replay','ghost small','id="motion-replay" hidden')}${btn('학습지·해설','contents','ghost small')}${btn('전체 화면','fullscreen','ghost small')}</div></header>
 <main id="main" class="presenter-main" aria-label="한글날 발표 슬라이드"><div class="presentation-stage">${presentationSlide(beat)}</div></main>
 <footer class="presenter-controls"><div class="presenter-cue"><span>함께 나눌 말</span><p>${esc(beat.cue||'학생의 생각을 듣고 다음으로 이어 가세요.')}</p></div><div class="presenter-nav"><div class="presenter-tools">${beat.type==='documentary'?btn('영상 해설','documentary-notes','ghost small'):btn('교사 노트','notes','ghost small')}${state.index===4?btn('참고 영상','presenter-video','light small'):''}${btn('수업 도구','presenter-tools','ghost small')}${beat.type==='documentary'?btn(window.documentaryMusicLabel?.()||'배경음악 끄기','video-music','ghost small','id="video-music" aria-pressed="true"'):''}</div><div class="presenter-status"><b>${progress.current}<span> / ${progress.total}</span></b><small>${last?'수업을 마쳐요':`다음 · ${esc(next?.kicker||next?.title||'다음 장면')}`}</small></div><div class="presenter-actions">${btn('← 이전','prev','ghost',progress.current===1?'disabled':'')}${btn(last?'활동 마치기 ✓':'다음 →','next','orange','aria-keyshortcuts="ArrowRight PageDown Space"')}</div></div></footer></div>`;window.runHangeulMotion?.();
};

window.presentationDocumentaryNotes=function(){
 const video=document.querySelector('.p-documentary video');
 if(video&&!video.paused){video.pause();document.querySelector('.presentation-stage')?.setAttribute('data-motion-state','paused');const button=document.getElementById('video-toggle');if(button)button.textContent='이어서 보기';}
 modal('60초 도입 영상 · 교사 해설',`<p class="modal-lead">화면의 문장을 천천히 읽어 주세요. 설명을 마치고 닫은 뒤, 위쪽 ‘이어서 보기’로 계속할 수 있습니다.</p><ol><li>우리말은 있었지만 글로 뜻을 전하기 어려운 이들이 있었어요.</li><li>세종은 그 어려움을 안타깝게 여겨 쉽게 배우고 쓸 새 글자를 만들었어요.</li><li>1443년은 문자 훈민정음을 만든 해, 1446년은 원리를 설명한 해례본을 펴낸 해예요.</li><li>정인지를 비롯한 학자 8명(대부분 집현전 소속)이 세종의 명을 받아 해례를 지었어요. 모두가 함께 문자를 창제했다고 단정하지 않아요.</li><li>용비어천가는 1445년 본문을 짓고 설명을 보완하여 1447년 책으로 간행했어요. 조선 왕조의 건국과 선왕의 업적을 기리는 노래이며, 글자 학습서는 아니에요.</li><li>한글의 사용은 시간이 흐르며 퍼졌어요. 오늘도 우리는 한글로 마음을 나눠요.</li></ol><p class="note">저학년은 연도 암기보다 ‘누구를 위해, 왜 만들었을까?’에 집중하세요. 인물과 공간은 교육용 상상 재연이며, 실제 창제 현장을 촬영하거나 복원한 기록이 아닙니다. 왕의 복식은 1444년 이후 자료를 참고했으므로 1443년 복식의 정확한 재현으로 소개하지 않습니다.</p><p class="note">‘1446년 반포’는 통상적인 교육 표현이며, 이 영상에서는 해례본 간행을 구체적으로 설명합니다. 10월 9일을 확인된 창제일이나 반포식 날짜로 단정하지 않습니다.</p><p><a href="https://sillok.history.go.kr/id/kda_12512030_002" target="_blank" rel="noopener noreferrer">세종실록 · 창제 기록 ↗</a> · <a href="https://contents.history.go.kr/play/view.do?levelId=ts_b33" target="_blank" rel="noopener noreferrer">국사편찬위원회 · 해례본 ↗</a> · <a href="https://museum.seoul.go.kr/www/board/NR_boardView.do?bbsCd=1182&amp;seq=20221208150055096&amp;sso=ok" target="_blank" rel="noopener noreferrer">서울역사박물관 · 용비어천가 ↗</a></p>`,true);
};
window.presentationTools=function(){
 modal('수업 도구',`<p class="modal-lead">모든 장면을 ‘이전’과 ‘다음’으로 진행해요. 학습지·해설 버튼에서 현재 학년의 자료를 열 수 있어요.</p><div class="button-row">${btn('학생 활동 QR','qr')}${btn('학습지·해설','contents','light')}${btn('자료 출처와 그림 안내','sources','light')}${btn('영상 보기','presenter-video','light')}${btn(window.motionToggleLabel?.()||'모션 켜기','motion-toggle','ghost')}</div><p class="note">글자 조합 모션은 관련 화면에 들어가면 자동으로 재생됩니다. 필요하면 화면 위의 ‘모션 다시 보기’를 누르세요. 동작에 민감한 학생이 있으면 여기서 끌 수 있습니다.</p>`);
};
window.presentationVideo=function(){
 modal('선택 영상 · 수업 전에 확인해 주세요',`<p>${esc(data.video.title)}</p><div class="presenter-video-frame"><iframe title="${esc(data.video.title)}" src="${esc(data.video.embedUrl.replace('youtube.com','youtube-nocookie.com'))}" allow="encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="note">실제 재생과 적합 구간은 수업 전 확인해 주세요. 기본 슬라이드에는 영상 없이 진행할 그림 이야기가 포함되어 있습니다.</p><a class="btn light" href="${esc(data.video.url)}" target="_blank" rel="noopener">YouTube 원본 열기 ↗</a>`,true);
};

if(state.view==='lesson'&&!state.student)renderLesson();
