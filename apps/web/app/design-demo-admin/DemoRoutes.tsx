/** @jsxImportSource ./demo-jsx */
'use client';

/* eslint-disable react/jsx-no-literals -- Fictional content in the isolated visual fixture. */

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Filter,
  Globe2,
  GripVertical,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { createPageSchema } from '@portfolio/contracts';

export type DemoCreatedPage = {
  title: string;
  key: string;
  locale: 'en' | 'vi';
  template: 'starter' | 'empty';
};

function slugFromTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const demoRoutes = {
  analytics: {
    title: 'Analytics',
    eyebrow: 'INSIGHTS / ANALYTICS',
    subtitle: 'Understand what people are connecting with.',
    kind: 'analytics',
  },
  stats: {
    title: 'Stats',
    eyebrow: 'INSIGHTS / STATS',
    subtitle: 'The numbers that tell your story.',
    kind: 'stats',
  },
  projects: {
    title: 'Projects',
    eyebrow: 'CONTENT / PROJECTS',
    subtitle: 'Work you want the world to see.',
    kind: 'table',
  },
  'projects-new': {
    title: 'New project',
    eyebrow: 'CONTENT / PROJECTS',
    subtitle: 'Start with the story you want to tell.',
    kind: 'project-form',
  },
  'projects-edit': {
    title: 'Systems Atlas',
    eyebrow: 'CONTENT / PROJECTS',
    subtitle: 'Shape this project before it goes live.',
    kind: 'project-form',
  },
  posts: {
    title: 'Posts & notes',
    eyebrow: 'CONTENT / POSTS',
    subtitle: 'Small thoughts and longer stories.',
    kind: 'table',
  },
  'posts-new': {
    title: 'New post',
    eyebrow: 'CONTENT / POSTS',
    subtitle: 'Write something worth sharing.',
    kind: 'post-form',
  },
  'posts-edit': {
    title: 'Designing for quiet',
    eyebrow: 'CONTENT / POSTS',
    subtitle: 'Refine your story before publishing.',
    kind: 'post-form',
  },
  pages: {
    title: 'Pages',
    eyebrow: 'CONTENT / PAGES',
    subtitle: 'Shape the spaces people visit most.',
    kind: 'pages',
  },
  experience: {
    title: 'Experience',
    eyebrow: 'ABOUT / EXPERIENCE',
    subtitle: 'The work and teams that shaped your path.',
    kind: 'table',
  },
  'experience-new': {
    title: 'New experience',
    eyebrow: 'ABOUT / EXPERIENCE',
    subtitle: 'Add a chapter to your timeline.',
    kind: 'experience-form',
  },
  'experience-edit': {
    title: 'Senior Product Designer',
    eyebrow: 'ABOUT / EXPERIENCE',
    subtitle: 'Keep this chapter up to date.',
    kind: 'experience-form',
  },
  'pages-about-experience-new': {
    title: 'New experience block',
    eyebrow: 'PAGES / ABOUT / EXPERIENCE',
    subtitle: 'Add a chapter to your About page.',
    kind: 'experience-form',
  },
  'pages-about-experience-edit': {
    title: 'Experience block',
    eyebrow: 'PAGES / ABOUT / EXPERIENCE',
    subtitle: 'Refine this chapter in your About page.',
    kind: 'experience-form',
  },
  education: {
    title: 'Education',
    eyebrow: 'ABOUT / EDUCATION',
    subtitle: 'Your learning, formal and otherwise.',
    kind: 'collection',
  },
  skills: {
    title: 'Skills',
    eyebrow: 'ABOUT / SKILLS',
    subtitle: 'The tools and practices behind the work.',
    kind: 'collection',
  },
  tags: {
    title: 'Tags',
    eyebrow: 'CONTENT / TAGS',
    subtitle: 'Help readers find related ideas.',
    kind: 'collection',
  },
  principles: {
    title: 'Principles',
    eyebrow: 'ABOUT / PRINCIPLES',
    subtitle: 'The ideas that guide your decisions.',
    kind: 'collection',
  },
  process: {
    title: 'Process',
    eyebrow: 'ABOUT / PROCESS',
    subtitle: 'Show how thoughtful work takes shape.',
    kind: 'collection',
  },
  profile: {
    title: 'Profile',
    eyebrow: 'SETTINGS / PROFILE',
    subtitle: 'The essentials behind your public introduction.',
    kind: 'settings',
  },
  site: {
    title: 'Site settings',
    eyebrow: 'SETTINGS / SITE',
    subtitle: 'The details that make this space yours.',
    kind: 'settings',
  },
  domains: {
    title: 'Domains',
    eyebrow: 'SETTINGS / DOMAINS',
    subtitle: 'The subjects that connect your work.',
    kind: 'table',
  },
  media: {
    title: 'Media library',
    eyebrow: 'CONTENT / MEDIA',
    subtitle: 'A home for images and visual assets.',
    kind: 'media',
  },
  users: {
    title: 'Users',
    eyebrow: 'SETTINGS / USERS',
    subtitle: 'People with access to this workspace.',
    kind: 'table',
  },
  audit: {
    title: 'Audit log',
    eyebrow: 'INSIGHTS / AUDIT',
    subtitle: 'A quiet record of changes made here.',
    kind: 'table',
  },
  'not-found': {
    title: 'Page not found',
    eyebrow: 'WORKSPACE / LOST',
    subtitle: 'This page may have moved or never existed.',
    kind: 'not-found',
  },
  error: {
    title: 'Something went wrong',
    eyebrow: 'WORKSPACE / ERROR',
    subtitle: 'We could not load this view just now.',
    kind: 'error',
  },
} as const;

