import type { HarnessSettings, RunRequest, RunResult } from "./contracts.js";
import { createRunner } from "./construction.js";
import { loadRuntimeConfig } from "./config.js";
import { PreflightPipeline, createPreflightContext } from "./preflight.js";

export class AgentHarness {
  constructor(
    settings: HarnessSettings,
    private readonly preflight = new PreflightPipeline(),
    private readonly runner = createRunner(),
  ) {
    this.settings = loadRuntimeConfig({ workspaceRoot: settings.workspaceRoot, overrides: settings });
  }

  private readonly settings: HarnessSettings;

  async run(request: RunRequest): Promise<RunResult> {
    const debug = request.debug ?? this.settings.debug;
    const contextInput = {
      request,
      workspaceRoot: request.workspaceRoot ?? this.settings.workspaceRoot,
      ...(this.settings.providers === undefined ? {} : { providers: this.settings.providers }),
      agentPresets: this.settings.agentPresets ?? [],
      ...(this.settings.defaults === undefined ? {} : { defaults: this.settings.defaults }),
      ...(debug === undefined ? {} : { debug }),
      ...(this.settings.console === undefined ? {} : { console: this.settings.console }),
    };
    const prepared = await this.preflight.prepare(
      createPreflightContext(contextInput),
    );
    return this.runner.run(prepared);
  }
}
