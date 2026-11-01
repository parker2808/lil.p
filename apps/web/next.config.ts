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
  async redirects() {
    return [
      { source: '/admin/pages', destination: '/admin/pages/home', permanent: false },
      {
        source: '/admin/experience/new',
        destination: '/admin/pages/about/experience/new',
        permanent: false,
      },
      {
        source: '/admin/experience/:id',
        destination: '/admin/pages/about/experience/:id',
        permanent: false,
      },
      ...['experience', 'education', 'skills', 'principles', 'process', 'stats', 'domains'].map(
        (tab) => ({
          source: `/admin/${tab}`,
          destination: `/admin/pages/about?tab=${tab}`,
          permanent: false,
        }),
      ),
      { source: '/admin/tags', destination: '/admin/posts?tab=tags', permanent: false },
    ];
  },
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
