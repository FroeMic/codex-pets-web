# codex-pet-web

Dependency-free TypeScript engine for rendering Codex pet spritesheets in web
products.

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

## Bundled Example Pets

The package includes three example pet assets:

- `sapling`: tree companion
- `carrot`: carrot companion
- `bandit`: raccoon companion

Copy them into your app's public assets:

```bash
mkdir -p public/codex-pets
cp -R node_modules/codex-pet-web/example-pets/* public/codex-pets/
```

Then render one with a public URL:

```ts
createCodexPetElement({
  spritesheetUrl: "/codex-pets/sapling/spritesheet.webp"
});
```

Typed metadata is available from the package:

```ts
import { CODEX_PET_EXAMPLES } from "codex-pet-web";
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
based on horizontal movement. On release it restores the previous base state and
plays one `jumping` loop before returning to that state.

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
animator.setBaseState("running-left", { interrupt: true });
animator.play("jumping", { loops: 1 });
animator.pause();
animator.resume();
animator.destroy();
```

The core animator uses a shared scheduler, so multiple pets share one animation
clock instead of creating one timer per pet.

Use `interrupt: true` when a persistent state change should cancel a temporary
action that was started with `play`.

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
