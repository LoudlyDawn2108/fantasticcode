import { afterEach, describe, expect, it } from "vitest";
import type { ModelClient } from "../src/contracts.js";
import { AgentRegistry } from "../src/agent.js";
import { AgentEventBus } from "../src/events.js";
import { Runner } from "../src/runner.js";
import { SessionStore } from "../src/session.js";
import { createDefaultTools } from "../src/tools.js";
import { ToolRegistry, createToolPolicyPipeline } from "../src/tool-policy.js";
import { Workspace } from "../src/workspace.js";
import { createTempWorkspace, type TempWorkspace } from "./helpers/temp-workspace.js";

describe("Runner", () => {
  let temp: TempWorkspace | undefined;

  afterEach(async () => {
    await temp?.cleanup();
    temp = undefined;
  });

  it("persists final assistant output", async () => {
    temp = await createTempWorkspace();
    const store = new SessionStore(temp.root);
    const tools = new ToolRegistry(createDefaultTools());
    const client: ModelClient = {
      async complete() {
        return { text: "done", toolCalls: [], finishReason: "stop", raw: {} };
      },
    };
    const result = await new Runner().run({
      request: { model: "openai/gpt", prompt: "hi" },
      provider: "openai",
      model: "gpt",
      modelClient: client,
      agent: new AgentRegistry().resolve("coder"),
      session: store.create({ agent: "coder", provider: "openai", model: "gpt" }),
      toolRegistry: tools,
      toolPolicy: createToolPolicyPipeline(tools),
      sessionStore: store,
      eventBus: new AgentEventBus(),
      workspace: new Workspace(temp.root),
      updateLatest: true,
    });
    expect(result.output).toBe("done");
    expect((await store.loadLatest()).messages.at(-1)).toEqual({ role: "assistant", content: "done" });
  });

  it("executes tool calls and continues to final text", async () => {
    temp = await createTempWorkspace();
    await temp.write("README.md", "hello");
    const store = new SessionStore(temp.root);
    const tools = new ToolRegistry(createDefaultTools());
    let calls = 0;
    const client: ModelClient = {
      async complete() {
        calls += 1;
        if (calls === 1) {
          return {
            text: "",
            finishReason: "tool_calls",
            raw: {},
            toolCalls: [{ id: "call_1", name: "read", argumentsText: '{"path":"README.md"}' }],
          };
        }
        return { text: "read complete", toolCalls: [], finishReason: "stop", raw: {} };
      },
    };
    const result = await new Runner().run({
      request: { model: "openai/gpt", prompt: "inspect" },
      provider: "openai",
      model: "gpt",
      modelClient: client,
      agent: new AgentRegistry().resolve("coder"),
      session: store.create({ agent: "coder", provider: "openai", model: "gpt" }),
      toolRegistry: tools,
      toolPolicy: createToolPolicyPipeline(tools),
      sessionStore: store,
      eventBus: new AgentEventBus(),
      workspace: new Workspace(temp.root),
      updateLatest: true,
    });
    expect(result.output).toBe("read complete");
    expect((await store.loadLatest()).messages.some((message) => message.role === "tool")).toBe(true);
  });
});