export type DemoRouteId = keyof typeof demoRoutes;
export const demoRouteIds = Object.keys(demoRoutes) as DemoRouteId[];

export const loadingRoutes = [
  'dashboard',
  'analytics',
  'stats',
  'projects',
  'projects-new',
  'projects-edit',
  'posts',
  'posts-new',
  'posts-edit',
  'pages',
  'pages-home',
  'pages-about',
  'pages-about-experience-new',
  'pages-about-experience-edit',
  'experience',
  'experience-new',
  'experience-edit',
  'education',
  'skills',
  'tags',
  'principles',
  'process',
  'profile',
  'site',
  'domains',
  'media',
  'users',
  'inbox',
  'inbox-detail',
  'audit',
] as const;

const tableRows: Record<
  string,
  { name: string; detail: string; status: string; updated: string; metric: string }[]
> = {
  projects: [
    {
      name: 'Systems Atlas',
      detail: 'Case study · Product design',
      status: 'Published',
      updated: 'Today',
      metric: '3,241',
    },
    {
      name: 'Orbit Console',
      detail: 'Case study · Interface design',
      status: 'Published',
      updated: 'Yesterday',
      metric: '2,186',
    },
    {
      name: 'The quiet side of systems',
      detail: 'Case study · Research',
      status: 'Draft',
      updated: '28 Oct',
      metric: '—',
    },
    {
      name: 'Field Notes',
      detail: 'Case study · Strategy',
      status: 'Published',
      updated: '20 Oct',
      metric: '1,672',
    },
  ],
  posts: [
    {
      name: 'Designing for quiet',
      detail: 'Essay · 6 min read',
      status: 'Published',
      updated: 'Today',
      metric: '1,302',
    },
    {
      name: 'A small note on clarity',
      detail: 'Note · 2 min read',
      status: 'Published',
      updated: '30 Oct',
      metric: '986',
    },
    {
      name: 'Thinking in systems',
      detail: 'Essay · 8 min read',
      status: 'Draft',
      updated: '28 Oct',
      metric: '—',
    },
    {
      name: 'The space between',
      detail: 'Note · 3 min read',
      status: 'Published',
      updated: '22 Oct',
      metric: '741',
    },
  ],
  experience: [
    {
      name: 'Senior Product Designer',
      detail: 'North Studio · 2023–present',
      status: 'Current',
      updated: '31 Oct',
      metric: '01',
    },
    {
      name: 'Product Designer',
      detail: 'Common Ground · 2020–2023',
      status: 'Complete',
      updated: '29 Oct',
      metric: '02',
    },
    {
      name: 'Design Intern',
      detail: 'Atelier Works · 2019–2020',
      status: 'Complete',
      updated: '20 Oct',
      metric: '03',
    },
  ],
  domains: [
    {
      name: 'Product systems',
      detail: 'How complex products fit together',
      status: 'Active',
      updated: 'Today',
      metric: '06',
    },
    {
      name: 'Human-centered design',
      detail: 'Research, interaction, and care',
      status: 'Active',
      updated: '28 Oct',
      metric: '04',
    },
    {
      name: 'Creative technology',
      detail: 'Experiments with purpose',
      status: 'Active',
      updated: '22 Oct',
      metric: '03',
    },
  ],
  users: [
    {
      name: 'Parker',
      detail: 'Workspace owner',
      status: 'Admin',
      updated: 'Today',
      metric: 'Active',
    },
    {
      name: 'Demo Editor',
      detail: 'Fictional collaborator',
      status: 'Editor',
      updated: 'Yesterday',
      metric: 'Active',
    },
  ],
  audit: [
    {
      name: 'Published About page',
      detail: 'Parker · Page',
      status: 'Publish',
      updated: 'Today, 09:41',
      metric: 'Page',
    },
    {
      name: 'Updated Systems Atlas',
      detail: 'Parker · Project',
      status: 'Edit',
      updated: 'Yesterday',
      metric: 'Project',
    },
    {
      name: 'Created new post',
      detail: 'Demo Editor · Post',
      status: 'Create',
      updated: '28 Oct',
      metric: 'Post',
    },
    {
      name: 'Changed site settings',
      detail: 'Parker · Settings',
      status: 'Edit',
      updated: '24 Oct',
      metric: 'Site',
    },
  ],
};

