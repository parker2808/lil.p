'use client';

import { Input } from '@portfolio/ui/components/ui/input';
import {
  Columns3,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  ListTree,
  Minus,
  MousePointer2,
  Plus,
  Search,
  Settings2,
  MoveVertical,
  SquareMousePointer,
  Type,
  X,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

import styles from './study.module.css';

type Labels = {
  palette: string;
  layers: string;
  inspector: string;
  page: string;
  hero: string;
  section: string;
  columns: string;
  grid: string;
  heading: string;
  paragraph: string;
  image: string;
  button: string;
  divider: string;
  spacer: string;
  layout: string;
  content: string;
  searchPalette: string;
  noMatches: string;
  pageOnly: string;
  addSectionFirst: string;
  selected: string;
  selectedPath: string;
  featureOne: string;
  featureTwo: string;
  outlineHint: string;
  sampleOnly: string;
  close: string;
  openInspector: string;
  addSection: string;
};

type Panel = 'components' | 'layers' | 'properties';

const catalog = [
  { key: 'section', icon: LayoutGrid, category: 'layout' },
  { key: 'columns', icon: Columns3, category: 'layout' },
  { key: 'grid', icon: LayoutGrid, category: 'layout' },
  { key: 'heading', icon: Type, category: 'content' },
  { key: 'paragraph', icon: Type, category: 'content' },
  { key: 'image', icon: ImageIcon, category: 'content' },
  { key: 'button', icon: SquareMousePointer, category: 'content' },
  { key: 'divider', icon: Minus, category: 'content' },
  { key: 'spacer', icon: MoveVertical, category: 'content' },
] as const;

export function StudyAutoPreview({ explicit }: { explicit: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (explicit || !window.matchMedia('(max-width: 760px)').matches) return;
    const url = new URL(window.location.href);
    url.searchParams.set('device', 'mobile');
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }, [explicit, router]);
  return null;
}

