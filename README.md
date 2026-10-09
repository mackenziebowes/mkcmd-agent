# mkcmd-agent

Scaffolds Bun + TypeScript CLIs that an agent can drive as easily as a person. A fork of [mkcmd](https://github.com/mackenziebowes/mkcmd), which asks its questions through interactive prompts.

```bash
bunx @mbsi/mkcmd-agent init --name my-cli --description "Does one thing well"
cd my-cli && bun install
bun run src/index.ts describe
```

## What every generated CLI does

- **Flags only.** Required flags can declare a `prompt`, which is asked only when a human is at a terminal. `--json` and `--no-input` turn prompts off, and a missing flag is a usage error with an example.
- **`--json`** prints exactly one object on stdout: `{"ok": true, "command", "result"}` or `{"ok": false, "command", "error": {"code", "message", "hint"}}`.
- **stderr for progress, stdout for results**, so output pipes cleanly.
- **Exit codes:** 0 success, 1 failure, 2 usage error.
- **`describe`** prints every command, flag, default and example as JSON. `<command> --help` prints the same for one command as text.
- **Subprocess tests** of that contract in `test/cli.test.ts`.

The framework is one dependency-free file, `src/core/cli.ts`, copied into each project.

## Commands

| Command | What it does |
|---|---|
| `init --name <name>` | New project. `--description`, `--dir`, `--force`, `--dry-run`, `--install`. |
| `add --name <command>` | New command file in an existing project, registered in `src/commands/index.ts`. `--summary`, `--dir`, `--force`, `--dry-run`. |
| `describe` | This CLI's own commands and flags as JSON. |

A command looks like this:

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
    log("fetching");                       // stderr
    return { synced: 12, since: flags.since };  // stdout, as text or JSON
  },
});
```

## Development

```bash
bun install
bun run test        # syncs the core template, then runs the suite
bun run typecheck
bun run build       # dist/index.js, templates bundled in
```

`src/templates/cli.ts.txt` is a copy of `src/core/cli.ts`, because Bun can't import one file as both code and text. `bun run sync-core` refreshes it, and a test fails if they drift.
