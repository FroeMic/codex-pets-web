# codex-pet-web-solid

Solid bindings for `codex-pet-web`.

## Install

```bash
npm install codex-pet-web codex-pet-web-solid solid-js
```

## Use

```tsx
import {
  CodexPet,
  CodexPetProvider,
  useCodexPet
} from "codex-pet-web-solid";

function Controls() {
  const assistant = useCodexPet("assistant");

  return (
    <button onClick={() => assistant.play("waving", { loops: 1 })}>
      Wave
    </button>
  );
}

export function App() {
  return (
    <CodexPetProvider
      pets={{
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          floating: { x: 24, y: 24 },
          draggable: true,
          scale: 0.45
        }
      }}
    >
      <CodexPet id="assistant" aria-label="Assistant pet" />
      <Controls />
    </CodexPetProvider>
  );
}
```
