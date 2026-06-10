import type { ModelMessage, PreparedRun, RunResult } from "./contracts.js";
import { HarnessError, exitCodeForError, normalizeError } from "./errors.js";
import { RunnerStateMachine } from "./state-machine.js";
import { toolSchemasForCommands } from "./provider.js";

export class Runner {
  async run(prepared: PreparedRun): Promise<RunResult> {
    const machine = new RunnerStateMachine();
    try {
      machine.transitionTo("resolving");
      const session = prepared.session;
      await prepared.eventBus.publish({ type: "run:started", sessionId: session.id });
      session.messages.push({ role: "user", content: prepared.request.prompt });
      machine.transitionTo("running");

      let finalOutput = "";
      for (let turn = 0; turn <= prepared.agent.maxToolTurns; turn += 1) {
        const response = await prepared.modelClient.complete({
          model: prepared.model,
          messages: buildModelMessages(prepared),
          tools: toolSchemasForCommands(prepared.toolRegistry.enabled(prepared.agent.enabledTools)),
        });
        await prepared.eventBus.publish({ type: "model:response", sessionId: session.id, finishReason: response.finishReason });

        if (response.toolCalls.length === 0) {
          finalOutput = response.text;
          session.messages.push({ role: "assistant", content: finalOutput });
          machine.transitionTo("persisting");
          await prepared.sessionStore.save(session, { updateLatest: prepared.updateLatest });
          await prepared.eventBus.publish({ type: "session:saved", sessionId: session.id });
          machine.transitionTo("completed");
          await prepared.eventBus.publish({ type: "run:completed", sessionId: session.id, output: finalOutput });
          return { sessionId: session.id, output: finalOutput, exitCode: 0 };
        }

        if (turn === prepared.agent.maxToolTurns) {
          throw new HarnessError("runner", "MAX_TOOL_TURNS", "maximum tool turns reached");
        }

        session.messages.push({ role: "assistant", content: response.text === "" ? null : response.text, toolCalls: response.toolCalls });
        machine.transitionTo("waitingForTool");
        for (const call of response.toolCalls) {
          await prepared.eventBus.publish({ type: "tool:started", sessionId: session.id, name: call.name });
          const result = await prepared.toolPolicy.execute({
            call,
            enabledTools: prepared.agent.enabledTools,
            workspace: prepared.workspace,
          });
          session.messages.push({
            role: "tool",
            name: result.name,
            toolCallId: result.toolCallId,
            content: result.output,
          });
          await prepared.eventBus.publish({
            type: "tool:completed",
            sessionId: session.id,
            name: call.name,
            success: result.success,
          });
        }
        machine.transitionTo("running");
      }

      throw new HarnessError("runner", "MAX_TOOL_TURNS", "maximum tool turns reached");
    } catch (error) {
      const harnessError = normalizeError(error);
      if (machine.state !== "failed" && machine.state !== "completed") {
        try {
          machine.transitionTo("failed");
        } catch (transitionError) {
          const ignored = transitionError instanceof Error ? transitionError.message : String(transitionError);
          void ignored;
        }
      }
      await prepared.eventBus.publish({ type: "run:failed", sessionId: prepared.session.id, error: harnessError.toJSON() });
      await prepared.sessionStore.save(prepared.session, { updateLatest: prepared.updateLatest });
      return {
        sessionId: prepared.session.id,
        output: harnessError.message,
        exitCode: exitCodeForError(harnessError.kind),
        error: harnessError.toJSON(),
      };
    }
  }
}

function buildModelMessages(prepared: PreparedRun): ModelMessage[] {
  return [{ role: "system", content: prepared.agent.systemPrompt }, ...prepared.session.messages];
}
