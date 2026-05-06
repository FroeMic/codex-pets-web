import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("demo defaults", () => {
  const source = readFileSync(join(import.meta.dirname, "../src/main.tsx"), "utf8");
  const styles = readFileSync(join(import.meta.dirname, "../src/styles.css"), "utf8");

  it("starts pets at a compact size", () => {
    expect(source).toContain("useState(0.5)");
  });

  it("starts animation at a calmer frame rate", () => {
    expect(source).toContain("useState(4)");
  });

  it("allows pets to be downsized below the default", () => {
    expect(source).toContain('min="0.25"');
  });

  it("uses a dotted canvas background", () => {
    expect(styles).toContain("radial-gradient");
  });
});
