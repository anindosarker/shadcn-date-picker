'use client';

import { type ReactNode } from 'react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { BaseTabs } from '@/components/base-selector';
import {
  addCommand,
  packageManagers,
  perBase,
  type Base,
  type PackageManager,
} from '@/lib/install';

/** One tab per package manager around a command. */
const CommandTabs = ({
  command,
}: {
  command: (pm: PackageManager) => string;
}) => (
  <Tabs items={[...packageManagers]}>
    {packageManagers.map((pm) => (
      <Tab key={pm} value={pm}>
        <DynamicCodeBlock
          lang="bash"
          code={command(pm)}
        />
      </Tab>
    ))}
  </Tabs>
);

/**
 * Base UI | Radix UI | React Aria tabs (the site-wide base group) around the package-manager
 * tabs of a command that differs per base.
 */
const BaseCommandTabs = ({
  command,
  actions,
  before,
}: {
  command: (base: Base, pm: PackageManager) => string;
  /** Controls at the end of the base tab row. */
  actions?: ReactNode;
  /** Content above the package-manager tabs, in every base tab. */
  before?: ReactNode;
}) => (
  <BaseTabs
    actions={actions}
    {...perBase((base) => (
      <>
        {before}
        <CommandTabs
          command={(pm) => command(base, pm)}
        />
      </>
    ))}
  />
);

/** `shadcn add` of the picker on the selected base, per package manager. */
export const InstallCommand = () => (
  <BaseCommandTabs command={(base, pm) => addCommand(base, pm)} />
);
