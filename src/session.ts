import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import type { ModelMessage, Session } from "./contracts.js";
import { HarnessError } from "./errors.js";

export interface SaveOptions {
  updateLatest: boolean;
}

export interface SessionSummary {
  id: string;
  parentSessionId?: string;
  agent: string;
  provider: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  isLatest: boolean;
}

interface SessionRow {
  id: string;
  parentSessionId: string | null;
  agent: string;
  provider: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  metadataJson: string;
}

interface SessionMessageRow {
  messageJson: string;
}

interface SessionSummaryRow {
  id: string;
  parentSessionId: string | null;
  agent: string;
  provider: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  isLatest: 0 | 1;
}

const latestScope = "workspace";

export class SessionStore {
  readonly dbPath: string;

  constructor(private readonly workspaceRoot: string) {
    const stateDir = join(workspaceRoot, ".fantasticcode");
    mkdirSync(stateDir, { recursive: true });
    this.dbPath = join(stateDir, "state.sqlite");
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
    validateSessionId(id);
    return this.withDatabase((db) => {
      const row = db.prepare<[string], SessionRow>(`
        SELECT
          id,
          parent_session_id AS parentSessionId,
          agent,
          provider,
          model,
          created_at AS createdAt,
          updated_at AS updatedAt,
          metadata_json AS metadataJson
        FROM sessions
        WHERE id = ?
      `).get(id);
      if (row === undefined) {
        throw new HarnessError("session", "SESSION_READ_FAILED", `session not found: ${id}`, { id });
      }
      const messageRows = db.prepare<[string], SessionMessageRow>(`
        SELECT message_json AS messageJson
        FROM session_messages
        WHERE session_id = ?
        ORDER BY position ASC
      `).all(id);
      const session: Session = {
        version: 1,
        id: row.id,
        ...(row.parentSessionId === null ? {} : { parentSessionId: row.parentSessionId }),
        agent: row.agent,
        provider: row.provider,
        model: row.model,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        messages: messageRows.map((message) => parseJson<ModelMessage>(message.messageJson, "session message")),
        metadata: parseJson<Record<string, unknown>>(row.metadataJson, "session metadata"),
      };
      validateSession(session);
      return session;
    });
  }

  async loadLatest(): Promise<Session> {
    const sessionId = this.withDatabase((db) => {
      const pointer = db.prepare<[string], { sessionId: string }>(`
        SELECT session_id AS sessionId
        FROM latest_sessions
        WHERE scope = ?
      `).get(latestScope);
      if (pointer === undefined || pointer.sessionId === "") {
        throw new HarnessError("session", "INVALID_LATEST_POINTER", "latest session pointer is invalid");
      }
      return pointer.sessionId;
    });
    return this.load(sessionId);
  }

  async listSummaries(): Promise<SessionSummary[]> {
    return this.withDatabase((db) => {
      const rows = db.prepare<{ latestScope: string }, SessionSummaryRow>(`
        SELECT
          s.id,
          s.parent_session_id AS parentSessionId,
          s.agent,
          s.provider,
          s.model,
          s.created_at AS createdAt,
          s.updated_at AS updatedAt,
          COUNT(m.message_json) AS messageCount,
          EXISTS(
            SELECT 1
            FROM latest_sessions l
            WHERE l.scope = @latestScope AND l.session_id = s.id
          ) AS isLatest
        FROM sessions s
        LEFT JOIN session_messages m ON m.session_id = s.id
        GROUP BY s.id
        ORDER BY s.updated_at DESC, s.created_at DESC, s.id DESC
      `).all({ latestScope });
      return rows.map((row) => ({
        id: row.id,
        ...(row.parentSessionId === null ? {} : { parentSessionId: row.parentSessionId }),
        agent: row.agent,
        provider: row.provider,
        model: row.model,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        messageCount: row.messageCount,
        isLatest: row.isLatest === 1,
      }));
    });
  }

  fork(source: Session): Session {
    const now = new Date().toISOString();
    return {
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
  }

  async save(session: Session, options: SaveOptions): Promise<void> {
    validateSession(session);
    const updated: Session = { ...session, updatedAt: new Date().toISOString() };
    Object.assign(session, updated);
    this.withDatabase((db) => {
      const write = db.transaction((value: Session) => {
        db.prepare<SessionRow>(`
          INSERT INTO sessions (
            id,
            parent_session_id,
            agent,
            provider,
            model,
            created_at,
            updated_at,
            metadata_json
          ) VALUES (
            @id,
            @parentSessionId,
            @agent,
            @provider,
            @model,
            @createdAt,
            @updatedAt,
            @metadataJson
          )
          ON CONFLICT(id) DO UPDATE SET
            parent_session_id = excluded.parent_session_id,
            agent = excluded.agent,
            provider = excluded.provider,
            model = excluded.model,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at,
            metadata_json = excluded.metadata_json
        `).run(sessionToRow(value));
        db.prepare<[string]>("DELETE FROM session_messages WHERE session_id = ?").run(value.id);
        const insertMessage = db.prepare<{ sessionId: string; position: number; messageJson: string }>(`
          INSERT INTO session_messages (session_id, position, message_json)
          VALUES (@sessionId, @position, @messageJson)
        `);
        value.messages.forEach((message, position) => {
          insertMessage.run({ sessionId: value.id, position, messageJson: JSON.stringify(message) });
        });
        if (options.updateLatest) {
          db.prepare<{ scope: string; sessionId: string }>(`
            INSERT INTO latest_sessions (scope, session_id)
            VALUES (@scope, @sessionId)
            ON CONFLICT(scope) DO UPDATE SET session_id = excluded.session_id
          `).run({ scope: latestScope, sessionId: value.id });
        }
      });
      write.immediate(session);
    });
  }

  private withDatabase<T>(callback: (db: Database.Database) => T): T {
    const db = new Database(this.dbPath);
    try {
      db.pragma("journal_mode = WAL");
      migrate(db);
      return callback(db);
    } finally {
      db.close();
    }
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
  validateSessionId(session.id);
}

function migrate(db: Database.Database): void {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      parent_session_id TEXT,
      agent TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      metadata_json TEXT NOT NULL,
      FOREIGN KEY(parent_session_id) REFERENCES sessions(id)
    ) STRICT;

    CREATE TABLE IF NOT EXISTS session_messages (
      session_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      message_json TEXT NOT NULL,
      PRIMARY KEY(session_id, position),
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
    ) STRICT;

    CREATE TABLE IF NOT EXISTS latest_sessions (
      scope TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
    ) STRICT;
  `);
  db.prepare<{ name: string; appliedAt: string }>(`
    INSERT OR IGNORE INTO schema_migrations (name, applied_at)
    VALUES (@name, @appliedAt)
  `).run({ name: "001_initial_session_store", appliedAt: new Date().toISOString() });
}

function sessionToRow(session: Session): SessionRow {
  return {
    id: session.id,
    parentSessionId: session.parentSessionId ?? null,
    agent: session.agent,
    provider: session.provider,
    model: session.model,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    metadataJson: JSON.stringify(session.metadata),
  };
}

function validateSessionId(id: string): void {
  if (!/^sess_[a-f0-9]{32}$/.test(id)) {
    throw new HarnessError("session", "INVALID_SESSION_ID", `invalid session id: ${id}`);
  }
}

function parseJson<T>(text: string, label: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HarnessError("session", "INVALID_SESSION_JSON", `invalid ${label} JSON`, { message });
  }
}
