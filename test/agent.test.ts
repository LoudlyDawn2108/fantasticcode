import { describe, expect, it } from "vitest";
import { AgentRegistry } from "../src/agent.js";

describe("AgentRegistry", () => {
  it("resolves coder and reviewer presets", () => {
    const registry = new AgentRegistry();
    expect(registry.resolve("coder").enabledTools).toContain("apply_patch");
    expect(registry.resolve("reviewer").enabledTools).toEqual(["read", "bash"]);
  });

  it("rejects unknown presets", () => {
    expect(() => new AgentRegistry().resolve("missing")).toThrow("unknown agent");
  });
});
