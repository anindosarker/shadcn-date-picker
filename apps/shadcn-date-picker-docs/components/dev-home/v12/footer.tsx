import { IntentLink } from '@/components/dev-home/shared/intent-link';
import { GITHUB_URL } from '@/components/dev-home/v4/nav';
import { Dune } from './dune';

const LINKS = [
  { label: 'GitHub', href: GITHUB_URL },
  { label: 'Storybook', href: '/storybook/' },
] as const;

/**
 * The table's footer trimmed to the wordmark, the licence line, GitHub and
 * Storybook (D181). Both links are plain anchors: the docs app does not own
 * /storybook/.
 */
export function Footer() {
  return (
    <footer className="v4-footer">
      <Dune fps={6} className="v4-footer-dune" />
      <div className="v4-shell v4-footer-grid">
        <div className="v4-footer-brand">
          <IntentLink href="/" className="v4-wordmark">
            <span aria-hidden="true" className="v4-wordmark-slash">
              {'//'}
            </span>
            <span>shadcn-date-picker</span>
          </IntentLink>
          <p>MIT licensed. Built on shadcn/ui.</p>
        </div>
        <nav aria-label="Links" className="v4-footer-col">
          <ul>
            {LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="v4-footer-link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
