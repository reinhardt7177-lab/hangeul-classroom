# 시각 자료 고증 수정 요청 (Codex 작업용)

- 작성: 2026-09-28
- 근거: 이미지 18종과 영상 7편의 프레임을 모두 뽑아 본 시각 고증 재검토. 가짜 한글·가짜 한자·가짜 해례본 지면은 없었습니다. 아래 항목은 **복식·관모·유적 형태·산수 구도·라벨**을 고치는 작업입니다.
- 코드 쪽 임시 조치는 이미 끝났습니다.
  - 세종 영상 연결을 끊었습니다.
  - 개천절 표지 그림을 `gaecheon-dawn.png`로 바꿨습니다.
  - 해당 장면 교사 노트에 그림의 한계를 적었습니다.
- 이 문서는 **그림과 영상 파일 자체를 교체하는 작업**만 다룹니다.

> **작업 결과(2026-09-28):** 우선순위 1–8을 모두 완료했습니다. 네 이미지와 다섯 영상 컷을 교체했고, 세종 영상 연결·다큐 라벨·학자 설명 문구·개천절 교사 노트까지 반영했습니다. 수정 전 원본은 `drafts/replaced/2026-09-28/`에 보존했습니다.

## 0. 공통 규칙

1. **파일 이름과 규격을 그대로 유지합니다.** 그래야 코드를 고치지 않고 교체됩니다. 교체 대상은 `site/dist/assets/*.png`와 `site/dist/videos/*.mp4`입니다.

   | 종류 | 규격 |
   |---|---|
   | 수업 삽화 PNG | 1672×941 (16:9) |
   | `sejong-purpose-kling.mp4` | H.264, 1280×720, 24fps, 약 5초, 소리 없음 |
   | `hangeul-documentary-kling-60s.mp4` | H.264, 1920×1080, 24fps, 60초, AAC 배경음악 있음 |

2. **먼저 읽을 기준:** [한국문화 시각 고증 필수 기준](한국문화-시각고증-필수기준.md)
   - §2 한글날, §3 개천절
   - §4 프롬프트 고정 구조
   - §5 채택 전 검수표
3. **모든 결과물에 공통으로 넣지 않을 것**
   - 읽을 수 있는 글자, 가짜 한글·한자, 로고, 워터마크
   - 중국·일본풍 궁궐·복식·관모·산수 관습
   - 시대가 맞지 않는 소품
   - 무섭거나 폭력적인 요소
4. **원본 보존:** 교체 전 원본을 `drafts/replaced/2026-09-28/`에 복사합니다. `drafts/`는 git에서 제외되어 있습니다.
5. **생성 기록:** 채택한 프롬프트, 사용 도구, 검수 결과(통과·보류 이유)를 남깁니다.
   - 한글날: `knowledge/hangeul-image-prompts.md`, `knowledge/한글날-조선시각고증-검수.md`
   - 개천절: `knowledge/개천절-이미지-프롬프트.md`
6. **검증:** 교체할 때마다 저장소 루트에서 아래를 실행합니다.

   ```bash
   node site/verify-presenter.mjs
   node site/verify-documentary-audio.mjs
   cd site && node verify.mjs && node verify-gaecheon.mjs
   ```

   이어서 `node site/server.mjs`로 `http://localhost:4198/`을 열고 해당 화면을 직접 확인합니다.

## 1. 작업 목록 (우선순위순)

