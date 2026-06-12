#!/usr/bin/env node
import { stdin as input, stderr, stdout } from "node:process";
import { fileURLToPath } from "node:url";
import { Command, CommanderError } from "commander";
import type { RunRequest } from "./contracts.js";
import { formatError, normalizeError } from "./errors.js";
import { createDefaultHarness } from "./composition.js";
import { SessionStore, type SessionSummary } from "./session.js";

export interface CliOptions {
  model?: string;
  continue?: boolean;
  session?: string;
  fork?: boolean;
  prompt?: string;
  agent?: string;
  workspace?: string;
  debug?: boolean;
  listSessions?: boolean;
}

export function buildProgram(run: (request: RunRequest) => Promise<number>, listSessions: (workspaceRoot: string) => Promise<number> = defaultListSessions): Command {
  const program = new Command();
  program
    .name("fantasticcode")
    .description("Scriptable CLI coding-agent harness")
    .option("-m, --model <provider/model>", "model selector, such as openai/gpt-4.1")
    .option("-c, --continue", "continue the latest session in this workspace")
    .option("-s, --session <id>", "continue a specific session id")
    .option("-f, --fork", "fork the selected session before running")
    .option("-p, --prompt <text>", "prompt text; if omitted, piped stdin is used")
    .option("-a, --agent <name>", "agent preset")
    .option("-w, --workspace <path>", "workspace root", process.cwd())
    .option("-d, --debug", "write debug event log")
    .option("-ls, --list-sessions", "list saved sessions for the workspace and exit")
    .action(async (options: CliOptions) => {
      if (options.listSessions === true) {
        validateListSessionsOptions(options);
        process.exitCode = await listSessions(options.workspace ?? process.cwd());
        return;
      }
      const prompt = options.prompt ?? (await readPipedStdin());
      const request: RunRequest = {
        prompt,
        ...(options.model === undefined ? {} : { model: options.model }),
        ...(options.agent === undefined ? {} : { agent: options.agent }),
        ...(options.continue === true ? { continueLast: true } : {}),
        ...(options.session === undefined ? {} : { sessionId: options.session }),
        ...(options.fork === true ? { fork: true } : {}),
        ...(options.workspace === undefined ? {} : { workspaceRoot: options.workspace }),
        ...(options.debug === true ? { debug: true } : {}),
      };
      process.exitCode = await run(request);
    });
  return program;
}

export function formatSessionSummaries(summaries: SessionSummary[]): string {
  if (summaries.length === 0) {
    return "No sessions found.";
  }
  return summaries
    .map((summary) => {
      const marker = summary.isLatest ? "*" : " ";
      return `${marker} ${summary.id}  ${summary.updatedAt}  agent=${summary.agent}  model=${summary.provider}/${summary.model}  messages=${summary.messageCount}`;
    })
    .join("\n");
}

async function defaultListSessions(workspaceRoot: string): Promise<number> {
  const summaries = await new SessionStore(workspaceRoot).listSummaries();
  stdout.write(`${formatSessionSummaries(summaries)}\n`);
  return 0;
}

function validateListSessionsOptions(options: CliOptions): void {
  const conflicts = [
    ...(options.model === undefined ? [] : ["--model"]),
    ...(options.prompt === undefined ? [] : ["--prompt"]),
    ...(options.agent === undefined ? [] : ["--agent"]),
    ...(options.continue === true ? ["--continue"] : []),
    ...(options.session === undefined ? [] : ["--session"]),
    ...(options.fork === true ? ["--fork"] : []),
  ];
  if (conflicts.length > 0) {
    throw new CommanderError(2, "commander.listSessionsConflict", `--list-sessions cannot be combined with ${conflicts.join(", ")}`);
  }
}

export async function main(argv = process.argv): Promise<number> {
  const program = buildProgram(async (request) => {
    const harness = createDefaultHarness({
      workspaceRoot: request.workspaceRoot ?? process.cwd(),
      debug: process.env.FANTASTICCODE_DEBUG === "1",
      console: true,
    });
    const result = await harness.run(request);
    if (result.error === undefined) {
      stdout.write(result.output === "" ? "\n" : `${result.output}\n`);
    } else {
      stderr.write(`${formatError(result.error)}\n`);
    }
    return result.exitCode;
  });
  try {
    await program.parseAsync(argv);
    return process.exitCode === undefined ? 0 : Number(process.exitCode);
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.exitCode;
    }
    const normalized = normalizeError(error).toJSON();
    stderr.write(`${formatError(normalized)}\n`);
    return 1;
  }
}

async function readPipedStdin(): Promise<string> {
  if (input.isTTY) {
    return "";
  }
  const chunks: Buffer[] = [];
  for await (const chunk of input) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  const code = await main();
  process.exitCode = code;
}
