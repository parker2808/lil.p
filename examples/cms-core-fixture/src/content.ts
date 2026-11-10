import {
  createRegistry,
  defineBlock,
  type Locale,
  type PublicBlock,
} from '@parker2808/cms-core/contracts';
import { z } from 'zod';

const localized = z.object({ en: z.string().min(1), vi: z.string().min(1) });

export const definitions = [
  defineBlock({
    type: 'heading',
    version: 1,
    props: z.object({ title: localized }),
    defaults: { title: { en: 'A quieter way to build', vi: 'Một cách tạo trang tinh gọn hơn' } },
    pages: ['sample'],
    layouts: ['ONE'],
    role: 'h1',
    maxPerPage: 1,
  }),
  defineBlock({
    type: 'paragraph',
    version: 1,
    props: z.object({ body: localized.meta({ widget: 'longtext' }) }),
    defaults: {
      body: {
        en: 'A small independent page, assembled from a portable registry and rendered without a host framework.',
        vi: 'Một trang độc lập gọn nhẹ, ghép từ registry có thể tái sử dụng và hiển thị không cần framework của host.',
      },
    },
    pages: ['sample'],
    layouts: ['ONE'],
    role: 'optional',
    customPage: true,
  }),
  defineBlock({
    type: 'action',
    version: 1,
    props: z.object({ label: localized, href: z.string().startsWith('/') }),
    defaults: {
      label: { en: 'Explore components', vi: 'Khám phá thành phần' },
      href: '/components',
    },
    pages: ['sample'],
    layouts: ['ONE'],
    role: 'optional',
    customPage: true,
  }),
  defineBlock({
    type: 'image',
    version: 1,
    props: z.object({ alt: localized, src: z.string().startsWith('/') }),
    defaults: {
      alt: { en: 'Abstract mountain landscape', vi: 'Phong cảnh núi trừu tượng' },
      src: '/illustration.svg',
    },
    pages: ['sample'],
    layouts: ['ONE'],
    role: 'optional',
    customPage: true,
  }),
] as const;

export const registry = createRegistry(definitions);
export type BlockType = keyof typeof registry;
export const blockTypes = Object.keys(registry) as BlockType[];

