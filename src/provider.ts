import type {
  JsonObject,
  ModelClient,
  ModelMessage,
  ModelRequest,
  ModelResponse,
  ModelToolCall,
  ModelUsage,
  ProviderConfig,
  ResolvedProvider,
  ToolSchema,
} from "./contracts.js";
import { HarnessError } from "./errors.js";
import { parseProviderModel } from "./model-id.js";

export class ProviderRegistry {
  private readonly providers = new Map<string, ProviderConfig>();

  constructor(configs: ProviderConfig[] = defaultProviderConfigs()) {
    for (const config of configs) {
      this.providers.set(config.name, config);
    }
  }

  resolve(selector: string, env: NodeJS.ProcessEnv = process.env): ResolvedProvider {
    const parsed = parseProviderModel(selector);
    const config = this.providers.get(parsed.provider);
    if (config === undefined) {
      throw new HarnessError("config", "UNKNOWN_PROVIDER", `unknown provider: ${parsed.provider}`, {
        provider: parsed.provider,
      });
    }
    const apiKey = env[config.apiKeyEnv];
    if (apiKey === undefined || apiKey.trim() === "") {
      throw new HarnessError("config", "MISSING_API_KEY", `missing API key env var: ${config.apiKeyEnv}`, {
        apiKeyEnv: config.apiKeyEnv,
      });
    }
    return { config, model: parsed.model, apiKey };
  }
}

export interface ProviderFactory {
  supports(provider: string): boolean;
  create(resolved: ResolvedProvider): ModelClient;
}

export class OpenAICompatibleProviderFactory implements ProviderFactory {
  supports(provider: string): boolean {
    return provider === "openai" || provider === "openrouter";
  }

  create(resolved: ResolvedProvider): ModelClient {
    return new OpenAICompatibleAdapter(resolved.config.baseURL, resolved.apiKey);
  }
}

export class ProviderFactoryRegistry {
  constructor(private readonly factories: ProviderFactory[] = [new OpenAICompatibleProviderFactory()]) {}

  create(resolved: ResolvedProvider): ModelClient {
    const factory = this.factories.find((candidate) => candidate.supports(resolved.config.name));
    if (factory === undefined) {
      throw new HarnessError("config", "NO_PROVIDER_FACTORY", `no provider factory for ${resolved.config.name}`);
    }
    return factory.create(resolved);
  }
}

export class OpenAICompatibleAdapter implements ModelClient {
  constructor(
    private readonly baseURL: string,
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const response = await this.fetchImpl(`${this.baseURL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map(toProviderMessage),
        tools: request.tools,
      }),
    });

    const text = await response.text();
    let payload: unknown;
    try {
      payload = text === "" ? {} : JSON.parse(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HarnessError("provider", "MALFORMED_PROVIDER_JSON", "provider returned malformed JSON", {
        message,
      });
    }

    if (!response.ok) {
      throw new HarnessError("provider", "PROVIDER_HTTP_ERROR", `provider returned HTTP ${response.status}`, {
        status: response.status,
        payload,
      });
    }

    return normalizeChatCompletion(payload);
  }
}

export function defaultProviderConfigs(env: NodeJS.ProcessEnv = process.env): ProviderConfig[] {
  return [
    {
      name: "openai",
      baseURL: env.FANTASTICCODE_OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      apiKeyEnv: "OPENAI_API_KEY",
    },
    {
      name: "openrouter",
      baseURL: env.FANTASTICCODE_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
      apiKeyEnv: "OPENROUTER_API_KEY",
    },
  ];
}

function toProviderMessage(message: ModelMessage): JsonObject {
  if (message.role === "assistant") {
    return {
      role: "assistant",
      content: message.content,
      ...(message.toolCalls === undefined || message.toolCalls.length === 0
        ? {}
        : {
            tool_calls: message.toolCalls.map((call) => ({
              id: call.id,
              type: "function",
              function: { name: call.name, arguments: call.argumentsText },
            })),
          }),
    };
  }
  if (message.role === "tool") {
    return {
      role: "tool",
      tool_call_id: message.toolCallId ?? "",
      name: message.name ?? "tool",
      content: message.content ?? "",
    };
  }
  return { role: message.role, content: message.content ?? "" };
}

export function normalizeChatCompletion(payload: unknown): ModelResponse {
  const root = asRecord(payload, "provider response");
  const choices = root.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new HarnessError("provider", "MALFORMED_PROVIDER_RESPONSE", "provider response missing choices");
  }
  const choice = asRecord(choices[0], "provider choice");
  const message = asRecord(choice.message, "provider message");
  const content = message.content;
  const finishReason = typeof choice.finish_reason === "string" ? choice.finish_reason : "unknown";
  const toolCalls = normalizeToolCalls(message.tool_calls);
  const usage = normalizeUsage(root.usage);
  return {
    text: typeof content === "string" ? content : "",
    toolCalls,
    finishReason,
    ...(usage === undefined ? {} : { usage }),
    raw: payload,
  };
}

function normalizeToolCalls(value: unknown): ModelToolCall[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new HarnessError("provider", "MALFORMED_TOOL_CALLS", "provider tool_calls must be an array");
  }
  return value.map((entry, index) => {
    const item = asRecord(entry, `tool call ${index}`);
    const fn = asRecord(item.function, `tool call ${index} function`);
    if (typeof item.id !== "string" || typeof fn.name !== "string" || typeof fn.arguments !== "string") {
      throw new HarnessError("provider", "MALFORMED_TOOL_CALL", "provider tool call has invalid shape", {
        index,
      });
    }
    return { id: item.id, name: fn.name, argumentsText: fn.arguments };
  });
}

function normalizeUsage(value: unknown): ModelUsage | undefined {
  if (value === undefined) {
    return undefined;
  }
  const usage = asRecord(value, "usage");
  return {
    ...(typeof usage.prompt_tokens === "number" ? { promptTokens: usage.prompt_tokens } : {}),
    ...(typeof usage.completion_tokens === "number" ? { completionTokens: usage.completion_tokens } : {}),
    ...(typeof usage.total_tokens === "number" ? { totalTokens: usage.total_tokens } : {}),
  };
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HarnessError("provider", "MALFORMED_PROVIDER_RESPONSE", `${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

export function toolSchemasForCommands(commands: Iterable<{ name: string; description: string; schema: ToolSchema["function"]["parameters"] }>): ToolSchema[] {
  return Array.from(commands, (command) => ({
    type: "function",
    function: {
      name: command.name,
      description: command.description,
      parameters: command.schema,
    },
  }));
}
