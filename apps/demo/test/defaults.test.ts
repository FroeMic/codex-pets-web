import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("demo defaults", () => {
  const source = readFileSync(join(import.meta.dirname, "../src/main.tsx"), "utf8");
  const styles = readFileSync(join(import.meta.dirname, "../src/styles.css"), "utf8");
  const fixtureScript = readFileSync(
    join(import.meta.dirname, "../../../scripts/copy-fixture-pets.mjs"),
    "utf8"
  );
  const localScript = readFileSync(
    join(import.meta.dirname, "../../../scripts/copy-local-pets.mjs"),
    "utf8"
  );

  it("starts pets at a compact size", () => {
    expect(source).toContain("useState(0.5)");
  });

  it("keeps idle calmer while action states stay responsive", () => {
    expect(source).toContain("useState(8)");
    expect(source).toContain("idle: 2");
  });

  it("jumps when the pet is hovered", () => {
    expect(source).toContain("onPointerEnter");
    expect(source).toContain('play("jumping"');
  });

  it("allows pets to be downsized below the default", () => {
    expect(source).toContain('min="0.25"');
    expect(source).toContain('step="0.05"');
  });

  it("uses a dotted canvas background", () => {
    expect(styles).toContain("radial-gradient");
  });

  it("builds production fixtures from bundled example pets", () => {
    expect(fixtureScript).toContain('"packages", "core", "example-pets"');
  });

  it("loads bundled examples along with local user pets in development", () => {
    expect(localScript).toContain('"packages", "core", "example-pets"');
    expect(localScript).toContain('".codex", "pets"');
  });
});
