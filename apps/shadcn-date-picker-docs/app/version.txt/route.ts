import pkg from '../../../../packages/shadcn-date-picker/package.json';

export const revalidate = false;

/**
 * The library version this deployment was built from, one line of text.
 */
export function GET() {
  return new Response(`${pkg.version}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
