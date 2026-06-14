import { afterEach, describe, expect, it } from "vitest";
import { loadRuntimeConfig } from "../src/config.js";
import { createTempWorkspace, type TempWorkspace } from "./helpers/temp-workspace.js";

describe("runtime config", () => {
  let workspace: TempWorkspace | undefined;

  afterEach(async () => {
    await workspace?.cleanup();
    workspace = undefined;
  });

  it("loads providers and agents from JSON plus Markdown", async () => {
    workspace = await createTempWorkspace();
    await workspace.write("agents/coder.md", "Project coder prompt");
    await workspace.write(
      "agent-harness.config.json",
      JSON.stringify(
        {
          version: 1,
          defaults: { model: "local/main", agent: "coder" },
          providers: {
            local: {
              sdk: "openai",
              baseUrl: "http://localhost/v1",
              apiKey: "secret",
              defaultModel: "main",
              models: { main: { id: "actual-main" } },
            },
          },
          agents: {
            coder: { promptFile: "agents/coder.md", enabledTools: ["read", "bash"] },
          },
        },
        null,
        2,
      ),
    );

    const settings = loadRuntimeConfig({ workspaceRoot: workspace.root });
    expect(settings.defaults?.model).toBe("local/main");
    expect(settings.providers?.find((provider) => provider.name === "local")).toMatchObject({ baseURL: "http://localhost/v1", apiKey: "secret" });
    expect(settings.agentPresets?.find((agent) => agent.name === "coder")).toMatchObject({ systemPrompt: "Project coder prompt", enabledTools: ["read", "bash"] });
  });

  it("merges local provider secrets over shared config", async () => {
    workspace = await createTempWorkspace();
    await workspace.write(
      "agent-harness.config.json",
      JSON.stringify({ version: 1, providers: { openai: { baseUrl: "http://shared", apiKeyEnv: "OPENAI_API_KEY" } } }),
    );
    await workspace.write("agent-harness.local.json", JSON.stringify({ version: 1, providers: { openai: { apiKey: "local-secret" } } }));

    const settings = loadRuntimeConfig({ workspaceRoot: workspace.root });
    expect(settings.providers?.find((provider) => provider.name === "openai")).toMatchObject({ baseURL: "http://shared", apiKey: "local-secret" });
  });
});
