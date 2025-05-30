import { loadRepoFiles } from "./ingestRepo.js";
import { loadPatch } from "./parsePatch.js";
import { askLMStudio } from "./lmstudioClient.js";

const repoPath = process.argv[2];
const patchPath = process.argv[3];

if (!repoPath || !patchPath) {
  console.log("Usage: node analyzePatch.js <repo_path> <patch_file>");
  process.exit(1);
}

console.log("📂 Reading repo files...");
const repoDocs = await loadRepoFiles(repoPath);

// Concatenate repo context into a big string (you can later chunk if needed)
const repoContext = repoDocs.map((doc) => {
  const filename = doc.metadata?.filepath?.split("/").slice(-3).join("/") || "file";
  return `--- ${filename} ---\n${doc.text}\n`;
}).join("\n");

console.log("📄 Loading patch...");
const patchContent = await loadPatch(patchPath);

console.log("🧠 Asking LM Studio...");

const messages = [
  {
    role: "system",
    content: "You are a senior software engineer reviewing a Git patch with access to relevant repo context.",
  },
  {
    role: "user",
    content: `Here is the patch:\n${patchContent}\n\nAnd here is context from the repo:\n${repoContext}\n\nPlease give a detailed review and suggest any improvements.`,
  },
];

const suggestions = await askLMStudio(messages);

console.log("\n💡 Suggestions from LM Studio:\n");
console.log(suggestions);
