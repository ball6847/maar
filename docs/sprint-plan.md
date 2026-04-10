# Sprint Plan: Mermaid ASCII Auto-Renderer (maar)

**Sprint:** 1  
**Date:** 2026-04-10  
**Goal:** Implement functional CLI tool for rendering Mermaid diagrams to ASCII  
**Estimated Stories:** 6  
**Estimated Points:** 13

---

## Sprint Goal

Deliver a working CLI tool that can detect `.mmd` links in Markdown files, render them to ASCII using pretty-mermaid, and inject the results with MAAR markers.

---

## User Stories

### Story 1: Project Setup
**ID:** MAAR-001  
**Points:** 1  
**Priority:** Must Have

**Story:**  
As a developer, I want a properly configured TypeScript project so that I can start implementing the CLI tool.

**Acceptance Criteria:**
- [ ] `package.json` with TypeScript, tsx, and pretty-mermaid dependencies
- [ ] `tsconfig.json` with strict mode enabled
- [ ] `src/types.ts` with all TypeScript interfaces defined
- [ ] Can run `npm install` without errors
- [ ] Can execute `npx tsx --version`

**Technical Notes:**
- Use Node.js 18+ compatibility
- Types: `DiagramLink`, `RenderResult`, `FileResult`, `DiagramResult`

---

### Story 2: CLI Argument Parsing
**ID:** MAAR-002  
**Points:** 1  
**Priority:** Must Have

**Story:**  
As a user, I want to pass markdown file paths as CLI arguments so that I can specify which files to process.

**Acceptance Criteria:**
- [ ] CLI accepts multiple file paths: `npx tsx maar.ts file1.md file2.md`
- [ ] Exits with code 1 if no arguments provided
- [ ] Exits with code 1 if any file does not exist
- [ ] Exits with code 1 on permission denied

**Technical Notes:**
- Use `process.argv` for argument parsing
- Validate all files before processing any
- Error format: `✗ <file> - <reason>`

---

### Story 3: Mermaid Link Detection
**ID:** MAAR-003  
**Points:** 2  
**Priority:** Must Have

**Story:**  
As a user, I want the tool to detect `.mmd` links in markdown files so that it knows which diagrams to render.

**Acceptance Criteria:**
- [ ] Detects `[label](path/to/diagram.mmd)` format
- [ ] Detects `![alt](path/to/diagram.mmd)` format
- [ ] Case-insensitive extension matching (.mmd, .MMD)
- [ ] Returns line index, path, and original line for each link
- [ ] Detects existing MAAR markers `<!-- MAAR: path -->`

**Technical Notes:**
- Regex: `/!?\[([^\]]*)\]\(([^)]+\.mmd)\)/i`
- Marker regex: `/<!--\s*MAAR:\s*(.+?)\s*-->/i`
- Handle multiple diagrams per file

---

### Story 4: ASCII Rendering
**ID:** MAAR-004  
**Points:** 2  
**Priority:** Must Have

**Story:**  
As a user, I want the tool to render Mermaid diagrams to ASCII using pretty-mermaid so that I get the ASCII representation.

**Acceptance Criteria:**
- [ ] Executes `pretty-mermaid` CLI with .mmd file input
- [ ] Captures stdout as ASCII output
- [ ] Returns error if pretty-mermaid exits non-zero
- [ ] Returns error if output is empty
- [ ] Resolves .mmd paths relative to markdown file directory

**Technical Notes:**
- Use `child_process.spawn` or `exec`
- Validate .mmd file exists before rendering
- Error format: `✗ <file>: <diagram> - <error>`

---

### Story 5: Markdown Injection
**ID:** MAAR-005  
**Points:** 3  
**Priority:** Must Have

**Story:**  
As a user, I want the tool to inject ASCII art into markdown files with MAAR markers so that the output is properly formatted and updateable.