| 순위 | 대상 | 문제 | 작업 | 도구 |
|---|---|---|---|---|
| 1 | `hero-sejong.png` | 관모에 없는 꼰 끈과 둥근 매듭 | 부분 수정(인페인팅) | 이미지 편집 |
| 2 | `sejong-purpose-kling.mp4` | 관원의 사모(날개 수평), 용보 없음 → **현재 연결 해제** | 재생성 | 스틸 생성 → Kling 이미지→영상 |
| 3 | 다큐 50–55초 라벨 | 글자가 칩 밖으로 넘침, 도서관 장면인데 ‘교실’ | 라벨만 덮어씌우기 | Python(Pillow) + ffmpeg |
| 4 | `gaecheon-community.png` | 청동기 반지하 움집이 아니라 지상 흙벽 초가 | 재생성 | 이미지 생성 |
| 5 | `gaecheon-dolmen.png` | 받침돌이 쐐기형이라 탁자식 고인돌과 다름 | 재생성 | 이미지 생성 |
| 6 | `gaecheon-tree.png` | 중국 황산식 산수 구도 | 재생성 | 이미지 생성 |
| 7 | 다큐 10–20초 세종 컷 | 관모의 끈·매듭 | 컷 2개 재생성 후 구간 교체 | Kling + ffmpeg |
| 8 | 다큐 25–35초 학자 컷 | 상투·망건만 쓴 평상복, 두 컷이 같은 장면 | 컷 2개 재생성 후 구간 교체 | Kling + ffmpeg |
| 선택 | 기타 4종 | §2-9 참고 | — | — |

---

## 2. 작업별 상세

### 2-1. `hero-sejong.png` — 관모의 끈·매듭 지우기 (부분 수정)

- **쓰이는 곳**
  - 첫 화면(`site/dist/index.html`)의 한글날 타일
  - 한글날 첫 화면
  - 세 학년의 ‘세종은 쉬운 글자를 만들었어요’ 장면
  - 영상 대체 모달
  - 세종 영상 포스터
- **문제:** 보는 사람 기준 관모 왼쪽 아래(약 x355, y270 부근)에서 꼰 끈이 관 둘레를 돌아 관자놀이 위 둥근 매듭으로 끝납니다. 익선관에는 없는 AI 창작 장식입니다.
- **작업**
  - 끈과 매듭만 지우고, 관 표면과 머리·귀 주변을 자연스럽게 이어 그립니다.
  - 얼굴, 위로 선 두 날개, 붉은 곤룡포와 둥근 금색 용보, 손, 배경은 **바꾸지 않습니다.**
  - 마스크는 대략 x300–420, y220–320에서 시작해 실제 끈 범위에 맞춰 조정합니다.

```text
Edit this image. Remove only the twisted cord and the round knot on the viewer's left side of the black ikseongwan royal cap.
Continue the smooth black lacquered cap surface and the hair and ear naturally where the cord was.
Keep everything else exactly the same: the face and expression, the two rear wings of the cap that point UPWARD,
the red gonryongpo robe with round gold dragon badges, the hand, the lighting and the ivory background.
Do not add any ornament, tassel, string, jewel, text or logo.
```

- **검수 체크리스트**
  - [ ] 끈·술·매듭이 전혀 없다.
  - [ ] 날개가 위로 선 익선관이 유지된다.
  - [ ] 얼굴·손에 변화나 왜곡이 없다.
  - [ ] 1672×941이다.
- **교체 후**
  - `knowledge/한글날-조선시각고증-검수.md`의 ‘미해결’ 항목을 해결로 옮깁니다.
  - 첫 화면 타일도 확인합니다.

### 2-2. `sejong-purpose-kling.mp4` — 세종 상징 영상 다시 만들기

- **쓰이는 곳:** 세 학년 ‘세종의 이야기’ 둘째 화면입니다. 포스터 `hero-sejong.png` 위에서 5초 무음 자동 재생됩니다. **2026-09-28부터 고증 문제로 연결을 끊고 정지 그림만 보여 줍니다.**
- **혼동 주의:** 60초 도입 다큐(10–20초)의 세종은 앞모습이고 **익선관이 맞습니다**. 날개가 위로 서 있고 가슴·양어깨에 용보가 있으며, 문제는 끈·매듭뿐입니다(2-7). 사모 문제가 있는 것은 **이 5초짜리 뒷모습 영상**입니다. 비교할 프레임은 이 영상 0.3초와 다큐 12초입니다.
- **문제 (0.1–4.9초 전체)**
  - 관모 날개가 좌우로 수평하게 뻗어 있습니다. 관원의 사모 모양입니다.
  - 등에 용보가 없습니다.
  - 어깨 솔기가 뿔처럼 솟았습니다.
  - 포스터(날개가 위)와 모자 모양이 달라서, 재생이 시작되면 모자가 바뀌는 것이 보입니다.
