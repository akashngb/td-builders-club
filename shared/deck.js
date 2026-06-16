/* TD Builders Club — minimal deck runtime.
   Keyboard:  ← →  Space  PgUp/PgDn  Home/End   nav
              S   speaker notes        D  light/dark
              F   fullscreen           P  print (PDF export)
   URL hash:  #5  jumps to slide 5.
*/
(function () {
  const stage = document.querySelector('.deck-stage');
  if (!stage) return;
  const slides = Array.from(stage.querySelectorAll('.slide'));
  if (!slides.length) return;

  const posEl = document.querySelector('.deck-pos');
  const notesTiming = document.querySelector('.deck-notes .timing');
  const notesBody = document.querySelector('.deck-notes .notes-body');

  let idx = 0;

  function clamp(i) { return Math.max(0, Math.min(slides.length - 1, i)); }

  function render() {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    if (posEl) posEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    const active = slides[idx];
    const notes = active.querySelector('.notes');
    if (notesBody) notesBody.innerHTML = notes ? notes.innerHTML : '<em>No speaker notes for this slide.</em>';
    if (notesTiming) {
      const t = active.dataset.timing;
      notesTiming.textContent = t ? ('Timing — ' + t) : '';
    }
    if (location.hash !== '#' + (idx + 1)) {
      history.replaceState(null, '', '#' + (idx + 1));
    }
  }

  function go(i) { idx = clamp(i); render(); }
  function next() { go(idx + 1); }
  function prev() { go(idx - 1); }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': next(); e.preventDefault(); break;
      case 'ArrowLeft':  case 'PageUp':            prev(); e.preventDefault(); break;
      case 'Home': go(0); e.preventDefault(); break;
      case 'End':  go(slides.length - 1); e.preventDefault(); break;
      case 's': case 'S':
        document.body.classList.toggle('show-notes'); e.preventDefault(); break;
      case 'd': case 'D': {
        const r = document.documentElement;
        r.dataset.theme = r.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('tdbc-theme', r.dataset.theme); } catch (_) {}
        e.preventDefault(); break;
      }
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        e.preventDefault(); break;
      case 'p': case 'P': window.print(); e.preventDefault(); break;
    }
  });

  // Tap/click left half → prev, right half → next. Skip when notes overlay open.
  document.addEventListener('click', function (e) {
    if (e.target.closest('a,button,.deck-notes')) return;
    if (e.clientX < window.innerWidth * 0.35) prev();
    else if (e.clientX > window.innerWidth * 0.65) next();
  });

  window.addEventListener('hashchange', function () {
    const i = parseInt(location.hash.replace('#', ''), 10);
    if (!isNaN(i)) go(i - 1);
  });

  // Restore theme preference.
  try {
    const saved = localStorage.getItem('tdbc-theme');
    if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
  } catch (_) {}

  // Initial slide from hash or 1.
  const initial = parseInt(location.hash.replace('#', ''), 10);
  go(isNaN(initial) ? 0 : initial - 1);

  // Icons.
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
})();
