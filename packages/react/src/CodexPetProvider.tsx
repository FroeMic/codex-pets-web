"use client";

import {
  createCodexPetRegistry,
  type CodexPetConfig,
  type CodexPetController,
  type CodexPetId,
  type CodexPetRegistry
} from "codex-pet-web";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode
} from "react";

export interface CodexPetProviderProps {
  children?: ReactNode;
  defaultPetId?: CodexPetId;
  pets?: Record<CodexPetId, CodexPetConfig>;
  registry?: CodexPetRegistry;
}

export const CodexPetRegistryContext =
  createContext<CodexPetRegistry | null>(null);

export function CodexPetProvider({
  children,
  defaultPetId,
  pets,
  registry
}: CodexPetProviderProps) {
  const registryRef = useRef<CodexPetRegistry | null>(null);

  if (!registryRef.current) {
    registryRef.current =
      registry ?? createCodexPetRegistry({ defaultPetId, pets });
  }

  useEffect(() => {
    if (!pets) {
      return;
    }

    for (const [id, config] of Object.entries(pets)) {
      registryRef.current?.register(id, config);
    }
  }, [pets]);

  return (
    <CodexPetRegistryContext.Provider value={registryRef.current}>
      {children}
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