**Acceptance Criteria:**
- [ ] Inserts ASCII block above the link line for new diagrams
- [ ] Replaces existing ASCII block when MAAR marker present
- [ ] Format:
  ```
  <!-- MAAR: path/to/diagram.mmd -->
  ```
  [ASCII ART]
  ```
  
  [label](path/to/diagram.mmd)
  ```
- [ ] Atomic file write (temp file + rename)
- [ ] Original link preserved exactly

**Technical Notes:**
- Marker detection: check 2 lines above link for marker
- Atomic write: write to `.tmp` file, then rename
- Handle multiple diagrams in correct order (bottom to top to preserve line indices)

---

### Story 6: Output Reporting
**ID:** MAAR-006  
**Points:** 1  
**Priority:** Must Have

**Story:**  
As a user, I want clear console output showing processing results so that I know what happened.

**Acceptance Criteria:**
- [ ] Success: `✓ <file>: <n> diagrams`
- [ ] Warning (0 diagrams): `⚠ <file>: 0 diagrams`
- [ ] Error: `✗ <file>: <diagram> - <message>`
- [ ] Summary on success: `Done. Total: <n> diagrams in <m> files.`
- [ ] No summary on error
- [ ] Exit code 0 on success/warning, 1 on error

**Technical Notes:**
- One line per file
- Fail-fast: stop and exit 1 on first error
- Console output only (no structured data)

---

### Story 7: Integration & Main Loop
**ID:** MAAR-007  
**Points:** 2  
**Priority:** Must Have

**Story:**  
As a user, I want a complete working CLI tool that orchestrates all components so that I can use a single command to process files.

**Acceptance Criteria:**
- [ ] Wires CLI → Detector → Renderer → Injector → Reporter
- [ ] Processes files sequentially
- [ ] Stops on first error (fail-fast)
- [ ] Produces deterministic output (re-running gives same result)
- [ ] All previous stories' acceptance criteria pass end-to-end

**Technical Notes:**
- Main entry point: `maar.ts`
- Process files in order provided
- Import all modules from `src/`

---

### Story 8: Tests
**ID:** MAAR-008  
**Points:** 3  
**Priority:** Should Have

**Story:**  
As a developer, I want automated tests so that I can verify correctness and prevent regressions.

**Acceptance Criteria:**
- [ ] Unit tests for `detector.ts` (link detection, marker detection)
- [ ] Unit tests for `injector.ts` (fresh injection, replacement)
- [ ] Unit tests for `reporter.ts` (output formatting)
- [ ] Integration test: single file, single diagram
- [ ] Integration test: single file, multiple diagrams
- [ ] Integration test: multiple files
- [ ] Error case tests (missing file, missing .mmd, render error)

**Technical Notes:**
- Use Node.js built-in test runner or Vitest
- Create test fixtures in `test/fixtures/`
- Mock pretty-mermaid for unit tests

---

## Story Map

```
Setup ────────┐
CLI ──────────┤
Detector ─────┼──▶ Integration ──▶ Tests
Renderer ─────┤
Injector ─────┤
Reporter ─────┘
```

## Dependencies

| Story | Depends On |
|-------|-----------|
| MAAR-002 | MAAR-001 |
| MAAR-003 | MAAR-001 |
| MAAR-004 | MAAR-001 |
| MAAR-005 | MAAR-001 |
| MAAR-006 | MAAR-001 |
| MAAR-007 | MAAR-002, MAAR-003, MAAR-004, MAAR-005, MAAR-006 |
| MAAR-008 | MAAR-007 |

## Sprint Burndown

| Day | Planned | Completed | Remaining |
|-----|---------|-----------|-----------|
| 1 | Stories 1-3 | - | - |
| 2 | Stories 4-5 | - | - |
| 3 | Stories 6-7 | - | - |
| 4 | Story 8 | - | - |
| 5 | Buffer | - | - |

## Definition of Done

- [ ] Code implemented and committed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Documentation updated (if needed)
- [ ] PR reviewed and merged

---

**Next Step:** Create individual stories with `/create-story <story-id>` or start development with `/dev-story MAAR-001`
