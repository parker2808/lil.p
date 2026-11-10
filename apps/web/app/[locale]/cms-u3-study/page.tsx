import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Columns3,
  Eye,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Monitor,
  MousePointer2,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Settings2,
  Smartphone,
  Tablet,
  Type,
  Undo2,
} from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import styles from './study.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CMS U3 · Builder design study',
  robots: { index: false, follow: false },
};

const copy = {
  en: {
    study: 'DESIGN STUDY · U3',
    back: 'Design review',
    page: 'New page',
    draft: 'Draft',
    saved: 'All changes saved',
    conflict: 'Could not save changes',
    conflictHint: 'Another version was saved. Review before retrying.',
    undone: 'Change undone',
    statusSample: 'Status sample',
    statusSaved: 'Saved',
    statusConflict: 'Conflict',
    preview: 'Preview',
    publish: 'Publish',
    undo: 'Undo',
    redo: 'Redo',
    palette: 'Components',
    paletteHint: 'A place for every idea.',
    layout: 'LAYOUT',
    content: 'CONTENT',
    section: 'Section',
    columns: 'Columns',
    grid: 'Grid',
    heading: 'Heading',
    text: 'Text',
    image: 'Image',
    canvas: 'Canvas',
    canvasHint: 'Shape your page, one piece at a time.',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    empty: 'Your page starts here.',
    emptyHint: 'Add a section to give your story some room to grow.',
    noSelection: 'Nothing selected yet',
    noSelectionHint: 'Select a component on the canvas to see its properties here.',
    addSection: 'Add a section',
    nested: 'A page with room to breathe',
    nestedHint: 'A composed example with nested sections and responsive properties.',
    overrides: 'Made for every screen',
    overridesHint: 'A preview of mobile, tablet and desktop overrides.',
    pageLabel: 'PAGE',
    hero: 'Hero section',
    selected: 'Selected',
    intro: 'An introduction worth staying for.',
    introText:
      'Thoughtful spaces turn a few simple elements into something memorable. Start with the story; let the layout follow.',
    action: 'Explore the story',
    features: 'The details make the difference',
    featureOne: 'Designed to flow',
    featureTwo: 'Built to adapt',
    featureText: 'A flexible system for ideas of every size.',
    drop: 'Add a component here',
    nestedDrop: 'Add to this column',
    endDrop: 'Add a section below',
    inspector: 'Properties',
    inspectorHint: 'Make this piece yours.',
    selection: 'SELECTION',
    breadcrumb: 'Page / Hero / Heading',
    contentTab: 'Content',
    designTab: 'Design',
    headingLabel: 'Heading text',
    headingValue: 'An introduction worth staying for.',
    level: 'Heading level',
    alignment: 'Alignment',
    left: 'Left',
    center: 'Center',
    spacing: 'Spacing',
    device: 'DEVICE OVERRIDES',
    inherited: 'Inherits from base',
    visibility: 'Visibility',
    visible: 'Visible on all screens',
    neutral: 'Neutral core',
    branded: 'lil.p tokens',
    help: 'Keyboard guide',
    sample: 'Static design sample · not an editor',
    switchScene: 'Sample page',
    switchTheme: 'Theme',
    switchBrand: 'Token set',
    switchDevice: 'Preview size',
    sceneEmpty: 'Empty',
    sceneNested: 'Nested',
    sceneOverrides: 'Overrides',
    light: 'Light',
    dark: 'Dark',
    status: 'STATUS',
    change: 'Last saved just now',
    tokenNote: 'Only semantic tokens change; layout and markup stay the same.',
    mobileNote: 'Mobile: single column · compact heading',
    tabletNote: 'Tablet: two columns · balanced spacing',
    desktopNote: 'Desktop: two columns · generous spacing',
  },
  vi: {
    study: 'MẪU THIẾT KẾ · U3',
    back: 'Duyệt thiết kế',
    page: 'Trang mới',
    draft: 'Bản nháp',
    saved: 'Đã lưu mọi thay đổi',
    conflict: 'Không thể lưu thay đổi',
    conflictHint: 'Đã có phiên bản khác. Hãy kiểm tra trước khi thử lại.',
    undone: 'Đã hoàn tác thay đổi',
    statusSample: 'Trạng thái mẫu',
    statusSaved: 'Đã lưu',
    statusConflict: 'Xung đột',
    preview: 'Xem trước',
    publish: 'Xuất bản',
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    palette: 'Thành phần',
    paletteHint: 'Chỗ cho mọi ý tưởng.',
    layout: 'BỐ CỤC',
    content: 'NỘI DUNG',
    section: 'Phần',
    columns: 'Cột',
    grid: 'Lưới',
    heading: 'Tiêu đề',
    text: 'Văn bản',
    image: 'Hình ảnh',
    canvas: 'Khung trang',
    canvasHint: 'Tạo hình cho trang, từng mảnh một.',
    desktop: 'Máy tính',
    tablet: 'Máy tính bảng',
    mobile: 'Điện thoại',
    empty: 'Trang của bạn bắt đầu tại đây.',
    emptyHint: 'Thêm một phần để câu chuyện có không gian phát triển.',
    noSelection: 'Chưa chọn thành phần',
    noSelectionHint: 'Chọn một thành phần trên trang để xem thuộc tính tại đây.',
    addSection: 'Thêm phần',
    nested: 'Một trang đầy khoảng thở',
    nestedHint: 'Ví dụ nhiều phần lồng nhau và thuộc tính thích ứng.',
    overrides: 'Đẹp trên mọi màn hình',
    overridesHint: 'Xem trước tùy chỉnh cho điện thoại, máy tính bảng và máy tính.',
    pageLabel: 'TRANG',
    hero: 'Phần giới thiệu',
    selected: 'Đã chọn',
    intro: 'Một lời mở đầu đáng để dừng lại.',
    introText:
      'Không gian được chăm chút biến những yếu tố giản dị thành điều đáng nhớ. Bắt đầu từ câu chuyện; bố cục sẽ theo sau.',
    action: 'Khám phá câu chuyện',
    features: 'Khác biệt nằm ở chi tiết',
    featureOne: 'Thiết kế liền mạch',
    featureTwo: 'Linh hoạt thích ứng',
    featureText: 'Hệ thống linh hoạt cho ý tưởng ở mọi quy mô.',
    drop: 'Thêm thành phần tại đây',
    nestedDrop: 'Thêm vào cột này',
    endDrop: 'Thêm phần bên dưới',
    inspector: 'Thuộc tính',
    inspectorHint: 'Tạo dấu ấn cho từng chi tiết.',
    selection: 'ĐANG CHỌN',
    breadcrumb: 'Trang / Giới thiệu / Tiêu đề',
    contentTab: 'Nội dung',
    designTab: 'Thiết kế',
    headingLabel: 'Nội dung tiêu đề',
    headingValue: 'Một lời mở đầu đáng để dừng lại.',
    level: 'Cấp tiêu đề',
    alignment: 'Căn chỉnh',
    left: 'Trái',
    center: 'Giữa',
    spacing: 'Khoảng cách',
    device: 'TÙY CHỈNH THEO THIẾT BỊ',
    inherited: 'Kế thừa mặc định',
    visibility: 'Hiển thị',
    visible: 'Hiển thị trên mọi màn hình',
    neutral: 'Mặc định trung tính',
    branded: 'Màu lil.p',
    help: 'Hướng dẫn bàn phím',
    sample: 'Mẫu thiết kế tĩnh · không phải trình biên tập',
    switchScene: 'Trang mẫu',
    switchTheme: 'Giao diện',
    switchBrand: 'Bộ màu',
    switchDevice: 'Kích thước xem trước',
    sceneEmpty: 'Trang trống',
    sceneNested: 'Lồng nhau',
    sceneOverrides: 'Thích ứng',
    light: 'Sáng',
    dark: 'Tối',
    status: 'TRẠNG THÁI',
    change: 'Vừa lưu',
    tokenNote: 'Chỉ thay đổi biến màu; bố cục và cấu trúc giữ nguyên.',
    mobileNote: 'Điện thoại: một cột · tiêu đề gọn',
    tabletNote: 'Máy tính bảng: hai cột · khoảng cách cân đối',
    desktopNote: 'Máy tính: hai cột · khoảng cách rộng',
  },
} as const;

