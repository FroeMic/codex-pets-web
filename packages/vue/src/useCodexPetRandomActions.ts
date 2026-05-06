import {
  createCodexPetRandomActionRunner,
  type CodexPetId,
  type CodexPetRandomActionRunnerOptions
} from "codex-pet-web";
import { onBeforeUnmount, watchEffect } from "vue";
import { useCodexPet } from "./useCodexPet.js";

export function useCodexPetRandomActions(
  id: CodexPetId | undefined,
  options: CodexPetRandomActionRunnerOptions
): void {
  const pet = useCodexPet(id);
  let destroy = () => {};

  watchEffect((onCleanup) => {
    const runner = createCodexPetRandomActionRunner(pet, options);
    runner.start();
    destroy = () => runner.destroy();
    onCleanup(destroy);
  });

  onBeforeUnmount(() => {
    destroy();
  });
}
