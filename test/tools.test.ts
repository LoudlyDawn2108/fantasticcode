import { EventEmitter } from "node:events";
import { readFile } from "node:fs/promises";
import { PassThrough } from "node:stream";
import { afterEach, describe, expect, it } from "vitest";
import type { JsonObject, JsonSchema, ToolCommand } from "../src/contracts.js";
import { createDefaultTools, type BashToolOptions, type CommandSpawner, type CommandSpawnOptions } from "../src/tools.js";
import { ToolRegistry, createToolPolicyPipeline } from "../src/tool-policy.js";
import { Workspace } from "../src/workspace.js";
import { createTempWorkspace, type TempWorkspace } from "./helpers/temp-workspace.js";

describe("tools", () => {
  let temp: TempWorkspace | undefined;

  afterEach(async () => {
    await temp?.cleanup();
    temp = undefined;
  });

  it("reads workspace files and rejects traversal", async () => {
    temp = await createTempWorkspace();
    await temp.write("README.md", "one\ntwo\n");
    const pipeline = policy(temp.root);
    const ok = await pipeline.execute({
      call: { id: "1", name: "read", argumentsText: '{"path":"README.md","startLine":2,"endLine":2}' },
      enabledTools: ["read"],
      workspace: new Workspace(temp.root),
    });
    expect(ok.success).toBe(true);
    expect(ok.output).toContain("2: two");
    const denied = await pipeline.execute({
      call: { id: "2", name: "read", argumentsText: '{"path":"../outside.txt"}' },
      enabledTools: ["read"],
      workspace: new Workspace(temp.root),
    });
    expect(denied.success).toBe(false);
    expect(denied.error?.code).toBe("PATH_OUTSIDE_WORKSPACE");
  });

  it("edits exact text atomically", async () => {
    temp = await createTempWorkspace();
    await temp.write("file.txt", "alpha beta");
    const result = await policy(temp.root).execute({
      call: { id: "1", name: "edit", argumentsText: '{"path":"file.txt","oldText":"beta","newText":"gamma"}' },
      enabledTools: ["edit"],
      workspace: new Workspace(temp.root),
    });
    expect(result.success).toBe(true);
    expect(await readFile(temp.path("file.txt"), "utf8")).toBe("alpha gamma");
  });

  it("applies add-file patches", async () => {
    temp = await createTempWorkspace();
    const patch = "*** Begin Patch\n*** Add File: nested/added.txt\n+hello\n*** End Patch";
    const result = await policy(temp.root).execute({
      call: { id: "1", name: "apply_patch", argumentsText: JSON.stringify({ patch }) },
      enabledTools: ["apply_patch"],
      workspace: new Workspace(temp.root),
    });
    expect(result.success).toBe(true);
    expect(await readFile(temp.path("nested", "added.txt"), "utf8")).toContain("hello");
  });

  it("denies destructive bash commands", async () => {
    temp = await createTempWorkspace();
    for (const command of ["rm -r -f .", "sh -c 'rm -rf .'", "echo $(rm -rf .)", "format /q C:", "rd /s ."]) {
      const result = await policy(temp.root).execute({
        call: { id: "1", name: "bash", argumentsText: JSON.stringify({ command }) },
        enabledTools: ["bash"],
        workspace: new Workspace(temp.root),
      });
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DESTRUCTIVE_COMMAND_DENIED");
    }
  });

  it("falls back to cmd.exe when bash cannot spawn on Windows", async () => {
    temp = await createTempWorkspace();
    const fake = fakeSpawner((call, child) => {
      if (call.command === "bash") {
        const error = new Error("spawn bash ENOENT") as NodeJS.ErrnoException;
        error.code = "ENOENT";
        child.emit("error", error);
        return;
      }
      child.stdout.write("fallback ok");
      child.emit("close", 0);
    });

    const result = await policy(temp.root, { spawner: fake.spawner, platform: "win32", comSpec: "cmd.exe" }).execute({
      call: { id: "1", name: "bash", argumentsText: JSON.stringify({ command: "echo fallback" }) },
      enabledTools: ["bash"],
      workspace: new Workspace(temp.root),
    });

    expect(result.success).toBe(true);
    expect(fake.calls.map((call) => call.command)).toEqual(["bash", "cmd.exe"]);
    expect(fake.calls[1]?.args).toEqual(["/d", "/s", "/c", "echo fallback"]);
    expect(result.result).toEqual({ exitCode: 0, stdout: "fallback ok", stderr: "", timedOut: false, truncated: false });
  });

  it("does not fall back when bash starts and exits 127", async () => {
    temp = await createTempWorkspace();
    const fake = fakeSpawner((_call, child) => {
      child.stderr.write("command not found");
      child.emit("close", 127);
    });

    const result = await policy(temp.root, { spawner: fake.spawner, platform: "win32", comSpec: "cmd.exe" }).execute({
      call: { id: "1", name: "bash", argumentsText: JSON.stringify({ command: "missing-command" }) },
      enabledTools: ["bash"],
      workspace: new Workspace(temp.root),
    });

    expect(result.success).toBe(true);
    expect(fake.calls.map((call) => call.command)).toEqual(["bash"]);
    expect(result.result).toEqual({ exitCode: 127, stdout: "", stderr: "command not found", timedOut: false, truncated: false });
  });

  it("turns invalid provider tool JSON into a tool error", async () => {
    temp = await createTempWorkspace();
    const result = await policy(temp.root).execute({
      call: { id: "1", name: "read", argumentsText: "{" },
      enabledTools: ["read"],
      workspace: new Workspace(temp.root),
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_TOOL_ARGUMENTS");
  });

  it("validates boolean object and array schema properties", async () => {
    temp = await createTempWorkspace();
    const registry = new ToolRegistry([new ComplexArgsTool()]);
    const result = await createToolPolicyPipeline(registry).execute({
      call: { id: "1", name: "complex_args", argumentsText: '{"flag":"yes","options":{},"items":[]}' },
      enabledTools: ["complex_args"],
      workspace: new Workspace(temp.root),
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_TOOL_ARGUMENT");
    expect(result.error?.message).toBe("flag must be a boolean");
  });

  it("rejects inherited names as unknown tool arguments", async () => {
    temp = await createTempWorkspace();
    await temp.write("README.md", "hello");
    const result = await policy(temp.root).execute({
      call: { id: "1", name: "read", argumentsText: '{"path":"README.md","toString":1}' },
      enabledTools: ["read"],
      workspace: new Workspace(temp.root),
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNKNOWN_TOOL_ARGUMENT");
  });
});

class ComplexArgsTool implements ToolCommand {
  readonly name = "complex_args";
  readonly description = "Exercise non-string schema types.";
  readonly schema: JsonSchema = {
    type: "object",
    properties: {
      flag: { type: "boolean" },
      options: { type: "object" },
      items: { type: "array" },
    },
    required: ["flag", "options", "items"],
    additionalProperties: false,
  };

  async execute(_ctx: unknown, _input: JsonObject): Promise<unknown> {
    return { ok: true };
  }
}

interface SpawnCall {
  command: string;
  args: string[];
  options: CommandSpawnOptions;
}

class FakeProcess extends EventEmitter {
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();

  kill(_signal: NodeJS.Signals): boolean {
    this.emit("close", null);
    return true;
  }
}

function fakeSpawner(handler: (call: SpawnCall, child: FakeProcess) => void): { spawner: CommandSpawner; calls: SpawnCall[] } {
  const calls: SpawnCall[] = [];
  return {
    calls,
    spawner: {
      spawn(command, args, options) {
        const child = new FakeProcess();
        calls.push({ command, args, options });
        queueMicrotask(() => handler({ command, args, options }, child));
        return child;
      },
    },
  };
}

function policy(root: string, options: BashToolOptions = {}) {
  void root;
  return createToolPolicyPipeline(new ToolRegistry(createDefaultTools(options)));
}