type Choice = {
  scene: 'empty' | 'nested' | 'overrides';
  device: 'desktop' | 'tablet' | 'mobile';
  theme: 'light' | 'dark';
  brand: 'neutral' | 'lilp';
  status: 'saved' | 'conflict' | 'undone';
};

const sampleLabels = {
  unit: 'px',
  wordmark: 'atelier',
  punctuation: '.',
  heroIndex: '01 / 02',
  sectionIndex: '02 / 02',
  firstColumn: '01',
  secondColumn: '02',
  artMark: 'a.',
  artCaption: '01 — STUDIO / 2026',
  headingLevel: 'H2',
};

export default async function BuilderStudy({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.R3_E2E_STATES !== '1') notFound();
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'vi' ? 'vi' : 'en';
  setRequestLocale(locale);
  const query = await searchParams;
  const selection: Choice = {
    scene: query.scene === 'empty' || query.scene === 'overrides' ? query.scene : 'nested',
    device: query.device === 'mobile' || query.device === 'tablet' ? query.device : 'desktop',
    theme: query.theme === 'dark' ? 'dark' : 'light',
    brand: query.brand === 'lilp' ? 'lilp' : 'neutral',
    status: query.status === 'conflict' || query.status === 'undone' ? query.status : 'saved',
  };
  const t = copy[locale];
  const emptyIndex = `${t.pageLabel} / 01`;
  const headingIndex = `${t.pageLabel} / 001`;
  const link = (key: keyof Choice, value: string) =>
    `/${locale}/cms-u3-study?${new URLSearchParams({ ...selection, [key]: value })}`;
  const scenes = [
    { value: 'empty', label: t.sceneEmpty },
    { value: 'nested', label: t.sceneNested },
    { value: 'overrides', label: t.sceneOverrides },
  ] as const;
  const devices = [
    { value: 'desktop', label: t.desktop, icon: Monitor },
    { value: 'tablet', label: t.tablet, icon: Tablet },
    { value: 'mobile', label: t.mobile, icon: Smartphone },
  ] as const;
  const palette = [
    { label: t.section, icon: LayoutGrid },
    { label: t.columns, icon: Columns3 },
    { label: t.grid, icon: LayoutGrid },
    { label: t.heading, icon: Type },
    { label: t.text, icon: Type },
    { label: t.image, icon: ImageIcon },
  ];

  return (
    <main
      id="content"
      className={styles.study}
      data-theme={selection.theme}
      data-brand={selection.brand}
      data-scene={selection.scene}
    >
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.identity}>
            <span className={styles.symbol} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <div>
              <span className={styles.overline}>{t.study}</span>
              <h1 className={styles.pageTitle}>
                {t.page}
                <ChevronDown size={14} aria-hidden="true" />
              </h1>
            </div>
            <Badge variant="outline" className={styles.draft}>
              {t.draft}
            </Badge>
          </div>
          <div className={styles.topActions}>
            <span
              className={selection.status === 'conflict' ? styles.saveError : styles.saveStatus}
            >
              {selection.status === 'conflict' ? (
                <AlertTriangle size={15} aria-hidden="true" />
              ) : (
                <Check size={15} aria-hidden="true" />
              )}
              {selection.status === 'conflict'
                ? t.conflict
                : selection.status === 'undone'
                  ? t.undone
                  : t.saved}
            </span>
            <Button variant="ghost" className={styles.iconButton} aria-label={t.undo} disabled>
              <Undo2 size={18} />
            </Button>
            <Button variant="ghost" className={styles.iconButton} aria-label={t.redo} disabled>
              <Redo2 size={18} />
            </Button>
            <span className={styles.actionDivider} />
            <Button variant="outline" className={styles.actionButton} disabled>
              <Eye size={16} />
              {t.preview}
            </Button>
            <Button className={styles.publishButton} disabled>
              {t.publish}
              <ArrowRight size={16} />
            </Button>
          </div>
        </header>

        <div className={styles.reviewBar}>
          <div className={styles.reviewLeft}>
            <span className={styles.reviewDot} />
            {t.sample}
          </div>
          <nav className={styles.sceneNav} aria-label={t.switchScene}>
            {scenes.map(({ value, label }) => (
              <a
                key={value}
                href={link('scene', value)}
                aria-current={selection.scene === value ? 'page' : undefined}
                className={selection.scene === value ? styles.active : ''}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className={styles.reviewToggles}>
            <nav aria-label={t.switchBrand}>
              <a href={link('brand', selection.brand === 'neutral' ? 'lilp' : 'neutral')}>
                {selection.brand === 'neutral' ? t.neutral : t.branded}
                <RotateCcw size={13} aria-hidden="true" />
              </a>
            </nav>
            <nav aria-label={t.switchTheme}>
              <a href={link('theme', selection.theme === 'light' ? 'dark' : 'light')}>
                {selection.theme === 'light' ? t.light : t.dark}
                <ChevronDown size={13} aria-hidden="true" />
              </a>
            </nav>
          </div>
        </div>

        <div className={styles.workspace}>
          <aside className={styles.palette} aria-label={t.palette}>
            <div className={styles.panelHeading}>
              <div>
                <h2>{t.palette}</h2>
                <p>{t.paletteHint}</p>
              </div>
              <Plus size={18} aria-hidden="true" />
            </div>
            <div className={styles.paletteScroll} role="region" aria-label={t.palette} tabIndex={0}>
              <p className={styles.groupLabel}>{t.layout}</p>
              <div className={styles.paletteGrid}>
                {palette.slice(0, 3).map(({ label, icon: Icon }) => (
                  <div key={label} className={styles.paletteTile}>
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                    <span>{label}</span>
                    <GripVertical size={13} className={styles.grip} aria-hidden="true" />
                  </div>
                ))}
              </div>
              <p className={styles.groupLabel}>{t.content}</p>
              <div className={styles.paletteGrid}>
                {palette.slice(3).map(({ label, icon: Icon }) => (
                  <div key={label} className={styles.paletteTile}>
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                    <span>{label}</span>
                    <GripVertical size={13} className={styles.grip} aria-hidden="true" />
                  </div>
                ))}
              </div>
              <div className={styles.paletteTip}>
                <CircleHelp size={16} aria-hidden="true" />
                <span>{t.tokenNote}</span>
              </div>
            </div>
            <div className={styles.panelFoot}>
              <CircleHelp size={16} aria-hidden="true" />
              {t.help}
            </div>
          </aside>

          <section className={styles.center} aria-label={t.canvas}>
            <div className={styles.canvasToolbar}>
              <div>
                <span className={styles.overline}>{t.canvas}</span>
                <h2>
                  {selection.scene === 'empty'
                    ? t.empty
                    : selection.scene === 'nested'
                      ? t.nested
                      : t.overrides}
                </h2>
                <p>
                  {selection.scene === 'empty'
                    ? t.emptyHint
                    : selection.scene === 'nested'
                      ? t.nestedHint
                      : t.overridesHint}
                </p>
              </div>
              <nav className={styles.deviceSwitch} aria-label={t.switchDevice}>
                {devices.map(({ value, label, icon: Icon }) => (
                  <a
                    key={value}
                    href={link('device', value)}
                    aria-label={label}
                    title={label}
                    aria-current={selection.device === value ? 'page' : undefined}
                    className={selection.device === value ? styles.deviceActive : ''}
                  >
                    <Icon size={17} aria-hidden="true" />
                  </a>
                ))}
              </nav>
            </div>
            <div className={styles.canvasBackdrop}>
              <div className={styles.previewFrame} data-device={selection.device}>
                <div className={styles.previewChrome}>
                  <span className={styles.previewDots}>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>{t.page}</span>
                  <span className={styles.previewWidth}>
                    {selection.device === 'mobile'
                      ? '390'
                      : selection.device === 'tablet'
                        ? '768'
                        : '1440'}{' '}
                    {sampleLabels.unit}
                  </span>
                </div>
                <div className={styles.paper}>
                  {selection.scene === 'empty' ? (
                    <div className={styles.emptyCanvas}>
                      <div className={styles.emptyIllustration}>
                        <span />
                        <span />
                        <span />
                      </div>
                      <span className={styles.emptyKicker}>{emptyIndex}</span>
                      <h2>{t.empty}</h2>
                      <p>{t.emptyHint}</p>
                      <div className={styles.sampleAction}>
                        <Plus size={17} aria-hidden="true" />
                        {t.addSection}
                      </div>
                      <div className={styles.emptyGrid} aria-hidden="true" />
                    </div>
                  ) : (
                    <div className={styles.composition}>
                      <div className={styles.pageNav}>
                        <span className={styles.wordmark}>
                          {sampleLabels.wordmark}
                          <span>{sampleLabels.punctuation}</span>
                        </span>
                        <span className={styles.pageNavLines}>
                          <i />
                          <i />
                        </span>
                      </div>
                      <div className={styles.sectionTag}>
                        <span className={styles.sectionTagDot} />
                        {t.hero}
                        <span>{sampleLabels.heroIndex}</span>
                      </div>
                      <div className={styles.heroLayout}>
                        <div>
                          <span className={styles.editorLabel}>
                            <MousePointer2 size={12} aria-hidden="true" />
                            {t.selected} · {t.heading}
                          </span>
                          <span className={styles.eyebrow}>{headingIndex}</span>
                          <h2 className={styles.selectedHeading}>{t.intro}</h2>
                          <p className={styles.heroCopy}>{t.introText}</p>
                          <span className={styles.heroCta}>
                            {t.action}
                            <ArrowRight size={15} aria-hidden="true" />
                          </span>
                        </div>
                        <div className={styles.art} aria-label={t.image} role="img">
                          <span className={styles.artCircle} />
                          <span className={styles.artArc} />
                          <span className={styles.artMark}>{sampleLabels.artMark}</span>
                          <span className={styles.artCaption}>{sampleLabels.artCaption}</span>
                        </div>
                      </div>
                      <div className={styles.dropZone}>
                        <Plus size={16} aria-hidden="true" />
                        {t.drop}
                      </div>
                      <div className={styles.secondSection}>
                        <div className={styles.sectionTag}>
                          <span className={styles.sectionTagDot} />
                          {t.section}
                          <span>{sampleLabels.sectionIndex}</span>
                        </div>
                        <h3>{t.features}</h3>
                        <div className={styles.columnGrid}>
                          <div className={styles.column}>
                            <span className={styles.columnNumber}>{sampleLabels.firstColumn}</span>
                            <span className={styles.columnIcon}>
                              <ArrowDown size={20} aria-hidden="true" />
                            </span>
                            <h4>{t.featureOne}</h4>
                            <p>{t.featureText}</p>
                            <div className={styles.nestedZone}>
                              <Plus size={14} aria-hidden="true" />
                              {t.nestedDrop}
                            </div>
                          </div>
                          <div className={styles.column}>
                            <span className={styles.columnNumber}>{sampleLabels.secondColumn}</span>
                            <span className={styles.columnIcon}>
                              <Settings2 size={20} aria-hidden="true" />
                            </span>
                            <h4>{t.featureTwo}</h4>
                            <p>{t.featureText}</p>
                            <div className={styles.nestedZone}>
                              <Plus size={14} aria-hidden="true" />
                              {t.nestedDrop}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.endZone}>
                        <Plus size={17} aria-hidden="true" />
                        {t.endDrop}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {selection.scene === 'overrides' && (
                <div className={styles.overrideCaption}>
                  <Smartphone size={16} aria-hidden="true" />
                  {selection.device === 'mobile'
                    ? t.mobileNote
                    : selection.device === 'tablet'
                      ? t.tabletNote
                      : t.desktopNote}
                </div>
              )}
              {selection.status === 'undone' && (
                <div className={styles.undoToast} role="status">
                  <Undo2 size={17} aria-hidden="true" />
                  {t.undone}
                  <a href={link('status', 'saved')}>{t.redo}</a>
                </div>
              )}
            </div>
          </section>

          <aside className={styles.inspector} aria-label={t.inspector}>
            <div className={styles.panelHeading}>
              <div>
                <h2>{t.inspector}</h2>
                <p>{t.inspectorHint}</p>
              </div>
              <Settings2 size={18} aria-hidden="true" />
            </div>
            <div className={styles.inspectorScroll}>
              {selection.scene === 'empty' ? (
                <div className={styles.inspectorEmpty}>
                  <span className={styles.inspectorEmptyIcon}>
                    <MousePointer2 size={23} aria-hidden="true" />
                  </span>
                  <h3>{t.noSelection}</h3>
                  <p>{t.noSelectionHint}</p>
                </div>
              ) : (
                <>
                  <p className={styles.groupLabel}>{t.selection}</p>
                  <div className={styles.selectionCard}>
                    <span className={styles.selectionIcon}>
                      <Type size={18} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{t.heading}</strong>
                      <small>{t.breadcrumb}</small>
                    </span>
                    <ChevronDown size={15} aria-hidden="true" />
                  </div>
                  <div className={styles.inspectorTabs}>
                    <span className={styles.tabActive}>{t.contentTab}</span>
                    <span>{t.designTab}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>{t.headingLabel}</span>
                    <div className={styles.fieldValue}>{t.headingValue}</div>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>{t.level}</span>
                    <div className={styles.selectValue}>
                      {sampleLabels.headingLevel}
                      <ChevronDown size={15} aria-hidden="true" />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>{t.alignment}</span>
                    <div className={styles.alignOptions}>
                      <span className={styles.alignActive}>
                        <ArrowLeft size={15} aria-hidden="true" />
                        {t.left}
                      </span>
                      <span>{t.center}</span>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>{t.spacing}</span>
                    <div className={styles.spacingTrack}>
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className={styles.inspectorRule} />
                  <p className={styles.groupLabel}>{t.device}</p>
                  <div className={styles.overrideList}>
                    {devices.map(({ value, label, icon: Icon }) => (
                      <div
                        key={value}
                        className={selection.device === value ? styles.overrideActive : ''}
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{label}</span>
                        <small>{t.inherited}</small>
                      </div>
                    ))}
                  </div>
                  <div className={styles.inspectorRule} />
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>{t.visibility}</span>
                    <div className={styles.visibility}>
                      <Check size={14} aria-hidden="true" />
                      {t.visible}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={styles.statusPanel}>
              <p className={styles.groupLabel}>{t.status}</p>
              <nav className={styles.statusChoices} aria-label={t.statusSample}>
                {(
                  [
                    ['saved', t.statusSaved],
                    ['conflict', t.statusConflict],
                    ['undone', t.undo],
                  ] as const
                ).map(([value, label]) => (
                  <a
                    key={value}
                    href={link('status', value)}
                    aria-current={selection.status === value ? 'page' : undefined}
                    className={selection.status === value ? styles.statusChoiceActive : ''}
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div className={selection.status === 'conflict' ? styles.statusError : undefined}>
                {selection.status === 'conflict' ? (
                  <AlertTriangle size={17} aria-hidden="true" />
                ) : (
                  <Save size={17} aria-hidden="true" />
                )}
                <span>
                  <strong>
                    {selection.status === 'conflict'
                      ? t.conflict
                      : selection.status === 'undone'
                        ? t.undone
                        : t.saved}
                  </strong>
                  <small>{selection.status === 'conflict' ? t.conflictHint : t.change}</small>
                </span>
                {selection.status !== 'conflict' && <Check size={15} aria-hidden="true" />}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
