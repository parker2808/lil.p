'use client';

/* eslint-disable react/jsx-no-literals, react/no-unescaped-entities -- Isolated visual fixture with fixed English mock copy. */

import {
  Activity,
  Archive,
  ArrowLeft,
  ArrowRight,
  Bell,
  Blocks,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Home,
  Inbox,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useEffect, useState } from 'react';

type IconType = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
type Screen =
  | 'shell-expanded'
  | 'shell-collapsed'
  | 'dashboard'
  | 'list-loading'
  | 'inbox'
  | 'editor'
  | 'login'
  | 'palette'
  | 'mobile-nav';

const scenes: Screen[] = [
  'shell-expanded',
  'shell-collapsed',
  'dashboard',
  'list-loading',
  'inbox',
  'editor',
  'login',
  'palette',
  'mobile-nav',
];
const groups: {
  label: string;
  items: { label: string; icon: IconType; scene: Screen; badge?: string }[];
}[] = [
  {
    label: 'WORKSPACE',
    items: [
      { label: 'Overview', icon: LayoutDashboard, scene: 'dashboard' },
      { label: 'Inbox', icon: Inbox, scene: 'inbox', badge: '3' },
    ],
  },
  {
    label: 'CREATE',
    items: [
      { label: 'Pages', icon: Blocks, scene: 'editor' },
      { label: 'Projects', icon: FileText, scene: 'list-loading' },
      { label: 'Posts', icon: FileText, scene: 'list-loading' },
      { label: 'Media', icon: Upload, scene: 'list-loading' },
    ],
  },
  {
    label: 'IMPROVE',
    items: [
      { label: 'Analytics', icon: Activity, scene: 'dashboard' },
      { label: 'Site settings', icon: Settings2, scene: 'editor' },
    ],
  },
];

