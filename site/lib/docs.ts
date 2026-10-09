export const docsPages = [
  { href: "/docs/usage/", slug: "docs-usage", title: "Usage", sheet: "W-02" },
  { href: "/docs/contract/", slug: "docs-contract", title: "Output contract", sheet: "W-03" },
  { href: "/docs/commands/", slug: "docs-commands", title: "Writing commands", sheet: "W-04" },
] as const;

export type DocSlug = (typeof docsPages)[number]["slug"];

/** Page-level openGraph replaces the layout's, so each page carries the shared fields too. */
export function ogImage(slug: string, alt: string) {
  return {
    siteName: "mkcmd-agent",
    type: "website" as const,
    images: [{ url: `/og/${slug}.png`, width: 1200, height: 630, alt }],
  };
}
