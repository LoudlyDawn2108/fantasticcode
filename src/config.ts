import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AgentConfigAdapter, type AgentConfig } from "./agent.js";
import type { HarnessDefaults, HarnessSettings, ModelConfig, ProviderConfig, RunnerConfig } from "./contracts.js";
import { HarnessError } from "./errors.js";
import { defaultProviderConfigs } from "./provider.js";

export interface HarnessConfigFile {
  version: 1;
  defaults?: HarnessDefaults;
  providers?: Record<string, ProviderConfigFile>;
  agents?: Record<string, AgentConfig>;
  runner?: Partial<RunnerConfig>;
}

export interface ProviderConfigFile {
  sdk?: "openai" | "anthropic";
  baseUrl?: string;
  baseURL?: string;
  apiKey?: string;
  apiKeyEnv?: string;
  defaultModel?: string;
  models?: Record<string, ModelConfig>;
  maxTokens?: number;
}

export interface RuntimeConfigOptions {
  workspaceRoot: string;
  env?: NodeJS.ProcessEnv;
  overrides?: Partial<HarnessSettings>;
}

export function loadRuntimeConfig(options: RuntimeConfigOptions): HarnessSettings {
  const workspaceRoot = resolve(options.workspaceRoot);
  const env = options.env ?? process.env;
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const agentRoot = join(packageRoot, "agents");
  const merged = [
    builtInConfig(env, agentRoot),
    readOptionalConfig(join(workspaceRoot, "agent-harness.config.json")),
    readOptionalConfig(join(workspaceRoot, "agent-harness.local.json")),
  ].reduce(mergeHarnessConfig);

  const providers = options.overrides?.providers ?? normalizeProviders(merged.providers ?? {});
  const defaults = normalizeDefaults(merged.defaults ?? {}, providers);
  const runner = { maxToolTurns: merged.runner?.maxToolTurns ?? 8 };
  const agentPresets = options.overrides?.agentPresets ?? new AgentConfigAdapter({ workspaceRoot, promptBaseDir: agentRoot, additionalPromptRoots: [agentRoot] }).load(merged.agents ?? {});

  return {
    workspaceRoot,
    providers,
    agentPresets,
    defaults: { ...defaults, ...(options.overrides?.defaults ?? {}) },
    runner: options.overrides?.runner ?? runner,
    ...(options.overrides?.debug === undefined ? {} : { debug: options.overrides.debug }),
    ...(options.overrides?.console === undefined ? {} : { console: options.overrides.console }),
  };
}

function builtInConfig(env: NodeJS.ProcessEnv, agentRoot: string): HarnessConfigFile {
  const providers = Object.fromEntries(defaultProviderConfigs(env).map((provider) => [provider.name, provider]));
  return {
    version: 1,
    defaults: { model: "openai/gpt-5.4-mini", agent: "coder" },
    providers,
    agents: {
      coder: {
        description: "Default coding agent",
        promptFile: join(agentRoot, "coder.md"),
        enabledTools: ["read", "apply_patch", "bash"],
      },
      reviewer: {
        extends: "coder",
        description: "Code review agent",
        promptFile: join(agentRoot, "reviewer.md"),
        enabledTools: ["read", "bash"],
      },
    },
    runner: { maxToolTurns: 8 },
  };
}

function readOptionalConfig(path: string): HarnessConfigFile {
  if (!existsSync(path)) {
    return { version: 1 };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HarnessError("config", "INVALID_CONFIG_JSON", `invalid config JSON at ${path}`, { path, message });
  }
  return validateHarnessConfig(parsed, path);
}

function validateHarnessConfig(value: unknown, path: string): HarnessConfigFile {
  const object = asObject(value, `config at ${path}`);
  if (object.version !== 1) {
    throw new HarnessError("config", "INVALID_CONFIG_VERSION", `config version must be 1 at ${path}`, { path });
  }
  return {
    version: 1,
    ...(object.defaults === undefined ? {} : { defaults: validateDefaults(object.defaults, path) }),
    ...(object.providers === undefined ? {} : { providers: validateProviders(object.providers, path) }),
    ...(object.agents === undefined ? {} : { agents: validateAgents(object.agents, path) }),
    ...(object.runner === undefined ? {} : { runner: validateRunner(object.runner, path) }),
  };
}

function validateDefaults(value: unknown, path: string): HarnessDefaults {
  const object = asObject(value, `defaults at ${path}`);
  const defaults: HarnessDefaults = {};
  const model = readOptionalString(object, "model");
  const provider = readOptionalString(object, "provider");
  const agent = readOptionalString(object, "agent");
  if (model !== undefined) defaults.model = model;
  if (provider !== undefined) defaults.provider = provider;
  if (agent !== undefined) defaults.agent = agent;
  return defaults;
}

function validateProviders(value: unknown, path: string): Record<string, ProviderConfigFile> {
  const object = asObject(value, `providers at ${path}`);
  const providers: Record<string, ProviderConfigFile> = {};
  for (const [name, raw] of Object.entries(object)) {
    const provider = asObject(raw, `provider ${name} at ${path}`);
    const config: ProviderConfigFile = {};
    const sdk = readProviderSdk(provider.sdk, name);
    const baseUrl = readOptionalString(provider, "baseUrl");
    const baseURL = readOptionalString(provider, "baseURL");
    const apiKey = readOptionalString(provider, "apiKey");
    const apiKeyEnv = readOptionalString(provider, "apiKeyEnv");
    const defaultModel = readOptionalString(provider, "defaultModel");
    const maxTokens = readOptionalNumber(provider, "maxTokens");
    if (sdk !== undefined) config.sdk = sdk;
    if (baseUrl !== undefined) config.baseUrl = baseUrl;
    if (baseURL !== undefined) config.baseURL = baseURL;
    if (apiKey !== undefined) config.apiKey = apiKey;
    if (apiKeyEnv !== undefined) config.apiKeyEnv = apiKeyEnv;
    if (defaultModel !== undefined) config.defaultModel = defaultModel;
    if (maxTokens !== undefined) config.maxTokens = maxTokens;
    if (provider.models !== undefined) config.models = validateModels(provider.models, path, name);
    providers[name] = config;
  }
  return providers;
}

