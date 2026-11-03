import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:4000';
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
  env: {
    API_URL: apiUrl,
  },
  transpilePackages: ['@portfolio/ui', '@portfolio/contracts'],
  serverExternalPackages: ['shiki'],
  agentRules: false,
  images: {
    loader: 'custom',
    loaderFile: './src/modules/core/utils/image-loader.util.ts',
  },
  // afterFiles proxies /api/* to Nest, including GET /admin/events (SSE).
  // Nest sets X-Accel-Buffering: no; Next streams the rewrite instead of buffering heartbeats.
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
