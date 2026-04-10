# Story MAAR-007: Integration & Main Loop

**Points:** 2\
**Priority:** Must Have\
**Status:** Not Started\
**Depends On:** MAAR-002, MAAR-003, MAAR-004, MAAR-005, MAAR-006

## Story

As a user, I want a complete working CLI tool that orchestrates all components so that I can use a
single command to process files.

## Acceptance Criteria

- [ ] Wires CLI → Detector → Renderer → Injector → Reporter
- [ ] Processes files sequentially
- [ ] Stops on first error (fail-fast)
- [ ] Produces deterministic output (re-running gives same result)
- [ ] All previous stories' acceptance criteria pass end-to-end

## Technical Notes

- Main entry point: `maar.ts`
- Process files in order provided
- Import all modules from `src/`
- Process diagrams in reverse order within each file (bottom to top)

## Implementation Hints

```typescript
// maar.ts
#!/usr/bin/env node

import { readFileSync } from 'fs';
import { dirname } from 'path';
import { parseArgs } from './src/cli.js';
import { detectDiagramLinks, findExistingMarker } from './src/detector.js';
import { renderToAscii } from './src/renderer.js';
import { injectAscii, writeFileAtomic } from './src/injector.js';
import { formatError, formatSuccess, formatWarning, formatSummary } from './src/reporter.js';
import { FileResult } from './src/types.js';

async function processFile(filePath: string): Promise<FileResult> {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const links = detectDiagramLinks(lines);
  
  if (links.length === 0) {
    return { filePath, count: 0, diagrams: [] };
  }
  
  const diagrams: FileResult['diagrams'] = [];
  const markdownDir = dirname(filePath);
  
  // Process in reverse order to preserve line indices
  const sortedLinks = [...links].sort((a, b) => b.lineIndex - a.lineIndex);
  let currentLines = [...lines];
  
  for (const link of sortedLinks) {
    const render = await renderToAscii(link.mmdPath, markdownDir);
    
    if (!render.success) {
      console.error(formatError(filePath, link.mmdPath, render.error!));
      process.exit(1);
    }
    
    const marker = findExistingMarker(currentLines, link.lineIndex);
    currentLines = injectAscii(currentLines, link, render.ascii!, !!marker);
    
    diagrams.push({ status: 'success', path: link.mmdPath });
  }
  
  await writeFileAtomic(filePath, currentLines.join('\n'));
  
  return { filePath, count: diagrams.length, diagrams };
}

async function main() {
  const filePaths = parseArgs(process.argv);
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
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
```

## Files to Create/Modify

- `maar.ts` (create)
