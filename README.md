# mkcmd-agent

Scaffold Bun CLIs for agents to drive.

Most CLIs are built for someone at a keyboard: they ask questions, print decorated text, and exit 0 when something goes wrong. An agent can't answer a prompt, can't reliably parse a banner, and can't tell success from failure. mkcmd-agent generates CLIs with a contract built for agents.

Docs: **[mkcmd.mackenziebowes.com](https://mkcmd.mackenziebowes.com)**

Not on npm yet. Run it from source with [Bun](https://bun.sh) 1.2+:

```bash
git clone https://github.com/mackenziebowes/mkcmd-agent ~/mkcmd-agent   # any directory works
cd ~/mkcmd-agent && bun install
alias mkcmd-agent="bun ~/mkcmd-agent/src/index.ts"   # agents: call the full command instead

mkcmd-agent init --name my-cli --description "Does one thing well"
cd my-cli && bun install
bun run src/index.ts describe
```

## The contract

Every generated CLI, and mkcmd-agent itself, behaves the same way:

| | |
|---|---|
| **Input** | Flags and positionals only. Nothing prompts: a missing required flag is a usage error with an example. |
| **Output** | `--json` prints one object on stdout: `{"ok": true, "command", "result"}` or `{"ok": false, "command", "error": {"code", "message", "hint"}}`. |
| **Logs** | Progress goes to stderr, so stdout is always just the result. |
| **Exit codes** | `0` success, `1` failure, `2` usage error (unknown command or flag, missing required flag). |
| **Discovery** | `describe` prints every command, flag, default and example as JSON. `<command> --help` shows one command as text. |

What that looks like to an agent:

```console
$ my-cli hello --json
{"ok":false,"command":"hello","error":{"code":"usage","message":"Missing required flag: --name.","hint":"Example: my-cli hello --name Ada --json"}}
$ echo $?
2
$ my-cli hello --name Ada --json
{"ok":true,"command":"hello","result":{"greeting":"Hello, Ada!"}}
```

## Commands

| Command | What it does |
|---|---|
| `init --name <name>` | Create a project. Flags: `--description`, `--dir`, `--force`, `--dry-run`, `--install`. |
| `add --name <command>` | Add a command to an existing project and register it. Flags: `--summary`, `--dir`, `--force`, `--dry-run`. |
| `describe` | This CLI's commands and flags, as JSON. |

`init --dry-run --json` lists exactly what would be written. Neither command overwrites anything without `--force`.

## Writing a command

```ts
import { defineCommand, CliError } from "../core/cli";

export const sync = defineCommand({
  name: "sync",
  summary: "Sync records from the API",
  flags: {
    since: { type: "string", required: true, description: "ISO date to sync from" },
    "dry-run": { type: "boolean", description: "Report without writing" },
  },
  examples: ["my-cli sync --since 2026-01-01 --json"],
  run: async ({ flags, log }) => {
    log("fetching");                              // stderr
    if (!/^\d{4}-\d{2}-\d{2}$/.test(flags.since)) {
      throw new CliError("Bad date.", { code: "bad_date", hint: "Use YYYY-MM-DD." });
    }
    return { synced: 12, since: flags.since };    // stdout, as text or JSON
  },
});
```

`run` returns data and throws to fail. Flags are typed from their declarations, so `flags.since` is a `string` and `flags["dry-run"]` is a `boolean`. The framework handles parsing, help, JSON and exit codes.

## What you get

```
my-cli/
├── AGENTS.md            the contract and how to add commands, for the next agent
├── src/
│   ├── index.ts         entry point
│   ├── core/cli.ts      the framework: one file, no dependencies
│   └── commands/
│       ├── index.ts     the list of commands
│       └── hello.ts     an example
└── test/cli.test.ts     subprocess tests of the contract
```

After `bun install`, the generated project passes `bun test` and `tsc --noEmit`.

## Development

```bash
bun install
bun run test        # syncs the core template, then runs the suite
bun run typecheck
bun run build       # dist/index.js, with templates bundled in
```

The test suite drives the CLI as a subprocess, generates real projects, runs their tests, and checks the built bundle.

`src/templates/cli.ts.txt` is a copy of `src/core/cli.ts`, because Bun can't import one file as both code and text. `bun run sync-core` refreshes it and the end-to-end bundle test fails if they drift. More in [AGENTS.md](./AGENTS.md).

The docs site lives in [`site/`](./site).

## Background

A fork of [mkcmd](https://github.com/mackenziebowes/mkcmd), which scaffolds the same kind of CLI through interactive prompts. mkcmd-agent keeps the idea and rebuilds the interface around flags, structured output and exit codes.

## License

MIT. See [LICENSE](./LICENSE).
