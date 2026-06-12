import { afterEach, describe, expect, it, vi } from "vitest";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages/messages";
import type { ModelClient } from "../src/contracts.js";
import { AnthropicProviderAdapter, OpenAIProviderAdapter, ProviderFactoryRegistry, ProviderRegistry, type ProviderFactory } from "../src/provider.js";
import { completion, createStubOpenAIServer, type StubOpenAIServer, toolCall } from "./helpers/stub-openai-server.js";

describe("provider", () => {
  let server: StubOpenAIServer | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it("resolves provider config and API key", () => {
    const registry = new ProviderRegistry([{ name: "openai", sdk: "openai", baseURL: "http://local", apiKeyEnv: "KEY" }]);
    expect(registry.resolve("openai/gpt", { KEY: "secret" }).model).toBe("gpt");
    expect(() => registry.resolve("openai/gpt", {})).toThrow("missing API key");
  });

  it("delegates model client creation to the matching provider factory", () => {
    const client: ModelClient = {
      async complete() {
        return { text: "", toolCalls: [], finishReason: "stop", raw: {} };
      },
    };
    const create = vi.fn(() => client);
    const factory: ProviderFactory = {
      supports: (config) => config.name === "custom",
      create,
    };
    const resolved = {
      config: { name: "custom", baseURL: "http://local", apiKeyEnv: "KEY" },
      model: "gpt",
      apiKey: "secret",
    };

    expect(new ProviderFactoryRegistry([factory]).create(resolved)).toBe(client);
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith(resolved);
  });

  it("posts OpenAI-compatible chat completions", async () => {
    server = await createStubOpenAIServer([completion("hello")]);
    const adapter = new OpenAIProviderAdapter({ baseURL: server.url, apiKey: "secret" });
    const result = await adapter.complete({
      model: "gpt-test",
      messages: [{ role: "user", content: "hi" }],
      tools: [],
    });
    expect(result.text).toBe("hello");
    expect(server.requests[0]?.authorization).toBe("Bearer secret");
  });

  it("normalizes tool calls", async () => {
    server = await createStubOpenAIServer([toolCall("read", '{"path":"README.md"}')]);
    const result = await new OpenAIProviderAdapter({ baseURL: server.url, apiKey: "secret" }).complete({
      model: "gpt-test",
      messages: [{ role: "user", content: "hi" }],
      tools: [],
    });
    expect(result.toolCalls).toEqual([{ id: "call_1", name: "read", argumentsText: '{"path":"README.md"}' }]);
  });

  it("rejects malformed provider responses", async () => {
    server = await createStubOpenAIServer([{ choices: [] }]);
    await expect(
      new OpenAIProviderAdapter({ baseURL: server.url, apiKey: "secret" }).complete({ model: "gpt", messages: [], tools: [] }),
    ).rejects.toThrow("missing choices");
  });

  it("maps Anthropic system prompts, tool use, and tool results", async () => {
    let captured: MessageCreateParamsNonStreaming | undefined;
    const client = {
      messages: {
        async create(params: MessageCreateParamsNonStreaming): Promise<Message> {
          captured = params;
          return anthropicMessage();
        },
      },
    };

    const result = await new AnthropicProviderAdapter({ baseURL: "http://local", apiKey: "secret", maxTokens: 200 }, client).complete({
      model: "claude-test",
      messages: [
        { role: "system", content: "follow rules" },
        { role: "assistant", content: null, toolCalls: [{ id: "toolu_1", name: "read", argumentsText: '{"path":"README.md"}' }] },
        { role: "tool", toolCallId: "toolu_1", name: "read", content: "project notes" },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "read",
            description: "Read a file",
            parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"], additionalProperties: false },
          },
        },
      ],
    });

    expect(captured?.system).toBe("follow rules");
    expect(captured?.max_tokens).toBe(200);
    expect(captured?.messages).toEqual([
      { role: "assistant", content: [{ type: "tool_use", id: "toolu_1", name: "read", input: { path: "README.md" } }] },
      { role: "user", content: [{ type: "tool_result", tool_use_id: "toolu_1", content: "project notes" }] },
    ]);
    expect(result.text).toBe("using tool");
    expect(result.toolCalls).toEqual([{ id: "toolu_2", name: "bash", argumentsText: '{"command":"pwd"}' }]);
    expect(result.usage).toEqual({ promptTokens: 3, completionTokens: 5, totalTokens: 8 });
  });
});

function anthropicMessage(): Message {
  return {
    id: "msg_1",
    type: "message",
    role: "assistant",
    model: "claude-test",
    container: null,
    stop_details: null,
    stop_reason: "tool_use",
    stop_sequence: null,
    content: [
      { type: "text", text: "using tool", citations: null },
      { type: "tool_use", id: "toolu_2", name: "bash", input: { command: "pwd" }, caller: { type: "direct" } },
    ],
    usage: {
      cache_creation: null,
      cache_creation_input_tokens: null,
      cache_read_input_tokens: null,
      inference_geo: null,
      input_tokens: 3,
      output_tokens: 5,
      output_tokens_details: null,
      server_tool_use: null,
      service_tier: null,
    },
  };
}
