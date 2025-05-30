import fs from "fs/promises";

export async function loadPatch(patchPath) {
  return await fs.readFile(patchPath, "utf8");
}
