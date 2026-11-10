import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateMetadata } from './page';

describe('CMS U3 study metadata', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([
    ['en', 'CMS U3 · Builder design study'],
    ['vi', 'CMS U3 · Mẫu thiết kế trình dựng trang'],
  ])('localizes the %s title and keeps crawlers out', async (locale, title) => {
    vi.stubEnv('R3_E2E_STATES', '1');
    await expect(generateMetadata({ params: Promise.resolve({ locale }) })).resolves.toEqual({
      title,
      robots: { index: false, follow: false },
    });
  });

  it('does not expose study metadata when the flag is off', async () => {
    vi.stubEnv('R3_E2E_STATES', '0');
    await expect(
      generateMetadata({ params: Promise.resolve({ locale: 'vi' }) }),
    ).rejects.toMatchObject({ digest: 'NEXT_HTTP_ERROR_FALLBACK;404' });
  });
});
