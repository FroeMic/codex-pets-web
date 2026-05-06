# Publishing

This repository publishes two public npm packages:

- `codex-pet-web`
- `codex-pet-web-react`

## Prerequisites

1. Ensure `main` has the release commit and CI is green.
2. Configure npm Trusted Publishing for each package.
3. Ensure GitHub Actions is enabled for the repository.
4. Confirm package names are available or already owned by the npm account:

```bash
npm view codex-pet-web version
npm view codex-pet-web-react version
```

The latest release line is `0.2.x`.

Trusted Publishing is preferred over long-lived npm tokens. Configure it on
npmjs.com for each published package:

- Organization or user: `FroeMic`
- Repository: `codex-pets-web`
- Workflow filename: `publish.yml`
- Environment name: leave empty

At the time this repository was prepared, both package names were unclaimed.
Each package must be published once before its Trusted Publisher can be
configured. Publish them manually after `npm login`, then add the same Trusted
Publisher settings:

```bash
npm publish -w packages/core --access public --tag next
npm publish -w packages/react --access public --tag next
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
npm install codex-pet-web@next codex-pet-web-react@next react react-dom
node --input-type=module -e "import { CODEX_PET_ATLAS } from 'codex-pet-web'; import { CodexPet } from 'codex-pet-web-react'; console.log(CODEX_PET_ATLAS.width, typeof CodexPet)"
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

- Keep `codex-pet-web-react` dependent on the matching compatible
  `codex-pet-web` range.
- Update `CHANGELOG.md` before each release.
- Run `npm run pack:dry` and inspect tarball contents before publishing.
