(() => {
 const mobile = () => matchMedia('(max-width: 767px)').matches;
 const layout = () => {
  document.querySelector('.desktop-story').style.zoom = Math.min(innerWidth / 1440, 1);
  document.querySelectorAll('.art-wrap').forEach(w => {
   const scale = Math.min(w.clientWidth / Number(w.dataset.artWidth), 1);
   w.style.height = Number(w.dataset.artHeight) * scale + 'px';
   w.querySelector('.art-canvas').style.transform = `scale(${scale})`;
  });
  document.getElementById('skip-link').href = mobile() ? '#mobile-intro' : '#intro';
 };
 const progress = () => {
  const height = document.documentElement.scrollHeight - innerHeight;
  document.getElementById('reading-progress').style.width = (height > 0 ? scrollY / height * 100 : 0) + '%';
 };
 document.querySelectorAll('[data-chapter]').forEach(link => link.addEventListener('click', e => {
  e.preventDefault();
  const target = document.getElementById((mobile() ? 'mobile-' : '') + link.dataset.chapter);
  bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('chapter-menu')).hide();
  target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  history.replaceState(null, '', '#' + target.id);
 }));
 addEventListener('resize', () => {layout();progress();});
 addEventListener('scroll', progress, {passive:true});
 layout();progress();
 document.fonts.ready.then(layout);
})();
// Replayable scroll choreography. Original content remains visible if JS is unavailable.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const records = new Set();
  let observer;
  let resizeFrame;

  function splitText(element, kind) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.textContent.trim() && !node.parentElement.closest('.motion-char, .motion-word')
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      const tokens = kind === 'heading' ? Array.from(node.textContent) : node.textContent.split(/(\s+)/);
      for (const token of tokens) {
        if (/^\s+$/.test(token)) {
          fragment.append(document.createTextNode(token));
          continue;
        }
        const span = document.createElement('span');
        span.className = kind === 'heading' ? 'motion-char' : 'motion-word';
        span.textContent = token;
        if (kind === 'heading') {
          span.setAttribute('aria-hidden', 'true');
          span.style.setProperty('--character-delay', `${index++ * 24}ms`);
        }
        fragment.append(span);
      }
      node.replaceWith(fragment);
    }
    // Keep the typewriter pace brisk even for longer editorial headings.
    if (kind === 'heading') {
      const characters = element.querySelectorAll('.motion-char');
      const pace = Math.min(24, 1400 / Math.max(characters.length, 1));
      characters.forEach((span, i) => span.style.setProperty('--character-delay', `${i * pace}ms`));
    }
  }

  function measureLines() {
    for (const element of records) {
      if (!element.classList.contains('motion-body') || !element.getClientRects().length) continue;
      const words = element.querySelectorAll('.motion-word');
      let previousTop = null;
      let line = -1;
      for (const word of words) {
        const top = word.getBoundingClientRect().top;
        if (previousTop === null || Math.abs(top - previousTop) > 3) {
          line++;
          previousTop = top;
        }
        word.style.setProperty('--line-delay', `${Math.min(line * 85, 850)}ms`);
        word.dataset.line = String(line);
      }
    }
  }

  function register(element, kind) {
    if (records.has(element)) return;
    if (kind === 'heading') {
      element.setAttribute('aria-label', element.textContent.trim());
      splitText(element, kind);
    } else if (kind === 'body') splitText(element, kind);
    element.classList.add('motion-reveal', `motion-${kind}`);
    records.add(element);
  }

  function connect() {
    observer?.disconnect();
    if (preference.matches) {
      document.documentElement.classList.remove('motion-enabled');
      records.forEach(element => element.classList.add('is-visible'));
      return;
    }
    document.documentElement.classList.add('motion-enabled');
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        // Reset on either viewport exit: revisiting a section plays it again.
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      }
    }, {rootMargin: '0px 0px -6% 0px', threshold: 0});
    records.forEach(element => observer.observe(element));
  }

  function init() {
    const headingSelector = '.desktop-story h1, .desktop-story h2, .desktop-story h3, .mobile-story h1, .mobile-story h2, .mobile-story h3';
    document.querySelectorAll(headingSelector).forEach(element => register(element, 'heading'));
    document.querySelectorAll('.desktop-story p').forEach(element => {
      const style = getComputedStyle(element);
      const content = element.textContent.trim();
      if (!content || element.closest('[data-name="Union"]')) return;
      if (style.fontFamily.includes('Big Shoulders') && parseFloat(style.fontSize) >= 26 && parseFloat(style.fontSize) <= 44 && !content.startsWith('“')) {
        register(element, 'heading');
      } else if (style.fontFamily.includes('Nunito')) {
        register(element, 'body');
      } else if (style.fontFamily.includes('Big Shoulders') && parseFloat(style.fontSize) >= 44) {
        register(element, 'stat');
      }
    });
    document.querySelectorAll('.mobile-story p, .mobile-story li').forEach(element => {
      if (element.closest('.mobile-header, .art-wrap') || element.querySelector('p')) return;
      register(element, element.classList.contains('stat-number') ? 'stat' : 'body');
    });
    // Animate clipping windows / compositions, never the oversized image sheets.
    document.querySelectorAll('.desktop-story .design-node').forEach(element => {
      if (!element.querySelector('img') || element.closest('#intro [data-node-id="641:359"], #footer')) return;
      const style = getComputedStyle(element);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      if (style.display === 'contents' || !(width > 30 && width < 1100 && height > 30)) return;
      let parent = element.parentElement;
      while (parent && !parent.classList.contains('chapter-inner')) {
        if (records.has(parent) && parent.classList.contains('motion-art')) return;
        parent = parent.parentElement;
      }
      register(element, 'art');
    });
    document.querySelectorAll('.mobile-story .art-wrap').forEach(element => register(element, 'art'));
    document.querySelectorAll('.mobile-story .card, .mobile-story .stat-card').forEach(element => register(element, 'panel'));
    document.querySelectorAll('.chapter-inner > div.design-node').forEach(element => {
      if (element.children.length) return;
      const style = getComputedStyle(element);
      if (parseFloat(style.width) > 150 && parseFloat(style.height) > 100 && style.backgroundColor !== 'rgba(0, 0, 0, 0)') register(element, 'panel');
    });
    measureLines();
    connect();
    addEventListener('resize', () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measureLines);
    });
    preference.addEventListener('change', connect);
    addEventListener('beforeprint', () => document.documentElement.classList.remove('motion-enabled'));
    addEventListener('afterprint', connect);
  }
  document.fonts.ready.then(init);
})();
