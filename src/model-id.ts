import type { ProviderModel } from "./contracts.js";
import { HarnessError } from "./errors.js";

export function parseProviderModel(value: string): ProviderModel {
  const separator = value.indexOf("/");
  if (separator <= 0 || separator === value.length - 1) {
    throw new HarnessError(
      "validation",
      "INVALID_MODEL_SELECTOR",
      "model must use provider/model format",
      { value },
    );
  }
  return {
    provider: value.slice(0, separator),
    model: value.slice(separator + 1),
  };
}
