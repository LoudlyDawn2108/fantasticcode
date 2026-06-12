#!/usr/bin/env node
import { stdin as input, stderr, stdout } from "node:process";
import { fileURLToPath } from "node:url";
import { Command, CommanderError } from "commander";
import type { RunRequest } from "./contracts.js";
import { formatError, normalizeError } from "./errors.js";
import { createDefaultHarness } from "./composition.js";

export interface CliOptions {
  model?: string;
  continue?: boolean;
  session?: string;
  fork?: boolean;
  prompt?: string;
  agent?: string;
  workspace?: string;
  debug?: boolean;
}

export function buildProgram(run: (request: RunRequest) => Promise<number>): Command {
  const program = new Command();
  program
    .name("fantasticcode")
    .description("Scriptable CLI coding-agent harness")
    .option("-m, --model <provider/model>", "model selector, such as openai/gpt-4.1")
    .option("-c, --continue", "continue the latest session in this workspace")
    .option("-s, --session <id>", "continue a specific session id")
    .option("--fork", "fork the selected session before running")
    .option("--prompt <text>", "prompt text; if omitted, piped stdin is used")
    .option("--agent <name>", "agent preset")
    .option("--workspace <path>", "workspace root", process.cwd())
    .option("--debug", "write debug event log")
    .action(async (options: CliOptions) => {
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

export async function main(argv = process.argv): Promise<number> {
  const harness = createDefaultHarness({ debug: process.env.FANTASTICCODE_DEBUG === "1", console: true });
  const program = buildProgram(async (request) => {
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
