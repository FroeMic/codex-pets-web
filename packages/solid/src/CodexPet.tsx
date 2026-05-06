import {
  createCodexPetRegistry,
  type CodexPetAnimationEvent,
  type CodexPetConfig,
  type CodexPetController,
  type CodexPetDragEvent,
  type CodexPetDragOptions,
  type CodexPetErrorEvent,
  type CodexPetFloatingOptions,
  type CodexPetId,
  type CodexPetManifest,
  type CodexPetState,
  type CodexPetStateChangeEvent,
  type CodexPetStateFps,
  type ReducedMotionPreference
} from "codex-pet-web";
import {
  createEffect,
  createMemo,
  onCleanup,
  splitProps,
  useContext,
  type JSX
} from "solid-js";
import { CodexPetRegistryContext } from "./context.jsx";

type NativeDivProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  | "children"
  | "draggable"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onError"
>;

export interface CodexPetProps extends NativeDivProps {
  id?: CodexPetId;
  manifest?: CodexPetManifest;
  spritesheetUrl?: string;
  state?: CodexPetState;
  scale?: number;
  fps?: number;
  stateFps?: CodexPetStateFps;
  paused?: boolean;
  reducedMotion?: ReducedMotionPreference;
  imageRendering?: JSX.CSSProperties["image-rendering"];
  floating?: boolean | CodexPetFloatingOptions;
  draggable?: boolean | CodexPetDragOptions;
  preload?: boolean;
  onReady?: () => void;
  onError?: (event: CodexPetErrorEvent) => void;
  onStateChange?: (event: CodexPetStateChangeEvent) => void;
  onAnimationStart?: (event: CodexPetAnimationEvent) => void;
  onAnimationLoop?: (event: CodexPetAnimationEvent) => void;
  onAnimationEnd?: (event: CodexPetAnimationEvent) => void;
  onFrameChange?: (event: CodexPetAnimationEvent) => void;
  onPetDragStart?: (event: CodexPetDragEvent) => void;
  onPetDrag?: (event: CodexPetDragEvent) => void;
  onPetDragEnd?: (event: CodexPetDragEvent) => void;
}

function getDefinedConfig(
  config: Partial<CodexPetConfig>
): Partial<CodexPetConfig> {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined)
  ) as Partial<CodexPetConfig>;
}

export function CodexPet(props: CodexPetProps): JSX.Element {
  const [local, divProps] = splitProps(props, [
    "id",
    "manifest",
    "spritesheetUrl",
    "state",
    "scale",
    "fps",
    "stateFps",
    "paused",
    "reducedMotion",
    "imageRendering",
    "floating",
    "draggable",
    "preload",
    "onReady",
    "onError",
    "onStateChange",
    "onAnimationStart",
    "onAnimationLoop",
    "onAnimationEnd",
    "onFrameChange",
    "onPetDragStart",
    "onPetDrag",
    "onPetDragEnd"
  ]);
  const contextRegistry = useContext(CodexPetRegistryContext);
  const petId = createMemo(() => local.id ?? local.manifest?.id ?? "default");
  const config = createMemo(() =>
    getDefinedConfig({
      spritesheetUrl: local.spritesheetUrl,
      state: local.state,
      scale: local.scale,
      fps: local.fps,
      stateFps: local.stateFps,
      paused: local.paused,
      reducedMotion: local.reducedMotion,
      imageRendering: String(local.imageRendering ?? "pixelated"),
      floating: local.floating,
      draggable:
        local.draggable && typeof local.draggable === "object"
          ? {
              ...local.draggable,
              onDragStart: (event) => {
                local.draggable && typeof local.draggable === "object"
                  ? local.draggable.onDragStart?.(event)
                  : undefined;
                local.onPetDragStart?.(event);
              },
              onDrag: (event) => {
                local.draggable && typeof local.draggable === "object"
                  ? local.draggable.onDrag?.(event)
                  : undefined;
                local.onPetDrag?.(event);
              },
              onDragEnd: (event) => {
                local.draggable && typeof local.draggable === "object"
                  ? local.draggable.onDragEnd?.(event)
                  : undefined;
                local.onPetDragEnd?.(event);
              }
            }
          : local.draggable
            ? {
                onDragStart: (event) => local.onPetDragStart?.(event),
                onDrag: (event) => local.onPetDrag?.(event),
                onDragEnd: (event) => local.onPetDragEnd?.(event)
              }
            : undefined,
      preload: local.preload,
      onReady: () => local.onReady?.(),
      onError: (event) => local.onError?.(event),
      onStateChange: (event) => local.onStateChange?.(event),
      onAnimationStart: (event) => local.onAnimationStart?.(event),
      onAnimationLoop: (event) => local.onAnimationLoop?.(event),
      onAnimationEnd: (event) => local.onAnimationEnd?.(event),
      onFrameChange: (event) => local.onFrameChange?.(event)
    })
  );
  const localRegistry =
    !contextRegistry && local.spritesheetUrl
      ? createCodexPetRegistry({
          defaultPetId: petId(),
          pets: {
            [petId()]: {
              ...config(),
              spritesheetUrl: local.spritesheetUrl
            }
          }
        })
      : null;
  const registry = contextRegistry ?? localRegistry;

  if (!registry) {
    throw new Error(
      "CodexPet requires spritesheetUrl when used without CodexPetProvider."
    );
  }

  const controller = createMemo<CodexPetController>(() =>
    registry.has(petId())
      ? registry.get(petId())
      : local.spritesheetUrl
        ? registry.register(petId(), {
            ...config(),
            spritesheetUrl: local.spritesheetUrl
          })
        : registry.get(petId())
  );
  let element: HTMLDivElement | undefined;
  let boundController: CodexPetController | null = null;

  createEffect(() => {
    controller().setConfig(config());
  });

  createEffect(() => {
    const nextController = controller();

    if (!element || boundController === nextController) {
      return;
    }

    boundController?.unbind(element);
    nextController.bind(element);
    boundController = nextController;
  });

  onCleanup(() => {
    boundController?.unbind(element);
  });

  return (
    <div
      {...divProps}
      aria-hidden={props["aria-label"] ? undefined : "true"}
      data-codex-pet={petId()}
      ref={element}
      role={props["aria-label"] ? "img" : divProps.role}
    />
  );
}
