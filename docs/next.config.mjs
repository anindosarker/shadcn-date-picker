import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX({ agentRules: false });

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Security response headers on every path, the root included (D57). No
  // Content-Security-Policy: it needs nonces for Next's inline scripts
  // and fonts. Vercel sets Strict-Transport-Security itself.
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
  // MRT's docs index is a table of contents page; the sidebar already is one.
  redirects: async () => [
    {
      source: '/docs',
      destination: '/docs/install',
      permanent: true,
    },
  ],
};

export default withMDX(config);
