(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const chapters = [
    {
      id: 1, roman: 'I', title: 'A cidade de Alma Humana',
      subtitle: 'A inocência, o engano e a queda', pages: window.__PAGES__,
      ending: 'A cidade abriu seus próprios portões.',
      afterword: 'No capítulo seguinte, Diábolo consolida sua conquista e transforma o governo de Alma Humana.'
    },
    {
      ...window.__CHAPTER_2__, roman: 'II',
      ending: 'E Diábolo julgou-se seguro.',
      afterword: 'O capítulo termina com as três fortalezas erguidas. A notícia levada à corte de Shaddai pertence ao capítulo III.'
    }
  ];
  const els = Object.fromEntries([
    ['sidebar', '#sidebar'], ['dim', '#dimmer'], ['toc', '#toc'], ['art', '#pageArt'],
    ['captionTitle', '#captionTitle'], ['captionText', '#captionText'], ['heading', '#heading'],
    ['strap', '#strap'], ['stat', '#stat'], ['index', '#pageIndex'], ['seek', '#seek'],
    ['prev', '#prev'], ['next', '#next'], ['continuous', '#continuous'],
    ['lightbox', '#lightbox'], ['lightboxArt', '#lightboxArt'],
    ['lightboxTitle', '#lightboxTitle'], ['zoomLabel', '#zoomLabel'],
    ['transcript', '#transcript'], ['transcriptText', '#transcriptText']
  ].map(([key, selector]) => [key, $(selector)]));
  let chapter = chapters[1], index = 0, zoom = 1, lightboxIndex = 0;
  let isContinuous = false, continuousReady = false, previousFocus;

  function readRoute() {
    const match = /^#capitulo-([12])(?:\/prancha-(\d+))?$/.exec(location.hash);
    return match ? { chapter: Number(match[1]), page: match[2] ? Number(match[2]) - 1 : null } : null;
  }
  function savedPage() {
    try {
      const value = Number(localStorage.getItem(`guerra-santa-capitulo-${chapter.id}-progresso`));
      return Number.isInteger(value) && value >= 0 && value < chapter.pages.length ? value : 0;
    } catch { return 0; }
  }
  function remember() {
    try { localStorage.setItem(`guerra-santa-capitulo-${chapter.id}-progresso`, String(index)); } catch {}
    try { history.replaceState(null, '', `#capitulo-${chapter.id}/prancha-${index + 1}`); } catch {}
  }
  function closeSidebar() {
    els.sidebar.classList.remove('is-open');
    els.dim.classList.remove('is-open');
    $('#openSidebar').setAttribute('aria-expanded', 'false');
  }
  function buildToc() {
    els.toc.replaceChildren();
    chapter.pages.forEach((page, pageIndex) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Ir à prancha ${pageIndex + 1}: ${page.title}`);
      const number = document.createElement('span');
      number.className = 'page-number';
      number.textContent = String(pageIndex + 1).padStart(2, '0');
      const text = document.createElement('span');
      text.className = 'page-text';
      text.append(page.title);
      const small = document.createElement('small');
      small.textContent = page.kind;
      text.append(small);
      button.append(number, text);
      button.onclick = () => { setMode(false); go(pageIndex); closeSidebar(); };
      li.append(button);
      els.toc.append(li);
    });
  }
  function transcript(page, target) {
    target.replaceChildren();
    (page.panels || []).forEach(panel => {
      const li = document.createElement('li');
      li.textContent = panel.text;
      target.append(li);
    });
  }
  function go(pageIndex) {
    index = Math.min(chapter.pages.length - 1, Math.max(0, pageIndex));
    const page = chapter.pages[index];
    els.art.setAttribute('data-loading', 'true');
    els.art.onload = () => els.art.removeAttribute('data-loading');
    els.art.onerror = () => els.art.removeAttribute('data-loading');
    els.art.alt = `Capítulo ${chapter.roman}, prancha ${index + 1}: ${page.title}. ${page.description}`;
    els.art.src = page.image;
    els.art.width = page.width;
    els.art.height = page.height;
    els.captionTitle.textContent = page.title;
    els.captionText.textContent = page.description;
    els.heading.textContent = page.title;
    els.strap.textContent = page.subtitle || chapter.subtitle;
    els.stat.replaceChildren('PRANCHA ');
    const current = document.createElement('b');
    current.textContent = String(index + 1).padStart(2, '0');
    els.stat.append(current, ` / ${String(chapter.pages.length).padStart(2, '0')}`);
    els.index.textContent = `${index + 1} / ${chapter.pages.length}`;
    els.seek.value = String(index);
    els.seek.setAttribute('aria-valuetext', `Prancha ${index + 1} de ${chapter.pages.length}: ${page.title}`);
    els.prev.disabled = index === 0;
    els.next.disabled = index === chapter.pages.length - 1;
    els.toc.querySelectorAll('button').forEach((button, i) => {
      if (index === i) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    els.transcript.hidden = !page.panels;
    transcript(page, els.transcriptText);
    document.title = `${page.title} — A Guerra Santa | Capítulo ${chapter.roman}`;
    remember();
    if (!isContinuous) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function selectChapter(id, pageIndex = null) {
    chapter = chapters.find(item => item.id === id) || chapters[1];
    if (els.lightbox.classList.contains('open')) hideLightbox();
    continuousReady = false;
    els.continuous.replaceChildren();
    els.seek.max = String(chapter.pages.length - 1);
    $('#chapterLabel').textContent = `Livro I · Capítulo ${chapter.id}`;
    $('#chapterName').textContent = chapter.title;
    $('#chapterSubtitle').textContent = chapter.subtitle;
    $('#chapterEyebrow').textContent = `Capítulo ${chapter.roman} · A Guerra Santa`;
    $('#endLabel').textContent = `Fim do capítulo ${chapter.roman}`;
    $('#endTitle').textContent = chapter.ending;
    $('#endText').textContent = chapter.afterword;
    $('#nextChapter').hidden = chapter.id !== 1;
    $('#downloadChapter').hidden = chapter.id !== 2;
    $('#chapterSources').hidden = chapter.id !== 2;
    document.querySelectorAll('[data-chapter]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.chapter) === chapter.id));
    });
    buildToc();
    go(pageIndex === null ? savedPage() : pageIndex);
    if (isContinuous) renderContinuous();
  }
  function setMode(continuous) {
    isContinuous = continuous;
    document.body.classList.toggle('is-continuous', continuous);
    document.body.classList.toggle('is-paged', !continuous);
    $('#continuousButton').setAttribute('aria-pressed', String(continuous));
    $('#pagedButton').setAttribute('aria-pressed', String(!continuous));
    els.transcript.open = false;
    if (continuous) renderContinuous();
    else go(index);
  }
  function renderContinuous() {
    if (continuousReady) return;
    const fragment = document.createDocumentFragment();
    chapter.pages.forEach((page, i) => {
      const article = document.createElement('article');
      article.id = `prancha-${chapter.id}-${i + 1}`;
      const heading = document.createElement('h3');
      heading.textContent = `${String(i + 1).padStart(2, '0')} · ${page.title}`;
      const img = document.createElement('img');
      img.className = 'continuous-image';
      img.alt = `${page.title}: ${page.description}`;
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.width = page.width;
      img.height = page.height;
      img.src = page.image;
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Ampliar prancha ${i + 1}: ${page.title}`);
      img.onclick = () => showLightbox(i);
      img.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showLightbox(i); }
      };
      const description = document.createElement('p');
      description.textContent = page.description;
      article.append(heading, img, description);
      if (page.panels) {
        const details = document.createElement('details');
        details.className = 'transcript';
        const summary = document.createElement('summary');
        summary.textContent = 'Ler transcrição da prancha';
        const list = document.createElement('ol');
        transcript(page, list);
        details.append(summary, list);
        article.append(details);
      }
      fragment.append(article);
    });
    els.continuous.append(fragment);
    continuousReady = true;
  }
  function setZoom(value) {
    zoom = Math.max(.1, Math.min(3, value));
    els.lightboxArt.style.width = `${Math.round(chapter.pages[lightboxIndex].width * zoom)}px`;
    els.zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }
  function showLightbox(i) {
    previousFocus = document.activeElement;
    lightboxIndex = i;
    const page = chapter.pages[i];
    els.lightboxTitle.textContent = `Capítulo ${chapter.roman} · ${i + 1}/${chapter.pages.length} · ${page.title}`;
    els.lightboxArt.src = page.image;
    els.lightboxArt.alt = `${page.title}: ${page.description}`;
    els.lightbox.classList.add('open');
    els.lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setZoom(Math.min(1, Math.max(260, innerWidth - 60) / page.width));
    els.lightbox.scrollTo(0, 0);
    $('#lightboxClose').focus();
  }
  function hideLightbox() {
    els.lightbox.classList.remove('open');
    els.lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    previousFocus?.focus();
  }

  document.querySelectorAll('[data-chapter]').forEach(button => {
    button.onclick = () => { selectChapter(Number(button.dataset.chapter)); closeSidebar(); };
  });
  $('#nextChapter').onclick = () => { selectChapter(2, 0); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  $('#openSidebar').onclick = () => {
    els.sidebar.classList.add('is-open'); els.dim.classList.add('is-open');
    $('#openSidebar').setAttribute('aria-expanded', 'true');
  };
  els.dim.onclick = closeSidebar;
  $('#closeSidebar').onclick = closeSidebar;
  els.prev.onclick = () => go(index - 1);
  els.next.onclick = () => go(index + 1);
  els.seek.oninput = event => go(Number(event.target.value));
  els.art.onclick = () => showLightbox(index);
  els.art.onkeydown = event => {
    if (event.key === 'Enter') { event.preventDefault(); showLightbox(index); }
  };
  $('#pagedButton').onclick = () => setMode(false);
  $('#continuousButton').onclick = () => setMode(true);
  $('#themeToggle').onclick = () => {
    document.body.classList.toggle('theme-paper');
    $('#themeToggle').setAttribute('aria-pressed', String(document.body.classList.contains('theme-paper')));
  };
  $('#printBtn').onclick = async () => {
    const button = $('#printBtn');
    button.disabled = true;
    renderContinuous();
    const images = [...els.continuous.querySelectorAll('img')];
    images.forEach(img => { img.loading = 'eager'; });
    await Promise.allSettled(images.map(img => img.decode()));
    button.disabled = false;
    window.print();
  };
  $('#enterFull').onclick = async () => {
    try {
      if (!document.fullscreenElement) await $('.main').requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {}
  };
  $('#lightboxClose').onclick = hideLightbox;
  $('#zoomOut').onclick = () => setZoom(zoom / 1.25);
  $('#zoomIn').onclick = () => setZoom(zoom * 1.25);
  $('#zoomFit').onclick = () => setZoom(Math.min(1, (innerWidth - 50) / chapter.pages[lightboxIndex].width));
  els.lightbox.onclick = event => { if (event.target === els.lightbox) hideLightbox(); };

  document.addEventListener('keydown', event => {
    if (els.lightbox.classList.contains('open')) {
      if (event.key === 'Escape') hideLightbox();
      if (event.key === '+' || event.key === '=') setZoom(zoom * 1.25);
      if (event.key === '-') setZoom(zoom / 1.25);
      if (event.key === 'Tab') {
        const buttons = [...els.lightbox.querySelectorAll('button')];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (event.key === 'Escape') { closeSidebar(); return; }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (['BUTTON', 'SUMMARY'].includes(document.activeElement?.tagName) && [' ', 'Enter'].includes(event.key)) return;
    if (!isContinuous) {
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); go(index + 1); }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); go(index - 1); }
      if (event.key === 'Home') { event.preventDefault(); go(0); }
      if (event.key === 'End') { event.preventDefault(); go(chapter.pages.length - 1); }
    }
  });
  let startX = 0, startY = 0;
  $('.frame').addEventListener('touchstart', event => {
    startX = event.changedTouches[0].clientX; startY = event.changedTouches[0].clientY;
  }, { passive: true });
  $('.frame').addEventListener('touchend', event => {
    const dx = event.changedTouches[0].clientX - startX, dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.35) go(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
  window.addEventListener('beforeprint', () => {
    renderContinuous();
    els.continuous.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
  });
  window.addEventListener('hashchange', () => {
    const route = readRoute();
    if (route) selectChapter(route.chapter, route.page);
  });
  const route = readRoute();
  selectChapter(route?.chapter || 2, route?.page ?? null);
  setMode(false);
})();
