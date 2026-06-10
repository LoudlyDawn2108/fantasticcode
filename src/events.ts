import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { AgentEvent } from "./contracts.js";

export type AgentEventHandler = (event: AgentEvent) => void | Promise<void>;

export interface AgentEventSink {
  handle(event: AgentEvent): void | Promise<void>;
}

export class AgentEventBus {
  private readonly handlers = new Set<AgentEventHandler>();

  subscribe(handler: AgentEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async publish(event: AgentEvent): Promise<void> {
    for (const handler of this.handlers) {
      await handler(event);
    }
  }
}

export class ConsoleSink implements AgentEventSink {
  constructor(private readonly write: (text: string) => void = (text) => process.stderr.write(text)) {}

  handle(event: AgentEvent): void {
    switch (event.type) {
      case "run:started":
        this.write(`run started: ${event.sessionId}\n`);
        return;
      case "tool:started":
        this.write(`tool started: ${event.name}\n`);
        return;
      case "tool:completed":
        this.write(`tool completed: ${event.name} ${event.success ? "ok" : "failed"}\n`);
        return;
      case "session:saved":
        this.write(`session saved: ${event.sessionId}\n`);
        return;
      case "run:completed":
        this.write(`run completed: ${event.sessionId}\n`);
        return;
      case "run:failed":
        this.write(`run failed: ${event.error.message}\n`);
        return;
      case "model:response":
        return;
    }
  }
}

export class TranscriptSink implements AgentEventSink {
  constructor(private readonly workspaceRoot: string) {}

  async handle(event: AgentEvent): Promise<void> {
    const path = join(this.workspaceRoot, ".fantasticcode", "transcript.ndjson");
    await mkdir(dirname(path), { recursive: true });
    await appendFile(path, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`, "utf8");
  }
}

export class DebugLogSink implements AgentEventSink {
  constructor(private readonly workspaceRoot: string) {}

  async handle(event: AgentEvent): Promise<void> {
    const path = join(this.workspaceRoot, ".fantasticcode", "debug.ndjson");
    await mkdir(dirname(path), { recursive: true });
    await appendFile(path, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`, "utf8");
  }
}
