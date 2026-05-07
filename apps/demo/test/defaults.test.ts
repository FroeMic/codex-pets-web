import { existsSync, readFileSync, statSync } from "node:fs";
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
    expect(source).toContain("useState(0.45)");
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

  it("builds production fixtures from lightweight demo pets", () => {
    expect(fixtureScript).toContain('"apps", "demo", "fixture-pets"');

    for (const petId of ["bandit", "carrot", "sapling"]) {
      const petRoot = join(import.meta.dirname, "../fixture-pets", petId);

      expect(existsSync(join(petRoot, "pet.json"))).toBe(true);
      expect(statSync(join(petRoot, "spritesheet.webp")).size).toBeLessThan(
        250_000
      );
    }
  });

  it("loads bundled examples along with local user pets in development", () => {
    expect(localScript).toContain('"packages", "core", "example-pets"');
    expect(localScript).toContain('".codex", "pets"');
  });

  it("runs occasional idle-only random actions", () => {
    expect(source).toContain("createCodexPetRandomActionRunner");
    expect(source).toContain("averageIntervalSeconds: 120");
    expect(source).toContain('{ state: "waving", weight: 3 }');
  });
});
