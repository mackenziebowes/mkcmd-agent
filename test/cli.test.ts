import { afterAll, beforeAll, describe as group, expect, test } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
let tmp: string;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "mkcmd-agent-"));
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

async function sh(cmd: string[], cwd = ROOT) {
  const proc = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, stdout, stderr };
}
const cli = (...args: string[]) => sh(["bun", join(ROOT, "src/index.ts"), ...args], tmp);
const json = (s: string) => JSON.parse(s);

test("the core template matches src/core/cli.ts (run `bun run sync-core`)", () => {
  expect(readFileSync(join(ROOT, "src/templates/cli.ts.txt"), "utf8")).toBe(readFileSync(join(ROOT, "src/core/cli.ts"), "utf8"));
});

group("the contract", () => {
  test("describe lists commands, flags and the output contract", async () => {
    const { code, stdout } = await cli("describe");
    expect(code).toBe(0);
    const d = json(stdout);
    expect(d.commands.map((c: { name: string }) => c.name)).toEqual(["init", "add"]);
    expect(d.contract.exitCodes["2"]).toBe("usage error");
    const name = d.commands[0].flags.find((f: { name: string }) => f.name === "--name");
    expect(name.required).toBe(true);
  });

  test("no arguments prints help and exits 2", async () => {
    const { code, stdout } = await cli();
    expect(code).toBe(2);
    expect(stdout).toContain("Commands:");
  });

  test("unknown command is a usage error with a suggestion", async () => {
    const { code, stdout } = await cli("ini", "--json");
    expect(code).toBe(2);
    const r = json(stdout);
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe("usage");
    expect(r.error.hint).toContain("mkcmd-agent init");
  });

  test("unknown flag is a usage error", async () => {
    const { code, stdout } = await cli("init", "--name", "x", "--colour", "red", "--json");
    expect(code).toBe(2);
    expect(json(stdout).error.message).toContain("--colour");
  });

  test("a missing required flag fails fast instead of prompting", async () => {
    const { code, stdout } = await cli("init", "--json");
    expect(code).toBe(2);
    expect(json(stdout).error.message).toBe("Missing required flag: --name.");
  });

  test("per-command help shows flags and examples", async () => {
    const { code, stdout } = await cli("init", "--help");
    expect(code).toBe(0);
    expect(stdout).toContain("--dry-run");
    expect(stdout).toContain("Examples:");
  });

  test("--version reads package.json", async () => {
    const { code, stdout } = await cli("--version", "--json");
    expect(code).toBe(0);
    expect(json(stdout).result.version).toBe(JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version);
  });

  test("logs go to stderr, stdout stays one JSON line", async () => {
    const { stdout, stderr } = await cli("init", "--name", "logcheck", "--json");
    expect(stdout.trim().split("\n")).toHaveLength(1);
    expect(stderr).toContain("wrote");
  });
});

group("init", () => {
  test("--dry-run lists files and writes nothing", async () => {
    const { code, stdout } = await cli("init", "--name", "dry", "--dry-run", "--json");
    expect(code).toBe(0);
    const r = json(stdout).result;
    expect(r.files).toContain("src/core/cli.ts");
    expect(r.dryRun).toBe(true);
    expect(existsSync(join(tmp, "dry"))).toBe(false);
  });

  test("rejects invalid package names", async () => {
    const { code, stdout } = await cli("init", "--name", "My Tool", "--json");
    expect(code).toBe(2);
    expect(json(stdout).error.hint).toContain("lowercase");
  });

  test("refuses a non-empty directory without --force", async () => {
    mkdirSync(join(tmp, "busy"));
    writeFileSync(join(tmp, "busy", "keep.txt"), "mine");
    const { code, stdout } = await cli("init", "--name", "busy", "--json");
    expect(code).toBe(1);
    expect(json(stdout).error.code).toBe("target_not_empty");
    expect(readFileSync(join(tmp, "busy", "keep.txt"), "utf8")).toBe("mine");
  });

  test("handles absolute --dir and scoped names", async () => {
    const dir = join(tmp, "nested", "scoped");
    const { code, stdout } = await cli("init", "--name", "@acme/scoped", "--dir", dir, "--json");
    expect(code).toBe(0);
    expect(json(stdout).result.dir).toBe(dir);
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.bin).toEqual({ scoped: "./src/index.ts" });
  });
});

group("a generated project", () => {
  const description = 'Says "hi" with ${template} and \\backslashes';
  let dir: string;

  beforeAll(async () => {
    const r = await cli("init", "--name", "demo", "--description", description, "--json");
    expect(r.code).toBe(0);
    dir = json(r.stdout).result.dir;
  });

  test("keeps awkward descriptions intact", async () => {
    const { code, stdout } = await sh(["bun", "src/index.ts", "describe"], dir);
    expect(code).toBe(0);
    expect(json(stdout).about).toBe(description);
  });

  test("runs its example command", async () => {
    const { code, stdout } = await sh(["bun", "src/index.ts", "hello", "--name", "Ada", "--shout", "--json"], dir);
    expect(code).toBe(0);
    expect(json(stdout).result.greeting).toBe("HELLO, ADA!");
  });

  test("passes its own test suite", async () => {
    const { code, stderr } = await sh(["bun", "test"], dir);
    expect(stderr).toContain("3 pass");
    expect(code).toBe(0);
  });

  test("add writes and registers a new command", async () => {
    const r = await cli("add", "--name", "sync-users", "--summary", "Sync users", "--dir", dir, "--json");
    expect(r.code).toBe(0);
    const index = readFileSync(join(dir, "src/commands/index.ts"), "utf8");
    expect(index).toContain('import { syncUsers } from "./sync-users";');
    expect(index).toContain("[hello, syncUsers]");

    const d = await sh(["bun", "src/index.ts", "describe"], dir);
    expect(json(d.stdout).commands.map((c: { name: string }) => c.name)).toEqual(["hello", "sync-users"]);

    const run = await sh(["bun", "src/index.ts", "sync-users", "--json"], dir);
    expect(run.code).toBe(1);
    expect(json(run.stdout).error.code).toBe("not_implemented");
  });

  test("add refuses to clobber an existing command", async () => {
    const r = await cli("add", "--name", "hello", "--dir", dir, "--json");
    expect(r.code).toBe(1);
    expect(json(r.stdout).error.code).toBe("command_exists");
  });

  test("add outside a project explains itself", async () => {
    const r = await cli("add", "--name", "x", "--dir", tmp, "--json");
    expect(json(r.stdout).error.code).toBe("not_a_project");
  });
});

group("the bundle", () => {
  test("dist/index.js carries its templates", async () => {
    const build = await sh(["bun", "run", "build"]);
    expect(build.code).toBe(0);
    const out = join(tmp, "from-dist");
    const r = await sh(["bun", join(ROOT, "dist/index.js"), "init", "--name", "fromdist", "--dir", out, "--json"], tmp);
    expect(r.code).toBe(0);
    expect(readFileSync(join(out, "src/core/cli.ts"), "utf8")).toBe(readFileSync(join(ROOT, "src/core/cli.ts"), "utf8"));
  });
});
