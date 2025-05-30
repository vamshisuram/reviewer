export function findSimilarFiles(targetFile, allFiles) {
  const targetType = targetFile.split("/").pop()?.split(".").pop();
  return Object.entries(allFiles)
    .filter(([filename]) => filename.endsWith(`.${targetType}`))
    .map(([filename, content]) => ({ filename, content }));
}
