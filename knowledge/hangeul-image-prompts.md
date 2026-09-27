# 한글날 새 이미지 생성·검수 기록

- 생성일: 2026-09-26
- 스킬: imagegen (`C:/Users/닭사랑농장/.codex/skills/.system/imagegen/SKILL.md`)
- 생성 도구: 내장 `image_gen.imagegen`, 새 이미지별 1회씩 총 6회. CLI/API 사용 없음.
- 모든 결과 원본은 Codex 기본 `generated_images` 폴더에 보존했고, 프로젝트 `public/assets/hangeul/`에 복사했다.
- 실제 크기: 6개 모두 1672×941 PNG. 요청 프롬프트의 16:9 가로 구도를 따르며, 픽셀 크기는 도구가 결정했다.
- 검수: 복사한 6개를 모두 `view_image`로 확인했다. 오류·제약은 아래 및 `manifest.json`에 기록한다.
- 이미지가 사진처럼 보이더라도 **AI 생성 창작물**이다. 역사적 증거·실물자료 사진으로 소개하지 않는다.
- 이번 작업에서는 앱 코드·Site를 수정하지 않았고 기존 클레이 이미지도 수정하지 않았다.

## 저장·검수 결과

| 파일 | 실제 관찰 | 사용 성격과 유의점 |
|---|---|---|
| `hero-sejong.png` | 붉은 왕복·가슴과 어깨의 둥근 용보·위로 향한 관모 날개. 궁궐, 책, 가짜 문자, 도사 소품 없음. | 사용 시 창작 라벨 필수; 정밀 복식·얼굴 복원 아님 |
| `village-message.png` | 남녀 2명의 상반신과 손, 접힌 빈 종이, 초가·울타리·옹기·낮은 산. 중국 궁궐·도사·무협 소품이나 읽히는 문구는 없음. | 역사 고증 재검수 필요; 특정 15세기 생활 재현으로 사용 금지 |
| `writing-desk.png` | 빈 종이·붓·먹·벼루·책 가장자리의 실 제본. 서양식 중앙제본 펼친 책 없음. 생성 도구가 좌측에 꽃병과 작은 쟁반을 추가함. | 상징 정물로 사용; 실물 유물 사진 또는 세종의 책상으로 사용 금지 |
| `classroom-note.png` | 학생 두 명, 빈 쪽지, 교실 책상·칠판·학용품. 창밖에 서울 남산타워를 연상시키는 구조물이 생성됨. 쪽지에 문구 없음. | 현대 소통 상황 삽화로 사용 가능; 실제 학생 사진 아님 |
| `school-sign.png` | 오른쪽 대부분에 빈 흰 안내판, 왼쪽에 두 학생, 현대 복도·교실문. 안내판 내부는 문자·그림 없이 비어 있음. | 현대 안내문 활동 배경으로 사용 가능 |
| `library-together.png` | 학생 세 명이 펼친 책을 함께 읽음. 한 학생은 안경을 쓰고 지면을 가리킴. 글줄처럼 보이는 흐린 질감이 책과 일부 책등에 있으나 수업에서 판독할 문구는 아님. | 협력 읽기 상황 삽화로 사용 가능; 지면 해독 자료로 사용 금지 |

## 고증 검수의 한계

**세종 그림은 역사 자료를 참고한 창작 인물**, 쓰기 도구는 시대를 특정하지 않은 상징 정물이다. 장면 전체를 정밀 역사 복원으로 승인하지 않았다. 세종 얼굴·용보·관모의 세부는 실재를 확정하지 않으며, 학생 표시 문구는 ‘1446년 무렵 세종을 상상하여 표현한 그림’이다.

마을 그림은 조선 전기를 의도했으나 생성 결과의 저고리 기장·머리모양 등은 해당 시대와 대조하지 못했다. **특정 15세기 생활·복식의 정확한 재현이 필요한 본문에는 사용을 보류한다.** 넓은 의미의 옛 소통 상황으로 쓰더라도 ‘상상한 장면’ 라벨이 필요하다. 한글을 읽지 못하는 사람을 성별·차림으로 추정하지 않는다.

도서관 그림에는 책의 작은 글줄처럼 보이는 생성 질감이 있으므로 문자 판독·한글 형태 교육 자료로 확대하지 않는다. 교실 쪽지와 학교 안내판은 비어 있으므로 정확한 한글은 앱에서 별도로 작성한다. 손·표정·현대 교실 구도는 육안으로 확인했으며, 이 확인이 전문 미술·역사 감수를 대신하지 않는다.

