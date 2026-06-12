# CLI Agent Harness Design

This document describes a simple command-line agent harness that demonstrates Gang of Four design patterns in a realistic coding-agent architecture. The harness is intentionally not a TUI. It is a normal CLI that accepts flags, calls SDK-backed provider adapters, executes tools, and persists resumable sessions in SQLite.

## Goals

- Provide a small but realistic agent harness for learning design patterns.
- Support official SDK-backed providers, starting with OpenAI and Anthropic.
- Keep the CLI argument-based and scriptable.
- Support resumable and forkable sessions.
- Expose a small set of coding tools: `read`, `edit`, `apply_patch`, and `bash`.
- Implement at least ten GoF patterns with concrete responsibilities.
- Keep deferred patterns explicit so the design does not become pattern theatre.

## CLI Shape

The initial CLI is a single command with flags:

```bash
fantasticcode --model openai/gpt-4.1 --prompt "inspect this repo"
fantasticcode --continue --prompt "continue the last task"
fantasticcode --session sess_123 --prompt "resume this session"
fantasticcode --session sess_123 --fork --prompt "try another approach"
fantasticcode --agent coder --model anthropic/claude-sonnet-4 --prompt "fix the bug"
```

Supported flags:

| Flag | Meaning |
|---|---|
| `-m, --model <provider/model>` | Model selector. The provider is the text before the first `/`; the model is the rest. |
| `-c, --continue` | Continue the latest session in the current workspace. |
| `-s, --session <id>` | Continue a specific session by ID. |
| `--fork` | Clone the selected session into a new session before adding the prompt. |
| `--prompt <text>` | User prompt to run. If omitted, the CLI may read piped stdin. |
| `--agent <name>` | Agent preset to use, such as `coder` or `reviewer`. |
| `--debug` | Write structured debug events for the run. |

Session flag rules:

| Combination | Result |
|---|---|
| No `--continue` and no `--session` | Start a new session. |
| `--continue` | Load the latest session. |
| `--session <id>` | Load the named session. |
| `--fork` with `--continue` or `--session` | Clone the loaded session to a new session ID, then run the prompt. |
| `--continue` with `--session` | Error, because the source session is ambiguous. |
| `--fork` without `--continue` or `--session` | Error, because there is no source session to clone. |

## High-Level Architecture

```text
CLI args
   |
   v
AgentHarness facade
   |
   +-- ProviderRegistry ---- ProviderFactory ---- ProviderAdapter ---- provider implementation
   |
   +-- AgentRegistry ------- agent preset selector
   |
   +-- SessionStore -------- Session mementos
   |
   +-- ToolRegistry -------- Tool commands
   |                            |
   |                            +-- read
   |                            +-- edit
   |                            +-- apply_patch
   |                            +-- bash
   |
   +-- PreflightPipeline ---- request and policy handlers
   |
   +-- RunnerStateMachine --- runner lifecycle states
   |
   +-- AgentEventBus -------- console, transcript, debug sinks
   |
   v
Runner loop
   |
   +-- send messages to model
   +-- execute requested tools
   +-- append tool results
   +-- persist updated session
   +-- return final answer
```

## Core Modules

| Module | Responsibility | Primary GoF pattern |
|---|---|---|
| `cli` | Parse flags and build a run request. | None directly; flags are configuration inputs. |
| `AgentHarness` | Coordinate provider, session, agent, tools, and runner. | Facade |
| `ProviderRegistry` | Resolve `provider/model` into provider config. | Runtime selector/registry |
| `ProviderFactory` | Create provider adapters from provider config. | Factory Method-style boundary |
| `ProviderAdapter` | Normalize provider SDKs into one internal interface. | Adapter |
| `AgentRegistry` | Select an agent preset by name. | Runtime selector/registry |
| `SessionStore` | Save, load, load latest, and fork SQLite-backed session snapshots. | Memento, Prototype |
| `ToolRegistry` | Register and look up executable tools. | Command |
| `PreflightPipeline` | Validate run requests before the runner starts. | Chain of Responsibility |
| `ToolPolicyPipeline` | Validate and authorize tool calls before execution. | Chain of Responsibility |
| `RunnerStateMachine` | Own legal runner lifecycle transitions. | State |
| `AgentEventBus` | Publish run, model, tool, and session events to subscribers. | Observer |
| `Runner` | Drive model calls and tool execution until completion. | Coordinates the state machine, event bus, and registered patterns. |
| `Workspace` | Restrict file paths and file operations to the project workspace; process risk is handled by tool policy. | None directly; it is a safety boundary. |

