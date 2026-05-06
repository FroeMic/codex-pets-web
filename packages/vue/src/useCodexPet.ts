import { inject } from "vue";
import type { CodexPetController, CodexPetId } from "codex-pet-web";
import { codexPetRegistryKey } from "./context.js";

export function useCodexPet(id?: CodexPetId): CodexPetController {
  const registry = inject(codexPetRegistryKey);

  if (!registry) {
    throw new Error("useCodexPet must be used inside CodexPetProvider.");
  }

  return registry.get(id);
}
