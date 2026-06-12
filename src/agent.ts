import { readFileSync } from "node:fs";
import { isAbsolute, resolve, relative } from "node:path";
import type { AgentPreset } from "./contracts.js";
import { HarnessError } from "./errors.js";

export interface AgentConfig {
  description?: string;
  extends?: string;
  promptFile?: string;
  enabledTools?: string[];
  model?: string;
}

export class AgentRegistry {
  private readonly presets = new Map<string, AgentPreset>();

  constructor(presets: AgentPreset[]) {
    for (const preset of presets) {
      this.presets.set(preset.name, preset);
    }
  }

  resolve(name: string): AgentPreset {
    const preset = this.presets.get(name);
    if (preset === undefined) {
      throw new HarnessError("validation", "UNKNOWN_AGENT", `unknown agent: ${name}`, { name });
    }
    return preset;
  }
}

export interface AgentConfigAdapterOptions {
  workspaceRoot: string;
  promptBaseDir: string;
  additionalPromptRoots?: string[];
}

export class AgentConfigAdapter {
  private readonly allowedPromptRoots: string[];

  constructor(private readonly options: AgentConfigAdapterOptions) {
    this.allowedPromptRoots = [options.workspaceRoot, options.promptBaseDir, ...(options.additionalPromptRoots ?? [])].map((root) => resolve(root));
  }

  load(configs: Record<string, AgentConfig>): AgentPreset[] {
    const building = new Set<string>();
    const built = new Map<string, AgentPreset>();
    return Object.keys(configs).map((name) => this.build(name, configs, building, built));
  }

  private build(name: string, configs: Record<string, AgentConfig>, building: Set<string>, built: Map<string, AgentPreset>): AgentPreset {
    const existing = built.get(name);
    if (existing !== undefined) {
      return existing;
    }
    const config = configs[name];
    if (config === undefined) {
      throw new HarnessError("config", "UNKNOWN_AGENT_BASE", `unknown base agent: ${name}`, { name });
    }
    if (building.has(name)) {
      throw new HarnessError("config", "AGENT_EXTENDS_CYCLE", `agent extends cycle includes: ${name}`, { name });
    }
    building.add(name);
    const base = config.extends === undefined ? undefined : this.build(config.extends, configs, building, built);
    const promptFile = config.promptFile;
    const enabledTools = config.enabledTools ?? base?.enabledTools;
    if ((promptFile === undefined || promptFile.trim() === "") && base === undefined) {
      throw new HarnessError("config", "AGENT_PROMPT_REQUIRED", `agent ${name} must define promptFile`, { name });
    }
    if (enabledTools === undefined || enabledTools.length === 0) {
      throw new HarnessError("config", "AGENT_TOOLS_REQUIRED", `agent ${name} must define enabledTools`, { name });
    }
    const description = config.description ?? base?.description;
    const model = config.model ?? base?.model;
    const preset: AgentPreset = {
      name,
      ...(description === undefined ? {} : { description }),
      systemPrompt: promptFile === undefined ? base?.systemPrompt ?? "" : readFileSync(this.resolvePromptPath(promptFile), "utf8").trim(),
      enabledTools: [...enabledTools],
      ...(model === undefined ? {} : { model }),
    };
    built.set(name, preset);
    building.delete(name);
    return preset;
  }

  private resolvePromptPath(promptFile: string): string {
    const promptPath = resolve(isAbsolute(promptFile) ? promptFile : resolve(this.options.workspaceRoot, promptFile));
    if (!this.allowedPromptRoots.some((root) => pathInside(promptPath, root))) {
      throw new HarnessError("config", "AGENT_PROMPT_OUTSIDE_WORKSPACE", `agent promptFile is outside the workspace: ${promptFile}`, { promptFile });
    }
    return promptPath;
  }
}

function pathInside(path: string, root: string): boolean {
  const rel = relative(root, path);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}