## Composition Root / Dependency Injection

The CLI entrypoint is the composition root. It loads JSON config once at startup, applies CLI overrides, validates and normalizes the result, creates infrastructure, then injects concrete dependencies into `AgentHarness`.

```ts
const config = loadRuntimeConfig()

const providerRegistry = createProviderRegistry(config.providers)
const providerFactory = createProviderFactory(config.providers)
const sessionStore = createSQLiteSessionStore(config.persistence)
const agentRegistry = createAgentRegistry(config.agents)
const toolRegistry = createToolRegistry(config.tools)
const eventBus = createAgentEventBus(config.events)
const runnerStateMachine = createRunnerStateMachine()

const runner = createRunner({
  providerRegistry,
  providerFactory,
  sessionStore,
  toolRegistry,
  eventBus,
  runnerStateMachine,
})

const harness = createAgentHarness({
  config,
  agentRegistry,
  runner,
})
```

Injected dependencies:

| Dependency | Injected into | Why |
|---|---|---|
| `RuntimeConfig` | factories, harness | Immutable settings and defaults. |
| `ProviderRegistry` | runner or provider resolver | Provider/model lookup. |
| `ProviderFactory` | runner or provider resolver | SDK adapter creation. |
| `SessionStore` | runner | SQLite-backed persistence behind an interface. |
| `AgentRegistry` | harness | Agent preset selection. |
| `ToolRegistry` | runner and tool pipeline | Tool command lookup. |
| `PreflightPipeline` | harness or runner | Request validation and setup. |
| `ToolPolicyPipeline` | runner | Tool authorization and sandbox checks. |
| `AgentEventBus` | runner | Lifecycle event publication. |
| `RunnerStateMachine` | runner | Legal lifecycle transitions. |

Rules:

- Components must not read config files, CLI flags, or global configuration directly.
- Components receive immutable, already-resolved values or interfaces.
- Long-lived collaborators are created at startup, not during normal execution.
- Tests can replace registries, stores, factories, and tools with in-memory fakes.
- Dependency injection is not counted as a GoF pattern; it is the wiring discipline that keeps the GoF pattern boundaries visible.
- Do not use Singleton for config or settings. If Singleton appears later, restrict it to rare process-wide infrastructure handles.

## Implemented GoF Patterns (v1)

The v1 design commits to these ten GoF patterns. Each pattern owns a concrete responsibility in the harness; it is not just a label for a normal helper function.

### Facade

Intent: provide one simple interface over a set of subsystems.

In this harness, `AgentHarness` is the Facade. The CLI should not know how sessions are stored, how providers are called, how tools are executed, or how the runner loop works. It should pass a request to the facade and receive a result.

```ts
type RunRequest = {
  model: string
  prompt: string
  agent?: string
  continueLast?: boolean
  sessionId?: string
  fork?: boolean
}

interface AgentHarness {
  run(request: RunRequest): Promise<RunResult>
}
```

Why it fits:

- The CLI remains small and scriptable.
- Internals can change without changing user-facing flags.
- The main flow is easy to explain in a design-pattern demo.

Avoid overuse: do not put all logic inside `AgentHarness`. It should coordinate specialized modules, not replace them.

### Strategy

Intent: define a family of interchangeable behaviors and select one at runtime.

The full GoF Strategy in this harness is session selection. Provider and agent resolution are runtime selectors/registries that support configurable behavior, but they are not counted as full Strategy objects.

| Runtime choice | Selected by | Examples |
|---|---|---|
| Session selection strategy | `--continue`, `--session`, new run, `--fork` | latest session, named session, new session, forked session |
| Provider selector/registry | `--model provider/model` | `openai`, `anthropic`, `openrouter`, future SDK providers |
| Agent selector/registry | `--agent` | `coder`, `reviewer`, future presets |