## 실행 프롬프트 및 원본 경로

### hero-sejong.png

```text
Use case: illustration-story. Asset type: a premium Korean elementary classroom educational webapp illustration, landscape 16:9 composition, 1536x864 preferred. Style: sophisticated semi-realistic editorial illustration with natural human proportions, finely painted tactile materials, gentle cinematic daylight, warm cream, subdued blue, earthy red, high craft and calm expressive faces. Not clay, not chibi, not toy figures. The image must feel specific to Korea where the described context establishes it. No readable text, no captions, no logo, no watermark, no random pseudo-writing or Chinese decorative text. Primary request: an imagined educational portrayal of King Sejong of Korea around 1446, NOT a claim to recover his actual face. Upper-body close portrait of a thoughtful dignified middle-aged Joseon king, restrained kind expression, in a red gonryongpo royal working robe with one round gold dragon badge at the chest and restrained round shoulder badges, and a simple black Korean ikseongwan royal cap whose two folded rear wings point UPWARD, not broad horizontal sideways wings. Use a credible Korean Joseon silhouette and understated clothing details. Keep fingers naturally proportioned. Frame head, torso and one relaxed hand. No palace, no throne, no archway, no background architecture, no books, no writing, no scientific props. Warm soft ivory paper-like background with a quiet muted red wash and generous negative space to the right for app interface text added later. Avoid Chinese imperial crowns, Ming or Qing drama costuming, decorative fantasy hats, tassels, Daoist sage styling, martial arts and fantasy motifs. Do not put any flag in the historical scene.
```

원본 저장 안내:

```text
Generated images are saved to C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98 as C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98\exec-322307ac-b1ca-4bdc-95e5-3427dbef9289.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.
```

### village-message.png

```text
Use case: illustration-story. Asset type: a premium Korean elementary classroom educational webapp illustration, landscape 16:9 composition, 1536x864 preferred. Style: sophisticated semi-realistic editorial illustration with natural human proportions, finely painted tactile materials, gentle cinematic daylight, warm cream, subdued blue, earthy red, high craft and calm expressive faces. Not clay, not chibi, not toy figures. The image must feel specific to Korea where the described context establishes it. No readable text, no captions, no logo, no watermark, no random pseudo-writing or Chinese decorative text. Primary request: an imagined communication scene in an early Joseon Korean village, education illustration about sharing information before easy access to writing. Medium close scene of two ordinary adult Korean villagers talking face to face, one holding out an unmarked folded sheet of Korean hanji while the other listens thoughtfully; focus on expressive faces and natural hands. Understated plain off-white and muted brown Korean jeogori garments, simple collar and modest cloth ties, no luxurious ornament. A softly blurred modest Korean straw-thatched cottage far behind them, quiet green low hills, no detailed palace or tiled ceremonial structure. The composition must stay close enough that clothing cuts and historical architecture are not exaggerated as a precise reconstruction. No readable writing or signage. No Chinese palace, qipao, Hanfu drama costume, martial arts, Daoist sage, fantasy hat, elaborate sash or sculpted high mountain landscape. This is a respectful imagined historical scene, not a documentary photograph.
```

원본 저장 안내:

```text
Generated images are saved to C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98 as C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98\exec-672dfab0-cc9e-46cc-ad34-1037f009b886.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.
```

### writing-desk.png

```text
Use case: illustration-story. Asset type: a premium Korean elementary classroom educational webapp illustration, landscape 16:9 composition, 1536x864 preferred. Style: sophisticated semi-realistic editorial illustration with natural human proportions, finely painted tactile materials, gentle cinematic daylight, warm cream, subdued blue, earthy red, high craft and calm expressive faces. Not clay, not chibi, not toy figures. The image must feel specific to Korea where the described context establishes it. No readable text, no captions, no logo, no watermark, no random pseudo-writing or Chinese decorative text. Primary request: a quiet educational still life of traditional Korean writing materials. A simple low plain wooden work surface, a few off-white fibrous sheets of Korean hanji lying flat completely blank, one modest bamboo calligraphy brush resting horizontally, a simple dark rectangular inkstone with a little black ink and an undecorated ink stick. At the back a CLOSED slim Korean traditional thread-bound book with plain buff cover, visible side binding confined to one outside book edge. No opened central-spine book, no western leather binding, no gold-tooled covers, no carved dragon furniture, no symbols, no characters on any surface. Natural material textures and gentle sidelight. Cropped intimate still life, no room architecture. Plenty of uncluttered paper area. An educational symbolic arrangement rather than a claim of an identified historical artifact.
```

