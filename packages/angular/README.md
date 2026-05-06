# codex-pet-web-angular

Angular bindings for `codex-pet-web`.

## Install

```bash
npm install codex-pet-web codex-pet-web-angular @angular/core
```

## Use

Add the registry provider when bootstrapping your app:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideCodexPets } from "codex-pet-web-angular";

bootstrapApplication(AppComponent, {
  providers: [
    provideCodexPets({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          floating: { x: 24, y: 24 },
          draggable: true,
          scale: 0.45
        }
      }
    })
  ]
});
```

Render and control the pet:

```ts
import { Component } from "@angular/core";
import {
  CodexPetComponent,
  CodexPetRegistryService
} from "codex-pet-web-angular";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CodexPetComponent],
  template: `
    <codex-pet id="assistant" ariaLabel="Assistant pet" />
    <button type="button" (click)="wave()">Wave</button>
  `
})
export class AppComponent {
  constructor(private readonly pets: CodexPetRegistryService) {}

  wave() {
    this.pets.get("assistant").play("waving", { loops: 1 });
  }
}
```
