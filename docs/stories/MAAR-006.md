# Story MAAR-006: Output Reporting

**Points:** 1  
**Priority:** Must Have  
**Status:** Not Started  
**Depends On:** MAAR-001

## Story

As a user, I want clear console output showing processing results so that I know what happened.

## Acceptance Criteria

- [ ] Success: `✓ <file>: <n> diagrams`
- [ ] Warning (0 diagrams): `⚠ <file>: 0 diagrams`
- [ ] Error: `✗ <file>: <diagram> - <message>`
- [ ] Summary on success: `Done. Total: <n> diagrams in <m> files.`
- [ ] No summary on error
- [ ] Exit code 0 on success/warning, 1 on error

## Technical Notes

- One line per file
- Fail-fast: stop and exit 1 on first error
- Console output only (no structured data)
- Use stdout for normal output, stderr for errors

## Implementation Hints

```typescript
// src/reporter.ts
import { FileResult } from './types.js';

export function formatSuccess(file: string, count: number): string {
  return `✓ ${file}: ${count} diagram${count === 1 ? '' : 's'}`;
}

export function formatWarning(file: string): string {
  return `⚠ ${file}: 0 diagrams`;
}

export function formatError(
  file: string, 
  diagram: string, 
  message: string
): string {
  return `✗ ${file}: ${diagram} - ${message}`;
}

export function formatSummary(
  totalDiagrams: number, 
  totalFiles: number
): string {
  return `Done. Total: ${totalDiagrams} diagram${totalDiagrams === 1 ? '' : 's'} in ${totalFiles} file${totalFiles === 1 ? '' : 's'}.`;
}

export function printResults(results: FileResult[]): void {
  for (const result of results) {
    if (result.count === 0) {
      console.log(formatWarning(result.filePath));
    } else {
      console.log(formatSuccess(result.filePath, result.count));
    }
  }
}
```

## Files to Create/Modify

- `src/reporter.ts` (create)
