import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { LatestSessionPointer, ModelMessage, Session } from "./contracts.js";
import { HarnessError } from "./errors.js";

export interface SaveOptions {
  updateLatest: boolean;
}

export class SessionStore {
  readonly sessionsDir: string;
  readonly latestPath: string;

  constructor(private readonly workspaceRoot: string) {
    this.sessionsDir = join(workspaceRoot, ".fantasticcode", "sessions");
    this.latestPath = join(this.sessionsDir, "latest.json");
  }

  create(input: { agent: string; provider: string; model: string }): Session {
    const now = new Date().toISOString();
    return {
      version: 1,
      id: `sess_${randomUUID().replaceAll("-", "")}`,
      agent: input.agent,
      provider: input.provider,
      model: input.model,
      createdAt: now,
      updatedAt: now,
      messages: [],
      metadata: {},
    };
  }

  async load(id: string): Promise<Session> {
    const session = await this.readJson<Session>(this.sessionPath(id));
    validateSession(session);
    return session;
  }

  async loadLatest(): Promise<Session> {
    const pointer = await this.readJson<LatestSessionPointer>(this.latestPath);
    if (typeof pointer.sessionId !== "string" || pointer.sessionId === "") {
      throw new HarnessError("session", "INVALID_LATEST_POINTER", "latest session pointer is invalid");
    }
    return this.load(pointer.sessionId);
  }

  fork(source: Session): Session {
    const now = new Date().toISOString();
    const copy: Session = {
      version: 1,
      id: `sess_${randomUUID().replaceAll("-", "")}`,
      parentSessionId: source.id,
      agent: source.agent,
      provider: source.provider,
      model: source.model,
      createdAt: now,
      updatedAt: now,
      messages: structuredClone(source.messages) as ModelMessage[],
      metadata: structuredClone(source.metadata) as Record<string, unknown>,
    };
    return copy;
  }

  async save(session: Session, options: SaveOptions): Promise<void> {
    validateSession(session);
    const updated: Session = { ...session, updatedAt: new Date().toISOString() };
    Object.assign(session, updated);
    await this.writeJsonAtomic(this.sessionPath(session.id), session);
    if (options.updateLatest) {
      await this.writeJsonAtomic(this.latestPath, { sessionId: session.id });
    }
  }

  sessionPath(id: string): string {
    if (!/^sess_[a-f0-9]{32}$/.test(id)) {
      throw new HarnessError("session", "INVALID_SESSION_ID", `invalid session id: ${id}`);
    }
    return join(this.sessionsDir, `${id}.json`);
  }

  private async readJson<T>(path: string): Promise<T> {
    try {
      return JSON.parse(await readFile(path, "utf8")) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new HarnessError("session", "INVALID_SESSION_JSON", `invalid session JSON at ${path}`);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new HarnessError("session", "SESSION_READ_FAILED", message, { path });
    }
  }

  private async writeJsonAtomic(path: string, value: unknown): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    const tempPath = `${path}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(tempPath, path);
  }
}

export function validateSession(value: unknown): asserts value is Session {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HarnessError("session", "INVALID_SESSION", "session must be an object");
  }
  const session = value as Record<string, unknown>;
  if (
    session.version !== 1 ||
    typeof session.id !== "string" ||
    typeof session.agent !== "string" ||
    typeof session.provider !== "string" ||
    typeof session.model !== "string" ||
    typeof session.createdAt !== "string" ||
    typeof session.updatedAt !== "string" ||
    !Array.isArray(session.messages)
  ) {
    throw new HarnessError("session", "INVALID_SESSION", "session schema is invalid");
  }
}