Provider selection stays separate from Strategy because the registry resolves config, while provider adapters implement the internal model interface:

```ts
interface ModelClient {
  complete(request: ModelRequest): Promise<ModelResponse>
}
```

Agent selection is also a registry lookup. Agent presets share the runner while changing instructions, enabled tools, and optional model overrides:

```ts
type AgentPreset = {
  name: string
  systemPrompt: string
  enabledTools: string[]
  model?: string
}
```

Agent metadata comes from JSON config, while the prompt body comes from Markdown. Runtime execution limits belong to `RunnerConfig`, not agent config.

Avoid overuse: CLI flags themselves are not strategies. In v1, the Strategy claim is strongest for session selection; provider and agent are runtime selectors.

### Adapter

Intent: convert one interface into another interface expected by the client.

Providers expose different SDK clients and response shapes. The core runner should not depend on provider-specific request types, response types, stream events, SDK clients, or wire-format quirks. Each provider adapter exposes the same internal interface.

```text
Runner
  |
  v
ModelClient interface
  |
  +-- OpenAIProviderAdapter
  +-- AnthropicProviderAdapter
  +-- FutureSdkProviderAdapter
```

The same pattern can normalize tool schemas and tool results if model providers expect slightly different shapes.

Why it fits:

- The runner has one stable contract.
- Provider quirks stay at the edge.
- New SDK providers can be added without rewriting the runner.

Avoid overuse: do not leak provider-specific fields, SDK objects, or streaming chunk shapes into the internal message model. If provider-specific fields are needed, keep them in adapter config.

### Command

Intent: encapsulate a request as an object so it can be validated, logged, queued, retried, or executed uniformly.

Each agentic tool is a Command. The model requests a tool call; the harness validates the arguments; the command executes; the result is appended to the session.

```ts
interface ToolCommand<Input, Output> {
  name: string
  description: string
  schema: unknown
  execute(ctx: ToolContext, input: Input): Promise<Output>
}
```

Initial commands:

| Command | Responsibility | Safety boundary |
|---|---|---|
| `read` | Read a file from the workspace. | Path sandbox, file size limit. |
| `edit` | Apply a narrow exact replacement to one file. | Path sandbox, atomic write. |
| `apply_patch` | Apply a structured patch across files. | Patch validation, path sandbox. |
| `bash` | Run a shell command. | Timeout, cwd sandbox, output cap, denylist. |

Why it fits:

- All tools share one execution pipeline.
- Tool calls can be recorded in the session transcript.
- Safety checks and logging can wrap every command consistently.

Avoid overuse: not every helper function should become a Command. Use this pattern for model-callable actions with validation and observable results.

### Memento

Intent: capture and restore an object's state without exposing its internal representation.

Sessions are Mementos. A session snapshot stores enough state to continue the conversation later without exposing the runner's private implementation details.

```ts
type Session = {
  id: string
  parentSessionId?: string
  agent: string
  provider: string
  model: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}
```

`--continue` restores the latest session memento. `--session <id>` restores a specific session memento.

Why it fits:

- Session continuation is explicit and inspectable.
- The runner can evolve without changing the CLI contract.
- SQLite rows make the memento durable, queryable, and inspectable.

Avoid overuse: store serializable conversation state, not live runtime objects such as sockets, processes, or file handles.

### Prototype

Intent: create a new object by copying an existing one.

`--fork` uses Prototype. It clones a session snapshot, assigns a new session ID, records the original as `parentSessionId`, and then appends the new prompt to the cloned session.

```text
sess_123
   |
   | --fork
   v
sess_456 parentSessionId=sess_123
```

Why it fits:

- The user can explore alternate approaches from the same context.
- Forked sessions preserve lineage.
- The feature is simple to explain and test.

Avoid overuse: define clone boundaries clearly. Clone message state and metadata, not transient runtime resources.

### Factory Method

Intent: let subclasses or provider-specific factories decide which concrete object to create while callers depend on interfaces.

