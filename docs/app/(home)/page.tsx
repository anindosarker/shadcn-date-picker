import type { Metadata } from 'next';
import { HomePage } from '@/components/dev-home/v12/home-page';
import { siteDescription } from '@/lib/shared';

export const metadata: Metadata = {
  description: siteDescription,
};

export default function Page() {
  return (
    <>
      <HomePage />
    </>
  );
}
