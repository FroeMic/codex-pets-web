"use client";

import {
  createCodexPetRandomActionRunner,
  type CodexPetId,
  type CodexPetRandomActionRunnerOptions
} from "codex-pet-web";
import { useEffect } from "react";
import { useCodexPet } from "./CodexPetProvider.js";

export function useCodexPetRandomActions(
  id: CodexPetId | undefined,
  options: CodexPetRandomActionRunnerOptions
): void {
  const pet = useCodexPet(id);

  useEffect(() => {
    const runner = createCodexPetRandomActionRunner(pet, options);
    runner.start();

    return () => {
      runner.destroy();
    };
  }, [pet, options]);
}