- **원래 연출 의도:** [영상제작-계획](한글날/영상제작-계획.md)에 따라, 얼굴이 드러나지 않는 **왕의 뒷모습 또는 비스듬한 뒷모습**과 **빈 종이**로 창제 목적을 상징합니다. 종이에는 글자를 만들지 않습니다.
- **권장 순서**
  1. 아래 스틸 프롬프트로 첫 프레임을 먼저 만들고, 관모·용보를 검수합니다.
  2. 그 스틸을 시작 프레임으로 Kling v3.0 Pro 이미지→영상을 만듭니다(16:9, 5초, 무음). 이전 작업도 Higgsfield의 Kling v3.0을 썼습니다.
  3. 1280×720, 24fps H.264로 내보냅니다.

```text
[Keyframe still, 16:9]
An imagined educational scene of King Sejong of Korea (Joseon, 1440s), NOT a claim to recover his face.
Three-quarter back view of a dignified Joseon king seated at a low wooden Korean writing desk (gyeongsang),
looking down at a sheet of plain blank hanji paper with a brush resting beside an inkstone.
He wears a red gonryongpo royal robe with ROUND gold dragon badges on the back and both shoulders,
and a black ikseongwan royal cap whose two rear wings rise UPWARD behind the cap
(NOT the broad horizontal sideways wings of an official's samo).
Simple early-Joseon room: paper-covered lattice doors (changhoji) with soft daylight, plain wooden floor, no decoration.
Calm, restrained, warm cream and muted red palette, semi-realistic editorial painting style.
No readable text, no characters on the paper, no Chinese palace, no dragon throne, no screens with paintings,
no Ming/Qing costume, no tassels or jewels on the cap, no logo, no watermark.
```

```text
[Image-to-video motion, 5 s]
Very slow gentle push-in. The king remains seated and still, slightly lowering his head toward the blank paper as if thinking,
then resting his hand near the brush without writing. Soft daylight flickers slightly through the lattice door.
Keep the cap wings pointing upward in every frame, keep the dragon badges round and stable, no text appears on the paper,
no new people, no camera cut.
```

- **검수 체크리스트 (0, 1, 2, 3, 4초와 끝 프레임)**
  - [ ] 모든 프레임에서 익선관 날개가 위로 향한다.
  - [ ] 등과 양어깨에 둥근 용보가 있다.
  - [ ] 종이는 백지다.
  - [ ] 중국풍 장식이 없다.
  - [ ] 손가락과 옷이 왜곡되지 않았다.
  - [ ] 포스터에서 영상으로 넘어갈 때 모자·색이 어색하게 바뀌지 않는다.
- **교체 후**
  - `site/dist/hangeul-presenter.js`의 `clip` 계산식에서 ‘세종의 이야기’(index 2) 둘째 beat + `hero-sejong` → `sejong-purpose-kling.mp4` 연결을 되살립니다.
  - `site/verify-presenter.mjs`에서 이 영상을 ‘쓰지 않음’으로 바꾼 검사를 ‘씀 + `poster="assets/hero-sejong.png"`’로 되돌립니다.
  - `docs/한글날/영상제작-계획.md`와 `knowledge/한글날-조선시각고증-검수.md`에 새 작업 기록과 검수 결과를 남깁니다.

### 2-3. 60초 다큐 50–55초 라벨 — 생성 없이 덮어씌우기

- **파일:** `site/dist/videos/hangeul-documentary-kling-60s.mp4`
- **문제**
  - 50–55초 왼쪽 위 라벨 칩 ‘현대 한국 교실 · 상상 영상’의 마지막 ‘상’이 칩 밖으로 넘칩니다.
  - 장면은 도서관인데 라벨은 ‘교실’입니다.
