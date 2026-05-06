import {
  createCodexPetRandomActionRunner,
  type CodexPetRandomActionTarget,
  type CodexPetSnapshot,
  type CodexPetState
} from "../src/index";

function createTarget(state: CodexPetState): CodexPetRandomActionTarget & {
  played: CodexPetState[];
  setState: (state: CodexPetState) => void;
  setHidden: (hidden: boolean) => void;
} {
  let currentState = state;
  let hidden = false;
  const played: CodexPetState[] = [];

  return {
    played,
    setState: (nextState) => {
      currentState = nextState;
    },
    setHidden: (nextHidden) => {
      hidden = nextHidden;
    },
    getSnapshot: () =>
      ({
        id: "assistant",
        spritesheetUrl: "/pets/sapling/spritesheet.webp",
        state: currentState,
        baseState: currentState,
        frame: 0,
        scale: 1,
        fps: 8,
        position: null,
        hidden,
        mounted: true,
        paused: false,
        removed: false
      }) satisfies CodexPetSnapshot,
    play: (nextState) => {
      played.push(nextState);
    }
  };
}

describe("Codex pet random action runner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("plays a weighted random action only when the pet is idle", () => {
    const target = createTarget("idle");
    const runner = createCodexPetRandomActionRunner(target, {
      averageIntervalSeconds: 120,
      minIntervalSeconds: 45,
      maxIntervalSeconds: 300,
      actions: [
        { state: "waving", weight: 1 },
        { state: "jumping", weight: 3 }
      ],
      random: () => 0.5
    });

    runner.start();
    vi.advanceTimersByTime(83_200);

    expect(target.played).toEqual(["jumping"]);

    target.setState("review");
    vi.advanceTimersByTime(83_200);

    expect(target.played).toEqual(["jumping"]);

    runner.destroy();
  });

  it("clamps random delays to configured min and max bounds", () => {
    const target = createTarget("idle");
    const runner = createCodexPetRandomActionRunner(target, {
      averageIntervalSeconds: 120,
      minIntervalSeconds: 45,
      maxIntervalSeconds: 300,
      actions: [{ state: "waving", weight: 1 }],
      random: () => 0
    });

    runner.start();
    vi.advanceTimersByTime(44_999);
    expect(target.played).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(target.played).toEqual(["waving"]);

    runner.destroy();
  });

  it("skips hidden, paused, removed, or unmounted pets", () => {
    const target = createTarget("idle");
    target.setHidden(true);
    const runner = createCodexPetRandomActionRunner(target, {
      averageIntervalSeconds: 120,
      minIntervalSeconds: 45,
      maxIntervalSeconds: 300,
      actions: [{ state: "waving", weight: 1 }],
      random: () => 0
    });

    runner.start();
    vi.advanceTimersByTime(45_000);

    expect(target.played).toEqual([]);

    runner.destroy();
  });
});
