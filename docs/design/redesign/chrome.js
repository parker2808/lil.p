// Shared public chrome (SiteHeader + SiteFooter) for the static mockups.
// In the app these come from GET /api/public/site (settings, nav.header,
// nav.footer, socialLinks). Not product code.
(function () {
  var nav = [
    ['home', 'Home', 'home.html'],
    ['about', 'About', 'about.html'],
    ['projects', 'Projects', 'projects.html'],
    ['notes', 'Notes', 'notes.html'],
    ['contact', 'Contact', 'contact.html'],
  ];
  var active = document.body.getAttribute('data-page');

  var h = document.querySelector('[data-chrome="header"]');
  if (h) {
    var links = nav.map(function (n, i) {
      return '<a href="' + n[2] + '"' + (n[0] === active ? ' aria-current="page"' : '') + '><span class="nav-num">0' + (i + 1) + '</span>' + n[1] + '</a>';
    }).join('');
    h.outerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="container">' +
      '<a class="wordmark" href="home.html"><span class="monogram">P</span>Parker Vu</a>' +
      '<nav class="nav" aria-label="Primary">' + links + '<span class="nav-ink" aria-hidden="true"></span></nav>' +
      '<div class="header-tools">' +
      '<button class="icon-btn search-btn kbd-wrap" aria-label="Search (Ctrl K)"><span class="kbd">⌘</span><span class="kbd">K</span></button>' +
      '<div class="seg" role="group" aria-label="Language"><a href="#" aria-current="true">EN</a><a href="#" lang="vi">VI</a></div>' +
      '<button class="icon-btn" data-theme-toggle aria-label="Toggle theme"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>' +
      '<button class="icon-btn menu-btn" aria-label="Open menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button>' +
      '</div></div></header>';
  }

  var f = document.querySelector('[data-chrome="footer"]');
  if (f) {
    f.outerHTML =
      '<footer class="site-footer"><div class="container"><div class="cols">' +
      '<div class="about"><p class="muted" style="max-width:40ch">Built with Next.js and NestJS. Content lives in the admin.</p><p class="meta" style="margin-top:16px">Last published · Oct 27, 2026</p></div>' +
      '<nav aria-label="Footer"><span class="meta">Site</span><a href="home.html">Home</a><a href="about.html">About</a><a href="projects.html">Projects</a></nav>' +
      '<nav aria-label="More"><span class="meta">More</span><a href="notes.html">Notes</a><a href="contact.html">Contact</a><a href="#">RSS</a></nav>' +
      '<nav aria-label="Social"><span class="meta">Elsewhere</span><a href="#">GitHub ↗</a><a href="#">Email</a></nav>' +
      '</div><div class="mega" aria-hidden="true">Parker <em>Vu</em></div>' +
      '<div class="base"><span class="meta">© 2026 Parker Vu</span><span class="meta">EN · VI</span></div></div></footer>' +
      '<div class="mock-bar"><a href="index.html">Index</a><button data-theme-toggle>Theme</button></div>';
  }
})();
