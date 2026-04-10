# Technical Specification: Mermaid ASCII Auto-Renderer (maar)

**Version:** 2.0\
**Date:** 2026-04-10\
**Project Level:** 1 (Small feature)\
**Based on:** docs/PRD.md

---

## 1. Executive Summary

This document provides the technical specification for `maar`, a TypeScript CLI tool that
auto-renders linked Mermaid diagram files (.mmd) into ASCII art using beautiful-mermaid and injects
the output into Markdown files.

### Key Technical Decisions

| Decision         | Choice             | Rationale                                              |
| ---------------- | ------------------ | ------------------------------------------------------ |
| Runtime          | **Deno**           | Secure-by-default, native TypeScript, JSR distribution |
| Rendering Engine | beautiful-mermaid  | npm compatibility via `npm:` specifiers                |
| File I/O         | Atomic writes      | Prevent corruption on interruption                     |
| Parsing          | Line-by-line regex | Simple, deterministic, no markdown parser dependency   |
| Distribution     | JSR                | First-class TypeScript support, secure sandbox         |

---

## 2. Deno Migration Overview

### 2.1 Why Deno + JSR?

| Aspect       | Node.js + npm             | Deno + JSR                     |
| ------------ | ------------------------- | ------------------------------ |
| TypeScript   | Requires transpilation    | Native execution               |
| Security     | No sandbox                | Permission-based (`--allow-*`) |
| Distribution | npm registry              | JSR (TypeScript-first)         |
| Dependencies | node_modules              | URL imports + lock file        |
| Tooling      | Multiple tools (tsc, tsx) | Single binary                  |
| Speed        | Slower startup            | Faster cold start              |

### 2.2 Migration Compatibility

✅ **Verified Working:**

- `beautiful-mermaid` imports via `npm:beautiful-mermaid`
- Deno native APIs (`Deno.readTextFile`, `Deno.writeTextFile`)
- Permission model for file system access
- JSR publishing workflow

---

## 3. System Architecture

### 3.1 High-Level Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ CLI Args    │────▶│ File Parser  │────▶│ Link Detector   │
│ [file.md...]│     │ (sequential) │     │ (regex scan)    │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                           ┌───────────────────────┘
                           ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Markdown    │◀────│ Injector     │◀────│ ASCII Renderer  │
│ (updated)   │     │ (atomic)     │     │ (beautiful-mermaid)│
└─────────────┘     └──────────────┘     └─────────────────┘
```

### 3.2 Component Responsibilities

| Component      | Responsibility                                |
| -------------- | --------------------------------------------- |
| CLI Parser     | Validate args, exit 1 if no files provided    |
| File Validator | Check existence, exit 1 if missing            |
| Link Detector  | Find `.mmd` links via regex, extract paths    |
| Path Resolver  | Resolve relative to markdown file directory   |
| Renderer       | Call beautiful-mermaid library                |
| Injector       | Insert/replace ASCII blocks with MAAR markers |
| Reporter       | Output progress and results                   |

---

## 4. Module Design

### 4.1 File Structure

```
maar/
├── src/
│   ├── types.ts          # TypeScript interfaces
│   ├── cli.ts            # CLI argument parsing
│   ├── detector.ts       # Mermaid link detection
│   ├── renderer.ts       # beautiful-mermaid rendering
│   ├── injector.ts       # Markdown modification
│   └── reporter.ts       # Output formatting
├── maar.ts               # Main entry point
├── deno.json             # Deno configuration
├── deno.lock             # Dependency lock file
└── jsr.json              # JSR publishing config
```

### 4.2 Module Interfaces

#### types.ts

```typescript
interface DiagramLink {
  lineIndex: number; // 0-based line number
  mmdPath: string; // Relative path from markdown
  originalLine: string; // Full markdown line
  linkText: string; // Link label/text
}

interface RenderResult {
  success: boolean;
  ascii?: string;
  error?: string;
}

interface FileResult {
  filePath: string;
  count: number;
  diagrams: DiagramResult[];
}

