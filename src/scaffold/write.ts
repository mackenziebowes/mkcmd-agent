import { chmod, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { PlannedFile } from "./project";

export async function isEmptyDir(dir: string): Promise<boolean> {
  if (!existsSync(dir)) return true;
  const entries = await readdir(dir);
  return entries.filter((e) => e !== ".DS_Store" && e !== ".git").length === 0;
}

export async function writeFiles(root: string, files: PlannedFile[]): Promise<void> {
  for (const f of files) {
    const full = join(root, f.path);
    await mkdir(dirname(full), { recursive: true });
    await Bun.write(full, f.content);
    if (f.executable) await chmod(full, 0o755);
  }
}
