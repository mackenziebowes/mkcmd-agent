import type { MetadataRoute } from "next";
import { docsPages } from "@/lib/docs";

export const dynamic = "force-static";

const BASE_URL = "https://mkcmd.mackenziebowes.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "monthly", priority: 1 },
    ...docsPages.map((p) => ({ url: `${BASE_URL}${p.href}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
