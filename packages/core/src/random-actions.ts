import type {
  CodexPetRandomAction,
  CodexPetRandomActionRunner,
  CodexPetRandomActionRunnerOptions,
  CodexPetRandomActionTarget
} from "./types.js";

const DEFAULT_MIN_INTERVAL_SECONDS = 30;
const DEFAULT_MAX_INTERVAL_MULTIPLIER = 3;
const SECONDS_TO_MS = 1000;

type TimeoutHandle = ReturnType<typeof setTimeout>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getPositiveNumber(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && value !== undefined && value > 0
    ? value
    : fallback;
}

function getDelayMs(
  options: CodexPetRandomActionRunnerOptions,
  random: () => number
): number {
  const average = getPositiveNumber(options.averageIntervalSeconds, 120);
  const min = getPositiveNumber(
    options.minIntervalSeconds,
    DEFAULT_MIN_INTERVAL_SECONDS
  );
  const max = getPositiveNumber(
    options.maxIntervalSeconds,
    average * DEFAULT_MAX_INTERVAL_MULTIPLIER
  );
  const sample = -Math.log(1 - clamp(random(), 0, 0.999999)) * average;

  return clamp(sample, min, Math.max(min, max)) * SECONDS_TO_MS;
}

function pickWeightedAction(
  actions: CodexPetRandomAction[],
  random: () => number
): CodexPetRandomAction | null {
  const weightedActions = actions
    .map((action) => ({
      ...action,
      weight: getPositiveNumber(action.weight, 1)
    }))
    .filter((action) => action.weight > 0);
  const totalWeight = weightedActions.reduce(
    (total, action) => total + action.weight,
    0
  );

  if (totalWeight <= 0) {
    return null;
  }

  let cursor = clamp(random(), 0, 0.999999) * totalWeight;

  for (const action of weightedActions) {
    if (cursor < action.weight) {
      return action;
    }

    cursor -= action.weight;
  }

  return weightedActions[weightedActions.length - 1] ?? null;
}

function canPlayRandomAction(target: CodexPetRandomActionTarget): boolean {
  const snapshot = target.getSnapshot();

  return (
    snapshot.state === "idle" &&
    !snapshot.hidden &&
    !snapshot.paused &&
    !snapshot.removed &&
    snapshot.mounted
  );
}

export function createCodexPetRandomActionRunner(
  target: CodexPetRandomActionTarget,
  options: CodexPetRandomActionRunnerOptions
): CodexPetRandomActionRunner {
  const random = options.random ?? Math.random;
  let timeout: TimeoutHandle | null = null;
  let running = false;

  function clear(): void {
    if (timeout === null) {
      return;
    }

    clearTimeout(timeout);
    timeout = null;
  }

  function schedule(): void {
    clear();

    if (!running) {
      return;
    }

    timeout = setTimeout(run, getDelayMs(options, random));
  }

  function run(): void {
    timeout = null;

    if (running && canPlayRandomAction(target)) {
      const action = pickWeightedAction(options.actions, random);

      if (action) {
        target.play(action.state, { loops: action.loops ?? 1 });
      }
    }

    schedule();
  }

  return {
    start: () => {
      if (running) {
        return;
      }

      running = true;
      schedule();
    },
    stop: () => {
      running = false;
      clear();
    },
    destroy: () => {
      running = false;
      clear();
    }
  };
}
