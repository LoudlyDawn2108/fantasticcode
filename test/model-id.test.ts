import { describe, expect, it } from "vitest";
import { parseProviderModel } from "../src/model-id.js";

describe("parseProviderModel", () => {
  it("splits on the first slash", () => {
    expect(parseProviderModel("openrouter/anthropic/claude")).toEqual({
      provider: "openrouter",
      model: "anthropic/claude",
    });
  });

  it("rejects missing provider/model parts", () => {
    expect(() => parseProviderModel("openai")).toThrow("provider/model");
    expect(() => parseProviderModel("openai/")).toThrow("provider/model");
  });
});
