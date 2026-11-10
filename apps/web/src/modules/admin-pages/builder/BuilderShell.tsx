'use client';

import type { TreeDocument, TreeNode } from '@parker2808/cms-core/tree';
import { useLocale } from 'next-intl';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {
  children,
  findNode,
  insertNode,
  moveNode,
  outline,
  removeNode,
  reorderNode,
  validDestinations,
  type Destination,
} from './canvas/model';
import { navigateOutline, visibleOutline } from './layers/keyboard';
import { newNode, paletteKinds, type PaletteKind } from './palette/catalog';
import styles from './builder.module.css';

type Copy = {
  title: string;
  draft: string;
  unsaved: string;
  components: string;
  layers: string;
  properties: string;
  search: string;
  canvas: string;
  select: string;
  insert: string;
  move: string;
  remove: string;
  cancel: string;
  confirm: string;
  unavailable: string;
  addSectionFirst: string;
  invalid: string;
  picked: string;
  target: string;
  position: string;
  placed: string;
  selected: string;
  removed: string;
  publishHint: string;
  empty: string;
  choose: string;
  labels: Record<PaletteKind | 'page' | 'column' | 'legacy-component', string>;
};

const copy: Record<'en' | 'vi', Copy> = {
  en: {
    title: 'Page builder',
    draft: 'Local draft',
    unsaved: 'Not saved · D5 connection pending',
    components: 'Components',
    layers: 'Layers',
    properties: 'Properties',
    search: 'Search components',
    canvas: 'Page canvas',
    select: 'Select',
    insert: 'Add',
    move: 'Move',
    remove: 'Delete',
    cancel: 'Cancel',
    confirm: 'Delete selected item?',
    unavailable: 'Choose a compatible slot first',
    addSectionFirst: 'Add a section first',
    invalid: 'This slot does not accept this item or is at its limit',
    picked:
      'Picked up item. Use arrow keys to choose a destination; Enter to place or Escape to cancel.',
    target: 'Destination',
    position: 'position',
    placed: 'Item placed',
    selected: 'Selected',
    removed: 'Item deleted',
    publishHint: 'Publish needs a heading. Draft composition remains available.',
    empty: 'Empty page',
    choose: 'Add a section to start your page',
    labels: {
      page: 'Page',
      section: 'Section',
      row: 'Columns',
      grid: 'Grid',
      column: 'Column',
      heading: 'Heading',
      paragraph: 'Paragraph',
      image: 'Image',
      button: 'Button',
      divider: 'Divider',
      spacer: 'Spacer',
      'legacy-component': 'Legacy component',
    },
  },
  vi: {
    title: 'Trình dựng trang',
    draft: 'Bản nháp cục bộ',
    unsaved: 'Chưa lưu · Đang chờ kết nối D5',
    components: 'Thành phần',
    layers: 'Lớp',
    properties: 'Thuộc tính',
    search: 'Tìm thành phần',
    canvas: 'Khung trang',
    select: 'Chọn',
    insert: 'Thêm',
    move: 'Di chuyển',
    remove: 'Xóa',
    cancel: 'Hủy',
    confirm: 'Xóa mục đã chọn?',
    unavailable: 'Hãy chọn vùng phù hợp trước',
    addSectionFirst: 'Thêm một phần trước',
    invalid: 'Vùng này không nhận mục này hoặc đã đạt giới hạn',
    picked: 'Đã nhấc mục. Dùng phím mũi tên chọn vị trí; Enter để đặt hoặc Escape để hủy.',
    target: 'Vị trí',
    position: 'thứ tự',
    placed: 'Đã đặt mục',
    selected: 'Đã chọn',
    removed: 'Đã xóa mục',
    publishHint: 'Cần tiêu đề để xuất bản. Bạn vẫn có thể soạn bản nháp.',
    empty: 'Trang trống',
    choose: 'Thêm một phần để bắt đầu trang',
    labels: {
      page: 'Trang',
      section: 'Phần',
      row: 'Cột',
      grid: 'Lưới',
      column: 'Cột',
      heading: 'Tiêu đề',
      paragraph: 'Đoạn văn',
      image: 'Hình ảnh',
      button: 'Nút',
      divider: 'Đường kẻ',
      spacer: 'Khoảng cách',
      'legacy-component': 'Thành phần cũ',
    },
  },
};

const initial: TreeDocument = {
  schemaVersion: 1,
  root: {
    id: 'page',
    type: 'page',
    responsive: { base: {} },
    sections: [],
  },
};

