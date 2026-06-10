# Agent Harness Implementation Plan

## TL;DR

Implement the greenfield `fantasticcode` TypeScript/Node.js npm CLI described in `docs/agent-harness-design.md`: a scriptable, non-TUI coding-agent harness with OpenAI-compatible provider calls, resumable/forkable sessions, safe workspace tools, an explicit runner state machine, and concrete GoF pattern responsibilities.

- **Deliverables**: npm package scaffold, CLI parser/bin, core contracts, preflight/config pipeline, OpenAI-compatible model adapter, JSON session store, agent presets, workspace-safe tools, event bus, runner loop, automated tests, and packaging QA.
- **Estimated effort**: Large.
- **Task count**: 15 implementation tasks + final verification wave.

## Context

### Original request

The user asked for a work plan to implement `docs/agent-harness-design.md` in this greenfield repo.

### Repository state

- Repo currently contains `.git/`, `docs/`, and `README.md` only.
- No existing `package.json`, test infrastructure, build scripts, or source tree.

### Key decisions from interview

- **Runtime**: TypeScript on Node.js.
- **Package manager**: npm by default.
- **CLI shape**: normal scriptable CLI named `fantasticcode`; not a TUI, REPL, or interactive shell.
- **Provider v1**: real provider integration first via OpenAI-compatible chat-completions HTTP adapters. Tests may use mocked/stubbed HTTP, but the product path should not be fake-provider-first.
- **Streaming**: deferred from v1; use deterministic non-streaming calls.
- **Testing**: tests after implementation, plus mandatory agent-executed QA scenarios for every task.

### Research findings applied

- Use a TypeScript ESM npm package with `bin.fantasticcode` pointing to built output and scripts for `build`, `typecheck`, `test`, and `qa`.
- Prefer a chat-completions-compatible internal provider adapter for v1 because OpenRouter/OpenAI-compatible endpoints are the design target.
- Normalize model responses behind `ModelClient.complete()` with assistant text, tool calls, finish reason, usage, and raw metadata.
- Use a shared `Workspace` safety boundary for all path and process access.
- Use atomic writes for session persistence and file-editing tools.
- Use argv-based process execution for `bash` with cwd, timeout, output cap, and destructive-command denial.

### Metis review gaps addressed

- v1 scope is explicitly frozen to non-streaming, scriptable CLI, OpenAI-compatible chat-completions providers, no TUI/REPL, and no dynamic plugin loading.
- The plan requires concrete contracts for CLI precedence, exit codes, provider/model parsing, session schemas, tool envelopes, runner states, and persistence order.
- `AgentRegistry`, `AgentEventBus`, and presets are planned as minimal seams: simple in-process implementations, 1-2 built-in presets, no plugin loader.
- Acceptance criteria and QA scenarios use executable commands and concrete expected results.

## Work Objectives

### Core objective

Create a working `fantasticcode` CLI package that follows the design doc closely enough to demonstrate the required GoF patterns through real agent-harness responsibilities, while keeping v1 bounded and testable.

### Concrete deliverables

- npm/TypeScript package scaffold with a built CLI binary.
- `RunRequest`, `RunResult`, provider, session, tool, event, runner, and error contracts.
- `AgentHarness.run(request)` facade coordinating subsystems.
- CLI parser supporting `--model`, `--prompt`, `--continue`, `--session`, `--fork`, and `--agent`.
- Preflight pipeline enforcing prompt/input, flag, provider, agent, session, and tool authorization rules.
- Provider registry/factory and one OpenAI-compatible chat-completions adapter.
- JSON-backed session store under `.fantasticcode/sessions/` with `latest.json` storing the latest session ID.
- Minimal agent registry with built-in `coder` and `reviewer` presets.
- Tool registry and safe commands: `read`, `edit`, `apply_patch`, and `bash`.
- Tool policy pipeline enforcing schema validation, workspace sandboxing, risk policy, execution, and result normalization.
- Runner state machine with legal lifecycle transitions.
- Event bus with console/transcript/debug sinks as minimal observer seams.
- Bounded non-streaming runner loop with model calls, tool execution, persistence, and final output.
- Automated tests and agent-executed QA evidence.

### Definition of done

