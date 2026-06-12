import type { AgentEventBus } from "./events.js";
import type { SessionStore } from "./session.js";
import type { ToolPolicyPipeline, ToolRegistry } from "./tool-policy.js";
import type { Workspace } from "./workspace.js";

export type ExitCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ErrorKind =
  | "validation"
  | "config"
  | "provider"
  | "tool"
  | "session"
  | "runner"
  | "unexpected";

export interface RunRequest {
  model?: string;
  prompt: string;
  agent?: string;
  continueLast?: boolean;
  sessionId?: string;
  fork?: boolean;
  workspaceRoot?: string;
  debug?: boolean;
}

export interface RunResult {
  sessionId?: string;
  output: string;
  exitCode: ExitCode;
  error?: SerializableError;
}

export interface SerializableError {
  kind: ErrorKind;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ProviderModel {
  provider: string;
  model: string;
}

export interface ProviderConfig {
  name: string;
  baseURL: string;
  apiKeyEnv: string;
}

export interface ResolvedProvider {
  config: ProviderConfig;
  model: string;
  apiKey: string;
}

export type ModelRole = "system" | "user" | "assistant" | "tool";

export interface ModelToolCall {
  id: string;
  name: string;
  argumentsText: string;
}

export interface ModelMessage {
  role: ModelRole;
  content: string | null;
  toolCalls?: ModelToolCall[];
  toolCallId?: string;
  name?: string;
}

export interface ToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: JsonSchema;
  };
}

export interface ModelRequest {
  model: string;
  messages: ModelMessage[];
  tools: ToolSchema[];
}

export interface ModelUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface ModelResponse {
  text: string;
  toolCalls: ModelToolCall[];
  finishReason: string;
  usage?: ModelUsage;
  raw: unknown;
}

export interface ModelClient {
  complete(request: ModelRequest): Promise<ModelResponse>;
}

export interface AgentPreset {
  name: string;
  systemPrompt: string;
  enabledTools: string[];
  maxToolTurns: number;
}

export type SessionMessage = ModelMessage;

export interface Session {
  version: 1;
  id: string;
  parentSessionId?: string;
  agent: string;
  provider: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages: SessionMessage[];
  metadata: Record<string, unknown>;
}

export interface LatestSessionPointer {
  sessionId: string;
}

export interface ToolContext {
  workspace: Workspace;
}

export interface ToolCommand {
  name: string;
  description: string;
  schema: JsonSchema;
  execute(ctx: ToolContext, input: JsonObject): Promise<unknown>;
}

export interface ToolExecutionRequest {
  call: ModelToolCall;
  enabledTools: string[];
  workspace: Workspace;
}

export interface ToolResultEnvelope {
  toolCallId: string;
  name: string;
  success: boolean;
  output: string;
  result?: unknown;
  error?: SerializableError;
  truncated?: boolean;
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface JsonSchema {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface JsonSchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  minimum?: number;
  maximum?: number;
}

export type RunnerStateName =
  | "initialized"
  | "resolving"
  | "running"
  | "waitingForTool"
  | "persisting"
  | "completed"
  | "failed";

export type AgentEvent =
  | { type: "run:started"; sessionId: string }
  | { type: "model:response"; sessionId: string; finishReason: string }
  | { type: "tool:started"; sessionId: string; name: string }
  | { type: "tool:completed"; sessionId: string; name: string; success: boolean }
  | { type: "session:saved"; sessionId: string }
  | { type: "run:completed"; sessionId: string; output: string }
  | { type: "run:failed"; sessionId?: string; error: SerializableError };

export interface PreparedRun {
  request: RunRequest;
  provider: string;
  model: string;
  modelClient: ModelClient;
  agent: AgentPreset;
  session: Session;
  toolRegistry: ToolRegistry;
  toolPolicy: ToolPolicyPipeline;
  sessionStore: SessionStore;
  eventBus: AgentEventBus;
  workspace: Workspace;
  updateLatest: boolean;
}

export interface HarnessSettings {
  workspaceRoot: string;
  providers?: ProviderConfig[];
  debug?: boolean;
  console?: boolean;
}
