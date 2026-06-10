import type { RunnerStateName } from "./contracts.js";
import { HarnessError } from "./errors.js";

export interface RunnerStateContext {
  history: RunnerStateName[];
}

export interface RunnerState {
  readonly name: RunnerStateName;
  enter(ctx: RunnerStateContext): void;
  transitionTo(next: RunnerStateName): RunnerState;
}

export class RunnerStateMachine {
  private current: RunnerState = new InitializedState();
  readonly history: RunnerStateName[] = [this.current.name];

  get state(): RunnerStateName {
    return this.current.name;
  }

  transitionTo(next: RunnerStateName): void {
    this.current = this.current.transitionTo(next);
    this.history.push(this.current.name);
    this.current.enter(this);
  }
}

abstract class BaseRunnerState implements RunnerState {
  abstract readonly name: RunnerStateName;

  enter(): void {}

  protected invalidTransition(next: RunnerStateName): never {
    throw new HarnessError("runner", "INVALID_RUNNER_TRANSITION", `invalid transition ${this.name} -> ${next}`);
  }

  abstract transitionTo(next: RunnerStateName): RunnerState;
}

class InitializedState extends BaseRunnerState {
  readonly name = "initialized";

  transitionTo(next: RunnerStateName): RunnerState {
    if (next === "resolving") {
      return new ResolvingState();
    }
    return this.invalidTransition(next);
  }
}

class ResolvingState extends BaseRunnerState {
  readonly name = "resolving";

  transitionTo(next: RunnerStateName): RunnerState {
    if (next === "running") {
      return new RunningState();
    }
    if (next === "failed") {
      return new FailedState();
    }
    return this.invalidTransition(next);
  }
}

class RunningState extends BaseRunnerState {
  readonly name = "running";

  transitionTo(next: RunnerStateName): RunnerState {
    if (next === "waitingForTool") {
      return new WaitingForToolState();
    }
    if (next === "persisting") {
      return new PersistingState();
    }
    if (next === "failed") {
      return new FailedState();
    }
    return this.invalidTransition(next);
  }
}

class WaitingForToolState extends BaseRunnerState {
  readonly name = "waitingForTool";

  transitionTo(next: RunnerStateName): RunnerState {
    if (next === "running") {
      return new RunningState();
    }
    if (next === "failed") {
      return new FailedState();
    }
    return this.invalidTransition(next);
  }
}

class PersistingState extends BaseRunnerState {
  readonly name = "persisting";

  transitionTo(next: RunnerStateName): RunnerState {
    if (next === "completed") {
      return new CompletedState();
    }
    if (next === "failed") {
      return new FailedState();
    }
    return this.invalidTransition(next);
  }
}

class CompletedState extends BaseRunnerState {
  readonly name = "completed";

  transitionTo(next: RunnerStateName): RunnerState {
    return this.invalidTransition(next);
  }
}

class FailedState extends BaseRunnerState {
  readonly name = "failed";

  transitionTo(next: RunnerStateName): RunnerState {
    return this.invalidTransition(next);
  }
}
