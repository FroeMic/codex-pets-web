# codex-pet-web-react

React wrapper for rendering Codex pet spritesheets in web products.

## Install

```bash
npm install codex-pet-web-react codex-pet-web
```

`react` is a peer dependency.

## Next.js

`codex-pet-web-react` is client-only and ships `"use client"` markers. In a
Next.js App Router app, import it from a client component and render that client
component from your layout or page:

```tsx
"use client";

import { CodexPet, CodexPetProvider } from "codex-pet-web-react";

export function PetLayer() {
  return (
    <CodexPetProvider
      pets={{
        assistant: {
          spritesheetUrl: "/codex-pets/sapling/spritesheet.webp",
          scale: 0.45,
          floating: { x: 24, y: 24 },
          draggable: true
        }
      }}
    >
      <CodexPet id="assistant" />
    </CodexPetProvider>
  );
}
```

## Basic Usage

```tsx
import { CodexPet } from "codex-pet-web-react";

export function PetPreview() {
  return (
    <CodexPet
      spritesheetUrl="/pets/sapling/spritesheet.webp"
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
  spritesheetUrl="/pets/sapling/spritesheet.webp"
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

## Provider And Hooks

Use `CodexPetProvider` when pet state should survive route or component changes,
or when one app controls multiple pets:

```tsx
import {
  CodexPet,
  CodexPetProvider,
  useCodexPet,
  useCodexPetRandomActions
} from "codex-pet-web-react";

function AssistantControls() {
  const pet = useCodexPet("assistant");

  useCodexPetRandomActions("assistant", {
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

  return (
    <>
      <button onClick={() => pet.play("waving")}>Wave</button>
      <button onClick={() => pet.hide()}>Hide</button>
      <button onClick={() => pet.show()}>Show</button>
    </>
  );
}

export function AppPet() {
  return (
    <CodexPetProvider
      pets={{
        assistant: {
          spritesheetUrl: "/codex-pets/sapling/spritesheet.webp",
          scale: 0.45,
          floating: { x: 24, y: 24 },
          draggable: true
        }
      }}
    >
      <AssistantControls />
      <CodexPet id="assistant" aria-label="Assistant pet" />
    </CodexPetProvider>
  );
}
```

The provider is a thin React adapter over the core registry. The core controller
owns behavior; React only binds a DOM node to it.

## Controlled State

```tsx
<CodexPet
  spritesheetUrl="/pets/sapling/spritesheet.webp"
  state={isLoading ? "running" : "idle"}
/>
```

Use `stateFps` to keep idle calm without slowing action states:

```tsx
<CodexPet
  fps={8}
  stateFps={{ idle: 2, waiting: 3 }}
  spritesheetUrl="/pets/sapling/spritesheet.webp"
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
      spritesheetUrl="/pets/sapling/spritesheet.webp"
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
  aria-label="Sapling pet"
  spritesheetUrl="/pets/sapling/spritesheet.webp"
/>
```
