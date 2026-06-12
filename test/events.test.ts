import { afterEach, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { AgentEventBus, ConsoleSink, TranscriptSink } from "../src/events.js";
import { createTempWorkspace, type TempWorkspace } from "./helpers/temp-workspace.js";

describe("AgentEventBus", () => {
  let temp: TempWorkspace | undefined;

  afterEach(async () => {
    await temp?.cleanup();
    temp = undefined;
  });

  it("publishes events to transcript sinks", async () => {
    temp = await createTempWorkspace();
    const bus = new AgentEventBus();
    const sink = new TranscriptSink(temp.root);
    bus.subscribe((event) => sink.handle(event));
    await bus.publish({ type: "run:started", sessionId: "sess_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
    expect(await readFile(temp.path(".fantasticcode", "transcript.ndjson"), "utf8")).toContain("run:started");
  });

  it("fans out lifecycle events to console observers", async () => {
    const writes: string[] = [];
    const bus = new AgentEventBus();
    const sink = new ConsoleSink((text) => writes.push(text));
    bus.subscribe((event) => sink.handle(event));

    await bus.publish({ type: "run:started", sessionId: "sess_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
    await bus.publish({ type: "run:completed", sessionId: "sess_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", output: "done" });

    expect(writes.join("")).toContain("run started");
    expect(writes.join("")).toContain("sess_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    expect(writes.join("")).toContain("run completed");
  });

  it("isolates observer failures and continues publishing", async () => {
    const errors: string[] = [];
    const seen: string[] = [];
    const bus = new AgentEventBus((error) => {
      errors.push(error instanceof Error ? error.message : String(error));
    });
    bus.subscribe(() => {
      throw new Error("sink failed");
    });
    bus.subscribe((event) => {
      seen.push(event.type);
    });

    await bus.publish({ type: "run:started", sessionId: "sess_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });

    expect(errors).toEqual(["sink failed"]);
    expect(seen).toEqual(["run:started"]);
  });
});
