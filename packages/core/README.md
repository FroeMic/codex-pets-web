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
  spritesheetUrl: "/pets/sapling/spritesheet.webp",
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
  spritesheetUrl: "/pets/sapling/spritesheet.webp",
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

## Registry And Controllers

Use a registry when a product needs app-wide control or multiple pets:

```ts
import { createCodexPetRegistry } from "codex-pet-web";

const registry = createCodexPetRegistry({
  pets: {
    assistant: {
      spritesheetUrl: "/codex-pets/sapling/spritesheet.webp",
      scale: 0.45,
      floating: { x: 24, y: 24 },
      draggable: true
    }
  }
});

const pet = registry.get("assistant");
pet.bind(document.querySelector("#pet")!);
pet.play("waving", { loops: 1 });
pet.hide();
pet.show();
```

`hide` keeps the pet registered and preserves state. `show` makes it visible
again. `remove` unregisters the pet and destroys its visual binding.

## Random Idle Actions

```ts
import { createCodexPetRandomActionRunner } from "codex-pet-web";

const runner = createCodexPetRandomActionRunner(pet, {
  averageIntervalSeconds: 120,
  minIntervalSeconds: 45,
  maxIntervalSeconds: 300,
  actions: [
    { state: "waving", weight: 3 },
    { state: "jumping", weight: 2 },
    { state: "waiting", weight: 1 },
    { state: "review", weight: 1 }
  ]
});

runner.start();
```

The runner uses randomized one-shot timers. It only plays an action when the
target pet is idle, visible, mounted, and not paused. Weights only affect which
action is chosen; they do not affect how often attempts happen.

## Pure Frame Math

```ts
import { getPetFrameStyle } from "codex-pet-web";

const style = getPetFrameStyle({
  spritesheetUrl: "/pets/sapling/spritesheet.webp",
  state: "review",
  frame: 2,
  scale: 2
});
```

## Animator API

```ts
const animator = createCodexPetAnimator(element, {
  spritesheetUrl: "/pets/sapling/spritesheet.webp",
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
  spritesheetUrl: "/pets/sapling/spritesheet.webp",
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
