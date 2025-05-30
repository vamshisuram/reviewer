import fs from "fs/promises";

export async function loadPatch(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  return content;
}
