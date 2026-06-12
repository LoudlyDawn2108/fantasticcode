# fantasticcode

`fantasticcode` is a scriptable TypeScript CLI agent harness. It accepts command-line flags, calls model providers through SDK-backed adapters, executes a small workspace-safe toolset, and persists resumable sessions in `.fantasticcode/state.sqlite`.

## Install

```bash
npm install
npm run build
```

Node `>=22.12.0` is required.

## Usage

```bash
fantasticcode --model openai/gpt-4.1 --prompt "inspect this repo"
fantasticcode --continue --prompt "continue the last task"
fantasticcode --session sess_123 --prompt "resume this session"
fantasticcode --session sess_123 --fork --prompt "try another approach"
fantasticcode --agent reviewer --model openai/gpt-4.1 --prompt "review the repo"
fantasticcode --debug --model openai/gpt-4.1 --prompt "trace this run"
```

If `--prompt` is omitted, piped stdin is used. New sessions use `--model provider/model` or the configured default model; continued sessions can reuse the stored provider and model.
Use `--debug` or `FANTASTICCODE_DEBUG=1` to write `.fantasticcode/debug.ndjson` events.

## Configuration

The harness loads user-editable JSON config in this order:

```text
built-in defaults
  -> agent-harness.config.json
  -> agent-harness.local.json
  -> CLI/runtime overrides
```

`agent-harness.config.json` is intended for shared provider, model, runner, and agent settings. `agent-harness.local.json` is for private API keys and local overrides.

Agents use JSON metadata plus Markdown prompt bodies:

```json
{
  "version": 1,
  "defaults": { "model": "openai/gpt-4.1", "agent": "coder" },
  "providers": {
    "openai": {
      "sdk": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "apiKeyEnv": "OPENAI_API_KEY",
      "defaultModel": "gpt-4.1"
    }
  },
  "agents": {
    "coder": {
      "promptFile": "./agents/coder.md",
      "enabledTools": ["read", "edit", "apply_patch", "bash"]
    },
    "reviewer": {
      "extends": "coder",
      "promptFile": "./agents/reviewer.md",
      "enabledTools": ["read", "bash"]
    }
  },
  "runner": { "maxToolTurns": 8 }
}
```

## Providers

Built-in providers use official SDK adapters where available:

| Provider | SDK | Base URL env override | API key env |
|---|---|---|
| `openai` | OpenAI SDK | `FANTASTICCODE_OPENAI_BASE_URL` | `OPENAI_API_KEY` |
| `anthropic` | Anthropic SDK | `FANTASTICCODE_ANTHROPIC_BASE_URL` | `ANTHROPIC_API_KEY` |
| `openrouter` | OpenAI SDK-compatible | `FANTASTICCODE_OPENROUTER_BASE_URL` | `OPENROUTER_API_KEY` |

Anthropic requests also read `FANTASTICCODE_ANTHROPIC_MAX_TOKENS` when set; otherwise the adapter uses `4096`.

## Tools

Built-in agent tools are `read`, `edit`, `apply_patch`, and `bash`. File tools are sandboxed to the workspace. The `bash` tool runs in the workspace, has a timeout/output cap, and rejects obviously destructive commands.

## QA

```bash
npm run qa
```

The QA script runs TypeScript checks, Vitest, build, package dry-run, and CLI help smoke validation.
