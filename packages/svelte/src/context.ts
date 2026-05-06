import { getContext, setContext } from "svelte";
import {
  createCodexPetRegistry,
  type CodexPetConfig,
  type CodexPetController,
  type CodexPetId,
  type CodexPetRegistry
} from "codex-pet-web";

const codexPetRegistryKey = Symbol("CodexPetRegistry");

export interface CreateCodexPetContextOptions {
  defaultPetId?: CodexPetId;
  pets?: Record<CodexPetId, CodexPetConfig>;
  registry?: CodexPetRegistry;
}

export function createCodexPetContext(
  options: CreateCodexPetContextOptions = {}
): CodexPetRegistry {
  const registry =
    options.registry ??
    createCodexPetRegistry({
      defaultPetId: options.defaultPetId,
      pets: options.pets
    });

  setContext(codexPetRegistryKey, registry);
  return registry;
}

export function getCodexPetRegistry(): CodexPetRegistry {
  const registry = getContext<CodexPetRegistry | undefined>(
    codexPetRegistryKey
  );

  if (!registry) {
    throw new Error("getCodexPetRegistry must be used below createCodexPetContext.");
  }

  return registry;
}

export function useCodexPet(id?: CodexPetId): CodexPetController {
  return getCodexPetRegistry().get(id);
}
