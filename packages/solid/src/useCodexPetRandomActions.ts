import {
  createCodexPetRandomActionRunner,
  type CodexPetId,
  type CodexPetRandomActionRunnerOptions
} from "codex-pet-web";
import { createEffect, onCleanup } from "solid-js";
import { useCodexPet } from "./context.jsx";

export function useCodexPetRandomActions(
  id: CodexPetId | undefined,
  options: CodexPetRandomActionRunnerOptions
): void {
  const pet = useCodexPet(id);

  createEffect(() => {
    const runner = createCodexPetRandomActionRunner(pet, options);
    runner.start();

    onCleanup(() => {
      runner.destroy();
    });
  });
}