- **원래 그래픽 위치** (`site/motion/documentary/draw_graphics.py` 72–73행, 1280×720 좌표를 1.5배로 확대한 값)

  | 요소 | 원본 값 | 1920×1080 기준 |
  |---|---|---|
  | 칩 | `rect(62,61,200,33)`, #0b2521 불투명도 190/255, 모서리 5 | x93, y91.5, 폭 300, 높이 49.5 |
  | 글자 | `(74,85)`, 맑은 고딕 17px, #f1e6ce | x111, 기준선 y127.5, 25.5px |

  자막 그래픽 전체는 50.0초부터 0.45초 동안 서서히 나타납니다.
- **방법**
  1. `draw_graphics.py` 73행의 clip 7 라벨을 `'현대 한국 도서관 · 상상 영상'`으로 고치고, 칩 폭을 `font.measureText(글자)+24`로 계산하게 합니다. 다음에 다큐 전체를 다시 만들 때도 맞도록 하기 위해서입니다.
  2. 이번 교체에는 라벨만 담은 1920×1080 투명 PNG(`label-fix.png`)를 Pillow로 만듭니다.
     - 기존 칩과 넘친 글자를 **완전히 가리도록** 칩을 넓게 잡습니다. 대략 x88–x470, y86–y146, 같은 색 #0b2521, 불투명도 235 이상, 모서리 7.5px입니다.
     - 그 위에 새 글자를 맑은 고딕(`C:\Windows\Fonts\malgun.ttf`) 25.5px, #f1e6ce로 씁니다.
  3. ffmpeg로 50–55초에만 얹습니다. 원본과 똑같이 0.45초 페이드인을 줍니다.

```bash
ffmpeg -i site/dist/videos/hangeul-documentary-kling-60s.mp4 -loop 1 -t 5 -i label-fix.png -filter_complex "[1:v]format=rgba,fade=in:st=0:d=0.45:alpha=1,setpts=PTS+50/TB[l];[0:v][l]overlay=0:0:enable='between(t,50,55)'[v]" -map "[v]" -map 0:a -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -r 24 -c:a copy -movflags +faststart documentary-fixed.mp4
```

  4. 50.2초, 51초, 54.9초, 55.1초 프레임을 뽑아 확인합니다. 예: `ffmpeg -ss 51 -i documentary-fixed.mp4 -frames:v 1 f51.png`
     - 옛 글자가 비쳐 보이지 않아야 합니다.
     - 55초 이후에는 라벨이 없어야 합니다.
  5. 원본을 보관한 뒤 교체합니다. `site/dist/hangeul-presenter.js`에서 이 영상 주소의 캐시 무효화 값 `?v=bgm1`을 `?v=label2`로 바꿉니다. 전자칠판 브라우저가 옛 파일을 캐시하고 있을 수 있기 때문입니다.
  6. `node site/verify-documentary-audio.mjs`와 `node site/verify-presenter.mjs`가 통과하는지 확인합니다.
  7. 교사 대본 `docs/한글날/도입-다큐-교사대본.md`와 `knowledge/한글날-도입다큐-최종내용검증.md`의 해당 줄을 ‘도서관’으로 맞춥니다.

### 2-4. `gaecheon-community.png` — 청동기 마을 다시 만들기

- **쓰이는 곳:** `grep -rn "gaecheon-community" site/dist templates`로 최종 확인합니다.
  - 개천절 ‘고조선의 시작’
  - 1–2학년 ‘단군왕검 이야기’
  - 5–6학년 학년 카드
  - 퀴즈 이미지
  - 태블릿 이야기 순서 카드 ‘단군왕검과 고조선’
  - 학습지 그림
- **문제**
  - 사람 키 높이 흙벽에 문이 달린 지상 초가입니다. 교과서의 청동기 시대 **반지하 움집**과 다릅니다.
  - 밭의 넓은 잎 작물이 호박잎처럼 보입니다.

