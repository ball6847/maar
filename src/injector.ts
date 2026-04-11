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
      // Find the opening ```, skipping any blank lines between marker and code fence
      const codeBlockStart = findCodeBlockStart(result, markerLine + 1);
      if (codeBlockStart === -1) {
        // Malformed - no opening ```, just insert new block
        result.splice(link.lineIndex, 0, ...block);
        return result;
      }
      // Find the closing ``` (after the ASCII content)
      const codeBlockEnd = findCodeBlockEnd(result, codeBlockStart + 1);
      // Delete from marker line through closing ```, including blank lines before/after
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
  // Search up to 100 lines back to handle large ASCII art blocks
  for (let i = startIndex - 1; i >= Math.max(0, startIndex - 100); i--) {
    if (lines[i] === `<!-- MAAR: ${mmdPath} -->`) {
      return i;
    }
  }
  return -1;
}

function findCodeBlockStart(lines: string[], startIndex: number): number {
  for (let i = startIndex; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === "```") {
      return i;
    }
    if (trimmed !== "") {
      return -1;
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
