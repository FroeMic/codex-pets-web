import { createCodexPetAnimator } from "./animator.js";
import { createCodexPetDragController } from "./drag.js";
import type {
  CodexPetAnimationEvent,
  CodexPetAnimator,
  CodexPetConfig,
  CodexPetController,
  CodexPetDragController,
  CodexPetDragEvent,
  CodexPetDragOptions,
  CodexPetFloatingOptions,
  CodexPetId,
  CodexPetPlayOptions,
  CodexPetPosition,
  CodexPetRegistry,
  CodexPetRegistryListener,
  CodexPetSetStateOptions,
  CodexPetSnapshot,
  CodexPetState,
  CodexPetStateChangeEvent,
  CreateCodexPetRegistryOptions
} from "./types.js";

const DEFAULT_PET_ID = "default";
const DEFAULT_STATE: CodexPetState = "idle";
const DEFAULT_SCALE = 1;
const DEFAULT_FPS = 8;

function getInitialPosition(config: CodexPetConfig): CodexPetPosition | null {
  if (typeof config.floating !== "object") {
    return null;
  }

  if (config.floating.x === undefined && config.floating.y === undefined) {
    return null;
  }

  return {
    x: config.floating.x ?? 24,
    y: config.floating.y ?? 24
  };
}

function getFloatingConfig(
  config: CodexPetConfig,
  position: CodexPetPosition | null
): boolean | CodexPetFloatingOptions | undefined {
  if (!position) {
    return config.floating;
  }

  const floating = typeof config.floating === "object" ? config.floating : {};
  return {
    ...floating,
    ...position
  };
}

class CodexPetControllerImpl implements CodexPetController {
  private config: CodexPetConfig;
  private readonly listeners = new Set<CodexPetRegistryListener>();
  private readonly unregister: (id: CodexPetId) => void;
  private element: HTMLElement | null = null;
  private animator: CodexPetAnimator | null = null;
  private dragController: CodexPetDragController | null = null;
  private baseState: CodexPetState;
  private state: CodexPetState;
  private frame = 0;
  private position: CodexPetPosition | null;
  private hidden: boolean;
  private removed = false;

  constructor(
    readonly id: CodexPetId,
    config: CodexPetConfig,
    unregister: (id: CodexPetId) => void
  ) {
    this.config = { ...config };
    this.unregister = unregister;
    this.baseState = config.state ?? DEFAULT_STATE;
    this.state = this.baseState;
    this.position = getInitialPosition(config);
    this.hidden = config.hidden ?? false;
  }

  bind(element: HTMLElement): void {
    this.assertNotRemoved();

    if (this.element && this.element !== element) {
      this.destroyBinding();
    }

    this.element = element;
    this.animator = createCodexPetAnimator(element, {
      ...this.config,
      state: this.baseState,
      paused: this.config.paused || this.hidden,
      onReady: () => this.config.onReady?.(),
      onError: (event) => this.config.onError?.(event),
      onStateChange: (event) => {
        this.state = event.state;
        this.config.onStateChange?.(event);
        this.notify();
      },
      onAnimationStart: (event) => {
        this.state = event.state;
        this.config.onAnimationStart?.(event);
        this.notify();
      },
      onAnimationLoop: (event) => this.config.onAnimationLoop?.(event),
      onAnimationEnd: (event) => {
        this.state = this.baseState;
        this.config.onAnimationEnd?.(event);
        this.notify();
      },
      onFrameChange: (event: CodexPetAnimationEvent) => {
        this.frame = event.frame;
        this.state = event.state;
        this.config.onFrameChange?.(event);
      }
    });

    this.bindDragging(element);
    this.applyVisibility();
    this.notify();
  }

  unbind(element?: HTMLElement): void {
    if (element && this.element && element !== this.element) {
      return;
    }

    this.destroyBinding();
    this.notify();
  }

  play(state: CodexPetState, options?: CodexPetPlayOptions): void {
    this.assertNotRemoved();
    this.state = state;
    this.frame = 0;
    this.animator?.play(state, options);
    this.notify();
  }

  setState(state: CodexPetState, options?: CodexPetSetStateOptions): void {
    this.assertNotRemoved();
    this.baseState = state;
    this.state = state;
    this.frame = 0;
    this.animator?.setBaseState(state, options);
    this.notify();
  }

  setConfig(config: Partial<CodexPetConfig>): void {
    this.assertNotRemoved();
    this.config = { ...this.config, ...config };

    if (config.state) {
      this.baseState = config.state;
      this.state = config.state;
      this.animator?.setBaseState(config.state, { interrupt: true });
    }

    if (config.spritesheetUrl) {
      this.animator?.setSpritesheetUrl(config.spritesheetUrl);
    }

    if (config.scale !== undefined) {
      this.animator?.setScale(config.scale);
    }

    if (config.fps !== undefined) {
      this.animator?.setFps(config.fps);
    }

    if (config.stateFps !== undefined) {
      this.animator?.setStateFps(config.stateFps);
    }

    if (config.paused !== undefined) {
      this.animator?.setPaused(config.paused || this.hidden);
    }

    if (config.reducedMotion !== undefined) {
      this.animator?.setReducedMotion(config.reducedMotion);
    }

    if (config.imageRendering !== undefined) {
      this.animator?.setImageRendering(config.imageRendering);
    }

    this.notify();
  }