In this harness, Factory Method-style construction is used at the provider boundary. The registry resolves names; provider-specific factories create concrete `ModelClient` implementations.

```ts
interface ProviderFactory {
  supports(provider: string): boolean
  create(config: ProviderConfig): ModelClient
}

```

Why it fits:

- Provider creation differs between official SDK clients and future SDK providers.
- Tests can replace factories with in-memory implementations.
- Provider construction stays at the composition boundary instead of spreading through the runner.

Avoid overuse: a single `switch` hidden inside a helper is a simple factory, not a meaningful Factory Method. Count this pattern only where provider-specific factories create interface implementations.

### Chain of Responsibility

Intent: pass a request through a chain of handlers where each handler can process, transform, short-circuit, or delegate.

The harness uses two short chains: one for run preflight and one for tool execution policy. Each handler has one responsibility and can stop the run with a structured error.

```ts
interface Handler<Input, Output> {
  handle(input: Input, next: (input: Input) => Promise<Output>): Promise<Output>
}
```

Run preflight chain:

```text
RunRequest
  -> validate flags and prompt
  -> resolve provider and model
  -> resolve agent preset
  -> load, create, or fork session
  -> authorize enabled tools
  -> build RunnerInput
```

Tool policy chain:

```text
ToolCall
  -> lookup ToolCommand
  -> validate schema
  -> enforce workspace sandbox
  -> enforce risk policy
  -> execute command
  -> normalize result
```

Why it fits:

- Policy order is explicit and testable.
- Risky tools such as `bash` can short-circuit before execution.
- New policy handlers can be inserted without changing the runner or tool commands.

Avoid overuse: a plain list of function calls is just a pipeline. This pattern is used only when handlers share an interface and can delegate or stop the chain.

### Observer

Intent: let multiple subscribers react to object events without coupling the event source to the subscribers.

The runner publishes typed lifecycle events. Subscribers handle console output, transcript writing, and debug logs; telemetry or streaming can be added later as extra observers.

```ts
type AgentEvent =
  | { type: "run:started"; sessionId: string }
  | { type: "model:token"; text: string }
  | { type: "tool:started"; name: string }
  | { type: "tool:completed"; name: string }
  | { type: "session:saved"; sessionId: string }
  | { type: "run:completed"; sessionId: string }
  | { type: "run:failed"; sessionId: string; error: string }
```

Event subscribers:

| Subscriber | Responsibility |
|---|---|
| `ConsoleSink` | Render run progress to stderr without mixing with final stdout. |
| `TranscriptSink` | Append structured run history. |
| `DebugLogSink` | Write structured debug logs. |
| Future telemetry sink | Record future metrics or traces if v2 needs it. |

Why it fits:

- The runner does not need direct knowledge of every output destination.
- Logging and transcripts can be added without changing model/tool execution.
- Future streaming support can reuse the same event stream.

Avoid overuse: observers must not mutate core runner or session state. They perform side effects only.

### State

Intent: let an object alter behavior when its internal state changes by representing states explicitly.

The runner uses State for lifecycle control. States own legal transitions and state-specific behavior; this is more than a lifecycle enum.

```ts
interface RunnerState {
  name: RunnerStateName
  onEnter(ctx: RunnerContext): Promise<void>
  next(ctx: RunnerContext): Promise<RunnerState>
}
```

Runner states:

| State | Responsibility | Valid next states |
|---|---|---|
| `initialized` | Start from validated input. | `resolving` |
| `resolving` | Resolve session, provider, agent, and tools. | `running`, `failed` |
| `running` | Send messages to the model. | `waitingForTool`, `persisting`, `failed` |
| `waitingForTool` | Execute requested tool commands. | `running`, `failed` |
| `persisting` | Save session and update latest pointer. | `completed`, `failed` |
| `completed` | Return final assistant output. | none |
| `failed` | Return or persist structured error details. | none |

Why it fits:

- The runner has real lifecycle transitions, not just a long loop.
- Failure and persistence behavior become explicit.
- Tests can assert legal and illegal transitions.

