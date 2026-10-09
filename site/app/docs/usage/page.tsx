import type { Metadata } from "next";
import { BlueprintArgTable, BlueprintCodeBlock, BlueprintTerminal } from "@/components/themed";
import { C, DocSection, DocsShell, P } from "@/components/docs-shell";
import { contentConfig } from "@/lib/contentConfig";
import { ogImage } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Usage",
  description: "Install mkcmd-agent, scaffold a CLI with init, add commands with add, and what the generated project contains.",
  openGraph: ogImage("docs-usage", "Topographic map generated from the mkcmd-agent usage docs"),
};

export default function UsagePage() {
  return (
    <DocsShell
      slug="docs-usage"
      meta={[
        { label: "PACKAGE", value: contentConfig.packageName },
        { label: "COMMANDS", value: "init, add, describe" },
      ]}
    >
      <DocSection id="install" title="Install">
        {contentConfig.npmPublished ? (
          <>
            <P>Run it with bunx. Nothing to install globally.</P>
            <BlueprintTerminal commands={[`bunx ${contentConfig.packageName} --help`]} />
          </>
        ) : (
          <>
            <P>
              mkcmd-agent is not on npm yet. Clone it and run it from source with{" "}
              <a className="underline" href="https://bun.sh">Bun</a> 1.2 or later:
            </P>
            <BlueprintTerminal
              commands={[
                `git clone ${contentConfig.githubRepo} ~/mkcmd-agent`,
                "cd ~/mkcmd-agent && bun install",
                "bun src/index.ts --help",
              ]}
            />
            <P>
              The examples below call it as <C>mkcmd-agent</C>. From source, that means{" "}
              <C>bun ~/mkcmd-agent/src/index.ts</C>. To get the short name, add{" "}
              <C>alias mkcmd-agent=&quot;bun ~/mkcmd-agent/src/index.ts&quot;</C> to your shell profile.
            </P>
          </>
        )}
      </DocSection>

      <DocSection id="quick-start" title="Quick start">
        <BlueprintTerminal
          commands={[
            'mkcmd-agent init --name my-cli --description "Does one thing well"',
            "cd my-cli && bun install",
            "bun run src/index.ts hello --name Ada --json",
          ]}
          output={['{"ok":true,"command":"hello","result":{"greeting":"Hello, Ada!"}}']}
        />
        <P>
          Every command takes <C>--json</C>. Start an agent session with <C>bun run src/index.ts describe</C>: it
          prints every command, flag and example as JSON.
        </P>
      </DocSection>

      <DocSection id="init" title="init">
        <P>
          Create a new project. Writes into <C>./&lt;name&gt;</C> unless you pass <C>--dir</C>, and refuses a non-empty
          directory unless you pass <C>--force</C>.
        </P>
        <div className="mt-6 overflow-x-auto">
          <BlueprintArgTable
            headers={["Flag", "Type", "Description"]}
            rows={[
              { Flag: <C>--name</C>, Type: "string, required", Description: "Package name: lowercase letters, digits, - . _ and an optional @scope/ prefix. The command name is the part after the scope." },
              { Flag: <C>--description</C>, Type: "string", Description: 'One line on what the CLI does. Default: "A command-line tool."' },
              { Flag: <C>--dir</C>, Type: "string", Description: "Where to create it, relative or absolute. Default: ./<name without scope>" },
              { Flag: <C>--force</C>, Type: "boolean", Description: "Write into a non-empty directory, overwriting files with the same names." },
              { Flag: <C>--dry-run</C>, Type: "boolean", Description: "List the files that would be written. Writes nothing." },
              { Flag: <C>--install</C>, Type: "boolean", Description: "Run bun install in the new project." },
            ]}
          />
        </div>
        <BlueprintTerminal
          commands={["mkcmd-agent init --name @acme/tool --dir ./tools/tool --dry-run --json"]}
          output={['{"ok":true,"command":"init","result":{"name":"@acme/tool","bin":"tool","dir":"/abs/path/tools/tool","dryRun":true,"files":[...],"next":[...]}}']}
        />
        <P>
          Errors you can get: <C>usage</C> (exit 2) for a missing or invalid flag, and <C>target_not_empty</C> (exit 1)
          when the directory already has files.
        </P>
      </DocSection>

      <DocSection id="add" title="add">
        <P>
          Add a command to a project made by <C>init</C>. Writes <C>src/commands/&lt;name&gt;.ts</C> from a template and
          adds it to the list in <C>src/commands/index.ts</C>. The new command throws <C>not_implemented</C> until you
          write its <C>run</C>.
        </P>
        <div className="mt-6 overflow-x-auto">
          <BlueprintArgTable
            headers={["Flag", "Type", "Description"]}
            rows={[
              { Flag: <C>--name</C>, Type: "string, required", Description: "Command name: lowercase letters, digits and dashes, starting with a letter. describe and help are reserved." },
              { Flag: <C>--summary</C>, Type: "string", Description: "One line shown in help and describe." },
              { Flag: <C>--dir</C>, Type: "string", Description: "Project root. Default: the current directory." },
              { Flag: <C>--force</C>, Type: "boolean", Description: "Overwrite the command file if it exists." },
              { Flag: <C>--dry-run</C>, Type: "boolean", Description: "Show what would change. Writes nothing." },
            ]}
          />
        </div>
        <BlueprintTerminal
          commands={['mkcmd-agent add --name sync-users --summary "Sync users from the API" --dir ./my-cli --json']}
          output={['{"ok":true,"command":"add","result":{"command":"sync-users","dryRun":false,"files":["src/commands/sync-users.ts","src/commands/index.ts"],"next":[...]}}']}
        />
        <P>
          Dashed names become camelCase identifiers: <C>sync-users</C> is exported as <C>syncUsers</C>. Errors:{" "}
          <C>not_a_project</C> when there is no <C>src/commands/index.ts</C>, <C>command_exists</C> when the file is
          already there.
        </P>
      </DocSection>

      <DocSection id="project" title="The generated project">
        <BlueprintCodeBlock label="PROJECT STRUCTURE">
{`my-cli/
├── AGENTS.md            the contract and how to add commands
├── README.md
├── package.json         bin: my-cli -> src/index.ts
├── tsconfig.json
├── src/
│   ├── index.ts         entry point: runCLI({ name, about, commands })
│   ├── core/cli.ts      the framework, one file, no dependencies
│   └── commands/
│       ├── index.ts     export const commands = [hello]
│       └── hello.ts     an example command
└── test/cli.test.ts     subprocess tests of the contract`}
        </BlueprintCodeBlock>
        <P>
          Scripts: <C>bun run start</C>, <C>bun test</C>, <C>bun run typecheck</C>, and <C>bun run build</C> for a
          single compiled binary in <C>dist/</C>. After <C>bun install</C> the project passes its own tests and{" "}
          <C>tsc --noEmit</C>.
        </P>
        <P>
          Next: <a className="underline" href="/docs/contract/">the output contract</a>, then{" "}
          <a className="underline" href="/docs/commands/">writing commands</a>.
        </P>
      </DocSection>
    </DocsShell>
  );
}
