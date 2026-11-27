'use strict';

(() => {
  const { sources, visuals, places, order, claims, grades, era, remembrance, videos } = window.SamilData;
  const app = document.getElementById('samil-app');
  const dialog = document.getElementById('samil-dialog');
  const answers = new Map();
  const activities = new Map();
  const quizzes = new Map();
  const openNotes = new Set();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let route;
  let revealed = false;
  let dialogTrigger;
  let narrationVolume = 0.26;
  const remembranceSlides = [{
    type: 'memory', title: '열 사람의 이름을 기억하는 시간', visual: 'crowd',
    note: '약 10분을 잡습니다. 이름을 읽고 다음 장면으로 가기 전 한 호흡 쉬어 주세요.',
    record: {
      date: '기억의 시간 · 약 10분',
      paragraphs: ['이제 시간을 되돌려 광복을 보지 못한 열 사람을 만납니다.', '먼저 안중근이 가족에게 남긴 글을 읽고, 어머니 조마리아에게는 어떤 기록이 남았는지 살펴봅니다.'],
      links: [],
    },
  }, ...remembrance.map(person => ({
    type: 'memory', title: person.title ?? person.name, visual: person.visual,
    note: `장면에 약 ${Math.round(person.minutes * 60)}초를 잡습니다. ${person.cues
      ? '낭독 시작을 누르고 배경음악 위로 화면의 문장을 교사가 천천히 읽어 주세요.'
      : '이름과 한 가지 행동을 천천히 읽은 뒤 잠시 기다려 주세요.'}`,
    record: { ...person, music: !!person.cues },
  }))];

  function readRoute() {
    const [view, grade, target] = location.hash.slice(1).split('/');
    if (!Object.hasOwn(grades, grade)) return { view: 'home' };
    if (view === 'student') return { view, grade, target: target === 'quiz' ? 'quiz' : 'activity' };
    if (view === 'lesson') {
      const index = /^\d+$/.test(target ?? '') ? Number(target) : 0;
      if (index < lessonSlides(grade).length) return { view, grade, index };
    }
    return { view: 'home' };
  }

  function lessonSlides(grade) {
    const g = grades[grade];
    return [...g.slides, ...g.quiz, ...remembranceSlides, {
      type: 'recap', title: '어떤 이름을 기억할까요?',
      prompt: '오늘 기억하고 싶은 이름 하나와 그 사람이 했던 일 하나를 한 문장으로 남겨요.',
      explain: '“나는 이선경을 기억하고 싶어요. 감옥에 갇힌 사람들의 가족을 도왔어요.”',
      note: `인물의 이름과 기록에서 확인한 행동을 듣습니다. 본편 확인이 필요하면 다음 발문을 덧붙이세요. ${g.exit}`, visual: 'crowd',
    }];
  }

  const lessonHref = (grade, index = 0) => `#lesson/${grade}/${index}`;
  const studentHref = (grade, target) => `#student/${grade}/${target}`;
  const pdfHref = (grade, teacher = false) => `worksheets/samil-${grade}-${teacher ? 'teacher' : 'student'}.pdf`;
  const photo = (key, className = '') => {
    const visual = visuals[key];
    return `<img class="${className}" src="assets/${visual.file}" alt="${esc(visual.alt)}">`;
  };
  const assetLink = (key, text) => {
    const source = sources[key];
    return `<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(text ?? source.title)} ↗</a>`;
  };
  function sourceFigure(key, modifier = '') {
    const { source } = visuals[key];
    return `<figure class="s-figure ${modifier}">${photo(key)}
      <figcaption class="s-figure-label">
        <div>${assetLink(source)} <span>${esc(sources[source].credit)}</span>${sources[source].license
          ? ` <a href="${esc(sources[source].license)}" target="_blank" rel="noopener">라이선스 ↗</a>` : ''}</div>
        <button class="s-button s-enlarge" data-action="artifact" data-id="${key}" type="button"
          aria-label="${esc(sources[source].title)} 확대">확대 <span aria-hidden="true">+</span></button>
      </figcaption></figure>`;
  }

  function openDialog(title, body, trigger, kind = '') {
    dialogTrigger = trigger || document.activeElement;
    dialog.dataset.kind = kind;
    dialog.innerHTML = `<div class="s-dialog-head"><h2 id="samil-dialog-title">${esc(title)}</h2>
      <button type="button" class="s-button" data-action="close">닫기</button></div>${body}`;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('[data-action="close"]').focus();
  }

  function showArtifact(button) {
    const { id } = button.dataset;
    const source = sources[visuals[id].source];
    openDialog(source.title, `<div class="s-artifact-tools">${assetLink(visuals[id].source, '출처 열기')}
        <button class="s-button" type="button" data-action="zoom" aria-pressed="false">원본 크기</button></div>
      <div class="s-artifact-sheet" tabindex="0" role="region" aria-label="확대 사료">${photo(id)}</div>
      <p class="s-artifact-credit">${esc(source.credit)}</p>`, button, 'artifact');
  }

  function showVideo(button) {
    const clip = videos[button.dataset.id];
    const start = clip.start ?? 0;
    openDialog(clip.title, `<p>${esc(clip.publisher)} · ${esc(clip.description)}</p>
      <iframe class="s-video" src="https://www.youtube-nocookie.com/embed/${clip.id}?start=${start}&amp;autoplay=1"
        title="${esc(clip.title)}" referrerpolicy="strict-origin-when-cross-origin"
        allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      <a class="s-button" href="https://www.youtube.com/watch?v=${clip.id}&amp;t=${start}s" target="_blank" rel="noopener">유튜브에서 열기 ↗</a>`,
    button, 'video');
  }

  function home() {
    app.innerHTML = `<header class="s-top s-home-top"><a class="s-brand" href="index.html">‹ 오늘의 국경일</a>
        <nav aria-label="3·1절 수업 메뉴"><a href="#samil-grades">학년 선택</a><a href="#samil-worksheets">인쇄 자료</a></nav></header>
      <main id="samil-content" class="s-home">
        <section class="s-hero" aria-labelledby="samil-title">
          <figure class="s-hero-photo">${photo('crowd')}
            <figcaption>${assetLink('photograph', '1919년 3월 서울 만세 시위')} <span>한국통신국 간행물</span></figcaption>
          </figure>
          <div class="s-hero-copy">
            <time class="s-hero-date" datetime="1919-03-01">1919년 3월 1일</time>
            <h1 id="samil-title" tabindex="-1"><span>함께</span> <span>외친 날</span></h1>
            <p>만세는 왜 시작됐을까요?<br class="s-home-break"> 사진과 선언서로 그날에 이른 길을 따라갑니다.</p>
          </div>
        </section>
        <section class="s-grade-section" id="samil-grades" aria-labelledby="samil-grade-heading">
          <h2 id="samil-grade-heading">학년을 고르세요</h2>
          <div class="s-grade-grid">${Object.entries(grades).map(([id, g]) =>
            `<a class="s-grade" href="${lessonHref(id)}">
              <span class="s-grade-level">${g.label}</span>
              <div><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p></div>
              <span class="s-grade-start" aria-hidden="true">→</span></a>`
          ).join('')}</div>
        </section>
        <section class="s-grade-section s-print" id="samil-worksheets" aria-labelledby="samil-print-heading">
          <h2 id="samil-print-heading">학습지</h2>
          <div class="s-print-grid">${Object.entries(grades).map(([id, g]) =>
            `<div><strong>${g.label}</strong><a href="${pdfHref(id)}" target="_blank" rel="noopener">학생용 PDF</a>
              <a href="${pdfHref(id, true)}" target="_blank" rel="noopener">교사용 PDF</a></div>`
          ).join('')}</div>
        </section>
      </main>`;
  }

  function timeline() {
    return `<ol class="s-timeline" aria-label="독립운동 연표">${era.map(item => `<li>
      <time datetime="${item.iso}">${esc(item.date)}</time><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span>
    </li>`).join('')}</ol>`;
  }

  function archivePanel(slide, question) {
    const { date, quotation, quoteLabel, paragraphs, context, links, name, cues } = slide.record;
    const visual = visuals[slide.visual];
    return `<article class="s-archive-panel${visual ? ' s-archive-illustrated' : ''}${quotation ? ' s-archive-with-quote' : ''}">
      <div class="s-archive-reading">
        <p class="s-archive-date">${esc(date)}</p>
        ${name && name !== slide.title ? `<p class="s-archive-person">${esc(name)}</p>` : ''}
        <h1 id="samil-title" tabindex="-1">${esc(slide.title)}</h1>
        <div data-reading-copy>
          ${quotation ? `<blockquote>“${esc(quotation)}”<cite>${esc(quoteLabel)}</cite></blockquote>` : ''}
          ${paragraphs.map(paragraph => `<p class="s-archive-line">${esc(paragraph)}</p>`).join('')}
          ${context ? `<p class="s-archive-context">${esc(context)}</p>` : ''}
        </div>
        ${cues ? `<div class="s-reading-cue" data-reading-cue hidden>
          <p class="s-reading-speaker"></p><p class="s-reading-line"></p><p class="s-reading-position"></p></div>` : ''}
        ${links.length ? `<ul class="s-archive-sources" aria-label="내용 출처">${links.map(key => `<li>${assetLink(key)}</li>`).join('')}</ul>` : ''}
      </div>
      ${visual ? `<div class="s-archive-reproduction">${sourceFigure(slide.visual, 's-archive-photo')}</div>` : ''}
      ${question ? `<aside class="s-archive-question" aria-label="교실 토의">${question}</aside>` : ''}
    </article>`;
  }

  function scoreControls() {
    return `<div class="s-score" role="group" aria-label="배경음악 남겨진 말">
      <button class="s-button s-score-play" type="button" data-action="toggle-score">교사 낭독 시작</button>
      <label class="s-score-volume">배경음악<input type="range" min="0" max="1" step="0.01" value="${narrationVolume}"></label>
      <audio class="s-score-audio" preload="metadata" src="audio/samil-words-left.mp3"></audio>
      <p class="s-score-error" role="status" hidden></p>
    </div>`;
  }

  function wireScore(cues) {
    const audio = app.querySelector('.s-score-audio');
    if (!audio) return;
    const button = app.querySelector('[data-action="toggle-score"]');
    const failure = app.querySelector('.s-score-error');
    audio.volume = narrationVolume;
    const updateCue = () => {
      if (!audio.isConnected || (!audio.currentTime && audio.paused)) return;
      const panel = app.querySelector('[data-reading-cue]');
      const index = cues.findLastIndex(cue => cue.at <= audio.currentTime);
      if (panel.dataset.index === String(index)) return;
      panel.dataset.index = index;
      panel.hidden = false;
      app.querySelector('[data-reading-copy]').hidden = true;
      panel.querySelector('.s-reading-speaker').textContent = cues[index].speaker;
      const line = panel.querySelector('.s-reading-line');
      line.textContent = cues[index].text;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        line.animate([{ opacity: .34, transform: 'translateY(.23em)' }, { opacity: 1, transform: 'none' }],
          { duration: 540, easing: 'ease-out' });
      }
      panel.querySelector('.s-reading-position').textContent = `${index + 1} / ${cues.length}`;
    };
    const sync = () => {
      button.textContent = audio.paused ? (audio.ended ? '다시 낭독' : '낭독 계속') : '낭독 멈춤';
      button.dataset.playing = String(!audio.paused);
      if (!audio.paused) failure.hidden = true;
      updateCue();
    };
    for (const event of ['play', 'pause', 'ended']) audio.addEventListener(event, sync);
    audio.addEventListener('timeupdate', updateCue);
    audio.addEventListener('error', () => {
      failure.textContent = '음악을 불러오지 못했어요.';
      failure.hidden = false;
    });
    app.querySelector('.s-score-volume input').addEventListener('input', e => {
      audio.volume = Number(e.currentTarget.value);
      narrationVolume = audio.volume;
    });
  }

  async function playScore(audio, restart = false) {
    const failure = app.querySelector('.s-score-error');
    try {
      if (restart) audio.currentTime = 0;
      await audio.play();
    } catch {
      if (audio.isConnected) {
        failure.textContent = '배경음악을 재생하지 못했어요.';
        failure.hidden = false;
      }
    }
  }

  function mapVisual(selected, interactive, visited = new Set()) {
    const place = places.find(item => item.id === selected) || places[0];
    return `<figure class="s-map">
      <div class="s-map-body">
        <div class="s-map-image">
          <img src="assets/samil-map.webp" alt="한반도 해안선 지도. 위에서부터 평양, 서울, 천안 아우내 순으로 표시되어 있어요.">
          ${places.map((item, index) => {
            const active = item.id === place.id;
            const number = `<span>${index + 1}</span>`;
            return `<div class="s-map-anchor s-map-${item.id}" style="--x:${item.x}%;--y:${item.y}%">
              ${interactive
                ? `<button type="button" class="s-map-pin" data-action="place" data-id="${item.id}" data-origin="pin"
                    aria-pressed="${active}" aria-label="${item.name}${visited.has(item.id) ? ` · ${item.date}` : ''}">${number}</button>`
                : `<span class="s-map-pin" aria-hidden="true">${number}</span>`}</div>`;
          }).join('')}
        </div>
        <div class="s-map-information">
          <div class="s-places">${places.map((item, index) => interactive
            ? `<button type="button" class="s-button s-place" data-action="place" data-id="${item.id}" data-origin="list"
                 aria-pressed="${item.id === place.id}"><span>${index + 1}</span> ${item.name}
                 ${visited.has(item.id) ? `<strong class="s-place-date">${item.date}</strong>` : ''}</button>`
            : `<div class="s-map-list"><span>${index + 1} · ${item.name}</span><strong>${item.date}</strong></div>`).join('')}</div>
          ${interactive ? `<div class="s-map-detail" aria-live="polite">
            <strong>1919년 ${place.date} · ${place.name}</strong><p>${esc(place.detail)}</p>
            ${assetLink(place.source, '지역 기록')}</div>` : ''}
        </div>
      </div>
      <figcaption>대표 시위 세 곳 · Natural Earth 바탕지도</figcaption>
    </figure>`;
  }

  function visualFor(slide, mapSelection, visited) {
    const key = slide.visual;
    if (slide.type === 'map' || key === 'map') return `<div data-map>${mapVisual(mapSelection, slide.type === 'map', visited)}</div>`;
    if (key === 'timeline') return timeline();
    if (key === 'compare') return `<div class="s-compare">${['paper', 'crowd'].map(
      part => sourceFigure(part)).join('')}</div>`;
    if (!visuals[key]) return '';
    return sourceFigure(key, `s-${key}`);
  }

  function activityState() {
    const key = `${route.view}/${route.grade}/${route.index ?? ''}`;
    if (!activities.has(key)) {
      const place = (route.view === 'lesson' && lessonSlides(route.grade)[route.index].mapPlace) || 'seoul';
      activities.set(key, { order: [], place, visited: new Set([place]), claimAnswers: {} });
    }
    return activities.get(key);
  }

  function orderActivity(state) {
    const complete = state.order.length === order.length;
    const correct = complete && state.order.every((item, index) => item === index);
    const feedback = complete ? (correct ? '맞았어요. 선언서를 준비하고, 함께 만세를 외치고, 만세가 여러 지역으로 이어졌어요.' :
      '다시 생각해 봐요. 사람들이 만세를 외치기 전에는 무엇을 준비했을까요?') : '그림을 하나씩 눌러요.';
    return `<div class="s-order-grid">${[1, 2, 0].map(index => {
      const card = order[index];
      const position = state.order.indexOf(index);
      const image = card.visual === 'map' ? '<img src="assets/samil-map.webp" alt="한반도 지도">' : photo(card.visual);
      return `<button type="button" class="s-order-card" data-action="order" data-index="${index}" ${position >= 0 ? 'disabled' : ''}>
        <span class="s-order-media">${image}${position >= 0 ? `<span class="s-order-number">${position + 1}</span>` : ''}</span>
        <span>${esc(card.label)}${position >= 0 ? ` · ${position + 1}번째` : ''}</span>
      </button>`;
    }).join('')}</div><div class="s-feedback-row"><p role="status">${feedback}</p>
      <button class="s-button" type="button" data-action="reset-order">다시 놓기</button></div>
      <p class="s-image-sources">${assetLink('photograph', '서울 시위 사진')} ·
        ${assetLink('document', '국립중앙박물관 소장 독립선언서')} · ${assetLink('map', 'Natural Earth 바탕지도')}</p>`;
  }

  function claimActivity(state) {
    return `<div class="s-claims">${claims.map((item, index) => {
      const selected = state.claimAnswers[index];
      return `<fieldset><legend>${index + 1}. ${esc(item.claim)}</legend>
        <div class="s-options">${item.evidence.map((option, optionIndex) =>
          `<button type="button" class="s-button s-option" data-action="claim" data-index="${index}" data-id="${optionIndex}"
            aria-pressed="${selected === optionIndex}"><span>${optionIndex + 1}</span> ${esc(option)}</button>`).join('')}</div>
        <p class="s-feedback" role="status">${selected === undefined ? '이 주장을 직접 뒷받침하는 자료를 골라요.' :
          selected === item.correct ? esc(item.reason) : '자료가 무엇을 보여 주는지 확인하고 다른 근거를 골라 봐요.'}</p>
      </fieldset>`;
    }).join('')}</div>`;
  }

  function activityBody() {
    const state = activityState();
    if (route.grade === '1-2') return orderActivity(state);
    if (route.grade === '5-6') return claimActivity(state);
    return `<div data-map>${mapVisual(state.place, true, state.visited)}</div>
      <p class="s-feedback" role="status">${state.visited.size === places.length
        ? '세 곳을 모두 살펴봤어요. 3월 1일 시위가 열린 두 곳과, 그 뒤에 시위가 열린 곳을 짝에게 말해 보세요.'
        : `찾아본 장소 ${state.visited.size} / ${places.length}`}</p>`;
  }

  function choiceButtons(slide, selected, index, reveal) {
    return `<div class="s-options">${slide.options.map((option, i) =>
      `<button type="button" class="s-button s-option${reveal && i === slide.correct ? ' s-correct' : ''}"
          data-action="choice" data-index="${index}" data-id="${i}" aria-pressed="${i === selected}">
          <span>${i + 1}</span> ${esc(option)}${reveal && i === slide.correct ? '<strong>정답</strong>' : ''}
        </button>`).join('')}</div>`;
  }

  function teacher() {
    const g = grades[route.grade];
    const slides = lessonSlides(route.grade);
    const slide = slides[route.index];
    const { place, visited } = activityState();
    const kind = { cover: '도입', story: '이야기', record: '기록 읽기', observe: '자료 관찰', map: '지도 탐구', read: '사료 읽기',
      activity: '학생 활동', quiz: '골든벨', recap: '마무리' }[slide.type];
    const hero = slide.type === 'cover';
    const quiz = slide.type === 'quiz';
    const interaction = slide.type === 'activity';
    const memory = slide.type === 'memory';
    const visual = !hero && !interaction && !slide.record ? visualFor(slide, place, visited) : '';
    const mainClass = slide.record ? 's-record-stage' : interaction ? 's-activity-slide' : hero ? 's-cover'
      : visual ? 's-slide-grid' : 's-slide-text';
    const nextTitle = memory ? '다음 이야기' : !revealed ? (quiz ? '정답 보기' : '설명 보기')
      : route.index === slides.length - 1 ? '수업 마치기' : '다음 장면';
    const explanation = `<div class="s-explanation" aria-live="polite" ${revealed ? '' : 'hidden'}>
      <strong>${quiz ? '정답과 이유' : '함께 정리'}</strong><p>${esc(slide.explain)}</p></div>`;
    const prompt = slide.prompt ? `<p class="s-prompt">${esc(slide.prompt)}</p>` : '';
    app.innerHTML = `<div class="s-presenter">
      <header class="s-top s-presenter-head">
        <div class="s-session"><a class="s-brand" href="samil.html">← 3·1절</a><span>${g.label}</span></div>
        <div class="s-tools">
          <button class="s-button" type="button" data-action="scenes">장면 목록</button>
          <button class="s-button" type="button" data-action="qr">학생 QR</button>
          <button class="s-button" type="button" data-action="worksheets">학습지·해설</button>
          <button class="s-button s-secondary-tool" type="button" data-action="notes">교사 노트</button>
          <button class="s-button s-secondary-tool" type="button" data-action="fullscreen" aria-pressed="${!!document.fullscreenElement}">전체 화면</button>
          ${hero || slide.record || slide.date ? '<button class="s-button s-secondary-tool" type="button" data-action="replay">다시 보기</button>' : ''}
        </div>
      </header>
      <main id="samil-content" class="s-stage ${mainClass}">
        ${slide.record ? archivePanel(slide, memory ? '' : prompt + explanation) : `
        ${hero ? `<div class="s-cover-image">${photo('crowd')}</div>` : ''}
        <div class="s-copy">
          ${hero ? '' : slide.date ? `<time class="s-history-date" datetime="${esc(slide.iso)}">${esc(slide.date)}</time>` : `<p class="s-kicker">${kind}</p>`}
          ${hero ? '<span class="s-cover-date" aria-label="1919년 3월 1일"><span>1919</span><span>. 3. 1.</span></span>' : ''}
          <h1 id="samil-title" tabindex="-1">${esc(slide.title)}</h1>
          ${slide.summary ? `<p class="s-history-summary">${esc(slide.summary)}</p>` : ''}
          ${prompt}
          ${slide.quotation ? `<blockquote>${esc(slide.quotation)}<cite>3·1독립선언서 첫머리 · 수업용 현대어 풀이</cite></blockquote>` : ''}
          ${slide.evidence ? `<p class="s-quiz-evidence">${esc(slide.evidence)}</p>` : ''}
          ${quiz ? `<div data-teacher-options>${choiceButtons(slide, answers.get(location.hash), route.index, revealed)}</div>` : ''}
          ${explanation}
          ${slide.source ? `<div class="s-history-actions">${assetLink(slide.source, '기록 출처')}
            ${slide.video ? `<button class="s-button" type="button" data-action="video" data-id="${slide.video}">관련 영상 보기</button>` : ''}</div>` : ''}
        </div>
        ${interaction ? `<section class="s-activity" aria-label="${esc(g.activity)}" data-activity>${activityBody()}</section>` : ''}
        ${visual ? `<section class="s-visual" aria-label="수업 자료">${visual}</section>` : ''}
        ${hero ? `<div class="s-cover-credit">${assetLink('photograph', '1919년 3월 서울 시위 사진')}
          <button class="s-button s-enlarge" data-action="artifact" data-id="crowd" type="button"
            aria-label="서울 시위 사진 확대">확대 <span aria-hidden="true">+</span></button></div>` : ''}`}
      </main>
      <footer class="s-presenter-foot">
        <div class="s-progress"><span class="s-progress-count">${route.index + 1} / ${slides.length}</span>
          <progress value="${route.index + 1}" max="${slides.length}" aria-label="수업 진행"></progress></div>
        ${slide.record?.music ? scoreControls() : ''}
        <div class="s-step-controls">
          <button type="button" class="s-button" data-action="previous" ${route.index === 0 && !revealed ? 'disabled' : ''}>← 이전</button>
          <button type="button" class="s-button s-primary" data-action="next">${nextTitle} →</button>
        </div>
      </footer></div>`;
    wireScore(slide.record?.cues);
  }

  function showScenes(button) {
    const sections = new Map();
    lessonSlides(route.grade).forEach((slide, index) => {
      const group = { activity: '학생 활동', quiz: '골든벨', memory: '기억할 열 사람', recap: '마무리' }[slide.type] || '이야기와 자료';
      if (!sections.has(group)) sections.set(group, []);
      sections.get(group).push(`<li><a href="${lessonHref(route.grade, index)}" data-scene-link
        ${index === route.index ? 'aria-current="step"' : ''}><span>${index + 1}</span>${esc(slide.title)}</a></li>`);
    });
    openDialog(`${grades[route.grade].label} 장면 목록`, `<div class="s-scene-index">${[...sections].map(([label, links]) =>
      `<section><h3>${label}</h3><ul>${links.join('')}</ul></section>`).join('')}</div>`, button, 'scenes');
    dialog.querySelector('[aria-current="step"]').focus();
  }

  const studentAnswerKey = index => `student/${route.grade}/${index}`;

  function quizState() {
    if (!quizzes.has(route.grade)) quizzes.set(route.grade, { index: 0, finished: false });
    return quizzes.get(route.grade);
  }

  function studentQuiz() {
    const g = grades[route.grade];
    const { index, finished } = quizState();
    const total = g.quiz.length;
    if (finished) {
      const correctCount = g.quiz.filter((item, i) => answers.get(studentAnswerKey(i)) === item.correct).length;
      return `<div class="s-quiz-result" data-student-quiz>
        <h2 id="s-quiz-heading" tabindex="-1">골든벨 결과 <strong>${correctCount} / ${total}</strong></h2>
        <ol>${g.quiz.map((item, i) => {
          const correct = answers.get(studentAnswerKey(i)) === item.correct;
          return `<li><button class="s-button" type="button" data-action="quiz-review" data-index="${i}">
            <span>${i + 1}.</span> ${esc(item.title)}<strong>${correct ? '정답' : '다시 보기'}</strong></button></li>`;
        }).join('')}</ol>
        <button class="s-button" type="button" data-action="quiz-reset">처음부터 다시 풀기</button></div>`;
    }
    const done = g.quiz.filter((_, i) => answers.has(studentAnswerKey(i))).length;
    const item = g.quiz[index];
    const selected = answers.get(studentAnswerKey(index));
    const visual = visualFor(item);
    const feedback = selected === undefined ? '답을 골라요.' : selected === item.correct
      ? `맞았어요. ${item.explain}` : '자료를 다시 보고 다른 답을 골라 봐요.';
    return `<div class="s-student-quiz" data-student-quiz>
      <div class="s-quiz-progress"><span>${index + 1} / ${total} 문항</span>
        <progress value="${done}" max="${total}" aria-label="응답한 문항"></progress><span>${done}문항 응답</span></div>
      <section class="s-student-question" aria-labelledby="s-quiz-heading">
        <h2 id="s-quiz-heading" tabindex="-1">${esc(item.title)}</h2>
        ${item.evidence ? `<p class="s-quiz-evidence">${esc(item.evidence)}</p>` : ''}
        <div class="s-question-body${visual ? ' has-visual' : ''}">${visual ? `<div>${visual}</div>` : ''}
          <div>${choiceButtons(item, selected, index, selected === item.correct)}
            <p class="s-feedback s-quiz-feedback" data-quiz-feedback>${esc(feedback)}</p></div>
        </div>
      </section>
      <nav class="s-quiz-controls" aria-label="골든벨 문항 이동">
        <button class="s-button" type="button" data-action="quiz-back" ${index === 0 ? 'disabled' : ''}>← 이전 문제</button>
        <button class="s-button s-primary" type="button" data-action="quiz-next" ${selected === undefined ? 'disabled' : ''}>
          ${index === total - 1 ? '결과 보기' : '다음 문제'} →</button>
      </nav></div>`;
  }

  function student() {
    const g = grades[route.grade];
    const quiz = route.target === 'quiz';
    app.innerHTML = `<header class="s-top"><a class="s-brand" href="samil.html">← 3·1절</a><span>${g.label} · 학생 활동</span></header>
      <main id="samil-content" class="s-student">
        <nav class="s-student-nav" aria-label="학생 활동 선택">
          <a class="s-button" href="${studentHref(route.grade, 'activity')}" ${quiz ? '' : 'aria-current="page"'}>탐구 활동</a>
          <a class="s-button" href="${studentHref(route.grade, 'quiz')}" ${quiz ? 'aria-current="page"' : ''}>골든벨</a>
        </nav>
        <h1 id="samil-title" tabindex="-1">${quiz ? '3·1절 골든벨' : esc(g.activity)}</h1>
        ${quiz ? `<div class="s-visually-hidden" role="status" data-quiz-status></div>${studentQuiz()}`
          : `<section class="s-activity" aria-label="${esc(g.activity)}" data-activity>${activityBody()}</section>
            <p class="s-student-exit">${esc(g.exit)}</p>`}
      </main>`;
  }

  function render(focus = false) {
    app.querySelector('.s-score-audio')?.pause();
    route = readRoute();
    if (route.view === 'lesson') teacher();
    else if (route.view === 'student') student();
    else home();
    if (focus && route.view !== 'home') {
      window.scrollTo(0, 0);
      document.getElementById('samil-title')?.focus({ preventScroll: true });
    }
  }

  function go(hash) {
    if (location.hash === hash) return;
    location.hash = hash;
  }

  function updateReveal(next) {
    revealed = next;
    const explanation = app.querySelector('.s-explanation');
    explanation.hidden = !next;
    const index = route.index;
    const slides = lessonSlides(route.grade);
    const slide = slides[index];
    const options = app.querySelector('[data-teacher-options]');
    if (options) options.innerHTML = choiceButtons(slide, answers.get(location.hash), index, revealed);
    app.querySelector('[data-action="previous"]').disabled = !revealed && index === 0;
    app.querySelector('[data-action="next"]').textContent = revealed
      ? (index === slides.length - 1 ? '수업 마치기 →' : '다음 장면 →')
      : (slide.type === 'quiz' ? '정답 보기 →' : '설명 보기 →');
  }

  function move(direction) {
    const slides = lessonSlides(route.grade);
    if (direction > 0 && !revealed && slides[route.index].type !== 'memory') return updateReveal(true);
    if (direction < 0 && revealed) return updateReveal(false);
    const next = route.index + direction;
    if (next >= slides.length) return go('');
    if (next >= 0) go(lessonHref(route.grade, next));
  }

  function keepFocus(container, selector) {
    (container.querySelector(selector) || container.querySelector('button:not([disabled])'))?.focus({ preventScroll: true });
  }

  function changeActivity(button) {
    const { action, index, id, origin } = button.dataset;
    const state = activityState();
    const activity = app.querySelector('[data-activity]');
    if (action === 'place') {
      state.place = id;
      state.visited.add(id);
      if (!activity) {
        const map = app.querySelector('[data-map]');
        map.innerHTML = mapVisual(id, true, state.visited);
        keepFocus(map, `[data-id="${id}"][data-origin="${origin}"]`);
        return;
      }
    }
    if (action === 'order') state.order.push(Number(index));
    if (action === 'reset-order') state.order = [];
    if (action === 'claim') state.claimAnswers[index] = Number(id);
    activity.innerHTML = activityBody();
    const nextFocus = action === 'place' ? `[data-id="${id}"][data-origin="${origin}"]` :
      action === 'claim' ? `[data-action="claim"][data-index="${index}"][data-id="${id}"]` :
      '[data-action="order"]:not([disabled])';
    keepFocus(activity, nextFocus);
  }

  function choose(button) {
    const { index, id } = button.dataset;
    const selected = Number(id);
    const selector = `[data-action="choice"][data-index="${index}"][data-id="${id}"]`;
    if (route.view === 'lesson') {
      if (revealed) return;
      answers.set(location.hash, selected);
      const options = app.querySelector('[data-teacher-options]');
      options.innerHTML = choiceButtons(lessonSlides(route.grade)[route.index], selected, route.index, false);
      keepFocus(options, selector);
    } else {
      answers.set(studentAnswerKey(index), selected);
      const container = app.querySelector('[data-student-quiz]');
      container.outerHTML = studentQuiz();
      keepFocus(app.querySelector('[data-student-quiz]'), selector);
      app.querySelector('[data-quiz-status]').textContent = app.querySelector('[data-quiz-feedback]').textContent;
    }
  }

  function moveQuiz(button) {
    const { action, index } = button.dataset;
    const state = quizState();
    const total = grades[route.grade].quiz.length;
    if (action === 'quiz-reset') {
      for (let i = 0; i < total; i++) answers.delete(studentAnswerKey(i));
      quizzes.delete(route.grade);
    } else if (action === 'quiz-review') {
      state.index = Number(index);
      state.finished = false;
    } else if (action === 'quiz-next') {
      if (state.index === total - 1) state.finished = true;
      else state.index++;
    } else if (action === 'quiz-back' && state.index > 0) state.index--;
    app.querySelector('[data-student-quiz]').outerHTML = studentQuiz();
    app.querySelector('[data-quiz-status]').textContent = '';
    document.getElementById('s-quiz-heading').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function teacherNotes(button) {
    const g = grades[route.grade];
    const slide = lessonSlides(route.grade)[route.index];
    openDialog('교사 노트', `<p><strong>학습 목표</strong> ${esc(g.goal)}</p>
      <p>${esc(slide.note)}</p>${slide.explain ? `<p><strong>정리할 말</strong> ${esc(slide.explain)}</p>` : ''}
      <details><summary>자료 출처와 참고 영상</summary><ul class="s-sources">${Object.entries(sources).map(([key, source]) =>
        `<li>${assetLink(key)} <span>${esc(source.credit)}</span></li>`).join('')}</ul></details>`, button);
    if (openNotes.has(route.grade)) dialog.querySelector('details').open = true;
    dialog.querySelector('details').addEventListener('toggle', e => {
      if (e.currentTarget.open) openNotes.add(route.grade);
      else openNotes.delete(route.grade);
    });
  }

  window.ActivityQr.register('samil', {
    file: 'samil.html',
    grade: () => route.grade,
    label: () => `3·1절 ${grades[route.grade].label}`,
    targets: () => [{ id: 'activity', label: grades[route.grade].activity }, { id: 'quiz', label: '골든벨' }],
    current: () => lessonSlides(route.grade)[route.index].type === 'quiz' ? 'quiz' : 'activity',
    modal: body => openDialog('학생 QR', body),
  });

  document.addEventListener('click', async event => {
    if (event.target.closest('.s-skip')) {
      event.preventDefault();
      const main = document.getElementById('samil-content');
      main.tabIndex = -1;
      main.focus();
      return;
    }
    const sceneLink = event.target.closest('[data-scene-link]');
    if (sceneLink) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      dialog.close();
      return go(sceneLink.hash);
    }
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'close') return dialog.close();
    if (action === 'video') return showVideo(button);
    if (action === 'artifact') return showArtifact(button);
    if (action === 'zoom') {
      const sheet = dialog.querySelector('.s-artifact-sheet');
      const zoomed = sheet.classList.toggle('is-zoomed');
      button.setAttribute('aria-pressed', String(zoomed));
      button.textContent = zoomed ? '화면에 맞추기' : '원본 크기';
      sheet.scrollTo(0, 0);
      return;
    }
    if (action === 'choice') return choose(button);
    if (['place', 'order', 'reset-order', 'claim'].includes(action)) return changeActivity(button);
    if (route.view === 'student' && action.startsWith('quiz-')) return moveQuiz(button);
    if (route.view !== 'lesson') return;
    switch (action) {
      case 'next': move(1); break;
      case 'previous': move(-1); break;
      case 'qr': window.ActivityQr.open('samil'); break;
      case 'scenes': showScenes(button); break;
      case 'notes': teacherNotes(button); break;
      case 'toggle-score': {
        const audio = app.querySelector('.s-score-audio');
        if (audio.paused) await playScore(audio);
        else audio.pause();
        break;
      }
      case 'worksheets':
        openDialog('학습지·해설', `<p>3·1절 ${grades[route.grade].label} 인쇄 자료</p><div class="s-print-links">
          <a class="s-button" href="${pdfHref(route.grade)}" target="_blank" rel="noopener">학생용 PDF ↗</a>
          <a class="s-button" href="${pdfHref(route.grade, true)}" target="_blank" rel="noopener">교사용 PDF ↗</a></div>`, button);
        break;
      case 'fullscreen':
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await document.documentElement.requestFullscreen();
        } catch {
          openDialog('전체 화면', '<p>이 브라우저에서는 앱에서 전체 화면을 열 수 없어요. 브라우저 메뉴의 전체 화면을 이용해 주세요.</p>', button);
        }
        break;
      case 'replay': {
        const motion = app.querySelector('.s-cover-date,.s-archive-reading,.s-history-date');
        motion?.replaceWith(motion.cloneNode(true));
        const audio = app.querySelector('.s-score-audio');
        if (audio) await playScore(audio, true);
        break;
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (route.view !== 'lesson' || dialog.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input,select,textarea,[contenteditable]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  document.addEventListener('fullscreenchange', () => {
    app.querySelector('[data-action="fullscreen"]')?.setAttribute('aria-pressed', String(!!document.fullscreenElement));
  });
  dialog.addEventListener('close', () => {
    if (dialog.dataset.kind === 'video') dialog.querySelector('iframe')?.remove();
    dialogTrigger?.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#samil-')) return;
    if (dialog.open) dialog.close();
    revealed = false;
    render(true);
  });
  render();
})();