```text
Educational topic: Gaecheonjeol lesson for Korean elementary students (Bronze Age / Gojoseon period, Korean peninsula).
Image type: reconstruction illustration based on archaeological textbook knowledge, not a specific excavation site.
Scene: a small Bronze Age farming village on a gentle Korean hillside at morning.
Semi-subterranean pit houses (umjip): shallow pits with low thatched or reed roofs that come down almost to the ground,
a sloped entrance, a little smoke from one roof; a simple wooden fence around the village.
Fields of millet, foxtail millet and beans (thin grass-like leaves and small grain heads, NOT broad pumpkin leaves).
Villagers in plain undyed hemp clothing harvesting grain heads with semi-lunar stone knives (bandal-dolkal);
plain undecorated earthenware pots (mumun pottery) near a house.
Soft low Korean ridgelines in the distance. Semi-realistic painted style, warm natural light, calm everyday mood.
No iron tools, no roof tiles, no plank or clay walls standing at human height, no fortress walls, no palace,
no Chinese or Japanese architecture, no weapons being used, no text, no logo, no watermark.
```

- **검수 체크리스트**
  - [ ] 집이 반지하 움집(낮은 지붕이 땅 가까이)이다.
  - [ ] 작물이 조·기장·콩 계열로 보인다.
  - [ ] 철기·기와·지상 흙벽이 없다.
  - [ ] 인물 손·얼굴이 정상이다.
  - [ ] 산세가 완만한 한국 지형이다.
- **교체 후**
  - `site/dist/gaecheon-data.js`의 ‘고조선의 시작’ 노트에서 “그림 속 집은 … 지상 가옥으로 … 움집과 다릅니다. 집 모양을 근거로 쓰지 않습니다.” 문장을 지웁니다.
  - 학습지를 다시 만듭니다: `python templates/gaecheon-worksheets.py`

### 2-5. `gaecheon-dolmen.png` — 탁자식 고인돌 다시 만들기

- **쓰이는 곳:** 5–6학년 ‘유물이 알려 주는 것’ 장면(고인돌·비파형 동검)
- **문제:** 앞 받침돌 두 개가 위로 갈수록 뾰족한 쐐기형이고, 덮개돌이 그 뾰족한 끝에 얹혀 있습니다. 탁자식 고인돌의 **판석형 굄돌**과 다릅니다. 사진처럼 보여서 틀린 형태가 기억에 남을 수 있습니다.

```text
Educational reconstruction of a Korean table-type (northern-type) dolmen of the Bronze Age, like the Ganghwa Bugeun-ri dolmen.
Two large flat rectangular stone slabs stand upright and parallel as supports, forming a chamber,
and one huge flat, roughly rectangular capstone rests level on top of them, like a table.
Set on a grassy low hill with soft Korean ridgelines and a clear sky; no people or only a tiny figure far away for scale.
Photographic-looking but natural light, no dramatic effects.
NOT wedge-shaped or pointed supports, not a Stonehenge-like circle, not a go-board (southern) type,
no modern fences, signs, text, logo or watermark.
```

- **검수 체크리스트**
  - [ ] 굄돌이 넓적한 판돌이고 수직으로 서 있다.
  - [ ] 덮개돌이 수평으로 얹혀 있다.
  - [ ] 서양 거석 느낌이 없다.
  - [ ] 표지판·글자가 없다.
- **교체 후:** `gaecheon-data.js`의 해당 노트에서 “그림 속 받침돌(쐐기형)은 … 모양이 다르므로” 문장을 고칩니다. 실제 사진과 비교하는 안내는 남겨도 좋습니다.

### 2-6. `gaecheon-tree.png` — 신단수 장면을 한국 산세로

- **쓰이는 곳**
  - 첫 화면(`index.html`)의 개천절 타일
  - 개천절 첫 화면 학년 카드
  - ‘개천’의 뜻, ‘신단수 아래로’
  - 퀴즈, 태블릿 이야기 카드
  - 1–2학년 학습지 이야기 그림
- **문제:** 절벽에 붙은 분재형 소나무, 바늘 같은 봉우리, 운해, 빛내림이 합쳐져 중국 황산 사진·산수화의 전형 구도로 읽힙니다.