export function StudyPalette({
  labels,
  empty,
  idPrefix,
}: {
  labels: Labels;
  empty: boolean;
  idPrefix: string;
}) {
  const [search, setSearch] = useState('');
  const matches = catalog.filter(({ key }) =>
    labels[key].toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );

  return (
    <div className={styles.paletteBody}>
      <label className={styles.paletteSearch}>
        <Search size={17} aria-hidden="true" />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={labels.searchPalette}
          aria-label={labels.searchPalette}
        />
      </label>
      <div className={styles.paletteScroll} role="region" aria-label={labels.palette} tabIndex={0}>
        {(['layout', 'content'] as const).map((category) => {
          const items = matches.filter((item) => item.category === category);
          if (!items.length) return null;
          return (
            <div key={category}>
              <p className={styles.groupLabel}>{labels[category]}</p>
              <div className={styles.paletteGrid}>
                {items.map(({ key, icon: Icon }) => {
                  const invalid = empty ? key !== 'section' : key === 'section';
                  return (
                    <div key={key} className={styles.paletteItem}>
                      <button
                        type="button"
                        className={styles.paletteTile}
                        aria-disabled={invalid}
                        aria-describedby={invalid ? `${idPrefix}-${key}-reason` : undefined}
                        title={
                          invalid
                            ? empty
                              ? labels.addSectionFirst
                              : labels.pageOnly
                            : labels.sampleOnly
                        }
                      >
                        <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                        <span>{labels[key]}</span>
                        {invalid ? null : (
                          <GripVertical size={13} className={styles.grip} aria-hidden="true" />
                        )}
                      </button>
                      {invalid && (
                        <small id={`${idPrefix}-${key}-reason`} className={styles.paletteReason}>
                          {empty ? labels.addSectionFirst : labels.pageOnly}
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {!matches.length && <p className={styles.paletteNoMatches}>{labels.noMatches}</p>}
      </div>
    </div>
  );
}

export function StudyOutline({ labels, empty }: { labels: Labels; empty: boolean }) {
  const nodes = empty
    ? [{ label: labels.page, level: 1 }]
    : [
        { label: labels.page, level: 1 },
        { label: labels.hero, level: 2 },
        { label: labels.heading, level: 3 },
        { label: labels.paragraph, level: 3 },
        { label: labels.section, level: 2 },
        { label: labels.columns, level: 3 },
        { label: `${labels.columns} 01`, level: 4 },
        { label: labels.featureOne, level: 5 },
        { label: `${labels.columns} 02`, level: 4 },
        { label: labels.featureTwo, level: 5 },
      ];
  const selectedIndex = empty ? 0 : 2;
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [announcement, setAnnouncement] = useState('');
  const treeRef = useRef<HTMLDivElement>(null);

  function focusNode(index: number) {
    setActiveIndex(index);
    treeRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]')[index]?.focus();
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const current = Number((event.target as HTMLElement).dataset.index);
    if (!Number.isInteger(current)) return;
    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      setAnnouncement(labels.sampleOnly);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      setAnnouncement(labels.sampleOnly);
      return;
    }
    let next = current;
    if (event.key === 'ArrowDown') next = Math.min(nodes.length - 1, current + 1);
    if (event.key === 'ArrowUp') next = Math.max(0, current - 1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = nodes.length - 1;
    if (event.key === 'ArrowRight' && (nodes[current + 1]?.level ?? 0) > nodes[current]!.level)
      next = current + 1;
    if (event.key === 'ArrowLeft') {
      for (let index = current - 1; index >= 0; index--) {
        if (nodes[index]!.level < nodes[current]!.level) {
          next = index;
          break;
        }
      }
    }
    if (next < 0) next = current;
    if (next !== current) {
      event.preventDefault();
      focusNode(next);
    }
  }

  return (
    <div className={styles.outlineBody}>
      <div
        className={styles.outlineTree}
        role="tree"
        aria-label={labels.layers}
        ref={treeRef}
        onKeyDown={navigate}
      >
        {nodes.map(({ label, level }, index) => (
          <div
            key={`${label}-${index}`}
            role="treeitem"
            aria-level={level}
            aria-selected={index === selectedIndex}
            aria-current={index === selectedIndex ? 'true' : undefined}
            aria-expanded={(nodes[index + 1]?.level ?? 0) > level ? true : undefined}
            tabIndex={activeIndex === index ? 0 : -1}
            data-index={index}
            data-depth={level - 1}
            className={`${styles.outlineNode} ${index === selectedIndex ? styles.outlineSelected : ''}`}
            style={{ '--outline-indent': `${12 + (level - 1) * 20}px` } as CSSProperties}
            onClick={() => setActiveIndex(index)}
          >
            <span className={styles.outlineMarker} aria-hidden="true">
              {level < 3 ? '▾' : '·'}
            </span>
            {label}
            {index === selectedIndex && <MousePointer2 size={14} aria-hidden="true" />}
          </div>
        ))}
      </div>
      <p className={styles.outlineHint}>{labels.outlineHint}</p>
      <span className={styles.srOnly} role="status">
        {announcement}
      </span>
    </div>
  );
}

export function StudyMobilePanels({
  labels,
  selected,
  components,
  layers,
  properties,
}: {
  labels: Labels;
  selected: boolean;
  components: ReactNode;
  layers: ReactNode;
  properties: ReactNode;
}) {
  const [panel, setPanel] = useState<Panel>('components');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tabs: { key: Panel; label: string; icon: typeof Plus }[] = [
    { key: 'components', label: labels.palette, icon: Plus },
    { key: 'layers', label: labels.layers, icon: ListTree },
    { key: 'properties', label: labels.inspector, icon: Settings2 },
  ];

  function open(next: Panel, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setPanel(next);
    dialogRef.current?.showModal();
  }

  return (
    <div className={styles.mobileDock}>
      <div className={styles.mobileSelectionStrip}>
        <span className={styles.mobileSelectionIcon}>
          <MousePointer2 size={17} aria-hidden="true" />
        </span>
        <span>
          <small>{selected ? labels.selectedPath : labels.page}</small>
          <strong>{selected ? labels.heading : labels.addSection}</strong>
        </span>
        <button
          type="button"
          onClick={(event) => open('properties', event.currentTarget)}
          aria-label={labels.openInspector}
        >
          <Settings2 size={18} aria-hidden="true" />
        </button>
      </div>
      <nav className={styles.mobileBottomBar} aria-label={labels.sampleOnly}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={(event) => open(key, event.currentTarget)}>
            <Icon size={20} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      <dialog
        className={styles.mobileSheet}
        ref={dialogRef}
        aria-labelledby="study-sheet-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            dialogRef.current?.close();
          }
        }}
        onClose={() => triggerRef.current?.focus()}
      >
        <header className={styles.mobileSheetHeader}>
          <span className={styles.sheetHandle} aria-hidden="true" />
          <h2 id="study-sheet-title">{tabs.find((tab) => tab.key === panel)?.label}</h2>
          <button
            type="button"
            autoFocus
            aria-label={labels.close}
            onClick={() => dialogRef.current?.close()}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div
          className={styles.mobileSheetScroll}
          role="group"
          aria-label={tabs.find((tab) => tab.key === panel)?.label}
          tabIndex={0}
        >
          {panel === 'components' ? components : panel === 'layers' ? layers : properties}
        </div>
      </dialog>
    </div>
  );
}
