import type { AgentPreset, HarnessDefaults, ModelClient, PreparedRun, ProviderConfig, RunRequest, RunnerConfig, Session } from "./contracts.js";
import { AgentRegistry } from "./agent.js";
import { createEventBus, createSessionStore, createToolRegistry } from "./construction.js";
import { HarnessError } from "./errors.js";
import { ProviderFactoryRegistry, ProviderRegistry } from "./provider.js";
import type { SessionStore } from "./session.js";
import type { ToolRegistry } from "./tool-policy.js";
import { createToolPolicyPipeline } from "./tool-policy.js";
import type { AgentEventBus } from "./events.js";
import { SessionSelectionStrategyResolver } from "./session-selection.js";
import { Workspace } from "./workspace.js";

export interface PreflightContext {
  request: RunRequest;
  workspace: Workspace;
  sessionStore: SessionStore;
  agentRegistry: AgentRegistry;
  providerRegistry: ProviderRegistry;
  providerFactoryRegistry: ProviderFactoryRegistry;
  toolRegistry: ToolRegistry;
  eventBus: AgentEventBus;
  sessionSelectionResolver: SessionSelectionStrategyResolver;
  defaults: HarnessDefaults;
  runner: RunnerConfig;
  selectedAgentName?: string;
  agent?: AgentPreset;
  session?: Session;
  modelClient?: ModelClient;
  provider?: string;
  model?: string;
  updateLatest?: boolean;
}

export interface PreflightHandler {
  handle(input: PreflightContext, next: (input: PreflightContext) => Promise<PreparedRun>): Promise<PreparedRun>;
}

export class PreflightPipeline {
  constructor(private readonly handlers: PreflightHandler[] = defaultPreflightHandlers()) {}

  prepare(context: PreflightContext): Promise<PreparedRun> {
    const invoke = async (index: number, nextContext: PreflightContext): Promise<PreparedRun> => {
      const handler = this.handlers[index];
      if (handler === undefined) {
        return finalizePreparedRun(nextContext);
      }
      return handler.handle(nextContext, (input) => invoke(index + 1, input));
    };
    return invoke(0, context);
  }
}

export function createPreflightContext(input: {
  request: RunRequest;
  workspaceRoot: string;
  providers?: ProviderConfig[];
  agentPresets: AgentPreset[];
  defaults?: HarnessDefaults;
  runner: RunnerConfig;
  debug?: boolean;
  console?: boolean;
}): PreflightContext {
  const workspace = new Workspace(input.request.workspaceRoot ?? input.workspaceRoot);
  const toolRegistry = createToolRegistry();
  return {
    request: input.request,
    workspace,
    sessionStore: createSessionStore(workspace.root),
    agentRegistry: new AgentRegistry(input.agentPresets),
    providerRegistry: new ProviderRegistry(input.providers),
    providerFactoryRegistry: new ProviderFactoryRegistry(),
    toolRegistry,
    eventBus: createEventBus({
      workspaceRoot: workspace.root,
      ...(input.debug === undefined ? {} : { debug: input.debug }),
      ...(input.console === undefined ? {} : { console: input.console }),
    }),
    sessionSelectionResolver: new SessionSelectionStrategyResolver(),
    defaults: input.defaults ?? {},
    runner: input.runner,
  };
}

export function defaultPreflightHandlers(): PreflightHandler[] {
  return [new RequestValidationHandler(), new SessionSelectionHandler(), new AgentResolutionHandler(), new ProviderResolutionHandler(), new ToolAuthorizationHandler()];
}

class RequestValidationHandler implements PreflightHandler {
  async handle(input: PreflightContext, next: (input: PreflightContext) => Promise<PreparedRun>): Promise<PreparedRun> {
    const request = input.request;
    if (request.prompt.trim() === "") {
      throw new HarnessError("validation", "EMPTY_PROMPT", "prompt must not be empty");
    }
    if (request.continueLast === true && request.sessionId !== undefined) {
      throw new HarnessError("validation", "AMBIGUOUS_SESSION", "--continue and --session cannot be used together");
    }
    if (request.fork === true && request.continueLast !== true && request.sessionId === undefined) {
      throw new HarnessError("validation", "FORK_REQUIRES_SOURCE", "--fork requires --continue or --session");
    }
    if (request.model === undefined && input.defaults.model === undefined && request.continueLast !== true && request.sessionId === undefined) {
      throw new HarnessError("validation", "MODEL_REQUIRED", "--model is required for a new session");
    }
    return next(input);
  }
}

