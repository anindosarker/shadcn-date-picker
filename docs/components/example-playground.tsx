'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { Button } from '@/components/ui-radix/button';
import { BaseSwitch, useBase } from '@/components/base-selector';
import { CodeExplorer, type ExplorerFile } from '@/components/code-explorer';
import { GitHubIcon } from '@/components/github-icon';
import { cn } from '@/lib/cn';
import type { Base } from '@/lib/install';

/** What differs per base: the base's sources and their GitHub folder. */
export interface ExampleVariantData {
  /** Source files for the code explorer, in tree order. */
  files: ExplorerFile[];
  /** Link to the base's example folder on GitHub. */
  githubUrl: string;
}

interface Props {
  /** The live example (components/example-variant.tsx picks the base). */
  children: ReactNode;
  /** Example folder name, used as the panel's anchor id. */
  name: string;
  /** Sources per base; the site-wide selector picks one. */
  variants: Record<Base, ExampleVariantData>;
}

type Mode = 'preview' | 'code' | 'both';

const MODES: { label: string; value: Mode }[] = [
  { label: 'Preview', value: 'preview' },
  { label: 'Code', value: 'code' },
  { label: 'Both', value: 'both' },
];

/** The reader's last view mode, shared by every example panel. */
const STORAGE_KEY = 'st-example-mode';
const DEFAULT_MODE: Mode = 'preview';

const isMode = (value: unknown): value is Mode =>
  MODES.some((mode) => mode.value === value);

/* The stored mode as an external store: every panel on the page reads the
 * same value, and the server render (and first client render) use Preview.
 * 'split' was the old name for 'both'. */
const modeListeners = new Set<() => void>();

/** Fallback when storage is blocked, so a click still switches the view. */
let sessionMode: Mode | null = null;

const subscribeMode = (onChange: () => void) => {
  modeListeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    modeListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
};

const readMode = (): Mode => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'split') return 'both';
    return isMode(stored) ? stored : DEFAULT_MODE;
  } catch {
    // Storage may be blocked (private mode, disabled cookies); keep Preview.
    return DEFAULT_MODE;
  }
};

const writeMode = (next: Mode) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Not persisted; the panels still switch for this visit.
    sessionMode = next;
  }
  for (const listener of modeListeners) listener();
};

const getModeSnapshot = () => sessionMode ?? readMode();
const getModeServerSnapshot = () => DEFAULT_MODE;

/**
 * Static playground panel around a live example: Preview, Code or Both
 * (the example, then its code below) view, a file tree code explorer. The
 * example stays mounted in every mode so its state survives switching views.
 * The caret menu opens the example in GitHub. Code is that of the selected
 * base (the header switch), as is the live example.
 */
export const ExamplePlayground = ({ children, name, variants }: Props) => {
  const base = useBase();
  const { files, githubUrl } = variants[base];
  const mode = useSyncExternalStore(
    subscribeMode,
    getModeSnapshot,
    getModeServerSnapshot,
  );
  const changeMode = (next: Mode) => {
    writeMode(next);
  };

  const showCode = mode !== 'preview' && files.length > 0;

  return (
    <div
      // Prefixed like the registry item so a guide heading whose slug is
      // the example name ("Customize Filter Modes") cannot share the id.
      id={`example-${name}`}
      // The example name whatever the id, so a check can find the mount
      // that holds the plain id `example-<name>`.
      data-example={name}
      data-mode={mode}
      className={cn(
        'docs-playground not-prose my-8 scroll-mt-24 overflow-hidden rounded-lg bg-fd-background',
      )}
    >
      <header
        className={cn(
          'flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-1.5',
        )}
      >
        <div
          className={cn(
            'ml-auto flex flex-wrap items-center gap-2',
            // Phone (D156): row 2 spans the toolbar, More at its end.
            'max-sm:w-full',
          )}
        >
          <div
            role="group"
            aria-label="View mode"
            className="inline-flex h-8 items-center gap-0.5 rounded-md border bg-fd-secondary p-0.5"
          >
            {MODES.map((m) => (
              <Button
                key={m.value}
                type="button"
                variant="ghost"
                size="xs"
                aria-pressed={mode === m.value}
                onClick={() => changeMode(m.value)}
                className="rounded-[min(var(--radius-md),10px)] text-fd-muted-foreground aria-pressed:bg-fd-background aria-pressed:text-fd-foreground aria-pressed:shadow-sm"
              >
                {m.label}
              </Button>
            ))}
          </div>
          {/* dashed like the other groups on this row */}
          <BaseSwitch
            className="border-dashed border-(--docs-dash)"
          />
          <div
            role="group"
            aria-label="Open example"
            className="st-page-actions inline-flex h-8 shrink-0 items-stretch overflow-hidden rounded-md border bg-fd-secondary max-sm:ml-auto [&>*]:h-full [&>*]:rounded-none [&>*]:border-0"
          >
            <Button asChild variant="ghost" size="sm" className="px-2.5">
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open in GitHub"
              >
                <GitHubIcon />
                <span className="max-sm:sr-only">GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </header>
      {/* Both stacks the live example above its code, full width at every
          size. The example comes first in every mode so the table stays
          mounted (hidden in Code) and keeps its state across views. */}
      <div>
        <div
          data-slot="preview"
          className={cn('min-w-0 p-4', mode === 'code' && 'hidden')}
        >
          <div className="w-fit max-w-full">{children}</div>
        </div>
        {showCode && (
          <div
            data-slot="code"
            className={cn(
              'min-w-0',
              mode === 'both' && '[border-top:var(--docs-rule)]',
            )}
          >
            <CodeExplorer files={files} />
          </div>
        )}
      </div>
    </div>
  );
};
