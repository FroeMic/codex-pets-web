import { createCodexPetRegistry } from "codex-pet-web";
import { codexPet, createCodexPetAction } from "../src/index.js";

describe("codexPet Svelte action", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("binds a registry pet to the action node", () => {
    const registry = createCodexPetRegistry({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          state: "review",
          scale: 0.5,
          floating: { x: 12, y: 16 }
        }
      }
    });
    const node = document.createElement("div");
    document.body.append(node);
    const action = codexPet(node, { registry, id: "assistant" });

    expect(node.dataset.codexPet).toBe("assistant");
    expect(node.style.width).toBe("96px");
    expect(node.style.height).toBe("104px");
    expect(node.style.backgroundPosition).toBe("0px -832px");
    expect(node.style.transform).toBe("translate3d(12px, 16px, 0)");

    registry.get("assistant").play("waving", { loops: 1 });
    expect(node.style.backgroundPosition).toBe("0px -312px");

    action.destroy();
  });

  it("creates scoped actions from a registry", () => {
    const registry = createCodexPetRegistry({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          floating: true
        }
      }
    });
    const pet = createCodexPetAction(registry);
    const node = document.createElement("div");
    const action = pet(node, { id: "assistant" });

    registry.get("assistant").hide();
    expect(node.style.display).toBe("none");

    registry.get("assistant").show();
    expect(node.style.display).toBe("inline-block");

    action.destroy();
  });
});
