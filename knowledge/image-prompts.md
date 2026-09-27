# 국경일 이미지 생성 기록

> **최신 상태:** 아래 5개는 생성 이력을 보존하는 시안이며 **최종 사용 미승인**입니다. 대한민국의 역사·문화 고증과 중국풍 배제 조건에 따른 [재검수 결과](visual-audit.md)가 이전의 단순 형태 확인 기록보다 우선합니다. 개천절은 인물 표현 교체 대상이며, 다른 자산도 수정·재검수 후 채택합니다.

- 생성일: 2026-09-26
- 적용 스킬: imagegen (`C:/Users/닭사랑농장/.codex/skills/.system/imagegen/SKILL.md`)
- 생성 방식: 내장 `image_gen.imagegen` 도구, 각 이미지 1회 생성. CLI/API 우회 사용 없음.
- 최종 용도: 제작 계획서의 시각 컨셉 시안 및 향후 벤토 카드·수업 삽화.
- 상태: 사용자 최신 요청에 따라 계획 검토용 시안으로 보관. 앱 구현은 별도 단계.
- 공통 스타일: 따뜻한 아이보리 배경, 클레이·페이퍼크래프트 미니어처, 주황·세이지·파랑 색상, 텍스트 없는 삽화.
- 생성 원본은 Codex 기본 generated_images 경로에 보존하고 아래 프로젝트 파일로 복사함.
- 교육 유의점: 개천절 이미지는 단군 신화를 상징하는 창작 삽화이며 역사적 장면 복원이나 실존 인물 초상으로 사용하지 않음. 삼일절·광복절도 상징 삽화이며 당시 현장 자료가 아님.

## 저장 파일

| 국경일 | 프로젝트 파일 |
|---|---|
| 한글날 | `public/assets/hangul.png` |
| 개천절 | `public/assets/gaecheon.png` |
| 삼일절 | `public/assets/samil.png` |
| 광복절 | `public/assets/liberation.png` |
| 제헌절 | `public/assets/constitution.png` |

## 실제 생성 프롬프트

