import { AgentEventBus, ConsoleSink, DebugLogSink, TranscriptSink } from "./events.js";
import { Runner } from "./runner.js";
import { SessionStore } from "./session.js";
import { createDefaultTools } from "./tools.js";
import { ToolRegistry } from "./tool-policy.js";

export interface EventBusFactoryOptions {
  workspaceRoot: string;
  debug?: boolean;
  console?: boolean;
}

export function createSessionStore(workspaceRoot: string): SessionStore {
  return new SessionStore(workspaceRoot);
}

export function createToolRegistry(): ToolRegistry {
  return new ToolRegistry(createDefaultTools());
}

export function createRunner(): Runner {
  return new Runner();
}

export function createEventBus(options: EventBusFactoryOptions): AgentEventBus {
  const eventBus = new AgentEventBus();
  if (options.console === true) {
    eventBus.subscribe((event) => new ConsoleSink().handle(event));
  }
  eventBus.subscribe((event) => new TranscriptSink(options.workspaceRoot).handle(event));
  if (options.debug === true) {
    eventBus.subscribe((event) => new DebugLogSink(options.workspaceRoot).handle(event));
  }
  return eventBus;
}