function IconButton({
  children,
  label,
  onClick,
  className = '',
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`icon-button ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Dashboard({ go, shell = false }: { go: (screen: Screen) => void; shell?: boolean }) {
  return (
    <div className="view dashboard-view">
      <SectionHeading
        eyebrow="MONDAY, 02 NOVEMBER 2026"
        title={shell ? 'Your workspace' : 'Good morning, Parker'}
        subtitle="A clear view of what needs your attention."
        action={
          <button className="outline-button date-button">
            <span>Last 30 days</span>
            <ChevronDown size={16} />
          </button>
        }
      />
      <div className="dashboard-grid">
        <section className="panel todo-panel">
          <div className="panel-top">
            <div>
              <span className="small-kicker">YOUR PRIORITIES</span>
              <h2>
                To do <span className="vi-label">/ Cần làm</span>
              </h2>
            </div>
            <span className="count-pill">05</span>
          </div>
          <div className="todo-grid">
            <button className="todo-card" onClick={() => go('inbox')}>
              <span className="todo-icon lilac">
                <Inbox size={19} />
              </span>
              <span className="todo-number">03</span>
              <strong>Unread messages</strong>
              <small>Two need a response today</small>
              <span className="todo-link">
                Open inbox <ArrowRight size={14} />
              </span>
            </button>
            <button className="todo-card" onClick={() => go('list-loading')}>
              <span className="todo-icon peach">
                <FileText size={19} />
              </span>
              <span className="todo-number">02</span>
              <strong>Drafts to finish</strong>
              <small>Projects waiting to publish</small>
              <span className="todo-link">
                Review drafts <ArrowRight size={14} />
              </span>
            </button>
          </div>
        </section>
        <section className="panel views-panel">
          <div className="panel-top">
            <div>
              <span className="small-kicker">PERFORMANCE</span>
              <h2>Page views</h2>
            </div>
            <MoreHorizontal size={18} />
          </div>
          <div className="metric">
            12,480 <span>↗ 18.6%</span>
          </div>
          <p>vs. previous 30 days</p>
          <div className="spark-bars">
            {[36, 46, 40, 56, 49, 63, 54, 72, 65, 82, 74, 91].map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </section>
        <section className="panel activity-panel">
          <div className="panel-top">
            <div>
              <span className="small-kicker">WHAT'S NEW</span>
              <h2>Recent activity</h2>
            </div>
            <button className="text-button">
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="activity-line">
            <span className="activity-mark purple">
              <Check size={14} />
            </span>
            <div>
              <strong>About page published</strong>
              <small>Content updated by Parker</small>
            </div>
            <time>2h ago</time>
          </div>
          <div className="activity-line">
            <span className="activity-mark orange">
              <FileText size={14} />
            </span>
            <div>
              <strong>New project draft</strong>
              <small>“The quiet side of systems”</small>
            </div>
            <time>Yesterday</time>
          </div>
          <div className="activity-line">
            <span className="activity-mark blue">
              <Inbox size={14} />
            </span>
            <div>
              <strong>New message received</strong>
              <small>From Mira Chen</small>
            </div>
            <time>Yesterday</time>
          </div>
        </section>
        <section className="panel health-panel">
          <div className="panel-top">
            <div>
              <span className="small-kicker">CONTENT HEALTH</span>
              <h2>Looking good</h2>
            </div>
            <span className="health-check">
              <Check size={18} />
            </span>
          </div>
          <p>Most of your content is up to date. A little polish is all that’s left.</p>
          <div className="health-stat">
            <span>Published pages</span>
            <strong>8 / 9</strong>
          </div>
          <div className="health-track">
            <span />
          </div>
          <div className="health-stat">
            <span>Media with alt text</span>
            <strong>24 / 26</strong>
          </div>
          <div className="health-track">
            <span style={{ width: '92%' }} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ListLoading() {
  return (
    <div className="view">
      <SectionHeading
        eyebrow="CONTENT / PROJECTS"
        title="Projects"
        subtitle="Manage work you want the world to see."
        action={
          <button className="primary-button">
            <Plus size={17} /> New project
          </button>
        }
      />
      <div className="list-summary">
        <div>
          <strong>12</strong>
          <span>Total projects</span>
        </div>
        <div>
          <strong>10</strong>
          <span>Published</span>
        </div>
        <div>
          <strong>02</strong>
          <span>Drafts</span>
        </div>
      </div>
      <div className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17} />
            <span>Search projects...</span>
            <kbd>⌘ K</kbd>
          </div>
          <button className="outline-button">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <button className="outline-button density-button">
            <Menu size={16} /> Comfortable
          </button>
        </div>
        <div className="filter-line">
          <span className="filter-chip">
            All projects <ChevronDown size={13} />
          </span>
          <span className="filter-chip">
            Newest first <ChevronDown size={13} />
          </span>
          <span className="loading-caption">
            <span className="tiny-spinner" /> Loading projects
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <span className="fake-checkbox" />
                </th>
                <th>PROJECT</th>
                <th>STATUS</th>
                <th>UPDATED</th>
                <th>VIEWS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 7 }, (_, i) => (
                <tr key={i}>
                  <td>
                    <span className="fake-checkbox" />
                  </td>
                  <td>
                    <div className="skeleton-title">
                      <span className="skeleton thumb" />
                      <span>
                        <span
                          className="skeleton line"
                          style={{ width: i % 2 ? '132px' : '178px' }}
                        />
                        <span className="skeleton line subtle" style={{ width: '105px' }} />
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="skeleton pill" />
                  </td>
                  <td>
                    <span className="skeleton line" style={{ width: '72px' }} />
                  </td>
                  <td>
                    <span className="skeleton line" style={{ width: '42px' }} />
                  </td>
                  <td>
                    <MoreHorizontal size={17} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Loading results...</span>
          <div>
            <ChevronLeft size={16} />
            <span>Page 1 of 2</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

const messages = [
  {
    initials: 'MC',
    name: 'Mira Chen',
    topic: 'A thoughtful collaboration',
    snippet: 'Hi Parker, I came across your work and...',
    time: '9:41 AM',
    unread: true,
    color: 'rose',
  },
  {
    initials: 'NE',
    name: 'Noah Ellis',
    topic: 'Speaking at Design Week',
    snippet: 'We would love to invite you to share...',
    time: 'Yesterday',
    unread: true,
    color: 'blue',
  },
  {
    initials: 'SJ',
    name: 'Sam Jordan',
    topic: 'Portfolio feedback',
    snippet: 'Your latest case study really resonated...',
    time: 'Mon',
    unread: true,
    color: 'green',
  },
  {
    initials: 'AL',
    name: 'Alex Lee',
    topic: 'Quick question about your process',
    snippet: 'Thanks for the detailed write-up...',
    time: '28 Oct',
    unread: false,
    color: 'amber',
  },
];

function InboxView() {
  const [selected, setSelected] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  return (
    <div className="view inbox-view">
      <SectionHeading
        eyebrow="WORKSPACE / INBOX"
        title="Inbox"
        subtitle="Conversations worth keeping close."
        action={<span className="new-pill">3 new</span>}
      />
      <div className={`inbox-shell panel ${showDetail ? 'detail-open' : ''}`}>
        <div className="message-list">
          <div className="inbox-list-toolbar">
            <div className="search-box">
              <Search size={16} />
              <span>Search messages</span>
            </div>
            <IconButton label="Filter messages">
              <SlidersHorizontal size={17} />
            </IconButton>
          </div>
          <div className="inbox-tabs">
            <button className="active">
              All <span>04</span>
            </button>
            <button>
              Unread <span>03</span>
            </button>
            <button>Archived</button>
          </div>
          {messages.map((message, i) => (
            <button
              className={`message-item ${selected === i ? 'selected' : ''}`}
              key={message.initials}
              onClick={() => {
                setSelected(i);
                setShowDetail(true);
              }}
            >
              <span className={`avatar ${message.color}`}>{message.initials}</span>
              <span className="message-copy">
                <span className="message-line">
                  <strong>{message.name}</strong>
                  <time>{message.time}</time>
                </span>
                <strong className="message-topic">{message.topic}</strong>
                <small>{message.snippet}</small>
              </span>
              {message.unread && <span className="unread-dot" />}
            </button>
          ))}
        </div>
        <div className="message-detail">
          <div className="message-actions">
            <span>
              <button className="mobile-back" onClick={() => setShowDetail(false)}>
                <ArrowLeft size={17} /> Inbox
              </button>
              Message {selected + 1} of 4
            </span>
            <div>
              <IconButton label="Archive">
                <Archive size={17} />
              </IconButton>
              <IconButton label="More actions">
                <MoreHorizontal size={18} />
              </IconButton>
            </div>
          </div>
          <div className="message-body">
            <span className="small-kicker">NEW MESSAGE</span>
            <h2>{messages[selected]?.topic}</h2>
            <div className="sender-line">
              <span className={`avatar ${messages[selected]?.color}`}>
                {messages[selected]?.initials}
              </span>
              <span>
                <strong>{messages[selected]?.name}</strong>
                <small>Sent on 02 November 2026 at 9:41 AM</small>
              </span>
            </div>
            <div className="message-prose">
              <p>Hi Parker,</p>
              <p>
                I came across your portfolio and spent some time with the case studies. The way you
                make complex systems feel simple really stood out.
              </p>
              <p>
                We’re exploring a small collaboration and I’d love to hear how you approach early
                product direction. Would you be open to a conversation next week?
              </p>
              <p>
                Thanks for your time,
                <br />
                {messages[selected]?.name}
              </p>
            </div>
            <button className="primary-button">
              Reply to message <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorView() {
  const [block, setBlock] = useState(1);
  const rows = [
    { icon: 'H', name: 'Hero introduction', type: 'HEADING', key: 'intro' },
    { icon: 'T', name: 'About me', type: 'RICH TEXT', key: 'about' },
    { icon: '◫', name: 'Selected work', type: 'PROJECT GRID', key: 'work' },
    { icon: '✦', name: 'What I believe', type: 'QUOTE', key: 'values' },
  ];
  return (
    <div className="view editor-view">
      <div className="editor-heading">
        <div>
          <div className="eyebrow">PAGES / ABOUT</div>
          <div className="editor-title">
            <ArrowLeft size={20} />
            <h1>About page</h1>
            <span className="draft-pill">Draft changes</span>
          </div>
          <p>Build your story, one block at a time.</p>
        </div>
        <div className="editor-actions">
          <span className="saved-label">
            <Check size={14} /> Saved just now
          </span>
          <button className="outline-button">
            <Eye size={16} /> Preview
          </button>
          <button className="primary-button">
            Publish <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="editor-layout">
        <section className="panel block-list-panel">
          <div className="editor-panel-title">
            <div>
              <span className="small-kicker">PAGE STRUCTURE</span>
              <h2>
                Blocks <span>04</span>
              </h2>
            </div>
            <IconButton label="Add block">
              <Plus size={18} />
            </IconButton>
          </div>
          <div className="block-rows">
            {rows.map((row, i) => (
              <button
                key={row.name}
                className={`block-row ${block === i ? 'active' : ''}`}
                onClick={() => setBlock(i)}
              >
                <GripVertical size={15} />
                <span className="block-glyph">{row.icon}</span>
                <span>
                  <strong>{row.name}</strong>
                  <small>
                    {row.type} · #{row.key}
                  </small>
                </span>
                <MoreHorizontal size={17} />
              </button>
            ))}
          </div>
          <button className="add-block">
            <Plus size={16} /> Add a block
          </button>
        </section>
        <section className="panel inspector-panel">
          <div className="editor-panel-title">
            <div>
              <span className="small-kicker">BLOCK INSPECTOR</span>
              <h2>{rows[block]?.name}</h2>
            </div>
            <MoreHorizontal size={18} />
          </div>
          <div className="inspector-tabs">
            <span className="active">Content</span>
            <span>Layout</span>
            <span>Style</span>
          </div>
          <div className="field">
            <label>
              Eyebrow <span>EN</span>
            </label>
            <input value="A LITTLE ABOUT ME" readOnly />
          </div>
          <div className="field">
            <label>
              Heading <span>EN</span>
            </label>
            <input value="Curious by design." readOnly />
          </div>
          <div className="field">
            <label>
              Body <span>EN</span>
            </label>
            <div className="markdown-mock">
              <div className="markdown-toolbar">
                <strong>B</strong>
                <em>I</em>
                <span>H1</span>
                <span>H2</span>
                <span>↗</span>
                <span>≡</span>
                <span className="markdown-mode">Markdown</span>
              </div>
              <p>
                I design thoughtful digital experiences where clarity and craft meet. Every detail
                has a purpose, and every system should feel human.
              </p>
            </div>
            <small className="field-hint">Markdown content · Auto-saved</small>
          </div>
          <div className="field">
            <label>Anchor</label>
            <input value="about" readOnly />
          </div>
        </section>
        <section className="panel preview-panel">
          <div className="editor-panel-title">
            <div>
              <span className="small-kicker">LIVE PREVIEW</span>
              <h2>Page preview</h2>
            </div>
            <span className="live-dot">Live</span>
          </div>
          <div className="preview-controls">
            <span className="active">Desktop</span>
            <span>Tablet</span>
            <span>Mobile</span>
          </div>
          <div className="preview-canvas">
            <div className="preview-nav">
              lil.p <span>Work　 About　 Notes</span>
            </div>
            <div className="preview-hero">
              <span>A LITTLE ABOUT ME</span>
              <strong>
                Curious
                <br />
                by design<span>.</span>
              </strong>
              <p>I make digital experiences feel a little more human.</p>
              <div className="preview-art">✳</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LoginView() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div className="login-scene">
      <div className="login-aside">
        <div className="login-brand">
          lil<span>.</span>p <span className="brand-admin">ADMIN</span>
        </div>
        <div className="login-quote">
          <div className="quote-glyph">✳</div>
          <h1>
            A quieter place
            <br />
            to make things
            <br />
            <i>matter.</i>
          </h1>
          <p>Your content, your space, your next idea.</p>
        </div>
        <div className="login-footer">
          A LITTLE SPACE TO CREATE <span>© 2026 LIL.P</span>
        </div>
      </div>
      <div className="login-main">
        <div className="login-top">
          Need a hand? <CircleHelp size={17} />
        </div>
        <div className="login-card">
          <div className="login-mobile-brand">
            lil<span>.</span>p <small>ADMIN</small>
          </div>
          <div className="login-mark">
            <Sparkles size={23} />
          </div>
          <span className="small-kicker">WELCOME BACK</span>
          <h2>Sign in to your space</h2>
          <p>Pick up right where you left off.</p>
          <label>Username</label>
          <input value="demo" readOnly aria-label="Demo username" />
          <label>Password</label>
          <div className="password-wrap">
            <input
              type={visible ? 'text' : 'password'}
              value="demopassword"
              readOnly
              aria-label="Demo password"
            />
            <button
              aria-label={visible ? 'Hide password' : 'Show password'}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button
            className="primary-button sign-in"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            {loading ? (
              <>
                <span className="tiny-spinner light" /> Signing in...
              </>
            ) : (
              <>
                Sign in <ArrowRight size={17} />
              </>
            )}
          </button>
          <small className="demo-note">Visual demo · Sign in is simulated</small>
        </div>
        <div className="login-bottom">
          Made for thoughtful work <span>✳</span>
        </div>
      </div>
    </div>
  );
}

function Palette({ go, close }: { go: (screen: Screen) => void; close: () => void }) {
  const [query, setQuery] = useState('');
  const commands = [
    { label: 'Create a new project', hint: 'C P', icon: Plus, screen: 'list-loading' as Screen },
    { label: 'Write a post', hint: 'W P', icon: FileText, screen: 'editor' as Screen },
    { label: 'Open inbox', hint: 'G I', icon: Inbox, screen: 'inbox' as Screen },
    { label: 'Go to overview', hint: '', icon: LayoutDashboard, screen: 'dashboard' as Screen },
  ].filter((x) => x.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="palette-overlay" onClick={close}>
      <div
        className="palette-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="palette-search">
          <Search size={20} />
          <input
            autoFocus
            placeholder="What would you like to do?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="palette-results">
          <span className="small-kicker">QUICK ACTIONS</span>
          {commands.slice(0, 2).map((item, i) => (
            <button
              key={item.label}
              className={i === 0 ? 'selected' : ''}
              onClick={() => go(item.screen)}
            >
              <span className="command-icon">
                <item.icon size={17} />
              </span>
              <span>{item.label}</span>
              <kbd>{item.hint}</kbd>
            </button>
          ))}
          <span className="small-kicker nav-kicker">GO TO</span>
          {commands.slice(2).map((item) => (
            <button key={item.label} onClick={() => go(item.screen)}>
              <span className="command-icon">
                <item.icon size={17} />
              </span>
              <span>{item.label}</span>
              <kbd>{item.hint}</kbd>
            </button>
          ))}
        </div>
        <div className="palette-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to navigate
          </span>
          <span>
            <kbd>↵</kbd> to select
          </span>
          <span>
            <kbd>esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdminDesignDemo({ initialScreen }: { initialScreen: string }) {
  const [screen, setScreen] = useState<Screen>(
    scenes.includes(initialScreen as Screen) ? (initialScreen as Screen) : 'dashboard',
  );
  const [collapsed, setCollapsed] = useState(initialScreen === 'shell-collapsed');
  const [palette, setPalette] = useState(initialScreen === 'palette');
  const [mobileMore, setMobileMore] = useState(initialScreen === 'mobile-nav');
  const go = (next: Screen) => {
    setScreen(next);
    setPalette(next === 'palette');
    setMobileMore(next === 'mobile-nav');
    window.history.replaceState({}, '', `?screen=${next}`);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === 'Escape') {
        setPalette(false);
        setMobileMore(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (screen === 'login')
    return (
      <div className="demo-root">
        <LoginView />
        <div className="demo-switcher">
          <button onClick={() => go('dashboard')}>
            View dashboard <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  const active =
    screen === 'shell-expanded' ||
    screen === 'shell-collapsed' ||
    screen === 'palette' ||
    screen === 'mobile-nav'
      ? 'dashboard'
      : screen;
  return (
    <div
      className={`demo-root ${collapsed ? 'is-collapsed' : ''} ${screen === 'mobile-nav' ? 'scene-mobile-nav' : ''}`}
    >
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-symbol">✳</span>
            <span className="brand-name">
              lil<span>.</span>p <small>ADMIN</small>
            </span>
            <IconButton
              label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed(!collapsed)}
            >
              <span className="collapse-icon">
                {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </span>
            </IconButton>
          </div>
          <div className="sidebar-workspace">
            <span className="workspace-avatar">P</span>
            <div>
              <strong>Parker's space</strong>
              <small>Personal workspace</small>
            </div>
            <ChevronDown size={15} />
          </div>
          <nav aria-label="Admin navigation">
            {groups.map((group) => (
              <div className="nav-group" key={group.label}>
                <div className="nav-group-label">{group.label}</div>
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    title={item.label}
                    className={`nav-item ${active === item.scene && item.label !== 'Analytics' && item.label !== 'Site settings' ? 'active' : ''}`}
                    onClick={() => go(item.scene)}
                  >
                    <item.icon size={19} strokeWidth={1.9} />
                    <span>{item.label}</span>
                    {item.badge && <b>{item.badge}</b>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <button className="nav-item" onClick={() => go('login')}>
              <CircleHelp size={19} />
              <span>Help & feedback</span>
            </button>
            <button className="user-row" onClick={() => go('login')}>
              <span className="user-avatar">P</span>
              <span>
                <strong>Parker</strong>
                <small>Administrator</small>
              </span>
              <MoreHorizontal size={18} />
            </button>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="topbar-left">
              <IconButton
                label="Open navigation"
                className="mobile-menu"
                onClick={() => setMobileMore(true)}
              >
                <Menu size={20} />
              </IconButton>
              <span className="breadcrumbs">
                Workspace <ChevronRight size={15} />{' '}
                <strong>
                  {active === 'dashboard'
                    ? 'Overview'
                    : active === 'list-loading'
                      ? 'Projects'
                      : active === 'inbox'
                        ? 'Inbox'
                        : 'Pages'}
                </strong>
              </span>
              <span className="mobile-title">
                {active === 'dashboard'
                  ? 'Overview'
                  : active === 'list-loading'
                    ? 'Projects'
                    : active === 'inbox'
                      ? 'Inbox'
                      : 'About page'}
              </span>
            </div>
            <div className="topbar-right">
              <button className="command-trigger" onClick={() => setPalette(true)}>
                <Search size={17} />
                <span>Search or jump to...</span>
                <kbd>⌘ K</kbd>
              </button>
              <IconButton label="Notifications">
                <Bell size={19} />
                <i className="notification-dot" />
              </IconButton>
              <span className="topbar-divider" />
              <span className="topbar-avatar">P</span>
            </div>
          </header>
          <main className="main-content">
            {active === 'dashboard' ? (
              <Dashboard
                go={go}
                shell={screen === 'shell-expanded' || screen === 'shell-collapsed'}
              />
            ) : active === 'list-loading' ? (
              <ListLoading />
            ) : active === 'inbox' ? (
              <InboxView />
            ) : (
              <EditorView />
            )}
          </main>
          <nav className="bottom-nav" aria-label="Mobile navigation">
            <button
              className={active === 'dashboard' ? 'active' : ''}
              onClick={() => go('dashboard')}
            >
              <Home size={20} />
              Overview
            </button>
            <button
              className={active === 'list-loading' || active === 'editor' ? 'active' : ''}
              onClick={() => go('list-loading')}
            >
              <Blocks size={20} />
              Content
            </button>
            <button className={active === 'inbox' ? 'active' : ''} onClick={() => go('inbox')}>
              <span className="bottom-icon">
                <Inbox size={20} />
                <i />
              </span>
              Inbox
            </button>
            <button className={mobileMore ? 'active' : ''} onClick={() => setMobileMore(true)}>
              <MoreHorizontal size={20} />
              More
            </button>
          </nav>
        </div>
      </div>
      {mobileMore && (
        <div className="mobile-sheet-overlay" onClick={() => setMobileMore(false)}>
          <div className="mobile-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div>
                <span className="small-kicker">YOUR WORKSPACE</span>
                <h2>More places</h2>
              </div>
              <IconButton label="Close menu" onClick={() => setMobileMore(false)}>
                <X size={19} />
              </IconButton>
            </div>
            <div className="sheet-grid">
              <button onClick={() => go('editor')}>
                <span>
                  <Blocks size={20} />
                </span>
                Pages <ChevronRight size={16} />
              </button>
              <button onClick={() => go('list-loading')}>
                <span>
                  <FileText size={20} />
                </span>
                Projects <ChevronRight size={16} />
              </button>
              <button onClick={() => go('list-loading')}>
                <span>
                  <FileText size={20} />
                </span>
                Posts <ChevronRight size={16} />
              </button>
              <button onClick={() => go('dashboard')}>
                <span>
                  <Activity size={20} />
                </span>
                Analytics <ChevronRight size={16} />
              </button>
              <button onClick={() => go('editor')}>
                <span>
                  <Settings2 size={20} />
                </span>
                Site settings <ChevronRight size={16} />
              </button>
              <button onClick={() => go('login')}>
                <span>
                  <CircleHelp size={20} />
                </span>
                Help & feedback <ChevronRight size={16} />
              </button>
            </div>
            <div className="sheet-foot">
              <span className="user-avatar">P</span>
              <span>
                <strong>Parker</strong>
                <small>Administrator</small>
              </span>
              <ChevronRight size={17} />
            </div>
          </div>
        </div>
      )}
      {palette && <Palette close={() => setPalette(false)} go={go} />}
      <div className="demo-switcher">
        <span>DESIGN DEMO</span>
        <select
          aria-label="Demo scene"
          value={screen}
          onChange={(e) => go(e.target.value as Screen)}
        >
          {scenes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
