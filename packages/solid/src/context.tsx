import {
  createCodexPetRegistry,
  type CodexPetConfig,
  type CodexPetController,
  type CodexPetId,
  type CodexPetRegistry
} from "codex-pet-web";
import {
  createContext,
  createEffect,
  useContext,
  type JSX
} from "solid-js";

export interface CodexPetProviderProps {
  children?: JSX.Element;
  defaultPetId?: CodexPetId;
  pets?: Record<CodexPetId, CodexPetConfig>;
  registry?: CodexPetRegistry;
}

export const CodexPetRegistryContext =
  createContext<CodexPetRegistry | null>(null);

export function CodexPetProvider(props: CodexPetProviderProps): JSX.Element {
  const registry =
    props.registry ??
    createCodexPetRegistry({
      defaultPetId: props.defaultPetId,
      pets: props.pets
    });

  createEffect(() => {
    const pets = props.pets;

    if (!pets) {
      return;
    }

    for (const [id, config] of Object.entries(pets)) {
      registry.register(id, config);
    }
  });

  return (
    <CodexPetRegistryContext.Provider value={registry}>
      {props.children}
    </CodexPetRegistryContext.Provider>
  );
}

export function useCodexPet(id?: CodexPetId): CodexPetController {
  const registry = useContext(CodexPetRegistryContext);

  if (!registry) {
    throw new Error("useCodexPet must be used inside CodexPetProvider.");
  }

  return registry.get(id);
}
