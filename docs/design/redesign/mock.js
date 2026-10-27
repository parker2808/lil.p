// Review helpers for the static mockups. Not product code.
(function () {
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  if (params.get('dark') === '1') root.classList.add('dark');
  if (params.get('capture') === '1') root.classList.add('capture');

  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var flip = function () {
        root.classList.toggle('dark');
        var u = new URL(location.href);
        if (root.classList.contains('dark')) u.searchParams.set('dark', '1'); else u.searchParams.delete('dark');
        history.replaceState(null, '', u);
      };
      // Circular reveal from the click point (same-document View Transition).
      if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return flip();
      root.style.setProperty('--cx', e.clientX + 'px');
      root.style.setProperty('--cy', e.clientY + 'px');
      root.dataset.vt = 'theme';
      document.startViewTransition(flip).finished.finally(function () { delete root.dataset.vt; });
    });
  });

  // Progressive reveal: only hides elements once JS runs, never above the fold.
  if ('IntersectionObserver' in window && !root.classList.contains('capture')) {
    root.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  // Live local time in the status card (Profile.timezone).
  document.querySelectorAll('[data-local-time]').forEach(function (el) {
    var tz = el.getAttribute('data-local-time');
    var tick = function () {
      el.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date()) + ' GMT+7';
    };
    tick();
    setInterval(tick, 30000);
  });

  // Loading-state review aids: ?intro=1 plays the first-visit curtain,
  // ?progress=1 freezes the route bar mid-way, buttons simulate states.
  if (params.get('intro') === '1' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('intro');
    document.body.insertAdjacentHTML('afterbegin', '<div class="intro-curtain" aria-hidden="true"><div class="mark"><span class="monogram">P</span><span class="stroke"></span></div></div>');
    setTimeout(function () { root.classList.remove('intro'); }, 900);
  }
  var bars = document.querySelectorAll('[data-route-progress]');
  if (params.get('progress') === '1') bars.forEach(function (b) { b.dataset.state = 'frozen'; });
  document.querySelectorAll('[data-sim-nav]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      bars.forEach(function (b) { b.dataset.state = 'loading'; });
      setTimeout(function () { bars.forEach(function (b) { b.dataset.state = 'done'; }); }, 1600);
      setTimeout(function () { bars.forEach(function (b) { delete b.dataset.state; }); }, 2200);
    });
  });
  document.querySelectorAll('[data-sim-busy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-busy') === 'true') return;
      var html = btn.innerHTML;
      var live = document.querySelector('[data-live]');
      btn.setAttribute('aria-busy', 'true');
      btn.setAttribute('aria-disabled', 'true');
      if (live) live.textContent = btn.getAttribute('data-busy-label') || 'Working…';
      setTimeout(function () {
        btn.removeAttribute('aria-busy');
        btn.removeAttribute('aria-disabled');
        var done = btn.getAttribute('data-done-label');
        if (!done) { btn.innerHTML = html; return; }
        btn.dataset.state = 'done';
        btn.textContent = done;
        if (live) live.textContent = done;
        setTimeout(function () { delete btn.dataset.state; btn.innerHTML = html; }, 1400);
      }, 1500);
    });
  });
  document.querySelectorAll('[data-lqip-replay]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.querySelector(btn.getAttribute('data-lqip-replay'));
      if (!el) return;
      el.classList.remove('is-loaded');
      setTimeout(function () { el.classList.add('is-loaded'); }, 1200);
    });
  });

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var label = btn.querySelector('[data-copy-label]');
      if (!label) return;
      var prev = label.textContent;
      label.textContent = 'Copied';
      setTimeout(function () { label.textContent = prev; }, 1600);
    });
  });
})();
