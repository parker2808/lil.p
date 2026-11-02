import type { Locale, PublicProjectListItem } from '@portfolio/contracts';

type DemoCopy = {
  nav: [string, string, string];
  home: {
    eyebrow: string;
    title: string;
    intro: string;
    work: string;
    craft: string;
    selected: string;
    selectedIntro: string;
    approach: string;
    approachIntro: string;
  };
  projects: { eyebrow: string; title: string; intro: string; all: string; featured: string };
  detail: {
    back: string;
    toc: string;
    summary: string;
    context: string;
    approach: string;
    outcome: string;
    next: string;
    role: string;
    timeline: string;
    stack: string;
  };
  craft: {
    eyebrow: string;
    title: string;
    intro: string;
    one: string;
    oneText: string;
    two: string;
    twoText: string;
    three: string;
    threeText: string;
    four: string;
    fourText: string;
  };
  footer: string;
};

export const demoCopy: Record<Locale, DemoCopy> = {
  en: {
    nav: ['Home', 'Projects', 'Craft'],
    home: {
      eyebrow: 'DESIGNING IN THE DETAILS',
      title: 'Interfaces with a point of view.',
      intro:
        'I shape digital products where clear thinking meets a little wonder. Browse selected work and the small interactions behind it.',
      work: 'Explore projects',
      craft: 'See the craft',
      selected: 'Selected work',
      selectedIntro: 'A few ways thoughtful systems can become useful experiences.',
      approach: 'Built to feel considered.',
      approachIntro:
        'A quiet visual language: crisp typography, precise spacing, and motion that helps people find their way.',
    },
    projects: {
      eyebrow: 'SELECTED PROJECTS / 2022—2026',
      title: 'Work that makes complexity feel simple.',
      intro:
        'Product interfaces, systems, and experiences. Each study shows the decisions behind the surface.',
      all: 'All work',
      featured: 'FEATURED CASE STUDY',
    },
    detail: {
      back: 'All projects',
      toc: 'On this page',
      summary: 'TL;DR',
      context: 'The context',
      approach: 'The approach',
      outcome: 'The result',
      next: 'Next project',
      role: 'Role',
      timeline: 'Timeline',
      stack: 'Stack',
    },
    craft: {
      eyebrow: 'THE PLAYGROUND',
      title: 'Small things, carefully made.',
      intro:
        'A gallery of interaction experiments. Move, hover, and explore; each study keeps the same care on touch and reduced motion.',
      one: 'Magnetic orbit',
      oneText: 'A point of focus and two paths in motion.',
      two: 'Signal field',
      twoText: 'Depth from gradients, without a heavy renderer.',
      three: 'Type rhythm',
      threeText: 'Words arranged with deliberate pace.',
      four: 'Material response',
      fourText: 'A surface that follows your attention.',
    },
    footer: 'A design demo, built for exploration.',
  },
  vi: {
    nav: ['Trang chủ', 'Dự án', 'Thử nghiệm'],
    home: {
      eyebrow: 'CHÚ TÂM ĐẾN TỪNG CHI TIẾT',
      title: 'Giao diện có góc nhìn riêng.',
      intro:
        'Tôi tạo sản phẩm số nơi tư duy rõ ràng gặp một chút bất ngờ. Khám phá dự án và những tương tác nhỏ đằng sau.',
      work: 'Xem dự án',
      craft: 'Xem thử nghiệm',
      selected: 'Dự án nổi bật',
      selectedIntro: 'Những cách biến hệ thống phức tạp thành trải nghiệm hữu ích.',
      approach: 'Chỉn chu trong từng cảm nhận.',
      approachIntro:
        'Ngôn ngữ thị giác tinh gọn: chữ rõ, khoảng cách chuẩn và chuyển động giúp người dùng định hướng.',
    },
    projects: {
      eyebrow: 'DỰ ÁN CHỌN LỌC / 2022—2026',
      title: 'Biến điều phức tạp thành đơn giản.',
      intro:
        'Giao diện sản phẩm, hệ thống và trải nghiệm. Mỗi câu chuyện cho thấy các quyết định đằng sau bề mặt.',
      all: 'Tất cả',
      featured: 'DỰ ÁN NỔI BẬT',
    },
    detail: {
      back: 'Tất cả dự án',
      toc: 'Trong trang này',
      summary: 'Tóm tắt',
      context: 'Bối cảnh',
      approach: 'Cách tiếp cận',
      outcome: 'Kết quả',
      next: 'Dự án tiếp theo',
      role: 'Vai trò',
      timeline: 'Thời gian',
      stack: 'Công nghệ',
    },
    craft: {
      eyebrow: 'KHÔNG GIAN THỬ NGHIỆM',
      title: 'Điều nhỏ, làm thật kỹ.',
      intro:
        'Bộ sưu tập thử nghiệm tương tác. Di chuyển, chạm và khám phá; mỗi mẫu đều hỗ trợ cảm ứng và giảm chuyển động.',
      one: 'Quỹ đạo hút',
      oneText: 'Một tâm điểm và hai đường chuyển động.',
      two: 'Trường tín hiệu',
      twoText: 'Chiều sâu bằng gradient, không cần bộ dựng nặng.',
      three: 'Nhịp điệu chữ',
      threeText: 'Con chữ được sắp xếp có chủ đích.',
      four: 'Bề mặt phản hồi',
      fourText: 'Một bề mặt đi theo sự chú ý.',
    },
    footer: 'Bản thử nghiệm thiết kế để khám phá.',
  },
};

