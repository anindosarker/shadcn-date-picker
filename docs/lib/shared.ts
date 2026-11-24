export const appName = 'Shadcn Date Picker';
/** Lowercase name used in page titles and OG/Twitter metadata. */
export const siteName = 'shadcn-date-picker';
/**
 * The site description (D73, D76): read by the root layout metadata and the
 * home page metadata.
 */
export const siteDescription =
  'A date picker for shadcn/ui: one DatePicker component for dates, times, weeks, months and years, with ranges, on Base UI, Radix UI and React Aria. Installs as source via shadcn CLI.';
export const docsRoute = '/docs';

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: 'anindosarker',
  repo: 'shadcn-date-picker',
  branch: 'main',
};

/**
 * Origin of the canonical links: `NEXT_PUBLIC_SITE_URL` where it is set, the
 * public address otherwise.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://date-picker.shadcn-table.com'
).replace(/\/$/, '');
