import type { InjectionKey } from "vue";
import type { CodexPetRegistry } from "codex-pet-web";

export const codexPetRegistryKey: InjectionKey<CodexPetRegistry> =
  Symbol("CodexPetRegistry");
