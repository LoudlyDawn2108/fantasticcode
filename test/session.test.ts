import { afterEach, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { SessionStore } from "../src/session.js";
import { createTempWorkspace, type TempWorkspace } from "./helpers/temp-workspace.js";

describe("SessionStore", () => {
  let workspace: TempWorkspace | undefined;

  afterEach(async () => {
    await workspace?.cleanup();
    workspace = undefined;
  });

  it("creates, saves, and continues latest sessions", async () => {
    workspace = await createTempWorkspace();
    const store = new SessionStore(workspace.root);
    const session = store.create({ agent: "coder", provider: "openai", model: "gpt" });
    session.messages.push({ role: "user", content: "hello" });
    await store.save(session, { updateLatest: true });
    expect((await store.loadLatest()).id).toBe(session.id);
    expect(existsSync(store.dbPath)).toBe(true);
  });

  it("forks a session with a new id and parent", async () => {
    workspace = await createTempWorkspace();
    const store = new SessionStore(workspace.root);
    const source = store.create({ agent: "coder", provider: "openai", model: "gpt" });
    source.messages.push({ role: "user", content: "base" });
    const fork = store.fork(source);
    expect(fork.id).not.toBe(source.id);
    expect(fork.parentSessionId).toBe(source.id);
    expect(fork.messages).toEqual(source.messages);
  });

  it("lists session summaries newest first without loading message bodies", async () => {
    workspace = await createTempWorkspace();
    const store = new SessionStore(workspace.root);
    const source = store.create({ agent: "coder", provider: "openai", model: "gpt" });
    source.messages.push({ role: "user", content: "base" });
    await store.save(source, { updateLatest: true });

    await pause();
    const fork = store.fork(source);
    fork.messages.push({ role: "assistant", content: "forked" });
    await store.save(fork, { updateLatest: false });

    const summaries = await store.listSummaries();
    expect(summaries.map((summary) => summary.id)).toEqual([fork.id, source.id]);
    expect(summaries[0]).toMatchObject({
      id: fork.id,
      parentSessionId: source.id,
      agent: "coder",
      provider: "openai",
      model: "gpt",
      messageCount: 2,
      isLatest: false,
    });
    expect(summaries[1]).toMatchObject({ id: source.id, messageCount: 1, isLatest: true });
    expect(summaries[0]).not.toHaveProperty("messages");
    expect(summaries[0]).not.toHaveProperty("metadata");
  });

  it("returns an empty summary list for a workspace with no sessions", async () => {
    workspace = await createTempWorkspace();
    await expect(new SessionStore(workspace.root).listSummaries()).resolves.toEqual([]);
  });
});

function pause(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 5));
}