- `npm install` succeeds from a clean checkout.
- `npm run typecheck`, `npm test`, `npm run build`, and `npm run qa` pass.
- `npm pack --dry-run` or `npm pack` verifies package contents and the packed/linked `fantasticcode --help` works.
- CLI help lists all required flags.
- Invalid session flag combinations produce non-zero exits and expected stderr.
- Stubbed provider integration verifies one-shot completions and tool-call loops without requiring live API keys.
- Live provider path validates required API-key environment variables and can make OpenAI-compatible requests when configured.
- Sessions create, continue, fork, persist, and update `latest.json` correctly.
- Workspace tools reject traversal/outside-root/symlink escapes and normalize capped results.
- Runner terminates on final assistant output, unsupported tool calls, malformed provider responses, and max tool turns with structured errors.

### Must-haves

- Follow `docs/agent-harness-design.md` as the source of truth.
- Implement at least the ten required GoF pattern responsibilities through concrete modules: Facade, Strategy, Adapter, Command, Memento, Prototype, Factory Method, Chain of Responsibility, Observer, and State.
- Keep the CLI argument-based and scriptable.
- Keep all filesystem/process access inside the workspace safety boundary unless explicitly allowed by a policy decision in code.
- Preserve deterministic non-streaming behavior in v1.

### Must-NOT-haves / guardrails

- Do **not** build a TUI, REPL, web UI, daemon, or background service.
- Do **not** add streaming output as a v1 requirement.
- Do **not** add dynamic plugin loading, marketplace/provider discovery, remote telemetry, or multi-workspace support.
- Do **not** introduce multiple provider protocol families in v1 beyond OpenAI-compatible chat completions.
- Do **not** force deferred patterns: Abstract Factory, Template Method, or Singleton.
- Do **not** let `AgentHarness` become a god object; it coordinates specialized modules only.
- Do **not** use vague acceptance criteria or manual-only QA.

## Verification Strategy

- **Test infrastructure exists**: No; this plan creates it.
- **Automated tests**: Yes, tests after implementation.
- **Primary framework**: Vitest for unit/integration tests, with Node.js test utilities and stub HTTP servers where needed.
- **Agent-executed QA**: Mandatory for every task. Each task includes concrete commands, expected outputs, and evidence paths under `.sisyphus/evidence/`.
- **No live-key dependency in CI/local tests**: Stub/mock HTTP provider tests cover provider behavior. Live provider usage is supported but gated by environment variables and not required for automated tests.

## TODOs

<!-- Task details are appended below in dependency order. -->

- [ ] 1. **Bootstrap TypeScript npm CLI package**
- **What to do**: Create `package.json`, `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`, `src/cli.ts`, `src/index.ts`, and an initial test folder. Configure ESM TypeScript, Node `>=22.12.0`, `bin.fantasticcode` to built output, npm scripts (`dev`, `build`, `typecheck`, `test`, `test:watch`, `qa`), dependencies (`commander`) and dev dependencies (`typescript`, `tsx`, `vitest`, `@types/node`). Implement a minimal `--help` capable CLI entry with a Node shebang in built output strategy.
- **Must NOT do**: Do not implement provider calls, sessions, tools, runner logic, TUI/REPL, or dynamic plugin loading in this task.
- **References**: `docs/agent-harness-design.md:1-13` (goals), `docs/agent-harness-design.md:15-37` (CLI flags), `.sisyphus/drafts/agent-harness-implementation.md:34-38` (TypeScript package research), `.sisyphus/drafts/agent-harness-implementation.md:52-62` (user decisions/test strategy).
- **Acceptance Criteria**: `npm install` creates a lockfile; `npm exec tsx src/cli.ts -- --help` exits `0`; help output contains `--model`, `--prompt`, `--continue`, `--session`, `--fork`, and `--agent`; `npm run typecheck` passes; `npm test` runs at least one smoke test; `npm run build` emits `dist/cli.js` and `dist/index.js`.
- **QA Scenarios**: Tool: Bash. Steps: run `npm install`; run `npm exec tsx src/cli.ts -- --help`; save stdout/stderr to `.sisyphus/evidence/task-1-bootstrap-help.txt`; run `npm run typecheck`, `npm test`, and `npm run build`, saving combined logs to `.sisyphus/evidence/task-1-bootstrap-commands.txt`. Expected result: all commands exit `0`; help text includes all required flags; `dist/cli.js` exists.
- **Commit**: YES, message `chore(scaffold): initialize TypeScript CLI package`.

