import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@portfolio/ui', '@portfolio/contracts'],
  agentRules: false,
};

export default nextConfig;
