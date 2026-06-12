import Anthropic from "@anthropic-ai/sdk";
import type {
  ContentBlockParam,
  Message,
  MessageCreateParamsNonStreaming,
  MessageParam,
  Tool,
  ToolUnion,
} from "@anthropic-ai/sdk/resources/messages/messages";
import OpenAI from "openai";
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import type {
  JsonObject,
  JsonSchema,
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

type ProviderSdk = NonNullable<ProviderConfig["sdk"]>;

interface OpenAIClientLike {
  chat: {
    completions: {
      create(params: ChatCompletionCreateParamsNonStreaming): Promise<ChatCompletion>;
    };
  };
}

interface AnthropicClientLike {
  messages: {
    create(params: MessageCreateParamsNonStreaming): Promise<Message>;
  };
}

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
    const apiKey = config.apiKey ?? (config.apiKeyEnv === undefined ? undefined : env[config.apiKeyEnv]);
    if (apiKey === undefined || apiKey.trim() === "") {
      const label = config.apiKeyEnv === undefined ? `provider ${config.name}` : `env var: ${config.apiKeyEnv}`;
      throw new HarnessError("config", "MISSING_API_KEY", `missing API key for ${label}`, {
        provider: config.name,
        ...(config.apiKeyEnv === undefined ? {} : { apiKeyEnv: config.apiKeyEnv }),
      });
    }
    return { config, model: config.models?.[parsed.model]?.id ?? parsed.model, apiKey };
  }
}

export interface ProviderFactory {
  supports(config: ProviderConfig): boolean;
  create(resolved: ResolvedProvider): ModelClient;
}

export class OpenAIProviderFactory implements ProviderFactory {
  supports(config: ProviderConfig): boolean {
    return providerSdk(config) === "openai";
  }

  create(resolved: ResolvedProvider): ModelClient {
    return new OpenAIProviderAdapter({ baseURL: resolved.config.baseURL, apiKey: resolved.apiKey });
  }
}

export class AnthropicProviderFactory implements ProviderFactory {
  supports(config: ProviderConfig): boolean {
    return providerSdk(config) === "anthropic";
  }

  create(resolved: ResolvedProvider): ModelClient {
    return new AnthropicProviderAdapter({
      baseURL: resolved.config.baseURL,
      apiKey: resolved.apiKey,
      maxTokens: resolved.config.maxTokens ?? 4096,
    });
  }
}

export class ProviderFactoryRegistry {
  constructor(private readonly factories: ProviderFactory[] = [new OpenAIProviderFactory(), new AnthropicProviderFactory()]) {}

  create(resolved: ResolvedProvider): ModelClient {
    const factory = this.factories.find((candidate) => candidate.supports(resolved.config));
    if (factory === undefined) {
      throw new HarnessError("config", "NO_PROVIDER_FACTORY", `no provider factory for ${resolved.config.name}`);
    }
    return factory.create(resolved);
  }
}

export interface ProviderAdapterConfig {
  baseURL: string;
  apiKey: string;
}

export class OpenAIProviderAdapter implements ModelClient {
  private readonly client: OpenAIClientLike;

  constructor(config: ProviderAdapterConfig, client?: OpenAIClientLike) {
    this.client = client ?? new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const completion = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages.map(toOpenAIMessage),
      tools: request.tools.map(toOpenAITool),
      stream: false,
    });
    return normalizeOpenAIChatCompletion(completion);
  }
}

export interface AnthropicProviderAdapterConfig extends ProviderAdapterConfig {
  maxTokens: number;
}

export class AnthropicProviderAdapter implements ModelClient {
  private readonly client: AnthropicClientLike;

  constructor(
    private readonly config: AnthropicProviderAdapterConfig,
    client?: AnthropicClientLike,
  ) {
    this.client = client ?? new Anthropic({ apiKey: config.apiKey, baseURL: config.baseURL });
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const mapped = toAnthropicRequest(request.messages);
    const params: MessageCreateParamsNonStreaming = {
      model: request.model,
      max_tokens: this.config.maxTokens,
      messages: mapped.messages,
      tools: request.tools.map(toAnthropicTool),
      stream: false,
      ...(mapped.system === undefined ? {} : { system: mapped.system }),
    };
    const message = await this.client.messages.create(params);
    return normalizeAnthropicMessage(message);
  }
}

export function defaultProviderConfigs(env: NodeJS.ProcessEnv = process.env): ProviderConfig[] {
  return [
    {
      name: "openai",
      sdk: "openai",
      baseURL: env.FANTASTICCODE_OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      apiKeyEnv: "OPENAI_API_KEY",
      defaultModel: "gpt-4.1",
    },
    {
      name: "anthropic",
      sdk: "anthropic",
      baseURL: env.FANTASTICCODE_ANTHROPIC_BASE_URL ?? "https://api.anthropic.com",
      apiKeyEnv: "ANTHROPIC_API_KEY",
      defaultModel: "claude-sonnet-4",
      maxTokens: Number.parseInt(env.FANTASTICCODE_ANTHROPIC_MAX_TOKENS ?? "4096", 10),
    },
    {
      name: "openrouter",
      sdk: "openai",
      baseURL: env.FANTASTICCODE_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
      apiKeyEnv: "OPENROUTER_API_KEY",
    },
  ];
}

function providerSdk(config: ProviderConfig): ProviderSdk {
  if (config.sdk !== undefined) {
    return config.sdk;
  }
  return config.name === "anthropic" ? "anthropic" : "openai";
}