type DiagramResult =
  | { status: "success"; path: string }
  | { status: "error"; path: string; message: string };
```

#### detector.ts

```typescript
// Find all .mmd links in markdown content
function detectDiagramLinks(lines: string[]): DiagramLink[];

// Check if line has existing MAAR marker
function findExistingMarker(lines: string[], startIndex: number): number | null;

// Regex patterns
const MMD_LINK_REGEX = /!?\[([^\]]*)\]\(([^)]+\.mmd)\)/i;
const MAAR_MARKER_REGEX = /<!--\s*MAAR:\s*(.+?)\s*-->/i;
```

#### renderer.ts

```typescript
// Import from npm registry
import { renderMermaidASCII } from "npm:beautiful-mermaid";

// Synchronous rendering
function renderToAscii(mmdPath: string): RenderResult;
```

#### injector.ts

```typescript
// Generate injection block
function createInjectionBlock(mmdPath: string, ascii: string): string[];

// Modify lines in place
function injectAscii(
  lines: string[],
  link: DiagramLink,
  ascii: string,
): string[];

// Atomic file write using Deno API
async function writeFileAtomic(filePath: string, content: string): Promise<void>;
```

#### reporter.ts

```typescript
// Format output lines
function formatSuccess(file: string, count: number): string;
function formatWarning(file: string): string;
function formatError(file: string, diagram: string, message: string): string;
function formatSummary(totalDiagrams: number, totalFiles: number): string;
```

---

## 5. Deno Configuration

### 5.1 deno.json

```json
{
  "name": "@scope/maar",
  "version": "1.0.0",
  "exports": "./maar.ts",
  "tasks": {
    "start": "deno run --allow-read --allow-write maar.ts",
    "test": "deno test --allow-read --allow-write",
    "install": "deno install --allow-read --allow-write -n maar jsr:@scope/maar"
  },
  "imports": {
    "beautiful-mermaid": "npm:beautiful-mermaid@^1.1.3"
  },
  "compilerOptions": {
    "strict": true
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 100,
    "indentWidth": 2
  },
  "lint": {
    "include": ["src/", "maar.ts"]
  }
}
```

### 5.2 jsr.json (Publishing)

```json
{
  "name": "@scope/maar",
  "version": "1.0.0",
  "exports": "./maar.ts",
  "include": [
    "maar.ts",
    "src/**/*.ts",
    "README.md",
    "LICENSE"
  ]
}
```

### 5.3 Permissions Model

| Permission | Flag            | Purpose                      |
| ---------- | --------------- | ---------------------------- |
| Read       | `--allow-read`  | Read markdown and .mmd files |
| Write      | `--allow-write` | Atomic file modification     |

**Security Best Practices:**

- Users can scope permissions: `--allow-read=./docs --allow-write=./docs`
- No network permissions required (beautiful-mermaid bundles all dependencies)

---

## 6. Algorithm Details

### 6.1 Main Processing Loop

```
async function main(filePaths: string[]): Promise<void> {
  // 1. Validate all files exist
  for file in filePaths:
    if not exists(file):
      print error, exit 1

  let totalDiagrams = 0
  let results = []

  // 2. Process each file sequentially
  for filePath in filePaths:
    result = await processFile(filePath)
    
    if result.error:
      print error line
      exit 1
    
    if result.count == 0:
      print warning line
    else:
      print success line
      totalDiagrams += result.count

  // 3. Output summary
  print summary line
  exit 0
}
```

### 6.2 File Processing

```
async function processFile(filePath: string): Promise<FileResult> {
  lines = (await Deno.readTextFile(filePath)).split('\n')
  links = detectDiagramLinks(lines)
  
  if links.length == 0:
    return { filePath, count: 0, diagrams: [] }

  diagrams = []
  
  for link in links:
    // Resolve absolute path
    absolutePath = resolve(dirname(filePath), link.mmdPath)
    
    if not exists(absolutePath):
      return error result

    // Render ASCII (synchronous)
    render = renderToAscii(absolutePath)
    
    if not render.success:
      return error result

    // Inject into lines
    lines = injectAscii(lines, link, render.ascii)
    diagrams.push({ status: 'success', path: link.mmdPath })

  // Atomic write using Deno APIs
  await writeFileAtomic(filePath, lines.join('\n'))
  
  return { filePath, count: diagrams.length, diagrams }
}
```

### 6.3 Injection Strategy

````
Input lines:
  [0] "# Architecture"
  [1] ""
  [2] "[View Flow](diagrams/flow.mmd)"

After injection at line 2:
  [0] "# Architecture"
  [1] ""
  [2] "<!-- MAAR: diagrams/flow.mmd -->"
  [3] "```"
  [4] "┌─────┐"
  [5] "│Start│"
  [6] "└─────┘"
  [7] "```"
  [8] ""
  [9] "[View Flow](diagrams/flow.mmd)"

