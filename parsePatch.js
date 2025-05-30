import fs from "fs/promises";

export async function parsePatchFile(patchPath) {
  const patch = await fs.readFile(patchPath, "utf8");
  const files = {};

  const chunks = patch.split(/^diff --git /gm).slice(1);

  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const fileLine = lines[0];
    const match = fileLine.match(/a\/(.+?) b\/(.+)/);
    if (!match) continue;

    const [, oldPath, newPath] = match;
    const fileKey = newPath;

    let isNewFile = lines.some(line => line.startsWith("new file mode"));
    let patchText = lines.join("\n");

    files[fileKey] = { isNew: isNewFile, patch: patchText };
  }

  return files;
}
