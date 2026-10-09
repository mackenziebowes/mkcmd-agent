// Templates are bundled as text by `bun build`, so the published CLI is one file.
// cli.ts.txt is a copy of src/core/cli.ts (Bun cannot import one file as both
// code and text). `bun run sync-core` refreshes it; a test fails if they drift.
import coreCli from "../templates/cli.ts.txt" with { type: "text" };
import indexTs from "../templates/index.ts.txt" with { type: "text" };
import commandsIndexTs from "../templates/commands-index.ts.txt" with { type: "text" };
import helloTs from "../templates/hello.ts.txt" with { type: "text" };
import commandTs from "../templates/command.ts.txt" with { type: "text" };
import cliTestTs from "../templates/cli.test.ts.txt" with { type: "text" };
import tsconfigJson from "../templates/tsconfig.json.txt" with { type: "text" };
import gitignore from "../templates/gitignore.txt" with { type: "text" };
import readmeMd from "../templates/README.md.txt" with { type: "text" };
import agentsMd from "../templates/AGENTS.md.txt" with { type: "text" };

export const templates = {
  coreCli,
  indexTs,
  commandsIndexTs,
  helloTs,
  commandTs,
  cliTestTs,
  tsconfigJson,
  gitignore,
  readmeMd,
  agentsMd,
};

/** Replaces {{KEY}} placeholders. Throws if one is left unfilled. */
export function fill(template: string, vars: Record<string, string>): string {
  const out = template.replace(/\{\{([A-Z_]+)\}\}/g, (m, key: string) => {
    if (!(key in vars)) throw new Error(`Template placeholder ${m} has no value.`);
    return vars[key]!;
  });
  return out;
}
