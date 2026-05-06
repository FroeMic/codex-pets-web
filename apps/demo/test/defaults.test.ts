import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("demo defaults", () => {
  const source = readFileSync(join(import.meta.dirname, "../src/main.tsx"), "utf8");

  it("starts pets at a compact size", () => {
    expect(source).toContain("useState(1)");
  });

  it("starts animation at a calmer frame rate", () => {
    expect(source).toContain("useState(4)");
  });
});
