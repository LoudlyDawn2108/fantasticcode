import type { ErrorKind, ExitCode, SerializableError } from "./contracts.js";

export class HarnessError extends Error {
  readonly kind: ErrorKind;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(kind: ErrorKind, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "HarnessError";
    this.kind = kind;
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
  }

  toJSON(): SerializableError {
    return {
      kind: this.kind,
      code: this.code,
      message: this.message,
      ...(this.details === undefined ? {} : { details: this.details }),
    };
  }
}

export function exitCodeForError(kind: ErrorKind): ExitCode {
  switch (kind) {
    case "validation":
      return 2;
    case "config":
      return 3;
    case "provider":
      return 4;
    case "tool":
      return 5;
    case "session":
      return 6;
    case "runner":
      return 7;
    case "unexpected":
      return 1;
  }
}

export function normalizeError(error: unknown): HarnessError {
  if (error instanceof HarnessError) {
    return error;
  }
  if (error instanceof Error) {
    return new HarnessError("unexpected", "UNEXPECTED_ERROR", error.message);
  }
  return new HarnessError("unexpected", "UNEXPECTED_ERROR", String(error));
}

export function formatError(error: SerializableError): string {
  return `${error.kind}:${error.code}: ${error.message}`;
}
