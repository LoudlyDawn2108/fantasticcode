import { describe, expect, it } from "vitest";
import type { RunRequest } from "../src/contracts.js";
import { buildProgram } from "../src/cli.js";

describe("CLI", () => {
  it("builds a RunRequest from flags", async () => {
    let captured: RunRequest | undefined;
    const program = buildProgram(async (request) => {
      captured = request;
      return 0;
    });
    program.exitOverride();
    await program.parseAsync([
      "node",
      "fantasticcode",
      "--model",
      "openai/gpt",
      "--agent",
      "reviewer",
      "--prompt",
      "review",
      "--workspace",
      "D:/repo",
    ]);
    expect(captured).toEqual({
      model: "openai/gpt",
      agent: "reviewer",
      prompt: "review",
      workspaceRoot: "D:/repo",
    });
  });

  it("parses continue/session flags deterministically", async () => {
    let captured: RunRequest | undefined;
    const program = buildProgram(async (request) => {
      captured = request;
      return 0;
    });
    program.exitOverride();
    await program.parseAsync(["node", "fantasticcode", "--continue", "--fork", "--prompt", "again"]);
    expect(captured).toMatchObject({ continueLast: true, fork: true, prompt: "again" });
    expect(captured).not.toHaveProperty("agent");
  });
});
