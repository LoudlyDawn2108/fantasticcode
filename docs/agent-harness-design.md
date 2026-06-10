# CLI Agent Harness Design

This document describes a simple command-line agent harness that demonstrates Gang of Four design patterns in a realistic coding-agent architecture. The harness is intentionally not a TUI. It is a normal CLI that accepts flags, calls an OpenAI-compatible provider, executes tools, and persists resumable sessions.

## Goals

- Provide a small but realistic agent harness for learning design patterns.
- Support OpenAI-compatible provider endpoints.
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
fantasticcode --agent coder --model openrouter/anthropic/claude-sonnet-4 --prompt "fix the bug"
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
   +-- AgentRegistry ------- AgentStrategy
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
   +-- AgentEventBus -------- console, transcript, telemetry sinks
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
| `ProviderRegistry` | Resolve `provider/model` into provider config. | Strategy |
| `ProviderFactory` | Create provider adapters from provider config. | Factory Method |
| `ProviderAdapter` | Normalize OpenAI-compatible endpoints or custom SDKs into one internal interface. | Adapter |
| `AgentRegistry` | Select an agent preset by name. | Strategy |
| `SessionStore` | Save, load, continue, and fork session snapshots. | Memento, Prototype |
| `ToolRegistry` | Register and look up executable tools. | Command |
| `PreflightPipeline` | Validate run requests before the runner starts. | Chain of Responsibility |
| `ToolPolicyPipeline` | Validate and authorize tool calls before execution. | Chain of Responsibility |
| `RunnerStateMachine` | Own legal runner lifecycle transitions. | State |
| `AgentEventBus` | Publish run, model, tool, and session events to subscribers. | Observer |
| `Runner` | Drive model calls and tool execution until completion. | Coordinates the state machine, event bus, and registered patterns. |
| `Workspace` | Restrict file and process access to the project workspace. | None directly; it is a safety boundary. |

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

Strategies in this harness:

| Strategy family | Selected by | Examples |
|---|---|---|
| Provider strategy | `--model provider/model` | `openai`, `openrouter`, `local` |
| Agent strategy | `--agent` | `coder`, `reviewer`, `explainer` |
| Session selection strategy | `--continue`, `--session`, new run | latest session, named session, new session |

Provider selection is Strategy because different providers can implement the same internal model interface:

```ts
interface ModelClient {
  complete(request: ModelRequest): Promise<ModelResponse>
}
```

Agent selection is Strategy because different agents can share the runner while changing instructions, enabled tools, and limits:

```ts
type AgentPreset = {
  name: string
  systemPrompt: string
  enabledTools: string[]
  maxToolTurns: number
}
```

Avoid overuse: CLI flags themselves are not strategies. The strategy is the runtime behavior selected by the flag.

### Adapter

Intent: convert one interface into another interface expected by the client.

Providers may expose OpenAI-compatible HTTP endpoints or custom SDKs. The core runner should not depend on provider-specific request types, response types, stream events, SDK clients, or wire-format quirks. Each provider adapter exposes the same internal interface.

```text
Runner
  |
  v
ModelClient interface
  |
  +-- OpenAICompatibleAdapter
  +-- AnthropicSdkAdapter
  +-- GeminiSdkAdapter
  +-- LocalModelAdapter
```

The same pattern can normalize tool schemas and tool results if model providers expect slightly different shapes.

Why it fits:

- The runner has one stable contract.
- Provider quirks stay at the edge.
- OpenAI-compatible and custom-SDK providers can be added without rewriting the runner.

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
- JSON session files make the pattern easy to demonstrate.

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

In this harness, Factory Method is used for construction boundaries that vary by config. The registry resolves names; factories create concrete implementations.

```ts
interface ProviderFactory {
  supports(provider: string): boolean
  create(config: ProviderConfig): ModelClient
}

function createSessionStore(config: Settings): SessionStore
function createToolRegistry(config: Settings): ToolRegistry
function createRunner(config: RunnerConfig): Runner
```

Why it fits:

- Provider creation differs between OpenAI-compatible HTTP endpoints and custom SDKs.
- Tests can replace factories with in-memory implementations.
- Construction stays at the composition boundary instead of spreading through the runner.

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

The runner publishes typed lifecycle events. Subscribers handle console output, transcript writing, debug logs, and future telemetry or streaming.

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
| `ConsoleSink` | Render final output and optional streaming tokens. |
| `TranscriptSink` | Append readable run history. |
| `DebugLogSink` | Write structured debug logs. |
| `TelemetrySink` | Record future metrics or traces. |

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

Use this only for expensive process-wide infrastructure handles, such as a future database connection pool.

Do not use Singleton for settings. Load settings once at CLI startup, treat them as immutable, and pass them explicitly into factories and the harness.

```ts
class DatabaseConnectionManager {
  static getInstance(settings: DatabaseSettings): DatabaseConnectionManager
  getPool(): DatabasePool
  close(): Promise<void>
}
```

Application code should depend on interfaces such as `SessionStore`, not on the singleton connection manager. Current JSON-backed sessions do not need Singleton.

