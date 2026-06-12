import { describe, expect, it } from "vitest";
import type { RunRequest } from "../src/contracts.js";
import { buildProgram, formatSessionSummaries } from "../src/cli.js";

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

  it("passes the debug flag through the run request", async () => {
    let captured: RunRequest | undefined;
    const program = buildProgram(async (request) => {
      captured = request;
      return 0;
    });
    program.exitOverride();
    await program.parseAsync(["node", "fantasticcode", "--debug", "--prompt", "trace"]);
    expect(captured).toMatchObject({ debug: true, prompt: "trace" });
  });

  it("lists sessions without invoking the run handler", async () => {
    let capturedWorkspace: string | undefined;
    let runCalled = false;
    const program = buildProgram(
      async () => {
        runCalled = true;
        return 1;
      },
      async (workspaceRoot) => {
        capturedWorkspace = workspaceRoot;
        return 0;
      },
    );
    program.exitOverride();
    await program.parseAsync(["node", "fantasticcode", "--list-sessions", "--workspace", "D:/repo"]);
    expect(capturedWorkspace).toBe("D:/repo");
    expect(runCalled).toBe(false);
  });

  it("rejects run flags when listing sessions", async () => {
    const program = buildProgram(async () => 0, async () => 0);
    program.exitOverride();
    await expect(program.parseAsync(["node", "fantasticcode", "--list-sessions", "--prompt", "run"])).rejects.toThrow(
      "--list-sessions cannot be combined with --prompt",
    );
  });

  it("formats session summaries for display", () => {
    expect(
      formatSessionSummaries([
        {
          id: "sess_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          agent: "coder",
          provider: "openai",
          model: "gpt-4.1",
          createdAt: "2026-06-12T01:00:00.000Z",
          updatedAt: "2026-06-12T02:00:00.000Z",
          messageCount: 3,
          isLatest: true,
        },
      ]),
    ).toBe("* sess_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  2026-06-12T02:00:00.000Z  agent=coder  model=openai/gpt-4.1  messages=3");
    expect(formatSessionSummaries([])).toBe("No sessions found.");
  });
});
