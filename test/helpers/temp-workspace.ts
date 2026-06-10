import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

export interface TempWorkspace {
  root: string;
  path(...segments: string[]): string;
  write(relativePath: string, content: string | Buffer): Promise<void>;
  cleanup(): Promise<void>;
}

export async function createTempWorkspace(): Promise<TempWorkspace> {
  const root = await mkdtemp(join(tmpdir(), "fantasticcode-"));
  return {
    root,
    path(...segments: string[]) {
      return join(root, ...segments);
    },
    async write(relativePath: string, content: string | Buffer) {
      const target = join(root, relativePath);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, content);
    },
    async cleanup() {
      await rm(root, { recursive: true, force: true });
    },
  };
}
