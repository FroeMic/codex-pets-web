# codex-pet-web-vue

Vue bindings for `codex-pet-web`.

## Install

```bash
npm install codex-pet-web codex-pet-web-vue vue
```

## Use

```vue
<script setup lang="ts">
import {
  CodexPet,
  CodexPetProvider,
  useCodexPet
} from "codex-pet-web-vue";

const pets = {
  assistant: {
    spritesheetUrl: "/pets/sapling/spritesheet.webp",
    floating: { x: 24, y: 24 },
    draggable: true,
    scale: 0.45
  }
};

function wave() {
  useCodexPet("assistant").play("waving", { loops: 1 });
}
</script>

<template>
  <CodexPetProvider :pets="pets">
    <CodexPet id="assistant" aria-label="Assistant pet" />
    <button type="button" @click="wave">Wave</button>
  </CodexPetProvider>
</template>
```

Use `CodexPetProvider` when the pet should survive route or component changes.
Use `useCodexPet(id)` anywhere below the provider to play actions, move, hide,
show, or remove a pet.
