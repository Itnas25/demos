/* Forward Maui — interactions. Vanilla JS, no dependencies.
   Motion is skipped when the visitor prefers reduced motion or when
   <html> carries the class "reduce-motion". */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function calm() { return mq.matches || root.classList.contains('reduce-motion'); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---- header: transparent over the hero, solid after ---- */
  var header = $('.header');
  function headerState() {
    if (header && !header.classList.contains('header--solid')) {
      header.classList.toggle('is-solid', window.scrollY > 24);
    }
  }

  /* ---- mobile drawer ---- */
  var drawer = $('#drawer');
  var burger = $('#burger');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (burger) burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var c = $('[data-drawer-close]', drawer); if (c) c.focus(); } else if (burger) { burger.focus(); }
  }
  if (burger) burger.addEventListener('click', function () { setDrawer(true); });
  $$('[data-drawer-close]').forEach(function (el) { el.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* ---- staggered reveal on scroll ---- */
  $$('[data-stagger]').forEach(function (group) {
    $$('[data-reveal]', group).forEach(function (el, i) {
      el.style.setProperty('--d', (Math.min(i, 8) * 0.09).toFixed(2) + 's');
    });
  });
  var revealEls = $$('[data-reveal]');
  function showAll() { revealEls.forEach(function (el) { el.classList.add('is-in', 'is-done'); }); }
  function reveal(el) {
    el.classList.add('is-in');
    var wait = (parseFloat(el.style.getPropertyValue('--d')) || 0) * 1000 + 1000;
    // once the entrance has played, hand the element back to its own hover transitions
    window.setTimeout(function () { el.classList.add('is-done'); }, wait);
  }
  if (calm() || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { reveal(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- scroll-driven motion: hero drift, band parallax, scroll-linked band ---- */
  var heroMedia = $('.hero__media');
  var hero = $('.hero');
  var parallax = $$('[data-parallax]');
  var linked = $$('[data-scroll-band]');
  var ticking = false;

  function frame() {
    ticking = false;
    headerState();
    if (calm()) return;
    var vh = window.innerHeight;
    var y = window.scrollY;

    if (heroMedia && hero && y < hero.offsetHeight + 200) {
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
    }
    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var off = (r.top + r.height / 2) - vh / 2;            // distance from viewport centre
      var max = r.height * 0.1;
      var py = Math.max(-max, Math.min(max, off * -0.12));
      el.style.setProperty('--py', py.toFixed(1));
    });
    linked.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (vh - r.top) / (vh + r.height);                // 0 entering, 1 leaving
      el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
    });
  }
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* ---- rails: arrow buttons ---- */
  $$('[data-rail]').forEach(function (wrap) {
    var rail = $('.rail', wrap);
    var prev = $('[data-rail-prev]', wrap);
    var next = $('[data-rail-next]', wrap);
    if (!rail || !prev || !next) return;
    function step(dir) {
      var card = rail.children[1] || rail.children[0];
      var dist = card ? (card.getBoundingClientRect().width + 16) * 2 : 400;
      rail.scrollBy({ left: dir * dist, behavior: calm() ? 'auto' : 'smooth' });
    }
    function update() {
      prev.disabled = rail.scrollLeft < 8;
      next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8;
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---- newsletter (preview: nothing is sent, and the page says so) ---- */
  $$('form.news').forEach(function (form) {
    var row = $('.news__row', form);
    var msg = $('.news__msg', form);
    if (row && !$('.news__note', form)) {
      var note = document.createElement('p');
      note.className = 'news__note';
      note.textContent = "Preview only: this demo doesn't send sign-ups.";
      row.parentNode.insertBefore(note, row.nextSibling);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input[type="email"]', form);
      if (!input || !msg) return;
      var ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim());
      msg.textContent = ok ? "Thanks. This preview doesn't send sign-ups yet." : 'Enter a valid email address.';
      if (ok) input.value = '';
    });
  });
})();
