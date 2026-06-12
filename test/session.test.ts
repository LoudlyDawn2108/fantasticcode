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
});
