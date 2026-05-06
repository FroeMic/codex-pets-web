import {
  createCodexPetRegistry,
  type CodexPetController
} from "../src/index";

function bind(controller: CodexPetController): HTMLDivElement {
  const element = document.createElement("div");
  controller.bind(element);
  return element;
}

describe("Codex pet registry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes pets with durable config, position, and size", () => {
    const registry = createCodexPetRegistry({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          state: "waiting",
          scale: 0.5,
          fps: 6,
          floating: { x: 32, y: 48, zIndex: 40 },
          draggable: true
        }
      }
    });

    const assistant = registry.get("assistant");
    const element = bind(assistant);

    expect(assistant.getSnapshot()).toMatchObject({
      id: "assistant",
      mounted: true,
      removed: false,
      hidden: false,
      state: "waiting",
      baseState: "waiting",
      scale: 0.5,
      fps: 6,
      position: { x: 32, y: 48 }
    });
    expect(element.style.width).toBe("96px");
    expect(element.style.height).toBe("104px");
    expect(element.style.position).toBe("fixed");
    expect(element.style.zIndex).toBe("40");
    expect(element.style.transform).toBe("translate3d(32px, 48px, 0)");

    assistant.setPosition({ x: 80, y: 96 });
    assistant.unbind(element);
    const remounted = bind(assistant);

    expect(assistant.getSnapshot().position).toEqual({ x: 80, y: 96 });
    expect(remounted.style.transform).toBe("translate3d(80px, 96px, 0)");
  });

  it("keeps hidden pets registered and restores them with show", () => {
    const registry = createCodexPetRegistry({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          floating: true
        }
      }
    });
    const assistant = registry.get("assistant");
    const element = bind(assistant);

    assistant.hide();

    expect(registry.has("assistant")).toBe(true);
    expect(assistant.getSnapshot().hidden).toBe(true);
    expect(element.style.display).toBe("none");

    assistant.show();

    expect(assistant.getSnapshot().hidden).toBe(false);
    expect(element.style.display).toBe("inline-block");
  });

  it("removes pets from the registry and destroys their visual binding", () => {
    const registry = createCodexPetRegistry({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          floating: true
        }
      }
    });
    const assistant = registry.get("assistant");
    const element = bind(assistant);

    assistant.remove();

    expect(registry.has("assistant")).toBe(false);
    expect(assistant.getSnapshot()).toMatchObject({
      mounted: false,
      removed: true
    });
    expect(() => registry.get("assistant")).toThrow(
      'Codex pet "assistant" is not registered.'
    );
    expect(element.style.backgroundImage).toBe("");
  });

  it("controls multiple pets independently", () => {
    const registry = createCodexPetRegistry({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          state: "idle",
          floating: { x: 10, y: 20 }
        },
        reviewer: {
          spritesheetUrl: "/pets/bandit/spritesheet.webp",
          state: "review",
          floating: { x: 100, y: 120 }
        }
      }
    });
    const assistant = registry.get("assistant");
    const reviewer = registry.get("reviewer");

    bind(assistant);
    bind(reviewer);
    assistant.play("waving", { loops: 1 });
    reviewer.setState("failed");
    assistant.setPosition({ x: 30, y: 40 });

    expect(assistant.getSnapshot()).toMatchObject({
      state: "waving",
      baseState: "idle",
      position: { x: 30, y: 40 }
    });
    expect(reviewer.getSnapshot()).toMatchObject({
      state: "failed",
      baseState: "failed",
      position: { x: 100, y: 120 }
    });
  });
});