Avoid overuse: do not count State if implementation is only a string enum plus `switch`. State behavior must live behind state-specific objects or handlers.

## Deferred / Conditional Patterns

These GoF patterns are intentionally not counted in the v1 total. Add them only when the matching complexity exists.

### Abstract Factory

Use this only when a provider needs a family of related objects, such as a model client, streaming parser, token counter, and capability detector.

```ts
interface ProviderFactory {
  createClient(): ModelClient
  createStreamParser(): StreamParser
  createCapabilityDetector(): CapabilityDetector
}
```

Avoid using Abstract Factory just because there are multiple providers. A simple registry plus factory function is clearer for the first version.

### Template Method

Use this if there are multiple runner variants that share the same algorithm but customize steps.

```text
load session
build prompt
call model
execute tools
persist session
render result
```

For the first version, plain composition in `Runner` is likely simpler. Introduce Template Method only if `coder`, `reviewer`, or future agents need distinct runner algorithms.

### Singleton

Use this only for expensive process-wide infrastructure handles, such as a future shared connection manager for a long-lived process.

Do not use Singleton for settings. Load settings once at CLI startup, treat them as immutable, and pass them explicitly into factories and the harness.

```ts
class DatabaseConnectionManager {
  static getInstance(settings: DatabaseSettings): DatabaseConnectionManager
  getPool(): DatabasePool
  close(): Promise<void>
}
```

Application code should depend on interfaces such as `SessionStore`, not on the singleton connection manager. The v1 SQLite store should own its connection lifecycle internally; that does not require a public Singleton pattern.

## Provider Design

The model flag uses the format `provider/model`.

```text
openai/gpt-4.1
^^^^^^ ^^^^^^^
provider model
```

Provider config should be user-editable JSON. The harness loads JSON once at CLI startup, validates it, normalizes it, and passes the resolved config into `ProviderRegistry` and `ProviderFactory`. Provider adapters should receive concrete values such as `baseUrl`, `apiKey`, and `model`; they should not read global configuration directly.

Use two JSON files by default:

| File | Purpose | Commit? |
|---|---|---|
| `agent-harness.config.json` | Shareable provider, model, base URL, and default settings. | Yes |
| `agent-harness.local.json` | API keys and private per-user overrides. | No |

The same schema can also support a single personal JSON file, but API keys should not be committed to the repository.

```ts
type HarnessConfig = {
  version: 1
  defaults?: {
    model?: string
    provider?: string
    agent?: string
  }
  providers: Record<string, ProviderConfig>
  agents?: Record<string, AgentConfig>
}

type ProviderConfig = {
  sdk: "openai" | "anthropic"
  baseUrl?: string
  apiKey?: string
  defaultModel?: string
  models?: Record<string, ModelConfig>
}

type ModelConfig = {
  id?: string
  displayName?: string
  capabilities?: {
    tools?: boolean
    vision?: boolean
    jsonMode?: boolean
    maxInputTokens?: number
  }
}

type AgentConfig = {
  description?: string
  extends?: string
  promptFile: string
  enabledTools: string[]
  model?: string
}
```

Example `agent-harness.config.json`:

```json
{
  "version": 1,
  "defaults": {
    "model": "openai/gpt-4.1",
    "agent": "coder"
  },
  "providers": {
    "openai": {
      "sdk": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "defaultModel": "gpt-4.1",
      "models": {
        "gpt-4.1": {
          "capabilities": {
            "tools": true,
            "vision": true,
            "jsonMode": true
          }
        },
        "gpt-4.1-mini": {
          "capabilities": {
            "tools": true,
            "jsonMode": true
          }
        }
      }
    },
    "anthropic": {
      "sdk": "anthropic",
      "baseUrl": "https://api.anthropic.com",
      "defaultModel": "claude-sonnet-4",
      "models": {
        "claude-sonnet-4": {
          "capabilities": {
            "tools": true,
            "vision": true
          }
        }
      }
    }
  },
  "agents": {
    "coder": {
      "description": "Default coding agent",
      "promptFile": "./agents/coder.md",
      "enabledTools": ["read", "edit", "apply_patch", "bash"],
      "model": "openai/gpt-4.1"
    },
    "reviewer": {
      "extends": "coder",
      "description": "Code review agent",
      "promptFile": "./agents/reviewer.md",
      "enabledTools": ["read", "bash"],
      "model": "anthropic/claude-sonnet-4"
    }
  }
}
```

