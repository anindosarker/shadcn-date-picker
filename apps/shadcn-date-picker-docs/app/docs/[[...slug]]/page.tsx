import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/notebook/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { DocsBreadcrumb, NoBreadcrumb } from '@/components/docs-breadcrumb';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { siteName } from '@/lib/shared';
import { findSectionName, footerNeighbours } from '@/lib/page-tree-utils';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const section = findSectionName(source.getPageTree(), page.url);

  return (
    <DocsPage
      toc={page.data.toc}
      // Example pages have no headings worth a TOC and their playground wants
      // the whole column, so they render full width; so does any page without
      // TOC entries, instead of leaving the TOC column empty.
      full={
        page.data.full ||
        page.slugs[0] === 'examples' ||
        page.data.toc.length === 0
      }
      slots={{ breadcrumb: NoBreadcrumb }}
      // prev / next across section edges (sections are root folders)
      footer={{ items: footerNeighbours(source.getPageTree(), page.url) }}
    >
      {/* Sticky under the top nav (and the mobile TOC popover): fumadocs
          publishes that edge as --fd-docs-row-3. */}
      <div className="docs-page-bar sticky top-(--fd-docs-row-3) z-10 flex flex-row items-center justify-between gap-4 bg-fd-background py-2">
        <DocsBreadcrumb />
      </div>
      {section && (
        <p className="docs-eyebrow">
          <span aria-hidden="true">{'//'}</span> {section}
        </p>
      )}
      <DocsTitle className="docs-title">{page.data.title}</DocsTitle>
      <DocsDescription className="docs-description-rule mb-0 pb-4 text-[0.9375rem]">
        {page.data.description}
      </DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

// Every docs page is in generateStaticParams, so any other address is
// answered by Next's own 404 route, which renders app/not-found.tsx inside
// the root layout as /nope does. A notFound() thrown while the page renders
// has no boundary on the server: Next serves its empty error page
// (html id "__next_error__") and the browser builds the whole document, so
// the head scripts of app/layout.tsx never run (Q129).
export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  // No notFound() here: thrown from metadata it escapes every not-found
  // boundary (Q129); the 404 page's own title instead.
  if (!page) return { title: 'Page not found' };

  return {
    title: page.data.searchTitle ?? page.data.title,
    description: page.data.description,
    // Replaces the root layout's openGraph object, so restate siteName.
    openGraph: {
      siteName,
      type: 'article',
    },
  };
}
