'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import {
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'fumadocs-ui/components/tabs';
import { Tabs } from 'fumadocs-ui/components/ui/tabs';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui-radix/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui-radix/dropdown-menu';
import {
  baseLabels,
  bases,
  defaultBase,
  isBase,
  type Base,
} from '@/lib/install';
import { cn } from '@/lib/cn';
import { TAB_VALUES } from '../lib/base-tabs.mjs';

/**
 * The site-wide base (Base UI | Radix UI | React Aria) is one fumadocs tab
 * group, `base`, persisted the way fumadocs persists a `groupId`
 * (sessionStorage, then localStorage): the content-page tabs here are
 * fumadocs Tabs in that group, so a click on any of them switches the rest
 * through fumadocs' own listeners. The store below mirrors the group's value
 * for everything that is not a tab strip (the header select, the commands,
 * the example loader, the code view): the tabs are controlled by it and
 * write it from their `onValueChange`, the menus through `setBase`.
 */
export const BASE_GROUP_ID = 'base';

const fromTab = (value: string | null): Base | null =>
  bases.find((base) => TAB_VALUES[base] === value) ?? null;

const listeners = new Set<() => void>();

/** Fallback when storage is blocked, so a click still switches the page. */
let sessionBase: Base | null = null;

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
};

const readStored = (): Base => {
  try {
    return (
      fromTab(
        sessionStorage.getItem(BASE_GROUP_ID) ??
          localStorage.getItem(BASE_GROUP_ID),
      ) ?? defaultBase
    );
  } catch {
    return defaultBase;
  }
};

const getSnapshot = () => sessionBase ?? readStored();
const getServerSnapshot = () => defaultBase;

/** The selected base; defaultBase (Base UI) on the server and until the stored pick is read. */
export const useBase = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/**
 * Set the site-wide base. Called by the controls below (fumadocs already
 * wrote the group's storage then) and by controls outside the group.
 */
export const setBase = (next: Base) => {
  try {
    sessionStorage.setItem(BASE_GROUP_ID, TAB_VALUES[next]);
    localStorage.setItem(BASE_GROUP_ID, TAB_VALUES[next]);
    sessionBase = null;
  } catch {
    sessionBase = next;
  }
  for (const listener of listeners) listener();
};

/**
 * Props for a Tabs control in the base group: the controlled value and the
 * change handling. fumadocs fans a change out to every Tabs in the group, so
 * each control's `onValueChange` runs on every switch, wherever it came
 * from, and once more on mount from the persisted value.
 */
const useBaseTabs = () => {
  const base = useBase();
  const onValueChange = (value: string) => {
    const next = fromTab(value);
    if (!next) return;
    setBase(next);
  };
  return {
    value: TAB_VALUES[base],
    onValueChange,
  };
};

/**
 * Select button for the docs header (next to the theme pill): the current base
 * and a chevron, opening a radio menu over the bases. Writes the group
 * through `setBase`, so the
 * content-page tabs follow. The example toolbar renders the same control
 * (components/example-playground.tsx).
 */
export const BaseSwitch = ({ className }: { className?: string }) => {
  const base = useBase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Base"
          aria-haspopup="menu"
          className={cn('h-8 rounded-md border bg-fd-secondary', className)}
        >
          {baseLabels[base]}
          <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="docs-menu w-40">
        <DropdownMenuRadioGroup
          value={base}
          onValueChange={(value) => {
            if (!isBase(value) || value === base) return;
            setBase(value);
          }}
        >
          {bases.map((b) => (
            <DropdownMenuRadioItem key={b} value={b}>
              {baseLabels[b]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Base UI | Radix UI | React Aria tabs around content that differs per base
 * (the install commands), Base UI first shown. The header select writes the
 * same store, so either changes both. `actions` sits at the end of the tab
 * row, outside the tab list (the locale select of the install command).
 */
export const BaseTabs = ({
  radix,
  base,
  aria,
  className,
  actions,
}: Record<Base, ReactNode> & {
  className?: string;
  /** Controls at the end of the tab row. */
  actions?: ReactNode;
}) => {
  const tabs = useBaseTabs();
  const content: Record<Base, ReactNode> = { base, radix, aria };
  const triggers = bases.map((b) => (
    <TabsTrigger key={b} value={TAB_VALUES[b]}>
      {baseLabels[b]}
    </TabsTrigger>
  ));
  return (
    <Tabs
      groupId={BASE_GROUP_ID}
      persist
      {...tabs}
      className={cn(
        'my-4 flex flex-col overflow-hidden rounded-xl border bg-fd-secondary',
        className,
      )}
    >
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 pe-2">
          <TabsList className="min-w-0 flex-1">{triggers}</TabsList>
          {actions}
        </div>
      ) : (
        <TabsList>{triggers}</TabsList>
      )}
      {bases.map((b) => (
        <TabsContent key={b} value={TAB_VALUES[b]}>
          {content[b]}
        </TabsContent>
      ))}
    </Tabs>
  );
};
