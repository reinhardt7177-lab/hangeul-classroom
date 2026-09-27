'use strict';
// Fact labels are intentionally explicit. The foundation narrative is a transmitted story,
// whereas Gojoseon and Bronze Age materials are studied with historical evidence.
const GC_SOURCES=[
 {title:'행정안전부 · 국경일 안내',url:'https://www.mois.go.kr/chd/sub/a05/celebrationDay/screen.do'},
 {title:'한국민족문화대백과사전 · 개천절',url:'https://encykorea.aks.ac.kr/Article/E0001734'},
 {title:'국사편찬위원회 우리역사넷 · 단군 신화, 어떻게 볼까요',url:'https://contents.history.go.kr/mobile/eh/view.do?code=eh_age_10&levelId=eh_n0010_0010'},
 {title:'국사편찬위원회 우리역사넷 · 단군과 고조선',url:'https://contents.history.go.kr/mobile/eh/view.do?code=ganada&levelId=eh_r0005_0010'},
 {title:'국사편찬위원회 · 『삼국유사』 단군 이야기 원문·해설',url:'https://contents.history.go.kr/front/hm/view.do?levelId=hm_001_0010'},
 {title:'국립중앙박물관 · 비파형 동검 소장품',url:'https://www.museum.go.kr/MUSEUM/contents/M0201030400.do?relicId=29833&schM=view&showHallId=760'},
 {title:'국립중앙박물관 · 어린이 동검 관찰자료',url:'https://modu.museum.go.kr/explore/paper/20382'},
 {title:'국사편찬위원회 우리역사넷 · 비파형 동검',url:'https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_r000300'}
];
const card=(kind,title,question,answer,image,note,minutes=2,tag='이미지 관찰')=>({kind,title,question,answer,image,note,minutes,tag});
const quiz=(title,question,choices,correct,reason,image,minutes=2)=>({kind:'quiz',title,question,choices,correct,answer:reason,image,note:'먼저 근거를 듣고, 다음을 눌러 정답과 이유를 공개하세요. 학생에게 고르기만 시키지 말고 선택 이유를 물어보세요.',minutes,tag:'함께 확인'});
const shared={
 date:card('fact','개천절은 언제일까요?','달력에서 10월 3일을 찾아 손가락으로 짚어 보세요.','개천절은 매년 10월 3일이에요. 대한민국의 다섯 국경일 가운데 하나입니다.','gaecheon-dawn','국경일은 나라의 중요한 일을 기념하는 날입니다. 제헌절도 국경일이지만 수업에서 모두 공휴일이라고 말하지 않습니다.',2,'오늘의 날짜'),
 meaning:card('fact','‘개천’의 뜻','하늘이 열린다는 말에서 무엇이 떠오르나요?','‘개천’은 ‘하늘을 연다’는 뜻이에요. 개천절에는 하늘이 열렸다는 전승과 고조선의 시작을 기려요.','gaecheon-tree','개천을 곧바로 “단군이 10월 3일 나라를 세운 확정 날짜”로 등치하지 않습니다.',3,'말뜻 탐구'),
 tree:card('story','신단수 아래로','이 그림은 옛이야기의 어떤 장소처럼 보이나요?','『삼국유사』에 전해지는 이야기에는 환웅이 신단수 아래에 내려왔다고 해요. 그림은 이야기의 상상 장면입니다.','gaecheon-tree','나무의 종이나 정확한 장소는 확인할 수 없습니다. 환웅의 실존과 복식도 증거로 제시하지 않습니다.',3,'전승 장면'),
 animals:card('story','곰과 범의 이야기','곰과 범이 함께 바란 것은 무엇이었을까요?','전승에는 곰과 범이 사람이 되기를 바랐고, 곰이 웅녀가 되었다는 이야기가 나옵니다. 동물이 실제 사람으로 변했다는 역사적 증거는 아닙니다.','gaecheon-bear-tiger','곰·범 장면을 실제 사진이나 확정된 선사 사건으로 말하지 않습니다. 저학년에게는 “옛이야기 속에서는”을 반복합니다.',3,'전승 장면'),
 gojoseon:card('history','고조선의 시작','옛이야기와 실제 역사를 공부할 때 무엇을 다르게 볼까요?','단군왕검이 고조선을 세웠다는 이야기가 전해집니다. 고조선은 우리 역사에서 처음 등장하는 국가로 배우며, 이야기에 담긴 뜻과 유물로 살펴보는 역사를 구분해요.','gaecheon-community','생성 삽화의 집, 옷, 고인돌 배치는 교육용 재구성입니다. 특정 발굴터의 복원이 아닙니다.',3,'전승과 역사'),
 evidence:card('evidence','역사의 단서 찾기','이 고인돌 그림은 발굴 현장 사진일까요, 교육용 재구성일까요?','그림은 고인돌을 상상하여 재구성했어요. 실제 발굴된 고인돌과 비파형 동검은 청동기 문화와 고조선을 탐구할 단서가 됩니다.','gaecheon-dolmen','고인돌 그림은 특정 유적의 사진이 아닙니다. 실제 유물의 출토 분포는 문화권을 짐작하는 자료이며 특정 건국일의 증거가 아닙니다.',3,'증거와 상상'),
 value:card('value','홍익인간, 널리 이롭게','우리 반에서 ‘함께 이롭다’는 것은 무엇일까요?','홍익인간은 사람을 널리 이롭게 하자는 뜻으로 전해져요. 오늘의 교실에서는 서로 돕고 배려하는 행동으로 이어 볼 수 있어요.','gaecheon-helping-today','홍익인간을 특정 아동에게 희생을 요구하는 가치로 설명하지 않습니다. 서로의 존엄과 도움이 함께 성립하도록 예를 듭니다.',3,'우리의 삶으로'),
 activity:card('activity','태블릿으로 생각 잇기','QR을 열고 혼자 고른 다음, 짝과 까닭을 이야기해 보세요.','학생 화면에는 이야기 순서, 사실·전승 구분, 우리 반의 홍익인간 활동이 있어요. QR 없이도 손과 말, 종이로 참여할 수 있어요.','gaecheon-helping-today','교사 화면 오른쪽 QR 버튼을 누르면 해당 학년 학생 활동으로 이동합니다. 학생 응답은 수집되지 않습니다.',5,'QR 학생 활동'),
 exit:card('exit','오늘의 배움 한 문장','개천절을 친구에게 어떻게 설명할까요?','“개천절은 10월 3일, 하늘이 열렸다는 전승과 고조선의 시작을 기리는 국경일이에요.” 자신의 말로 조금 바꾸어도 좋아요.','gaecheon-dawn','끝으로 학습지를 인쇄하여 개인별 이해를 확인하세요. 사실/전승 구분을 상위 학년에서 평가합니다.',2,'마무리')
};
const grades={
 '1-2':{label:'1–2학년',subtitle:'하늘이 열린 이야기',focus:'보고 · 듣고 · 순서대로 말하기',objectives:['개천절 날짜와 뜻을 말한다','전승 속 장면을 순서대로 놓는다','친구를 돕는 행동을 고른다'],slides:[
 card('cover','하늘이 열린 날, 개천절','이른 아침 하늘을 보면 어떤 기분이 드나요?','오늘은 10월 3일 개천절의 이야기와 마음을 만나 볼 거예요.','gaecheon-summit-dawn','산 사진처럼 보이는 이미지는 생성 삽화입니다. 특정 고대 장소를 재현한 것이 아닙니다.',2,'개천절 수업'),
 card('observe','그림 속 단서 발견','산, 나무, 하늘 가운데 눈에 먼저 들어온 것은?','우리가 본 장면을 말로 표현해 봅시다. 그림은 오래된 이야기를 상상하도록 돕는 그림이에요.','gaecheon-tree','관찰과 해석을 나눕니다. “나무가 보인다”는 관찰, “옛이야기 같다”는 생각입니다.',2),shared.date,shared.meaning,shared.tree,shared.animals,
 card('story','단군왕검 이야기','옛이야기에서 다음에 등장하는 이름은 무엇일까요?','이야기에서는 웅녀와 환웅 사이에서 단군왕검이 태어나고, 고조선을 세웠다고 전해요.','gaecheon-community','“그렇게 전해요”라고 정확히 말합니다. 역사적 사실로 단정하지 않습니다.',3,'전해지는 이야기'),
 shared.value,shared.activity,
 quiz('그림을 고르세요','개천절 이야기를 떠올리게 하는 그림은?', [{text:'산과 신단수',image:'gaecheon-tree'},{text:'현대 학교 안내판',image:'school-sign'},{text:'조선 책상',image:'writing-desk'},{text:'훈민정음 글자',image:'hangul-garden'}],0,'신단수는 단군 이야기 속 장면입니다. 이 그림도 실제 모습을 찍은 사진은 아니에요.','gaecheon-tree'),
 quiz('날짜 카드','개천절은 언제일까요?',['3월 1일','7월 17일','10월 3일','10월 9일'],2,'개천절은 10월 3일이에요.','gaecheon-dawn'),
 quiz('함께 이로운 행동','홍익인간을 우리 반에서 실천하는 모습은?',['친구를 밀어내기','나만 먼저 하기','모두가 쓸 물건 함께 정리하기','친구의 말 끊기'],2,'서로 돕고 함께 쓰는 물건을 아끼는 행동이 잘 어울려요.','gaecheon-dawn'),shared.exit
 ]},
 '3-4':{label:'3–4학년',subtitle:'전승을 읽고 뜻을 찾아요',focus:'이야기 · 자료 구분 · 생활 속 적용',objectives:['개천절의 의미를 설명한다','단군 이야기를 전승으로 표현한다','홍익인간을 교실 행동에 적용한다'],slides:[
 card('cover','하늘이 열린 이야기, 나라를 생각하는 날','왜 나라의 시작을 기억하는 날이 필요할까요?','개천절은 10월 3일. 하늘이 열렸다는 전승과 고조선의 시작을 기리는 국경일입니다.','gaecheon-summit-dawn','국경일 의미를 먼저 묻고 나중에 설명합니다.',2,'개천절 수업'),shared.date,shared.meaning,shared.tree,shared.animals,shared.gojoseon,
 card('source','이야기는 어디에 적혀 있을까?','우리는 단군 이야기를 어떻게 알게 되었을까요?','단군의 건국 이야기는 『삼국유사』에 기록되어 전해집니다. 오랜 뒤에 기록된 이야기라는 점도 기억해요.','gaecheon-source-study','『삼국유사』는 고려 시대 편찬입니다. 현대 학생의 자료 탐구 장면을 사료 원본처럼 보여 주지 않습니다.',3,'자료 탐구'),
 shared.evidence,shared.value,shared.activity,
 quiz('확인 01','다음 중 개천절에 대한 바른 설명은?',['세종이 한글을 반포한 날','하늘이 열린 전승과 고조선의 시작을 기리는 날','헌법이 제정된 날','독립을 선언한 날'],1,'개천절은 10월 3일에 고조선의 시작을 기리는 국경일이에요.','gaecheon-dawn'),
 quiz('확인 02','단군 이야기를 설명할 때 알맞은 말은?',['모든 장면을 사진으로 확인했다','10월 3일 사건을 시계로 확인했다','『삼국유사』에 전해지는 이야기이다','곰이 사람으로 변한 사실이 발견되었다'],2,'전승 속 장면은 기록으로 전해지지만 모든 사건이 사실로 확인된 것은 아니에요.','gaecheon-bear-tiger'),
 quiz('확인 03','그림 속 마을은 어떤 자료일까요?',['고조선 마을의 실제 사진','자료를 참고해 상상한 교육용 재구성','『삼국유사』 원본 사진','유물의 정확한 위치도'],1,'생성 삽화는 관찰을 돕지만 발굴된 유물과 구분해야 해요.','gaecheon-community'),
 quiz('확인 04','홍익인간에 가장 가까운 행동은?',['친구 의견 듣고 함께 해결하기','나만 잘되면 된다고 말하기','불편한 친구를 못 본 척하기','자료를 혼자 숨기기'],0,'사람을 널리 이롭게 하려는 뜻을 교실에서는 존중과 협력으로 이어 볼 수 있어요.','gaecheon-classroom'),shared.exit
 ]},
 '5-6':{label:'5–6학년',subtitle:'전승과 증거를 구분하는 역사 탐구',focus:'주장 · 근거 · 해석 · 가치 적용',objectives:['개천절의 역사적 의미와 전승을 구분한다','문헌·유물·상상 재구성을 비교한다','근거를 들어 홍익인간 실천을 제안한다'],slides:[
 card('cover','나라의 시작을 어떻게 기억할까','같은 이야기를 ‘전승’과 ‘역사 연구’는 어떻게 다르게 읽을까요?','개천절은 10월 3일. 건국을 기리는 마음과 역사적 탐구를 함께 생각합니다.','gaecheon-summit-dawn','교사 첫 발문은 한 학생의 혈통이나 정체성을 배제하지 않도록 “우리나라가 기억해 온 이야기”로 둡니다.',2,'탐구 시작'),shared.date,shared.meaning,
 card('source','『삼국유사』라는 기록','이 기록은 사건이 일어난 바로 그날 쓰였을까요?','단군 서사는 고려 시대 편찬된 『삼국유사』에 전해집니다. 기록의 존재와 서사의 모든 장면이 사실이라는 주장은 다릅니다.','gaecheon-source-study','『삼국유사』는 13세기 후반 편찬. 정확한 고대 건국일을 확인하는 동시대 기록이 아닙니다.',3,'문헌 읽기'),shared.tree,shared.animals,shared.gojoseon,shared.evidence,
 card('evidence','그림과 유물의 거리','고인돌과 비파형 동검이 무엇을 알려 주고, 무엇은 알려 주지 못할까요?','출토 유물은 청동기 문화와 고조선 관련 문화권을 탐구할 자료예요. 그러나 그림 속 특정 인물·대화·정확한 건국일을 증명하지는 못합니다.','gaecheon-community','비파형 동검 분포를 국경선처럼 그리지 않습니다. 그림 속 가옥 형태가 특정 유적 복원이라는 주장을 피합니다.',3,'자료의 한계'),
 card('inquiry','주장에 근거 붙이기','“단군이 정확히 10월 3일 고조선을 세웠다”는 문장은 어디까지 확인되었을까요?','오늘의 10월 3일은 기념일입니다. 신화의 연대와 날짜를 동시대 사료로 확정할 수 없습니다. 따라서 “전승에 따르면”을 붙여 말합니다.','gaecheon-dawn','기원전 2333년은 전승·기년 체계의 연도이지 실증된 정확한 건국연도가 아닙니다.',3,'비판적 사고'),shared.value,shared.activity,
 quiz('자료 판단 01','『삼국유사』의 단군 서사에 대한 바른 설명은?',['동시대 사진 자료다','고려 시대에 정리된 전승이다','모든 대화를 녹음했다','청동기 유물 자체다'],1,'기록이 남아 있다는 사실과 내용 전체의 실증은 서로 달라요.','gaecheon-tree'),
 quiz('자료 판단 02','다음 중 실제 출토 자료를 가리키는 것은?',['교육용 생성 마을 그림','곰이 사람으로 변한 장면','비파형 동검','상상한 환웅의 옷'],2,'비파형 동검은 출토 유물이며, 그림 속 장면은 상상 재구성입니다.','gaecheon-community'),
 quiz('자료 판단 03','비파형 동검 분포만으로 알 수 없는 것은?',['청동기 문화의 흔적','여러 지역의 유물 분포','단군의 정확한 건국 날짜','문화의 교류 가능성'],2,'유물의 분포는 문화 탐구의 근거이지만 특정 날짜의 직접 증거가 아닙니다.','gaecheon-community'),
 quiz('자료 판단 04','개천절을 가장 정확하게 설명한 문장은?',['10월 3일 사건의 영상 기록이 남아 있다','단군 신화는 역사 연구가 필요 없는 사실이다','하늘이 열렸다는 전승과 고조선의 시작을 기리는 국경일이다','모든 한민족이 한 사람의 후손임이 증명되었다'],2,'기념의 의미와 검증된 사실의 범위를 함께 말해야 합니다.','gaecheon-dawn'),
 quiz('가치 적용 05','홍익인간을 근거 있게 실천한 사례는?',['도움받는 친구의 의견을 듣고 함께 방법 정하기','친구 의사와 무관하게 대신 결정하기','소수 의견을 지우고 빨리 끝내기','도움을 칭찬받기 위한 사진으로 남기기'],0,'돕는 대상의 생각과 존엄을 존중하는 실천이 중요합니다.','gaecheon-classroom'),shared.exit
 ]}
};
for(const grade of ['1-2','3-4','5-6'])grades[grade].slides=grades[grade].slides.map(s=>({...s}));
for(const grade of Object.values(grades))for(const slide of grade.slides){
 if(slide.kind==='cover')slide.video='gaecheon-dawn-kling-8s';
 if(slide.kind==='story'&&slide.image==='gaecheon-bear-tiger')slide.video='gaecheon-bear-tiger-kling-8s';
}
for(const [index,extra] of [[0,1],[1,1],[2,1],[8,1],[9,2]])grades['1-2'].slides[index].minutes+=extra;
for(const index of [0,4,5])grades['5-6'].slides[index].minutes--;
for(let index=12;index<=16;index++)grades['5-6'].slides[index].minutes=1;
window.GAECHEON_DATA={grades,sources:GC_SOURCES};