const collectionRows: Record<string, { title: string; note: string; tag: string }[]> = {
  education: [
    {
      title: 'Design & interaction',
      note: 'A continuing study of interfaces and people',
      tag: '2018–2022',
    },
    {
      title: 'Independent learning',
      note: 'Workshops, reading, and making things',
      tag: 'Ongoing',
    },
  ],
  skills: [
    { title: 'Product strategy', note: 'Research, framing, and prioritization', tag: 'Strategy' },
    { title: 'Interface design', note: 'Interaction, systems, and craft', tag: 'Design' },
    {
      title: 'Creative development',
      note: 'Prototyping and front-end collaboration',
      tag: 'Technology',
    },
  ],
  tags: [
    { title: 'Design systems', note: '4 posts and 2 projects', tag: '06 items' },
    { title: 'Process', note: '3 posts and 1 project', tag: '04 items' },
    { title: 'Reflection', note: '5 notes', tag: '05 items' },
  ],
  principles: [
    {
      title: 'Clarity creates confidence',
      note: 'Make the next step obvious and humane.',
      tag: '01',
    },
    {
      title: 'Care lives in the details',
      note: 'Small choices shape how a product feels.',
      tag: '02',
    },
    { title: 'Build for real people', note: 'Listen before deciding what to make.', tag: '03' },
  ],
  process: [
    { title: 'Understand', note: 'Listen to people and map the real problem.', tag: '01' },
    { title: 'Explore', note: 'Sketch possibilities and test the assumptions.', tag: '02' },
    { title: 'Make', note: 'Build carefully, then learn from what ships.', tag: '03' },
  ],
};