function subscribeViewport(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function viewportDevice(): 'mobile' | 'tablet' | 'desktop' {
  return window.innerWidth < 1101 ? 'mobile' : window.innerWidth < 1700 ? 'tablet' : 'desktop';
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function documentTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function label(node: TreeNode, text: Copy) {
  return node.type === 'component'
    ? (text.labels[node.componentType as PaletteKind] ?? node.componentType)
    : text.labels[node.type];
}

export type BuilderMount = (props: {
  document: TreeDocument;
  selectedId: string;
  onDocumentChange: (document: TreeDocument) => void;
  onSelect: (id: string) => void;
}) => ReactNode;

export function BuilderShell({
  pageKey,
  renderProperties,
}: {
  pageKey: string;
  renderProperties?: BuilderMount;
}) {
  const locale = useLocale() === 'vi' ? 'vi' : 'en';
  const theme = useSyncExternalStore(subscribeTheme, documentTheme, () => 'light');
  const text = copy[locale];
  const [document, setDocument] = useState<TreeDocument>(initial);
  const [selectedId, setSelectedId] = useState('page');
  const [sheet, setSheet] = useState<'components' | 'layers' | 'properties' | null>(null);
  const [query, setQuery] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickup, setPickup] = useState<{
    source: string;
    destinations: Destination[];
    index: number;
  } | null>(null);
  const [focusId, setFocusId] = useState('page');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['page']));
  const viewport = useSyncExternalStore(subscribeViewport, viewportDevice, () => 'mobile');
  const [chosenDevice, setChosenDevice] = useState<'mobile' | 'tablet' | 'desktop' | null>(null);
  const device = chosenDevice ?? viewport;
  const [brand, setBrand] = useState<'neutral' | 'lilp'>('neutral');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const confirmRef = useRef<HTMLDivElement | null>(null);
  const deleteTriggerRef = useRef<HTMLElement | null>(null);
  const treeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sheet) return;
    const first = sheetRef.current?.querySelector<HTMLElement>('button, input, [tabindex="0"]');
    first?.focus();
  }, [sheet]);

  function closeSheet() {
    setSheet(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }
  function closeConfirmation() {
    setConfirmDelete(false);
    requestAnimationFrame(() => deleteTriggerRef.current?.focus());
  }
  function openSheet(value: 'components' | 'layers' | 'properties', trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setSheet(value);
  }
  function apply(result: ReturnType<typeof insertNode>) {
    if (result.ok) {
      setDocument(result.document);
      setSelectedId(result.selectedId);
      setFocusId(result.selectedId);
      const nextExpanded = new Set(expanded);
      for (const item of outline(result.document))
        if (item.id === result.selectedId && item.parentId) {
          let ancestor: string | undefined = item.parentId;
          while (ancestor) {
            nextExpanded.add(ancestor);
            ancestor = outline(result.document).find((entry) => entry.id === ancestor)?.parentId;
          }
        }
      setExpanded(nextExpanded);
      setAnnouncement(
        `${text.selected}: ${label(findNode(result.document, result.selectedId)!, text)}`,
      );
    } else setAnnouncement(text.invalid);
    return result.ok;
  }
  function locations(kind: PaletteKind): Destination[] {
    const node = newNode(kind, () => crypto.randomUUID(), locale);
    const targets: Destination[] = [];
    for (const item of outline(document)) {
      const slot =
        item.node.type === 'page'
          ? 'sections'
          : item.node.type === 'section' || item.node.type === 'column'
            ? 'content'
            : item.node.type === 'grid'
              ? 'items'
              : 'columns';
      const index = children(item.node).length;
      if (insertNode(document, node, { parentId: item.id, slot, index }).ok)
        targets.push({ parentId: item.id, slot, index });
    }
    return targets;
  }
  function add(kind: PaletteKind) {
    const node = newNode(kind, () => crypto.randomUUID(), locale);
    const available = locations(kind);
    const selected = findNode(document, selectedId);
    const descendants = new Set<string>();
    if (selected) {
      const stack = [...children(selected)];
      while (stack.length) {
        const child = stack.pop()!;
        descendants.add(child.id);
        stack.push(...children(child));
      }
    }
    const target =
      available.find((item) => item.parentId === selectedId) ??
      available.find((item) => descendants.has(item.parentId)) ??
      available[0];
    if (!target) {
      setAnnouncement(text.invalid);
      return;
    }
    if (apply(insertNode(document, node, target))) closeSheet();
  }
  function visibleItems() {
    return visibleOutline(document, expanded);
  }
  function destinationName(destination: Destination) {
    const path = outline(document);
    const names: string[] = [];
    let item = path.find((entry) => entry.id === destination.parentId);
    while (item) {
      const parent = item.parentId && findNode(document, item.parentId);
      const siblings =
        parent && children(parent).filter((sibling) => sibling.type === item!.node.type);
      const ordinal =
        siblings && siblings.length > 1
          ? ` ${siblings.findIndex((sibling) => sibling.id === item!.id) + 1}`
          : '';
      names.unshift(`${label(item.node, text)}${ordinal}`);
      item = path.find((entry) => entry.id === item!.parentId);
    }
    return `${names.join(' / ')} · ${text.position} ${destination.index + 1}`;
  }
  function dropOn(source: string, targetId: string) {
    const target = findNode(document, targetId);
    if (!target || source === targetId) {
      setAnnouncement(text.invalid);
      return;
    }
    const slot =
      target.type === 'page'
        ? 'sections'
        : target.type === 'section' || target.type === 'column'
          ? 'content'
          : target.type === 'grid'
            ? 'items'
            : 'columns';
    const inside = { parentId: targetId, slot, index: children(target).length } as Destination;
    const insideResult = moveNode(document, source, inside);
    if (insideResult.ok) {
      apply(insideResult);
      return;
    }
    const parentId = outline(document).find((item) => item.id === targetId)?.parentId;
    const parent = parentId && findNode(document, parentId);
    if (!parent) {
      setAnnouncement(text.invalid);
      return;
    }
    const siblingSlot =
      parent.type === 'page'
        ? 'sections'
        : parent.type === 'section' || parent.type === 'column'
          ? 'content'
          : parent.type === 'grid'
            ? 'items'
            : 'columns';
    apply(
      moveNode(document, source, {
        parentId,
        slot: siblingSlot,
        index: children(parent).findIndex((item) => item.id === targetId),
      }),
    );
  }
  function focusTree(id: string) {
    setFocusId(id);
    requestAnimationFrame(() =>
      treeRef.current?.querySelector<HTMLElement>(`[data-tree-id="${id}"]`)?.focus(),
    );
  }
  function keyTree(event: KeyboardEvent<HTMLDivElement>, id: string) {
    const items = visibleItems();
    const index = items.findIndex((item) => item.id === id);
    const current = items[index];
    if (!current) return;
    if (pickup) {
      if (event.key === 'Escape') {
        event.preventDefault();
        const source = pickup.source;
        setPickup(null);
        focusTree(source);
        setAnnouncement(text.cancel);
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next =
          (pickup.index + (event.key === 'ArrowDown' ? 1 : -1) + pickup.destinations.length) %
          pickup.destinations.length;
        setPickup({ ...pickup, index: next });
        setAnnouncement(`${text.target}: ${destinationName(pickup.destinations[next]!)}`);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const source = pickup.source;
        apply(moveNode(document, source, pickup.destinations[pickup.index]!));
        setPickup(null);
        focusTree(source);
        setAnnouncement(text.placed);
        return;
      }
      return;
    }
    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      apply(reorderNode(document, id, event.key === 'ArrowUp' ? -1 : 1));
      focusTree(id);
    } else if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      focusTree(navigateOutline(document, expanded, id, event.key).focusId);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = navigateOutline(
        document,
        expanded,
        id,
        event.key,
        globalThis.document.documentElement.dir === 'rtl',
      );
      setExpanded(next.expanded);
      focusTree(next.focusId);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      setSelectedId(id);
      setAnnouncement(`${text.selected}: ${label(current.node, text)}`);
    } else if (event.key === ' ' && id !== 'page') {
      event.preventDefault();
      const destinations = validDestinations(document, id);
      if (destinations.length) {
        setPickup({ source: id, destinations, index: 0 });
        setAnnouncement(`${text.picked} ${text.target}: ${destinationName(destinations[0]!)}`);
      }
    } else if (event.key === 'Delete' && id !== 'page') {
      event.preventDefault();
      setSelectedId(id);
      deleteTriggerRef.current = event.target as HTMLElement;
      setConfirmDelete(true);
    }
  }

  function panel(name: 'components' | 'layers' | 'properties') {
    if (name === 'components')
      return (
        <div className={styles.panelBody}>
          <label className={styles.field}>
            {text.search}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.search}
            />
          </label>
          {(['layout', 'content'] as const).map((group) => (
            <section
              key={group}
              aria-label={
                group === 'layout'
                  ? locale === 'vi'
                    ? 'Bố cục'
                    : 'Layout'
                  : locale === 'vi'
                    ? 'Nội dung'
                    : 'Content'
              }
            >
              <h3>
                {group === 'layout'
                  ? locale === 'vi'
                    ? 'Bố cục'
                    : 'Layout'
                  : locale === 'vi'
                    ? 'Nội dung'
                    : 'Content'}
              </h3>
              <div className={styles.palette}>
                {paletteKinds
                  .filter(
                    (kind) =>
                      (group === 'layout'
                        ? ['section', 'row', 'grid']
                        : ['heading', 'paragraph', 'image', 'button', 'divider', 'spacer']
                      ).includes(kind) &&
                      text.labels[kind]
                        .toLocaleLowerCase(locale)
                        .includes(query.toLocaleLowerCase(locale)),
                  )
                  .map((kind) => {
                    const available = locations(kind).length > 0;
                    const reason = document.root.sections.length
                      ? text.invalid
                      : text.addSectionFirst;
                    return (
                      <button
                        key={kind}
                        type="button"
                        aria-disabled={!available}
                        title={available ? undefined : reason}
                        onClick={() => (available ? add(kind) : setAnnouncement(reason))}
                      >
                        <span className={styles.tileIcon} aria-hidden="true">
                          {kind === 'section'
                            ? '▣'
                            : kind === 'row'
                              ? '▥'
                              : kind === 'grid'
                                ? '▦'
                                : kind === 'heading'
                                  ? 'H'
                                  : kind === 'paragraph'
                                    ? '≡'
                                    : kind === 'image'
                                      ? '▧'
                                      : kind === 'button'
                                        ? '▭'
                                        : kind === 'divider'
                                          ? '—'
                                          : '↕'}
                        </span>
                        <span>{text.labels[kind]}</span>
                        {!available && <small>{reason}</small>}
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      );
    if (name === 'properties')
      return (
        <div className={styles.panelBody}>
          <p className={styles.eyebrow}>{text.selected}</p>
          <h3>{label(findNode(document, selectedId) ?? document.root, text)}</h3>
          <p>{text.unsaved}</p>
          <p className={styles.hint}>{text.publishHint}</p>
          {renderProperties?.({
            document,
            selectedId,
            onDocumentChange: setDocument,
            onSelect: setSelectedId,
          })}
        </div>
      );
    return (
      <div className={styles.panelBody}>
        <p className={styles.hint}>
          {pickup
            ? text.picked
            : locale === 'vi'
              ? 'Mũi tên để duyệt · Space để nhấc · Alt + mũi tên để đổi thứ tự'
              : 'Arrows to navigate · Space to pick up · Alt + arrow to reorder'}
        </p>
        <div
          role="tree"
          aria-label={text.layers}
          ref={treeRef}
          onKeyDown={(event) => {
            const target = (event.target as HTMLElement).closest<HTMLElement>('[data-tree-id]');
            if (target) keyTree(event, target.dataset.treeId!);
          }}
        >
          {visibleItems().map((item) => (
            <div
              key={item.id}
              role="treeitem"
              data-tree-id={item.id}
              tabIndex={item.id === focusId ? 0 : -1}
              aria-level={item.depth + 1}
              aria-selected={selectedId === item.id}
              aria-expanded={children(item.node).length ? expanded.has(item.id) : undefined}
              draggable={item.id !== 'page'}
              onDragStart={(event) => event.dataTransfer.setData('text/plain', item.id)}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes('text/plain')) event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                dropOn(event.dataTransfer.getData('text/plain'), item.id);
              }}
              onClick={() => {
                setSelectedId(item.id);
                setFocusId(item.id);
              }}
              className={styles.treeItem}
              style={{ '--depth': item.depth } as CSSProperties}
            >
              <span aria-hidden="true" className={styles.treeGuide}>
                └
              </span>
              <span className={styles.treeLabel}>{label(item.node, text)}</span>
              <small>{item.id === 'page' ? pageKey : item.id.slice(0, 6)}</small>
            </div>
          ))}
        </div>
        {pickup && (
          <p className={styles.target}>
            {text.target}: {destinationName(pickup.destinations[pickup.index]!)} ·{' '}
            {pickup.index + 1}/{pickup.destinations.length}
          </p>
        )}
      </div>
    );
  }

  function canvasNode(node: TreeNode): ReactNode {
    const selected = selectedId === node.id;
    return (
      <div
        key={node.id}
        className={`${styles.node} ${selected ? styles.selected : ''}`}
        data-node-type={node.type}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes('text/plain')) event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          dropOn(event.dataTransfer.getData('text/plain'), node.id);
        }}
      >
        <div
          className={styles.nodeBar}
          draggable={node.id !== 'page'}
          onDragStart={(event) => {
            event.stopPropagation();
            event.dataTransfer.setData('text/plain', node.id);
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedId(node.id)}
            aria-label={`${text.select} ${label(node, text)}`}
          >
            {label(node, text)}
          </button>
          {selected && node.id !== 'page' && (
            <>
              <button
                type="button"
                onClick={() => {
                  apply(reorderNode(document, node.id, -1));
                }}
                aria-label={`${text.move} ↑`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => {
                  apply(reorderNode(document, node.id, 1));
                }}
                aria-label={`${text.move} ↓`}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={(event) => {
                  deleteTriggerRef.current = event.currentTarget;
                  setConfirmDelete(true);
                }}
                aria-label={`${text.remove} ${label(node, text)}`}
              >
                ×
              </button>
            </>
          )}
        </div>
        {node.type === 'component' ? (
          <div className={styles.componentPreview}>
            {node.componentType === 'heading' ? (
              <h2>{String(node.responsive.base.text)}</h2>
            ) : node.componentType === 'paragraph' ? (
              <p>{String(node.responsive.base.text)}</p>
            ) : node.componentType === 'image' ? (
              <div className={styles.imagePlaceholder}>▧ {String(node.responsive.base.alt)}</div>
            ) : node.componentType === 'button' ? (
              <span className={styles.previewButton}>{String(node.responsive.base.label)}</span>
            ) : node.componentType === 'divider' ? (
              <hr />
            ) : (
              <div className={styles.spacer} />
            )}
          </div>
        ) : (
          <div className={styles.children}>
            {children(node).length ? (
              children(node).map(canvasNode)
            ) : (
              <button
                type="button"
                className={styles.dropTarget}
                onClick={(event) => openSheet('components', event.currentTarget)}
              >
                {node.type === 'page' ? text.choose : `${text.insert} ${text.components}`}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const path = outline(document);
  const selectedPath: string[] = [];
  let currentId: string | undefined = selectedId;
  while (currentId) {
    const item = path.find((entry) => entry.id === currentId);
    if (!item) break;
    selectedPath.unshift(label(item.node, text));
    currentId = item.parentId;
  }

  return (
    <section
      className={`cms-core ${styles.shell}`}
      data-theme={theme}
      data-brand={brand}
      aria-label={text.title}
    >
      <header className={styles.header} inert={!!sheet || confirmDelete}>
        <div>
          <p className={styles.eyebrow}>
            {text.draft} · {pageKey}
          </p>
          <h1>{text.title}</h1>
        </div>
        <div className={styles.headerActions}>
          {!renderProperties && (
            <button
              type="button"
              className={styles.propertiesTrigger}
              onClick={(event) => openSheet('properties', event.currentTarget)}
            >
              {text.properties}
            </button>
          )}
          <button
            type="button"
            className={styles.brandButton}
            aria-label={`${brand === 'neutral' ? 'Core' : 'lil.p'} · ${locale === 'vi' ? 'Đổi giao diện lõi và lil.p' : 'Switch neutral and lil.p theme'}`}
            onClick={() => setBrand(brand === 'neutral' ? 'lilp' : 'neutral')}
          >
            {brand === 'neutral' ? 'Core' : 'lil.p'}
          </button>
          <span className={styles.status}>{text.unsaved}</span>
          <button type="button" disabled title={text.unsaved}>
            {locale === 'vi' ? 'Xuất bản' : 'Publish'}
          </button>
        </div>
      </header>
      <div
        className={`${styles.workspace} ${renderProperties ? styles.withInspector : ''}`}
        inert={!!sheet || confirmDelete}
      >
        <aside className={styles.sidebar} aria-label={text.components}>
          <h2>{text.components}</h2>
          {panel('components')}
        </aside>
        <aside className={`${styles.sidebar} ${styles.layers}`} aria-label={text.layers}>
          <h2>{text.layers}</h2>
          {panel('layers')}
        </aside>
        <section className={styles.canvasArea} aria-label={text.canvas}>
          <div className={styles.canvasToolbar}>
            <span>
              {text.canvas} · {document.root.sections.length} {text.labels.section.toLowerCase()}
              {device === 'tablet' && viewport === 'tablet' ? ' · 768 px / 84%' : ''}
            </span>
            <div
              role="group"
              aria-label={locale === 'vi' ? 'Kích thước xem trước' : 'Preview width'}
            >
              {(['mobile', 'tablet', 'desktop'] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={device === value}
                  onClick={() => setChosenDevice(value)}
                >
                  {value === 'mobile' ? '390' : value === 'tablet' ? '768' : '1440'} px
                </button>
              ))}
            </div>
          </div>
          <div className={styles.canvasScroll}>
            <div
              className={styles.pageFrame}
              data-device={device}
              style={{ width: device === 'mobile' ? 390 : device === 'tablet' ? 768 : 1440 }}
            >
              {canvasNode(document.root)}
            </div>
          </div>
        </section>
        <aside className={`${styles.sidebar} ${styles.inspector}`} aria-label={text.properties}>
          <h2>{text.properties}</h2>
          {panel('properties')}
        </aside>
      </div>
      <div
        className={styles.selectionStrip}
        inert={!!sheet || confirmDelete}
        aria-label={text.selected}
      >
        <span className={styles.selectionPath}>{selectedPath.join(' / ')}</span>
        {selectedId !== 'page' && (
          <>
            <button
              type="button"
              onClick={() => apply(reorderNode(document, selectedId, -1))}
              aria-label={`${text.move} ↑`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => apply(reorderNode(document, selectedId, 1))}
              aria-label={`${text.move} ↓`}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={(event) => {
                deleteTriggerRef.current = event.currentTarget;
                setConfirmDelete(true);
              }}
              aria-label={`${text.remove} ${selectedPath.at(-1)}`}
            >
              ×
            </button>
          </>
        )}
        <button
          type="button"
          onClick={(event) => openSheet('properties', event.currentTarget)}
          aria-label={text.properties}
        >
          ↗
        </button>
      </div>
      <nav className={styles.mobileBar} aria-label={text.title} inert={!!sheet || confirmDelete}>
        {(['components', 'layers', 'properties'] as const).map((name) => (
          <button
            key={name}
            type="button"
            aria-expanded={sheet === name}
            onClick={(event) => openSheet(name, event.currentTarget)}
          >
            {text[name]}
          </button>
        ))}
      </nav>
      {sheet && (
        <div
          className={styles.backdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSheet();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={text[sheet]}
            className={styles.sheet}
            ref={sheetRef}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                closeSheet();
              }
              if (event.key === 'Tab') {
                const items = Array.from(
                  sheetRef.current?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input, [tabindex="0"]',
                  ) ?? [],
                );
                const first = items[0],
                  last = items.at(-1);
                if (event.shiftKey && globalThis.document.activeElement === first) {
                  event.preventDefault();
                  last?.focus();
                } else if (!event.shiftKey && globalThis.document.activeElement === last) {
                  event.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <div className={styles.sheetTitle}>
              <h2>{text[sheet]}</h2>
              <button type="button" onClick={closeSheet} aria-label={text.cancel}>
                ×
              </button>
            </div>
            {panel(sheet)}
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className={styles.backdrop}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={text.confirm}
            className={styles.confirm}
            ref={confirmRef}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                closeConfirmation();
              }
              if (event.key === 'Tab') {
                const buttons = confirmRef.current?.querySelectorAll<HTMLButtonElement>('button');
                if (buttons && event.shiftKey && globalThis.document.activeElement === buttons[0]) {
                  event.preventDefault();
                  buttons[1]?.focus();
                } else if (
                  buttons &&
                  !event.shiftKey &&
                  globalThis.document.activeElement === buttons[1]
                ) {
                  event.preventDefault();
                  buttons[0]?.focus();
                }
              }
            }}
          >
            <h2>{text.confirm}</h2>
            <div>
              <button type="button" autoFocus onClick={closeConfirmation}>
                {text.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  apply(removeNode(document, selectedId));
                  closeConfirmation();
                  setAnnouncement(text.removed);
                }}
              >
                {text.remove}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.srOnly} role="status" aria-live="polite">
        {announcement}
      </div>
    </section>
  );
}
