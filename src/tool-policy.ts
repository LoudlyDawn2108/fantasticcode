import type { JsonObject, JsonSchema, JsonValue, ToolCommand, ToolExecutionRequest, ToolResultEnvelope } from "./contracts.js";
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
  registry: ToolRegistry;
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
      new WorkspaceSandboxHandler(),
      new RiskPolicyHandler(),
      new ToolExecutionHandler(),
    ],
  ) {}

  async execute(request: ToolExecutionRequest): Promise<ToolResultEnvelope> {
    const context: ToolPolicyContext = { ...request, registry: this.registry };
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
    return next({ ...input, tool: input.registry.lookup(input.call.name) });
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

class WorkspaceSandboxHandler implements ToolPolicyHandler {
  async handle(input: ToolPolicyContext, next: (input: ToolPolicyContext) => Promise<ToolResultEnvelope>): Promise<ToolResultEnvelope> {
    const args = input.args ?? {};
    if ((input.call.name === "read" || input.call.name === "edit") && typeof args.path === "string") {
      await input.workspace.resolveExistingPath(args.path);
    }
    if (input.call.name === "apply_patch" && typeof args.patch === "string") {
      for (const operation of parsePatchSandboxOperations(args.patch)) {
        if (operation.kind === "add") {
          await input.workspace.resolveWritablePath(operation.path);
        } else {
          await input.workspace.resolveExistingPath(operation.path);
        }
      }
    }
    return next(input);
  }
}

class RiskPolicyHandler implements ToolPolicyHandler {
  async handle(input: ToolPolicyContext, next: (input: ToolPolicyContext) => Promise<ToolResultEnvelope>): Promise<ToolResultEnvelope> {
    const args = input.args ?? {};
    if (input.call.name === "bash" && typeof args.command === "string") {
      denyDestructiveCommand(args.command);
    }
    return next(input);
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

export function createToolPolicyPipeline(registry: ToolRegistry): ToolPolicyPipeline {
  const handlers: ToolPolicyHandler[] = [
    new ToolLookupHandler(),
    new EnabledToolHandler(),
    new ToolArgsHandler(),
    new WorkspaceSandboxHandler(),
    new RiskPolicyHandler(),
    new ToolExecutionHandler(),
  ];
  return new ToolPolicyPipeline(registry, handlers);
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
    if (!hasOwn(input, required)) {
      throw new HarnessError("tool", "MISSING_TOOL_ARGUMENT", `missing required tool argument: ${required}`);
    }
  }
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(input)) {
      if (!hasOwn(schema.properties, key)) {
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
    if (!matchesSchemaType(value, property.type)) {
      throw new HarnessError("tool", "INVALID_TOOL_ARGUMENT", `${key} must be a ${property.type}`);
    }
  }
}

function matchesSchemaType(value: JsonValue, type: JsonSchema["properties"][string]["type"]): boolean {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return typeof value === "object" && value !== null && !Array.isArray(value);
    case "array":
      return Array.isArray(value);
  }
}

type PatchSandboxOperation = { kind: "add" | "update" | "delete"; path: string };

function parsePatchSandboxOperations(patch: string): PatchSandboxOperation[] {
  const lines = patch.split(/\r?\n/);
  const operations: PatchSandboxOperation[] = [];
  for (const line of lines) {
    if (line.startsWith("*** Add File: ")) {
      operations.push({ kind: "add", path: line.slice("*** Add File: ".length) });
    } else if (line.startsWith("*** Update File: ")) {
      operations.push({ kind: "update", path: line.slice("*** Update File: ".length) });
    } else if (line.startsWith("*** Delete File: ")) {
      operations.push({ kind: "delete", path: line.slice("*** Delete File: ".length) });
    }
  }
  return operations;
}

function denyDestructiveCommand(command: string): void {
  if (commandSegments(command).some(isDestructiveCommandSegment)) {
    throw new HarnessError("tool", "DESTRUCTIVE_COMMAND_DENIED", "command denied by risk policy");
  }
}

function commandSegments(command: string): string[] {
  return command.split(/[;&|\n]+/).map((segment) => segment.trim()).filter((segment) => segment.length > 0);
}

function isDestructiveCommandSegment(segment: string): boolean {
  const tokens = segment.toLowerCase().split(/\s+/).map(normalizeShellToken).filter((token) => token.length > 0);
  return deniesRmRecursiveForce(tokens) || deniesWindowsDeletion(tokens) || deniesGitHardReset(tokens) || deniesFormatDrive(tokens);
}

function normalizeShellToken(token: string): string {
  return token.replace(/^[^a-z0-9/:.-]+/i, "").replace(/[^a-z0-9/:.-]+$/i, "");
}

function deniesRmRecursiveForce(tokens: string[]): boolean {
  const rmIndex = tokens.indexOf("rm");
  if (rmIndex === -1) {
    return false;
  }
  const flags = tokens.slice(rmIndex + 1).filter((token) => token.startsWith("-"));
  const recursive = flags.some((flag) => flag === "--recursive" || /^-[a-z]*r[a-z]*$/i.test(flag));
  const force = flags.some((flag) => flag === "--force" || /^-[a-z]*f[a-z]*$/i.test(flag));
  return recursive && force;
}

function deniesWindowsDeletion(tokens: string[]): boolean {
  const delIndex = tokens.indexOf("del");
  const rmdirIndex = tokens.indexOf("rmdir");
  const rdIndex = tokens.indexOf("rd");
  return (
    (delIndex !== -1 && tokens.slice(delIndex + 1).includes("/s")) ||
    (rmdirIndex !== -1 && tokens.slice(rmdirIndex + 1).includes("/s")) ||
    (rdIndex !== -1 && tokens.slice(rdIndex + 1).includes("/s"))
  );
}

function deniesGitHardReset(tokens: string[]): boolean {
  const gitIndex = tokens.indexOf("git");
  return gitIndex !== -1 && tokens[gitIndex + 1] === "reset" && tokens.slice(gitIndex + 2).includes("--hard");
}

function deniesFormatDrive(tokens: string[]): boolean {
  const formatIndex = tokens.indexOf("format");
  return formatIndex !== -1 && tokens.slice(formatIndex + 1).some((token) => /^[a-z]:$/.test(token));
}

function hasOwn(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}