- [ ] 2. **Define core contracts, errors, and exit policy**
- **What to do**: Add shared source modules for contracts: `RunRequest`, `RunResult`, `HarnessError`, exit-code enum, provider/model types, model request/response types, tool-call/result envelopes, session schema types, agent preset type, event union, runner state names, and config/settings types. Export public contracts from `src/index.ts`. Add unit tests for provider/model parsing edge cases, structured error formatting, and exit-code mapping.
- **Must NOT do**: Do not wire actual CLI execution or persistence yet; do not leak provider-specific SDK types into internal contracts; do not add Responses API or streaming-specific event contracts beyond deferred placeholders.
- **References**: `docs/agent-harness-design.md:86-103` (core modules), `docs/agent-harness-design.md:115-128` (`RunRequest`/facade example), `docs/agent-harness-design.md:152-167` (`ModelClient` and `AgentPreset`), `docs/agent-harness-design.md:205-211` (`ToolCommand`), `docs/agent-harness-design.md:237-248` (session shape), `.sisyphus/drafts/agent-harness-implementation.md:27-32` (model response normalization).
- **Acceptance Criteria**: Public exports compile; tests assert `openai/gpt-4.1` parses to provider `openai` and model `gpt-4.1`; tests assert missing provider/model segments fail with structured errors; tests assert known validation/config/provider/tool/session errors map to deterministic non-zero exit codes.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run`; save output to `.sisyphus/evidence/task-2-contract-tests.txt`; run `npm run typecheck`; save output to `.sisyphus/evidence/task-2-typecheck.txt`. Expected result: all contract tests pass and no `any`-based provider SDK leakage is required in exported contracts.
- **Commit**: YES, message `feat(core): add shared harness contracts`.

- [ ] 3. **Implement CLI parsing and scriptable input rules**
- **What to do**: Use `commander` in `src/cli.ts` to parse required flags into `RunRequest`. Implement input precedence: `--prompt <text>` wins; if omitted and stdin is piped, read stdin; if neither prompt nor piped stdin exists, return a structured validation error. Implement invalid flag rules: `--continue` + `--session` errors; `--fork` without `--continue` or `--session` errors. Render final output to stdout and errors to stderr with deterministic exit codes, but call only a temporary harness stub or adapter seam until real `AgentHarness` exists.
- **Must NOT do**: Do not add interactive prompting, readline, TUI, REPL, or blocking user input for missing prompt. Do not make real provider calls in CLI parsing tests.
- **References**: `docs/agent-harness-design.md:15-48` (CLI shape, supported flags, session flag rules), `docs/agent-harness-design.md:109-137` (CLI delegates to facade), `.sisyphus/drafts/agent-harness-implementation.md:58-62` (test strategy).
- **Acceptance Criteria**: `npm exec tsx src/cli.ts -- --help` exits `0`; `npm exec tsx src/cli.ts -- --continue --session abc --prompt "hi"` exits non-zero and stderr contains `cannot combine --continue and --session`; `npm exec tsx src/cli.ts -- --fork --prompt "hi"` exits non-zero and stderr contains `--fork requires --continue or --session`; piping `echo hi | npm exec tsx src/cli.ts -- --model openai/gpt-4.1` produces a parsed request through the harness stub without hanging.
- **QA Scenarios**: Tool: Bash. Steps: run the four commands in the acceptance criteria; capture stdout/stderr/exit codes to `.sisyphus/evidence/task-3-cli-parsing.txt`. Expected result: help success, invalid combinations fail with exact messages, piped stdin path exits deterministically and does not wait for interactive input.
- **Commit**: YES, message `feat(cli): parse scriptable run requests`.

- [ ] 4. **Add AgentHarness facade and composition boundary**
- **What to do**: Implement `AgentHarness` as a coordinating facade with dependency-injected subsystem interfaces/factories. Add a composition module that creates the default harness from workspace root/settings. For now, wire placeholder/minimal subsystem implementations sufficient to prove CLI-to-facade flow without provider/tool/session implementation. Add tests that CLI delegates a `RunRequest` to the facade and that the facade does not contain subsystem business logic.
- **Must NOT do**: Do not place provider resolution, session persistence, tool execution, or runner loop logic directly inside `AgentHarness`; do not make it a service locator or singleton.
- **References**: `docs/agent-harness-design.md:49-84` (architecture), `docs/agent-harness-design.md:90-103` (module responsibilities), `docs/agent-harness-design.md:109-137` (Facade intent and overuse warning), `docs/agent-harness-design.md:663-670` (do not make facade a god object).
- **Acceptance Criteria**: Unit tests instantiate `AgentHarness` with test doubles and verify `run(request)` delegates to preflight/runner seams; CLI smoke test can inject or use the default harness composition; code review confirms `AgentHarness` coordinates interfaces rather than implementing all subsystem logic.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run AgentHarness cli`; save output to `.sisyphus/evidence/task-4-facade-tests.txt`; run `npm run typecheck`; save output to `.sisyphus/evidence/task-4-typecheck.txt`. Expected result: facade and CLI integration tests pass; typecheck passes.
- **Commit**: YES, message `feat(harness): add facade composition boundary`.

