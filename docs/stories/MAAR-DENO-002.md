# MAAR-DENO-002: Migrate Source Code to Deno APIs

## User Story

As a developer, I want to migrate all Node.js APIs to Deno equivalents so that the code runs
natively on Deno runtime.

## Acceptance Criteria

- [ ] Replace `readFileSync` with `Deno.readTextFile`
- [ ] Replace `writeFile`/`rename` atomic pattern with Deno equivalent
- [ ] Replace `process.argv` with `Deno.args`
- [ ] Replace `process.exit` with `Deno.exit`
- [ ] Replace Node.js `path` module with Deno path utilities
- [ ] Update `import` statements to use `.ts` extensions (Deno requirement)
- [ ] All TypeScript types remain valid

## Migration Mapping

| Current (Node.js)                                 | Target (Deno)                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `import { readFileSync } from 'fs'`               | `Deno.readTextFile(path)`                                                     |
| `import { writeFile, rename } from 'fs/promises'` | `Deno.writeTextFile(tempPath, content)` + `Deno.rename(tempPath, targetPath)` |
| `import { resolve, dirname } from 'path'`         | `new URL(b, import.meta.url).pathname` or `import.meta.resolve`               |
| `process.argv.slice(2)`                           | `Deno.args`                                                                   |
| `process.exit(1)`                                 | `Deno.exit(1)`                                                                |

## Files to Update

- `maar.ts` - Main entry point
- `src/cli.ts` - Argument parsing (remove file permission checks, Deno handles this)
- `src/detector.ts` - No changes (pure logic)
- `src/renderer.ts` - Import path for beautiful-mermaid
- `src/injector.ts` - Atomic write implementation
- `src/reporter.ts` - No changes (pure logic)
- `src/types.ts` - No changes (type definitions)

## Definition of Done

- [ ] All Node.js APIs replaced with Deno equivalents
- [ ] Code passes `deno check` without errors
- [ ] Code passes `deno lint` without errors
- [ ] Manual test: `deno run --allow-read --allow-write maar.ts test.md` works

## Effort Estimate

2 story points
