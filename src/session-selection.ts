import type { AgentPreset, RunRequest, Session } from "./contracts.js";
import { HarnessError } from "./errors.js";
import { parseProviderModel } from "./model-id.js";
import type { SessionStore } from "./session.js";

export interface SessionSelectionInput {
  request: RunRequest;
  defaultAgent: AgentPreset;
  sessionStore: SessionStore;
}

export interface SessionSelectionResult {
  session: Session;
  agentName: string;
  updateLatest: boolean;
}

export interface SessionSelectionStrategy {
  readonly name: string;
  select(input: SessionSelectionInput): Promise<SessionSelectionResult>;
}

export class NewSessionSelectionStrategy implements SessionSelectionStrategy {
  readonly name = "new";

  async select(input: SessionSelectionInput): Promise<SessionSelectionResult> {
    const model = input.request.model;
    if (model === undefined) {
      throw new HarnessError("validation", "MODEL_REQUIRED", "--model is required for a new session");
    }
    const parsed = parseProviderModel(model);
    const agentName = input.request.agent ?? input.defaultAgent.name;
    return {
      session: input.sessionStore.create({
        agent: agentName,
        provider: parsed.provider,
        model: parsed.model,
      }),
      agentName,
      updateLatest: true,
    };
  }
}

export class ContinueLatestSessionStrategy implements SessionSelectionStrategy {
  readonly name = "continueLatest";

  async select(input: SessionSelectionInput): Promise<SessionSelectionResult> {
    const session = await input.sessionStore.loadLatest();
    const agentName = input.request.agent ?? session.agent;
    session.agent = agentName;
    return { session, agentName, updateLatest: true };
  }
}

export class LoadByIdSessionStrategy implements SessionSelectionStrategy {
  readonly name = "loadById";

  constructor(private readonly sessionId: string) {}

  async select(input: SessionSelectionInput): Promise<SessionSelectionResult> {
    const session = await input.sessionStore.load(this.sessionId);
    const agentName = input.request.agent ?? session.agent;
    session.agent = agentName;
    return { session, agentName, updateLatest: true };
  }
}

export class ForkingSessionSelectionStrategy implements SessionSelectionStrategy {
  readonly name = "fork";

  constructor(private readonly source: SessionSelectionStrategy) {}

  async select(input: SessionSelectionInput): Promise<SessionSelectionResult> {
    const selected = await this.source.select(input);
    const session = input.sessionStore.fork(selected.session);
    session.agent = selected.agentName;
    return { session, agentName: selected.agentName, updateLatest: true };
  }
}

export class SessionSelectionStrategyResolver {
  resolve(request: RunRequest): SessionSelectionStrategy {
    let strategy: SessionSelectionStrategy;
    if (request.continueLast === true) {
      strategy = new ContinueLatestSessionStrategy();
    } else if (request.sessionId !== undefined) {
      strategy = new LoadByIdSessionStrategy(request.sessionId);
    } else {
      strategy = new NewSessionSelectionStrategy();
    }
    return request.fork === true ? new ForkingSessionSelectionStrategy(strategy) : strategy;
  }
}