Replacement (if marker exists):
  - Find existing marker before link
  - Replace code block between marker and link
  - Keep marker, update code block content
````

---

## 7. Error Handling Strategy

| Scenario            | Behavior                               | Exit Code |
| ------------------- | -------------------------------------- | --------- |
| No CLI args         | Print usage, exit                      | 1         |
| File not found      | `✗ <file> - file not found`            | 1         |
| Permission denied   | `✗ <file> - permission denied`         | 1         |
| .mmd file not found | `✗ <file>: <diagram> - file not found` | 1         |
| Render failure      | `✗ <file>: <diagram> - <error>`        | 1         |
| Empty render output | `✗ <file>: <diagram> - empty output`   | 1         |
| No diagrams found   | `⚠ <file>: 0 diagrams`                 | 0         |
| Success             | `✓ <file>: <n> diagrams`               | 0         |

### Fail-Fast Behavior

- Stop processing immediately on first error
- Do not process remaining files
- Exit code 1

---

## 8. Dependencies

### Runtime Dependencies

| Package           | Version | Source           | Purpose                    |
| ----------------- | ------- | ---------------- | -------------------------- |
| beautiful-mermaid | ^1.1.3  | npm (via `npm:`) | Mermaid to ASCII rendering |

### Deno Built-ins (No External Dependencies)

| API                  | Purpose                      |
| -------------------- | ---------------------------- |
| `Deno.readTextFile`  | Read markdown and .mmd files |
| `Deno.writeTextFile` | Write updated markdown       |
| `Deno.stat`          | File existence check         |
| `Deno.args`          | CLI argument access          |

---

## 9. Build & Run Instructions

### Development

```bash
# Run directly (no install needed)
deno run --allow-read --allow-write maar.ts <file1.md> [file2.md ...]

# Or use task
deno task start <file1.md> [file2.md ...]
```

### Testing

```bash
# Run all tests
deno task test

# Or directly
deno test --allow-read --allow-write
```

### Install from JSR (End User)

```bash
# Install globally
deno install --allow-read --allow-write -n maar jsr:@scope/maar

# Use anywhere
maar docs/*.md
```

### Publish to JSR (Maintainer)

```bash
# Dry run
deno publish --dry-run

# Publish (requires JSR_TOKEN)
deno publish
```

---

## 10. Testing Strategy

### 10.1 Test Categories

| Category    | Approach             | Coverage                      |
| ----------- | -------------------- | ----------------------------- |
| Unit        | Deno.test native     | Detector, Injector, Reporter  |
| Integration | Deno subprocess      | End-to-end workflows          |
| E2E         | Real file operations | Full pipeline with .mmd files |

### 10.2 Test Cases

**Detector Tests:**

- Valid `.mmd` link: `[label](path.mmd)`
- Image link: `![alt](path.mmd)`
- Multiple links in file
- No links found
- Case insensitive: `.MMD`, `.Mmd`
- Existing MAAR marker detection

**Injector Tests:**

- Fresh injection (no marker)
- Replacement (marker exists)
- Multiple diagrams in file
- Preserves surrounding content

**Integration Tests:**

