import type { DiagramLink } from "./types.ts";

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
  linkIndex: number,
  mmdPath: string,
): { lineIndex: number; mmdPath: string } | null {
  // Search backward from link position with early termination at other mmd links
  for (let i = linkIndex - 1; i >= 0; i--) {
    const line = lines[i];

    // EARLY TERMINATION: Hit another mmd link (different diagram's boundary)
    if (MMD_LINK_REGEX.test(line)) {
      return null;
    }

    // Check for marker with matching path
    const markerMatch = line.match(MAAR_MARKER_REGEX);
    if (markerMatch) {
      if (markerMatch[1] === mmdPath) {
        return { lineIndex: i, mmdPath: markerMatch[1] };
      }
      // Found a marker for a different diagram - stop searching
      return null;
    }
  }
  return null;
}
