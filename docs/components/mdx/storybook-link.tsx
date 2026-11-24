'use client';

import type { ReactNode } from 'react';
import { useBase } from '@/components/base-selector';
import type { Base } from '@/lib/install';

/** The Storybook of each base, on this site under /storybook/<base>/. */
export const storybookUrl: Record<Base, string> = {
  radix: '/storybook/radix/',
  base: '/storybook/base/',
  aria: '/storybook/aria/',
};

/**
 * Link to the Storybook of the selected base. The guide and example pages
 * end with "View Extra Storybook <StorybookLink>Examples</StorybookLink>".
 */
export const StorybookLink = ({ children }: { children?: ReactNode }) => {
  const base = useBase();
  return (
    <a
      href={storybookUrl[base]}
      target="_blank"
      rel="noreferrer"
    >
      {children ?? 'Examples'}
    </a>
  );
};