const cases = [
  {
    slug: 'particula',
    title: ['Particula', 'Particula'],
    tagline: ['A clearer way through complex work.', 'Lối đi rõ ràng hơn cho công việc phức tạp.'],
    role: ['Frontend engineering', 'Phát triển giao diện'],
    result: ['A focused product experience.', 'Trải nghiệm sản phẩm tập trung.'],
    domain: ['Product platform', 'Nền tảng sản phẩm'],
    hue: 'AMBER',
    year: '2026',
    skills: ['React', 'TypeScript', 'Design systems'],
  },
  {
    slug: 'cfw-back-office-field-config',
    title: ['Field Configuration', 'Cấu hình hiện trường'],
    tagline: [
      'Tools that make operational detail approachable.',
      'Công cụ giúp công việc vận hành dễ tiếp cận.',
    ],
    role: ['Product engineering', 'Phát triển sản phẩm'],
    result: ['A calmer path through dense information.', 'Lối đi gọn hơn qua thông tin dày đặc.'],
    domain: ['Operations', 'Vận hành'],
    hue: 'BLUE',
    year: '2025',
    skills: ['Vue', 'TypeScript', 'UX'],
  },
  {
    slug: 'msp-advanced',
    title: ['Asset Rating Platform', 'Nền tảng đánh giá tài sản'],
    tagline: [
      'From complicated inputs to readable decisions.',
      'Từ dữ liệu phức tạp đến quyết định dễ hiểu.',
    ],
    role: ['Frontend engineering', 'Phát triển giao diện'],
    result: ['A more legible decision flow.', 'Luồng quyết định dễ đọc hơn.'],
    domain: ['Enterprise', 'Doanh nghiệp'],
    hue: 'JADE',
    year: '2024',
    skills: ['React', 'Data', 'Systems'],
  },
  {
    slug: 'migration-data-tool',
    title: ['Store Migrator', 'Công cụ chuyển đổi cửa hàng'],
    tagline: [
      'A guided path for a demanding migration.',
      'Lộ trình rõ ràng cho một lần chuyển đổi phức tạp.',
    ],
    role: ['Frontend engineering', 'Phát triển giao diện'],
    result: ['Complex steps made easier to follow.', 'Các bước phức tạp dễ theo dõi hơn.'],
    domain: ['Commerce', 'Thương mại'],
    hue: 'VIOLET',
    year: '2023',
    skills: ['Nuxt', 'Vue', 'Workflow'],
  },
  {
    slug: 'cfw-sales-crm',
    title: ['Field Sales CRM', 'CRM bán hàng hiện trường'],
    tagline: [
      'A practical rhythm for teams on the move.',
      'Nhịp làm việc rõ ràng cho đội ngũ di chuyển.',
    ],
    role: ['Product engineering', 'Phát triển sản phẩm'],
    result: ['Everyday tasks in a clearer flow.', 'Công việc hằng ngày trong luồng rõ ràng hơn.'],
    domain: ['Field tools', 'Công cụ hiện trường'],
    hue: 'ROSE',
    year: '2022',
    skills: ['Vue', 'Mobile', 'Systems'],
  },
] as const;

export function demoProjects(locale: Locale): PublicProjectListItem[] {
  const index = locale === 'en' ? 0 : 1;
  return cases.map((item, number) => ({
    id: number + 1,
    slug: item.slug,
    title: item.title[index],
    tagline: item.tagline[index],
    role: item.role[index],
    result: item.result[index],
    client: '',
    isFeatured: number === 0,
    isConfidential: false,
    startDate: `${item.year}-01-01`,
    endDate: null,
    versionFrom: null,
    versionTo: null,
    domain: {
      slug: item.slug,
      name: item.domain[index],
      hue: item.hue,
      iconKey: 'layers',
      lang: locale,
    },
    topMetric: null,
    factChips: [],
    skills: item.skills.map((name) => ({ name, slug: name.toLowerCase().replaceAll(' ', '-') })),
    cover: null,
    lang: locale,
  }));
}