원본 저장 안내:

```text
Generated images are saved to C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98 as C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98\exec-b2a55cd4-b367-4083-a73b-2e50ff13edb1.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.
```

### classroom-note.png

```text
Use case: illustration-story. Asset type: a premium Korean elementary classroom educational webapp illustration, landscape 16:9 composition, 1536x864 preferred. Style: sophisticated semi-realistic editorial illustration with natural human proportions, finely painted tactile materials, gentle cinematic daylight, warm cream, subdued blue, earthy red, high craft and calm expressive faces. Not clay, not chibi, not toy figures. The image must feel specific to Korea where the described context establishes it. No readable text, no captions, no logo, no watermark, no random pseudo-writing or Chinese decorative text. Primary request: modern South Korean elementary classroom, two schoolchildren around age nine in everyday contemporary casual clothing, one kindly handing the other a small blank white message card while making warm eye contact and conversing. Respectful natural child proportions, clear healthy faces and believable hands. Softly lit wooden student desks, a window, muted school supplies in the background, all modern and unbranded. Card remains fully blank, visible and unobstructed so text can be added separately by an app. No stereotypical national costume, no readable writing on blackboard, books or walls. Focus on communication and kindness, not competition.
```

원본 저장 안내:

```text
Generated images are saved to C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98 as C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98\exec-49a2f605-e712-432d-9d15-274c80d91db1.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.
```

### school-sign.png

```text
Use case: illustration-story. Asset type: a premium Korean elementary classroom educational webapp illustration, landscape 16:9 composition, 1536x864 preferred. Style: sophisticated semi-realistic editorial illustration with natural human proportions, finely painted tactile materials, gentle cinematic daylight, warm cream, subdued blue, earthy red, high craft and calm expressive faces. Not clay, not chibi, not toy figures. The image must feel specific to Korea where the described context establishes it. No readable text, no captions, no logo, no watermark, no random pseudo-writing or Chinese decorative text. Primary request: modern South Korean elementary school hallway, two schoolchildren around age ten looking together at a large clean blank rectangular school information board on the wall. Compose the board nearly front-on, central and taking at least 45 percent of image width, with a smooth WHITE empty writing surface, no pins, no marks or pictograms inside it, so an app can overlay Hangul directions later. Children stand to one side and below the board, without obscuring its empty face, one child pointing toward it. Contemporary Korean school corridor with pale walls, wooden classroom door frames, soft daylight and modest indoor school shoes. A friendly purposeful moment. No lettering anywhere, no flags, no ornamental East Asian architecture or costume.
```

원본 저장 안내:

```text
Generated images are saved to C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98 as C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98\exec-262b9f20-38a7-486c-9025-360af5062f62.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.
```

### library-together.png

```text
Use case: illustration-story. Asset type: a premium Korean elementary classroom educational webapp illustration, landscape 16:9 composition, 1536x864 preferred. Style: sophisticated semi-realistic editorial illustration with natural human proportions, finely painted tactile materials, gentle cinematic daylight, warm cream, subdued blue, earthy red, high craft and calm expressive faces. Not clay, not chibi, not toy figures. The image must feel specific to Korea where the described context establishes it. No readable text, no captions, no logo, no watermark, no random pseudo-writing or Chinese decorative text. Primary request: modern South Korean elementary school library, three students around ages nine to eleven sitting together at a wooden table, reading a book and helping one another understand it. One student gently explains something by pointing to the open page, another listens with curiosity, and the third shares a supportive smile. Show each student as equally capable, no pity or ranking, natural expressions and credible hands. Contemporary casual clothing, one child with glasses, comfortable varied postures. Warm diffuse daylight, softly blurred low bookshelves and ordinary school library furnishings. All book covers plain, book pages shown at angles or with indistinct abstract light marks so no readable or fake lettering. Korean school context, no historical costume or decorative foreign motifs. Calm inspiring editorial illustration.
```

원본 저장 안내:

```text
Generated images are saved to C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98 as C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98\exec-9e7925b3-e43f-409f-9ef1-d2898a9e8e74.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.
```

## 추가 디자인 자산 — 한지 정물·평가 핸드벨

