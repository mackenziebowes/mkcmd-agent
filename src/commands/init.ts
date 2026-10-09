import { resolve, relative } from "node:path";
import { defineCommand, CliError, UsageError } from "../core/cli";
import { binName, isValidPackageName, planProject } from "../scaffold/project";
import { isEmptyDir, writeFiles } from "../scaffold/write";

export const init = defineCommand({
  name: "init",
  summary: "Scaffold a new agent-ready CLI project",
  description:
    "Writes a Bun + TypeScript CLI with the agent contract built in: --json output, exit codes, describe, per-command help and subprocess tests.",
  flags: {
    name: { type: "string", required: true, description: "Package name, e.g. my-cli or @scope/my-cli", prompt: "Project name?" },
    description: { type: "string", default: "A command-line tool.", description: "One line on what the CLI does" },
    dir: { type: "string", description: "Where to create it (default: ./<name>)" },
    force: { type: "boolean", description: "Write into a non-empty directory, overwriting files" },
    "dry-run": { type: "boolean", description: "List the files without writing anything" },
    install: { type: "boolean", description: "Run `bun install` in the new project" },
  },
  examples: [
    'mkcmd-agent init --name my-cli --description "Does one thing well" --json',
    "mkcmd-agent init --name @acme/tool --dir ./tools/tool --dry-run",
  ],
  run: async ({ flags, log }) => {
    if (!isValidPackageName(flags.name)) {
      throw new UsageError(
        `"${flags.name}" is not a valid package name.`,
        "Use lowercase letters, digits, - . _ and an optional @scope/ prefix.",
      );
    }
    const bin = binName(flags.name);
    const dir = resolve(flags.dir ?? `./${bin}`);
    const files = planProject(flags.name, flags.description);

    if (!flags["dry-run"]) {
      if (!flags.force && !(await isEmptyDir(dir))) {
        throw new CliError(`${dir} already exists and is not empty.`, {
          code: "target_not_empty",
          hint: "Pick another --dir, or pass --force to overwrite.",
        });
      }
      await writeFiles(dir, files);
      log(`wrote ${files.length} files to ${dir}`);
      if (flags.install) {
        log("running bun install");
        const proc = Bun.spawn(["bun", "install"], { cwd: dir, stdout: "ignore", stderr: "pipe" });
        if ((await proc.exited) !== 0) {
          throw new CliError("bun install failed.", {
            code: "install_failed",
            hint: (await new Response(proc.stderr).text()).trim().split("\n").pop(),
          });
        }
      }
    }

    const rel = relative(process.cwd(), dir) || ".";
    return {
      name: flags.name,
      bin,
      dir,
      dryRun: flags["dry-run"],
      files: files.map((f) => f.path),
      next: [
        `cd ${rel}`,
        ...(flags.install ? [] : ["bun install"]),
        "bun run src/index.ts describe",
        "bun test",
      ],
    };
  },
  render: (r) =>
    [
      `${r.dryRun ? "Would create" : "Created"} ${r.name} in ${r.dir}`,
      ...r.files.map((f) => `  ${f}`),
      "",
      "Next:",
      ...r.next.map((n) => `  ${n}`),
    ].join("\n"),
});
