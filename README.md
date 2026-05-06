# Codex Pets Web

Production-ready web renderers for Codex pet spritesheets.

This repository is an npm workspace with:

- [`codex-pet-web`](./packages/core): dependency-free TypeScript engine.
- [`codex-pet-web-react`](./packages/react): React wrapper around the core engine.
- [`apps/demo`](./apps/demo): Vite playground for local pets from `~/.codex/pets`.

## Sprite Contract

Codex pets are regular folders:

```text
~/.codex/pets/<pet-id>/
├── pet.json
└── spritesheet.webp
```

The spritesheet uses the fixed Codex atlas:

- `1536x1872`
- `8` columns x `9` rows
- `192x208` cells
- transparent background
- unused cells fully transparent

States are mapped by row:

| State | Row | Frames |
| --- | ---: | ---: |
| `idle` | 0 | 6 |
| `running-right` | 1 | 8 |
| `running-left` | 2 | 8 |
| `waving` | 3 | 4 |
| `jumping` | 4 | 5 |
| `failed` | 5 | 8 |
| `waiting` | 6 | 6 |
| `running` | 7 | 6 |
| `review` | 8 | 6 |

## Development

```bash
npm install
npm run copy:pets
npm run dev
```

`copy:pets` copies local pets from `~/.codex/pets` into
`apps/demo/public/pets` and writes `pets-index.json` for the demo.
Production demo builds copy the committed fixture pet from `fixtures/pets`, so
GitHub Pages can render a pet without access to a developer machine.

## Build And Test

```bash
npm run typecheck
npm run test
npm run build
npm run pack:dry
```

## Floating Pets

Both packages support fixed-position pets that can be dragged across the
viewport. Use `floating` and `draggable` in React, or the same options with
`createCodexPetElement` in the core package. Dragging automatically switches the
sprite to `running-left` or `running-right` based on movement direction.

## Publishing

Dry-run package contents first:

```bash
npm run pack:dry
```

Publish prereleases:

```bash
npm publish -w packages/core --access public --tag next
npm publish -w packages/react --access public --tag next
```

Publish stable releases:

```bash
npm publish -w packages/core --access public
npm publish -w packages/react --access public
```

The latest release line is `0.2.x`.
