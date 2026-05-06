# codex-pet-web-svelte

Svelte bindings for `codex-pet-web`.

## Install

```bash
npm install codex-pet-web codex-pet-web-svelte svelte
```

## Use

```svelte
<script lang="ts">
  import {
    codexPet,
    createCodexPetContext,
    createCodexPetAction,
    useCodexPet
  } from "codex-pet-web-svelte";

  const registry = createCodexPetContext({
    pets: {
      assistant: {
        spritesheetUrl: "/pets/sapling/spritesheet.webp",
        floating: { x: 24, y: 24 },
        draggable: true,
        scale: 0.45
      }
    }
  });
  const pet = createCodexPetAction(registry);
  const assistant = useCodexPet("assistant");

  function wave() {
    assistant.play("waving", { loops: 1 });
  }
</script>

<div use:pet={{ id: "assistant" }} aria-label="Assistant pet"></div>
<button type="button" on:click={wave}>Wave</button>
```

The package exports a Svelte action instead of a compiled component. That keeps
the wrapper small and lets Svelte own markup while `codex-pet-web` owns the pet
controller.
