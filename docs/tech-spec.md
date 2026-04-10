# Technical Specification: Mermaid ASCII Auto-Renderer (maar)

**Version:** 1.0  
**Date:** 2026-04-10  
**Project Level:** 1 (Small feature)  
**Based on:** docs/PRD.md

---

## 1. Executive Summary

This document provides the technical specification for `maar`, a TypeScript CLI tool that auto-renders linked Mermaid diagram files (.mmd) into ASCII art using pretty-mermaid and injects the output into Markdown files.

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Node.js + tsx | Fast TypeScript execution without build step |
| Rendering Engine | pretty-mermaid | Existing CLI tool for Mermaid→ASCII conversion |
| File I/O | Atomic writes | Prevent corruption on interruption |
| Parsing | Line-by-line regex | Simple, deterministic, no markdown parser dependency |

---

## 2. System Architecture

### 2.1 High-Level Flow

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
│ (updated)   │     │ (atomic)     │     │ (pretty-mermaid)│
└─────────────┘     └──────────────┘     └─────────────────┘
```

### 2.2 Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| CLI Parser | Validate args, exit 1 if no files provided |
| File Validator | Check existence, exit 1 if missing |
| Link Detector | Find `.mmd` links via regex, extract paths |
| Path Resolver | Resolve relative to markdown file directory |
| Renderer | Execute pretty-mermaid, capture stdout |
| Injector | Insert/replace ASCII blocks with MAAR markers |
| Reporter | Output progress and results |

---

## 3. Module Design

### 3.1 File Structure

```
maar/
├── src/
│   ├── types.ts          # TypeScript interfaces
│   ├── cli.ts            # CLI argument parsing
│   ├── detector.ts       # Mermaid link detection
│   ├── renderer.ts       # pretty-mermaid execution
│   ├── injector.ts       # Markdown modification
│   └── reporter.ts       # Output formatting
├── maar.ts               # Main entry point
├── package.json
└── tsconfig.json
```

### 3.2 Module Interfaces

#### types.ts
```typescript
interface DiagramLink {
  lineIndex: number;      // 0-based line number
  mmdPath: string;        // Relative path from markdown
  originalLine: string;   // Full markdown line
  linkText: string;       // Link label/text
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
  | { status: 'success'; path: string }
  | { status: 'error'; path: string; message: string };
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
// Execute pretty-mermaid CLI
function renderToAscii(mmdPath: string): Promise<RenderResult>;

// Build command: pretty-mermaid < input.mmd
// pretty-mermaid outputs ASCII to stdout
```

#### injector.ts
```typescript
// Generate injection block
function createInjectionBlock(mmdPath: string, ascii: string): string[];

// Modify lines in place
function injectAscii(
  lines: string[], 
  link: DiagramLink, 
  ascii: string
): string[];

// Atomic file write
function writeFileAtomic(filePath: string, content: string): Promise<void>;
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

## 4. Algorithm Details

### 4.1 Main Processing Loop

```
function main(filePaths: string[]): void {
  // 1. Validate all files exist
  for file in filePaths:
    if not exists(file):
      print error, exit 1

  let totalDiagrams = 0
  let results = []

  // 2. Process each file sequentially
  for filePath in filePaths:
    result = processFile(filePath)
    
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

### 4.2 File Processing

```
function processFile(filePath: string): FileResult {
  lines = readFile(filePath).split('\n')
  links = detectDiagramLinks(lines)
  
  if links.length == 0:
    return { filePath, count: 0, diagrams: [] }

  diagrams = []
  
  for link in links:
    // Resolve absolute path
    absolutePath = resolve(dirname(filePath), link.mmdPath)
    
    if not exists(absolutePath):
      return error result

    // Render ASCII
    render = renderToAscii(absolutePath)
    
    if not render.success:
      return error result

    // Inject into lines
    lines = injectAscii(lines, link, render.ascii)
    diagrams.push({ status: 'success', path: link.mmdPath })

  // Atomic write
  writeFileAtomic(filePath, lines.join('\n'))
  
  return { filePath, count: diagrams.length, diagrams }
}
```

### 4.3 Injection Strategy

```
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
```

---

## 5. Error Handling Strategy

| Scenario | Behavior | Exit Code |
|----------|----------|-----------|
| No CLI args | Print usage, exit | 1 |
| File not found | `✗ <file> - file not found` | 1 |
| Permission denied | `✗ <file> - permission denied` | 1 |
| .mmd file not found | `✗ <file>: <diagram> - file not found` | 1 |
| Render failure | `✗ <file>: <diagram> - <error>` | 1 |
| Empty render output | `✗ <file>: <diagram> - empty output` | 1 |
| No diagrams found | `⚠ <file>: 0 diagrams` | 0 |
| Success | `✓ <file>: <n> diagrams` | 0 |

### Fail-Fast Behavior
- Stop processing immediately on first error
- Do not process remaining files
- Exit code 1

---

## 6. Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| pretty-mermaid | ^1.x | Mermaid to ASCII rendering |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.x | TypeScript compiler |
| tsx | ^4.x | TypeScript execution |
| @types/node | ^20.x | Node.js types |

---

## 7. Build & Run Instructions

### Development
```bash
# Install dependencies
npm install

# Run directly
npx tsx maar.ts <file1.md> [file2.md ...]
```

### Build (Optional)
```bash
# Compile to JavaScript
npx tsc

# Run compiled version
node dist/maar.js <file1.md> [file2.md ...]
```

---

## 8. Testing Strategy

### 8.1 Test Categories

| Category | Approach | Coverage |
|----------|----------|----------|
| Unit | Direct function testing | Detector, Injector, Reporter |
| Integration | CLI subprocess | End-to-end workflows |
| E2E | Real file operations | Full pipeline with .mmd files |

### 8.2 Test Cases

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

---

## 9. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| pretty-mermaid not installed | High | Medium | Check dependency in setup, document requirement |
| pretty-mermaid breaking change | Medium | Low | Pin version, test on updates |
| Large .mmd files cause OOM | Medium | Low | Stream processing if needed |
| Concurrent file access | Low | Low | Atomic writes prevent corruption |
| Markdown parsing edge cases | Medium | Medium | Use regex, not parser; document limitations |

---

## 10. Success Criteria Verification

| Criteria | Verification Method |
|----------|---------------------|
| Single CLI call handles all | Integration test with multiple files |
| Exit 1 on any error | Unit tests for each error scenario |
| <15 tokens per file output | Measure output length in tests |
| Atomic file editing | Test interruption handling |
| Deterministic output | Re-run tests verify identical output |
| Original links preserved | Verify links exist after injection |
| No agent-side ASCII manipulation | Verify ASCII comes from pretty-mermaid only |

---

## 11. Out of Scope Confirmation

| Feature | Status | Rationale |
|---------|--------|-----------|
| Watch mode | ❌ Out | PRD requirement |
| Caching/mtime | ❌ Out | PRD requirement |
| Parallel processing | ❌ Out | PRD requirement (sequential only) |
| Dry-run mode | ❌ Out | PRD requirement |
| Configurable markers | ❌ Out | PRD requirement |
| Custom code block languages | ❌ Out | PRD requirement |

---

## 12. Implementation Order

1. **Setup** - package.json, tsconfig.json, types.ts
2. **CLI** - Argument parsing, file validation
3. **Detector** - Link detection, marker detection
4. **Reporter** - Output formatting
5. **Renderer** - pretty-mermaid integration
6. **Injector** - Markdown modification, atomic writes
7. **Integration** - Main loop, wiring
8. **Tests** - Unit and integration tests
9. **Documentation** - README update

---

**Document Status:** Ready for Implementation  
**Next Step:** Sprint Planning (`/sprint-planning`)
