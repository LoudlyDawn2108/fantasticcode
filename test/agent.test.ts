import { afterEach, describe, expect, it } from "vitest";
import { AgentConfigAdapter, AgentRegistry } from "../src/agent.js";
import { createTempWorkspace, type TempWorkspace } from "./helpers/temp-workspace.js";

describe("AgentRegistry", () => {
  let workspace: TempWorkspace | undefined;

  afterEach(async () => {
    await workspace?.cleanup();
    workspace = undefined;
  });

  it("resolves injected presets", () => {
    const registry = new AgentRegistry([
      { name: "coder", systemPrompt: "code", enabledTools: ["read", "edit", "apply_patch", "bash"] },
      { name: "reviewer", systemPrompt: "review", enabledTools: ["read", "bash"] },
    ]);
    expect(registry.resolve("coder").enabledTools).toContain("apply_patch");
    expect(registry.resolve("reviewer").enabledTools).toEqual(["read", "bash"]);
  });

  it("rejects unknown presets", () => {
    expect(() => new AgentRegistry([]).resolve("missing")).toThrow("unknown agent");
  });

  it("builds presets from JSON metadata and Markdown prompts", async () => {
    workspace = await createTempWorkspace();
    await workspace.write("agents/coder.md", "Coder prompt");
    await workspace.write("agents/reviewer.md", "Reviewer prompt");
    const presets = new AgentConfigAdapter({ workspaceRoot: workspace.root, promptBaseDir: workspace.path("agents") }).load({
      coder: { promptFile: "agents/coder.md", enabledTools: ["read", "edit"], model: "openai/gpt-4.1" },
      reviewer: { extends: "coder", promptFile: "agents/reviewer.md", enabledTools: ["read"] },
    });
    const registry = new AgentRegistry(presets);
    expect(registry.resolve("coder").systemPrompt).toBe("Coder prompt");
    expect(registry.resolve("reviewer")).toMatchObject({ systemPrompt: "Reviewer prompt", enabledTools: ["read"], model: "openai/gpt-4.1" });
  });
});
