# Publishing

This repository publishes two public npm packages:

- `codex-pets-core`
- `codex-pets-react`

## Prerequisites

1. Ensure `main` has the release commit and CI is green.
2. Configure npm Trusted Publishing for each package.
3. Ensure GitHub Actions is enabled for the repository.
4. Confirm package names are available or already owned by the npm account:

```bash
npm view codex-pets-core version
npm view codex-pets-react version
```

`codex-pets-react` already has a historical `0.2.0`, so this monorepo starts
the React package at `0.3.0`. `codex-pets-core` starts at `0.1.0`.

Trusted Publishing is preferred over long-lived npm tokens. Configure it on
npmjs.com for each published package:

- Organization or user: `FroeMic`
- Repository: `codex-pets-web`
- Workflow filename: `publish.yml`
- Environment name: leave empty

At the time this repository was prepared, `codex-pets-core` was unclaimed and
`codex-pets-react` was owned by the `backnotprop` npm account. `codex-pets-core`
must be published once before its Trusted Publisher can be configured. Publish
it manually after `npm login`, then add the same Trusted Publisher settings:

```bash
npm publish -w packages/core --access public --tag next
```

For `codex-pets-react`, either configure Trusted Publishing from the
`backnotprop` npm account or add the publishing npm user as an owner first:

```bash
npm owner add <npm-username> codex-pets-react
```

Do not create an automation token with 2FA bypass unless Trusted Publishing is
not available for your npm account or package.

## Local Verification

Run these before publishing:

```bash
npm ci
npm run typecheck
npm run test
npm run build
npm run pack:dry
```

## Publish A Prerelease

Use the manual GitHub Actions workflow:

1. Open **Actions**.
2. Select **Publish Packages**.
3. Run workflow on `main`.
4. Choose `next` for `npm_tag`.

Equivalent local commands after `npm login`:

```bash
npm publish -w packages/core --access public --tag next
npm publish -w packages/react --access public --tag next
```

## Test The Prerelease In A Fresh App

```bash
mkdir /tmp/codex-pets-consumer
cd /tmp/codex-pets-consumer
npm init -y
npm install codex-pets-core@next codex-pets-react@next react react-dom
node --input-type=module -e "import { CODEX_PET_ATLAS } from 'codex-pets-core'; import { CodexPet } from 'codex-pets-react'; console.log(CODEX_PET_ATLAS.width, typeof CodexPet)"
```

Expected output includes:

```text
1536 object
```

## Publish Stable

After prerelease validation, run the same **Publish Packages** workflow with
`latest`.

Equivalent local commands after `npm login`:

```bash
npm publish -w packages/core --access public --tag latest
npm publish -w packages/react --access public --tag latest
```

## Versioning Notes

- Keep `codex-pets-react` dependent on the matching compatible
  `codex-pets-core` range.
- Update `CHANGELOG.md` before each release.
- Run `npm run pack:dry` and inspect tarball contents before publishing.
