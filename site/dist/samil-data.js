'use strict';

(() => {
  const history = globalThis.SamilHistory;
  const sources = {
    ...history.sources,
    photograph: {
      title: '1919년 3월 서울의 만세 시위',
      credit: '한국통신국 간행 『L’Indépendance de la Corée et la Paix』 수록 사진 · 퍼블릭 도메인',
      url: 'https://commons.wikimedia.org/wiki/File:L%E2%80%99Ind%C3%A9pendance_de_la_Cor%C3%A9e_et_la_Paix-02.jpg',
    },
    document: {
      title: '독립선언서',
      credit: '국립중앙박물관 소장 구2766 · 공공누리 제1유형',
      url: 'https://www.museum.go.kr/MUSEUM/contents/M0502000000.do?relicId=85894&schM=view&searchId=search',
    },
    flag: {
      title: '대한제국 시기의 태극기',
      credit: '국립중앙박물관 소장 증8947 · 공공누리 제1유형',
      url: 'https://www.museum.go.kr/MUSEUM/contents/M0502000000.do?relicId=187597&schM=view',
    },
    archive: { title: '3·1절 기념과 1919년의 기록', credit: '국가기록원', url: 'https://theme.archives.go.kr/next/koreaOfRecord/3_1.do' },
    regions: { title: '독립운동 관련 판결문 자료집 · 3·1운동Ⅰ', credit: '국가기록원 · 서울과 평양 등 3월 1일 시위', url: 'https://www.archives.go.kr/archivesdata/upFile/palgan/1393465707156.pdf' },
    aunae: { title: '유관순 수형기록카드와 아우내 만세 시위', credit: '독립기념관 교육정보서비스', url: 'https://learn.i815.or.kr/0201/learning/exhibit/TdgMw0Zcz9a2YkoYzR1/view' },
    reading: { title: '3·1독립선언서의 내용과 인쇄·배포', credit: '독립기념관 교육정보서비스', url: 'https://learn.i815.or.kr/0301/today/history/view/?idx=0SLFBN1F7wSwSWbWJqE' },
    government: { title: '3·1운동과 대한민국 임시정부 수립', credit: '독립기념관 교육정보서비스', url: 'https://learn.i815.or.kr/0301/today/history/view/?idx=jx0wcl4kYrPcqZ24ofL' },
    ahnLetter: { title: '안중근이 어머니와 아내에게 남긴 글', credit: '독립기념관 《한국독립운동사연구소 독립운동가열전》 안중근 편 수록 서신', url: 'https://search.i815.or.kr/publication/yeoljeon/detail.do?id=9-AJ0001-000' },
    ahnPhoto: { title: '뤼순감옥 면회 사진', credit: '1910년 3월 · 촬영자 미상 · 위키미디어 공용에 공개된 역사 사진', url: 'https://commons.wikimedia.org/wiki/File:AnJungGeunOutsideVisit.jpg' },
    maria: { title: '조마리아의 독립운동', credit: '국가보훈부 공훈전자사료관 · 국채보상운동, 변호사 접촉, 임시정부 지원', url: 'https://e-gonghun.mpva.go.kr/user/IndepCrusaderDetail.do?goTocode=20003&mngNo=962259' },
    mariaResearch: { title: '조마리아의 편지와 전언을 검토한 연구', credit: '도진순, 《역사비평》 142호, 2023', url: 'https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002937908' },
    yuRecord: { title: '유관순 일제감시대상인물카드', credit: '국사편찬위원회 한국사데이터베이스 · 조선총독부 경기도경찰부 고등과 작성', url: 'https://db.history.go.kr/modern/ia/detail.do?levelId=ia_3279_2540' },
    yuLife: { title: '유관순의 생애와 옥중 순국', credit: '독립기념관 독립운동인명사전', url: 'https://search.i815.or.kr/dictionary/detail.do?id=614' },
    annexation: { title: '국권 상실과 대한민국 임시정부의 기록', credit: '국가기록원 · 강제 병합에서 독립운동으로', url: 'https://theme.archives.go.kr/next/pages/new_newsletter/2017/html/vol_112/sub01.html' },
    forcedLabor: { title: '일제 강제동원 관련 명부', credit: '국가기록원 · 전시 노동력 동원과 피해 기록', url: 'https://history.archives.go.kr/front/service/information' },
    dictionary: { title: '조선말 큰사전 편찬 원고', credit: '국가기록원 국가지정기록물 제4호 · 1942년 조선어학회 사건과 압수', url: 'https://theme.archives.go.kr/next/nationalArchives/subPage/nationalArchives3.do' },
    liberation: { title: '빛으로 이어진 80년의 기록', credit: '국가기록원 광복 80년 국가기록특별전', url: 'https://archives.go.kr/next/common/archivedata/render.do?filePath=2F757046696c652F70616c67616e2FBAFBC0B8B7CE20C0CCBEEEC1F8203830B3E2C0C720B1E2B7CF2e706466' },
    map: { title: '한반도 해안선', credit: 'Natural Earth 바탕지도 · 퍼블릭 도메인 · 지명은 학습용 표시', url: 'https://www.naturalearthdata.com/about/terms-of-use/' },
  };

  const visuals = {
    ...history.visuals,
    crowd: { file: 'samil-seoul.webp', alt: '1919년 3월 서울에서 사람들의 행렬이 거리와 광장에 모여 있는 흑백 사진', source: 'photograph' },
    paper: { file: 'samil-declaration.webp', alt: '세로줄을 따라 글자가 빽빽이 인쇄된 3·1독립선언서 실물', source: 'document' },
    flag: { file: 'samil-flag.webp', alt: '가운데 태극 문양과 네 모서리의 괘가 보이는 대한제국 시기의 태극기', source: 'flag' },
    ahn: { file: 'samil-ahn-visit.webp', alt: '뤼순감옥에서 안중근이 면회 온 두 동생과 빌렘 신부를 만나는 흑백 사진', source: 'ahnPhoto' },
    yu: { file: 'samil-yu-record.webp', alt: '이름과 기록 항목, 유관순의 얼굴 사진이 나란히 남아 있는 일제감시대상인물카드', source: 'yuRecord' },
  };

  const places = [
    { id: 'seoul', name: '서울', date: '3월 1일', x: 33.21, y: 57.67, detail: '탑골공원에 모인 사람들은 독립선언서를 읽었어요. 시민과 학생들이 거리에 나와 만세를 외쳤어요.', source: 'archive' },
    { id: 'pyeongyang', name: '평양', date: '3월 1일', x: 19.10, y: 44.08, detail: '서울과 같은 날 평양에서도 만세 시위가 열렸어요. 같은 날 여러 도시에서 독립을 바라는 목소리가 나왔어요.', source: 'regions' },
    { id: 'aunae', name: '천안 아우내', date: '4월 1일', x: 36.76, y: 65.16, detail: '유관순과 지역 주민 등이 아우내 장터에서 만세 시위에 참여했어요. 3월 1일 이후에도 여러 지역에서 시위가 이어졌어요.', source: 'aunae' },
  ];

  const order = [
    { label: '독립선언서를 준비했어요', visual: 'paper' },
    { label: '사람들이 모여 만세를 외쳤어요', visual: 'crowd' },
    { label: '다른 지역에서도 만세가 이어졌어요', visual: 'map' },
  ];

  const claims = [
    { claim: '1919년 사람들은 우리 민족이 스스로 나라의 일을 결정할 권리가 있다고 밝혔어요.', evidence: ['조선이 독립 국가이고 조선 사람이 스스로 결정하는 민족이라고 밝힌 부분', '오늘날 3월 1일을 표시한 학교 달력', '사진에서 건물 앞에 사람들이 모인 모습'], correct: 0, reason: '독립선언서의 첫머리에 담긴 뜻이 이 주장과 직접 연결돼요.' },
    { claim: '만세 시위는 한 도시에서 하루만 일어난 일이 아니었어요.', evidence: ['독립선언서 종이의 가로 길이', '서울과 평양의 3월 1일 기록, 아우내의 4월 1일 기록', '대한제국 태극기의 천 색깔'], correct: 1, reason: '서로 다른 장소와 날짜를 알려 주는 기록을 함께 보면 알 수 있어요.' },
    { claim: '안중근은 감옥에서도 가족의 평안을 바랐어요.', evidence: ['조선말 큰사전 편찬 기록', '1919년 서울의 만세 사진', '어머니가 마음 편안히 지내기를 바란다는 옥중 글'], correct: 2, reason: '그가 어머니에게 남긴 글에서 바람을 읽을 수 있어요. 그 글로 어머니가 어떤 답을 했는지까지 알 수는 없어요.' },
  ];

  const quiz = (title, options, correct, explain, visual, evidence) => ({
    type: 'quiz', title, options, correct, explain, visual, evidence,
    note: '모두가 먼저 답을 고르게 한 뒤, 학생 한 명에게 선택한 이유를 물어보세요.',
  });

  const grades = {
    '1-2': {
      label: '1–2학년', title: '함께 외친 만세', description: '사진을 보고, 그림 세 장으로 만세 이야기를 이어 봐요.',
      goal: '3·1절에 무엇을 기억하는지 그림의 순서에 맞춰 말할 수 있어요.',
      activity: '그림 이야기 순서 맞추기', cover: 'crowd',
      slides: history.lessons['1-2'],
      quiz: [
        quiz('사람들은 무엇을 바라며 만세를 외쳤나요?', ['운동회 열기', '우리나라의 독립', '새 학교 짓기'], 1, '우리나라의 일을 우리 힘으로 정하고 싶어 독립을 외쳤어요.', 'crowd'),
        quiz('독립을 바라는 뜻을 알려 준 글은 무엇인가요?', ['독립선언서', '시간표', '상장'], 0, '이 종이가 독립선언서예요. 우리나라가 독립해야 한다는 뜻을 담았어요.', 'paper'),
        quiz('3·1절에는 어떤 일을 기억하나요?', ['한글을 널리 알린 일', '올해 처음 학교에 간 일', '사람들이 함께 독립을 외친 일'], 2, '3·1절은 1919년 3·1운동을 기억하는 날이에요.', 'flag'),
        quiz('유관순은 고향에서도 누구와 만세를 외쳤나요?', ['장터에 모인 이웃들과', '아무도 없이 혼자', '학교 선생님 한 사람하고만'], 0, '아우내 장터에서는 유관순과 여러 지역 주민이 함께 독립을 외쳤어요.', 'crowd'),
      ],
      exit: '“3·1절은 사람들이 ______을 바라며 ______한 일을 기억하는 날이에요.”',
      example: '3·1절은 사람들이 독립을 바라며 함께 만세를 외친 일을 기억하는 날이에요.',
    },
    '3-4': {
      label: '3–4학년', title: '지도로 따라가는 만세', description: '서울·평양·천안의 날짜를 비교해 여러 지역이 참여한 까닭을 찾아봐요.',
      goal: '만세 시위가 여러 곳과 여러 날에 이어졌음을 기록 두 개로 설명할 수 있어요.',
      activity: '지도에서 날짜 비교하기', cover: 'map',
      slides: history.lessons['3-4'],
      quiz: [
        quiz('서울과 평양의 기록에서 같은 것은?', ['시위가 열린 장소', '시위가 열린 날짜', '참가한 사람이 모두 같음'], 1, '두 지역 모두 1919년 3월 1일에 독립 만세 시위가 열렸어요.', 'map'),
        quiz('아우내 기록에서 알 수 있는 것은?', ['모든 시위가 서울에서 시작했어요.', '4월 1일에 운동이 모두 끝났어요.', '3월 1일 뒤에 다른 지역에서도 시위가 있었어요.'], 2, '아우내 시위는 천안에서 4월 1일에 열렸어요. 여러 지역에서 이후에도 이어졌다는 근거예요.', 'map'),
        quiz('독립선언서를 여러 장 인쇄하면 무엇이 가능해질까요?', ['더 많은 사람이 글의 뜻을 읽어요.', '글에 적힌 날짜가 저절로 바뀌어요.', '실제 만세 시위 사진이 생겨요.'], 0, '여러 장을 나누어 주면 더 많은 사람이 독립을 바라는 뜻을 알 수 있어요.', 'paper'),
        quiz('“3·1운동은 서울 하루만의 일이다”를 고칠 때 가장 좋은 근거는?', ['대한제국 태극기 사진', '서울·평양·아우내의 시위 날짜 기록', '올해 달력의 3월 1일'], 1, '당시의 날짜와 장소 기록을 나란히 놓으면 그 말이 사실과 다름을 설명할 수 있어요.', 'map'),
        quiz('유관순의 감시 카드에서 바로 확인할 수 있는 것은?', ['참가자 모두가 만세를 외친 이유', '아우내 주민 모두의 이름', '카드에 남은 유관순의 이름과 사진'], 2, '카드에는 유관순의 이름과 사진이 있어요. 시위의 뜻은 선언서와 다른 기록도 봐야 알 수 있어요.', 'yu'),
      ],
      exit: '시위가 여러 날·여러 곳에서 열렸음을 보여 주는 기록 두 가지를 골라 한 문장으로 쓰세요.',
      example: '평양에서는 3월 1일, 천안 아우내에서는 4월 1일에 시위가 열려서 만세가 여러 날, 여러 곳에서 이어진 것을 알 수 있어요.',
    },
    '5-6': {
      label: '5–6학년', title: '독립의 근거를 읽다', description: '옥중 글과 선언서에 남은 말을 읽고, 광복까지 이어진 기록을 살펴봐요.',
      goal: '3·1운동의 의미를 당시 자료 두 종류에 근거해 설명하고 자료의 한계를 말할 수 있어요.',
      activity: '주장에 맞는 근거 고르기', cover: 'paper',
      slides: history.lessons['5-6'],
      quiz: [
        quiz('독립선언서 첫머리가 직접 보여 주는 것은?', ['당시 사람들이 밝힌 독립과 자주의 뜻', '아우내에 모인 사람의 수', '1945년 광복을 맞은 사진'], 0, '첫머리에는 독립 국가임과 스스로 결정할 권리를 가진 민족이라는 주장이 담겼어요.', 'paper'),
        quiz('서울 시위 사진만으로 판단하기 가장 어려운 것은?', ['사진에 사람들이 모였는지', '거리의 모습이 어떠했는지', '참가자 한 사람 한 사람이 생각한 이유'], 2, '사진은 모인 모습은 보여 주지만 각 사람의 마음까지 알려 주지 않아요.', 'crowd'),
        quiz('자료와 근거를 바르게 연결한 것은?', ['태극기 → 각 지역 시위 날짜', '서울·평양·아우내의 기록 → 여러 때와 장소의 참여', '독립선언서의 크기 → 모든 참가자의 수'], 1, '여러 지역 기록의 날짜와 장소를 함께 보면 시위가 이어진 범위를 설명할 수 있어요.', 'map'),
        quiz('세 사건을 오래된 것부터 나열하면?', ['광복 → 3·1운동 → 임시정부 수립', '임시정부 수립 → 광복 → 3·1운동', '3·1운동 → 임시정부 수립 → 광복'], 2, '1919년 3·1운동, 1919년 4월 대한민국 임시정부 수립, 1945년 광복 순서예요.', 'timeline'),
        quiz('“사진 속 모두가 같은 생각이었다”는 말을 어떻게 검토할까요?', ['개인의 글이나 증언 등 다른 자료를 더 찾아요.', '사진을 더 크게 보면 생각도 보여요.', '사진이 오래됐으니 그 말을 그대로 믿어요.'], 0, '사진에서 확인할 수 없는 주장은 일기, 편지, 증언 같은 다른 기록으로 검토해요.', 'crowd'),
        quiz('조마리아가 독립운동을 했다는 근거로 적절한 것은?', ['널리 퍼진 편지 문구만 인용하기', '국채보상운동 참여와 임시정부 지원 기록 살펴보기', '안중근의 면회 사진만 보고 어머니의 생각 추측하기'], 1, '국가보훈부 자료에서 국채보상운동 참여와 임시정부 지원 활동을 확인할 수 있어요.', null, '공훈록 요약 · 조마리아는 1907년 국채보상운동에 돈을 보탰고, 1920년대 상하이에서 임시정부를 돕는 단체에서 활동했어요.'),
      ],
      exit: '3·1운동의 의미를 한 문장으로 쓰고, 근거 자료 두 가지와 그중 한 자료의 한계를 쓰세요.',
      example: '독립선언서는 독립을 요구한 뜻을, 지역 기록은 여러 곳의 참여를 보여 줘요. 어느 기록 하나만으로 전국의 모든 참여를 알 수는 없어요.',
    },
  };

  globalThis.SamilData = { sources, visuals, places, order, claims, grades, era: history.era, remembrance: history.remembrance, videos: history.videos };
})();
