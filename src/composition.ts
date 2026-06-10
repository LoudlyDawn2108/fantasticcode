import { cwd } from "node:process";
import type { HarnessSettings } from "./contracts.js";
import { AgentHarness } from "./harness.js";
export { createEventBus, createRunner, createSessionStore, createToolRegistry } from "./construction.js";

export function createDefaultHarness(settings: Partial<HarnessSettings> = {}): AgentHarness {
  return new AgentHarness({
    workspaceRoot: settings.workspaceRoot ?? cwd(),
    ...(settings.providers === undefined ? {} : { providers: settings.providers }),
    ...(settings.debug === undefined ? {} : { debug: settings.debug }),
    ...(settings.console === undefined ? {} : { console: settings.console }),
  });
}
