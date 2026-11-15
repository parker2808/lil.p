import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock('@nestjs/core', () => ({ NestFactory: { create: mocks.create } }));
vi.mock('./app.module', () => ({ AppModule: class {} }));
vi.mock('./config/app-config.service', () => ({ AppConfigService: class {} }));
vi.mock('./prisma/prisma.service', () => ({ PrismaService: class {} }));
vi.mock('./modules/health/deployment-state.controller', () => ({
  deploymentState: () => ({}),
}));

describe('API bootstrap migration gate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    mocks.create.mockReset();
  });

  it('initializes before checking migration and listens only after a failed check leaves writes frozen', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CMS_PAGE_WRITE_FREEZE', undefined);

    const events: string[] = [];
    let finishInit!: () => void;
    let failCheck!: (reason: Error) => void;
    const initPending = new Promise<void>((resolve) => {
      finishInit = resolve;
    });
    const checkPending = new Promise<never>((_resolve, reject) => {
      failCheck = reject;
    });
    const database = {
      $queryRaw: vi.fn(() => {
        events.push('migration check');
        return checkPending;
      }),
    };
    const config = { isProduction: true, corsOrigins: [], port: 4001, host: '127.0.0.1' };
    const app = {
      use: vi.fn(),
      getHttpAdapter: () => ({ getInstance: () => ({ set: vi.fn() }) }),
      get: vi.fn((token: { name: string }) => (token.name === 'PrismaService' ? database : config)),
      setGlobalPrefix: vi.fn(),
      enableShutdownHooks: vi.fn(),
      init: vi.fn(() => {
        events.push('init');
        return initPending;
      }),
      listen: vi.fn(() => {
        events.push('listen');
        return Promise.resolve();
      }),
    };
    mocks.create.mockResolvedValue(app);

    await import('./main');
    await vi.waitFor(() => expect(app.init).toHaveBeenCalledOnce());
    expect(events).toEqual(['init']);

    finishInit();
    await vi.waitFor(() => expect(database.$queryRaw).toHaveBeenCalledOnce());
    expect(events).toEqual(['init', 'migration check']);
    expect(app.listen).not.toHaveBeenCalled();

    failCheck(new Error('migration unavailable'));
    await vi.waitFor(() => expect(app.listen).toHaveBeenCalledOnce());
    const { pageWritesFrozen } = await import('./common/middleware/page-write-freeze.middleware');
    expect(events).toEqual(['init', 'migration check', 'listen']);
    expect(pageWritesFrozen()).toBe(true);
    expect(app.listen).toHaveBeenCalledWith(config.port, config.host);
  });
});
