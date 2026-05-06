import type {
  CodexPetDragController,
  CodexPetDragEvent,
  CodexPetDragOptions,
  CodexPetFloatingOptions,
  CodexPetPosition
} from "./types.js";

export interface CreateCodexPetDragControllerOptions {
  floating?: boolean | CodexPetFloatingOptions;
  draggable?: boolean | CodexPetDragOptions;
}

interface ActiveDrag {
  pointerId?: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
}

const DEFAULT_POSITION = 24;
const DEFAULT_Z_INDEX = 2147483000;

function getFloatingOptions(
  floating: CreateCodexPetDragControllerOptions["floating"]
): CodexPetFloatingOptions {
  return typeof floating === "object" ? floating : {};
}

function getDragOptions(
  draggable: CreateCodexPetDragControllerOptions["draggable"]
): CodexPetDragOptions {
  return typeof draggable === "object" ? draggable : {};
}

function shouldConstrainToViewport(
  floating: CodexPetFloatingOptions,
  draggable: CodexPetDragOptions
): boolean {
  return draggable.constrainToViewport ?? floating.constrainToViewport ?? true;
}

function getWindow(element: HTMLElement): Window {
  return element.ownerDocument.defaultView ?? window;
}

function getEventPosition(
  event: PointerEvent | MouseEvent
): Pick<CodexPetDragEvent, "originalEvent" | "x" | "y"> {
  return {
    originalEvent: event,
    x: event.clientX,
    y: event.clientY
  };
}

export function createCodexPetDragController(
  element: HTMLElement,
  options: CreateCodexPetDragControllerOptions
): CodexPetDragController {
  const floating = getFloatingOptions(options.floating);
  const draggable = getDragOptions(options.draggable);
  const win = getWindow(element);
  const constrainToViewport = shouldConstrainToViewport(floating, draggable);
  let position: CodexPetPosition = {
    x: floating.x ?? DEFAULT_POSITION,
    y: floating.y ?? DEFAULT_POSITION
  };
  let activeDrag: ActiveDrag | null = null;

  function getConstrainedPosition(nextPosition: CodexPetPosition): CodexPetPosition {
    if (!constrainToViewport) {
      return nextPosition;
    }

    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const maxX = Math.max(0, win.innerWidth - width);
    const maxY = Math.max(0, win.innerHeight - height);

    return {
      x: Math.min(Math.max(0, nextPosition.x), maxX),
      y: Math.min(Math.max(0, nextPosition.y), maxY)
    };
  }

  function applyPosition(): void {
    element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
  }

  function setPosition(nextPosition: CodexPetPosition): void {
    position = getConstrainedPosition(nextPosition);
    applyPosition();
  }

  function emit(
    callback: ((event: CodexPetDragEvent) => void) | undefined,
    event: PointerEvent | MouseEvent,
    deltaX = 0,
    deltaY = 0
  ): void {
    callback?.({
      ...getEventPosition(event),
      ...position,
      deltaX,
      deltaY
    });
  }

  function onPointerMove(event: PointerEvent | MouseEvent): void {
    if (!activeDrag) {
      return;
    }

    const previousPosition = position;
    setPosition({
      x: activeDrag.startX + event.clientX - activeDrag.startClientX,
      y: activeDrag.startY + event.clientY - activeDrag.startClientY
    });
    emit(
      draggable.onDrag,
      event,
      position.x - previousPosition.x,
      position.y - previousPosition.y
    );
  }

  function endDrag(event: PointerEvent | MouseEvent): void {
    if (!activeDrag) {
      return;
    }

    activeDrag = null;
    element.style.cursor = "grab";
    emit(draggable.onDragEnd, event);
    win.removeEventListener("pointermove", onPointerMove);
    win.removeEventListener("pointerup", endDrag);
    win.removeEventListener("pointercancel", endDrag);
  }

  function onPointerDown(event: PointerEvent | MouseEvent): void {
    if ("button" in event && event.button !== 0) {
      return;
    }

    event.preventDefault();
    activeDrag = {
      pointerId: "pointerId" in event ? event.pointerId : undefined,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: position.x,
      startY: position.y
    };
    element.style.cursor = "grabbing";
    element.setPointerCapture?.(activeDrag.pointerId ?? 1);
    emit(draggable.onDragStart, event);
    win.addEventListener("pointermove", onPointerMove);
    win.addEventListener("pointerup", endDrag);
    win.addEventListener("pointercancel", endDrag);
  }

  element.style.position = "fixed";
  element.style.left = "0";
  element.style.top = "0";
  element.style.zIndex = String(floating.zIndex ?? DEFAULT_Z_INDEX);
  element.style.touchAction = "none";
  element.style.userSelect = "none";
  element.style.cursor = options.draggable ? "grab" : element.style.cursor;

  setPosition(position);

  if (options.draggable) {
    element.addEventListener("pointerdown", onPointerDown);
  }

  return {
    setPosition,
    getPosition: () => ({ ...position }),
    destroy: () => {
      element.removeEventListener("pointerdown", onPointerDown);
      win.removeEventListener("pointermove", onPointerMove);
      win.removeEventListener("pointerup", endDrag);
      win.removeEventListener("pointercancel", endDrag);
    }
  };
}
