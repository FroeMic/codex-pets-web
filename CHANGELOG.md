# Changelog

## 0.2.0

- Added floating pet positioning and pointer dragging to `codex-pet-web`.
- Added React `floating`, `draggable`, and pet drag callback props.
- Added drag-direction animation that switches to running-left or running-right.
- Reduced the demo pet size, slowed default animation, and changed the stage to a dotted canvas.

## 0.1.0

- Split the project into an npm workspace monorepo.
- Added `codex-pet-web` as a dependency-free TypeScript engine.
- Added `codex-pet-web-react` as a thin React wrapper over the core animator.
- Added a Vite demo app that can load local pets copied from `~/.codex/pets`.
- Added CI, Pages, and manual npm publish workflows.
