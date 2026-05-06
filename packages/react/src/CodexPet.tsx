import {
  createCodexPetAnimator,
  createCodexPetDragController,
  type CodexPetAnimationEvent,
  type CodexPetAnimator,
  type CodexPetDragController,
  type CodexPetDragEvent,
  type CodexPetDragOptions,
  type CodexPetErrorEvent,
  type CodexPetFloatingOptions,
  type CodexPetManifest,
  type CodexPetPlayOptions,
  type CodexPetPosition,
  type CodexPetState,
  type CodexPetStateChangeEvent,
  type CodexPetStateFps,
  type ReducedMotionPreference
} from "codex-pet-web";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type HTMLAttributes
} from "react";
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
  setState(state: CodexPetState): void;
  pause(): void;
  resume(): void;
  setPosition(position: CodexPetPosition): void;
  getPosition(): CodexPetPosition | null;
  getState(): CodexPetState;
  getBaseState(): CodexPetState;
  getFrame(): number;
}

export interface CodexPetProps extends NativeDivProps {
  manifest?: CodexPetManifest;
  spritesheetUrl: string;
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

export const CodexPet = forwardRef<CodexPetHandle, CodexPetProps>(
  function CodexPet(
    {
      manifest,
      spritesheetUrl,
      state = "idle",
      scale = 1,
      fps = 8,
      stateFps,
      paused = false,
      reducedMotion = "user-preference",
      imageRendering = "pixelated",
      floating,
      draggable,
      preload = true,
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
    const elementRef = useRef<HTMLDivElement>(null);
    const animatorRef = useRef<CodexPetAnimator | null>(null);
    const dragControllerRef = useRef<CodexPetDragController | null>(null);
    const stateBeforeDragRef = useRef<CodexPetState | null>(null);
    const initialFloatingRef = useRef(floating);
    const initialDraggableRef = useRef(draggable);
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

    useEffect(() => {
      const element = elementRef.current;
      if (!element) {
        return;
      }

      const animator = createCodexPetAnimator(element, {
        spritesheetUrl,
        state,
        scale,
        fps,
        stateFps,
        paused,
        reducedMotion,
        imageRendering: String(imageRendering),
        preload,
        onReady: () => callbacksRef.current.onReady?.(),
        onError: (event: CodexPetErrorEvent) =>
          callbacksRef.current.onError?.(event),
        onStateChange: (event: CodexPetStateChangeEvent) =>
          callbacksRef.current.onStateChange?.(event),
        onAnimationStart: (event: CodexPetAnimationEvent) =>
          callbacksRef.current.onAnimationStart?.(event),
        onAnimationLoop: (event: CodexPetAnimationEvent) =>
          callbacksRef.current.onAnimationLoop?.(event),
        onAnimationEnd: (event: CodexPetAnimationEvent) =>
          callbacksRef.current.onAnimationEnd?.(event),
        onFrameChange: (event: CodexPetAnimationEvent) =>
          callbacksRef.current.onFrameChange?.(event)
      });

      animatorRef.current = animator;

      return () => {
        animator.destroy();
        if (animatorRef.current === animator) {
          animatorRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      const element = elementRef.current;
      const initialFloating = initialFloatingRef.current;
      const initialDraggable = initialDraggableRef.current;

      if (!element || (!initialFloating && !initialDraggable)) {
        return;
      }

      const dragOptions =
        typeof initialDraggable === "object" ? initialDraggable : {};
      const dragController = createCodexPetDragController(element, {
        floating: initialFloating,
        draggable: initialDraggable
          ? {
              ...dragOptions,
              onDragStart: (event: CodexPetDragEvent) => {
                stateBeforeDragRef.current =
                  animatorRef.current?.getBaseState() ?? null;
                dragOptions.onDragStart?.(event);
                callbacksRef.current.onPetDragStart?.(event);
              },
              onDrag: (event: CodexPetDragEvent) => {
                if (event.deltaX > 0) {
                  animatorRef.current?.setBaseState("running-right");
                } else if (event.deltaX < 0) {
                  animatorRef.current?.setBaseState("running-left");
                }

                dragOptions.onDrag?.(event);
                callbacksRef.current.onPetDrag?.(event);
              },
              onDragEnd: (event: CodexPetDragEvent) => {
                if (stateBeforeDragRef.current) {
                  animatorRef.current?.setBaseState(stateBeforeDragRef.current);
                  stateBeforeDragRef.current = null;
                }

                dragOptions.onDragEnd?.(event);
                callbacksRef.current.onPetDragEnd?.(event);
              }
            }
          : false
      });

      dragControllerRef.current = dragController;

      return () => {
        dragController.destroy();
        if (dragControllerRef.current === dragController) {
          dragControllerRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      animatorRef.current?.setBaseState(state);
    }, [state]);

    useEffect(() => {
      animatorRef.current?.setSpritesheetUrl(spritesheetUrl);
    }, [spritesheetUrl]);

    useEffect(() => {
      animatorRef.current?.setScale(scale);
    }, [scale]);

    useEffect(() => {
      animatorRef.current?.setFps(fps);
    }, [fps]);

    useEffect(() => {
      animatorRef.current?.setStateFps(stateFps ?? {});
    }, [stateFps]);

    useEffect(() => {
      animatorRef.current?.setPaused(paused);
    }, [paused]);

    useEffect(() => {
      animatorRef.current?.setReducedMotion(reducedMotion);
    }, [reducedMotion]);

    useEffect(() => {
      animatorRef.current?.setImageRendering(String(imageRendering));
    }, [imageRendering]);

    useImperativeHandle(
      ref,
      () => ({
        play: (nextState, options) => {
          animatorRef.current?.play(nextState, options);
        },
        setState: (nextState) => {
          animatorRef.current?.setBaseState(nextState);
        },
        pause: () => {
          animatorRef.current?.pause();
        },
        resume: () => {
          animatorRef.current?.resume();
        },
        setPosition: (position) => {
          dragControllerRef.current?.setPosition(position);
        },
        getPosition: () => dragControllerRef.current?.getPosition() ?? null,
        getState: () => animatorRef.current?.getState() ?? state,
        getBaseState: () => animatorRef.current?.getBaseState() ?? state,
        getFrame: () => animatorRef.current?.getFrame() ?? 0
      }),
      [state]
    );

    const accessibleRole = ariaLabel ? role ?? "img" : role;
    const accessibleHidden =
      ariaHidden ?? (ariaLabel ? undefined : true);

    return (
      <div
        {...divProps}
        aria-hidden={accessibleHidden}
        aria-label={ariaLabel}
        className={className}
        data-codex-pet={manifest?.id ?? ""}
        ref={elementRef}
        role={accessibleRole}
        style={style}
      />
    );
  }
);
