import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '@/components/logo';
import { ThemeControls } from '@/components/theme-controls';
import pkg from '../../package.json';
import { gitConfig } from './shared';

/** Section links, rendered by the sidebar section tabs (components/section-tabs.tsx). */
export const NAV_LINKS = [
  { text: 'Get Started', url: '/docs/install', pages: ['/docs/install'] },
  {
    text: 'Pickers',
    url: '/docs/date',
    pages: [
      '/docs/date',
      '/docs/date-time',
      '/docs/time',
      '/docs/week',
      '/docs/month',
      '/docs/year',
      '/docs/ranges',
    ],
  },
  { text: 'Props', url: '/docs/props', pages: ['/docs/props'] },
] as const;

export const GITHUB_URL = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
/** The library version this build was made from, shown in the header (D147). */
export const LIBRARY_VERSION = pkg.version;

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
    },
    // No text links: fumadocs renders them as sidebar rows below lg (and in
    // the mobile drawer), duplicating the section tabs (L7) shown there too;
    // the header (components/site-nav.tsx) does not read `links`.
    githubUrl: GITHUB_URL,
    slots: { themeSwitch: ThemeControls },
  };
}
