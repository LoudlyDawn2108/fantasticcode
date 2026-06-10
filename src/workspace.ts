import { mkdir, readFile, realpath, rename, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, parse, relative, resolve } from "node:path";
import { HarnessError } from "./errors.js";

export class Workspace {
  private realRootPromise: Promise<string> | undefined;

  constructor(readonly root: string) {
    this.root = resolve(root);
  }

  async resolveExistingPath(inputPath: string): Promise<string> {
    const candidate = this.resolveCandidate(inputPath);
    const realCandidate = await realpath(candidate);
    await this.assertInside(realCandidate);
    return realCandidate;
  }

  async resolveWritablePath(inputPath: string): Promise<string> {
    const candidate = this.resolveCandidate(inputPath);
    const parent = dirname(candidate);
    await this.assertInside(await this.nearestExistingAncestor(parent));
    try {
      await this.assertInside(await realpath(candidate));
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }
    }
    return candidate;
  }

  async readText(inputPath: string, maxBytes: number): Promise<string> {
    const path = await this.resolveExistingPath(inputPath);
    const info = await stat(path);
    if (!info.isFile()) {
      throw new HarnessError("tool", "NOT_A_FILE", `path is not a file: ${inputPath}`);
    }
    if (info.size > maxBytes) {
      throw new HarnessError("tool", "FILE_TOO_LARGE", `file exceeds ${maxBytes} bytes`, { path: inputPath });
    }
    const buffer = await readFile(path);
    if (looksBinary(buffer)) {
      throw new HarnessError("tool", "BINARY_FILE", `refusing to read binary file: ${inputPath}`);
    }
    return buffer.toString("utf8");
  }

  async atomicWriteText(inputPath: string, content: string): Promise<void> {
    const path = await this.resolveWritablePath(inputPath);
    await mkdir(dirname(path), { recursive: true });
    const tempPath = `${path}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, content, "utf8");
    await rename(tempPath, path);
  }

  private resolveCandidate(inputPath: string): string {
    if (inputPath.trim() === "") {
      throw new HarnessError("tool", "EMPTY_PATH", "path must not be empty");
    }
    const candidate = isAbsolute(inputPath) ? resolve(inputPath) : resolve(this.root, inputPath);
    const rel = relative(this.root, candidate);
    if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) {
      return candidate;
    }
    throw new HarnessError("tool", "PATH_OUTSIDE_WORKSPACE", `path escapes workspace: ${inputPath}`);
  }

  private async assertInside(candidate: string): Promise<void> {
    const root = await this.realRoot();
    const rel = relative(root, candidate);
    if (rel !== "" && (rel.startsWith("..") || isAbsolute(rel))) {
      throw new HarnessError("tool", "PATH_OUTSIDE_WORKSPACE", `path escapes workspace: ${candidate}`);
    }
  }

  private realRoot(): Promise<string> {
    this.realRootPromise ??= realpath(this.root);
    return this.realRootPromise;
  }

  private async nearestExistingAncestor(path: string): Promise<string> {
    let current = path;
    const root = parse(path).root;
    while (current !== root) {
      try {
        return await realpath(current);
      } catch (error) {
        if (!isNotFound(error)) {
          throw error;
        }
        current = dirname(current);
      }
    }
    return realpath(root);
  }
}

function looksBinary(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
  return sample.includes(0);
}

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
