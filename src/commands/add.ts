import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { defineCommand, CliError, UsageError } from "../core/cli";
import { binName, planCommand, registerInIndex } from "../scaffold/project";
import { writeFiles } from "../scaffold/write";

export const add = defineCommand({
  name: "add",
  summary: "Add a command to an existing mkcmd-agent project",
  description: "Writes src/commands/<name>.ts from the command template and registers it in src/commands/index.ts.",
  flags: {
    name: { type: "string", required: true, description: "Command name, e.g. sync or list-users" },
    summary: { type: "string", default: "TODO: describe this command", description: "One line shown in help and describe" },
    dir: { type: "string", default: ".", description: "Project root" },
    force: { type: "boolean", description: "Overwrite the command file if it exists" },
    "dry-run": { type: "boolean", description: "Show what would change without writing" },
  },
  examples: ['mkcmd-agent add --name sync --summary "Sync records from the API" --json'],
  run: async ({ flags, log }) => {
    if (!/^[a-z][a-z0-9-]*$/.test(flags.name) || ["describe", "help"].includes(flags.name)) {
      throw new UsageError(
        `"${flags.name}" is not a valid command name.`,
        "Use lowercase letters, digits and dashes, starting with a letter. describe and help are reserved.",
      );
    }
    const root = resolve(flags.dir);
    const indexPath = join(root, "src/commands/index.ts");
    if (!existsSync(indexPath)) {
      throw new CliError(`No src/commands/index.ts in ${root}.`, {
        code: "not_a_project",
        hint: "Run this from a project made by `mkcmd-agent init`, or pass --dir.",
      });
    }
    const pkgPath = join(root, "package.json");
    const pkgName = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, "utf8")).name : "cli";
    const file = planCommand(binName(pkgName ?? "cli"), flags.name, flags.summary);
    const filePath = join(root, file.path);
    if (existsSync(filePath) && !flags.force) {
      throw new CliError(`${file.path} already exists.`, { code: "command_exists", hint: "Pass --force to overwrite." });
    }
    const updated = registerInIndex(readFileSync(indexPath, "utf8"), flags.name);
    if (updated === null) {
      throw new CliError("Couldn't find `export const commands = [...]` in src/commands/index.ts.", {
        code: "index_unrecognised",
        hint: `Nothing was written. Import ${flags.name} and add it to the commands array by hand.`,
      });
    }
    if (!flags["dry-run"]) {
      await writeFiles(root, [file, { path: "src/commands/index.ts", content: updated }]);
      log(`added ${flags.name}`);
    }
    return {
      command: flags.name,
      dryRun: flags["dry-run"],
      files: [file.path, "src/commands/index.ts"],
      next: [`Implement run() in ${file.path}`, `bun run src/index.ts ${flags.name} --help`],
    };
  },
});