Example `agent-harness.local.json`:

```json
{
  "version": 1,
  "providers": {
    "openai": {
      "apiKey": "sk-..."
    },
    "anthropic": {
      "apiKey": "sk-ant-..."
    }
  }
}
```

Configuration loading order:

```text
built-in defaults
  -> agent-harness.config.json
  -> agent-harness.local.json
  -> CLI flags
```

The loader deep-merges provider entries by provider ID, then validates the final shape before the run starts.

Validation rules:

| Rule | Failure |
|---|---|
| `providers` must be a non-empty object. | No provider can be selected. |
| Each provider must define `sdk`. | Factory cannot choose an adapter. |
| Each provider should define `baseUrl` unless the SDK has a safe built-in default. | Adapter cannot construct a client predictably. |
| Each provider should define at least one model or a `defaultModel`. | Model resolution is ambiguous. |
| Auth-required providers must have `apiKey` after config merge. | Adapter cannot authenticate. |
| Each configured agent must define `promptFile` and `enabledTools`. | Agent preset cannot be built. |
| Agent `promptFile` paths must stay inside the workspace or configured agent directory. | Prompt loading could escape the project boundary. |

Model resolution rules:

| Input | Resolution |
|---|---|
| `--model provider/model` | Use that provider and model. |
| No CLI model + `defaults.model` | Use the configured `provider/model`. |
| No CLI model + `defaults.provider` | Use that provider's `defaultModel`. |
| Unqualified model name | Error; require `provider/model` to avoid ambiguity. |

Example normalized provider registry after loading JSON:

```ts
const providers = {
  openai: {
    sdk: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "sk-...",
    defaultModel: "gpt-4.1",
    models: {
      "gpt-4.1": { id: "gpt-4.1", capabilities: { tools: true } },
    },
  },
  anthropic: {
    sdk: "anthropic",
    baseUrl: "https://api.anthropic.com",
    apiKey: "sk-ant-...",
    defaultModel: "claude-sonnet-4",
    models: {
      "claude-sonnet-4": { id: "claude-sonnet-4", capabilities: { tools: true } },
    },
  },
}
```

The config loader parses and validates JSON. The registry resolves provider and model names. The factory creates the correct SDK adapter from concrete config values. The adapter normalizes provider API differences. This keeps configuration loading, Strategy, Factory Method, and Adapter responsibilities separate.

## Agent Design

Agents are configured with JSON metadata and Markdown prompt files. JSON owns structure and validation. Markdown owns human-editable prompt content.

```text
agent-harness.config.json
  -> agents.coder metadata
  -> ./agents/coder.md prompt body
  -> AgentConfigAdapter
  -> AgentPreset
  -> AgentRegistry
```

Example `agents/coder.md`:

```md
# Coder Agent

You are a careful coding agent. Inspect the workspace before editing, prefer small patches, and verify changes before reporting completion.
```

Agent config fields:

| Field | Purpose |
|---|---|
| `description` | Human-readable explanation for help output. |
| `extends` | Optional base agent to clone before applying overrides. |
| `promptFile` | Markdown file containing the system prompt. |
| `enabledTools` | Tool command names available to the agent. |
| `model` | Optional model override in `provider/model` format. |

Pattern mapping:

| Pattern | Agent responsibility |
|---|---|
| Strategy | `--agent` selects different validated `AgentPreset` behavior. |
| Adapter | `AgentConfigAdapter` converts JSON metadata plus Markdown into internal `AgentPreset`. |
| Factory Method | `createAgentRegistry(config.agents)` builds the registry from validated presets. |
| Prototype | `extends` clones a base agent preset and applies overrides. |

Rules:

- `AgentRegistry` selects already-built presets; it does not parse JSON or Markdown.
- `AgentConfigAdapter` loads prompt Markdown and normalizes config into `AgentPreset`.
- Agent config must not include runner execution limits. Tool-turn limits belong in `RunnerConfig`.
- Prototype is used only when `extends` is present; otherwise agent configs are direct presets.

