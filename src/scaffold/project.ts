import { templates, fill } from "./templates";

export type PlannedFile = { path: string; content: string; executable?: boolean };

const NAME_RE = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function isValidPackageName(name: string): boolean {
  return NAME_RE.test(name) && name.length <= 214;
}

/** The command people type: the package name without its scope. */
export function binName(name: string): string {
  return name.split("/").pop()!;
}

/** Every file a new project gets, as data. Writing is a separate step. */
export function planProject(name: string, about: string): PlannedFile[] {
  const bin = binName(name);
  const vars = {
    NAME: bin,
    ABOUT: about,
    NAME_JSON: JSON.stringify(bin),
    ABOUT_JSON: JSON.stringify(about),
    HELLO_EXAMPLE_JSON: JSON.stringify(`${bin} hello --name Ada --json`),
  };
  const pkg = {
    name,
    version: "0.1.0",
    description: about,
    type: "module",
    private: true,
    bin: { [bin]: "./src/index.ts" },
    scripts: {
      start: "bun run src/index.ts",
      test: "bun test",
      typecheck: "tsc --noEmit",
      build: `bun build --compile --outfile=dist/${bin} src/index.ts`,
    },
    devDependencies: { "@types/bun": "latest", typescript: "^5" },
  };
  return [
    { path: "package.json", content: JSON.stringify(pkg, null, 2) + "\n" },
    { path: "tsconfig.json", content: templates.tsconfigJson },
    { path: ".gitignore", content: templates.gitignore },
    { path: "README.md", content: fill(templates.readmeMd, vars) },
    { path: "AGENTS.md", content: fill(templates.agentsMd, vars) },
    { path: "src/index.ts", content: fill(templates.indexTs, vars), executable: true },
    { path: "src/core/cli.ts", content: templates.coreCli },
    { path: "src/commands/index.ts", content: templates.commandsIndexTs },
    { path: "src/commands/hello.ts", content: fill(templates.helloTs, vars) },
    { path: "test/cli.test.ts", content: templates.cliTestTs },
  ];
}

/** "make-thing" -> "makeThing", safe as a JS identifier. */
export function toIdentifier(name: string): string {
  const id = name.replace(/[-_.]+([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  return /^[0-9]/.test(id) ? `cmd${id}` : id;
}

export function planCommand(bin: string, name: string, summary: string): PlannedFile {
  return {
    path: `src/commands/${name}.ts`,
    content: fill(templates.commandTs, {
      IDENT: toIdentifier(name),
      CMD_JSON: JSON.stringify(name),
      SUMMARY_JSON: JSON.stringify(summary),
      EXAMPLE_JSON: JSON.stringify(`${bin} ${name} --json`),
    }),
  };
}

/**
 * Adds `import { ident } from "./name";` and appends ident to the
 * `export const commands = [...]` array. Returns null if the array isn't found.
 */
export function registerInIndex(source: string, name: string): string | null {
  const ident = toIdentifier(name);
  const arrayRe = /export const commands(\s*:[^=]+)?\s*=\s*\[([\s\S]*?)\]/;
  const m = arrayRe.exec(source);
  if (!m) return null;
  const items = m[2]!.split(",").map((s) => s.trim()).filter(Boolean);
  if (items.includes(ident)) return source;
  const withArray = source.replace(arrayRe, (_all, type = "") => `export const commands${type} = [${[...items, ident].join(", ")}]`);
  const importLine = `import { ${ident} } from "./${name}";`;
  const lines = withArray.split("\n");
  let lastImport = -1;
  lines.forEach((l, i) => {
    if (/^import\s/.test(l)) lastImport = i;
  });
  lines.splice(lastImport + 1, 0, importLine);
  return lines.join("\n");
}
