import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const apiUrl = process.env.API_URL ?? 'http://127.0.0.1:4000';

const nextConfig: NextConfig = {
  transpilePackages: ['@portfolio/ui', '@portfolio/contracts'],
  serverExternalPackages: ['shiki'],
  agentRules: false,
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
