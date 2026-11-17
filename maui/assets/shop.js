/* Forward Maui shop + product pages. Static: data lives in shop-data.js (FM_CATALOG, FM_ROUTES). */
(function () {
  'use strict';
  var CAT = window.FM_CATALOG || [];
  var ROUTES = window.FM_ROUTES || {};
  var byId = {};
  CAT.forEach(function (o) { byId[o.id] = o; });
  var page = document.body.getAttribute('data-page');

  var PHOTO = {
    'windsurf': ['tile-windsurf.jpg', 'A windsurfer leans back against a yellow sail'],
    'wing-foil': ['tile-wing.jpg', 'A wing foiler rides above the water at golden hour, green ridges behind'],
    'surf': ['tile-surf.jpg', 'A surfer sets a bottom turn on a clean green wave'],
    'sup': ['tile-sup.jpg', 'Two paddlers cross a flat turquoise bay at dawn']
  };
  var HEROES = {
    lookout: ['band-lookout.jpg', "Two people on a grassy lookout watch a bay full of windsurf sails along Maui's north shore"],
    sunset: ['band-sunset.jpg', 'Friends sit on lava rocks with their boards under an orange and magenta north-shore sunset'],
    whitecaps: ['band-whitecaps.jpg', 'Wing foilers and windsurfers cross open blue water streaked with whitecaps, Haleakala under clouds on the horizon'],
    dawn: ['band-dawn.jpg', 'Five surfers wait on their boards in a pastel dawn lineup']
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function photoFor(o) { return o.a && o.a.length ? PHOTO[o.a[0]] : null; }
  function priceHTML(o) {
    if (!o.p) return '<span class="pc__ask">Price on request</span>';
    var s = '';
    if (o.sale) s += '<span class="pc__was">' + esc(o.was) + '</span> ';
    s += '<span class="pc__now">' + esc(o.p) + '</span>';
    if (o.pn) s += ' <span class="pc__note">' + esc(o.pn) + '</span>';
    return s;
  }
  function addBadge(o) {
    var b = o.sale ? 'Sale' : o.bd;
    if (!b) return '';
    return '<span class="badge' + (o.sale || b === 'New' || b === 'Haiku Package' ? ' badge--coral' : '') + '">' + esc(b) + '</span>';
  }
  function calm() {
    return (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.classList.contains('reduce-motion');
  }

  /* ---------- card: the whole card is one link to the product page ---------- */
  function card(o, i) {
    var ph = photoFor(o);
    var hover = ph ? '<img class="pc__photo" src="assets/img/' + ph[0] + '" alt="" loading="lazy">' : '';
    var href = 'product.html?id=' + o.id;
    return '<a class="pc" style="--i:' + i + '" href="' + href + '"><span class="pc__top"><span class="pc__media" data-bs="' + o.bs + '"><img class="pc__gear" src="' + esc(o.g) + '" alt="" loading="lazy">' + hover + addBadge(o) + '</span></span>' +
      '<span class="pc__body"><span class="pc__brand">' + esc(o.b) + '</span><span class="pc__name">' + esc(o.n) + '</span>' +
      '<span class="pc__spec">' + esc(o.sp) + '</span><span class="pc__price">' + priceHTML(o) + '</span></span></a>';
  }

  /* ---------- editorial photo tiles interleaved in the grid ---------- */
  var TILES = [
    { img: 'band-lookout.jpg', alt: HEROES.lookout[1], key: 'lookout', h: 'Wind on the north shore', to: 'windsurf', cta: 'Explore windsurf' },
    { img: 'tile-wing.jpg', alt: PHOTO['wing-foil'][1], key: 'tile-wing', h: 'Glide days', to: 'wing-foil', cta: 'Explore wing foil' },
    { img: 'band-dawn.jpg', alt: HEROES.dawn[1], key: 'dawn', h: 'First light, full lineup', to: 'surf', cta: 'Explore surf' },
    { img: 'tile-sup.jpg', alt: PHOTO.sup[1], key: 'tile-sup', h: 'Flat water, early light', to: 'sup', cta: 'Explore SUP' },
    { img: 'band-sunset.jpg', alt: HEROES.sunset[1], key: 'sunset', h: 'After the session', to: 'apparel', cta: 'Explore apparel' },
    { img: 'tile-windsurf.jpg', alt: PHOTO.windsurf[1], key: 'tile-windsurf', h: 'Lean back, sheet in', to: 'windsurf', cta: 'Explore windsurf' },
    { img: 'tile-surf.jpg', alt: PHOTO.surf[1], key: 'tile-surf', h: 'Find your wave', to: 'surf', cta: 'Explore surf' }
  ];
  function tileHTML(t, i) {
    return '<a class="pc-tile" style="--i:' + i + '" href="shop.html#' + t.to + '"><img src="assets/img/' + t.img + '" alt="' + esc(t.alt) + '" loading="lazy">' +
      '<span class="pc-tile__shade"></span><span class="pc-tile__in"><span class="eyebrow">Maui</span><span class="h-display h-md">' + esc(t.h) + '</span>' +
      '<span class="link-arrow">' + esc(t.cta) + ' <svg><use href="#i-arrow"/></svg></span></span></a>';
  }
  /* tile n goes after the 8th product, then every 10th; never the route's hero image, never the interlude band's image, never twice in a row */
  function pickTile(n, heroKey, slug, prevKey) {
    for (var k = 0; k < TILES.length; k++) {
      var t = TILES[(n + k) % TILES.length];
      if (t.key === heroKey || t.key === prevKey || t.to === slug) continue;
      return t;
    }
    return null;
  }

  /* ======================= SHOP ======================= */
  function initShop() {
    var gridA = document.getElementById('gridA');
    var gridB = document.getElementById('gridB');
    var inter = document.getElementById('interlude');
    var note = document.getElementById('shopNote');
    var titleEl = document.getElementById('shopTitle');
    var crumb = document.getElementById('crumb');
    var lede = document.getElementById('shopLede');
    var count = document.getElementById('shopCount');
    var heroImg = document.getElementById('heroImg');
    var kidsEl = document.getElementById('kids');
    var brandBox = document.getElementById('brandChips');
    var actBox = document.getElementById('actChips');
    var sel = document.getElementById('catSelect');
    var sortSel = document.getElementById('sortSelect');
    var results = document.getElementById('results');
    var state = { slug: 'all', brand: 'all', act: 'all', sort: 'featured' };
    var firstRun = true;

    var ALL = { t: 'All gear', path: ['Shop'], ids: CAT.map(function (o) { return o.id; }), h: 'lookout',
      bl: 'Selected products from the Forward Maui catalog: windsurf, wing foil, surf and SUP gear from Goya, Quatro, KT and MFC.', k: [], par: '' };
    var BRANDS = [['goya', 'Goya'], ['quatro', 'Quatro'], ['kt', 'KT'], ['mfc', 'MFC']];
    var ACTS = [['windsurf', 'Windsurf'], ['wing-foil', 'Wing foil'], ['surf', 'Surf'], ['sup', 'SUP']];
    ALL.k = BRANDS.map(function (b) { return [b[0], { goya: 'Goya Windsurfing', quatro: 'Quatro', kt: 'KT Surfing', mfc: 'MFC Hawaii' }[b[0]], ROUTES[b[0]].ids.length]; });

    // category select
    var opts = '<option value="all">All gear (' + CAT.length + ')</option><optgroup label="Activity">';
    ACTS.forEach(function (a) { opts += '<option value="' + a[0] + '">' + a[1] + ' (' + ROUTES[a[0]].ids.length + ')</option>'; });
    opts += '</optgroup><optgroup label="Ranges">';
    function walk(slug, depth) {
      var r = ROUTES[slug];
      if (!r) return;
      opts += '<option value="' + slug + '">' + new Array(depth + 1).join('\u00a0\u00a0') + (depth ? '\u2013 ' : '') + esc(r.t) + ' (' + r.ids.length + ')</option>';
      r.k.forEach(function (k) { walk(k[0], depth + 1); });
    }
    ['goya', 'quatro', 'kt', 'mfc', 'kai-lenny-vault', 'apparel', 'spare-parts', 'on-sale', 'new'].forEach(function (s) { walk(s, 0); });
    opts += '</optgroup>';
    sel.innerHTML = opts;

    function chips(box, list, cur, key, counts) {
      var h = '<button type="button" class="chip" data-k="' + key + '" data-v="all" aria-pressed="' + (cur === 'all') + '">All</button>';
      list.forEach(function (x) {
        var n = counts[x[0]] || 0;
        h += '<button type="button" class="chip" data-k="' + key + '" data-v="' + x[0] + '" aria-pressed="' + (cur === x[0]) + '"' + (n === 0 && cur !== x[0] ? ' disabled' : '') + '>' + x[1] + ' <small>' + n + '</small></button>';
      });
      box.innerHTML = h;
    }
    function sortList(list) {
      var l = list.slice();
      if (state.sort === 'low') l.sort(function (a, b) { return (a.pf == null) - (b.pf == null) || a.pf - b.pf; });
      else if (state.sort === 'high') l.sort(function (a, b) { return (a.pf == null) - (b.pf == null) || b.pf - a.pf; });
      else if (state.sort === 'name') l.sort(function (a, b) { return a.n.localeCompare(b.n); });
      else {
        /* featured: deal one product per product type in turn, so the grid mixes boards, sails, foils and parts */
        var groups = [], at = {};
        l.forEach(function (o) { if (!(o.t in at)) { at[o.t] = groups.length; groups.push([]); } groups[at[o.t]].push(o); });
        l = [];
        for (var r = 0; l.length < list.length; r++) groups.forEach(function (g) { if (g[r]) l.push(g[r]); });
      }
      return l;
    }
    function setHero(key) {
      var h = HEROES[key] || HEROES.whitecaps;
      if (!heroImg || heroImg.getAttribute('data-key') === key) return;
      if (firstRun) { heroImg.src = 'assets/img/' + h[0]; heroImg.alt = h[1]; heroImg.setAttribute('data-key', key); return; }
      heroImg.classList.add('is-swap');
      window.setTimeout(function () {
        heroImg.src = 'assets/img/' + h[0]; heroImg.alt = h[1]; heroImg.setAttribute('data-key', key);
        heroImg.classList.remove('is-swap');
      }, 260);
    }
    function render() {
      var r = state.slug === 'all' ? ALL : ROUTES[state.slug];
      var base = r.ids.map(function (id) { return byId[id]; });
      var bc = {}, ac = {};
      base.forEach(function (o) { bc[o.bs] = (bc[o.bs] || 0) + 1; o.a.forEach(function (a) { ac[a] = (ac[a] || 0) + 1; }); });
      var list = base.filter(function (o) {
        return (state.brand === 'all' || o.bs === state.brand) && (state.act === 'all' || o.a.indexOf(state.act) > -1);
      });
      list = sortList(list);

      titleEl.textContent = r.t;
      crumb.textContent = r.path.length > 1 ? r.path.slice(0, -1).join(' / ') : (state.slug === 'all' ? 'Forward Maui shop' : 'Shop');
      var bl = r.bl || (base.length ? 'The ' + r.t + ' range at Forward Maui.' : '');
      lede.textContent = bl;
      document.title = r.t + ' | Forward Maui Shop, Haiku, Maui';
      var shown = list.length;
      count.textContent = base.length ? (shown === base.length ? shown + (shown === 1 ? ' product' : ' products') : shown + ' of ' + base.length + ' products') : 'Coming to you on request';
      setHero(r.h);
      chips(brandBox, BRANDS, state.brand, 'brand', bc);
      chips(actBox, ACTS, state.act, 'act', ac);
      sel.value = state.slug;
      sortSel.value = state.sort;

      // sub-ranges
      var kh = '';
      var kidList = r.k;
      var label = 'Browse';
      if (!kidList.length && r.par && ROUTES[r.par]) { kidList = ROUTES[r.par].k; label = 'Also in ' + ROUTES[r.par].t; }
      if (kidList.length) {
        kh = '<span class="kids__label">' + esc(label) + '</span>';
        kidList.forEach(function (k) {
          kh += '<a class="kid' + (k[0] === state.slug ? ' is-on' : '') + '" href="#' + k[0] + '">' + esc(k[1]) + ' <small>' + k[2] + '</small></a>';
        });
      }
      kidsEl.innerHTML = kh;
      kidsEl.hidden = !kh;

      // grids
      var ha = '', hb = '', tn = 0, prevKey = '';
      var split = list.length > 16 ? 14 : list.length;
      list.forEach(function (o, i) {
        var inA = i < split;
        var h = card(o, inA ? i : i - split);
        var pos = i + 1;
        if (list.length >= 8 && pos >= 8 && (pos - 8) % 10 === 0) {
          var t = pickTile(tn, r.h, state.slug, prevKey);
          if (t) { h += tileHTML(t, inA ? i : i - split); prevKey = t.key; tn++; }
        }
        if (inA) ha += h; else hb += h;
      });
      gridA.innerHTML = ha;
      gridB.innerHTML = hb;
      gridA.hidden = !ha;
      gridB.hidden = !hb;
      inter.hidden = !hb;

      // notes: empty range, empty filter combination, on-sale tail
      var nh = '';
      if (!base.length) {
        var rel = '';
        var near = (r.par && ROUTES[r.par]) ? ROUTES[r.par] : null;
        var nearSlug = r.par;
        if (near) rel = '<a class="link-arrow" href="#' + nearSlug + '">More from ' + esc(near.t) + ' <svg><use href="#i-arrow"/></svg></a>';
        if (state.slug === 'on-sale') {
          nh = noteHTML('End-of-season deals', 'Ask about end-of-season deals', 'Tell us what you are after and we will let you know what is on offer.', rel);
        } else {
          nh = noteHTML(r.t, 'Ask us about this range', "We can get you the details. Tell us what you're after and we'll come back to you.", rel);
        }
      } else if (!list.length) {
        nh = noteHTML(r.t, 'Nothing matches those filters', 'Try another brand or activity, or ask us and we will point you to the right gear.', '<button type="button" class="link-arrow" data-reset>Clear filters <svg><use href="#i-arrow"/></svg></button>');
      } else if (state.slug === 'on-sale') {
        nh = noteHTML('Ask the shop', 'Ask about end-of-season deals', 'Ask us about current sale pricing and availability.', '');
      }
      note.innerHTML = nh;
      note.hidden = !nh;
      results.setAttribute('aria-busy', 'false');
    }
    function noteHTML(eyebrow, title, text, extra) {
      return '<div class="shop-note"><div><p class="eyebrow">' + esc(eyebrow) + '</p><h2 class="h-display h-md">' + esc(title) + '</h2><p class="lede">' + esc(text) + '</p></div>' +
        '<div class="shop-note__act"><a class="btn btn--ink" href="contact.html">Ask the shop <svg><use href="#i-arrow"/></svg></a>' + extra + '</div></div>';
    }
    function route() {
      var slug = decodeURIComponent((location.hash || '').replace(/^#/, '')).toLowerCase();
      if (!slug || slug === 'all' || !ROUTES[slug]) slug = 'all';
      var changed = slug !== state.slug;
      state.slug = slug;
      if (changed) { state.brand = 'all'; state.act = 'all'; }
      render();
      if (!firstRun && changed) {
        var top = results.getBoundingClientRect().top + window.scrollY - 150;
        if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: calm() ? 'auto' : 'smooth' });
      }
      firstRun = false;
    }
    document.addEventListener('click', function (e) {
      var c = e.target.closest ? e.target.closest('.chip') : null;
      if (c && !c.disabled) {
        state[c.getAttribute('data-k')] = c.getAttribute('data-v');
        render();
        return;
      }
      if (e.target.closest && e.target.closest('[data-reset]')) { state.brand = 'all'; state.act = 'all'; render(); }
    });
    sel.addEventListener('change', function () { location.hash = sel.value === 'all' ? 'all' : sel.value; });
    sortSel.addEventListener('change', function () { state.sort = sortSel.value; render(); });
    window.addEventListener('hashchange', route);
    route();
  }

  /* ======================= PRODUCT ======================= */
  function initProduct() {
    var m = /[?&]id=(\d+)/.exec(location.search);
    var id = m ? parseInt(m[1], 10) : 0;
    var o = byId[id] || byId[0];
    var route = ROUTES[o.c] || { t: '', path: [] };
    var ph = photoFor(o);
    var isHaiku = /Haiku Package/i.test(o.n);
    document.title = o.n + ' | Forward Maui Shop';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', o.n + ' by ' + o.b + (o.p ? ', ' + o.p : '') + '. ' + o.sp + '. Forward Maui, Haiku, Maui.');

    var bc = '<a href="shop.html">Shop</a><span>/</span><a href="shop.html#' + (o.bs) + '">' + esc(o.bs === 'goya' ? 'Goya Windsurfing' : o.b) + '</a>';
    if (ROUTES[o.c]) bc += '<span>/</span><a href="shop.html#' + o.c + '">' + esc(route.t) + '</a>';
    bc += '<span>/</span><b>' + esc(o.n) + '</b>';
    document.getElementById('crumbs').innerHTML = bc;

    var lifeSrc = ph ? ph[0] : 'band-sunset.jpg';
    var lifeAlt = ph ? ph[1] : HEROES.sunset[1];
    var photoHTML = '<figure class="pdp__photo"><img src="assets/img/' + lifeSrc + '" alt="' + esc(lifeAlt) + '" loading="eager"' + (ph ? '' : ' style="object-position:30% 50%"') + '><span class="pdp__tag">Lifestyle image</span></figure>';
    document.getElementById('gallery').innerHTML = '<figure class="pdp__gear"><img src="' + esc(o.g) + '" alt="' + esc(o.n) + ', representative gear photo" loading="eager">' +
      (o.bd || o.sale ? '<span class="pdp__badge">' + addBadge(o) + '</span>' : '') +
      '<span class="pdp__tag">Illustrative product image</span><figcaption>' + esc(o.sp) + '</figcaption></figure>' + photoHTML +
      '<p class="pdp__note">Product images are illustrative and do not show the listed model.</p>';

    var buy = '<p class="eyebrow">' + esc(o.b) + '</p><h1 class="h-display h-lg pdp__title">' + esc(o.n) + '</h1>';
    buy += '<p class="pdp__spec">' + esc(o.sp) + '</p>';
    buy += '<p class="pdp__price" id="pdpPrice">' + priceHTML(o) + '</p>';
    if (o.o) {
      buy += '<fieldset class="opts"><legend>' + esc(o.ol) + '</legend><div class="opts__row">';
      o.o.forEach(function (x, i) {
        buy += '<button type="button" class="chip" data-opt="' + i + '" aria-pressed="' + (i === 0) + '">' + esc(x[0]) + '</button>';
      });
      buy += '</div></fieldset>';
    }
    var subject = encodeURIComponent(o.n + ' (Forward Maui)');
    buy += '<div class="pdp__cta">' +
      '<a class="btn btn--ink btn--block" href="mailto:vickey.abbott@forwardmaui.com?subject=' + subject + '">Ask about this item <svg><use href="#i-arrow"/></svg></a>' +
      '<a class="btn btn--line btn--block" href="https://www.forwardmaui.com/shop/" target="_blank" rel="noopener">Dealer sign in <svg><use href="#i-key"/></svg></a></div>';
    buy += '<ul class="pdp__facts"><li><svg><use href="#i-box"/></svg><span>Browse the catalog here. Dealer orders are placed through the Forward Maui dealer store.</span></li>' +
      '<li><svg><use href="#i-key"/></svg><span>Dealer orders are confirmed with a final invoice that includes shipping fees.</span></li></ul>';
    document.getElementById('buy').innerHTML = buy;

    if (o.o) {
      document.getElementById('buy').addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('[data-opt]') : null;
        if (!b) return;
        var x = o.o[parseInt(b.getAttribute('data-opt'), 10)];
        Array.prototype.forEach.call(document.querySelectorAll('[data-opt]'), function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        document.getElementById('pdpPrice').innerHTML = '<span class="pc__now">' + esc(x[1]) + '</span> <span class="pc__note">SRP</span>';
      });
    }

    // accordion
    var det = '';
    if (o.d) det += '<p>' + esc(o.d) + '</p>';
    if (o.x) det += '<p>' + esc(o.x) + '</p>';
    det += '<dl class="facts"><div><dt>Brand</dt><dd>' + esc(o.b) + '</dd></div>' +
      (ROUTES[o.c] ? '<div><dt>Range</dt><dd>' + esc(route.t) + '</dd></div>' : '') +
      '<div><dt>Spec</dt><dd>' + esc(o.sp) + '</dd></div>' +
      '<div><dt>Price</dt><dd>' + (o.p ? esc(o.sale ? o.p + ' (was ' + o.was + ')' : o.p) + (o.pn ? ' · ' + esc(o.pn) : '') : 'On request') + '</dd></div></dl>';
    var acc = '<details open><summary>Details</summary><div class="acc__body">' + det + '</div></details>';
    if (isHaiku) {
      acc += '<details><summary>What is a Haiku Package?</summary><div class="acc__body"><p>Haiku Package is the name Goya and Quatro give to the flagship builds at the top of their wind board ranges: the Polakow by Quatro, the One 13 and the Custom Thruster 5 by Goya. All three list at $3,345.</p><p>The Goya builds use the proprietary Pro Carbon Haiku package\u2122 construction. Ask us about the rest of the line.</p></div></details>';
    }
    acc += '<details><summary>Orders and delivery</summary><div class="acc__body"><p>Dealer orders are confirmed with a final invoice that includes shipping fees.</p><p>The webstore is for Goya, Quatro, MFC and KT dealers.</p></div></details>';
    acc += '<details><summary>Need a hand?</summary><div class="acc__body"><p>Questions on sizing, availability or a bundle? Use the <a class="inline" href="contact.html">contact page</a> or write to <a class="inline" href="mailto:vickey.abbott@forwardmaui.com">vickey.abbott@forwardmaui.com</a>.</p></div></details>';
    document.getElementById('acc').innerHTML = acc;

    // more to explore
    var seen = {}, rel = [];
    seen[o.id] = 1;
    function pull(fn) { CAT.forEach(function (x) { if (!seen[x.id] && rel.length < 8 && fn(x)) { seen[x.id] = 1; rel.push(x); } }); }
    pull(function (x) { return x.c === o.c; });
    pull(function (x) { return o.a.length && x.a.indexOf(o.a[0]) > -1 && x.bs === o.bs; });
    pull(function (x) { return o.a.length && x.a.indexOf(o.a[0]) > -1; });
    pull(function (x) { return x.bs === o.bs; });
    var rh = '';
    rel.slice(0, 7).forEach(function (x) {
      rh += '<a class="spec" href="product.html?id=' + x.id + '"><span class="spec__top"><span>' + esc(x.b) + '</span>' + (x.sale ? '<span class="badge badge--coral">Sale</span>' : '') + '</span>' +
        '<span class="spec__board"><img src="' + esc(x.g) + '" alt="" loading="lazy"></span><span class="spec__name">' + esc(x.n) + '</span><span class="spec__meta">' + esc(x.sp) + '</span>' +
        '<span class="spec__foot"><span>' + esc(x.p || 'Price on request') + '</span><svg><use href="#i-arrow"/></svg></span></a>';
    });
    document.getElementById('rideRail').innerHTML = rh;

    // closing band link
    var link = document.getElementById('bandLink');
    var act = o.a[0];
    var key = { windsurf: 'lookout', 'wing-foil': 'sunset', surf: 'whitecaps', sup: 'dawn' }[act] || 'whitecaps';
    var bi = document.getElementById('bandImg');
    bi.src = 'assets/img/' + HEROES[key][0]; bi.alt = HEROES[key][1];
    if (act) {
      link.href = 'shop.html#' + act;
      link.firstChild.nodeValue = 'Explore ' + ({ windsurf: 'windsurf', 'wing-foil': 'wing and foil', surf: 'surf', sup: 'SUP' }[act]) + ' ';
    }
  }

  if (page === 'shop') initShop(); else if (page === 'product') initProduct();
})();
