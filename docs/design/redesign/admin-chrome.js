// Admin shell for the static mockups, modelled on the interview-fe KB page:
// fixed top bar, roman-numeral sidebar, mobile drawer, DocSearch-style
// command palette. Groups and items mirror
// apps/web/src/modules/admin-core/constants/admin-nav.constant.ts.
// Review params: ?drawer=1 opens the drawer, ?palette=1 opens the palette.
(function () {
  var I = {
    dashboard: 'M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z',
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z',
    projects: 'M3 7h18v13H3zM8 7V4h8v3',
    posts: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',
    experience: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
    education: 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5',
    principles: 'M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z',
    skills: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    tags: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
    domains: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
    process: 'M5 12h14M13 6l6 6-6 6',
    stats: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    site: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4',
    pages: 'M3 3h18v18H3zM3 9h18M9 21V9',
    profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    media: 'M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
    analytics: 'M3 3v18h18M7 14l4-4 4 4 5-6',
    audit: 'M12 8v4l3 3M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
    plus: 'M12 5v14M5 12h14',
  };
  // [key, label, href, count, mutedCount]; counts come from GET /api/admin/stats
  var groups = [
    ['I. Workspace', [['dashboard', 'Dashboard', 'admin-dashboard.html'], ['inbox', 'Inbox', 'admin-inbox.html', '2']]],
    ['II. Content', [['projects', 'Projects', 'admin-projects.html', '5', 1], ['posts', 'Posts', '#', '2', 1], ['experience', 'Experience', '#'], ['education', 'Education', '#'], ['principles', 'Principles', '#'], ['skills', 'Skills', '#'], ['tags', 'Tags', '#'], ['domains', 'Domains', '#'], ['process', 'Process', '#'], ['stats', 'Stats', '#']]],
    ['III. Site', [['site', 'Site settings', '#'], ['pages', 'Pages', 'admin-pages.html'], ['profile', 'Profile', '#'], ['media', 'Media', 'admin-media.html']]],
    ['IV. Insights', [['analytics', 'Analytics', '#'], ['audit', 'Audit log', '#']]],
    ['V. Access', [['users', 'Users', '#']]],
  ];
  var body = document.body;
  var active = body.getAttribute('data-nav');
  var crumbs = (body.getAttribute('data-crumbs') || 'Admin').split('/');
  var svg = function (d, s) { return '<svg width="' + (s || 16) + '" height="' + (s || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };

  function navHTML() {
    return groups.map(function (g) {
      return '<div class="nav-grp"><span>' + g[0] + '</span>' + g[1].map(function (it) {
        var badge = it[3] ? '<span class="count' + (it[4] ? ' count--muted' : '') + '">' + it[3] + '</span>' : '';
        return '<a class="nav-it" href="' + it[2] + '"' + (it[0] === active ? ' aria-current="page"' : '') + '>' + svg(I[it[0]]) + '<span class="lbl">' + it[1] + '</span>' + badge + '</a>';
      }).join('') + '</div>';
    }).join('');
  }
  var foot = '<div class="side-foot"><span class="avatar">P</span><div style="line-height:1.25;min-width:0"><b style="font-weight:600">Parker</b><br /><span class="meta" style="font-size:12px">admin</span></div><a class="btn btn--ghost btn--sm" style="margin-left:auto" href="admin-login.html">Sign out</a></div>';

  var side = document.querySelector('[data-admin="side"]');
  if (side) side.outerHTML = '<nav class="pane pane-side" aria-label="Admin">' + navHTML() + foot + '</nav>';

  var top = document.querySelector('[data-admin="top"]');
  if (top) {
    top.outerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="app-top">' +
      '<button class="icon-btn only-mobile" data-drawer-open aria-label="Open navigation">' + svg('M4 7h16M4 12h16M4 17h16') + '</button>' +
      '<a class="brand" href="admin-dashboard.html" aria-label="Admin home"><span class="monogram">P</span><b class="hide-mobile">Portfolio CMS</b></a>' +
      '<nav class="crumbs" aria-label="Breadcrumb">' + crumbs.map(function (c, i) {
        return i === crumbs.length - 1 ? '<span aria-current="page" style="color:var(--ink)">' + c + '</span>' : '<span>' + c + '</span><span aria-hidden="true">/</span>';
      }).join('') + '</nav>' +
      '<span class="grow"></span>' +
      '<button class="doc-search-btn" data-palette-open aria-label="Search and commands (Ctrl K)">' + svg(I.search, 15) + '<span class="label">Search or jump to…</span><span class="kbd">⌘K</span></button>' +
      '<a class="btn btn--ghost btn--sm hide-mobile" href="home.html">View site ↗</a>' +
      '<button class="icon-btn" aria-label="Notifications, 2 unread">' + svg('M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0', 15) + '<span class="dot-badge"></span></button>' +
      '<button class="icon-btn" data-theme-toggle aria-label="Toggle theme">' + svg('M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z', 15) + '</button>' +
      '<div class="route-progress" data-route-progress aria-hidden="true"><i></i></div>' +
      '</header>' +
      '<div class="drawer-backdrop" data-drawer-close></div>' +
      '<div class="drawer" role="dialog" aria-modal="true" aria-label="Navigation"><header><b>Portfolio CMS</b><button class="icon-btn" data-drawer-close aria-label="Close navigation">×</button></header><nav class="pane pane-side" aria-label="Admin">' + navHTML() + foot + '</nav></div>' +
      '<div class="palette-backdrop" data-palette-close><div class="palette" role="dialog" aria-modal="true" aria-label="Command palette" onclick="event.stopPropagation()">' +
      '<label class="q">' + svg(I.search) + '<input value="parti" aria-label="Search" aria-controls="pal-list" aria-activedescendant="pal-1" /><span class="kbd">Esc</span></label>' +
      '<div class="list" id="pal-list" role="listbox">' +
      '<div class="grp-l">Content</div>' +
      '<div class="opt" role="option" id="pal-1" aria-selected="true">' + svg(I.projects) + '<b><mark>Parti</mark>cula v2: Vue 2 → Nuxt 3</b><span class="st st--draft">DRAFT</span></div>' +
      '<div class="opt" role="option">' + svg(I.posts) + '<b>Strangler routes in Nuxt 3 (<mark>parti</mark>al rewrites)</b><span class="meta">Post</span></div>' +
      '<div class="grp-l">Go to</div>' +
      '<div class="opt" role="option">' + svg(I.pages) + '<b>Pages · Home</b><span class="kbd">G H</span></div>' +
      '<div class="opt" role="option">' + svg(I.media) + '<b>Media</b><span class="kbd">G M</span></div>' +
      '<div class="grp-l">Actions</div>' +
      '<div class="opt" role="option">' + svg(I.plus) + '<b>New project</b><span class="kbd">N P</span></div>' +
      '<div class="skel skel-row" aria-hidden="true"></div>' +
      '</div>' +
      '<div class="foot"><span><span class="kbd">↑</span> <span class="kbd">↓</span> move</span><span><span class="kbd">↵</span> open</span><span style="margin-left:auto">Diacritics-insensitive: “viet” finds “Việt”</span></div>' +
      '</div></div>';
  }

  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  if (params.get('drawer') === '1') root.classList.add('drawer-open');
  if (params.get('palette') === '1') root.classList.add('palette-open');
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-drawer-open],[data-drawer-close],[data-palette-open],[data-palette-close]');
    if (!t) return;
    if (t.hasAttribute('data-drawer-open')) root.classList.add('drawer-open');
    if (t.hasAttribute('data-drawer-close')) root.classList.remove('drawer-open');
    if (t.hasAttribute('data-palette-open')) { root.classList.add('palette-open'); var q = document.querySelector('.palette input'); if (q) q.focus(); }
    if (t.hasAttribute('data-palette-close')) root.classList.remove('palette-open');
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); root.classList.toggle('palette-open'); }
    if (e.key === 'Escape') root.classList.remove('palette-open', 'drawer-open');
  });
})();
