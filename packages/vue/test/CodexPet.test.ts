import { createApp, defineComponent, h, nextTick } from "vue";
import {
  CodexPet,
  CodexPetProvider,
  useCodexPet,
  type CodexPetController
} from "../src/index.js";

function mount(component: ReturnType<typeof defineComponent>) {
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp(component);
  app.mount(host);

  return {
    host,
    unmount: () => {
      app.unmount();
      host.remove();
    }
  };
}

describe("CodexPet Vue bindings", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it("binds provider-registered pets by id", async () => {
    const App = defineComponent({
      render: () =>
        h(
          CodexPetProvider,
          {
            pets: {
              assistant: {
                spritesheetUrl: "/pets/sapling/spritesheet.webp",
                state: "review",
                scale: 0.5,
                floating: { x: 12, y: 16 }
              }
            }
          },
          () => h(CodexPet, { id: "assistant" })
        )
    });

    const { host, unmount } = mount(App);
    await nextTick();

    const pet = host.querySelector(
      "[data-codex-pet='assistant']"
    ) as HTMLDivElement;
    expect(pet).toBeInstanceOf(HTMLDivElement);
    expect(pet.style.width).toBe("96px");
    expect(pet.style.height).toBe("104px");
    expect(pet.style.backgroundPosition).toBe("0px -832px");
    expect(pet.style.transform).toBe("translate3d(12px, 16px, 0)");

    unmount();
  });

  it("controls provider pets from useCodexPet", async () => {
    let assistant: CodexPetController | null = null;

    const CapturePet = defineComponent({
      setup: () => {
        assistant = useCodexPet("assistant");
        return () => null;
      }
    });
    const App = defineComponent({
      render: () =>
        h(
          CodexPetProvider,
          {
            pets: {
              assistant: {
                spritesheetUrl: "/pets/sapling/spritesheet.webp",
                floating: true
              }
            }
          },
          () => [h(CapturePet), h(CodexPet, { id: "assistant" })]
        )
    });

    const { host, unmount } = mount(App);
    await nextTick();
    const pet = host.querySelector(
      "[data-codex-pet='assistant']"
    ) as HTMLDivElement;

    assistant?.play("waving", { loops: 1 });
    expect(assistant?.getSnapshot().state).toBe("waving");
    expect(pet.style.backgroundPosition).toBe("0px -624px");

    assistant?.hide();
    expect(pet.style.display).toBe("none");

    assistant?.show();
    expect(pet.style.display).toBe("inline-block");

    unmount();
  });
});