### SDK Provider Adapters

The v1 providers use official SDKs directly: OpenAI SDK and Anthropic SDK. Both providers normalize into the internal `ModelClient` interface so the runner remains provider-agnostic.

```text
Runner
  |
  v
ModelClient
  |
  +-- OpenAIProviderAdapter
  |     +-- official OpenAI SDK client
  |     +-- request mapper
  |     +-- response mapper
  |     +-- stream parser
  |     +-- error mapper
  |     +-- capability metadata
  |
  +-- AnthropicProviderAdapter
        +-- official Anthropic SDK client
        +-- request mapper
        +-- response mapper
        +-- stream parser
        +-- error mapper
        +-- capability metadata
```

The runner must not depend on SDK-specific clients, request types, response types, stream events, retry APIs, or configuration objects. Provider-specific details stay behind the adapter and factory boundary.

SDK provider responsibilities:

| Responsibility | Where it belongs |
|---|---|
| SDK authentication | Provider adapter or provider factory |
| Request mapping | Provider adapter |
| Response mapping | Provider adapter |
| Streaming quirks | Provider adapter or stream parser |
| Error mapping | Provider adapter |
| Retry policy | Provider adapter or provider factory |
| Token counting | Provider adapter or token counter collaborator |
| Capability detection | Provider adapter or capability detector collaborator |

Simple SDK providers can use Factory Method:

```ts
function createOpenAIProvider(config: OpenAIConfig): ModelClient
function createAnthropicProvider(config: AnthropicConfig): ModelClient
function createGeminiProvider(config: GeminiConfig): ModelClient
```

Use Abstract Factory only when the provider needs a family of related objects that must be created together:

```ts
interface CustomSdkProviderFactory {
  createClient(): ModelClient
  createStreamParser(): StreamParser
  createErrorMapper(): ErrorMapper
  createTokenCounter(): TokenCounter
  createCapabilityDetector(): CapabilityDetector
}
```

The factory can construct provider-specific collaborators, but the runner should receive only the normalized `ModelClient` and capability metadata.

## Session Design

Store sessions in a project-local SQLite database behind the `SessionStore` interface:

```text
.fantasticcode/
  state.sqlite
```

The runner should never depend on SQL directly. `SQLiteSessionStore` owns schema migrations, transactions, serialization, and latest-session lookup.

Initial tables:

| Table | Purpose |
|---|---|
| `sessions` | Session metadata: ID, parent ID, provider, model, agent, timestamps. |
| `session_messages` | Ordered user, assistant, and tool-result messages. |
| `tool_calls` | Normalized tool call records and results for audit/debugging. |
| `session_events` | Optional event log emitted by `AgentEventBus`. |
| `latest_sessions` | Workspace-scoped pointer to the last successfully saved session. |
| `schema_migrations` | Applied migration IDs and timestamps. |

Persistence operations that modify multiple tables should run in one transaction. `save`, `fork`, and `updateLatest` should either all succeed or all roll back.

Session operations:

| Operation | Behavior | Pattern |
|---|---|---|
| Create | Insert a new session row with initial metadata. | Memento |
| Continue latest | Read the workspace latest pointer, then load that session. | Memento |
| Continue by ID | Load session metadata and ordered messages by ID. | Memento |
| Fork | Clone metadata and messages into a new session ID with `parent_session_id`. | Prototype |
| Save | Persist messages, tool calls, events, and latest pointer atomically. | Memento |

## Tool Design

The tool registry exposes model-callable commands. All tools pass through the tool policy chain before execution so validation, authorization, sandboxing, and result normalization stay outside the runner.

```text
model tool call
   |
   v
ToolRegistry lookup
   |
   v
ToolPolicyPipeline handlers
   |
   +-- validate schema
   +-- enforce workspace sandbox
   +-- enforce risk policy
   +-- execute ToolCommand
   +-- normalize result
   |
   v
append normalized tool result to session
```

Recommended tool boundaries:

