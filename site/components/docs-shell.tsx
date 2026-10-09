import {
  BlueprintContainer,
  BlueprintDocHeader,
  BlueprintExplorerLayout,
  BlueprintFooter,
  BlueprintNav,
  BlueprintSidebar,
  BlueprintSidebarItem,
  BlueprintStatusPill,
} from "@/components/themed";
import { contentConfig } from "@/lib/contentConfig";
import { docsPages, type DocSlug } from "@/lib/docs";

export function DocsShell({
  slug,
  meta,
  children,
}: {
  slug: DocSlug;
  meta?: { label: string; value: string }[];
  children: React.ReactNode;
}) {
  const page = docsPages.find((p) => p.slug === slug)!;
  return (
    <>
      <BlueprintContainer>
        <BlueprintNav
          brand="MKCMD-AGENT"
          subtitle="CLI DOCUMENTATION"
          metadata={[
            { label: "VERSION", value: contentConfig.version },
            { label: "DWG NO.", value: page.sheet },
            { label: "STATUS", value: "ACTIVE" },
          ]}
        />
        <BlueprintExplorerLayout
          sidebar={
            <BlueprintSidebar title="Documentation">
              <nav aria-label="Documentation">
                {docsPages.map((p) => (
                  <BlueprintSidebarItem key={p.slug} href={p.href} active={p.slug === slug}>
                    {p.title}
                  </BlueprintSidebarItem>
                ))}
                <BlueprintSidebarItem href="/llms.txt">llms.txt (plain text)</BlueprintSidebarItem>
                <BlueprintSidebarItem href={contentConfig.githubRepo}>Source on GitHub</BlueprintSidebarItem>
              </nav>
            </BlueprintSidebar>
          }
        >
          <BlueprintDocHeader
            title={page.title}
            statusPill={<BlueprintStatusPill>ACTIVE</BlueprintStatusPill>}
            metaData={meta}
          />
          {children}
        </BlueprintExplorerLayout>
      </BlueprintContainer>
      <BlueprintFooter project="MKCMD-AGENT" sheet={page.sheet} revision={contentConfig.version} copyright={contentConfig.copyright} />
    </>
  );
}

export function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-8">
      <h2 className="text-lg uppercase font-normal border-b-2 border-(--ink-primary) pb-2 mb-6">
        <a href={`#${id}`} className="hover:underline">{title}</a>
      </h2>
      {children}
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-sm leading-relaxed text-[#444] max-w-3xl">{children}</p>;
}

export function C({ children }: { children: React.ReactNode }) {
  return <code className="bg-[#f0f4ff] px-1 text-(--ink-primary)">{children}</code>;
}