- Single file, single diagram
- Single file, multiple diagrams
- Multiple files
- Missing file error
- Missing .mmd error
- Invalid .mmd syntax error
- No diagrams warning

### 10.3 Deno Test Example

```typescript
import { assertEquals } from "jsr:@std/assert";
import { detectDiagramLinks } from "./src/detector.ts";

Deno.test("detectDiagramLinks finds .mmd links", () => {
  const lines = ["# Title", "", "[Flow](diagrams/flow.mmd)"];
  const links = detectDiagramLinks(lines);

  assertEquals(links.length, 1);
  assertEquals(links[0].mmdPath, "diagrams/flow.mmd");
});
```

---

## 11. Risks & Mitigations

| Risk                         | Impact | Likelihood | Mitigation                             |
| ---------------------------- | ------ | ---------- | -------------------------------------- |
| beautiful-mermaid npm compat | High   | Low        | Verified working with `npm:` specifier |
| JSR publishing complexity    | Medium | Low        | Follow JSR docs, use `--dry-run` first |
| User Deno adoption           | Medium | Medium     | Clear install docs, compare with npm   |
| Permission model confusion   | Low    | Medium     | Document common patterns in README     |
| Lock file drift              | Low    | Low        | CI checks for lock file updates        |

---

## 12. Success Criteria Verification

| Criteria                         | Verification Method                            |
| -------------------------------- | ---------------------------------------------- |
| Single CLI call handles all      | Integration test with multiple files           |
| Exit 1 on any error              | Unit tests for each error scenario             |
| <15 tokens per file output       | Measure output length in tests                 |
| Atomic file editing              | Test interruption handling                     |
| Deterministic output             | Re-run tests verify identical output           |
| Original links preserved         | Verify links exist after injection             |
| No agent-side ASCII manipulation | Verify ASCII comes from beautiful-mermaid only |
| JSR install works                | Test `deno install` from JSR                   |

---

## 13. Out of Scope Confirmation

| Feature                     | Status | Rationale                         |
| --------------------------- | ------ | --------------------------------- |
| Watch mode                  | ❌ Out | PRD requirement                   |
| Caching/mtime               | ❌ Out | PRD requirement                   |
| Parallel processing         | ❌ Out | PRD requirement (sequential only) |
| Dry-run mode                | ❌ Out | PRD requirement                   |
| Configurable markers        | ❌ Out | PRD requirement                   |
| Custom code block languages | ❌ Out | PRD requirement                   |
| npm compatibility layer     | ❌ Out | Deno/JSR only                     |

---

## 14. Implementation Order (Deno Migration)

1. **Setup** - `deno.json`, `jsr.json`, remove `package.json`, `tsconfig.json`
2. **Core Migration** - Update imports to use `npm:` specifiers
3. **Deno APIs** - Replace Node.js APIs (`fs`, `path`) with Deno equivalents
4. **Renderer** - Update to use `npm:beautiful-mermaid` import
5. **Tests** - Migrate from Node.test to Deno.test
6. **CLI** - Update argument parsing (`Deno.args`)
7. **Integration** - Full pipeline testing
8. **JSR Prep** - Publish config, README update
9. **Publish** - `deno publish` to JSR

---

## 15. Node.js → Deno API Migration Guide

| Node.js API                    | Deno Equivalent                                             |
| ------------------------------ | ----------------------------------------------------------- |
| `readFileSync(path, 'utf-8')`  | `await Deno.readTextFile(path)`                             |
| `writeFileSync(path, content)` | `await Deno.writeTextFile(path, content)`                   |
| `existsSync(path)`             | `await Deno.stat(path).then(() => true).catch(() => false)` |
| `process.argv`                 | `Deno.args`                                                 |
| `process.exit(1)`              | `Deno.exit(1)`                                              |
| `dirname(filePath)`            | `new URL('.', import.meta.url).pathname` or std/path        |
| `resolve(a, b)`                | `new URL(b, a).pathname` or `import.meta.resolve`           |

---

**Document Status:** Ready for Deno Migration\
**Next Step:** Create stories for Deno migration (`/create-story`)