class AgentResolutionHandler implements PreflightHandler {
  async handle(input: PreflightContext, next: (input: PreflightContext) => Promise<PreparedRun>): Promise<PreparedRun> {
    return next({ ...input, agent: input.agentRegistry.resolve(requireAgentName(input.selectedAgentName ?? input.defaults.agent)) });
  }
}

class SessionSelectionHandler implements PreflightHandler {
  async handle(input: PreflightContext, next: (input: PreflightContext) => Promise<PreparedRun>): Promise<PreparedRun> {
    const strategy = input.sessionSelectionResolver.resolve(input.request);
    const defaultAgent = input.agentRegistry.resolve(requireAgentName(input.request.agent ?? input.defaults.agent));
    const result = await strategy.select({
      request: input.request,
      defaultAgent,
      ...(input.defaults.model === undefined ? {} : { defaultModel: input.defaults.model }),
      sessionStore: input.sessionStore,
    });
    return next({
      ...input,
      session: result.session,
      selectedAgentName: result.agentName,
      updateLatest: result.updateLatest,
    });
  }
}

class ProviderResolutionHandler implements PreflightHandler {
  async handle(input: PreflightContext, next: (input: PreflightContext) => Promise<PreparedRun>): Promise<PreparedRun> {
    const session = requireSession(input);
    const selector = input.request.model ?? `${session.provider}/${session.model}`;
    const resolved = input.providerRegistry.resolve(selector);
    const modelClient = input.providerFactoryRegistry.create(resolved);
    session.provider = resolved.config.name;
    session.model = resolved.model;
    return next({ ...input, modelClient, provider: resolved.config.name, model: resolved.model });
  }
}

class ToolAuthorizationHandler implements PreflightHandler {
  async handle(input: PreflightContext, next: (input: PreflightContext) => Promise<PreparedRun>): Promise<PreparedRun> {
    const agent = requireAgent(input);
    for (const name of agent.enabledTools) {
      input.toolRegistry.lookup(name);
    }
    return next(input);
  }
}

function finalizePreparedRun(input: PreflightContext): PreparedRun {
  return {
    request: input.request,
    provider: requireString(input.provider, "provider"),
    model: requireString(input.model, "model"),
    modelClient: requireModelClient(input),
    agent: requireAgent(input),
    session: requireSession(input),
    toolRegistry: input.toolRegistry,
    toolPolicy: createToolPolicyPipeline(input.toolRegistry),
    sessionStore: input.sessionStore,
    eventBus: input.eventBus,
    workspace: input.workspace,
    updateLatest: input.updateLatest ?? true,
    maxToolTurns: input.runner.maxToolTurns,
  };
}

function requireAgent(input: PreflightContext): AgentPreset {
  if (input.agent === undefined) {
    throw new HarnessError("runner", "PREFLIGHT_INCOMPLETE", "agent was not resolved");
  }
  return input.agent;
}

function requireSession(input: PreflightContext): Session {
  if (input.session === undefined) {
    throw new HarnessError("runner", "PREFLIGHT_INCOMPLETE", "session was not resolved");
  }
  return input.session;
}

function requireModelClient(input: PreflightContext): ModelClient {
  if (input.modelClient === undefined) {
    throw new HarnessError("runner", "PREFLIGHT_INCOMPLETE", "model client was not resolved");
  }
  return input.modelClient;
}

function requireString(value: string | undefined, name: string): string {
  if (value === undefined) {
    throw new HarnessError("runner", "PREFLIGHT_INCOMPLETE", `${name} was not resolved`);
  }
  return value;
}

function requireAgentName(value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new HarnessError("config", "DEFAULT_AGENT_REQUIRED", "a default agent must be configured");
  }
  return value;
}