## Provider Design

The model flag uses the format `provider/model`.

```text
openai/gpt-4.1
^^^^^^ ^^^^^^^
provider model
```

OpenAI-compatible provider config should define the endpoint and API key environment variable.

```ts
type ProviderConfig = {
  name: string
  baseURL: string
  apiKeyEnv: string
}
```

Example provider registry:

```ts
const providers = {
  openai: {
    name: "openai",
    baseURL: "https://api.openai.com/v1",
    apiKeyEnv: "OPENAI_API_KEY",
  },
  openrouter: {
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
  },
}
```

The registry chooses config. The adapter normalizes provider API differences. This keeps Strategy and Adapter responsibilities separate.

### Custom SDK Providers

Some providers may require a provider-native SDK instead of an OpenAI-compatible HTTP endpoint. These providers should still normalize into the internal `ModelClient` interface.

```text
Runner
  |
  v
ModelClient
  |
  +-- OpenAI-compatible HTTP adapter
  +-- Custom SDK adapter
        |
        +-- provider SDK client
        +-- request mapper
        +-- response mapper
        +-- stream parser
        +-- capability detector
```

The runner must not depend on SDK-specific clients, request types, response types, stream events, retry APIs, or configuration objects. Provider-specific details stay behind the adapter and factory boundary.

Custom SDK provider responsibilities:

| Responsibility | Where it belongs |
|---|---|
| SDK authentication | Provider adapter or provider factory |
| Request mapping | Provider adapter |
| Response mapping | Provider adapter |
| Streaming quirks | Provider adapter or stream parser |
| Retry policy | Provider adapter or provider factory |
| Token counting | Provider adapter or token counter collaborator |
| Capability detection | Provider adapter or capability detector collaborator |

Simple custom SDK providers can use Factory Method:

```ts
function createAnthropicProvider(config: AnthropicConfig): ModelClient
function createGeminiProvider(config: GeminiConfig): ModelClient
```

Use Abstract Factory only when the provider needs a family of related objects that must be created together:

```ts
interface CustomSdkProviderFactory {
  createClient(): ModelClient
  createStreamParser(): StreamParser
  createTokenCounter(): TokenCounter
  createCapabilityDetector(): CapabilityDetector
}
```

The factory can construct provider-specific collaborators, but the runner should receive only the normalized `ModelClient` and capability metadata.

## Session Design

Store sessions as JSON files under the project-local state directory:

```text
.fantasticcode/
  sessions/
    latest.json
    sess_123.json
    sess_456.json
```

`latest.json` can either contain the latest session ID or be a copy of the latest session. Storing only the ID avoids duplication.

Session operations:

| Operation | Behavior | Pattern |
|---|---|---|
| Create | Start an empty session with a new ID. | Memento |
| Continue latest | Load the ID from `latest.json`, then load that session. | Memento |
| Continue by ID | Load `sessions/<id>.json`. | Memento |
| Fork | Deep-copy the selected session into a new ID. | Prototype |
| Save | Write the updated session atomically. | Memento |

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

This flow keeps the runner deterministic while using the v1 patterns deliberately: Strategy chooses runtime behavior, Adapter normalizes providers, Command executes tools, Memento and Prototype manage sessions, Chain of Responsibility owns validation and policy gates, Observer publishes lifecycle events, and State owns legal runner transitions.

## Pattern Summary

| Pattern | v1 status | Harness location |
|---|---|---|
| Facade | Implemented | `AgentHarness` |
| Strategy | Implemented | provider selection, agent preset, session selection |
| Adapter | Implemented | OpenAI-compatible and custom-SDK provider adapters |
| Command | Implemented | `read`, `edit`, `apply_patch`, `bash`, and future tools |
| Memento | Implemented | session snapshots |
| Prototype | Implemented | `--fork` session cloning |
| Factory Method | Implemented | provider, session store, tool registry, and runner creation |
| Chain of Responsibility | Implemented | `PreflightPipeline` and `ToolPolicyPipeline` |
| Observer | Implemented | `AgentEventBus` and event sinks |
| State | Implemented | `RunnerStateMachine` lifecycle transitions |
| Abstract Factory | Deferred | provider object families |
| Template Method | Deferred | multiple runner algorithms |
| Singleton | Conditional | future database connection manager only |

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
3. Add provider registry, provider factories, and one OpenAI-compatible adapter.
4. Add JSON-backed `SessionStore` with create, continue, load, fork, and save.
5. Add `AgentRegistry` with a default `coder` agent.
6. Add `ToolRegistry` and implement `read`, `edit`, `apply_patch`, and `bash` as commands.
7. Add `PreflightPipeline` and `ToolPolicyPipeline` handlers.
8. Add `AgentEventBus` with console, transcript, and debug log sinks.
9. Add `RunnerStateMachine` with explicit lifecycle states and legal transitions.
10. Add a bounded runner loop with a max tool-turn limit.
11. Persist every run and update `latest.json`.

The result is still small enough for a learning project, but it demonstrates ten concrete GoF patterns used by production-style agent systems.
