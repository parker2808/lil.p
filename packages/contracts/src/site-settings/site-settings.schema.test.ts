import { describe, expect, it } from 'vitest';

import { heroStatsSchema, siteSettingsUpdateSchema } from './site-settings.schema';

const stat = { value: '5', suffix: '+', labelEn: 'Years shipping', labelVi: 'Năm kinh nghiệm' };

describe('heroStatsSchema', () => {
  it('accepts 0 to 3 valid items', () => {
    for (const count of [0, 1, 2, 3]) {
      expect(heroStatsSchema.safeParse(Array.from({ length: count }, () => stat)).success).toBe(
        true,
      );
    }
  });

  it('accepts an item without a suffix', () => {
    const bare = { value: '12', labelEn: 'Products', labelVi: 'Sản phẩm' };
    expect(heroStatsSchema.safeParse([bare]).success).toBe(true);
  });

  it('rejects 4 items', () => {
    expect(heroStatsSchema.safeParse([stat, stat, stat, stat]).success).toBe(false);
  });

  it('rejects an empty or blank value', () => {
    expect(heroStatsSchema.safeParse([{ ...stat, value: '' }]).success).toBe(false);
    expect(heroStatsSchema.safeParse([{ ...stat, value: '   ' }]).success).toBe(false);
  });

  it('rejects a label over 40 characters and an empty label', () => {
    expect(heroStatsSchema.safeParse([{ ...stat, labelEn: 'x'.repeat(41) }]).success).toBe(false);
    expect(heroStatsSchema.safeParse([{ ...stat, labelVi: '' }]).success).toBe(false);
  });

  it('rejects a value over 12 and a suffix over 4 characters', () => {
    expect(heroStatsSchema.safeParse([{ ...stat, value: '1'.repeat(13) }]).success).toBe(false);
    expect(heroStatsSchema.safeParse([{ ...stat, suffix: 'years' }]).success).toBe(false);
  });
});

describe('siteSettingsUpdateSchema heroStats', () => {
  it('accepts null to clear and leaves the field out when absent', () => {
    expect(siteSettingsUpdateSchema.parse({ heroStats: null }).heroStats).toBeNull();
    expect(siteSettingsUpdateSchema.parse({ siteName: 'x' })).not.toHaveProperty('heroStats');
  });
});
