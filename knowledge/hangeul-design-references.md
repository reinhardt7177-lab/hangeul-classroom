# 한글날 앱 디자인 적용 기록

## 실제 적용

- 화면: 한글날만의 독립 시작 화면, 학년별 이미지 카드, 큰 삽화와 한 가지 질문이 중심인 발표 화면.
- 글꼴: 제목 Noto Serif KR, 본문·버튼 Noto Sans KR. 수업에 사용하는 문자 집합을 로컬 웹폰트로 포함하여 외부 폰트 연결 의존을 줄였다. 사용자 입력에 없는 글자는 운영체제 한글 폰트로 대체된다.
- 색: 먹빛을 닮은 짙은 녹색, 한지 바탕, 절제된 주황 강조. 학생 조작면은 대비를 높이고 장식은 수업 내용을 가리지 않게 했다.
- 모션: 글자 조합, 안내문 공개, 장면 전환, 선택 피드백에 제한적으로 적용. 시스템 모션 줄이기 설정을 따른다.
- 자산: 세종 상상 초상·전통 쓰기 도구·현대 교실·학교 안내판·도서관·한지 정물을 사용한다. 15세기 복식이 검증되지 않은 마을 시안은 본문에서 제외했다.

## 확인한 공식 디자인 참고

- [Google Design — How to Choose a Web Font](https://design.google/library/choosing-web-fonts-beginners-guide): 제목의 표현력과 본문의 읽기 목적을 구분하고 언어 지원을 확인하는 원칙을 참고했다. 실제 디자인은 한국어 수업에 맞춰 새로 제작했다.
- [Google Design — From Limited Choices to Personalized Fonts](https://design.google/library/variable-fonts-type): 읽기 경험과 표현을 함께 고려하는 글꼴 선택을 참고했다.
- [Smithsonian Learning Lab — 자료 탐색 안내](https://learninglab.si.edu/help/discover/searching-for-resources-and-collections): 자료를 관찰하고 교육 목적에 맞게 연결하는 학습 구조를 참고했다. 해당 기관 자료나 디자인을 복제하지 않았다.
- [Apple Education — Designing for the Future](https://education-static.apple.com/leadership/designing-for-the-future.pdf): 탐색과 창작을 통해 학습자가 표현하도록 돕는 방향을 참고했다.

‘AAA’는 사용자가 요청한 완성도 방향이며 객관적으로 인증된 제품 등급을 뜻하지 않는다. 디자인과 학습 효과는 실제 교실 사용을 통해 추가 검토할 수 있다.

## 자산 기록

내장 이미지 생성 도구의 성공 원본·프롬프트·검수 기록은 [생성 기록](hangeul-image-prompts.md)과 [manifest](../public/assets/hangeul/manifest.json)에 있다. 추가 황금 핸드벨 이미지는 도구 인증 오류로 생성되지 않았고, 완성된 한지 정물을 평가 화면에 적용했다. 없는 이미지나 임시 자리표시는 사용하지 않는다.
