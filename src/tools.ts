import { spawn } from "node:child_process";
import { EOL } from "node:os";
import type { JsonObject, JsonSchema, ToolCommand, ToolContext } from "./contracts.js";
import { HarnessError } from "./errors.js";

const MAX_READ_BYTES = 128 * 1024;
const MAX_OUTPUT_BYTES = 64 * 1024;

export class ReadTool implements ToolCommand {
  readonly name = "read";
  readonly description = "Read a UTF-8 text file from the workspace, optionally by line range.";
  readonly schema: JsonSchema = {
    type: "object",
    properties: {
      path: { type: "string", description: "Workspace-relative file path" },
      startLine: { type: "number", minimum: 1 },
      endLine: { type: "number", minimum: 1 },
    },
    required: ["path"],
    additionalProperties: false,
  };

  async execute(ctx: ToolContext, input: JsonObject): Promise<unknown> {
    const path = getString(input, "path");
    const text = await ctx.workspace.readText(path, MAX_READ_BYTES);
    const startLine = getOptionalNumber(input, "startLine");
    const endLine = getOptionalNumber(input, "endLine");
    const lines = text.split(/\r?\n/);
    const first = startLine === undefined ? 1 : startLine;
    const last = endLine === undefined ? lines.length : endLine;
    if (first > last) {
      throw new HarnessError("tool", "INVALID_LINE_RANGE", "startLine must be <= endLine");
    }
    return {
      path,
      startLine: first,
      endLine: last,
      content: lines.slice(first - 1, last).map((line, index) => `${first + index}: ${line}`).join("\n"),
    };
  }
}

export class EditTool implements ToolCommand {
  readonly name = "edit";
  readonly description = "Replace exact text in one workspace file using an atomic write.";
  readonly schema: JsonSchema = {
    type: "object",
    properties: {
      path: { type: "string" },
      oldText: { type: "string" },
      newText: { type: "string" },
    },
    required: ["path", "oldText", "newText"],
    additionalProperties: false,
  };

  async execute(ctx: ToolContext, input: JsonObject): Promise<unknown> {
    const path = getString(input, "path");
    const oldText = getString(input, "oldText");
    const newText = getString(input, "newText");
    const current = await ctx.workspace.readText(path, MAX_READ_BYTES);
    if (!current.includes(oldText)) {
      throw new HarnessError("tool", "EDIT_CONTEXT_MISMATCH", "oldText was not found");
    }
    const next = current.replace(oldText, newText);
    await ctx.workspace.atomicWriteText(path, next);
    return { path, changed: true, bytes: Buffer.byteLength(next, "utf8") };
  }
}

export class ApplyPatchTool implements ToolCommand {
  readonly name = "apply_patch";
  readonly description = "Apply a small stripped-down file patch inside the workspace.";
  readonly schema: JsonSchema = {
    type: "object",
    properties: {
      patch: { type: "string" },
    },
    required: ["patch"],
    additionalProperties: false,
  };

  async execute(ctx: ToolContext, input: JsonObject): Promise<unknown> {
    const patch = getString(input, "patch");
    const operations = parsePatch(patch);
    const changed: string[] = [];
    for (const operation of operations) {
      if (operation.kind === "add") {
        await ctx.workspace.resolveWritablePath(operation.path);
        await ctx.workspace.atomicWriteText(operation.path, operation.content);
        changed.push(operation.path);
        continue;
      }
      if (operation.kind === "delete") {
        throw new HarnessError("tool", "PATCH_DELETE_UNSUPPORTED", "delete patches are not supported in v1");
      }
      const current = await ctx.workspace.readText(operation.path, MAX_READ_BYTES);
      if (!current.includes(operation.oldText)) {
        throw new HarnessError("tool", "PATCH_CONTEXT_MISMATCH", "patch context was not found", {
          path: operation.path,
        });
      }
      await ctx.workspace.atomicWriteText(operation.path, current.replace(operation.oldText, operation.newText));
      changed.push(operation.path);
    }
    return { changedFiles: changed };
  }
}

export class BashTool implements ToolCommand {
  readonly name = "bash";
  readonly description = "Run a bounded bash command in the workspace.";
  readonly schema: JsonSchema = {
    type: "object",
    properties: {
      command: { type: "string" },
      timeoutMs: { type: "number", minimum: 1, maximum: 30000 },
    },
    required: ["command"],
    additionalProperties: false,
  };

