// Admin shell (sidebar + topbar) for the static mockups. Groups and items
// mirror apps/web/src/modules/admin-core/constants/admin-nav.constant.ts.
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
    site: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    pages: 'M3 3h18v18H3zM3 9h18M9 21V9',
    profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    media: 'M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
    analytics: 'M3 3v18h18M7 14l4-4 4 4 5-6',
    audit: 'M12 8v4l3 3M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  };
  var groups = [
    ['Workspace', [['dashboard', 'Dashboard', 'admin-dashboard.html'], ['inbox', 'Inbox', 'admin-inbox.html', '2']]],
    ['Content', [['projects', 'Projects', 'admin-projects.html', '5', 1], ['posts', 'Posts', '#'], ['experience', 'Experience', '#'], ['education', 'Education', '#'], ['principles', 'Principles', '#'], ['skills', 'Skills', '#'], ['tags', 'Tags', '#'], ['domains', 'Domains', '#'], ['process', 'Process', '#'], ['stats', 'Stats', '#']]],
    ['Site', [['site', 'Site settings', '#'], ['pages', 'Pages', 'admin-pages.html'], ['profile', 'Profile', '#'], ['media', 'Media', 'admin-media.html']]],
    ['Insights', [['analytics', 'Analytics', '#'], ['audit', 'Audit log', '#']]],
    ['Access', [['users', 'Users', '#']]],
  ];
  var active = document.body.getAttribute('data-nav');
  var crumbs = document.body.getAttribute('data-crumbs') || 'Admin';
  var svg = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>'; };

  var side = document.querySelector('[data-admin="side"]');
  if (side) {
    side.outerHTML = '<aside class="side" aria-label="Admin navigation">' +
      '<div class="brand"><span class="monogram" style="width:28px;height:28px;font-size:13px">P</span><b>Portfolio CMS</b><span class="env">LIVE</span></div>' +
      '<nav>' + groups.map(function (g) {
        return '<div class="grp"><span>' + g[0] + '</span>' + g[1].map(function (it) {
          var badge = it[3] ? '<span class="badge' + (it[4] ? ' badge--muted' : '') + '">' + it[3] + '</span>' : '';
          return '<a href="' + it[2] + '"' + (it[0] === active ? ' aria-current="page"' : '') + '>' + svg(I[it[0]]) + it[1] + badge + '</a>';
        }).join('') + '</div>';
      }).join('') + '</nav>' +
      '<div class="foot"><span class="avatar">P</span><div style="line-height:1.2"><b style="font-weight:500">Parker</b><br /><span class="meta">admin</span></div><button class="icon-btn" style="margin-left:auto;width:28px;height:28px" aria-label="Collapse sidebar">⟨</button></div>' +
      '</aside>';
  }

  var top = document.querySelector('[data-admin="top"]');
  if (top) {
    top.outerHTML = '<div class="top">' +
      '<button class="icon-btn" style="display:none" aria-label="Menu">≡</button>' +
      '<nav class="crumbs" aria-label="Breadcrumb">' + crumbs.split('/').map(function (c, i, a) { return i === a.length - 1 ? '<span aria-current="page" style="color:var(--ink)">' + c + '</span>' : '<a href="admin-dashboard.html">' + c + '</a><span>/</span>'; }).join('') + '</nav>' +
      '<button class="cmd" aria-label="Command palette"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>Jump to, create, publish…<span class="kbd">⌘K</span></button>' +
      '<a class="btn btn--ghost btn--sm" href="home.html">View site ↗</a>' +
      '<button class="icon-btn" aria-label="Notifications"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg><span class="dot-badge"></span></button>' +
      '<button class="icon-btn" data-theme-toggle aria-label="Toggle theme"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>' +
      '</div>';
  }
})();