function toOpenAIMessage(message: ModelMessage): ChatCompletionMessageParam {
  if (message.role === "assistant") {
    return {
      role: "assistant",
      content: message.content,
      ...(message.toolCalls === undefined || message.toolCalls.length === 0
        ? {}
        : {
            tool_calls: message.toolCalls.map((call) => ({
              id: call.id,
              type: "function" as const,
              function: { name: call.name, arguments: call.argumentsText },
            })),
          }),
    };
  }
  if (message.role === "tool") {
    return {
      role: "tool",
      tool_call_id: message.toolCallId ?? "",
      content: message.content ?? "",
    };
  }
  return { role: message.role, content: message.content ?? "" };
}

function toOpenAITool(tool: ToolSchema): ChatCompletionTool {
  return {
    type: "function",
    function: {
      name: tool.function.name,
      description: tool.function.description,
      parameters: toOpenAIParameters(tool.function.parameters),
    },
  };
}

function toOpenAIParameters(schema: JsonSchema): Record<string, unknown> {
  return {
    type: schema.type,
    properties: schema.properties,
    ...(schema.required === undefined ? {} : { required: schema.required }),
    ...(schema.additionalProperties === undefined ? {} : { additionalProperties: schema.additionalProperties }),
  };
}

export function normalizeOpenAIChatCompletion(completion: ChatCompletion): ModelResponse {
  const choice = completion.choices[0];
  if (choice === undefined) {
    throw new HarnessError("provider", "MALFORMED_PROVIDER_RESPONSE", "provider response missing choices");
  }
  return {
    text: choice.message.content ?? "",
    toolCalls: normalizeOpenAIToolCalls(choice.message.tool_calls),
    finishReason: choice.finish_reason ?? "unknown",
    ...(completion.usage === undefined ? {} : { usage: normalizeOpenAIUsage(completion.usage) }),
    raw: completion,
  };
}

function normalizeOpenAIToolCalls(value: ChatCompletionMessageToolCall[] | undefined): ModelToolCall[] {
  if (value === undefined) {
    return [];
  }
  return value.flatMap((call) => {
    if (call.type !== "function") {
      return [];
    }
    return [{ id: call.id, name: call.function.name, argumentsText: call.function.arguments }];
  });
}

function normalizeOpenAIUsage(value: NonNullable<ChatCompletion["usage"]>): ModelUsage {
  return {
    promptTokens: value.prompt_tokens,
    completionTokens: value.completion_tokens,
    totalTokens: value.total_tokens,
  };
}

function toAnthropicRequest(messages: ModelMessage[]): { system?: string; messages: MessageParam[] } {
  const system: string[] = [];
  const mapped: MessageParam[] = [];
  for (const message of messages) {
    if (message.role === "system") {
      if (message.content !== null && message.content.trim() !== "") {
        system.push(message.content);
      }
      continue;
    }
    mapped.push(toAnthropicMessage(message));
  }
  return {
    ...(system.length === 0 ? {} : { system: system.join("\n\n") }),
    messages: mapped,
  };
}

function toAnthropicMessage(message: ModelMessage): MessageParam {
  if (message.role === "assistant") {
    const content: ContentBlockParam[] = [];
    if (message.content !== null && message.content !== "") {
      content.push({ type: "text", text: message.content });
    }
    for (const call of message.toolCalls ?? []) {
      content.push({
        type: "tool_use",
        id: call.id,
        name: call.name,
        input: parseToolArguments(call.argumentsText),
      });
    }
    return { role: "assistant", content };
  }
  if (message.role === "tool") {
    return {
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: message.toolCallId ?? "",
          content: message.content ?? "",
        },
      ],
    };
  }
  return { role: "user", content: message.content ?? "" };
}

function toAnthropicTool(tool: ToolSchema): ToolUnion {
  const anthropicTool: Tool = {
    name: tool.function.name,
    description: tool.function.description,
    input_schema: toAnthropicInputSchema(tool.function.parameters),
  };
  return anthropicTool;
}

function toAnthropicInputSchema(schema: JsonSchema): Tool.InputSchema {
  return {
    type: "object",
    properties: schema.properties,
    ...(schema.required === undefined ? {} : { required: schema.required }),
    ...(schema.additionalProperties === undefined ? {} : { additionalProperties: schema.additionalProperties }),
  };
}

function parseToolArguments(argumentsText: string): JsonObject {
  let parsed: unknown;
  try {
    parsed = JSON.parse(argumentsText);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HarnessError("provider", "MALFORMED_TOOL_ARGUMENTS", "tool call arguments must be valid JSON for Anthropic", { message });
  }
  return asJsonObject(parsed, "tool call arguments");
}

export function normalizeAnthropicMessage(message: Message): ModelResponse {
  const textBlocks: string[] = [];
  const toolCalls: ModelToolCall[] = [];
  for (const block of message.content) {
    if (block.type === "text") {
      textBlocks.push(block.text);
    }
    if (block.type === "tool_use") {
      toolCalls.push({ id: block.id, name: block.name, argumentsText: JSON.stringify(block.input) });
    }
  }
  return {
    text: textBlocks.join("\n"),
    toolCalls,
    finishReason: message.stop_reason ?? "unknown",
    usage: {
      promptTokens: message.usage.input_tokens,
      completionTokens: message.usage.output_tokens,
      totalTokens: message.usage.input_tokens + message.usage.output_tokens,
    },
    raw: message,
  };
}

function asJsonObject(value: unknown, label: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HarnessError("provider", "MALFORMED_PROVIDER_RESPONSE", `${label} must be an object`);
  }
  return value as JsonObject;
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
