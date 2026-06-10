import type { HarnessSettings, RunRequest, RunResult } from "./contracts.js";
import { createRunner } from "./construction.js";
import { PreflightPipeline, createPreflightContext } from "./preflight.js";

export class AgentHarness {
  constructor(
    private readonly settings: HarnessSettings,
    private readonly preflight = new PreflightPipeline(),
    private readonly runner = createRunner(),
  ) {}

  async run(request: RunRequest): Promise<RunResult> {
    const contextInput = {
      request,
      workspaceRoot: request.workspaceRoot ?? this.settings.workspaceRoot,
      ...(this.settings.providers === undefined ? {} : { providers: this.settings.providers }),
      ...(this.settings.debug === undefined ? {} : { debug: this.settings.debug }),
      ...(this.settings.console === undefined ? {} : { console: this.settings.console }),
    };
    const prepared = await this.preflight.prepare(
      createPreflightContext(contextInput),
    );
    return this.runner.run(prepared);
  }
}
