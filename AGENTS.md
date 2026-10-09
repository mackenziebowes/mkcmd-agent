# AGENTS.md

mkcmd-agent scaffolds agent-drivable Bun CLIs. It is built on the same framework it generates.

## Commands

- `bun install`
- `bun run test`: copies `src/core/cli.ts` to `src/templates/cli.ts.txt`, then runs `test/cli.test.ts` (subprocess tests, including generating a project and running that project's tests).
- `bun run typecheck`: `tsc --noEmit`.
- `bun run build`: bundles to `dist/index.js` with templates inlined as text.
- `bun src/index.ts describe`: the CLI's own commands and flags as JSON.

## Layout

- `src/core/cli.ts`: the framework (flag parsing, `--json` envelope, exit codes, `describe`, help, TTY-only prompts). No dependencies. Shipped verbatim into generated projects, so keep it self-contained.
- `src/commands/`: `init`, `add`, and `index.ts` listing them.
- `src/scaffold/project.ts`: pure planning. `planProject` and `planCommand` return files as data; `registerInIndex` edits a commands index.
- `src/scaffold/write.ts`: the only code that touches the filesystem.
- `src/scaffold/templates.ts`: text imports of `src/templates/*.txt` and the `{{PLACEHOLDER}}` filler, which throws on any unfilled key.
- `src/templates/`: files for generated projects. Values that land inside code are inserted as `*_JSON` placeholders (`JSON.stringify`), so quotes and `${}` in user input can't break the output.

## Rules

- After editing `src/core/cli.ts`, run `bun run sync-core` (or `bun run test`, which does it). The end-to-end bundle test fails if the copy drifts.
- Commands return data and throw `CliError` / `UsageError`. Never `console.log` a result or call `process.exit` in a command.
- New template files need an import in `templates.ts`, an entry in `planProject`, and a test that a generated project still passes `bun test`.
- Keep the generated project's AGENTS.md (`src/templates/AGENTS.md.txt`) in step with any change to the contract.

## Releasing

Update CHANGELOG.md and the version in package.json, push, then `npm publish` (`prepack` builds).
