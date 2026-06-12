# fantasticcode

`fantasticcode` is a scriptable TypeScript CLI agent harness. It accepts command-line flags, calls OpenAI-compatible chat completion endpoints, executes a small workspace-safe toolset, and persists resumable sessions under `.fantasticcode/sessions/`.

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

If `--prompt` is omitted, piped stdin is used. New sessions require `--model provider/model`; continued sessions can reuse the stored provider and model.
Use `--debug` or `FANTASTICCODE_DEBUG=1` to write `.fantasticcode/debug.ndjson` events.

## Providers

Built-in providers are OpenAI-compatible HTTP adapters:

| Provider | Base URL env override | API key env |
|---|---|---|
| `openai` | `FANTASTICCODE_OPENAI_BASE_URL` | `OPENAI_API_KEY` |
| `openrouter` | `FANTASTICCODE_OPENROUTER_BASE_URL` | `OPENROUTER_API_KEY` |

## Tools

Built-in agent tools are `read`, `edit`, `apply_patch`, and `bash`. File tools are sandboxed to the workspace. The `bash` tool runs in the workspace, has a timeout/output cap, and rejects obviously destructive commands.

## QA

```bash
npm run qa
```

The QA script runs TypeScript checks, Vitest, build, package dry-run, and CLI help smoke validation.
