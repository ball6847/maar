# Story MAAR-004: ASCII Rendering

**Points:** 2\
**Priority:** Must Have\
**Status:** Not Started\
**Depends On:** MAAR-001

## Story

As a user, I want the tool to render Mermaid diagrams to ASCII using pretty-mermaid so that I get
the ASCII representation.

## Acceptance Criteria

- [ ] Executes `pretty-mermaid` CLI with .mmd file input
- [ ] Captures stdout as ASCII output
- [ ] Returns error if pretty-mermaid exits non-zero
- [ ] Returns error if output is empty
- [ ] Resolves .mmd paths relative to markdown file directory

## Technical Notes

- Use `child_process.spawn` for streaming execution
- pretty-mermaid reads from stdin or file
- Path resolution: `path.resolve(markdownDir, mmdPath)`
- Error format: `✗ <file>: <diagram> - <error>`

## Implementation Hints

```typescript
// src/renderer.ts
import { spawn } from "child_process";
import { dirname, resolve } from "path";
import { existsSync } from "fs";
import { RenderResult } from "./types.js";

export async function renderToAscii(
  mmdPath: string,
  markdownDir: string,
): Promise<RenderResult> {
  const absolutePath = resolve(markdownDir, mmdPath);

  if (!existsSync(absolutePath)) {
    return {
      success: false,
      error: "file not found",
    };
  }

  return new Promise((resolve) => {
    const proc = spawn("npx", ["pretty-mermaid", absolutePath], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: stderr.trim() || `exited with code ${code}`,
        });
      } else if (!stdout.trim()) {
        resolve({
          success: false,
          error: "empty output",
        });
      } else {
        resolve({
          success: true,
          ascii: stdout.trimEnd(),
        });
      }
    });
  });
}
```

## Files to Create/Modify

- `src/renderer.ts` (create)