기록 보존을 위해 아래는 실행한 원문 그대로 남긴다. 삼일절·광복절 원문에 있는 괘 배열 영문 설명 중 오른쪽 위/왼쪽 아래 설명은 서로 뒤바뀌어 있으므로 새 프롬프트에 재사용하지 않는다. 올바른 기준은 **오른쪽 위 감(끊김·이어짐·끊김), 왼쪽 아래 리(이어짐·끊김·이어짐)**이다. 생성된 두 시안은 이 올바른 감·리 모양으로 표현된 것을 육안으로 확인했다. 태극기는 상징 삽화 요소로 사용하고, 정밀 국기 도안 학습에는 [행정안전부 공식 자료](https://www.mois.go.kr/frt/sub/a06/b08/nationalIcon_2_2/screen.do)를 별도로 사용한다.

### 한글날

```text
Use case: stylized-concept. Asset type: a polished square 1024x1024 educational webapp card illustration for Korean elementary students. Style: contemporary tactile clay 3D and paper-craft miniature diorama, sophisticated warm editorial feel, rounded clean forms, ivory seamless backdrop, soft studio shadows, orange, sage green and soft blue accents. Main objects in center with generous clear outer margin, whole objects fully visible. No text, no numerals, no letters, no captions, no logos, no watermark. Do not make it infantile. Primary request: Hangul Day represented by a dignified warm King Sejong in traditional red Joseon royal robe and black winged royal hat, a large open blank traditional stitched book and elegant floating simple geometric speech/learning blocks. Book pages must be blank because any readable Hangul will be added separately by the webapp. A simple miniature Joseon palace roof in muted green behind him. A thoughtful welcoming expression. Warm peach accent ground.
```

### 개천절

```text
Use case: stylized-concept. Asset type: a polished square 1024x1024 educational webapp card illustration for Korean elementary students. Style: contemporary tactile clay 3D and paper-craft miniature diorama, sophisticated warm editorial feel, rounded clean forms, ivory seamless backdrop, soft studio shadows, orange, sage green and soft blue accents. Main objects in center with generous clear outer margin, whole objects fully visible. No text, no numerals, no letters, no captions, no logos, no watermark. Do not make it infantile. Primary request: Gaecheonjeol and the traditional Dangun founding myth, explicitly a storybook myth illustration rather than a historical reconstruction. A serene sage-like Dangun figure in ivory ancient Korean robes with simple leaf crown and staff, a friendly brown bear and an orange tiger, miniature blue-green sacred mountains, a leafy sacred tree and soft layered clouds. No flag. No weapons or threatening expressions. Balanced little clay diorama sitting on an oval sage green base.
```

### 삼일절

```text
Use case: stylized-concept. Asset type: a polished square 1024x1024 educational webapp card illustration for Korean elementary students. Style: contemporary tactile clay 3D and paper-craft miniature diorama, sophisticated warm editorial feel, rounded clean forms, ivory seamless backdrop, soft studio shadows, orange, sage green and soft blue accents. Main objects in center with generous clear outer margin, whole objects fully visible. No text, no numerals, no letters, no captions, no logos, no watermark. Do not make it infantile. Primary request: March First Independence Movement remembered through a peaceful miniature group of three Korean adults in simple ivory period hanbok, standing together with one large Korean Taegukgi flag raised behind them. Open palms raised peacefully, dignified hopeful faces, spring magnolia blossoms and a small hanok roof in the background. No military, no conflict, no weapons. Clay figurines with restrained detail, cheerful but respectful. Muted peach and sage accents. IMPORTANT Korean flag accuracy: use one clean frontal rectangular white Taegukgi flag with central red upper/blue lower taegeuk circle and four exact black trigrams: top-left three solid lines, bottom-right three broken lines, top-right solid-broken-solid, bottom-left broken-solid-broken. No other flags. Keep the flag flat and clearly legible as a symbol, not tangled or heavily folded. 
```

### 광복절

```text
Use case: stylized-concept. Asset type: a polished square 1024x1024 educational webapp card illustration for Korean elementary students. Style: contemporary tactile clay 3D and paper-craft miniature diorama, sophisticated warm editorial feel, rounded clean forms, ivory seamless backdrop, soft studio shadows, orange, sage green and soft blue accents. Main objects in center with generous clear outer margin, whole objects fully visible. No text, no numerals, no letters, no captions, no logos, no watermark. Do not make it infantile. Primary request: Korea Liberation Day symbolized by one big Korean Taegukgi flag on a pole, a radiant orange sunrise behind rolling blue green mountains, two happy Korean adult clay figurines in ivory and pale blue hanbok greeting the new morning with open arms, and a tiny white dove in flight. Joyful freedom mood, simple elegant miniature diorama on an ivory base. No chains, no weapons, no conflict. Sky blue and warm orange accents. IMPORTANT Korean flag accuracy: use one clean frontal rectangular white Taegukgi flag with central red upper/blue lower taegeuk circle and four exact black trigrams: top-left three solid lines, bottom-right three broken lines, top-right solid-broken-solid, bottom-left broken-solid-broken. No other flags. Keep the flag flat and clearly legible as a symbol, not tangled or heavily folded. 
```

### 제헌절

```text
Use case: stylized-concept. Asset type: a polished square 1024x1024 educational webapp card illustration for Korean elementary students. Style: contemporary tactile clay 3D and paper-craft miniature diorama, sophisticated warm editorial feel, rounded clean forms, ivory seamless backdrop, soft studio shadows, orange, sage green and soft blue accents. Main objects in center with generous clear outer margin, whole objects fully visible. No text, no numerals, no letters, no captions, no logos, no watermark. Do not make it infantile. Primary request: Constitution Day of the Republic of Korea as a beautiful symbolic miniature still life: one stately navy blue closed book with plain cover and gold edging, a balanced brass set of scales standing upright beside it, folded ivory paper, a small olive branch and a stylized civic building with columns in the background. No gavel, no flag. The book cover is blank without lettering. Thoughtful hopeful educational mood. Soft blue accent ground.
```

