import { Inject, Injectable, InjectionToken, Optional, type Provider } from "@angular/core";
import {
  createCodexPetRandomActionRunner,
  createCodexPetRegistry,
  type CodexPetConfig,
  type CodexPetController,
  type CodexPetId,
  type CodexPetRandomActionRunner,
  type CodexPetRandomActionRunnerOptions,
  type CodexPetRegistry,
  type CreateCodexPetRegistryOptions
} from "codex-pet-web";

export const CODEX_PET_OPTIONS =
  new InjectionToken<CreateCodexPetRegistryOptions>("CODEX_PET_OPTIONS");

export function provideCodexPets(
  options: CreateCodexPetRegistryOptions = {}
): Provider[] {
  return [{ provide: CODEX_PET_OPTIONS, useValue: options }];
}

@Injectable({ providedIn: "root" })
export class CodexPetRegistryService {
  readonly registry: CodexPetRegistry;

  constructor(
    @Optional()
    @Inject(CODEX_PET_OPTIONS)
    options?: CreateCodexPetRegistryOptions
  ) {
    this.registry = createCodexPetRegistry(options);
  }

  get(id?: CodexPetId): CodexPetController {
    return this.registry.get(id);
  }

  register(id: CodexPetId, config: CodexPetConfig): CodexPetController {
    return this.registry.register(id, config);
  }

  remove(id?: CodexPetId): void {
    this.registry.remove(id);
  }

  list(): CodexPetController[] {
    return this.registry.list();
  }

  createRandomActionRunner(
    id: CodexPetId | undefined,
    options: CodexPetRandomActionRunnerOptions
  ): CodexPetRandomActionRunner {
    return createCodexPetRandomActionRunner(this.get(id), options);
  }
}