function validateModels(value: unknown, path: string, providerName: string): Record<string, ModelConfig> {
  const object = asObject(value, `models for ${providerName} at ${path}`);
  const models: Record<string, ModelConfig> = {};
  for (const [name, raw] of Object.entries(object)) {
    const model = asObject(raw, `model ${providerName}/${name} at ${path}`);
    const config: ModelConfig = {};
    const id = readOptionalString(model, "id");
    const displayName = readOptionalString(model, "displayName");
    if (id !== undefined) config.id = id;
    if (displayName !== undefined) config.displayName = displayName;
    models[name] = config;
  }
  return models;
}

function validateAgents(value: unknown, path: string): Record<string, AgentConfig> {
  const object = asObject(value, `agents at ${path}`);
  const agents: Record<string, AgentConfig> = {};
  for (const [name, raw] of Object.entries(object)) {
    const agent = asObject(raw, `agent ${name} at ${path}`);
    const config: AgentConfig = {};
    const description = readOptionalString(agent, "description");
    const base = readOptionalString(agent, "extends");
    const promptFile = readOptionalString(agent, "promptFile");
    const model = readOptionalString(agent, "model");
    if (description !== undefined) config.description = description;
    if (base !== undefined) config.extends = base;
    if (promptFile !== undefined) config.promptFile = promptFile;
    if (agent.enabledTools !== undefined) config.enabledTools = readStringArray(agent.enabledTools, `enabledTools for agent ${name} at ${path}`);
    if (model !== undefined) config.model = model;
    agents[name] = config;
  }
  return agents;
}

function validateRunner(value: unknown, path: string): Partial<RunnerConfig> {
  const object = asObject(value, `runner at ${path}`);
  const runner: Partial<RunnerConfig> = {};
  const maxToolTurns = readOptionalNumber(object, "maxToolTurns");
  if (maxToolTurns !== undefined) runner.maxToolTurns = maxToolTurns;
  return runner;
}

function mergeHarnessConfig(base: HarnessConfigFile, override: HarnessConfigFile): HarnessConfigFile {
  return {
    version: 1,
    defaults: { ...(base.defaults ?? {}), ...(override.defaults ?? {}) },
    providers: mergeRecord(base.providers, override.providers),
    agents: mergeRecord(base.agents, override.agents),
    runner: { ...(base.runner ?? {}), ...(override.runner ?? {}) },
  };
}

function mergeRecord<T extends object>(base: Record<string, T> | undefined, override: Record<string, T> | undefined): Record<string, T> {
  const merged: Record<string, T> = { ...(base ?? {}) };
  for (const [key, value] of Object.entries(override ?? {})) {
    merged[key] = { ...(merged[key] ?? {}), ...value };
  }
  return merged;
}

function normalizeProviders(providers: Record<string, ProviderConfigFile>): ProviderConfig[] {
  return Object.entries(providers).map(([name, provider]) => {
    const baseURL = provider.baseUrl ?? provider.baseURL;
    if (baseURL === undefined || baseURL.trim() === "") {
      throw new HarnessError("config", "PROVIDER_BASE_URL_REQUIRED", `provider ${name} must define baseUrl`, { provider: name });
    }
    return {
      name,
      ...(provider.sdk === undefined ? {} : { sdk: provider.sdk }),
      baseURL,
      ...(provider.apiKey === undefined ? {} : { apiKey: provider.apiKey }),
      ...(provider.apiKeyEnv === undefined ? {} : { apiKeyEnv: provider.apiKeyEnv }),
      ...(provider.defaultModel === undefined ? {} : { defaultModel: provider.defaultModel }),
      ...(provider.models === undefined ? {} : { models: provider.models }),
      ...(provider.maxTokens === undefined ? {} : { maxTokens: provider.maxTokens }),
    };
  });
}

function normalizeDefaults(defaults: HarnessDefaults, providers: ProviderConfig[]): HarnessDefaults {
  if (defaults.model !== undefined) {
    return defaults;
  }
  if (defaults.provider !== undefined) {
    const provider = providers.find((candidate) => candidate.name === defaults.provider);
    if (provider?.defaultModel !== undefined) {
      return { ...defaults, model: `${provider.name}/${provider.defaultModel}` };
    }
  }
  return defaults;
}

function readProviderSdk(value: unknown, provider: string): "openai" | "anthropic" | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === "openai" || value === "anthropic") {
    return value;
  }
  throw new HarnessError("config", "INVALID_PROVIDER_SDK", `provider ${provider} has invalid sdk`, { provider });
}

function readOptionalString(object: Record<string, unknown>, key: string): string | undefined {
  const value = object[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new HarnessError("config", "INVALID_CONFIG_FIELD", `${key} must be a string`);
  }
  return value;
}

function readOptionalNumber(object: Record<string, unknown>, key: string): number | undefined {
  const value = object[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HarnessError("config", "INVALID_CONFIG_FIELD", `${key} must be a finite number`);
  }
  return value;
}

function readStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new HarnessError("config", "INVALID_CONFIG_FIELD", `${label} must be an array of strings`);
  }
  return [...value];
}

function asObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HarnessError("config", "INVALID_CONFIG_SHAPE", `${label} must be an object`);
  }
  return value as Record<string, unknown>;
}
