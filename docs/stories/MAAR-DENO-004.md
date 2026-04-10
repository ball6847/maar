# MAAR-DENO-004: Migrate Tests to Deno Test Runner

## User Story

As a developer, I want to migrate all tests from Node.js test runner to Deno's native test runner so
that tests run with Deno.

## Acceptance Criteria

- [ ] Replace `node:test` imports with `Deno.test`
- [ ] Replace `node:assert` with `jsr:@std/assert`
- [ ] Update test file extensions to `.test.ts` (Deno convention)
- [ ] Ensure all 23 tests pass with `deno test`
- [ ] Update test utilities (file creation, temp directories)

## Migration Examples

### Before (Node.js)

```typescript
import { describe, it } from "node:test";
import assert from "node:assert";
import { detectDiagramLinks } from "../src/detector.js";

describe("detectDiagramLinks", () => {
  it("detects basic mmd link", () => {
    const lines = ["# Title", "", "[Flow](diagrams/flow.mmd)"];
    const links = detectDiagramLinks(lines);
    assert.strictEqual(links.length, 1);
  });
});
```

### After (Deno)

```typescript
import { assertEquals } from "jsr:@std/assert";
import { detectDiagramLinks } from "../src/detector.ts";

Deno.test("detectDiagramLinks detects basic mmd link", () => {
  const lines = ["# Title", "", "[Flow](diagrams/flow.mmd)"];
  const links = detectDiagramLinks(lines);
  assertEquals(links.length, 1);
});
```

## Files to Migrate

- `test/cli.test.ts`
- `test/detector.test.ts`
- `test/injector.test.ts`
- `test/reporter.test.ts`
- `test/integration.test.ts`

## Test Utilities Update

### File Operations in Tests

```typescript
// Before
import { unlink, writeFile } from "fs/promises";
await writeFile("test/temp/file.md", "# Test");

// After
await Deno.writeTextFile("test/temp/file.md", "# Test");
```

### Subprocess Tests (Integration)

```typescript
// Before
import { exec } from "child_process";
const { stdout } = await execAsync(`npx tsx maar.ts ${testFile}`);

// After
const command = new Deno.Command("deno", {
  args: ["run", "--allow-read", "--allow-write", "maar.ts", testFile],
});
const { stdout } = await command.output();
```

## Definition of Done

- [ ] All 5 test files migrated to Deno.test
- [ ] All 23 tests pass with `deno test --allow-read --allow-write`
- [ ] Test utilities updated for Deno APIs
- [ ] Integration tests use Deno.Command

## Effort Estimate

2 story points
