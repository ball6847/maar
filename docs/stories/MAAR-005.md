# Story MAAR-005: Markdown Injection

**Points:** 3\
**Priority:** Must Have\
**Status:** Not Started\
**Depends On:** MAAR-001

## Story

As a user, I want the tool to inject ASCII art into markdown files with MAAR markers so that the
output is properly formatted and updateable.

## Acceptance Criteria

- [ ] Inserts ASCII block above the link line for new diagrams
- [ ] Replaces existing ASCII block when MAAR marker present
- [ ] Format:
  ```markdown
  <!-- MAAR: path/to/diagram.mmd -->
  ```
  [ASCII ART]
  ```
  [label](path/to/diagram.mmd)
  ```
- [ ] Atomic file write (temp file + rename)
- [ ] Original link preserved exactly

## Technical Notes

- Process diagrams in reverse order (bottom to top) to preserve line indices
- Atomic write: write to `<file>.tmp.<random>`, then rename
- Marker detection: check up to 5 lines above link
- Preserve original file's ending newline behavior

## Implementation Hints

````typescript
// src/injector.ts
import { rename, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { randomBytes } from "crypto";
import { DiagramLink } from "./types.js";

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
    // Find and replace existing block
    // Marker is at link.lineIndex - 4 (approximately)
    // Replace from marker to just before link
    const markerLine = link.lineIndex - 4;
    result.splice(markerLine, 4, ...block);
  } else {
    // Insert new block before link
    result.splice(link.lineIndex, 0, ...block);
  }

  return result;
}

export async function writeFileAtomic(
  filePath: string,
  content: string,
): Promise<void> {
  const tmpPath = `${filePath}.tmp.${randomBytes(4).toString("hex")}`;
  await writeFile(tmpPath, content, "utf-8");
  await rename(tmpPath, filePath);
}
````

## Files to Create/Modify

- `src/injector.ts` (create)