```text
Imagined illustration for the Dangun founding myth (Gaecheonjeol lesson), clearly a mythic imagination, not a real place.
Early morning on a broad Korean mountain ridge: gentle rolling ridgelines of the Baekdudaegan type,
rounded granite tops are fine, layered soft blue-green mountains fading into light haze.
On the open ridge stands one very large, old, wide-spreading deciduous tree with a thick trunk and broad canopy
(a sacred tree; do not specify the species), with soft dawn light behind it.
Warm, calm, awe-inspiring but gentle mood; painted semi-realistic style.
Avoid: cliff-clinging bonsai-like pine trees, needle-shaped karst or Huangshan-style peaks, dramatic sea of clouds,
temples, pagodas, altars, flags, people, text, logo, watermark.
```

- **검수 체크리스트**
  - [ ] 황산식 요소(분재 소나무·바늘 봉우리·운해)가 없다.
  - [ ] 한국의 완만한 능선이다.
  - [ ] 인물·제단·건축물·글자가 없다.

### 2-7. 다큐 10–20초 세종 컷 두 개 (관모 끈)

- **구간과 파일:** 12장면×5초 구성이고 편집 소스는 `site/motion/documentary/edit.jsx`입니다.

  | 구간 | 원본 컷 | 자막 그래픽 |
  |---|---|---|
  | 10–15초 | clip02 | overlay03 |
  | 15–20초 | clip03 | overlay04 |

- **문제:** 관모 모양(날개가 위로 선 익선관)과 곤룡포·용보는 맞습니다. 다만 관모 앞을 비스듬히 가로지르는 꼰 끈과, 보는 사람 기준 왼쪽의 둥근 매듭이 AI가 덧붙인 장식입니다. 12.0초와 18.2초에 뚜렷합니다. **끈과 매듭만 없애면 됩니다.**
- **방법**
  1. 2-1에서 고친 `hero-sejong.png`와 같은 차림으로 스틸 2장을 만듭니다.
     - 10–15초: 창호 너머를 바라보며 백성을 생각함
     - 15–20초: 빈 한지 앞에서 붓을 들고 생각함. 종이에 글자 없음.
  2. Kling 이미지→영상으로 5초씩 만듭니다. 2-2의 동작 프롬프트 규칙을 따릅니다.
  3. 원본 컷과 그래픽은 git에 없습니다(`output/`, `.gitignore`). 자막 그래픽은 `draw_graphics.py`로 다시 그립니다. `skia-python`이 필요하고 결과는 `output/hangeul/documentary/graphics/`에 생깁니다.
  4. ffmpeg로 10–20초 구간에 새 컷(1920×1080 cover)과 overlay03·04를 얹습니다. overlay는 각 장면 시작에서 0.45초 페이드인입니다. 배경음악은 `-c:a copy`로 그대로 둡니다.
- **검수:** 2-2 체크리스트에 더해 구간 경계(10.0초·15.0초·20.0초)에서 끊김이 없어야 합니다.

### 2-8. 다큐 25–35초 학자 컷 두 개 (복식·같은 컷)

- **구간과 파일**

  | 구간 | 장면 | 원본 컷 | 자막 그래픽 |
  |---|---|---|---|
  | 25–30초 | 1445 · 새 글자로 지은 노래 『용비어천가』 | clip04 | overlay06 |
  | 30–35초 | 원리와 쓰임을 설명하다 | clip05 | overlay07 |

- **문제**
  - 두 사람 모두 상투와 망건만 있고, 탕건·사모 없이 도포풍 평상복을 입었습니다. 궁중 관원이 근무하는 장면으로 읽히지 않습니다.
  - 25–30초와 30–35초가 첫 프레임부터 같은 컷이라 두 사건이 구별되지 않습니다.
- **고증 기준 (세종 대 문관의 상복)**
  - 검은 사모(날개가 좌우 수평인 관원 모자), 단령, 품대
  - **흉배(가슴의 네모난 수)는 1454년(단종 2년)에 도입된 제도이므로 넣지 않습니다.**
- **두 컷은 서로 다른 구도로 만듭니다.**
  - 25–30초: 관원 2–3명이 낮은 상 앞에서 빈 종이를 펼쳐 놓고 노래 가사를 다듬는 모습. 종이는 백지 또는 판독 불가 질감.
  - 30–35초: 관원 한 명이 자기 목과 입을 가리키며 소리 내는 모습을 보이고, 다른 관원이 고개를 끄덕이며 지켜봄. 발음 기관을 본떴다는 원리를 글자 없이 암시합니다.
