# Changelog

## 0.3.0

- Added framework-neutral pet registries and controllers in `codex-pet-web`.
- Added React `CodexPetProvider`, `useCodexPet`, and `useCodexPetRandomActions`.
- Added `hide`, `show`, and `remove` controller commands.
- Added idle-only weighted random action runners with configurable average intervals.
- Updated the demo to start slightly smaller and merge bundled examples with local pets.
- Removed the old Vertical fixture from the repository.

## 0.2.0

- Added bundled example pet assets for Sapling, Carrot, and Bandit.
- Added typed example pet metadata via `CODEX_PET_EXAMPLES`.
- Added floating pet positioning and pointer dragging to `codex-pet-web`.
- Added React `floating`, `draggable`, and pet drag callback props.
- Added drag-direction animation that switches to running-left or running-right.
- Dragging now keeps running animations advancing and plays a jump on release.
- Added per-state FPS overrides for calmer idle loops with faster actions.
- Reduced the demo pet size, added hover-to-jump, and changed the stage to a dotted canvas.

## 0.1.0

- Split the project into an npm workspace monorepo.
- Added `codex-pet-web` as a dependency-free TypeScript engine.
- Added `codex-pet-web-react` as a thin React wrapper over the core animator.
- Added a Vite demo app that can load local pets copied from `~/.codex/pets`.
- Added CI, Pages, and manual npm publish workflows.
