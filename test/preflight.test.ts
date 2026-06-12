import { afterEach, describe, expect, it } from "vitest";
import { PreflightPipeline, createPreflightContext } from "../src/preflight.js";
import { SessionStore } from "../src/session.js";
import { createTempWorkspace, type TempWorkspace } from "./helpers/temp-workspace.js";
import type { AgentPreset, RunnerConfig } from "../src/contracts.js";

const agentPresets: AgentPreset[] = [
  { name: "coder", systemPrompt: "code", enabledTools: ["read", "edit", "apply_patch", "bash"] },
  { name: "reviewer", systemPrompt: "review", enabledTools: ["read", "bash"] },
];
const runner: RunnerConfig = { maxToolTurns: 8 };
const defaults = { agent: "coder" };

describe("PreflightPipeline", () => {
  let temp: TempWorkspace | undefined;

  afterEach(async () => {
    delete process.env.KEY;
    await temp?.cleanup();
    temp = undefined;
  });

  it("rejects ambiguous session flags", async () => {
    temp = await createTempWorkspace();
    await expect(
      new PreflightPipeline().prepare(
        createPreflightContext({
          request: { prompt: "hi", model: "openai/gpt", continueLast: true, sessionId: "sess_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
          workspaceRoot: temp.root,
          providers: [{ name: "openai", baseURL: "http://local", apiKeyEnv: "KEY" }],
          agentPresets,
          defaults,
          runner,
        }),
      ),
    ).rejects.toThrow("cannot be used together");
  });

  it("resolves a prepared run", async () => {
    temp = await createTempWorkspace();
    process.env.KEY = "secret";
    const prepared = await new PreflightPipeline().prepare(
      createPreflightContext({
        request: { prompt: "hi", model: "openai/gpt" },
        workspaceRoot: temp.root,
        providers: [{ name: "openai", baseURL: "http://local", apiKeyEnv: "KEY" }],
        agentPresets,
        defaults,
        runner,
      }),
    );
    delete process.env.KEY;
    expect(prepared.session.messages).toEqual([]);
    expect(prepared.model).toBe("gpt");
  });

  it("continues the latest session with its stored agent strategy", async () => {
    temp = await createTempWorkspace();
    process.env.KEY = "secret";
    const store = new SessionStore(temp.root);
    const latest = store.create({ agent: "reviewer", provider: "openai", model: "gpt" });
    await store.save(latest, { updateLatest: true });

    const prepared = await new PreflightPipeline().prepare(
      createPreflightContext({
        request: { prompt: "again", continueLast: true },
        workspaceRoot: temp.root,
        providers: [{ name: "openai", baseURL: "http://local", apiKeyEnv: "KEY" }],
        agentPresets,
        defaults,
        runner,
      }),
    );

    expect(prepared.session.id).toBe(latest.id);
    expect(prepared.agent.name).toBe("reviewer");
    expect(prepared.provider).toBe("openai");
    expect(prepared.model).toBe("gpt");
  });

  it("forks a selected session through a wrapping session strategy", async () => {
    temp = await createTempWorkspace();
    process.env.KEY = "secret";
    const store = new SessionStore(temp.root);
    const named = store.create({ agent: "coder", provider: "openai", model: "gpt" });
    named.metadata = { nested: { value: "kept" } };
    named.messages.push({ role: "user", content: "source" });
    await store.save(named, { updateLatest: false });

    const prepared = await new PreflightPipeline().prepare(
      createPreflightContext({
        request: { prompt: "branch", sessionId: named.id, fork: true, agent: "reviewer" },
        workspaceRoot: temp.root,
        providers: [{ name: "openai", baseURL: "http://local", apiKeyEnv: "KEY" }],
        agentPresets,
        defaults,
        runner,
      }),
    );

    expect(prepared.session.id).not.toBe(named.id);
    expect(prepared.session.parentSessionId).toBe(named.id);
    expect(prepared.session.messages).toEqual(named.messages);
    expect(prepared.session.metadata).toEqual(named.metadata);
    expect(prepared.agent.name).toBe("reviewer");
  });
});
