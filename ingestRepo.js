import fs from "fs";
import path from "path";

export function loadAllRepoFiles(repoPath) {
  const files = {};

  function readDir(currentPath) {
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludeDirs = ["node_modules", "dist", "coverage", "playwright"];
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
        readDir(fullPath);
      } else if (entry.isFile() && validExtensions.some(ext => entry.name.endsWith(ext))) {
        files[path.relative(repoPath, fullPath)] = fs.readFileSync(fullPath, "utf8");
      }
    }
  }

  readDir(repoPath);
  return files;
}
