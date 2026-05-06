import {
  createCodexPetRandomActionRunner,
  type CodexPetId,
  type CodexPetRandomActionRunner
} from "codex-pet-web";
import { onDestroy, onMount } from "svelte";
import { useCodexPet } from "./context.js";
import type { CodexPetRandomActionRunnerOptions } from "codex-pet-web";

export function useCodexPetRandomActions(
  id: CodexPetId | undefined,
  options: CodexPetRandomActionRunnerOptions
): CodexPetRandomActionRunner {
  const pet = useCodexPet(id);
  const runner = createCodexPetRandomActionRunner(pet, options);

  onMount(() => {
    runner.start();

    return () => {
      runner.destroy();
    };
  });

  onDestroy(() => {
    runner.destroy();
  });

  return runner;
}