| Tool | Input | Output |
|---|---|---|
| `read` | path, optional line range | file content or structured error |
| `edit` | path, exact old text, new text | changed file summary |
| `apply_patch` | patch text | changed file summary |
| `bash` | command, timeout | exit code, stdout, stderr |

The `bash` tool should have the strictest policy:

- Run only inside the workspace.
- Use a timeout.
- Cap output size.
- Reject obviously destructive commands.
- Record command, exit code, and output in the session.

## Runner Flow

```text
1. Parse CLI args into RunRequest.
2. Run PreflightPipeline handlers.
3. Enter RunnerStateMachine at initialized.
4. Move through resolving to load provider, agent, tools, and session.
5. Emit run:started.
6. Move to running and send messages plus enabled tool schemas to the model.
7. Emit model:token events while output streams.
8. If the model requests tools, move to waitingForTool.
9. Execute ToolCommand objects through ToolPolicyPipeline.
10. Emit tool lifecycle events and append normalized tool results.
11. Repeat running/waitingForTool until final assistant text or max tool turns.
12. Move to persisting, save the session, update latest, and emit session:saved.
13. Move to completed or failed and return the final result.
```

This flow keeps the runner deterministic while using the v1 patterns deliberately: Strategy owns session selection, runtime registries select provider/agent configuration, Adapter normalizes providers, Command executes tools, Memento and Prototype manage sessions, Chain of Responsibility owns validation and policy gates, Observer publishes lifecycle events, and State owns legal runner transitions.

## Pattern Summary

| Pattern | v1 status | Harness location |
|---|---|---|
| Facade | Implemented | `AgentHarness` |
| Strategy | Implemented | session selection |
| Adapter | Implemented | OpenAI and Anthropic SDK provider adapters normalizing into `ModelClient` |
| Command | Implemented | `read`, `edit`, `apply_patch`, `bash`, and future tools |
| Memento | Implemented | session snapshots |
| Prototype | Implemented | `--fork` session cloning |
| Factory Method | Implemented | provider factory boundary |
| Chain of Responsibility | Implemented | `PreflightPipeline` and `ToolPolicyPipeline` |
| Observer | Implemented | `AgentEventBus` and event sinks |
| State | Implemented | `RunnerStateMachine` lifecycle transitions |
| Abstract Factory | Deferred | provider object families |
| Template Method | Deferred | multiple runner algorithms |
| Singleton | Conditional | future shared connection manager only; not required by v1 SQLite storage |

## Patterns Intentionally Not Forced

- Do not call every CLI flag a design pattern.
- Do not add Abstract Factory unless providers need families of related objects.
- Do not turn every helper into a Command.
- Do not count State if it is only an enum plus a `switch`.
- Do not use Singleton for mutable settings or service lookup.
- Do not make `AgentHarness` a god object. It should coordinate specialized modules.

## Minimal First Implementation Plan

1. Create the CLI parser and `RunRequest` type.
2. Create `AgentHarness.run(request)` as the facade.
3. Add JSON config loading, merging, validation, and normalization for `agent-harness.config.json` and `agent-harness.local.json`.
4. Add the CLI composition root that wires and injects all runtime dependencies.
5. Add provider registry, provider factories, `OpenAIProviderAdapter`, and `AnthropicProviderAdapter`.
6. Add SQLite-backed `SessionStore` with create, continue, load, fork, save, migrations, and transactions.
7. Add JSON+Markdown agent config loading with `AgentConfigAdapter`, `AgentRegistry`, and a default `coder` agent.
8. Add `ToolRegistry` and implement `read`, `edit`, `apply_patch`, and `bash` as commands.
9. Add `PreflightPipeline` and `ToolPolicyPipeline` handlers.
10. Add `AgentEventBus` with console, transcript, and debug log sinks.
11. Add `RunnerStateMachine` with explicit lifecycle states and legal transitions.
12. Add a bounded runner loop with a max tool-turn limit.
13. Persist every run and update the DB-backed latest-session pointer.

The result is still small enough for a learning project, but it demonstrates ten concrete GoF patterns used by production-style agent systems.
