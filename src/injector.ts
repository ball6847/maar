import type { DiagramLink } from "./types.ts";

export function createInjectionBlock(
  mmdPath: string,
  ascii: string,
): string[] {
  return [
    `<!-- MAAR: ${mmdPath} -->`,
    "```",
    ascii,
    "```",
    "",
  ];
}

export function injectAscii(
  lines: string[],
  link: DiagramLink,
  ascii: string,
  hasExistingMarker: boolean,
): string[] {
  const block = createInjectionBlock(link.mmdPath, ascii);
  const result = [...lines];

  if (hasExistingMarker) {
    const markerLine = findMarkerLine(result, link.lineIndex, link.mmdPath);
    if (markerLine !== -1) {
      // Find the end of the code block (the SECOND ``` after the marker)
      // First, skip past the opening ```
      const codeBlockStart = markerLine + 1;
      if (result[codeBlockStart]?.trim() !== "```") {
        // Malformed - no opening ```, just insert new block
        result.splice(link.lineIndex, 0, ...block);
        return result;
      }
      // Find the closing ``` (after the ASCII content)
      const codeBlockEnd = findCodeBlockEnd(result, codeBlockStart + 1);
      // Also consume the empty line after the code block if present
      let deleteCount = codeBlockEnd - markerLine + 1;
      if (result[codeBlockEnd + 1] === "") {
        deleteCount++;
      }
      result.splice(markerLine, deleteCount, ...block);
      return result;
    }
  }

  // Insert new block before link
  result.splice(link.lineIndex, 0, ...block);
  return result;
}

function findMarkerLine(lines: string[], startIndex: number, mmdPath: string): number {
  // Search up to 25 lines back to handle multi-line ASCII art
  for (let i = startIndex - 1; i >= Math.max(0, startIndex - 25); i--) {
    if (lines[i] === `<!-- MAAR: ${mmdPath} -->`) {
      return i;
    }
  }
  return -1;
}

function findCodeBlockEnd(lines: string[], startIndex: number): number {
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].trim() === "```") {
      return i;
    }
  }
  return startIndex;
}

export async function writeFileAtomic(
  filePath: string,
  content: string,
): Promise<void> {
  const tmpPath = `${filePath}.tmp.${crypto.randomUUID()}`;
  await Deno.writeTextFile(tmpPath, content);
  await Deno.rename(tmpPath, filePath);
}
