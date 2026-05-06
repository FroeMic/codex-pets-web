import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const localSourceRoot = process.argv[2] ?? join(homedir(), ".codex", "pets");
const exampleSourceRoot = join(process.cwd(), "packages", "core", "example-pets");
const targetRoot = join(process.cwd(), "apps", "demo", "public", "pets");

async function readManifest(sourceRoot, petId) {
  const manifestPath = join(sourceRoot, petId, "pet.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  if (
    typeof manifest.id !== "string" ||
    typeof manifest.displayName !== "string" ||
    typeof manifest.description !== "string" ||
    typeof manifest.spritesheetPath !== "string"
  ) {
    throw new Error(`Invalid pet manifest: ${manifestPath}`);
  }

  return manifest;
}

async function copyPetsFromSource(sourceRoot, manifests) {
  let entries;

  try {
    entries = await readdir(sourceRoot, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return 0;
    }

    throw error;
  }

  let copied = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const manifest = await readManifest(sourceRoot, entry.name);
    const sourceDir = join(sourceRoot, entry.name);
    const targetDir = join(targetRoot, entry.name);

    await rm(targetDir, { force: true, recursive: true });
    await cp(sourceDir, targetDir, { recursive: true });
    manifests.set(manifest.id, {
      ...manifest,
      manifestUrl: `/pets/${entry.name}/pet.json`,
      spritesheetUrl: `/pets/${entry.name}/${manifest.spritesheetPath}`
    });
    copied += 1;
  }

  return copied;
}

async function main() {
  await rm(targetRoot, { force: true, recursive: true });
  await mkdir(targetRoot, { recursive: true });

  const manifests = new Map();
  const exampleCount = await copyPetsFromSource(exampleSourceRoot, manifests);
  const localCount = await copyPetsFromSource(localSourceRoot, manifests);
  const pets = Array.from(manifests.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  await writeFile(
    join(targetRoot, "pets-index.json"),
    `${JSON.stringify({ pets }, null, 2)}\n`
  );

  console.log(`Copied ${exampleCount} bundled example pets`);
  console.log(`Copied ${localCount} pets from ${localSourceRoot}`);
  console.log(`Wrote ${join(targetRoot, "pets-index.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
