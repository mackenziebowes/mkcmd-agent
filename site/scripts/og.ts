// Generates public/og/<slug>.png for every page: the page's prose and last-edit date
// become an ArtSeed, the terrain synth draws it, resvg rasterises it.
// Deterministic: same text and same commit date give the same image, byte for byte.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { analyzeText } from "../lib/og-art/analyze/text";
import { hsl } from "../lib/og-art/canvas";
import { terrain, type TerrainPalette } from "../lib/og-art/synth/terrain";

const ROOT = join(import.meta.dir, "..");

/** Blue ink on drafting paper, to match the site. */
export const BLUEPRINT: TerrainPalette = {
  background: "#fcfcfc",
  ink: "#3d5afe",
  contour: (t, index, shift) =>
    index ? hsl(231 + shift, 0.98, 0.57) : hsl(229 + shift + 4 * t, 0.62 + 0.3 * t, 0.8 - 0.18 * t),
  glow: (shift) => hsl(228 + shift, 1, 0.94),
  grid: { color: "#c9d3ff", size: 30, opacity: 0.7 },
};

const pages = [
  { slug: "home", route: "/", files: ["app/page.tsx"], label: "mkcmd-agent" },
  { slug: "docs-usage", route: "/docs/usage/", files: ["app/docs/usage/page.tsx"], label: "mkcmd-agent usage" },
  { slug: "docs-contract", route: "/docs/contract/", files: ["app/docs/contract/page.tsx"], label: "mkcmd-agent output contract" },
  { slug: "docs-commands", route: "/docs/commands/", files: ["app/docs/commands/page.tsx"], label: "mkcmd-agent writing commands" },
];

/** String literals and JSX text that read like prose. From og-art's source.ts. */
function proseFromSource(source: string): string {
  const found: string[] = [];
  const patterns = [/"((?:[^"\\\n]|\\.){12,})"/g, /'((?:[^'\\\n]|\\.){12,})'/g, /`((?:[^`\\]|\\.){12,})`/g, />([^<>{}]{12,})</g];
  for (const re of patterns) for (const m of source.matchAll(re)) found.push(m[1]!);
  return found
    .map((t) => t.replace(/\s+/g, " ").trim())
    .filter((t) => {
      const words = t.split(" ");
      if (words.length < 3) return false;
      const codey = words.filter((w) => /[-\[\]/:=_]|^\d+(px|rem|%)$/.test(w) && !/^[\p{L}]+-[\p{L}]+$/u.test(w)).length;
      return codey / words.length < 0.34;
    })
    .join("\n");
}

/** Last commit touching the files. Uncommitted pages fall back to a fixed date, never to now. */
function gitDate(files: string[]): string {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...files], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    if (out) return out;
  } catch {}
  return "2026-10-08T00:00:00Z";
}

mkdirSync(join(ROOT, "public/og"), { recursive: true });
for (const page of pages) {
  const text = page.files.map((f) => proseFromSource(readFileSync(join(ROOT, f), "utf8"))).join("\n");
  const seed = analyzeText({ text, modified: gitDate(page.files), identity: page.route, label: page.label });
  const svg = terrain(seed, { palette: BLUEPRINT, style: "mixed" });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  writeFileSync(join(ROOT, "public/og", `${page.slug}.png`), png);
  console.log(`og: ${page.slug}.png (${Math.round(png.length / 1024)} KB, ${text.split(/\s+/).length} words)`);
}
