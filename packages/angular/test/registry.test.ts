import { CodexPetRegistryService } from "../src/public-api";

describe("CodexPetRegistryService", () => {
  it("creates and controls provider-registered pets", () => {
    const service = new CodexPetRegistryService({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp",
          state: "review",
          scale: 0.5
        }
      }
    });

    const assistant = service.get("assistant");
    expect(assistant.getSnapshot().state).toBe("review");
    expect(assistant.getSnapshot().scale).toBe(0.5);

    assistant.play("waving", { loops: 1 });
    expect(assistant.getSnapshot().state).toBe("waving");
  });

  it("creates random action runners for registered pets", () => {
    const service = new CodexPetRegistryService({
      pets: {
        assistant: {
          spritesheetUrl: "/pets/sapling/spritesheet.webp"
        }
      }
    });

    const runner = service.createRandomActionRunner("assistant", {
      averageIntervalSeconds: 120,
      actions: [{ state: "waving" }]
    });

    expect(runner).toEqual({
      start: expect.any(Function),
      stop: expect.any(Function),
      destroy: expect.any(Function)
    });
    runner.destroy();
  });
});
