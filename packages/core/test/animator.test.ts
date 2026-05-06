import {
  createCodexPetAnimator,
  createCodexPetElement,
  preloadPet
} from "../src/index";

describe("Codex pet animator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a pet element with the expected accessible defaults", () => {
    const { element, animator } = createCodexPetElement({
      spritesheetUrl: "/pets/vertical/spritesheet.webp",
      state: "idle",
      scale: 1.5,
      paused: true
    });

    expect(element.getAttribute("aria-hidden")).toBe("true");
    expect(element.style.width).toBe("288px");
    expect(element.style.height).toBe("312px");
    expect(element.style.backgroundPosition).toBe("0px 0px");

    animator.destroy();
  });

  it("positions and drags a floating pet element", () => {
    const events: string[] = [];
    const { element, animator, dragController } = createCodexPetElement({
      spritesheetUrl: "/pets/vertical/spritesheet.webp",
      state: "idle",
      paused: true,
      floating: { x: 20, y: 30, zIndex: 12 },
      draggable: {
        onDragStart: ({ x, y }) => events.push(`start:${x}:${y}`),
        onDrag: ({ x, y }) => events.push(`drag:${x}:${y}`),
        onDragEnd: ({ x, y }) => events.push(`end:${x}:${y}`)
      }
    });

    expect(dragController?.getPosition()).toEqual({ x: 20, y: 30 });
    expect(element.style.position).toBe("fixed");
    expect(element.style.zIndex).toBe("12");
    expect(element.style.transform).toBe("translate3d(20px, 30px, 0)");

    element.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: 25,
        clientY: 35
      })
    );
    window.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 45,
        clientY: 65
      })
    );

    expect(animator.getBaseState()).toBe("running-right");

    window.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 15,
        clientY: 65
      })
    );

    expect(animator.getBaseState()).toBe("running-left");

    window.dispatchEvent(
      new MouseEvent("pointerup", {
        bubbles: true,
        clientX: 15,
        clientY: 65
      })
    );

    expect(animator.getBaseState()).toBe("idle");
    expect(dragController?.getPosition()).toEqual({ x: 10, y: 60 });
    expect(element.style.transform).toBe("translate3d(10px, 60px, 0)");
    expect(events).toEqual([
      "start:20:30",
      "drag:40:60",
      "drag:10:60",
      "end:10:60"
    ]);

    animator.destroy();
  });

  it("plays a temporary action and returns to the base state", () => {
    const element = document.createElement("div");
    const events: string[] = [];
    const animator = createCodexPetAnimator(element, {
      spritesheetUrl: "/pets/vertical/spritesheet.webp",
      state: "running",
      fps: 10,
      onAnimationStart: ({ state }) => events.push(`start:${state}`),
      onAnimationLoop: ({ state, loop }) => events.push(`loop:${state}:${loop}`),
      onAnimationEnd: ({ state }) => events.push(`end:${state}`),
      onStateChange: ({ state }) => events.push(`state:${state}`)
    });

    animator.play("waving", { loops: 1 });

    expect(animator.getState()).toBe("waving");
    expect(events).toContain("start:waving");

    vi.advanceTimersByTime(500);

    expect(animator.getState()).toBe("running");
    expect(events).toContain("loop:waving:1");
    expect(events).toContain("end:waving");
    expect(events).toContain("state:running");

    animator.destroy();
  });

  it("supports per-state frame rates", () => {
    const element = document.createElement("div");
    const animator = createCodexPetAnimator(element, {
      spritesheetUrl: "/pets/vertical/spritesheet.webp",
      state: "idle",
      fps: 8,
      stateFps: {
        idle: 2,
        jumping: 8
      }
    });

    vi.advanceTimersByTime(400);
    expect(animator.getFrame()).toBe(0);

    vi.advanceTimersByTime(200);
    expect(animator.getFrame()).toBe(1);

    animator.setBaseState("jumping");
    vi.advanceTimersByTime(150);
    expect(animator.getFrame()).toBe(1);

    animator.destroy();
  });

  it("caches image preloads by URL", () => {
    const first = preloadPet("/pets/vertical/spritesheet.webp");
    const second = preloadPet("/pets/vertical/spritesheet.webp");

    expect(first).toBe(second);
  });
});
