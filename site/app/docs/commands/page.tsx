import type { Metadata } from "next";
import { BlueprintArgTable, BlueprintCodeBlock, BlueprintTerminal } from "@/components/themed";
import { C, DocSection, DocsShell, P } from "@/components/docs-shell";
import { ogImage } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Writing commands",
  description: "defineCommand, flag specs, the run context, errors, rendering text output, and testing a command.",
  openGraph: ogImage("docs-commands", "Topographic map generated from the mkcmd-agent writing commands docs"),
};

export default function CommandsPage() {
  return (
    <DocsShell
      slug="docs-commands"
      meta={[
        { label: "API", value: "defineCommand" },
        { label: "FILE", value: "src/commands/<name>.ts" },
      ]}
    >
      <DocSection id="example" title="A complete command">
        <BlueprintCodeBlock label="src/commands/sync.ts">
{`import { defineCommand, CliError, UsageError } from "../core/cli";

export const sync = defineCommand({
  name: "sync",
  summary: "Sync records from the API",
  description: "Fetches records changed since a date and writes them to ./data.",
  flags: {
    since: { type: "string", required: true, description: "ISO date, YYYY-MM-DD", prompt: "Sync since which date?" },
    limit: { type: "string", default: "100", description: "Maximum records" },
    "dry-run": { type: "boolean", description: "Report without writing" },
  },
  examples: ["my-cli sync --since 2026-01-01 --json"],
  run: async ({ flags, log }) => {
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(flags.since)) {
      throw new UsageError(\`Bad date "\${flags.since}".\`, "Use YYYY-MM-DD.");
    }
    const limit = Number(flags.limit);
    log(\`fetching up to \${limit} records\`);          // stderr
    const records = await fetchRecords(flags.since, limit);
    if (!records) throw new CliError("API unreachable.", { code: "api_down", hint: "Retry later." });
    return { synced: records.length, since: flags.since, dryRun: flags["dry-run"] };
  },
  render: (r) => \`\${r.dryRun ? "Would sync" : "Synced"} \${r.synced} records since \${r.since}\`,
});`}
        </BlueprintCodeBlock>
        <P>
          Then add <C>sync</C> to the array in <C>src/commands/index.ts</C>, or let{" "}
          <C>mkcmd-agent add --name sync</C> write the file and register it for you.
        </P>
      </DocSection>

      <DocSection id="define-command" title="defineCommand">
        <div className="overflow-x-auto">
          <BlueprintArgTable
            headers={["Field", "Required", "Description"]}
            rows={[
              { Field: <C>name</C>, Required: "yes", Description: "What the user types. Must be unique. describe and help are taken." },
              { Field: <C>summary</C>, Required: "yes", Description: "One line for help and describe." },
              { Field: <C>description</C>, Required: "no", Description: "Longer text shown in --help." },
              { Field: <C>flags</C>, Required: "no", Description: "An object of flag specs, keyed by flag name without the dashes." },
              { Field: <C>args</C>, Required: "no", Description: 'Usage text for positionals, e.g. "<file...>". Positionals arrive in ctx.args.' },
              { Field: <C>examples</C>, Required: "no", Description: "Full example invocations. The first one is shown when a required flag is missing." },
              { Field: <C>run</C>, Required: "yes", Description: "Does the work. Return JSON-serialisable data; throw to fail." },
              { Field: <C>render</C>, Required: "no", Description: "Turns the result into text for humans. Without it, results print as key: value lines." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection id="flag-spec" title="Flag specs">
        <div className="overflow-x-auto">
          <BlueprintArgTable
            headers={["Field", "Description"]}
            rows={[
              { Field: <C>type</C>, Description: '"string" or "boolean". There is no number type: take a string and convert it in run.' },
              { Field: <C>description</C>, Description: "Shown in help and describe. Required." },
              { Field: <C>required</C>, Description: "Missing means a usage error (exit 2), unless a human answers its prompt." },
              { Field: <C>default</C>, Description: "Used when the flag is absent. A string flag with a default is typed as string, not string | undefined." },
              { Field: <C>short</C>, Description: 'One-letter alias, e.g. "n" for -n.' },
              { Field: <C>prompt</C>, Description: "Question asked when a required flag is missing and a human is at a terminal. See the output contract." },
            ]}
          />
        </div>
        <P>
          Types follow the specs. In the example above <C>flags.since</C> and <C>flags.limit</C> are <C>string</C>,{" "}
          <C>flags[&quot;dry-run&quot;]</C> is <C>boolean</C>, and an optional string flag with no default would be{" "}
          <C>string | undefined</C>.
        </P>
      </DocSection>

      <DocSection id="context" title="The run context">
        <div className="overflow-x-auto">
          <BlueprintArgTable
            headers={["Field", "Description"]}
            rows={[
              { Field: <C>flags</C>, Description: "Parsed, defaulted and validated flag values." },
              { Field: <C>args</C>, Description: "Positional arguments after the command name, as strings." },
              { Field: <C>log(message)</C>, Description: "Write progress to stderr. Never use console.log for output: stdout is reserved for the result." },
              { Field: <C>json</C>, Description: "True when --json was passed. Rarely needed: return data and let the framework format it." },
              { Field: <C>interactive</C>, Description: "True when a human is at a terminal and prompting is allowed." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection id="errors" title="Errors">
        <P>
          <C>throw new CliError(message, {"{ code, hint, exitCode, details }"})</C> fails with exit code 1 (or{" "}
          <C>exitCode</C>). <C>details</C> carries structured data: agents get it as <C>error.details</C>, and people see
          it through <C>render</C>, so a failing check can still show its report.
          Always pass a stable snake_case <C>code</C>: agents branch on it, and without one they get the generic{" "}
          <C>error</C>. <C>throw new UsageError(message, hint)</C> is for bad
          input and exits 2 with code <C>usage</C>. Any other exception becomes code <C>internal</C>, exit 1.
        </P>
        <P>
          Don&apos;t call <C>process.exit</C> or print errors yourself. The framework writes the JSON or text and sets the
          exit code.
        </P>
      </DocSection>

      <DocSection id="testing" title="Testing">
        <P>
          Test commands the way agents use them: as a subprocess, reading stdout and the exit code. The generated{" "}
          <C>test/cli.test.ts</C> has a helper for this.
        </P>
        <BlueprintCodeBlock label="test/cli.test.ts">
{`test("sync rejects a bad date", async () => {
  const { code, stdout } = await run("sync", "--since", "yesterday", "--json");
  expect(code).toBe(2);
  expect(JSON.parse(stdout).error.code).toBe("usage");
});`}
        </BlueprintCodeBlock>
        <BlueprintTerminal commands={["bun test"]} />
      </DocSection>
    </DocsShell>
  );
}
