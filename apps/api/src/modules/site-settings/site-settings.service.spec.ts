import { BadRequestException } from '@nestjs/common';
import { siteSettingsUpdateSchema } from '@portfolio/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Prisma } from '../../generated/prisma/client';
import { SiteSettingsService } from './site-settings.service';

const stats = [
  { value: '5', suffix: '+', labelEn: 'Years shipping', labelVi: 'Năm kinh nghiệm' },
  { value: '12', labelEn: 'Products', labelVi: 'Sản phẩm' },
];

function row(over: Record<string, unknown> = {}) {
  return {
    id: 1,
    siteName: 'parker.dev',
    domain: 'parker.dev',
    defaultLocale: 'en',
    seoTitleEn: 'Title',
    seoTitleVi: 'Tiêu đề',
    seoDescriptionEn: '',
    seoDescriptionVi: '',
    footerNoteEn: '',
    footerNoteVi: '',
    contactIntroEn: '',
    contactIntroVi: '',
    replyTimeNoteEn: '',
    replyTimeNoteVi: '',
    contactEmail: '<email>',
    availability: 'OPEN',
    availabilityNoteEn: '',
    availabilityNoteVi: '',
    analyticsEnabled: false,
    ambientEffects: true,
    marqueeEnabled: true,
    ogImageId: null,
    ogImage: null,
    heroStats: null,
    updatedAt: new Date('2026-11-01'),
    ...over,
  };
}

function serviceWith(current: Record<string, unknown>) {
  const update = vi.fn(({ data }: { data: Record<string, unknown> }) =>
    Promise.resolve({ ...current, ...data }),
  );
  const prisma = {
    siteSettings: { findUnique: vi.fn().mockResolvedValue(current), update },
  };
  return { service: new SiteSettingsService(prisma as never), update };
}

describe('SiteSettingsService hero stats', () => {
  it('loads an existing row without heroStats as null', async () => {
    const legacy: Record<string, unknown> = row();
    delete legacy.heroStats;
    const { service } = serviceWith(legacy);

    expect((await service.getPublic('en')).heroStats).toBeNull();
    expect((await service.getAdmin()).heroStats).toBeNull();
  });

  it('localizes stored stats for each locale', async () => {
    const { service } = serviceWith(row({ heroStats: stats }));

    expect((await service.getPublic('en')).heroStats).toEqual([
      { value: '5', suffix: '+', label: 'Years shipping' },
      { value: '12', suffix: null, label: 'Products' },
    ]);
    expect((await service.getPublic('vi')).heroStats?.map((stat) => stat.label)).toEqual([
      'Năm kinh nghiệm',
      'Sản phẩm',
    ]);
    expect((await service.getAdmin()).heroStats).toEqual(stats);
  });

  it('reads invalid or empty stored JSON as null', async () => {
    for (const heroStats of [[], [{ value: '' }], 'nope', [...stats, ...stats]]) {
      const { service } = serviceWith(row({ heroStats }));
      expect((await service.getPublic('en')).heroStats).toBeNull();
      expect((await service.getAdmin()).heroStats).toBeNull();
    }
  });

  it('writes stats and stores an empty list or null as database NULL', async () => {
    const { service, update } = serviceWith(row());

    await service.update({ heroStats: stats });
    expect(update.mock.calls[0]?.[0].data.heroStats).toEqual(stats);

    await service.update({ heroStats: [] });
    expect(update.mock.calls[1]?.[0].data.heroStats).toBe(Prisma.DbNull);

    await service.update({ heroStats: null });
    expect(update.mock.calls[2]?.[0].data.heroStats).toBe(Prisma.DbNull);

    await service.update({ siteName: 'x' });
    expect(update.mock.calls[3]?.[0].data).not.toHaveProperty('heroStats');
  });
});

describe('admin site PATCH validation', () => {
  const pipe = new ZodValidationPipe(siteSettingsUpdateSchema);

  it.each([
    ['more than 3 items', [...stats, ...stats]],
    ['an empty value', [{ ...stats[0], value: '' }]],
    ['an empty label', [{ ...stats[0], labelEn: '' }]],
  ])('rejects %s with a 400', (_name, heroStats) => {
    let error: unknown;
    try {
      pipe.transform({ heroStats });
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getStatus()).toBe(400);
  });
});
