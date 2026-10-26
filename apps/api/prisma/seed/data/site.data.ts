import type { PrismaClient } from '../../../src/generated/prisma/client';

/**
 * Placeholder site + profile rows from the spec and mockups.
 * Contact values are always `<email>` / `<phone>` — never a real address.
 */

export const siteSettingsData = {
  siteName: 'parker.dev',
  domain: 'parker.dev',
  defaultLocale: 'en',
  seoTitleEn: 'Parker Vu · Senior Frontend Engineer',
  seoTitleVi: 'Parker Vu · Senior Frontend Engineer',
  seoDescriptionEn:
    'Senior frontend engineer. 5 years shipping data-dense product UIs in Vue, Nuxt and TypeScript, now building with Next.js.',
  seoDescriptionVi:
    'Senior frontend engineer. 5 năm xây dựng giao diện sản phẩm nhiều dữ liệu với Vue, Nuxt và TypeScript, hiện phát triển với Next.js.',
  ogImageId: null,
  footerNoteEn: '© 2026 Parker Vu · Hung Vu Van — Senior Frontend',
  footerNoteVi: '© 2026 Parker Vu · Hung Vu Van — Senior Frontend',
  contactIntroEn: 'Senior frontend roles or a migration done right.',
  contactIntroVi: 'Vai trò senior frontend hoặc một cuộc migration làm đúng cách.',
  replyTimeNoteEn: 'Replies in 2 days',
  replyTimeNoteVi: 'Phản hồi trong 2 ngày',
  contactEmail: '<email>',
  availability: 'OPEN' as const,
  availabilityNoteEn: 'Open to senior roles · Hanoi, GMT+7',
  availabilityNoteVi: 'Sẵn sàng cho vai trò senior · Hà Nội, GMT+7',
  analyticsEnabled: false,
  ambientEffects: true,
  marqueeEnabled: true,
};

export const profileData = {
  displayName: 'Parker Vu',
  legalName: 'Vu Van Hung',
  city: 'Hanoi',
  country: 'Vietnam',
  timezone: 'Asia/Ho_Chi_Minh',
  careerStartDate: new Date('2021-01-01'),
  headlineEn: 'I move products forward without breaking them.',
  headlineVi: 'Tôi đưa sản phẩm tiến lên mà không làm chúng gãy.',
  subheadlineEn:
    'Parker Vu · Senior Frontend Engineer. 5 years shipping data-dense product UIs in Vue, Nuxt and TypeScript, now building with Next.js.',
  subheadlineVi:
    'Parker Vu · Senior Frontend Engineer. 5 năm xây dựng giao diện sản phẩm nhiều dữ liệu với Vue, Nuxt và TypeScript, hiện phát triển với Next.js.',
  bioEn: `Senior frontend engineer. I spend most of my time moving existing products forward: Vue 2 to Vue 3, Vue to Nuxt, Axios to TanStack Query. The job is to keep weekly delivery while the stack changes under the users.

I've shipped ratings dashboards for a ReFi platform, ops tools with a Korean enterprise team, and a cart-migration product that talked to four store platforms. I'm now learning Next.js and NestJS by building this site as a CMS, not a brochure.`,
  bioVi: `Kỹ sư frontend. Phần lớn thời gian tôi đưa sản phẩm hiện có tiến lên: Vue 2 sang Vue 3, Vue sang Nuxt, Axios sang TanStack Query. Việc cần làm là giữ nhịp giao hàng hàng tuần trong khi stack thay đổi dưới chân người dùng.

Tôi đã ship dashboard xếp hạng cho một nền tảng ReFi, công cụ vận hành với team Hàn Quốc, và sản phẩm chuyển giỏ hàng nói chuyện với bốn nền tảng cửa hàng. Hiện tôi học Next.js và NestJS bằng cách xây site này như một CMS, không phải brochure.`,
  languagesEn: 'Vietnamese, English. Works with KR · US · UK teams.',
  languagesVi: 'Tiếng Việt, tiếng Anh. Làm việc với team KR · US · UK.',
  heroKickerEn: 'Senior Frontend · 5 yrs · Vue/Nuxt/TS',
  heroKickerVi: 'Senior Frontend · 5 năm · Vue/Nuxt/TS',
  headlineAccentEn: 'without breaking them.',
  headlineAccentVi: 'mà không làm chúng gãy.',
  avatarId: null,
  resumeEnId: null,
  resumeViId: null,
  phone: '<phone>',
};

export const navItemsData = [
  {
    location: 'HEADER' as const,
    labelEn: 'Work',
    labelVi: 'Việc đã làm',
    href: '/projects',
    sortOrder: 0,
  },
  {
    location: 'HEADER' as const,
    labelEn: 'About',
    labelVi: 'Giới thiệu',
    href: '/about',
    sortOrder: 1,
  },
  {
    location: 'HEADER' as const,
    labelEn: 'Notes',
    labelVi: 'Ghi chú',
    href: '/notes',
    sortOrder: 2,
  },
  {
    location: 'HEADER' as const,
    labelEn: 'Contact',
    labelVi: 'Liên hệ',
    href: '/contact',
    sortOrder: 3,
  },
  {
    location: 'FOOTER' as const,
    labelEn: 'Work',
    labelVi: 'Việc đã làm',
    href: '/projects',
    sortOrder: 0,
  },
  {
    location: 'FOOTER' as const,
    labelEn: 'Notes',
    labelVi: 'Ghi chú',
    href: '/notes',
    sortOrder: 1,
  },
];

export const socialLinksData = [
  {
    kind: 'GITHUB' as const,
    labelEn: 'GitHub',
    labelVi: 'GitHub',
    url: 'https://github.com/parker2808',
    showInHeader: true,
    showInCta: true,
    sortOrder: 0,
  },
  {
    kind: 'LINKEDIN' as const,
    labelEn: 'LinkedIn',
    labelVi: 'LinkedIn',
    url: 'https://www.linkedin.com/in/parker2808',
    showInHeader: false,
    showInCta: true,
    sortOrder: 1,
  },
  {
    kind: 'EMAIL' as const,
    labelEn: 'Email',
    labelVi: 'Email',
    url: 'mailto:<email>',
    showInHeader: false,
    showInCta: false,
    sortOrder: 2,
  },
];

export async function seedSite(prisma: PrismaClient): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...siteSettingsData },
    update: siteSettingsData,
  });

  await prisma.profile.upsert({
    where: { id: 1 },
    create: { id: 1, ...profileData },
    update: profileData,
  });

  for (const item of navItemsData) {
    const existing = await prisma.navItem.findFirst({
      where: { location: item.location, href: item.href },
    });
    if (existing) {
      await prisma.navItem.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.navItem.create({ data: item });
    }
  }

  for (const link of socialLinksData) {
    const existing = await prisma.socialLink.findFirst({
      where: { kind: link.kind },
    });
    if (existing) {
      await prisma.socialLink.update({
        where: { id: existing.id },
        data: link,
      });
    } else {
      await prisma.socialLink.create({ data: link });
    }
  }
}
