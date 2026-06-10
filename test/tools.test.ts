import { afterEach, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { createDefaultTools } from "../src/tools.js";
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
    const result = await policy(temp.root).execute({
      call: { id: "1", name: "bash", argumentsText: '{"command":"rm -rf ."}' },
      enabledTools: ["bash"],
      workspace: new Workspace(temp.root),
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("DESTRUCTIVE_COMMAND_DENIED");
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
});

function policy(root: string) {
  void root;
  return createToolPolicyPipeline(new ToolRegistry(createDefaultTools()));
}
