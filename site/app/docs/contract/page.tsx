import type { Metadata } from "next";
import { BlueprintArgTable, BlueprintCodeBlock, BlueprintTerminal } from "@/components/themed";
import { C, DocSection, DocsShell, P } from "@/components/docs-shell";
import { ogImage } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Output contract",
  description: "How every mkcmd-agent CLI behaves: the --json envelope, exit codes, stderr, describe, help, and when it prompts.",
  openGraph: ogImage("docs-contract", "Topographic map generated from the mkcmd-agent output contract docs"),
};

export default function ContractPage() {
  return (
    <DocsShell
      slug="docs-contract"
      meta={[
        { label: "APPLIES TO", value: "EVERY GENERATED CLI" },
        { label: "SOURCE", value: "src/core/cli.ts" },
      ]}
    >
      <DocSection id="summary" title="Summary">
        <div className="overflow-x-auto">
          <BlueprintArgTable
            headers={["Rule", "Behaviour"]}
            rows={[
              { Rule: "Input", Behaviour: "Flags and positionals. Nothing waits on stdin unless a human is at a terminal." },
              { Rule: "--json", Behaviour: "Exactly one JSON object on stdout, success or failure." },
              { Rule: "stderr", Behaviour: "Progress and logs only. stdout carries the result and nothing else." },
              { Rule: "Exit codes", Behaviour: "0 success, 1 failure, 2 usage error." },
              { Rule: "describe", Behaviour: "Every command, flag, default and example, as JSON." },
              { Rule: "--help", Behaviour: "Usage, flags and examples for one command, as text." },
              { Rule: "--no-input", Behaviour: "Never prompt, even at a terminal." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection id="json" title="The --json envelope">
        <P>With <C>--json</C>, stdout gets one line of JSON. On success:</P>
        <BlueprintCodeBlock label="SUCCESS">{`{"ok": true, "command": "hello", "result": {"greeting": "Hello, Ada!"}}`}</BlueprintCodeBlock>
        <P>
          <C>result</C> is whatever the command returned, or <C>null</C> if it returned nothing. On failure:
        </P>
        <BlueprintCodeBlock label="FAILURE">{`{"ok": false, "command": "hello", "error": {"code": "usage", "message": "Missing required flag: --name.", "hint": "Example: my-cli hello --name Ada --json"}}`}</BlueprintCodeBlock>
        <P>
          <C>hint</C> is present only when there is one. <C>details</C> appears when a command fails with structured
          data, such as the findings of a check that didn&apos;t pass. <C>command</C> is <C>null</C> if the failure happened before a
          command was chosen. Check <C>ok</C> or the exit code; both always agree.
        </P>
        <P>
          Without <C>--json</C>, results print as text: the command&apos;s <C>render</C> function if it has one,
          otherwise a <C>key: value</C> listing. Errors print to stderr as <C>error: ...</C> and <C>hint: ...</C>.
        </P>
      </DocSection>

      <DocSection id="exit-codes" title="Exit codes">
        <div className="overflow-x-auto">
          <BlueprintArgTable
            headers={["Code", "Meaning", "Typical error.code"]}
            rows={[
              { Code: <C>0</C>, Meaning: "Success. Also --help, describe and --version.", "Typical error.code": "none" },
              { Code: <C>1</C>, Meaning: "The command ran and failed.", "Typical error.code": "the command's own code, e.g. target_not_empty; internal for an unexpected exception" },
              { Code: <C>2</C>, Meaning: "Bad input: unknown command, unknown flag, missing required flag, invalid value. Running with no arguments also prints help and exits 2.", "Typical error.code": "usage" },
            ]}
          />
        </div>
      </DocSection>

      <DocSection id="discovery" title="describe and help">
        <BlueprintTerminal commands={["my-cli describe"]} />
        <P>
          Prints the whole CLI as pretty-printed JSON: name, about, the contract, global flags, and each command with its
          usage line, flags (name, short, type, required, default, description) and examples. It is always JSON, with no
          envelope, and needs no <C>--json</C>. Read it once at the start of a session instead of guessing flags.
        </P>
        <BlueprintTerminal commands={["my-cli hello --help", "my-cli help hello"]} />
        <P>
          Both print one command&apos;s usage, flags, global flags and examples as text. Add <C>--json</C> to get the
          same information as that command&apos;s entry from <C>describe</C>, inside the envelope.{" "}
          <C>my-cli --help</C> lists all commands.
        </P>
      </DocSection>

      <DocSection id="flags" title="Flags">
        <P>
          Global flags work on every command: <C>--json</C>, <C>-h, --help</C>, <C>--no-input</C>.{" "}
          <C>-v</C> or <C>--version</C> works as the first argument.
        </P>
        <P>
          String flags take a value: <C>--name Ada</C> or <C>--name=Ada</C>. Boolean flags take none:{" "}
          <C>--shout</C>, never <C>--shout true</C>. Unknown flags are a usage error, so a typo fails instead of being
          ignored. Missing booleans are <C>false</C>; missing strings take their default or are left undefined.
        </P>
      </DocSection>

      <DocSection id="prompts" title="When it prompts">
        <P>A CLI asks a question only when all of these hold:</P>
        <ul className="mt-4 text-sm text-[#444] list-disc pl-6 space-y-1">
          <li>a required flag is missing and declares a <C>prompt</C>,</li>
          <li>both stdin and stdout are a terminal,</li>
          <li>and neither <C>--json</C> nor <C>--no-input</C> was passed.</li>
        </ul>
        <P>
          Otherwise a missing required flag is an immediate usage error (exit 2) with an example. An agent running
          commands through a tool or a pipe never sees a prompt. An empty answer counts as missing.
        </P>
      </DocSection>

      <DocSection id="pipes" title="Using it from scripts">
        <BlueprintTerminal
          commands={[
            "my-cli hello --name Ada --json | jq -r .result.greeting",
            'my-cli hello --json || echo "failed with $?"',
          ]}
          output={["Hello, Ada!", 'failed with 2']}
        />
      </DocSection>
    </DocsShell>
  );
}
