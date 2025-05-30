import { Ollama } from "@llamaindex/ollama";
import { VectorStoreIndex, serviceContextFromDefaults } from "llamaindex";
import { loadRepoFiles } from "./ingestRepo.js";
import { loadPatch } from "./parsePatch.js";

const llm = new Ollama({ model: "llama3" });
const serviceContext = serviceContextFromDefaults({ llm });

const repoPath = process.argv[2];  // Pass as: node analyzePatch.js /path/to/repo /path/to/patch.diff
const patchPath = process.argv[3];

if (!repoPath || !patchPath) {
  console.log("Usage: node analyzePatch.js <repo_path> <patch_file>");
  process.exit(1);
}

console.log("Reading repo files...");
const repoDocs = await loadRepoFiles(repoPath);

console.log("Creating vector index...");
const index = await VectorStoreIndex.fromDocuments(repoDocs, { serviceContext });

console.log("Loading patch...");
const patchContent = await loadPatch(patchPath);

console.log("Querying with patch...");
const queryEngine = index.asQueryEngine();

const prompt = `
You're a code reviewer. Here's a patch:\n\n${patchContent}\n\n
Based on the codebase context, suggest:
- Potential issues
- Areas of improvement
- Better variable names or design if applicable
`;

const result = await queryEngine.query({ query: prompt });
console.log("\n💡 Suggestions:\n", result.response);
