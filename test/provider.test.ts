import { afterEach, describe, expect, it, vi } from "vitest";
import type { ModelClient } from "../src/contracts.js";
import { OpenAICompatibleAdapter, ProviderFactoryRegistry, ProviderRegistry, type ProviderFactory } from "../src/provider.js";
import { completion, createStubOpenAIServer, type StubOpenAIServer, toolCall } from "./helpers/stub-openai-server.js";

describe("provider", () => {
  let server: StubOpenAIServer | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it("resolves provider config and API key", () => {
    const registry = new ProviderRegistry([{ name: "openai", baseURL: "http://local", apiKeyEnv: "KEY" }]);
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
      supports: (provider) => provider === "custom",
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
    const adapter = new OpenAICompatibleAdapter(server.url, "secret");
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
    const result = await new OpenAICompatibleAdapter(server.url, "secret").complete({
      model: "gpt-test",
      messages: [{ role: "user", content: "hi" }],
      tools: [],
    });
    expect(result.toolCalls).toEqual([{ id: "call_1", name: "read", argumentsText: '{"path":"README.md"}' }]);
  });

  it("rejects malformed provider responses", async () => {
    server = await createStubOpenAIServer([{ choices: [] }]);
    await expect(
      new OpenAICompatibleAdapter(server.url, "secret").complete({ model: "gpt", messages: [], tools: [] }),
    ).rejects.toThrow("missing choices");
  });
});
