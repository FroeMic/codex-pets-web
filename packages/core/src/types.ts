export type CodexPetState =
  | "idle"
  | "running-right"
  | "running-left"
  | "waving"
  | "jumping"
  | "failed"
  | "waiting"
  | "running"
  | "review";

export interface CodexPetManifest {
  id: string;
  displayName: string;
  description: string;
  spritesheetPath: string;
}

export interface CodexPetAtlas {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  width: number;
  height: number;
}

export interface CodexPetStateConfig {
  row: number;
  frames: number;
}

export type ReducedMotionPreference = boolean | "user-preference";

export interface CodexPetFrame {
  state: CodexPetState;
  row: number;
  frame: number;
  frames: number;
}

export interface GetPetFrameOptions {
  state: CodexPetState;
  frame?: number;
}

export interface GetPetFrameStyleOptions extends GetPetFrameOptions {
  spritesheetUrl: string;
  scale?: number;
  imageRendering?: string;
}

export type CodexPetFrameStyle = Record<string, string>;

export interface CodexPetAnimationEvent {
  state: CodexPetState;
  frame: number;
  loop: number;
}

export interface CodexPetStateChangeEvent {
  state: CodexPetState;
  previousState: CodexPetState;
}

export interface CodexPetErrorEvent {
  error: Error;
}

export interface CodexPetPlayOptions {
  loops?: number;
  returnTo?: CodexPetState;
}

export interface CodexPetPosition {
  x: number;
  y: number;
}

export interface CodexPetDragEvent extends CodexPetPosition {
  deltaX: number;
  deltaY: number;
  originalEvent: PointerEvent | MouseEvent;
}

export interface CodexPetFloatingOptions extends Partial<CodexPetPosition> {
  zIndex?: number;
  constrainToViewport?: boolean;
}

export interface CodexPetDragOptions {
  constrainToViewport?: boolean;
  onDragStart?: (event: CodexPetDragEvent) => void;
  onDrag?: (event: CodexPetDragEvent) => void;
  onDragEnd?: (event: CodexPetDragEvent) => void;
}

export interface CodexPetAnimatorOptions {
  spritesheetUrl: string;
  state?: CodexPetState;
  scale?: number;
  fps?: number;
  paused?: boolean;
  reducedMotion?: ReducedMotionPreference;
  imageRendering?: string;
  preload?: boolean;
  onReady?: () => void;
  onError?: (event: CodexPetErrorEvent) => void;
  onStateChange?: (event: CodexPetStateChangeEvent) => void;
  onAnimationStart?: (event: CodexPetAnimationEvent) => void;
  onAnimationLoop?: (event: CodexPetAnimationEvent) => void;
  onAnimationEnd?: (event: CodexPetAnimationEvent) => void;
  onFrameChange?: (event: CodexPetAnimationEvent) => void;
}

export interface CreateCodexPetElementOptions
  extends CodexPetAnimatorOptions {
  className?: string;
  ariaLabel?: string;
  floating?: boolean | CodexPetFloatingOptions;
  draggable?: boolean | CodexPetDragOptions;
}

export interface CodexPetAnimator {
  play(state: CodexPetState, options?: CodexPetPlayOptions): void;
  setBaseState(state: CodexPetState): void;
  setSpritesheetUrl(spritesheetUrl: string): void;
  setScale(scale: number): void;
  setFps(fps: number): void;
  setImageRendering(imageRendering: string): void;
  setReducedMotion(reducedMotion: ReducedMotionPreference): void;
  setPaused(paused: boolean): void;
  pause(): void;
  resume(): void;
  getState(): CodexPetState;
  getBaseState(): CodexPetState;
  getFrame(): number;
  destroy(): void;
}

export interface CodexPetDragController {
  setPosition(position: CodexPetPosition): void;
  getPosition(): CodexPetPosition;
  destroy(): void;
}

export interface CodexPetElement {
  element: HTMLDivElement;
  animator: CodexPetAnimator;
  dragController?: CodexPetDragController;
}
