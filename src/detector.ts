import { DiagramLink } from "./types.ts";

const MMD_LINK_REGEX = /!?\[([^\]]*)\]\(([^)]+\.mmd)\)/i;
const MAAR_MARKER_REGEX = /<!--\s*MAAR:\s*(.+?)\s*-->/i;

export function detectDiagramLinks(lines: string[]): DiagramLink[] {
  const links: DiagramLink[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(MMD_LINK_REGEX);
    if (match) {
      links.push({
        lineIndex: i,
        mmdPath: match[2],
        originalLine: lines[i],
        linkText: match[1],
      });
    }
  }

  return links;
}

export function findExistingMarker(
  lines: string[],
  startIndex: number,
): { lineIndex: number; mmdPath: string } | null {
  // Search up to 25 lines back to handle multi-line ASCII art
  for (let i = startIndex - 1; i >= Math.max(0, startIndex - 25); i--) {
    const match = lines[i].match(MAAR_MARKER_REGEX);
    if (match) {
      return { lineIndex: i, mmdPath: match[1] };
    }
  }
  return null;
}
