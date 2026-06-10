import { describe, expect, it } from "vitest";
import { RunnerStateMachine } from "../src/state-machine.js";

describe("RunnerStateMachine", () => {
  it("allows legal lifecycle transitions", () => {
    const machine = new RunnerStateMachine();
    machine.transitionTo("resolving");
    machine.transitionTo("running");
    machine.transitionTo("waitingForTool");
    machine.transitionTo("running");
    machine.transitionTo("persisting");
    machine.transitionTo("completed");
    expect(machine.history).toEqual(["initialized", "resolving", "running", "waitingForTool", "running", "persisting", "completed"]);
  });

  it("rejects illegal transitions", () => {
    expect(() => new RunnerStateMachine().transitionTo("running")).toThrow("invalid transition");
  });

  it("keeps failed as a terminal state", () => {
    const machine = new RunnerStateMachine();
    machine.transitionTo("resolving");
    machine.transitionTo("failed");
    expect(machine.state).toBe("failed");
    expect(() => machine.transitionTo("running")).toThrow("invalid transition");
  });
});
