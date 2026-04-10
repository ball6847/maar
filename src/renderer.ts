import { renderMermaidASCII } from "beautiful-mermaid";
import type { RenderResult } from "./types.ts";

export async function renderToAscii(
  mmdPath: string,
  markdownDir: string,
): Promise<RenderResult> {
  // Resolve path using URL API
  const absolutePath = markdownDir === "." ? mmdPath : `${markdownDir}/${mmdPath}`;

  // Check existence with Deno
  try {
    await Deno.stat(absolutePath);
  } catch {
    return {
      success: false,
      error: "file not found",
    };
  }

  try {
    const content = await Deno.readTextFile(absolutePath);

    const ascii = renderMermaidASCII(content);

    if (!ascii.trim()) {
      return {
        success: false,
        error: "empty output",
      };
    }

    return {
      success: true,
      ascii: ascii.trimEnd(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown error",
    };
  }
}
