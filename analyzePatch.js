import { loadAllRepoFiles } from "./ingestRepo.js";
import { parsePatchFile } from "./parsePatch.js";
import { findSimilarFiles } from "./utils.js";
import { askLMStudio } from "./lmstudioClient.js";
import path from "path";
import { systemPrompt } from "./systemPrompt.js";

const repoPath = process.argv[2];
const patchPath = process.argv[3];
const combined = process.argv[4]?.toLowerCase() === "true";

if (!repoPath || !patchPath) {
  console.log("Usage: node analyzePatch.js <repo_path> <patch_file> [combined=true|false]");
  process.exit(1);
}

console.log("📦 Loading repo...");
const repoFiles = loadAllRepoFiles(repoPath);

// console.log("Repo Files:::", Object.keys(repoFiles));
// console.log("Content:::", repoFiles[Object.keys(repoFiles)[0]]);

console.log("🧩 Parsing patch...");
const patchFiles = await parsePatchFile(patchPath);

let finalSuggestions = "";
const combinedMessages = [
  {
    role: "system",
    content: `${systemPrompt}. You are reviewing multiple code changes with full context.`,
  },
];

for (const [filename, { isNew, patch }] of Object.entries(patchFiles)) {
  console.log(`🔍 Analyzing ${filename} (${isNew ? "new" : "modified"})...`);

  if (combined) {
    if (isNew) {
      const similarFiles = findSimilarFiles(filename, repoFiles)
        .map(f => `--- ${f.filename} ---\n${f.content}`)
        .slice(0, 2)
        .join("\n\n");

      combinedMessages.push({
        role: "user",
        content: `New file "${filename}" added:\n\n${patch}\n\nSimilar files for context:\n${similarFiles}`,
      });
    } else {
      const originalContent = repoFiles[filename] || "File not found in repo!";
      combinedMessages.push({
        role: "user",
        content: `File "${filename}" was modified.\n\nOriginal content:\n${originalContent}\n\nPatch:\n${patch}`,
      });
    }
  } else {
    const messages = [
      {
        role: "system",
        content: `${systemPrompt}. You are reviewing a single file's code patch.`,
      },
    ];

    if (isNew) {
      const similarFiles = findSimilarFiles(filename, repoFiles)
        .map(f => `--- ${f.filename} ---\n${f.content}`)
        .slice(0, 2)
        .join("\n\n");

      messages.push({
        role: "user",
        content: `A new file "${filename}" was added. Here's the patch:\n${patch}\n\nHere are some similar files:\n${similarFiles}`,
      });
    } else {
      const originalContent = repoFiles[filename] || "File not found in repo!";
      messages.push({
        role: "user",
        content: `File "${filename}" was modified.\n\nOriginal:\n${originalContent}\n\nPatch:\n${patch}`,
      });
    }

    const suggestion = await askLMStudio(messages);
    finalSuggestions += `\n--- Review for ${filename} ---\n${suggestion}\n`;
  }
}

// Run combined prompt if requested
if (combined) {
  combinedMessages.push({
    role: "user",
    content: `Please provide a **crisp combined review** across all changes. Focus on overall patterns, issues, or suggestions.`,
  });

  finalSuggestions = await askLMStudio(combinedMessages);
}

console.log("\n✅ Final Suggestions:\n");
console.log(finalSuggestions);
