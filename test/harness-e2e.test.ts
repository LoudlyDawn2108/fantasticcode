import { afterEach, describe, expect, it } from "vitest";
import { AgentHarness } from "../src/harness.js";
import { completion, createStubOpenAIServer, type StubOpenAIServer, toolCall } from "./helpers/stub-openai-server.js";
import { createTempWorkspace, type TempWorkspace } from "./helpers/temp-workspace.js";

describe("AgentHarness E2E", () => {
  let server: StubOpenAIServer | undefined;
  let temp: TempWorkspace | undefined;

  afterEach(async () => {
    await server?.close();
    await temp?.cleanup();
    server = undefined;
    temp = undefined;
  });

  it("runs through provider, read tool, session persistence, and final answer", async () => {
    temp = await createTempWorkspace();
    await temp.write("README.md", "project notes");
    server = await createStubOpenAIServer([toolCall("read", '{"path":"README.md"}'), completion("saw notes")]);
    const harness = new AgentHarness({
      workspaceRoot: temp.root,
      providers: [{ name: "openai", baseURL: server.url, apiKeyEnv: "KEY" }],
    });
    process.env.KEY = "secret";
    const result = await harness.run({ model: "openai/gpt", prompt: "inspect", workspaceRoot: temp.root });
    delete process.env.KEY;
    expect(result.exitCode).toBe(0);
    expect(result.output).toBe("saw notes");
    expect(server.requests.length).toBe(2);
  });
});
