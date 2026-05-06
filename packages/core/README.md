# codex-pet-web

Dependency-free TypeScript engine for Codex pet spritesheets.

## Install

```bash
npm install codex-pet-web
```

## Basic DOM Usage

```ts
import { createCodexPetElement } from "codex-pet-web";

const { element, animator } = createCodexPetElement({
  spritesheetUrl: "/pets/vertical/spritesheet.webp",
  state: "idle",
  scale: 2
});

document.body.append(element);
animator.play("waving", { loops: 1 });
```

## Floating And Dragging

```ts
const { element, dragController } = createCodexPetElement({
  spritesheetUrl: "/pets/vertical/spritesheet.webp",
  floating: { x: 24, y: 24, zIndex: 100 },
  draggable: {
    onDragEnd: ({ x, y }) => {
      console.log("pet position", x, y);
    }
  }
});

document.body.append(element);
dragController?.setPosition({ x: 48, y: 48 });
```

Dragging temporarily switches the pet to `running-left` or `running-right`
based on horizontal movement, then restores its previous base state on release.

## Pure Frame Math

```ts
import { getPetFrameStyle } from "codex-pet-web";

const style = getPetFrameStyle({
  spritesheetUrl: "/pets/vertical/spritesheet.webp",
  state: "review",
  frame: 2,
  scale: 2
});
```

## Animator API

```ts
const animator = createCodexPetAnimator(element, {
  spritesheetUrl: "/pets/vertical/spritesheet.webp",
  state: "idle",
  fps: 8,
  onAnimationEnd: ({ state }) => console.log(state)
});

animator.setBaseState("running");
animator.play("jumping", { loops: 1 });
animator.pause();
animator.resume();
animator.destroy();
```

The core animator uses a shared scheduler, so multiple pets share one animation
clock instead of creating one timer per pet.

Use `stateFps` when idle should be calmer than action states:

```ts
const animator = createCodexPetAnimator(element, {
  spritesheetUrl: "/pets/vertical/spritesheet.webp",
  fps: 8,
  stateFps: {
    idle: 2,
    waiting: 3
  }
});
```

## Accessibility

`createCodexPetElement` marks pets as decorative by default with
`aria-hidden="true"`. Pass `ariaLabel` when the pet communicates meaningful
information.
