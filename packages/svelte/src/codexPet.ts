import {
  createCodexPetRegistry,
  type CodexPetConfig,
  type CodexPetController,
  type CodexPetDragOptions,
  type CodexPetId,
  type CodexPetManifest,
  type CodexPetRegistry
} from "codex-pet-web";

export interface CodexPetActionOptions extends Partial<CodexPetConfig> {
  id?: CodexPetId;
  manifest?: CodexPetManifest;
  registry?: CodexPetRegistry;
}

export interface CodexPetAction {
  update(options: CodexPetActionOptions): void;
  destroy(): void;
}

function getDefinedConfig(
  config: Partial<CodexPetConfig>
): Partial<CodexPetConfig> {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined)
  ) as Partial<CodexPetConfig>;
}

function getPetId(options: CodexPetActionOptions): CodexPetId {
  return options.id ?? options.manifest?.id ?? "default";
}

function getConfig(options: CodexPetActionOptions): Partial<CodexPetConfig> {
  const {
    id: _id,
    manifest: _manifest,
    registry: _registry,
    ...config
  } = options;

  return getDefinedConfig(config);
}

function resolveController(
  options: CodexPetActionOptions,
  localRegistry: { current: CodexPetRegistry | null }
): CodexPetController {
  const petId = getPetId(options);
  const config = getConfig(options);
  let registry = options.registry ?? localRegistry.current;

  if (!registry) {
    if (!options.spritesheetUrl) {
      throw new Error(
        "codexPet requires spritesheetUrl when used without a registry."
      );
    }

    registry = createCodexPetRegistry({
      defaultPetId: petId,
      pets: {
        [petId]: { ...config, spritesheetUrl: options.spritesheetUrl }
      }
    });
    localRegistry.current = registry;
  }

  return registry.has(petId)
    ? registry.get(petId)
    : options.spritesheetUrl
      ? registry.register(petId, {
          ...config,
          spritesheetUrl: options.spritesheetUrl
        })
      : registry.get(petId);
}

export function codexPet(
  node: HTMLElement,
  options: CodexPetActionOptions
): CodexPetAction {
  const localRegistry = { current: null as CodexPetRegistry | null };
  let currentOptions = options;
  let currentId = getPetId(options);
  let controller = resolveController(options, localRegistry);

  node.dataset.codexPet = currentId;
  controller.bind(node);

  return {
    update(nextOptions) {
      const nextId = getPetId(nextOptions);

      if (nextId !== currentId || nextOptions.registry !== currentOptions.registry) {
        controller.unbind(node);
        currentOptions = nextOptions;
        currentId = nextId;
        controller = resolveController(nextOptions, localRegistry);
        node.dataset.codexPet = currentId;
        controller.bind(node);
        return;
      }

      currentOptions = nextOptions;
      controller.setConfig(getConfig(nextOptions));
    },
    destroy() {
      controller.unbind(node);
    }
  };
}

export function createCodexPetAction(registry: CodexPetRegistry) {
  return (
    node: HTMLElement,
    options: Omit<CodexPetActionOptions, "registry">
  ): CodexPetAction => codexPet(node, { ...options, registry });
}

export type { CodexPetDragOptions };
