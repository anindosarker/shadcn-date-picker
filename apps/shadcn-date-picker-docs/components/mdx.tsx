import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { InstallCommand } from './mdx/install-command';
import { StorybookLink } from './mdx/storybook-link';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Callout, CalloutContainer } from './callout';
import { ExampleSnippet } from './mdx/example-snippet';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    InstallCommand,
    StorybookLink,
    Step,
    Steps,
    Tab,
    Tabs,
    Callout,
    CalloutContainer,
    ExampleSnippet,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
