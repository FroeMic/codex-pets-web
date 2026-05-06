import { act } from "react";
import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CodexPet, type CodexPetHandle } from "../src/index";
import type { CodexPetManifest } from "codex-pet-web";

const manifest: CodexPetManifest = {
  id: "vertical",
  displayName: "Vertical",
  description: "A desktop computer pet.",
  spritesheetPath: "spritesheet.webp"
};

function render(ui: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  let root: Root | null = null;

  act(() => {
    root = createRoot(host);
    root.render(ui);
  });

  return {
    host,
    rerender: (nextUi: ReactNode) =>
      act(() => {
        root?.render(nextUi);
      }),
    unmount: () =>
      act(() => {
        root?.unmount();
        host.remove();
      })
  };
}

describe("CodexPet", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it("renders a decorative pet and updates controlled state without React frame renders", () => {
    const { host, rerender, unmount } = render(
      <CodexPet
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="idle"
        paused
      />
    );

    const pet = host.querySelector("[data-codex-pet]");
    expect(pet).toBeInstanceOf(HTMLDivElement);
    expect(pet?.getAttribute("aria-hidden")).toBe("true");
    expect((pet as HTMLDivElement).style.backgroundPosition).toBe("0px 0px");

    rerender(
      <CodexPet
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="review"
        paused
      />
    );

    expect((pet as HTMLDivElement).style.backgroundPosition).toBe(
      "0px -1664px"
    );

    unmount();
  });

  it("exposes temporary actions through an imperative ref", () => {
    const ref = { current: null as CodexPetHandle | null };
    const events: string[] = [];
    const { host, unmount } = render(
      <CodexPet
        ref={ref}
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="running"
        fps={10}
        onAnimationEnd={({ state }) => events.push(`end:${state}`)}
        onStateChange={({ state }) => events.push(`state:${state}`)}
      />
    );

    act(() => {
      ref.current?.play("waving", { loops: 1 });
    });

    expect(ref.current?.getState()).toBe("waving");

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(ref.current?.getState()).toBe("running");
    expect(events).toContain("end:waving");
    expect(events).toContain("state:running");
    expect(host.querySelector("[data-codex-pet]")).toBeInstanceOf(
      HTMLDivElement
    );

    unmount();
  });

  it("uses an accessible image role when aria-label is provided", () => {
    const { host, unmount } = render(
      <CodexPet
        aria-label="Vertical pet"
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="idle"
        paused
      />
    );

    const pet = host.querySelector("[data-codex-pet]");
    expect(pet?.getAttribute("role")).toBe("img");
    expect(pet?.getAttribute("aria-label")).toBe("Vertical pet");

    unmount();
  });

  it("supports floating drag props and imperative positioning", () => {
    const ref = { current: null as CodexPetHandle | null };
    const events: string[] = [];
    const { host, unmount } = render(
      <CodexPet
        ref={ref}
        aria-label="Vertical pet"
        draggable
        floating={{ x: 18, y: 24, zIndex: 30 }}
        manifest={manifest}
        paused
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        onPetDrag={({ x, y }) => events.push(`${x}:${y}`)}
      />
    );

    const pet = host.querySelector("[data-codex-pet]") as HTMLDivElement;
    expect(pet.style.position).toBe("fixed");
    expect(pet.style.zIndex).toBe("30");
    expect(ref.current?.getPosition()).toEqual({ x: 18, y: 24 });

    act(() => {
      ref.current?.play("jumping", { loops: 1 });
    });
    expect(ref.current?.getState()).toBe("jumping");

    act(() => {
      pet.dispatchEvent(
        new MouseEvent("pointerdown", {
          bubbles: true,
          button: 0,
          clientX: 20,
          clientY: 30
        })
      );
      window.dispatchEvent(
        new MouseEvent("pointermove", {
          bubbles: true,
          clientX: 40,
          clientY: 50
        })
      );
    });

    expect(ref.current?.getPosition()).toEqual({ x: 38, y: 44 });
    expect(ref.current?.getBaseState()).toBe("running-right");
    expect(ref.current?.getState()).toBe("running-right");
    expect(pet.style.transform).toBe("translate3d(38px, 44px, 0)");
    expect(events).toContain("38:44");

    act(() => {
      window.dispatchEvent(
        new MouseEvent("pointermove", {
          bubbles: true,
          clientX: 10,
          clientY: 50
        })
      );
    });

    expect(ref.current?.getBaseState()).toBe("running-left");

    act(() => {
      window.dispatchEvent(
        new MouseEvent("pointerup", {
          bubbles: true,
          clientX: 10,
          clientY: 50
        })
      );
    });

    expect(ref.current?.getBaseState()).toBe("idle");
    expect(ref.current?.getState()).toBe("jumping");

    unmount();
  });

  it("keeps the running animation advancing while dragging", () => {
    const ref = { current: null as CodexPetHandle | null };
    const { host, unmount } = render(
      <CodexPet
        ref={ref}
        draggable
        floating
        fps={8}
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
      />
    );
    const pet = host.querySelector("[data-codex-pet]") as HTMLDivElement;

    act(() => {
      pet.dispatchEvent(
        new MouseEvent("pointerdown", {
          bubbles: true,
          button: 0,
          clientX: 20,
          clientY: 30
        })
      );
      window.dispatchEvent(
        new MouseEvent("pointermove", {
          bubbles: true,
          clientX: 40,
          clientY: 30
        })
      );
      vi.advanceTimersByTime(150);
    });

    expect(ref.current?.getState()).toBe("running-right");
    expect(ref.current?.getFrame()).toBe(1);

    act(() => {
      window.dispatchEvent(
        new MouseEvent("pointermove", {
          bubbles: true,
          clientX: 50,
          clientY: 30
        })
      );
    });

    expect(ref.current?.getState()).toBe("running-right");
    expect(ref.current?.getFrame()).toBe(1);

    act(() => {
      window.dispatchEvent(
        new MouseEvent("pointerup", {
          bubbles: true,
          clientX: 50,
          clientY: 30
        })
      );
    });

    expect(ref.current?.getState()).toBe("jumping");

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(ref.current?.getState()).toBe("idle");

    unmount();
  });

  it("passes per-state frame rates to the animator", () => {
    const ref = { current: null as CodexPetHandle | null };
    const { unmount } = render(
      <CodexPet
        ref={ref}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="idle"
        fps={8}
        stateFps={{ idle: 2, jumping: 8 }}
      />
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(ref.current?.getFrame()).toBe(0);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(ref.current?.getFrame()).toBe(1);

    unmount();
  });
});
