import { loadAllRepoFiles } from "./ingestRepo.js";
import { parsePatchFile } from "./parsePatch.js";
import { findSimilarFiles } from "./utils.js";
import { askLMStudio } from "./lmstudioClient.js";
import path from "path";

const repoPath = process.argv[2];
const patchPath = process.argv[3];

if (!repoPath || !patchPath) {
  console.log("Usage: node analyzePatch.js <repo_path> <patch_file>");
  process.exit(1);
}

console.log("📦 Loading repo...");
const repoFiles = loadAllRepoFiles(repoPath);

console.log("🧩 Parsing patch...");
const patchFiles = await parsePatchFile(patchPath);

let finalSuggestions = "";

for (const [filename, { isNew, patch }] of Object.entries(patchFiles)) {
  console.log(`🔍 Analyzing ${filename} (${isNew ? "new" : "modified"})...`);

  const messages = [
    {
      role: "system",
      content: "You are an expert software engineer reviewing code patches.",
    },
  ];

  if (isNew) {
    const similarFiles = findSimilarFiles(filename, repoFiles)
      .map(f => `--- ${f.filename} ---\n${f.content}`)
      .slice(0, 3)
      .join("\n\n");

    messages.push({
      role: "user",
      content: `A new file "${filename}" was added. Here's the patch:\n${patch}\n\nHere are some similar files from the repo:\n${similarFiles}\n\nSuggest improvements or highlight any issues.`,
    });
  } else {
    const originalContent = repoFiles[filename] || "File not found in repo!";
    messages.push({
      role: "user",
      content: `The file "${filename}" was modified. Here is the original content:\n${originalContent}\n\nHere is the patch:\n${patch}\n\nWhat improvements or suggestions would you give based on code quality and patterns?`,
    });
  }

  const suggestion = await askLMStudio(messages);
  finalSuggestions += `\n--- Review for ${filename} ---\n${suggestion}\n`;
}

console.log("\n✅ Final Suggestions:\n");
console.log(finalSuggestions);
