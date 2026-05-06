# codex-pet-web-react

React wrapper for rendering Codex pet spritesheets in web products.

## Install

```bash
npm install codex-pet-web-react codex-pet-web
```

`react` is a peer dependency.

## Basic Usage

```tsx
import { CodexPet } from "codex-pet-web-react";

export function PetPreview() {
  return (
    <CodexPet
      spritesheetUrl="/pets/vertical/spritesheet.webp"
      state="idle"
      scale={2}
    />
  );
}
```

## Add Pet Assets

`spritesheetUrl` must point at a public asset. To use the examples bundled with
`codex-pet-web`, copy them into your app:

```bash
mkdir -p public/codex-pets
cp -R node_modules/codex-pet-web/example-pets/* public/codex-pets/
```

Then render one:

```tsx
<CodexPet
  spritesheetUrl="/codex-pets/carrot/spritesheet.webp"
  state="idle"
/>
```

## Floating And Dragging

```tsx
<CodexPet
  draggable
  floating={{ x: 24, y: 24, zIndex: 100 }}
  spritesheetUrl="/pets/vertical/spritesheet.webp"
  onPetDragEnd={({ x, y }) => {
    console.log("pet position", x, y);
  }}
/>
```

Use a ref to move a floating pet programmatically:

```tsx
const ref = useRef<CodexPetHandle>(null);

ref.current?.setPosition({ x: 48, y: 48 });
```

During drag, horizontal movement automatically switches the pet to
`running-left` or `running-right`. When the pointer is released, it restores the
previous base state and plays one `jumping` loop before returning to that state.

## Controlled State

```tsx
<CodexPet
  spritesheetUrl="/pets/vertical/spritesheet.webp"
  state={isLoading ? "running" : "idle"}
/>
```

Use `stateFps` to keep idle calm without slowing action states:

```tsx
<CodexPet
  fps={8}
  stateFps={{ idle: 2, waiting: 3 }}
  spritesheetUrl="/pets/vertical/spritesheet.webp"
/>
```

## Temporary Actions

Use a ref for short-lived actions. Props remain the persistent source of truth.

```tsx
import { useRef } from "react";
import { CodexPet, type CodexPetHandle } from "codex-pet-web-react";

export function ActionPet() {
  const pet = useRef<CodexPetHandle>(null);

  return (
    <CodexPet
      ref={pet}
      spritesheetUrl="/pets/vertical/spritesheet.webp"
      state="idle"
      onClick={() => pet.current?.play("waving", { loops: 1 })}
      onDoubleClick={() => pet.current?.setState("running", { interrupt: true })}
      onAnimationEnd={({ state }) => console.log(`${state} finished`)}
    />
  );
}
```

The component does not re-render every animation frame. It mounts one DOM node
and lets `codex-pet-web` update background position directly.

Pass `{ interrupt: true }` to `setState` when the new persistent state should
cancel a temporary action started with `play`.

## Accessibility

Pets are decorative by default. Add `aria-label` when a pet is meaningful:

```tsx
<CodexPet
  aria-label="Vertical pet"
  spritesheetUrl="/pets/vertical/spritesheet.webp"
/>
```
