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