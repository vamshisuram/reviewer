import fs from "fs";
import path from "path";
import { Document } from "llamaindex";

export async function loadRepoFiles(repoPath) {
  const files = [];

  function readDirRecursive(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        readDirRecursive(fullPath);
      } else if (entry.isFile() && fullPath.endsWith(".js")) {
        const content = fs.readFileSync(fullPath, "utf8");
        files.push(new Document({ text: content, metadata: { filepath: fullPath } }));
      }
    }
  }

  readDirRecursive(repoPath);
  return files;
}