- 요청 범위: 첫 화면용 한지 정물과 평가 화면용 황금 핸드벨 각 1종.
- 도구: 내장 `image_gen.imagegen`, 각 1회 호출.
- 결과: **한지 정물 1종 생성·저장 완료 / 핸드벨 인증 오류로 실패**.
- 핸드벨 실패 원인: 도구가 HTTP 401 인증 오류를 반환했다. 민감한 인증 정보가 포함된 원문은 저장하지 않는다. 별도 CLI/API로 전환하거나 반복 호출하지 않았다.
- 기존 6종은 보존했다. 현재 저장된 한글날 PNG는 총 **7종**이다.
- 추가 성공 자산 실제 크기: 1672×941 PNG. 로컬 저장 후 `view_image`로 확인했다.

### hangul-garden.png 검수

짙은 녹색 배경에 종이 섬유 질감, 오른쪽 가장자리의 실 제본 책, 빈 봉투, 연필 2자루, 붓과 추상 종이 도형을 확인했다. 인물·궁궐·문자는 없다. 좌측 마른꽃과 금색 용기는 생성 도구가 추가한 장식이며 특정 한국 유물로 설명하지 않는다. 실물 촬영처럼 보이지만 **한지와 배움의 도구를 표현한 AI 창작 정물**이다. 현대 연필과 전통 도구가 함께 있어 특정 역사 시기의 실제 책상으로 소개할 수 없다.

```text
Use case: product-mockup. Asset type: a premium Korean Hangul learning webapp hero image, landscape 16:9 high-resolution composition, 1920x1080 preferred. Create an exquisitely crafted PHYSICAL PAPER ART still life photographed in a studio, not a 3D render, not toy clay. Theme: celebrating learning, written communication and the texture of Korean hanji, with no actual lettering. On a deep forest-green matte backdrop and low display surface arrange sculptural layers and folded sheets of off-white fibrous Korean hanji, one slim CLOSED traditional Korean side-thread-bound paper book with a plain cream cover and side binding clearly confined to its outer edge, a restrained bamboo brush, two elegant contemporary unbranded school pencils, a clean blank cream letter envelope and a few handmade abstract paper circles, rectangles and gently curving folded strips in warm cream, muted gold, sage and terracotta. Objects form a rich carefully balanced botanical-garden-like composition made entirely of paper and learning tools, with elegant negative space in the upper right for later UI text, no actual plants required. Warm grazing studio light shows the fibers and cut paper edges; deep beautiful green shadows, sophisticated museum gift-store editorial photography quality. Close visible craft, exceptional realistic detail and tactility. Modern symbolic composition, no claim to be a historical artifact. NO text, no numbers, no characters, no letter-shaped pieces, no Hangul or Chinese writing, no calligraphy, no logo, no watermark. No buildings, no people, no dragon motif, no palace ornament. Do not create an open central-spine book or Western leather-bound book.
```

원본 저장 안내:

```text
Generated images are saved to C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98 as C:\Users\닭사랑농장\.codex\generated_images\01a0db69-2b24-7aa1-a8c5-3b251d271a98\exec-18e0acf7-6159-4ca7-9543-f483496d228b.png by default.
If you need to use a generated image at another path, copy it and leave the original in place unless the user explicitly asks you to delete it.
The generated image is already displayed to the user. There is no need to render it in the final response as a Markdown image or file link.
```

### bell-celebration.png 미완료 기록

해당 파일은 생성되지 않았다. 앱에서 이 경로를 참조하지 않는다. 아래는 실패한 요청의 프롬프트이며 완성 자산의 프롬프트가 아니다.

```text
Use case: product-mockup. Asset type: a premium Korean classroom learning webapp final quiz celebration image, landscape 16:9 high-resolution composition, 1920x1080 preferred. Photograph a single beautiful golden brass SCHOOL HAND BELL as an exquisite contemporary editorial still life. The bell has a simple broad flared brass body, a small visible clapper inside, and a modest smooth dark walnut handle standing upright, proportions like a real handheld classroom bell, no gong, no Buddhist temple bell, no religious or royal ornament. Place it on a softly curved off-white Korean hanji paper sheet with tangible fibers, against a deep forest-green matte background. Warm side light and a restrained soft gold rim highlight reveal fine brushed metal grain and credible reflections. A few small elegant ivory, muted gold and sage paper confetti pieces drift or rest lightly around it, refined celebration of learning rather than a noisy party. Bell sits to the left of center with generous deep green empty space to the right for app text added later. Beautiful grounded shadow, coherent perspective, premium photographic craft, not clay, not a cartoon, not a glossy 3D render. No text, no numerals, no labels, no calligraphy, no Chinese characters, no logo, no watermark, no dragons, no temple ornament, no buildings, no people. The image is an educational symbol rather than an actual archival artifact.
```



