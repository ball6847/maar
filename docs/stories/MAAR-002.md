# Story MAAR-002: CLI Argument Parsing

**Points:** 1\
**Priority:** Must Have\
**Status:** Not Started\
**Depends On:** MAAR-001

## Story

As a user, I want to pass markdown file paths as CLI arguments so that I can specify which files to
process.

## Acceptance Criteria

- [ ] CLI accepts multiple file paths: `npx tsx maar.ts file1.md file2.md`
- [ ] Exits with code 1 if no arguments provided
- [ ] Exits with code 1 if any file does not exist
- [ ] Exits with code 1 on permission denied

## Technical Notes

- Use `process.argv` for argument parsing (skip first two elements)
- Validate all files before processing any (fail-fast)
- Error format: `✗ <file> - <reason>`
- Use `fs.existsSync()` and `fs.accessSync()` for validation

## Implementation Hints

```typescript
// src/cli.ts
import { accessSync, constants, existsSync } from "fs";

export function parseArgs(argv: string[]): string[] {
  const args = argv.slice(2); // Remove node and script path

  if (args.length === 0) {
    console.error("Usage: npx tsx maar.ts <file1.md> [file2.md ...]");
    process.exit(1);
  }

  for (const file of args) {
    if (!existsSync(file)) {
      console.error(`✗ ${file} - file not found`);
      process.exit(1);
    }
    try {
      accessSync(file, constants.R_OK | constants.W_OK);
    } catch {
      console.error(`✗ ${file} - permission denied`);
      process.exit(1);
    }
  }

  return args;
}
```

## Files to Create/Modify

- `src/cli.ts` (create)
- `maar.ts` (create - main entry)