- **자막 정확성 (선택):** overlay07 문구 ‘집현전 학자들은 새 글자의 / 원리와 쓰임을 설명했어요.’를 ‘학자들은 세종의 명을 받아 새 글자의 / 원리와 쓰임을 설명했어요.’로 고칠 수 있습니다. 해례를 지은 8명 중 강희안은 집현전 소속이 아니었습니다. 고치면 `draw_graphics.py` 44행, `edit.jsx`, 교사 대본을 함께 수정합니다.

```text
Early Joseon court officials of the 1440s in an imagined educational scene (Korea).
Each official wears a black samo cap with two flat side wings, a plain dark-blue or red dallyeong round-collared robe
WITHOUT any square rank badge (no hyungbae), and a belt; neat topknot under the cap.
[Clip04] Two or three officials kneel at a low wooden table, reviewing sheets of blank paper as if polishing song lyrics,
calm focused mood, paper-covered lattice doors, soft daylight.
[Clip05] One official gently touches his own throat and lips while speaking a sound, another official watches and nods,
a blank sheet lies between them, close-medium shot, different angle from the first clip.
No readable text or pseudo-characters on paper, no Chinese palace, no Ming/Qing costume, no square badges, no logo, no watermark.
```

- **방법:** 2-7과 같습니다. 25–35초 구간에 새 컷과 overlay06·07을 얹고 음악은 그대로 둡니다.

### 2-9. 선택 작업

| 대상 | 내용 |
|---|---|
| `gaecheon-summit-dawn.png` | 표지에서 빠져 지금은 쓰이지 않을 수 있습니다(grep으로 확인). 다시 쓰려면 2-6과 같은 기준으로 황산식 요소를 빼고 재생성합니다. |
| `gaecheon-bear-tiger.png` | 동굴 주변 바위의 격자형 업스케일 무늬(약 x900–1200, y220–420)만 부분 보정합니다. 곰은 반달가슴곰(흰 V무늬), 호랑이는 차분한 표정을 유지합니다. |
| `writing-desk.png` | 선장본이 4침입니다(조선 서책은 대체로 5침). [visual-audit](../knowledge/visual-audit.md)의 취지대로 구멍 수만으로 고칠 필요는 없습니다. 새로 만들 때 5침으로 맞춥니다. |
| `school-sign.png` | 인물이 저학년처럼 보여 5–6학년 화면에는 어색할 수 있습니다. 고학년 버전을 **새 파일**로 만들면 `site/dist/presenter-data.js`의 해당 장면과 `site/verify-presenter.mjs`의 `approvedAssets`도 함께 고칩니다. |
| 현대 학생 그림 | 지금 8종은 모두 비장애 한국 학생입니다. 새로 만들 때 휠체어 사용 학생, 다문화 가정 학생 등 교실의 다양성을 자연스럽게 담는 것을 고려합니다. |

---

## 3. 교체를 마친 뒤 확인

- [ ] 교체한 파일마다 원본을 `drafts/replaced/2026-09-28/`에 보관했다.
- [ ] 이미지 1672×941, 영상 규격이 원본과 같다(`ffprobe`로 확인).
- [ ] 검증 스크립트 4개가 통과했다.
- [ ] `http://localhost:4198/`에서 아래 화면을 직접 봤다.
  - 한글날 첫 화면 → 세종의 이야기 → 도입 다큐 50–55초
  - 개천절 세 학년 → 신단수·고조선·유물 장면 → 태블릿 이야기 순서
- [ ] 교사 노트의 임시 한계 문구(2-4, 2-5)를 정리했다.
- [ ] 학습지를 다시 만들었다: `python templates/gaecheon-worksheets.py`
- [ ] 생성 기록과 검수 결과를 knowledge 문서에 남겼다.
- [ ] 커밋 메시지에 교체 파일과 고증 근거를 적었다. 예: `개천절 청동기 마을·고인돌 그림 교체: 반지하 움집·판석형 굄돌로 고증 수정`