- [ ] 5. **Implement provider registry, factory, and OpenAI-compatible adapter**
- **What to do**: Implement `ProviderRegistry`, `ProviderFactory`, and one OpenAI-compatible chat-completions HTTP adapter. Support provider configs for at least `openai` and `openrouter` with `baseURL` and `apiKeyEnv`. Map `provider/model` into provider config plus model name. Normalize non-streaming chat-completions responses into internal `ModelResponse` including assistant text, tool calls `{ id, name, argumentsText }`, finish reason, usage, and raw metadata. Add tests with a local stub HTTP server for success, tool calls, provider errors, missing API key, malformed JSON, and malformed tool-call payloads.
- **Must NOT do**: Do not implement OpenAI Responses API, streaming, custom SDK provider families, Abstract Factory, retries beyond a simple bounded HTTP error path, or live-key-only tests.
- **References**: `docs/agent-harness-design.md:138-198` (Strategy/Adapter), `docs/agent-harness-design.md:282-305` (Factory Method), `docs/agent-harness-design.md:468-505` (provider config), `docs/agent-harness-design.md:507-560` (custom SDK boundaries deferred), `.sisyphus/drafts/agent-harness-implementation.md:27-32` (chat-completions v1 and normalization), `.sisyphus/drafts/agent-harness-implementation.md:52-57` (real provider first, streaming deferred).
- **Acceptance Criteria**: Registry resolves `openai/gpt-4.1` and `openrouter/anthropic/claude-sonnet-4`; missing API-key env produces a structured config error before HTTP; stub HTTP success returns normalized text; stub HTTP tool call returns normalized tool call fields; malformed provider response returns structured provider error; unit/integration tests pass without real API keys.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run provider`; save output to `.sisyphus/evidence/task-5-provider-tests.txt`; run `npm run typecheck`; save output to `.sisyphus/evidence/task-5-typecheck.txt`. Expected result: all provider adapter tests pass using local stub/mock HTTP only.
- **Commit**: YES, message `feat(provider): add OpenAI-compatible adapter`.

- [ ] 6. **Implement preflight pipeline and configuration resolution**
- **What to do**: Implement `PreflightPipeline` as a chain with handlers for prompt/input validation, session flag validation, provider/model resolution, API key/config validation, agent preset resolution, session selection intent, enabled tool authorization, and `RunnerInput` construction. Ensure handlers share a chain interface and can short-circuit with structured errors. Add tests for handler order and short-circuit behavior.
- **Must NOT do**: Do not hide preflight as a single monolithic function; do not perform model calls or tool execution during preflight; do not create sessions before flag/config validation succeeds.
- **References**: `docs/agent-harness-design.md:307-349` (Chain of Responsibility and run preflight chain), `docs/agent-harness-design.md:38-48` (session flag rules), `docs/agent-harness-design.md:625-643` (runner flow begins with parse/preflight), Metis directive for exact contracts and exit-code policy.
- **Acceptance Criteria**: Tests assert valid new-session requests produce `RunnerInput`; tests assert `--continue` + `--session` and orphan `--fork` short-circuit before provider/session work; tests assert missing provider config/API key produces deterministic structured error; tests verify handler order is observable and intentional.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run preflight`; save output to `.sisyphus/evidence/task-6-preflight-tests.txt`; run CLI invalid-flag commands from task 3 and save results to `.sisyphus/evidence/task-6-cli-preflight-errors.txt`. Expected result: preflight tests pass and CLI error output remains deterministic.
- **Commit**: YES, message `feat(preflight): validate run requests through pipeline`.

