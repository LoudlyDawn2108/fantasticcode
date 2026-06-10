import type { JsonObject, JsonSchema, ToolCommand, ToolExecutionRequest, ToolResultEnvelope } from "./contracts.js";
import { HarnessError } from "./errors.js";

export class ToolRegistry {
  private readonly tools = new Map<string, ToolCommand>();

  constructor(tools: ToolCommand[] = []) {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  register(tool: ToolCommand): void {
    this.tools.set(tool.name, tool);
  }

  lookup(name: string): ToolCommand {
    const tool = this.tools.get(name);
    if (tool === undefined) {
      throw new HarnessError("tool", "UNKNOWN_TOOL", `unsupported tool: ${name}`, { name });
    }
    return tool;
  }

  list(): ToolCommand[] {
    return Array.from(this.tools.values());
  }

  enabled(names: string[]): ToolCommand[] {
    return names.map((name) => this.lookup(name));
  }
}

export interface ToolPolicyHandler {
  handle(input: ToolPolicyContext, next: (input: ToolPolicyContext) => Promise<ToolResultEnvelope>): Promise<ToolResultEnvelope>;
}

interface ToolPolicyContext extends ToolExecutionRequest {
  tool?: ToolCommand;
  args?: JsonObject;
}

export class ToolPolicyPipeline {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly handlers: ToolPolicyHandler[] = [
      new ToolLookupHandler(),
      new EnabledToolHandler(),
      new ToolArgsHandler(),
      new ToolExecutionHandler(),
    ],
  ) {}

  async execute(request: ToolExecutionRequest): Promise<ToolResultEnvelope> {
    const context: ToolPolicyContext = { ...request };
    const invoke = async (index: number, nextContext: ToolPolicyContext): Promise<ToolResultEnvelope> => {
      const handler = this.handlers[index];
      if (handler === undefined) {
        throw new HarnessError("tool", "TOOL_POLICY_INCOMPLETE", "tool policy chain ended before execution");
      }
      return handler.handle(nextContext, (input) => invoke(index + 1, input));
    };
    try {
      return await invoke(0, context);
    } catch (error) {
      const harnessError = error instanceof HarnessError ? error : new HarnessError("tool", "TOOL_FAILED", String(error));
      return {
        toolCallId: request.call.id,
        name: request.call.name,
        success: false,
        output: harnessError.message,
        error: harnessError.toJSON(),
      };
    }
  }

  getRegistry(): ToolRegistry {
    return this.registry;
  }
}

class ToolLookupHandler implements ToolPolicyHandler {
  async handle(input: ToolPolicyContext, next: (input: ToolPolicyContext) => Promise<ToolResultEnvelope>): Promise<ToolResultEnvelope> {
    const pipeline = getPipelineRegistry(input);
    return next({ ...input, tool: pipeline.lookup(input.call.name) });
  }
}

class EnabledToolHandler implements ToolPolicyHandler {
  async handle(input: ToolPolicyContext, next: (input: ToolPolicyContext) => Promise<ToolResultEnvelope>): Promise<ToolResultEnvelope> {
    if (!input.enabledTools.includes(input.call.name)) {
      throw new HarnessError("tool", "TOOL_DISABLED", `tool is not enabled: ${input.call.name}`);
    }
    return next(input);
  }
}

class ToolArgsHandler implements ToolPolicyHandler {
  async handle(input: ToolPolicyContext, next: (input: ToolPolicyContext) => Promise<ToolResultEnvelope>): Promise<ToolResultEnvelope> {
    const tool = requireTool(input);
    const parsed = parseToolArguments(input.call.argumentsText);
    validateAgainstSchema(parsed, tool.schema);
    return next({ ...input, args: parsed });
  }
}

class ToolExecutionHandler implements ToolPolicyHandler {
  async handle(input: ToolPolicyContext): Promise<ToolResultEnvelope> {
    const tool = requireTool(input);
    const args = input.args ?? {};
    const result = await tool.execute({ workspace: input.workspace }, args);
    const output = typeof result === "string" ? result : JSON.stringify(result);
    return {
      toolCallId: input.call.id,
      name: input.call.name,
      success: true,
      output: output.length > 64 * 1024 ? output.slice(0, 64 * 1024) : output,
      result,
      truncated: output.length > 64 * 1024,
    };
  }
}

const registryByContext = new WeakMap<ToolPolicyContext, ToolRegistry>();

export function createToolPolicyPipeline(registry: ToolRegistry): ToolPolicyPipeline {
  const handlers: ToolPolicyHandler[] = [
    {
      async handle(input, next) {
        registryByContext.set(input, registry);
        return next(input);
      },
    },
    new ToolLookupHandler(),
    new EnabledToolHandler(),
    new ToolArgsHandler(),
    new ToolExecutionHandler(),
  ];
  return new ToolPolicyPipeline(registry, handlers);
}

function getPipelineRegistry(input: ToolPolicyContext): ToolRegistry {
  const registry = registryByContext.get(input);
  if (registry === undefined) {
    throw new HarnessError("tool", "TOOL_POLICY_INCOMPLETE", "tool registry was not provided");
  }
  return registry;
}

function requireTool(input: ToolPolicyContext): ToolCommand {
  if (input.tool === undefined) {
    throw new HarnessError("tool", "TOOL_POLICY_INCOMPLETE", "tool lookup did not run");
  }
  return input.tool;
}

function parseToolArguments(text: string): JsonObject {
  try {
    const parsed = text.trim() === "" ? {} : JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new HarnessError("tool", "INVALID_TOOL_ARGUMENTS", "tool arguments must be a JSON object");
    }
    return parsed as JsonObject;
  } catch (error) {
    if (error instanceof HarnessError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new HarnessError("tool", "INVALID_TOOL_ARGUMENTS", `tool arguments are not valid JSON: ${message}`);
  }
}

export function validateAgainstSchema(input: JsonObject, schema: JsonSchema): void {
  for (const required of schema.required ?? []) {
    if (!(required in input)) {
      throw new HarnessError("tool", "MISSING_TOOL_ARGUMENT", `missing required tool argument: ${required}`);
    }
  }
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(input)) {
      if (!(key in schema.properties)) {
        throw new HarnessError("tool", "UNKNOWN_TOOL_ARGUMENT", `unknown tool argument: ${key}`);
      }
    }
  }
  for (const [key, property] of Object.entries(schema.properties)) {
    const value = input[key];
    if (value === undefined) {
      continue;
    }
    if (property.type === "number") {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new HarnessError("tool", "INVALID_TOOL_ARGUMENT", `${key} must be a number`);
      }
      if (property.minimum !== undefined && value < property.minimum) {
        throw new HarnessError("tool", "INVALID_TOOL_ARGUMENT", `${key} is below minimum`);
      }
      if (property.maximum !== undefined && value > property.maximum) {
        throw new HarnessError("tool", "INVALID_TOOL_ARGUMENT", `${key} is above maximum`);
      }
      continue;
    }
    if (property.type === "string" && typeof value !== "string") {
      throw new HarnessError("tool", "INVALID_TOOL_ARGUMENT", `${key} must be a string`);
    }
  }
}
