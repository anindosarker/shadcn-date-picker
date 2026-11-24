import { ArrowRightIcon } from 'lucide-react';
import { IntentLink } from '@/components/dev-home/shared/intent-link';
import { InstallCommand } from '@/components/dev-home/shared/install-command';
import { archivo } from '@/components/dev-home/v4/font';
import { ExampleVariant } from '@/components/example-variant';
import { Footer } from './footer';
import { Nav } from './nav';
import '@/components/dev-home/v4/v4.css';
import '@/components/dev-home/v5/v5.css';
import '@/components/dev-home/v7/v7.css';
import './v12.css';

/**
 * The homepage: the hero, the install command and two live pickers. Rendered
 * at "/".
 */
export function HomePage() {
  return (
    <div data-variant="12" className={`v4-root v12 ${archivo.variable}`}>
      <Nav baseSwitch />

      <main className="flex flex-1 flex-col">
        <section className="v12-hero" aria-labelledby="v12-title">
          <div className="v4-shell v12-hero-copy">
            <p className="v7-eyebrow v12-eyebrow">
              <span>{'//'}</span> A date picker for shadcn/ui
            </p>
            <h1 id="v12-title" className="v4-display v12-h1">
              shadcn<span className="v7-wordmark-dash">-</span>date
              <span className="v7-wordmark-dash">-</span>picker
            </h1>
            <p className="v12-pitch">
              One component, <span className="v12-accent">DatePicker</span>,
              for dates, times, weeks, months and years, with ranges, on Base UI,
              Radix UI and React Aria. It uses the browser&apos;s own inputs. You
              install it with the shadcn CLI and own the code, like any shadcn
              component.
            </p>
            <InstallCommand className="v12-install" />
            <div className="v12-hero-row">
              <ExampleVariant name="date" />
              <ExampleVariant name="date-range" />
            </div>
            <div className="v12-cta">
              <IntentLink
                href="/docs/install"
                className="v4-btn v4-btn-solid v4-btn-lg"
              >
                Get started
                <ArrowRightIcon aria-hidden="true" className="size-4" />
              </IntentLink>
              <a href="/storybook/" className="v4-link">
                Storybook
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