- [ ] 7. **Implement JSON session store with continue and fork semantics**
- **What to do**: Implement `SessionStore` using `.fantasticcode/sessions/`. Define session schema with version, id, optional `parentSessionId`, agent, provider, model, created/updated timestamps, messages, and metadata. Store `latest.json` as the latest session ID/pointer, not a duplicated session. Implement create, load by ID, continue latest, fork deep-copy with lineage, save, atomic temp-write+rename, and partial-failure behavior. Add Windows-safe retry/serialization where needed. Add tests using temp workspaces.
- **Must NOT do**: Do not store live runtime objects in sessions; do not update `latest.json` before session file save succeeds; do not duplicate full sessions in `latest.json`; do not implement remote/database session storage.
- **References**: `docs/agent-harness-design.md:231-280` (Memento and Prototype), `docs/agent-harness-design.md:561-584` (session directory, latest, operations), `docs/agent-harness-design.md:625-643` (persist order), `.sisyphus/drafts/agent-harness-implementation.md:40-44` (atomic writes and Windows concerns).
- **Acceptance Criteria**: First run session creation writes `.fantasticcode/sessions/<id>.json`; `latest.json` points to that ID; continue-latest loads that session; continue-by-ID loads specific session; fork creates a new ID with `parentSessionId` set to source ID and copied messages; failed session write does not advance `latest.json`; schema version is present and validated.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run session`; save output to `.sisyphus/evidence/task-7-session-tests.txt`; run a test fixture or CLI stub that creates, continues, and forks sessions in a temp workspace, saving resulting tree/listing and JSON assertions to `.sisyphus/evidence/task-7-session-files.txt`. Expected result: all session assertions pass and latest pointer semantics match the plan.
- **Commit**: YES, message `feat(session): persist resumable and forkable sessions`.

- [ ] 8. **Implement minimal agent registry and presets**
- **What to do**: Implement `AgentRegistry` as a strategy selector with built-in `coder` default and `reviewer` preset. Each preset defines name, system prompt, enabled tools, and max tool turns. Wire `--agent <name>` through preflight to select a preset. Add tests for default agent selection, named selection, unknown-agent errors, enabled-tool filtering, and max-turn propagation.
- **Must NOT do**: Do not add dynamic plugin loading, filesystem-discovered agents, remote presets, complex inheritance, or separate runner algorithms per agent.
- **References**: `docs/agent-harness-design.md:138-169` (Agent Strategy and `AgentPreset`), `docs/agent-harness-design.md:95` (AgentRegistry responsibility), `docs/agent-harness-design.md:437-450` (Template Method deferred unless multiple runner algorithms exist), Metis directive for minimal agent seams.
- **Acceptance Criteria**: Omitting `--agent` selects `coder`; `--agent reviewer` selects reviewer; unknown agent exits with structured error; enabled tools are passed into preflight/runner input; `maxToolTurns` is available to the runner and covered by tests.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run agent`; save output to `.sisyphus/evidence/task-8-agent-tests.txt`; run `npm exec tsx src/cli.ts -- --agent unknown --prompt "hi"` and save stderr/exit code to `.sisyphus/evidence/task-8-agent-cli-error.txt`. Expected result: tests pass and unknown agent fails deterministically.
- **Commit**: YES, message `feat(agent): add built-in agent presets`.

