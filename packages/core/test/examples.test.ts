import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CODEX_PET_EXAMPLES,
  getCodexPetExample
} from "../src/example-pets";

describe("bundled example pets", () => {
  it("ships the tree, carrot, and raccoon examples with package assets", () => {
    expect(CODEX_PET_EXAMPLES.map((pet) => pet.id)).toEqual([
      "sapling",
      "carrot",
      "bandit"
    ]);

    for (const pet of CODEX_PET_EXAMPLES) {
      expect(getCodexPetExample(pet.id)).toBe(pet);
      expect(pet.manifestPath).toBe(`example-pets/${pet.id}/pet.json`);
      expect(pet.spritesheetPath).toBe(
        `example-pets/${pet.id}/spritesheet.webp`
      );
      expect(
        existsSync(join(process.cwd(), pet.manifestPath))
      ).toBe(true);
      expect(
        existsSync(join(process.cwd(), pet.spritesheetPath))
      ).toBe(true);
    }
  });

  it("includes example pets in the published package surface", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as {
      exports: Record<string, unknown>;
      files: string[];
    };

    expect(packageJson.files).toContain("example-pets");
    expect(packageJson.exports).toHaveProperty("./example-pets");
    expect(packageJson.exports).toHaveProperty("./example-pets/*");
  });
});
