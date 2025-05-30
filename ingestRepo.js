import fs from "fs";
import path from "path";

export function loadAllRepoFiles(repoPath) {
  const files = {};

  function readDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        readDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        files[path.relative(repoPath, fullPath)] = fs.readFileSync(fullPath, "utf8");
      }
    }
  }

  readDir(repoPath);
  return files;
}