- [ ] 9. **Implement Workspace safety boundary and file tools**
- **What to do**: Implement `Workspace` path policy and the `read`, `edit`, and `apply_patch` tool commands. Canonicalize all model-supplied paths against workspace root; reject empty paths, traversal, absolute outside-root paths, symlink escapes by default, oversized reads, binary reads where inappropriate, and patch paths outside the workspace. `read` supports optional line ranges and capped output. `edit` applies exact old-text replacement to one file with context mismatch errors and atomic temp-write+rename. `apply_patch` accepts structured patch text, validates all touched paths, applies changes atomically enough for v1, and returns changed file summaries.
- **Must NOT do**: Do not allow arbitrary filesystem reads/writes outside workspace; do not silently create parent directories unless patch semantics explicitly require it; do not perform fuzzy edits; do not expose raw huge file contents to the model.
- **References**: `docs/agent-harness-design.md:199-229` (Command tools), `docs/agent-harness-design.md:585-616` (tool boundaries), `docs/agent-harness-design.md:97-103` (ToolRegistry and Workspace), `.sisyphus/drafts/agent-harness-implementation.md:40-44` (workspace path policy, atomic writes, result caps).
- **Acceptance Criteria**: `read` returns requested file/range with capped output; `read` rejects `../` traversal, outside absolute paths, symlink escapes, and binary files; `edit` succeeds only on exact old text and writes atomically; `edit` fails on context mismatch without modifying the file; `apply_patch` rejects outside-root paths and reports changed files; tests use temp workspaces.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run workspace read edit apply_patch`; save output to `.sisyphus/evidence/task-9-file-tools-tests.txt`; run a temp-workspace tool fixture exercising outside-root and context-mismatch cases, saving results to `.sisyphus/evidence/task-9-file-tools-fixture.txt`. Expected result: safe cases pass, unsafe cases fail with structured tool errors, no outside-workspace files are changed.
- **Commit**: YES, message `feat(tools): add workspace-safe file commands`.

- [ ] 10. **Implement bash tool and tool policy pipeline**
- **What to do**: Implement `ToolRegistry`, `ToolPolicyPipeline`, schema validation, tool lookup, enabled-tool authorization, workspace sandbox enforcement, risk policy, command execution, and result normalization. Add `bash` as a command using argv-based execution or a safe shell wrapper strategy with explicit parsing/config, cwd fixed to workspace, timeout, output cap, environment controls, and destructive-command denial. Normalize all tool results into a session-safe envelope with success/error status, stdout/stderr/result truncation metadata, and execution details.
- **Must NOT do**: Do not execute unrestricted shell strings by default; do not run outside workspace; do not allow destructive commands such as recursive deletes without an explicit deny/error path; do not return unbounded stdout/stderr; do not bypass policy for built-in tools.
- **References**: `docs/agent-harness-design.md:199-229` (Command pattern), `docs/agent-harness-design.md:307-349` (ToolPolicyPipeline chain), `docs/agent-harness-design.md:585-624` (tool design and bash policy), `.sisyphus/drafts/agent-harness-implementation.md:40-44` (bash security research).
- **Acceptance Criteria**: Tool registry can register/lookup all four tools; unsupported tool names produce structured errors; disabled tool calls are denied; malformed arguments fail schema validation; `bash` runs a benign command in workspace; `bash` times out long-running commands; `bash` truncates large output and records truncation; destructive commands are denied before execution.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run tool-policy bash`; save output to `.sisyphus/evidence/task-10-tool-policy-tests.txt`; run a controlled fixture that attempts benign, timeout, large-output, unsupported-tool, and denied destructive command cases, saving envelopes to `.sisyphus/evidence/task-10-bash-fixture.json`. Expected result: policy order is enforced and all result envelopes are normalized.
- **Commit**: YES, message `feat(tools): enforce policy pipeline and bash command`.

- [ ] 11. **Implement AgentEventBus and sinks**
- **What to do**: Implement an in-process typed `AgentEventBus` and minimal sinks: `ConsoleSink` for final output/errors, `TranscriptSink` for readable run history, and `DebugLogSink` for structured debug logs if enabled by config. Ensure observers do not mutate runner/session state. Add tests for event publication order, subscriber errors not corrupting core run state, transcript writing, and no-op behavior when optional sinks are disabled.
- **Must NOT do**: Do not add remote telemetry, analytics, network sinks, streaming-token UX, or observer-driven state mutation. Do not force Singleton event bus usage.
- **References**: `docs/agent-harness-design.md:351-383` (Observer and event sinks), `docs/agent-harness-design.md:452-467` (Singleton not needed for settings/service lookup), `docs/agent-harness-design.md:625-643` (events emitted during runner flow), Metis directive for minimal event seams.
- **Acceptance Criteria**: Event bus publishes typed events for run started/completed/failed, model response, tool started/completed, and session saved; multiple subscribers receive events in deterministic order; observer failure is handled as configured without mutating runner state; transcript/debug sinks write only inside `.fantasticcode/` or configured workspace-local paths.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run event transcript debug`; save output to `.sisyphus/evidence/task-11-events-tests.txt`; run a fixture that emits a representative run event sequence and save produced transcript/log files to `.sisyphus/evidence/task-11-events-fixture.txt`. Expected result: events and sinks behave deterministically and stay workspace-local.
- **Commit**: YES, message `feat(events): add agent event bus and sinks`.

- [ ] 12. **Implement RunnerStateMachine with legal transitions**
- **What to do**: Implement explicit state objects/handlers for `initialized`, `resolving`, `running`, `waitingForTool`, `persisting`, `completed`, and `failed`. State behavior must live behind state-specific objects or handlers, not only an enum plus switch. Enforce legal transitions, failure transitions, and max tool-turn termination. Add tests for legal/illegal transitions and state-specific behavior.
- **Must NOT do**: Do not count State if implementation is just a string enum and switch; do not let runner code bypass transition validation; do not persist partial success as completed after a failed state.
- **References**: `docs/agent-harness-design.md:385-417` (State pattern and legal transitions), `docs/agent-harness-design.md:625-643` (runner flow), `docs/agent-harness-design.md:645-670` (pattern summary and not-forced warnings).
- **Acceptance Criteria**: Legal transition tests cover `initialized -> resolving -> running -> waitingForTool -> running -> persisting -> completed`; failure paths reach `failed`; illegal transitions are rejected; max tool turns transitions to structured failure or final termination policy; state machine exposes enough trace data for QA/evidence.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run state runner-state`; save output to `.sisyphus/evidence/task-12-state-tests.txt`; run a state-machine fixture that records transition traces for success, tool-loop, illegal transition, and max-turn cases to `.sisyphus/evidence/task-12-state-traces.json`. Expected result: traces match documented legal transitions.
- **Commit**: YES, message `feat(runner): add explicit state machine`.

