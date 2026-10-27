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
