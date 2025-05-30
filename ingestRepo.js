import fs from "fs-extra";
import glob from "glob";
import path from "path";
import { SimpleDocument } from "llamaindex";

export async function loadRepoFiles(basePath) {
  const files = glob.sync(`${basePath}/**/*.{js,ts,jsx,tsx,json,md}`, {
    ignore: [`${basePath}/node_modules/**`],
  });

  const docs = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf-8");
    docs.push(new SimpleDocument({
      id_: file,
      text: `FILE: ${path.relative(basePath, file)}\n\n${content}`,
    }));
  }

  return docs;
}
