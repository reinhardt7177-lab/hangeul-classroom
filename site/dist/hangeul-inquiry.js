'use strict';
// Text diagrams stay crisp on classroom displays. Steps advance only on teacher input.
window.hangeulInquiryBeats=function(grade,index){
 if(grade==='3-4'&&index===3)return [
  {type:'inquiry-card',inquiry:'mouth',title:'ㅁ을 소리 내며 입을 살펴요',reveal:false,cue:'입술이 어떻게 움직이나요? 관찰한 점을 말해 보세요.'},
  {type:'inquiry-card',inquiry:'mouth',title:'ㅁ의 모양과 소리를 연결해요',reveal:true,cue:'오늘의 발음 관찰과 글자를 만든 원리의 설명을 구분해 주세요.'},
  {type:'inquiry-card',inquiry:'tongue',title:'ㄴ을 소리 내며 혀끝을 생각해요',reveal:false,cue:'교사의 설명을 듣고 혀끝이 닿는 위치를 생각해 보세요. 입안을 보여 줄 필요는 없어요.'},
  {type:'inquiry-card',inquiry:'tongue',title:'소리를 내는 기관을 본뜬 글자',reveal:true,cue:'자음 기본자는 발음 기관의 모양을 본떴다는 설명과 비교해요.'}
 ];
 if(grade==='5-6'&&index===2)return [
  {type:'inquiry-card',inquiry:'haerye',title:'책 지면과 쉬운 풀이를 나란히 읽어요',reveal:true,cue:'이 지면은 1946년 영인본입니다. 옛 글자가 필요한 까닭을 설명한 구절을 찾아 읽고, 다음 실록 자료와 출처를 구별해 주세요.'},
  {type:'inquiry-card',inquiry:'purpose',title:'기록에서 창제 목적을 읽어요',reveal:false,cue:'이 글은 누구에게 어떤 도움을 주고 싶다고 말하나요? 구절을 근거로 설명해요.'},
  {type:'inquiry-card',inquiry:'purpose',title:'기록의 뜻을 오늘의 글쓰기로',reveal:true,cue:'읽는 사람이 어려워하는 부분을 찾고, 정보를 지키며 쉬운 말로 고쳐요.'}
 ];
 if(grade==='3-4'&&index===2)return [{type:'inquiry-card',inquiry:'haerye',title:'옛 책에서 글자를 만든 마음을 찾아요',reveal:true,cue:'어려운 한자를 모두 읽거나 외울 필요는 없어요. 교사와 쉬운 풀이를 읽고 목적을 설명해요.'}];
 if(grade!=='1-2'&&index===5)return [{type:'inquiry-card',inquiry:'reader',title:'읽는 사람에게 확인하고 고쳐요',reveal:true,cue:'짝이 해야 할 일을 설명할 수 있는지 듣고, 이해하기 어려운 표현을 고쳐요.'}];
 return [];
};
window.renderHangeulInquiry=function(beat){
 let body='';
 if(beat.inquiry==='mouth'||beat.inquiry==='tongue'){
  const mouth=beat.inquiry==='mouth',glyph=mouth?'ㅁ':'ㄴ';
  body=`<div class="glyph-diagram"><strong>${glyph}</strong><span>${mouth?'입술':'혀끝'} → 글자 모양</span></div><p>${beat.reveal?(mouth?'ㅁ은 입술이 다물어진 모양을 본떠 만들었어요.':'ㄴ은 혀끝이 윗니 뒤쪽 잇몸에 닿는 모양을 본떠 만들었어요.'):'소리를 내어 보고 관찰한 점을 먼저 말해요.'}</p>${beat.reveal?'<p>지금 관찰한 발음은 오늘의 소리예요. 글자의 역사적 원리는 자료의 설명으로 확인해요.</p>':''}<small>국립국어원 설명을 수업용으로 재서술 · <a href="https://www.korean.go.kr/hangeul/principle/002.html" target="_blank" rel="noopener noreferrer">자음 원리 자료 ↗</a></small>`;
 }else if(beat.inquiry==='purpose'){
  body=`<small>『세종실록』 세종 28년 9월 기사 · 국사편찬위원회 국역 일부 인용</small><blockquote>“사람들로 하여금 쉬 익히어 날마다 쓰는 데 편하게”</blockquote>${beat.reveal?'<div class="source-axes"><article><h3>기록에서 찾은 목적</h3><p>쉽게 익혀 일상에서 뜻을 전하게 하려는 마음</p></article><article><h3>오늘의 표현으로 연결</h3><p>읽는 사람이 이해하는 글인지 확인하고 고치기</p></article></div><p>위 설명은 수업용 재서술과 적용이에요. 원문에 오늘의 안내문 활동이 적혀 있다는 뜻은 아니에요.</p>':'<p>이 구절을 근거로 “누구의 어떤 어려움을 줄이고 싶었을까?”를 생각해요.</p>'}<small><a href="https://sillok.history.go.kr/id/kda_12809029_004" target="_blank" rel="noopener noreferrer">기록과 국역 전체 보기 ↗</a> · 특정 반포식의 날짜를 확인한 기록으로 설명하지 않아요.</small>`;
 }else if(beat.inquiry==='haerye'){
  body='<div class="source-axes"><figure class="source-image"><img src="assets/hunminjeongeum-haerye-facsimile.jpg" alt="국지어음으로 시작하는 훈민정음 해례본 1946년 석판 영인본 지면"><figcaption>훈민정음 해례본 1946년 석판 영인본 지면<br>규장각 가람古411.1-H883he · Wikimedia Commons 공개 파일(Public Domain)<br><a href="https://commons.wikimedia.org/wiki/File:Hunminjeongeum_Haerye_02.jpg" target="_blank" rel="noopener noreferrer">파일과 이용 조건 ↗</a></figcaption></figure><article><h3>지면에서 읽는 구절</h3><blockquote lang="zh">使人人易習便於日用矣</blockquote><p>수업용 풀이 · 사람들이 쉽게 익혀 날마다 쓰기 편하도록 하려는 뜻이에요.</p><p>이 사진은 1446년 실물 원본의 사진이 아니라, 그 책을 바탕으로 인쇄한 1946년 영인본 지면입니다. 영인본은 원래 책의 모습을 인쇄해 옮긴 책이에요.</p><a href="https://kyudb.snu.ac.kr/book/view.do?book_cd=GG43224_00" target="_blank" rel="noopener noreferrer">규장각 서지 정보 ↗</a></article></div>';
 }else{
  body='<ol><li>짝이 안내문을 읽고 해야 할 일을 말해요.</li><li>어려운 말이나 빠진 정보를 질문해요.</li><li>쓴 사람이 반응을 듣고 문장을 고쳐요.</li><li>바꾼 까닭을 설명해요.</li></ol><p>학생 화면의 “읽는 사람의 질문”에 반응을 적고 안내문을 다시 고칠 수 있어요. 이름은 적지 않아도 됩니다.</p>';
 }
 if(beat.inquiry==='purpose'&&beat.reveal){const d=window.LEARNING_RESOURCES.hangeulDate;body+=`<small>${esc(d.note)} <a href="${d.url}" target="_blank" rel="noopener noreferrer">국립국어원 설명 ↗</a></small>`;}
 return `<article class="p-slide p-inquiry-card"><div class="p-copy"><span class="p-kicker">자료와 나의 생각</span><h1 id="slide-title" tabindex="-1">${esc(beat.title)}</h1></div><section class="learning-evidence ${beat.reveal?'learning-reveal':''}">${body}</section></article>`;
};