  async execute(ctx: ToolContext, input: JsonObject): Promise<unknown> {
    const command = getString(input, "command");
    const timeoutMs = getOptionalNumber(input, "timeoutMs") ?? 10000;
    return runBash(command, ctx.workspace.root, timeoutMs);
  }
}

export function createDefaultTools(): ToolCommand[] {
  return [new ReadTool(), new EditTool(), new ApplyPatchTool(), new BashTool()];
}

function getString(input: JsonObject, key: string): string {
  const value = input[key];
  if (typeof value !== "string") {
    throw new HarnessError("tool", "INVALID_TOOL_ARGUMENT", `${key} must be a string`);
  }
  return value;
}

function getOptionalNumber(input: JsonObject, key: string): number | undefined {
  const value = input[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HarnessError("tool", "INVALID_TOOL_ARGUMENT", `${key} must be a number`);
  }
  return value;
}

type PatchOperation =
  | { kind: "add"; path: string; content: string }
  | { kind: "update"; path: string; oldText: string; newText: string }
  | { kind: "delete"; path: string };

function parsePatch(patch: string): PatchOperation[] {
  const lines = patch.split(/\r?\n/);
  if (lines[0] !== "*** Begin Patch" || !lines.includes("*** End Patch")) {
    throw new HarnessError("tool", "INVALID_PATCH", "patch must use Begin/End Patch envelope");
  }
  const operations: PatchOperation[] = [];
  let index = 1;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line === "*** End Patch") {
      break;
    }
    if (line.startsWith("*** Add File: ")) {
      const path = line.slice("*** Add File: ".length);
      const content: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index]?.startsWith("*** ")) {
        const contentLine = lines[index] ?? "";
        if (!contentLine.startsWith("+")) {
          throw new HarnessError("tool", "INVALID_PATCH", "add file lines must start with +");
        }
        content.push(contentLine.slice(1));
        index += 1;
      }
      operations.push({ kind: "add", path, content: `${content.join(EOL)}${EOL}` });
      continue;
    }
    if (line.startsWith("*** Delete File: ")) {
      operations.push({ kind: "delete", path: line.slice("*** Delete File: ".length) });
      index += 1;
      continue;
    }
    if (line.startsWith("*** Update File: ")) {
      const path = line.slice("*** Update File: ".length);
      const removed: string[] = [];
      const added: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index]?.startsWith("*** ")) {
        const patchLine = lines[index] ?? "";
        if (patchLine.startsWith("@@")) {
          index += 1;
          continue;
        }
        if (patchLine.startsWith("-")) {
          removed.push(patchLine.slice(1));
        } else if (patchLine.startsWith("+")) {
          added.push(patchLine.slice(1));
        }
        index += 1;
      }
      operations.push({ kind: "update", path, oldText: removed.join(EOL), newText: added.join(EOL) });
      continue;
    }
    throw new HarnessError("tool", "INVALID_PATCH", `unsupported patch line: ${line}`);
  }
  return operations;
}

async function runBash(command: string, cwd: string, timeoutMs: number): Promise<unknown> {
  return new Promise((resolve) => {
    const child = spawn("bash", ["-lc", command], {
      cwd,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout: Buffer<ArrayBufferLike> = Buffer.alloc(0);
    let stderr: Buffer<ArrayBufferLike> = Buffer.alloc(0);
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout = cappedConcat(stdout, chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = cappedConcat(stderr, chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ exitCode: 127, stdout: "", stderr: error.message, timedOut: false, truncated: false });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code ?? 1,
        stdout: stdout.toString("utf8"),
        stderr: stderr.toString("utf8"),
        timedOut,
        truncated: stdout.length >= MAX_OUTPUT_BYTES || stderr.length >= MAX_OUTPUT_BYTES,
      });
    });
  });
}

function cappedConcat(existing: Buffer, chunk: Buffer): Buffer {
  if (existing.length >= MAX_OUTPUT_BYTES) {
    return existing;
  }
  return Buffer.concat([existing, chunk]).subarray(0, MAX_OUTPUT_BYTES);
}
