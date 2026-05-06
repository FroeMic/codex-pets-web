"use client";

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
  type CodexPetPlayOptions,
  type CodexPetPosition,
  type CodexPetSetStateOptions,
  type CodexPetSnapshot,
  type CodexPetState,
  type CodexPetStateChangeEvent,
  type CodexPetStateFps,
  type ReducedMotionPreference
} from "codex-pet-web";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type HTMLAttributes
} from "react";
import { CodexPetRegistryContext } from "./CodexPetProvider.js";
import { useLatest } from "./useLatest.js";

type NativeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "children"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "draggable"
  | "onError"
>;

export interface CodexPetHandle {
  play(state: CodexPetState, options?: CodexPetPlayOptions): void;
  setState(state: CodexPetState, options?: CodexPetSetStateOptions): void;
  pause(): void;
  resume(): void;
  hide(): void;
  show(): void;
  remove(): void;
  setPosition(position: CodexPetPosition): void;
  getPosition(): CodexPetPosition | null;
  getState(): CodexPetState;
  getBaseState(): CodexPetState;
  getFrame(): number;
  getSnapshot(): CodexPetSnapshot;
}

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
  imageRendering?: CSSProperties["imageRendering"];
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

export const CodexPet = forwardRef<CodexPetHandle, CodexPetProps>(
  function CodexPet(
    {
      id,
      manifest,
      spritesheetUrl,
      state,
      scale,
      fps,
      stateFps,
      paused,
      reducedMotion,
      imageRendering = "pixelated",
      floating,
      draggable,
      preload,
      onReady,
      onError,
      onStateChange,
      onAnimationStart,
      onAnimationLoop,
      onAnimationEnd,
      onFrameChange,
      onPetDragStart,
      onPetDrag,
      onPetDragEnd,
      className,
      style,
      role,
      "aria-label": ariaLabel,
      "aria-hidden": ariaHidden,
      ...divProps
    },
    ref
  ) {
    const contextRegistry = useContext(CodexPetRegistryContext);
    const localRegistryRef = useRef<ReturnType<typeof createCodexPetRegistry> | null>(
      null
    );
    const elementRef = useRef<HTMLDivElement>(null);
    const petId = id ?? manifest?.id ?? "default";
    const callbacksRef = useLatest({
      onReady,
      onError,
      onStateChange,
      onAnimationStart,
      onAnimationLoop,
      onAnimationEnd,
      onFrameChange,
      onPetDragStart,
      onPetDrag,
      onPetDragEnd
    });

    const config = getDefinedConfig({
      spritesheetUrl,
      state,
      scale,
      fps,
      stateFps,
      paused,
      reducedMotion,
      imageRendering: String(imageRendering),
      floating,
      draggable:
        draggable && typeof draggable === "object"
          ? {
              ...draggable,
              onDragStart: (event) => {
                draggable.onDragStart?.(event);
                callbacksRef.current.onPetDragStart?.(event);
              },
              onDrag: (event) => {
                draggable.onDrag?.(event);
                callbacksRef.current.onPetDrag?.(event);
              },
              onDragEnd: (event) => {
                draggable.onDragEnd?.(event);
                callbacksRef.current.onPetDragEnd?.(event);
              }
            }
          : draggable
            ? {
                onDragStart: (event) =>
                  callbacksRef.current.onPetDragStart?.(event),
                onDrag: (event) => callbacksRef.current.onPetDrag?.(event),
                onDragEnd: (event) =>
                  callbacksRef.current.onPetDragEnd?.(event)
              }
            : undefined,
      preload,
      onReady: () => callbacksRef.current.onReady?.(),
      onError: (event) => callbacksRef.current.onError?.(event),
      onStateChange: (event) => callbacksRef.current.onStateChange?.(event),
      onAnimationStart: (event) =>
        callbacksRef.current.onAnimationStart?.(event),
      onAnimationLoop: (event) =>
        callbacksRef.current.onAnimationLoop?.(event),
      onAnimationEnd: (event) => callbacksRef.current.onAnimationEnd?.(event),
      onFrameChange: (event) => callbacksRef.current.onFrameChange?.(event)
    });

    if (!contextRegistry && !localRegistryRef.current) {
      if (!spritesheetUrl) {
        throw new Error(
          "CodexPet requires spritesheetUrl when used without CodexPetProvider."
        );
      }

      localRegistryRef.current = createCodexPetRegistry({
        defaultPetId: petId,
        pets: {
          [petId]: { ...config, spritesheetUrl }
        }
      });
    }

    const registry = contextRegistry ?? localRegistryRef.current;

    if (!registry) {
      throw new Error("CodexPet could not create a pet registry.");
    }

    const controller: CodexPetController = registry.has(petId)
      ? registry.get(petId)
      : spritesheetUrl
        ? registry.register(petId, { ...config, spritesheetUrl })
        : registry.get(petId);

    useEffect(() => {
      controller.setConfig(config);
    }, [
      controller,
      spritesheetUrl,
      state,
      scale,
      fps,
      stateFps,
      paused,
      reducedMotion,
      imageRendering,
      floating,
      draggable,
      preload
    ]);

    useEffect(() => {
      const element = elementRef.current;

      if (!element) {
        return;
      }

      controller.bind(element);

      return () => {
        controller.unbind(element);
      };
    }, [controller]);

    useImperativeHandle(
      ref,
      () => ({
        play: (nextState, options) => controller.play(nextState, options),
        setState: (nextState, options) => controller.setState(nextState, options),
        pause: () => controller.setConfig({ paused: true }),
        resume: () => controller.setConfig({ paused: false }),
        hide: () => controller.hide(),
        show: () => controller.show(),
        remove: () => controller.remove(),
        setPosition: (position) => controller.setPosition(position),
        getPosition: () => controller.getSnapshot().position,
        getState: () => controller.getSnapshot().state,
        getBaseState: () => controller.getSnapshot().baseState,
        getFrame: () => controller.getSnapshot().frame,
        getSnapshot: () => controller.getSnapshot()
      }),
      [controller]
    );

    const accessibleRole = ariaLabel ? role ?? "img" : role;
    const accessibleHidden = ariaHidden ?? (ariaLabel ? undefined : true);

    return (
      <div
        {...divProps}
        aria-hidden={accessibleHidden}
        aria-label={ariaLabel}
        className={className}
        data-codex-pet={petId}
        ref={elementRef}
        role={accessibleRole}
        style={style}
      />
    );
  }
);
