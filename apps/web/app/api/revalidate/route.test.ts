import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

import { revalidatePath, revalidateTag } from 'next/cache';

import { POST } from './route';

describe('POST /api/revalidate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('returns 401 when the secret is wrong', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'expected-secret-value');
    const response = await POST(
      new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: { 'x-revalidate-secret': 'nope', 'content-type': 'application/json' },
        body: JSON.stringify({ tags: ['posts'] }),
      }),
    );
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('expires each tag immediately when the secret matches', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'expected-secret-value');
    const response = await POST(
      new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: {
          'x-revalidate-secret': 'expected-secret-value',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ tags: ['posts', 'post:a'] }),
      }),
    );
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('posts', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith('post:a', { expire: 0 });
  });

  it('expires the projects tag used by the static projects page', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'expected-secret-value');
    const response = await POST(
      new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: {
          'x-revalidate-secret': 'expected-secret-value',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ tags: ['projects'] }),
      }),
    );
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('projects', { expire: 0 });
  });

  it('revalidates paths when they are provided', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'expected-secret-value');
    const response = await POST(
      new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: {
          'x-revalidate-secret': 'expected-secret-value',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ paths: ['/en/projects/particula'] }),
      }),
    );
    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/en/projects/particula');
  });
});
