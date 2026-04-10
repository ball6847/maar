# Story MAAR-003: Mermaid Link Detection

**Points:** 2  
**Priority:** Must Have  
**Status:** Not Started  
**Depends On:** MAAR-001

## Story

As a user, I want the tool to detect `.mmd` links in markdown files so that it knows which diagrams to render.

## Acceptance Criteria

- [ ] Detects `[label](path/to/diagram.mmd)` format
- [ ] Detects `![alt](path/to/diagram.mmd)` format
- [ ] Case-insensitive extension matching (.mmd, .MMD)
- [ ] Returns line index, path, and original line for each link
- [ ] Detects existing MAAR markers `<!-- MAAR: path -->`

## Technical Notes

- Regex for link: `/!?\[([^\]]*)\]\(([^)]+\.mmd)\)/i`
- Regex for marker: `/<!--\s*MAAR:\s*(.+?)\s*-->/i`
- Handle multiple diagrams per file
- Path in link is relative to markdown file location

## Implementation Hints

```typescript
// src/detector.ts
import { DiagramLink } from './types.js';

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
        linkText: match[1]
      });
    }
  }
  
  return links;
}

export function findExistingMarker(
  lines: string[], 
  startIndex: number
): { lineIndex: number; mmdPath: string } | null {
  // Check up to 5 lines before the link
  for (let i = startIndex - 1; i >= Math.max(0, startIndex - 5); i--) {
    const match = lines[i].match(MAAR_MARKER_REGEX);
    if (match) {
      return { lineIndex: i, mmdPath: match[1] };
    }
  }
  return null;
}
```

## Files to Create/Modify

- `src/detector.ts` (create)
