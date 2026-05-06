import { render } from "solid-js/web";
import {
  CodexPet,
  CodexPetProvider,
  useCodexPet,
  type CodexPetController
} from "../src/index.js";

describe("CodexPet Solid bindings", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("binds provider-registered pets by id", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const dispose = render(
      () => (
        <CodexPetProvider
          pets={{
            assistant: {
              spritesheetUrl: "/pets/sapling/spritesheet.webp",
              state: "review",
              scale: 0.5,
              floating: { x: 12, y: 16 }
            }
          }}
        >
          <CodexPet id="assistant" />
        </CodexPetProvider>
      ),
      host
    );

    const pet = host.querySelector(
      "[data-codex-pet='assistant']"
    ) as HTMLDivElement;
    expect(pet).toBeInstanceOf(HTMLDivElement);
    expect(pet.style.width).toBe("96px");
    expect(pet.style.height).toBe("104px");
    expect(pet.style.backgroundPosition).toBe("0px -832px");
    expect(pet.style.transform).toBe("translate3d(12px, 16px, 0)");

    dispose();
  });

  it("controls provider pets from useCodexPet", () => {
    let assistant: CodexPetController | null = null;

    function CapturePet() {
      assistant = useCodexPet("assistant");
      return null;
    }

    const host = document.createElement("div");
    document.body.append(host);
    const dispose = render(
      () => (
        <CodexPetProvider
          pets={{
            assistant: {
              spritesheetUrl: "/pets/sapling/spritesheet.webp",
              floating: true
            }
          }}
        >
          <CapturePet />
          <CodexPet id="assistant" />
        </CodexPetProvider>
      ),
      host
    );
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

    dispose();
  });
});