function RouteHeading({ route, action }: { route: DemoRouteId; action?: ReactNode }) {
  const config = demoRoutes[route];
  return (
    <div className="section-heading route-heading">
      <div>
        <div className="eyebrow">{config.eyebrow}</div>
        <h1>{config.title}</h1>
        <p>{config.subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function ActionButton({ children, quiet = false }: { children: ReactNode; quiet?: boolean }) {
  return <button className={quiet ? 'outline-button' : 'primary-button'}>{children}</button>;
}

function MiniKpis({ values }: { values: [string, string, string][] }) {
  return (
    <div className="route-kpis">
      {values.map(([label, value, change]) => (
        <div className="route-kpi panel" key={label}>
          <span className="small-kicker">{label}</span>
          <strong>{value}</strong>
          <span className="kpi-change">
            <TrendingUp size={14} />
            {change}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsView({ route }: { route: 'analytics' | 'stats' }) {
  const stats = route === 'analytics';
  return (
    <div className="view route-view">
      <RouteHeading
        route={route}
        action={
          <ActionButton quiet>
            <CalendarDays size={16} /> Last 30 days <ChevronDown size={14} />
          </ActionButton>
        }
      />
      <MiniKpis
        values={
          stats
            ? [
                ['TOTAL VIEWS', '12,480', '+18.6%'],
                ['UNIQUE VISITORS', '8,642', '+12.3%'],
                ['AVG. TIME', '2m 42s', '+8.1%'],
              ]
            : [
                ['YEARS IN PRACTICE', '07', 'Updated yearly'],
                ['PROJECTS SHIPPED', '24', 'Across 6 teams'],
                ['PEOPLE REACHED', '120k+', 'And counting'],
              ]
        }
      />
      <div className="analytics-layout">
        <section className="panel chart-panel">
          <div className="route-panel-head">
            <div>
              <span className="small-kicker">
                {stats ? 'TRAFFIC OVER TIME' : 'YOUR STORY IN NUMBERS'}
              </span>
              <h2>{stats ? 'Audience activity' : 'Profile stats'}</h2>
            </div>
            <button className="mini-select">
              {stats ? 'Views' : 'Public'} <ChevronDown size={14} />
            </button>
          </div>
          <div className="route-chart">
            <div className="chart-grid">
              <span>15k</span>
              <span>10k</span>
              <span>5k</span>
              <span>0</span>
            </div>
            <div className="chart-bars">
              {[32, 40, 35, 48, 44, 59, 52, 63, 58, 75, 69, 83, 72, 91, 80, 95].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="chart-axis">
            <span>01 Oct</span>
            <span>10 Oct</span>
            <span>20 Oct</span>
            <span>30 Oct</span>
          </div>
        </section>
        <section className="panel insight-panel">
          <div className="route-panel-head">
            <div>
              <span className="small-kicker">{stats ? 'TOP CONTENT' : 'THE DETAILS'}</span>
              <h2>{stats ? 'Most viewed pages' : 'Visible on your site'}</h2>
            </div>
            <ArrowUpRight size={18} />
          </div>
          {(stats
            ? ['Home', 'Systems Atlas', 'About', 'Designing for quiet']
            : ['Years in practice', 'Projects shipped', 'People reached', 'Teams worked with']
          ).map((item, i) => (
            <div className="insight-row" key={item}>
              <span className="insight-rank">0{i + 1}</span>
              <strong>{item}</strong>
              <span>
                {stats ? ['4,821', '2,460', '1,894', '1,103'][i] : ['07', '24', '120k+', '06'][i]}
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function TableView({
  route,
  go,
}: {
  route: 'projects' | 'posts' | 'experience' | 'domains' | 'users' | 'audit';
  go: (route: DemoRouteId) => void;
}) {
  const rows = tableRows[route] ?? [];
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(false);
  const [compact, setCompact] = useState(false);
  const filteredRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(query.toLowerCase()) &&
      (!statusFilter || row.status === rows[0]?.status),
  );
  const openRow = () => {
    if (route === 'projects') go('projects-edit');
    if (route === 'posts') go('posts-edit');
    if (route === 'experience') go('experience-edit');
  };
  const addRoute =
    route === 'projects'
      ? 'projects-new'
      : route === 'posts'
        ? 'posts-new'
        : route === 'experience'
          ? 'experience-new'
          : null;
  return (
    <div className="view route-view">
      <RouteHeading
        route={route}
        action={
          addRoute ? (
            <button className="primary-button" onClick={() => go(addRoute)}>
              <Plus size={17} />{' '}
              {route === 'projects'
                ? 'New project'
                : route === 'posts'
                  ? 'New post'
                  : 'Add experience'}
            </button>
          ) : null
        }
      />
      <div className="route-stat-line">
        <span>
          <strong>{rows.length.toString().padStart(2, '0')}</strong> total entries
        </span>
        <span className="route-status-dot" /> Everything is up to date
      </div>
      <section className={`panel route-table-panel ${compact ? 'is-compact' : ''}`}>
        <div className="route-table-tools">
          <div className="search-box">
            <Search size={17} />
            <input
              aria-label={`Search ${demoRoutes[route].title}`}
              placeholder={`Search ${demoRoutes[route].title.toLowerCase()}...`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button
            className="outline-button"
            aria-pressed={statusFilter}
            onClick={() => setStatusFilter(!statusFilter)}
          >
            <Filter size={16} /> {statusFilter ? 'Clear filter' : 'Filters'}
          </button>
          <button
            className="outline-button compact-tool"
            aria-label="Compact rows"
            aria-pressed={compact}
            onClick={() => setCompact(!compact)}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
        <div className="route-table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <span className="fake-checkbox" />
                </th>
                <th>
                  {route === 'audit'
                    ? 'ACTIVITY'
                    : route === 'users'
                      ? 'PERSON'
                      : route === 'experience'
                        ? 'ROLE'
                        : 'NAME'}
                </th>
                <th>STATUS</th>
                <th>UPDATED</th>
                <th>{route === 'projects' || route === 'posts' ? 'VIEWS' : 'DETAIL'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr
                  key={row.name}
                  onClick={openRow}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') openRow();
                  }}
                  tabIndex={['projects', 'posts', 'experience'].includes(route) ? 0 : undefined}
                >
                  <td>
                    <span className="fake-checkbox" />
                  </td>
                  <td>
                    <div className="route-row-primary">
                      <span className={`route-row-icon route-row-${i % 3}`}>
                        {route === 'users' ? (
                          <Users size={17} />
                        ) : route === 'audit' ? (
                          <Activity size={17} />
                        ) : (
                          <FileText size={17} />
                        )}
                      </span>
                      <span>
                        <strong>{row.name}</strong>
                        <small>{row.detail}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`route-badge ${row.status === 'Draft' ? 'draft' : ''}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.updated}</td>
                  <td>{row.metric}</td>
                  <td>
                    <MoreHorizontal size={17} />
                  </td>
                </tr>
              ))}
              {!filteredRows.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="demo-table-empty">
                      <Search size={22} />
                      <strong>No matching entries</strong>
                      <span>Try another search or clear the filter.</span>
                      <button
                        className="outline-button"
                        onClick={() => {
                          setQuery('');
                          setStatusFilter(false);
                        }}
                      >
                        Clear search and filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>
            Showing {filteredRows.length} of {rows.length} results
          </span>
          <span>1 / 1</span>
        </div>
      </section>
    </div>
  );
}

function PagesView({
  go,
  onCreate,
  onOpenCreated,
  createdPages,
  initialOpen = false,
  initialEmpty = false,
  initialLocale = 'en',
}: {
  go: (route: 'pages-home' | 'pages-about') => void;
  onCreate: (page: DemoCreatedPage) => void;
  onOpenCreated: (page: DemoCreatedPage) => void;
  createdPages: DemoCreatedPage[];
  initialOpen?: boolean;
  initialEmpty?: boolean;
  initialLocale?: 'en' | 'vi';
}) {
  const [open, setOpen] = useState(initialOpen);
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [locale, setLocale] = useState<'en' | 'vi'>(initialLocale);
  const [template, setTemplate] = useState<'starter' | 'empty'>('starter');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const page = { title, key, locale, template };
    const issue = !title.trim()
      ? 'Enter a page title.'
      : !createPageSchema.safeParse(page).success
        ? 'Use lowercase letters, numbers, and hyphens for the slug.'
        : ['home', 'about', 'contact', ...createdPages.map((item) => item.key)].includes(key)
          ? 'This slug is already in use.'
          : null;
    if (issue) {
      setError(issue);
      return;
    }
    onCreate({ ...page, title: title.trim() });
  };
  return (
    <div className="view route-view">
      <RouteHeading
        route="pages"
        action={
          <div className="editor-actions">
            <ActionButton quiet>
              <Globe2 size={16} /> View live site <ArrowUpRight size={15} />
            </ActionButton>
            <button className="primary-button" onClick={() => setOpen(true)}>
              <Plus size={17} /> Add page
            </button>
          </div>
        }
      />
      {!initialEmpty && (
        <div className="page-grid">
          {[
            {
              title: 'Home',
              note: 'The first impression',
              icon: Sparkles,
              scene: 'pages-home' as const,
              blocks: '08',
            },
            {
              title: 'About',
              note: 'Your story and values',
              icon: BookOpen,
              scene: 'pages-about' as const,
              blocks: '12',
            },
            {
              title: 'Contact',
              note: 'A way to start a conversation',
              icon: Globe2,
              scene: 'pages-about' as const,
              blocks: '04',
            },
          ].map((item) => (
            <button className="panel page-card" key={item.title} onClick={() => go(item.scene)}>
              <span className="page-card-icon">
                <item.icon size={21} />
              </span>
              <span className="route-badge">Published</span>
              <h2>{item.title}</h2>
              <p>{item.note}</p>
              <div>
                <span>{item.blocks} blocks</span>
                <span>
                  Edit page <ArrowRight size={15} />
                </span>
              </div>
            </button>
          ))}
          {createdPages.map((item) => (
            <button className="panel page-card" key={item.key} onClick={() => onOpenCreated(item)}>
              <span className="page-card-icon">
                <FileText size={21} />
              </span>
              <span className="route-badge draft">Draft</span>
              <h2>{item.title}</h2>
              <p>
                /{item.key} · {item.locale.toUpperCase()}
              </p>
              <div>
                <span>{item.template === 'empty' ? '00' : '04'} blocks</span>
                <span>
                  Edit page <ArrowRight size={15} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="page-create-cta panel">
        <div>
          <span className="small-kicker">YOUR NEXT IDEA</span>
          <h2>Make room for another story.</h2>
          <p>Start with a simple page, then shape it block by block.</p>
        </div>
        <button className="outline-button" onClick={() => setOpen(true)}>
          <Plus size={16} /> Add page
        </button>
      </div>
      {open && (
        <div
          className="page-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="page-dialog panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-page-title"
          >
            <div className="page-dialog-head">
              <div>
                <span className="small-kicker">PAGES / NEW</span>
                <h2 id="create-page-title">Add page</h2>
              </div>
              <button
                className="dialog-icon-button"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <p>Give this page a name and choose how to begin.</p>
            <label htmlFor="new-page-title">Page title</label>
            <input
              id="new-page-title"
              autoFocus
              value={title}
              onChange={(event) => {
                const value = event.target.value;
                setTitle(value);
                if (!keyEdited) setKey(slugFromTitle(value));
                setError(null);
              }}
              placeholder="e.g. Ideas"
            />
            <label htmlFor="new-page-slug">Slug</label>
            <div className="slug-input">
              <span>/</span>
              <input
                id="new-page-slug"
                value={key}
                onChange={(event) => {
                  setKeyEdited(true);
                  setKey(event.target.value);
                  setError(null);
                }}
                placeholder="ideas"
              />
            </div>
            <small>Lowercase letters, numbers, and hyphens only.</small>
            <div className="page-dialog-options">
              <div>
                <label htmlFor="new-page-locale">Language</label>
                <select
                  id="new-page-locale"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as 'en' | 'vi')}
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>
              <div>
                <label htmlFor="new-page-template">Start with</label>
                <select
                  id="new-page-template"
                  value={template}
                  onChange={(event) => setTemplate(event.target.value as 'starter' | 'empty')}
                >
                  <option value="starter">Starter template</option>
                  <option value="empty">Empty blocks</option>
                </select>
              </div>
            </div>
            {error && (
              <p className="page-dialog-error" role="alert">
                {error}
              </p>
            )}
            <div className="page-dialog-actions">
              <button className="outline-button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={submit}>
                Create page <ArrowRight size={16} />
              </button>
            </div>
            <small className="demo-disclaimer">
              Demo only · This page is kept in this browser session.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  wide = false,
  textarea = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
  textarea?: boolean;
}) {
  const id = useId();
  return (
    <div className={`route-field ${wide ? 'wide' : ''}`}>
      <label htmlFor={textarea ? undefined : id}>{label}</label>
      {textarea ? (
        <div className="route-textarea">
          <div className="markdown-toolbar">
            <strong>B</strong>
            <em>I</em>
            <span>H1</span>
            <span>H2</span>
            <span>↗</span>
            <span>≡</span>
            <span className="markdown-mode">Markdown</span>
          </div>
          <p>{value}</p>
        </div>
      ) : (
        <input id={id} value={value} readOnly />
      )}
      <small>Saved automatically</small>
    </div>
  );
}

function EditorForm({
  route,
}: {
  route:
    | 'projects-new'
    | 'projects-edit'
    | 'posts-new'
    | 'posts-edit'
    | 'experience-new'
    | 'experience-edit'
    | 'pages-about-experience-new'
    | 'pages-about-experience-edit';
}) {
  const project = route.startsWith('projects');
  const post = route.startsWith('posts');
  const fresh = route.endsWith('new');
  return (
    <div className="view route-view">
      <RouteHeading
        route={route}
        action={
          <div className="editor-actions">
            <span className="saved-label">
              <Check size={14} /> Saved just now
            </span>
            <ActionButton quiet>
              <Globe2 size={16} /> Preview
            </ActionButton>
            <ActionButton>
              Publish <ArrowRight size={16} />
            </ActionButton>
          </div>
        }
      />
      <div className="form-layout">
        <section className="panel form-main">
          <div className="route-panel-head">
            <div>
              <span className="small-kicker">CONTENT</span>
              <h2>{project ? 'Project story' : post ? 'Your note' : 'Role details'}</h2>
            </div>
            <MoreHorizontal size={19} />
          </div>
          <div className="form-fields">
            <FormField
              label={project ? 'Project title' : post ? 'Post title' : 'Role title'}
              value={
                fresh
                  ? ''
                  : project
                    ? 'Systems Atlas'
                    : post
                      ? 'Designing for quiet'
                      : 'Senior Product Designer'
              }
              wide
            />
            <FormField
              label={project ? 'Short summary' : post ? 'Excerpt' : 'Company'}
              value={
                project
                  ? 'A clearer way to navigate complex work.'
                  : post
                    ? 'A few thoughts on making space for focus.'
                    : 'North Studio'
              }
              wide
            />
            <FormField
              label={project ? 'Case study' : post ? 'Body' : 'Responsibilities'}
              value={
                project
                  ? 'The challenge was to make a complex system feel calm and approachable. We started by listening carefully.'
                  : post
                    ? 'Good work often starts by removing what gets in the way. A little quiet can make room for better ideas.'
                    : 'I led product strategy, interaction design, and the systems that brought the experience together.'
              }
              textarea
              wide
            />
          </div>
        </section>
        <aside className="panel form-side">
          <div className="route-panel-head">
            <div>
              <span className="small-kicker">PROPERTIES</span>
              <h2>Details</h2>
            </div>
            <Settings2 size={18} />
          </div>
          <div className="form-fields">
            <FormField label="Status" value={fresh ? 'Draft' : 'Published'} />
            <FormField
              label="Slug"
              value={
                fresh
                  ? ''
                  : project
                    ? 'systems-atlas'
                    : post
                      ? 'designing-for-quiet'
                      : 'senior-product-designer'
              }
            />
            <FormField
              label={project ? 'Role' : post ? 'Tags' : 'Period'}
              value={project ? 'Product designer' : post ? 'Design, Reflection' : '2023 – Present'}
            />
            <div className="route-info">
              <ShieldCheck size={17} />
              <span>Everything is saved in this visual demo.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CollectionRow({
  item,
  index,
}: {
  item: { title: string; note: string; tag: string };
  index: number;
}) {
  return (
    <div className="collection-row">
      <button className="collection-icon-button" aria-label={`Reorder ${item.title}`}>
        <GripVertical size={17} />
      </button>
      <span className="collection-number">{String(index + 1).padStart(2, '0')}</span>
      <div className="collection-copy">
        <strong>{item.title}</strong>
        <small>{item.note}</small>
      </div>
      <span className="route-badge collection-pill">{item.tag}</span>
      <button className="collection-icon-button" aria-label={`More options for ${item.title}`}>
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}

function CollectionView({
  route,
}: {
  route: 'education' | 'skills' | 'tags' | 'principles' | 'process';
}) {
  const rows = collectionRows[route] ?? [];
  const addLabel = {
    education: 'Add education',
    skills: 'Add skill',
    tags: 'Add tag',
    principles: 'Add principle',
    process: 'Add step',
  }[route];
  return (
    <div className="view route-view">
      <RouteHeading
        route={route}
        action={
          <ActionButton>
            <Plus size={17} /> {addLabel}
          </ActionButton>
        }
      />
      <div className="collection-grid">
        <section className="panel collection-panel">
          <div className="route-panel-head">
            <div>
              <span className="small-kicker">ORGANIZE</span>
              <h2>
                {demoRoutes[route].title}{' '}
                <span className="muted-count">{rows.length.toString().padStart(2, '0')}</span>
              </h2>
            </div>
          </div>
          {rows.map((item, i) => (
            <CollectionRow item={item} index={i} key={item.title} />
          ))}
        </section>
        <aside className="panel collection-tip">
          <span className="tip-icon">
            <Sparkles size={19} />
          </span>
          <span className="small-kicker">A THOUGHTFUL DETAIL</span>
          <h2>Make it yours.</h2>
          <p>Clear language and a gentle rhythm help people understand the work behind the work.</p>
          <div className="tip-stars">✦　·　✧　·　✦</div>
        </aside>
      </div>
    </div>
  );
}

function SettingsView({ route }: { route: 'profile' | 'site' }) {
  const profile = route === 'profile';
  return (
    <div className="view route-view">
      <RouteHeading
        route={route}
        action={
          <ActionButton>
            <Check size={16} /> Save changes
          </ActionButton>
        }
      />
      <div className="form-layout">
        <section className="panel form-main">
          <div className="route-panel-head">
            <div>
              <span className="small-kicker">{profile ? 'PUBLIC IDENTITY' : 'SITE IDENTITY'}</span>
              <h2>{profile ? 'Your introduction' : 'General settings'}</h2>
            </div>
            <Settings2 size={18} />
          </div>
          <div className="form-fields">
            <FormField
              label={profile ? 'Display name' : 'Site name'}
              value={profile ? 'Parker' : 'lil.parker'}
              wide
            />
            <FormField
              label={profile ? 'Headline' : 'Site tagline'}
              value={
                profile
                  ? 'Designer of thoughtful digital experiences'
                  : 'A quieter place to make things matter.'
              }
              wide
            />
            <FormField
              label={profile ? 'Bio' : 'Site description'}
              value={
                profile
                  ? 'I make complex things feel a little more human.'
                  : 'A personal space for work, writing, and ideas.'
              }
              textarea
              wide
            />
          </div>
        </section>
        <aside className="panel form-side">
          <div className="route-panel-head">
            <div>
              <span className="small-kicker">{profile ? 'PROFILE IMAGE' : 'PREFERENCES'}</span>
              <h2>{profile ? 'Your portrait' : 'Appearance'}</h2>
            </div>
          </div>
          {profile ? (
            <div className="portrait-mock">
              <span>P</span>
              <button className="outline-button">
                <Upload size={16} /> Replace image
              </button>
              <small>Square images work best.</small>
            </div>
          ) : (
            <div className="form-fields">
              <FormField label="Default language" value="English" />
              <FormField label="Accent palette" value="Orange & green" />
              <div className="palette-chips">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function MediaView() {
  return (
    <div className="view route-view">
      <RouteHeading
        route="media"
        action={
          <ActionButton>
            <Upload size={17} /> Upload media
          </ActionButton>
        }
      />
      <div className="media-toolbar">
        <div className="search-box">
          <Search size={17} />
          <span>Search media...</span>
        </div>
        <ActionButton quiet>
          <Filter size={16} /> All media
        </ActionButton>
        <ActionButton quiet>
          <LayoutGrid size={16} /> Grid
        </ActionButton>
      </div>
      <div className="media-grid">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((item, i) => (
          <div className={`panel media-card media-${i}`} key={item}>
            <div className="media-art">
              <span>{i % 3 === 0 ? '✳' : i % 3 === 1 ? '◒' : '✦'}</span>
            </div>
            <div>
              <strong>
                {
                  [
                    'systems-atlas-cover',
                    'workspace-detail',
                    'orbit-console',
                    'story-illustration',
                    'field-notes',
                    'portrait-study',
                    'gradient-shape',
                    'quiet-canvas',
                  ][i]
                }
              </strong>
              <small>Image · {i + 1}.2 MB</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StateView({
  route,
  go,
}: {
  route: 'not-found' | 'error';
  go: (route: 'dashboard') => void;
}) {
  const missing = route === 'not-found';
  return (
    <div className="view state-view">
      <div className="state-orbit">{missing ? <Globe2 size={34} /> : <CircleHelp size={34} />}</div>
      <span className="small-kicker">{missing ? '404 / PAGE NOT FOUND' : 'A SMALL DETOUR'}</span>
      <h1>{demoRoutes[route].title}</h1>
      <p>{demoRoutes[route].subtitle} Take a breath, then head back to your workspace.</p>
      <button className="primary-button" onClick={() => go('dashboard')}>
        <ArrowLeft size={16} /> Back to overview
      </button>
    </div>
  );
}

export function DemoLoading({ title, kind = 'table' }: { title: string; kind?: string }) {
  return (
    <div className="view route-view loading-view">
      <div className="eyebrow">WORKSPACE / {title.toUpperCase()}</div>
      <div className="skeleton loading-title" />
      <div className="skeleton loading-subtitle" />
      <div className="loading-cards">
        <div className="panel">
          <div className="skeleton loading-card-title" />
          <div className="skeleton loading-card-body" />
          <div className="skeleton loading-card-body short" />
        </div>
        <div className="panel">
          <div className="skeleton loading-card-title" />
          <div className="skeleton loading-card-body" />
          <div className="skeleton loading-card-body short" />
        </div>
      </div>
      <div className="panel loading-table">
        <div className="skeleton loading-toolbar" />
        {Array.from({ length: kind === 'editor' ? 4 : 6 }, (_, i) => (
          <div className="loading-row" key={i}>
            <div className="skeleton loading-thumb" />
            <div>
              <div className="skeleton loading-line" />
              <div className="skeleton loading-line short" />
            </div>
            <div className="skeleton loading-chip" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DemoRouteView({
  route,
  go,
  onCreatePage,
  onOpenCreatedPage,
  createdPages = [],
  initialState,
  locale,
}: {
  route: DemoRouteId;
  go: (route: DemoRouteId | 'pages-home' | 'pages-about' | 'dashboard') => void;
  onCreatePage?: (page: DemoCreatedPage) => void;
  onOpenCreatedPage?: (page: DemoCreatedPage) => void;
  createdPages?: DemoCreatedPage[];
  initialState?: string;
  locale?: 'en' | 'vi';
}) {
  const kind = demoRoutes[route].kind;
  if (route === 'analytics' || route === 'stats') return <AnalyticsView route={route} />;
  if (
    route === 'projects' ||
    route === 'posts' ||
    route === 'experience' ||
    route === 'domains' ||
    route === 'users' ||
    route === 'audit'
  )
    return <TableView route={route} go={go} />;
  if (route === 'pages')
    return (
      <PagesView
        go={go}
        onCreate={onCreatePage ?? (() => {})}
        onOpenCreated={onOpenCreatedPage ?? (() => {})}
        createdPages={createdPages}
        initialOpen={initialState === 'create'}
        initialEmpty={initialState === 'empty'}
        initialLocale={locale}
      />
    );
  if (
    route === 'projects-new' ||
    route === 'projects-edit' ||
    route === 'posts-new' ||
    route === 'posts-edit' ||
    route === 'experience-new' ||
    route === 'experience-edit' ||
    route === 'pages-about-experience-new' ||
    route === 'pages-about-experience-edit'
  )
    return <EditorForm route={route} />;
  if (
    route === 'education' ||
    route === 'skills' ||
    route === 'tags' ||
    route === 'principles' ||
    route === 'process'
  )
    return <CollectionView route={route} />;
  if (route === 'profile' || route === 'site') return <SettingsView route={route} />;
  if (route === 'media') return <MediaView />;
  if (kind === 'not-found' || kind === 'error')
    return <StateView route={route as 'not-found' | 'error'} go={go} />;
  return null;
}