  setPosition(position: CodexPetPosition): void {
    this.assertNotRemoved();
    this.position = { ...position };
    this.dragController?.setPosition(position);
    this.notify();
  }

  hide(): void {
    this.assertNotRemoved();
    this.hidden = true;
    this.applyVisibility();
    this.notify();
  }

  show(): void {
    this.assertNotRemoved();
    this.hidden = false;
    this.applyVisibility();
    this.notify();
  }

  remove(): void {
    if (this.removed) {
      return;
    }

    this.removed = true;
    this.destroyBinding();
    this.unregister(this.id);
    this.notify();
  }

  getSnapshot(): CodexPetSnapshot {
    return {
      id: this.id,
      spritesheetUrl: this.config.spritesheetUrl,
      state: this.animator?.getState() ?? this.state,
      baseState: this.animator?.getBaseState() ?? this.baseState,
      frame: this.animator?.getFrame() ?? this.frame,
      scale: this.config.scale ?? DEFAULT_SCALE,
      fps: this.config.fps ?? DEFAULT_FPS,
      position: this.position ? { ...this.position } : null,
      hidden: this.hidden,
      mounted: this.element !== null,
      paused: this.config.paused ?? false,
      removed: this.removed
    };
  }

  subscribe(listener: CodexPetRegistryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private bindDragging(element: HTMLElement): void {
    const userDragOptions: CodexPetDragOptions =
      typeof this.config.draggable === "object" ? this.config.draggable : {};
    let stateBeforeDrag: CodexPetState | null = null;
    const draggable = this.config.draggable
      ? {
          ...userDragOptions,
          onDragStart: (event: CodexPetDragEvent) => {
            stateBeforeDrag = this.animator?.getBaseState() ?? this.baseState;
            userDragOptions.onDragStart?.(event);
          },
          onDrag: (event: CodexPetDragEvent) => {
            this.position = { x: event.x, y: event.y };

            if (event.deltaX > 0) {
              this.setState("running-right", { interrupt: true });
            } else if (event.deltaX < 0) {
              this.setState("running-left", { interrupt: true });
            } else {
              this.notify();
            }

            userDragOptions.onDrag?.(event);
          },
          onDragEnd: (event: CodexPetDragEvent) => {
            this.position = { x: event.x, y: event.y };
            const returnTo = stateBeforeDrag;

            if (returnTo) {
              this.setState(returnTo, { interrupt: true });
              this.play("jumping", { loops: 1, returnTo });
              stateBeforeDrag = null;
            } else {
              this.notify();
            }

            userDragOptions.onDragEnd?.(event);
          }
        }
      : false;

    const floating = getFloatingConfig(this.config, this.position);

    if (!floating && !draggable) {
      return;
    }

    this.dragController = createCodexPetDragController(element, {
      floating,
      draggable
    });
    this.position = this.dragController.getPosition();
  }

  private applyVisibility(): void {
    if (!this.element) {
      return;
    }

    this.element.style.display = this.hidden ? "none" : "inline-block";
    this.element.style.pointerEvents = this.hidden ? "none" : "";
    this.animator?.setPaused(Boolean(this.config.paused || this.hidden));
  }

  private destroyBinding(): void {
    this.dragController?.destroy();
    this.dragController = null;
    this.animator?.destroy();
    this.animator = null;

    if (this.element) {
      this.element.style.backgroundImage = "";
    }

    this.element = null;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private assertNotRemoved(): void {
    if (this.removed) {
      throw new Error(`Codex pet "${this.id}" has been removed.`);
    }
  }
}

class CodexPetRegistryImpl implements CodexPetRegistry {
  readonly defaultPetId: CodexPetId;
  private readonly controllers = new Map<CodexPetId, CodexPetControllerImpl>();
  private readonly listeners = new Set<CodexPetRegistryListener>();

  constructor(options: CreateCodexPetRegistryOptions = {}) {
    this.defaultPetId = options.defaultPetId ?? DEFAULT_PET_ID;

    for (const [id, config] of Object.entries(options.pets ?? {})) {
      this.register(id, config);
    }
  }

  get(id = this.defaultPetId): CodexPetController {
    const controller = this.controllers.get(id);

    if (!controller) {
      throw new Error(`Codex pet "${id}" is not registered.`);
    }

    return controller;
  }

  has(id = this.defaultPetId): boolean {
    return this.controllers.has(id);
  }

  register(id: CodexPetId, config: CodexPetConfig): CodexPetController {
    const current = this.controllers.get(id);

    if (current) {
      current.setConfig(config);
      return current;
    }

    const controller = new CodexPetControllerImpl(id, config, (petId) => {
      this.controllers.delete(petId);
      this.notify();
    });
    this.controllers.set(id, controller);
    this.notify();
    return controller;
  }

  remove(id = this.defaultPetId): void {
    this.get(id).remove();
  }

  list(): CodexPetController[] {
    return Array.from(this.controllers.values());
  }

  subscribe(listener: CodexPetRegistryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export function createCodexPetRegistry(
  options: CreateCodexPetRegistryOptions = {}
): CodexPetRegistry {
  return new CodexPetRegistryImpl(options);
}
