import { createCodexPetAnimator } from "./animator.js";
import { createCodexPetDragController } from "./drag.js";
import type {
  CodexPetDragOptions,
  CodexPetElement,
  CodexPetState,
  CreateCodexPetElementOptions
} from "./types.js";

export function createCodexPetElement(
  options: CreateCodexPetElementOptions
): CodexPetElement {
  const element = document.createElement("div");

  if (options.className) {
    element.className = options.className;
  }

  if (options.ariaLabel) {
    element.setAttribute("role", "img");
    element.setAttribute("aria-label", options.ariaLabel);
  } else {
    element.setAttribute("aria-hidden", "true");
  }

  const animator = createCodexPetAnimator(element, options);
  const userDragOptions: CodexPetDragOptions =
    typeof options.draggable === "object" ? options.draggable : {};
  let stateBeforeDrag: CodexPetState | null = null;
  const draggable = options.draggable
    ? {
        ...userDragOptions,
        onDragStart: (...args: Parameters<NonNullable<CodexPetDragOptions["onDragStart"]>>) => {
          stateBeforeDrag = animator.getBaseState();
          userDragOptions.onDragStart?.(...args);
        },
        onDrag: (...args: Parameters<NonNullable<CodexPetDragOptions["onDrag"]>>) => {
          const [event] = args;

          if (event.deltaX > 0) {
            animator.setBaseState("running-right");
          } else if (event.deltaX < 0) {
            animator.setBaseState("running-left");
          }

          userDragOptions.onDrag?.(...args);
        },
        onDragEnd: (...args: Parameters<NonNullable<CodexPetDragOptions["onDragEnd"]>>) => {
          if (stateBeforeDrag) {
            animator.setBaseState(stateBeforeDrag);
            stateBeforeDrag = null;
          }

          userDragOptions.onDragEnd?.(...args);
        }
      }
    : false;
  const dragController =
    options.floating || options.draggable
      ? createCodexPetDragController(element, {
          floating: options.floating,
          draggable
        })
      : undefined;

  return {
    element,
    animator,
    dragController
  };
}
