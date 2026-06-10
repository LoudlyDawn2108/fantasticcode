import type { AgentPreset } from "./contracts.js";
import { HarnessError } from "./errors.js";

export class AgentRegistry {
  private readonly presets = new Map<string, AgentPreset>();

  constructor(presets: AgentPreset[] = defaultAgentPresets()) {
    for (const preset of presets) {
      this.presets.set(preset.name, preset);
    }
  }

  resolve(name = "coder"): AgentPreset {
    const preset = this.presets.get(name);
    if (preset === undefined) {
      throw new HarnessError("validation", "UNKNOWN_AGENT", `unknown agent: ${name}`, { name });
    }
    return preset;
  }
}

export function defaultAgentPresets(): AgentPreset[] {
  return [
    {
      name: "coder",
      systemPrompt:
        "You are a concise coding agent. Use tools only when needed, keep changes workspace-local, and return the final answer when complete.",
      enabledTools: ["read", "edit", "apply_patch", "bash"],
      maxToolTurns: 8,
    },
    {
      name: "reviewer",
      systemPrompt:
        "You are a careful code reviewer. Inspect files and commands when useful, prioritize correctness and safety, and report findings clearly.",
      enabledTools: ["read", "bash"],
      maxToolTurns: 4,
    },
  ];
}
