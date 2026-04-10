# Story MAAR-008: Tests

**Points:** 3\
**Priority:** Should Have\
**Status:** Not Started\
**Depends On:** MAAR-007

## Story

As a developer, I want automated tests so that I can verify correctness and prevent regressions.

## Acceptance Criteria

- [ ] Unit tests for `detector.ts` (link detection, marker detection)
- [ ] Unit tests for `injector.ts` (fresh injection, replacement)
- [ ] Unit tests for `reporter.ts` (output formatting)
- [ ] Integration test: single file, single diagram
- [ ] Integration test: single file, multiple diagrams
- [ ] Integration test: multiple files
- [ ] Error case tests (missing file, missing .mmd, render error)

## Technical Notes

- Use Node.js built-in test runner (`node:test`)
- Create test fixtures in `test/fixtures/`
- Mock pretty-mermaid for unit tests
- Use temporary directories for file operations

## Implementation Hints

````typescript
// test/detector.test.ts
import { describe, it } from "node:test";
import assert from "node:assert";
import { detectDiagramLinks, findExistingMarker } from "../src/detector.js";

describe("detectDiagramLinks", () => {
  it("detects basic mmd link", () => {
    const lines = ["# Title", "", "[Flow](diagrams/flow.mmd)"];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 1);
    assert.strictEqual(links[0].mmdPath, "diagrams/flow.mmd");
    assert.strictEqual(links[0].lineIndex, 2);
  });

  it("detects image-style mmd link", () => {
    const lines = ["![Alt](path/to/diagram.mmd)"];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 1);
  });

  it("is case insensitive", () => {
    const lines = ["[Label](diagram.MMD)", "[Label](diagram.Mmd)"];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 2);
  });

  it("returns empty array when no links", () => {
    const lines = ["# Title", "Some text"];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 0);
  });
});

describe("findExistingMarker", () => {
  it("finds marker before link", () => {
    const lines = [
      "<!-- MAAR: diagram.mmd -->",
      "```",
      "ascii",
      "```",
      "",
      "[Label](diagram.mmd)",
    ];
    const marker = findExistingMarker(lines, 5);

    assert.notStrictEqual(marker, null);
    assert.strictEqual(marker!.mmdPath, "diagram.mmd");
  });
});
````

````typescript
// test/injector.test.ts
import { describe, it } from "node:test";
import assert from "node:assert";
import { createInjectionBlock, injectAscii } from "../src/injector.js";
import { DiagramLink } from "../src/types.js";

describe("createInjectionBlock", () => {
  it("creates properly formatted block", () => {
    const block = createInjectionBlock("path.mmd", "ASCII");

    assert.strictEqual(block[0], "<!-- MAAR: path.mmd -->");
    assert.strictEqual(block[1], "```");
    assert.strictEqual(block[2], "ASCII");
    assert.strictEqual(block[3], "```");
    assert.strictEqual(block[4], "");
  });
});

describe("injectAscii", () => {
  it("inserts block before link for new diagram", () => {
    const lines = ["# Title", "[Label](path.mmd)"];
    const link: DiagramLink = {
      lineIndex: 1,
      mmdPath: "path.mmd",
      originalLine: "[Label](path.mmd)",
      linkText: "Label",
    };

    const result = injectAscii(lines, link, "ASCII", false);

    assert.strictEqual(result[0], "# Title");
    assert.strictEqual(result[1], "<!-- MAAR: path.mmd -->");
    assert.strictEqual(result[2], "```");
    assert.strictEqual(result[3], "ASCII");
    assert.strictEqual(result[4], "```");
    assert.strictEqual(result[5], "");
    assert.strictEqual(result[6], "[Label](path.mmd)");
  });
});
````

```typescript
// test/reporter.test.ts
import { describe, it } from "node:test";
import assert from "node:assert";
import { formatError, formatSuccess, formatSummary, formatWarning } from "../src/reporter.js";

describe("reporter", () => {
  it("formats success correctly", () => {
    assert.strictEqual(formatSuccess("file.md", 1), "✓ file.md: 1 diagram");
    assert.strictEqual(formatSuccess("file.md", 3), "✓ file.md: 3 diagrams");
  });

  it("formats warning correctly", () => {
    assert.strictEqual(formatWarning("file.md"), "⚠ file.md: 0 diagrams");
  });

  it("formats error correctly", () => {
    assert.strictEqual(
      formatError("file.md", "diagram.mmd", "not found"),
      "✗ file.md: diagram.mmd - not found",
    );
  });

  it("formats summary correctly", () => {
    assert.strictEqual(formatSummary(5, 2), "Done. Total: 5 diagrams in 2 files.");
    assert.strictEqual(formatSummary(1, 1), "Done. Total: 1 diagram in 1 file.");
  });
});
```

## Test Fixtures

```
test/
├── fixtures/
│   ├── simple.md
│   ├── simple.mmd
│   ├── multiple.md
│   ├── diagram1.mmd
│   ├── diagram2.mmd
│   └── existing-marker.md
├── detector.test.ts
├── injector.test.ts
├── reporter.test.ts
└── integration.test.ts
```

## Files to Create/Modify

- `test/detector.test.ts` (create)
- `test/injector.test.ts` (create)
- `test/reporter.test.ts` (create)
- `test/integration.test.ts` (create)
- `test/fixtures/*` (create)