export const copy = {
  en: {
    name: 'Common ground',
    eyebrow: 'Independent core · Phase B',
    home: 'Page',
    components: 'Components',
    editor: 'Editor',
    unknown: 'Unknown',
    heading: 'Heading',
    paragraph: 'Paragraph',
    action: 'Action',
    image: 'Image',
    headingDescription: 'The page’s opening statement',
    paragraphDescription: 'Bilingual body copy',
    actionDescription: 'An internal navigation link',
    imageDescription: 'Resolved local media',
    galleryTitle: 'Pieces of a page',
    galleryBody: 'The same four host renderers, shown in their resting and edge states.',
    editorTitle: 'Shape a page',
    editorBody: 'An in-memory block list. Your changes stay in this browser session only.',
    unknownTitle: 'Nothing disappears silently',
    unknownBody: 'Unsupported data stays in the source. Public output stays safe.',
    longText:
      'Long content · a field should expand rather than clip the meaning of a sentence, even when the line wraps across a narrow viewport.',
    add: 'Add block',
    moveUp: 'Move up',
    moveDown: 'Move down',
    remove: 'Remove',
    fields: 'Properties',
    preview: 'Live preview',
    reorderHelp: 'Focus a block, then use Alt+Up or Alt+Down to reorder.',
    noSave: 'Local only · no save or publish',
    missing: 'Missing renderer',
    error: 'Could not render',
    retry: 'Retry',
    empty: 'No blocks yet',
    unknownBlock: 'Unrecognized block',
    unsupported: 'Unsupported content is preserved in the source, but not rendered publicly.',
    disabled: 'Unavailable in this sample',
    required: 'A heading is required',
    validation: 'Enter a value to continue',
    reset: 'Reset sample',
    theme: 'Appearance',
    brand: 'Token override',
    neutral: 'Neutral',
    light: 'Light',
    dark: 'Dark',
    locale: 'Language',
    notFound: 'This route is not part of the sample.',
    back: 'Go to page',
    focused: 'Keyboard focus',
    invalid: 'Invalid field',
    source: 'Source preserved',
  },
  vi: {
    name: 'Điểm chung',
    eyebrow: 'Lõi độc lập · Giai đoạn B',
    home: 'Trang',
    components: 'Thành phần',
    editor: 'Trình biên tập',
    unknown: 'Không xác định',
    heading: 'Tiêu đề',
    paragraph: 'Đoạn văn',
    action: 'Hành động',
    image: 'Hình ảnh',
    headingDescription: 'Lời mở đầu của trang',
    paragraphDescription: 'Nội dung song ngữ',
    actionDescription: 'Liên kết nội bộ',
    imageDescription: 'Ảnh cục bộ đã phân giải',
    galleryTitle: 'Những mảnh ghép của trang',
    galleryBody: 'Bốn thành phần do host cung cấp, ở trạng thái thường và đặc biệt.',
    editorTitle: 'Tạo hình cho trang',
    editorBody: 'Danh sách khối trong bộ nhớ. Thay đổi chỉ ở lại trong phiên này.',
    unknownTitle: 'Không tự ý bỏ dữ liệu',
    unknownBody: 'Dữ liệu chưa hỗ trợ vẫn ở nguồn. Trang công khai luôn an toàn.',
    longText:
      'Nội dung dài · trường nhập cần mở rộng thay vì cắt mất ý nghĩa của câu, kể cả khi văn bản xuống dòng trên màn hình hẹp.',
    add: 'Thêm khối',
    moveUp: 'Chuyển lên',
    moveDown: 'Chuyển xuống',
    remove: 'Xóa',
    fields: 'Thuộc tính',
    preview: 'Xem trước trực tiếp',
    reorderHelp: 'Chọn một khối rồi nhấn Alt+Mũi tên lên hoặc xuống để sắp xếp.',
    noSave: 'Chỉ trên máy · không lưu hay xuất bản',
    missing: 'Thiếu thành phần hiển thị',
    error: 'Không thể hiển thị',
    retry: 'Thử lại',
    empty: 'Chưa có khối',
    unknownBlock: 'Khối không nhận diện',
    unsupported: 'Nội dung chưa hỗ trợ được giữ trong nguồn, nhưng không hiển thị công khai.',
    disabled: 'Không dùng được trong bản mẫu',
    required: 'Cần một tiêu đề',
    validation: 'Nhập giá trị để tiếp tục',
    reset: 'Đặt lại bản mẫu',
    theme: 'Giao diện',
    brand: 'Ghi đè bằng token',
    neutral: 'Trung tính',
    light: 'Sáng',
    dark: 'Tối',
    locale: 'Ngôn ngữ',
    notFound: 'Đường dẫn này không thuộc bản mẫu.',
    back: 'Về trang',
    focused: 'Tiêu điểm bàn phím',
    invalid: 'Trường chưa hợp lệ',
    source: 'Đã giữ dữ liệu nguồn',
  },
} as const;

export function block(type: BlockType, id: number, sortOrder: number, locale: Locale): PublicBlock {
  const definition = registry[type];
  const defaults = structuredClone(definition.defaults);
  if (type === 'action')
    (defaults as typeof registry.action.defaults).href = `/${locale}/components`;
  return {
    id,
    type,
    key: `${type}-${id}`,
    layout: 'ONE',
    surface: 'PLAIN',
    props: defaults,
    lang: locale,
    sortOrder,
  } as PublicBlock;
}

export function sampleBlocks(locale: Locale): PublicBlock[] {
  return blockTypes.map((type, index) => block(type, index + 1, index, locale));
}
