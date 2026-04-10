import { parseArgs } from "./src/cli.ts";
import { detectDiagramLinks, findExistingMarker } from "./src/detector.ts";
import { renderToAscii } from "./src/renderer.ts";
import { injectAscii, writeFileAtomic } from "./src/injector.ts";
import { formatError, formatSuccess, formatSummary, formatWarning } from "./src/reporter.ts";
import type { FileResult } from "./src/types.ts";

async function processFile(filePath: string): Promise<FileResult> {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split("\n");
  const links = detectDiagramLinks(lines);

  if (links.length === 0) {
    return { filePath, count: 0, diagrams: [] };
  }

  const diagrams: FileResult["diagrams"] = [];
  const markdownDir = filePath.substring(0, filePath.lastIndexOf("/")) || ".";

  const sortedLinks = [...links].sort((a, b) => b.lineIndex - a.lineIndex);
  let currentLines = [...lines];

  for (const link of sortedLinks) {
    const render = await renderToAscii(link.mmdPath, markdownDir);

    if (!render.success) {
      console.error(formatError(filePath, link.mmdPath, render.error!));
      Deno.exit(1);
    }

    const marker = findExistingMarker(currentLines, link.lineIndex);
    currentLines = injectAscii(currentLines, link, render.ascii!, !!marker);

    diagrams.push({ status: "success", path: link.mmdPath });
  }

  await writeFileAtomic(filePath, currentLines.join("\n"));

  return { filePath, count: diagrams.length, diagrams };
}

async function main() {
  const filePaths = await parseArgs(Deno.args);
  const results: FileResult[] = [];

  for (const filePath of filePaths) {
    const result = await processFile(filePath);
    results.push(result);

    if (result.count === 0) {
      console.log(formatWarning(filePath));
    } else {
      console.log(formatSuccess(filePath, result.count));
    }
  }

  const totalDiagrams = results.reduce((sum, r) => sum + r.count, 0);
  console.log(formatSummary(totalDiagrams, results.length));
  Deno.exit(0);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  Deno.exit(1);
});
