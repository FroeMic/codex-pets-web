import type { CodexPetExample } from "./types.js";

export type CodexPetExampleId = "sapling" | "carrot" | "bandit" | "pinchy";

export const CODEX_PET_EXAMPLES = [
  {
    id: "sapling",
    displayName: "Sapling",
    description:
      "A cute tiny tree companion with a friendly face and little root feet.",
    manifestPath: "example-pets/sapling/pet.json",
    spritesheetPath: "example-pets/sapling/spritesheet.webp"
  },
  {
    id: "carrot",
    displayName: "Carrot",
    description: "A cute carrot companion with leafy green hair and tiny limbs.",
    manifestPath: "example-pets/carrot/pet.json",
    spritesheetPath: "example-pets/carrot/spritesheet.webp"
  },
  {
    id: "bandit",
    displayName: "Bandit",
    description:
      "A cute raccoon Codex companion with a tiny striped tail and bright curious eyes.",
    manifestPath: "example-pets/bandit/pet.json",
    spritesheetPath: "example-pets/bandit/spritesheet.webp"
  },
  {
    id: "pinchy",
    displayName: "Pinchy",
    description: "A helpful cute nerdy lobster Codex pet.",
    manifestPath: "example-pets/pinchy/pet.json",
    spritesheetPath: "example-pets/pinchy/spritesheet.webp"
  }
] as const satisfies readonly CodexPetExample[];

export function getCodexPetExample(
  id: CodexPetExampleId
): (typeof CODEX_PET_EXAMPLES)[number] | undefined {
  return CODEX_PET_EXAMPLES.find((pet) => pet.id === id);
}