- [ ] 13. **Implement bounded runner loop and model/tool integration**
- **What to do**: Implement `Runner` that drives the non-streaming model/tool loop through the state machine. Build model messages from session + agent system prompt + user prompt; send tool schemas for enabled tools; call `ModelClient.complete()`; append assistant responses; execute requested tools through `ToolPolicyPipeline`; append normalized tool results; repeat until final assistant text, structured error, or `maxToolTurns`. Persist only according to the defined persistence order. Add tests for one-shot no-tool completion, single and multiple tool-call loops, unsupported tool, malformed tool args, malformed provider response, model error, and max-turn termination.
- **Must NOT do**: Do not add streaming, concurrent tool execution unless explicitly supported by the contract, provider-specific logic in the runner, or direct filesystem/process access outside tool commands.
- **References**: `docs/agent-harness-design.md:625-643` (runner flow), `docs/agent-harness-design.md:171-198` (provider adapter boundary), `docs/agent-harness-design.md:199-229` (tool Command pattern), `docs/agent-harness-design.md:307-349` (policy chains), `docs/agent-harness-design.md:385-417` (state machine), `.sisyphus/drafts/agent-harness-implementation.md:27-32` (non-streaming deterministic loop and normalized model responses).
- **Acceptance Criteria**: Runner produces final assistant output for a stub no-tool response; runner executes at least two sequential tool calls and appends tool results before the next model call; unsupported tool and malformed args produce structured errors; max-turn limit stops runaway loops; session messages include user, assistant, tool-call, and tool-result entries as appropriate.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run runner`; save output to `.sisyphus/evidence/task-13-runner-tests.txt`; run an integration fixture using stub provider + read tool and save transcript/session JSON to `.sisyphus/evidence/task-13-runner-fixture.json`. Expected result: all runner paths are deterministic and session transcript reflects model/tool loop order.
- **Commit**: YES, message `feat(runner): execute bounded model tool loop`.

- [ ] 14. **Wire end-to-end CLI execution with sessions and provider stubs**
- **What to do**: Replace temporary CLI/harness stubs with full default composition. Ensure CLI args flow through preflight, session selection, provider adapter, agent registry, tool registry, event bus, runner, session persistence, and final stdout/stderr rendering. Add end-to-end tests using a local stub provider server and temp workspace for new run, continue latest, continue specific session, fork session, invalid provider config, tool-call execution, and final output rendering.
- **Must NOT do**: Do not require live API keys for end-to-end tests; do not write `.fantasticcode/` outside the selected temp workspace in tests; do not introduce interactive prompts or hidden global state.
- **References**: `docs/agent-harness-design.md:49-84` (high-level architecture), `docs/agent-harness-design.md:15-48` (CLI shape/session rules), `docs/agent-harness-design.md:561-584` (session operations), `docs/agent-harness-design.md:625-643` (complete runner flow), `docs/agent-harness-design.md:672-686` (minimal first implementation plan).
- **Acceptance Criteria**: `fantasticcode --model openai/gpt-4.1 --prompt "hi"` can run against a configured stub provider; first run creates a session and latest pointer; `--continue` appends to latest session; `--session <id>` loads a specific session; `--session <id> --fork` creates a new session with parent metadata; final assistant text prints to stdout; structured errors print to stderr and use exit codes.
- **QA Scenarios**: Tool: Bash. Steps: run `npm test -- --run e2e cli`; save output to `.sisyphus/evidence/task-14-e2e-tests.txt`; run scripted CLI scenarios against a stub provider in a temp workspace and save command logs plus `.fantasticcode/sessions/` assertions to `.sisyphus/evidence/task-14-cli-scenarios.txt`. Expected result: all end-to-end flows pass without live keys.
- **Commit**: YES, message `feat(cli): wire end-to-end agent harness`.

- [ ] 15. **Add packaging QA, documentation, and v1 scope notes**
- **What to do**: Update `README.md` with install/build/test usage, CLI examples, provider env vars, session behavior, tool safety notes, and explicit deferred features. Add package metadata (`exports`, `files`, license field as appropriate, `prepublishOnly` or `qa` script). Add packaging tests/QA for `npm pack`, packed binary help, and package contents. Document that v1 is non-streaming and OpenAI-compatible-chat-completions-only.
- **Must NOT do**: Do not add unimplemented README promises such as streaming, plugins, TUI, custom SDK providers, telemetry, or multi-workspace support. Do not publish the package.
- **References**: `docs/agent-harness-design.md:1-13` (goals), `docs/agent-harness-design.md:419-467` (deferred/conditional patterns), `docs/agent-harness-design.md:645-670` (pattern summary and not-forced), `.sisyphus/drafts/agent-harness-implementation.md:34-38` (package scripts/files research), Metis packaging QA directive.
- **Acceptance Criteria**: README contains accurate CLI examples and provider environment variables; README documents sessions under `.fantasticcode/sessions/`; README documents tool safety boundaries and deferred features; `npm run qa` runs typecheck, tests, build, and packaging checks; `npm pack --dry-run` or `npm pack` shows expected files only; packed/linked `fantasticcode --help` exits `0`.
- **QA Scenarios**: Tool: Bash. Steps: run `npm run qa`; save output to `.sisyphus/evidence/task-15-qa.txt`; run `npm pack --dry-run` or `npm pack` and capture package contents to `.sisyphus/evidence/task-15-pack.txt`; run packed/linked `fantasticcode --help` and save output to `.sisyphus/evidence/task-15-packed-help.txt`. Expected result: package QA passes and documentation matches implemented scope.
- **Commit**: YES, message `docs(cli): document package usage and v1 scope`.

## Final Verification Wave

> 4 review agents run in PARALLEL via `parallel_tasks`. ALL must APPROVE. Present results to the user and wait for explicit "okay" before completing. Rejection means fix the issue, re-run the rejecting reviewer, present results again, and wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  - Verify every must-have exists, every must-NOT-have is absent, and all evidence files referenced by tasks exist under `.sisyphus/evidence/`.
  - Check implementation against `docs/agent-harness-design.md:1-686` and this plan.
  - Output: `Must Have [N/N] | Must NOT Have [N/N] | Evidence [N/N] | VERDICT: APPROVE/REJECT`.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  - Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run qa`.
  - Inspect changed files for `as any`, `@ts-ignore`, empty catches, leftover `console.log`, unbounded output, provider-specific leakage into runner contracts, and pattern-theatre abstractions.
  - Output: `Typecheck [PASS/FAIL] | Tests [N pass/N fail] | Build [PASS/FAIL] | QA [PASS/FAIL] | VERDICT: APPROVE/REJECT`.

- [ ] F3. **QA Scenarios** — `unspecified-high`
  - Execute every task QA scenario from tasks 1-15, including CLI parsing, provider stub tests, session create/continue/fork, file-tool safety, bash policy, runner loop, E2E CLI, and packaging.
  - Save final evidence to `.sisyphus/evidence/final-qa/`.
  - Output: `Scenarios [N/N pass] | Integration [N/N pass] | Evidence [saved/missing] | VERDICT: APPROVE/REJECT`.

- [ ] F4. **Scope Fidelity** — `deep`
  - Compare the final diff against each task and the guardrails. Flag missing implementation, scope creep, cross-task contamination, unapproved streaming/TUI/plugin/telemetry/multi-provider-protocol additions, and unforced deferred patterns.
  - Output: `Tasks [N/N compliant] | Guardrails [N/N] | Contamination [CLEAN/N issues] | VERDICT: APPROVE/REJECT`.
