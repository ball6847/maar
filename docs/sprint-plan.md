# Sprint Plan: Mermaid ASCII Auto-Renderer (maar)

**Sprint:** 1\
**Date:** 2026-04-10\
**Goal:** Implement functional CLI tool for rendering Mermaid diagrams to ASCII\
**Estimated Stories:** 6\
**Estimated Points:** 13

---

## Sprint Goal

Deliver a working CLI tool that can detect `.mmd` links in Markdown files, render them to ASCII
using pretty-mermaid, and inject the results with MAAR markers.

---

## User Stories

### Story 1: Project Setup

**ID:** MAAR-001\
**Points:** 1\
**Priority:** Must Have

**Story:**\
As a developer, I want a properly configured TypeScript project so that I can start implementing the
CLI tool.

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

**ID:** MAAR-002\
**Points:** 1\
**Priority:** Must Have

**Story:**\
As a user, I want to pass markdown file paths as CLI arguments so that I can specify which files to
process.

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

**ID:** MAAR-003\
**Points:** 2\
**Priority:** Must Have

**Story:**\
As a user, I want the tool to detect `.mmd` links in markdown files so that it knows which diagrams
to render.

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

**ID:** MAAR-004\
**Points:** 2\
**Priority:** Must Have

**Story:**\
As a user, I want the tool to render Mermaid diagrams to ASCII using pretty-mermaid so that I get
the ASCII representation.

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

**ID:** MAAR-005\
**Points:** 3\
**Priority:** Must Have

**Story:**\
As a user, I want the tool to inject ASCII art into markdown files with MAAR markers so that the
output is properly formatted and updateable.

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

**ID:** MAAR-006\
**Points:** 1\
**Priority:** Must Have

**Story:**\
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

**ID:** MAAR-007\
**Points:** 2\
**Priority:** Must Have

**Story:**\
As a user, I want a complete working CLI tool that orchestrates all components so that I can use a
single command to process files.

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

**ID:** MAAR-008\
**Points:** 3\
**Priority:** Should Have

**Story:**\
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

| Story    | Depends On                                       |
| -------- | ------------------------------------------------ |
| MAAR-002 | MAAR-001                                         |
| MAAR-003 | MAAR-001                                         |
| MAAR-004 | MAAR-001                                         |
| MAAR-005 | MAAR-001                                         |
| MAAR-006 | MAAR-001                                         |
| MAAR-007 | MAAR-002, MAAR-003, MAAR-004, MAAR-005, MAAR-006 |
| MAAR-008 | MAAR-007                                         |

## Sprint Burndown

| Day | Planned     | Completed | Remaining |
| --- | ----------- | --------- | --------- |
| 1   | Stories 1-3 | -         | -         |
| 2   | Stories 4-5 | -         | -         |
| 3   | Stories 6-7 | -         | -         |
| 4   | Story 8     | -         | -         |
| 5   | Buffer      | -         | -         |

## Definition of Done

- [ ] Code implemented and committed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Documentation updated (if needed)
- [ ] PR reviewed and merged

---

**Status:** ✅ COMPLETE - All stories finished

---

# Sprint 2: Deno Migration

**Sprint:** 2\
**Date:** 2026-04-10\
**Goal:** Migrate from Node.js/npm to Deno/JSR for better distribution and security\
**Estimated Stories:** 6\
**Estimated Points:** 8

---

## Sprint Goal

Migrate the MAAR CLI tool from Node.js runtime with npm distribution to Deno runtime with JSR
distribution. Maintain all existing functionality while leveraging Deno's security model and native
TypeScript support.

---

## User Stories

### Story 1: Setup Deno Configuration

**ID:** MAAR-DENO-001\
**Points:** 1\
**Priority:** Must Have

**Story:**\
As a developer, I want to configure the project for Deno runtime so that I can use Deno's native
TypeScript support and JSR distribution.

**Acceptance Criteria:**

- [ ] Create `deno.json` with project configuration

- [ ] Remove `package.json` and `package-lock.json`
- [ ] Remove `tsconfig.json` (not needed with Deno)
- [ ] Add `deno.lock` to `.gitignore` (or commit for reproducibility)
- [ ] Verify `deno task` commands work

**Technical Notes:**

- Use `deno.json` imports for beautiful-mermaid
- Configure tasks for start and test
- JSR scope: `@ball6847/maar`

---

### Story 2: Migrate Source Code to Deno APIs

**ID:** MAAR-DENO-002\
**Points:** 2\
**Priority:** Must Have

**Story:**\
As a developer, I want to migrate all Node.js APIs to Deno equivalents so that the code runs
natively on Deno runtime.

**Acceptance Criteria:**

- [ ] Replace `readFileSync` with `Deno.readTextFile`
- [ ] Replace `writeFile`/`rename` atomic pattern with Deno equivalent
- [ ] Replace `process.argv` with `Deno.args`
- [ ] Replace `process.exit` with `Deno.exit`
- [ ] Replace Node.js `path` module with Deno path utilities
- [ ] Update `import` statements to use `.ts` extensions

**Technical Notes:**

- Migration guide in tech-spec.md section 15
- Use `import.meta.resolve` for path resolution
- Deno APIs are async-first

---

### Story 3: Update Renderer for Deno npm Compatibility

**ID:** MAAR-DENO-003\
**Points:** 1\
**Priority:** Must Have

**Story:**\
As a developer, I want the renderer to import beautiful-mermaid using Deno's npm specifier so that
it works with Deno's module resolution.

**Acceptance Criteria:**

- [ ] Update `src/renderer.ts` to use `npm:beautiful-mermaid` import
- [ ] Verify beautiful-mermaid renders correctly in Deno
- [ ] Handle any Deno-specific rendering edge cases
- [ ] Ensure synchronous rendering still works

**Technical Notes:**

- Import: `import { renderMermaidASCII } from "npm:beautiful-mermaid"`
- Or use import map: `"beautiful-mermaid": "npm:beautiful-mermaid@^1.1.3"`
- Already verified working with Deno

---

### Story 4: Migrate Tests to Deno Test Runner

**ID:** MAAR-DENO-004\
**Points:** 2\
**Priority:** Must Have

**Story:**\
As a developer, I want to migrate all tests from Node.js test runner to Deno's native test runner so
that tests run with Deno.

**Acceptance Criteria:**

- [ ] Replace `node:test` imports with `Deno.test`
- [ ] Replace `node:assert` with `jsr:@std/assert`
- [ ] Ensure all 23 tests pass with `deno test`
- [ ] Update test utilities (file creation, temp directories)

**Technical Notes:**

- Assert module: `jsr:@std/assert`
- Test pattern: `Deno.test("name", () => { ... })`
- Integration tests use `Deno.Command`

---

### Story 5: Update Documentation for Deno

**ID:** MAAR-DENO-005\
**Points:** 1\
**Priority:** Should Have

**Story:**\
As a user, I want clear documentation on how to install and use maar with Deno so that I can easily
adopt the tool.

**Acceptance Criteria:**

- [ ] Update README.md with Deno installation instructions
- [ ] Update AGENTS.md with Deno development workflow
- [ ] Add JSR install command examples
- [ ] Document permission flags (`--allow-read`, `--allow-write`)

**Technical Notes:**

- Installation: `deno install --allow-read --allow-write -n maar jsr:@ball6847/maar`
- Direct run: `deno run --allow-read --allow-write jsr:@ball6847/maar <file.md>`
- Scoped permissions: `--allow-read=./docs`

---

### Story 6: Setup GitHub Actions for JSR Publishing

**ID:** MAAR-DENO-006\
**Points:** 1\
**Priority:** Should Have

**Story:**\
As a maintainer, I want a GitHub Actions workflow that publishes to JSR on tag releases so that
publishing is automated and doesn't require local JSR tokens.

**Acceptance Criteria:**

- [ ] Create `.github/workflows/publish.yml` for JSR publishing
- [ ] Configure workflow to trigger on version tags (`v*.*.*`)
- [ ] Setup trusted publishing with JSR (GitHub OIDC, no token needed)
- [ ] Add workflow status badge to README
- [ ] Document release process

**Technical Notes:**

- Uses trusted publishing (OIDC) - no JSR_TOKEN secret needed
- Runs format, lint, type check, tests before publishing
- Trigger: `git tag v1.0.0 && git push --tags`

---

## Story Map

```
Setup ────────┐
Migrate APIs ─┼──▶ Renderer ──▶ Tests ──▶ Docs ──▶ Publish
Update Code ──┘
```

## Dependencies

| Story         | Depends On                   |
| ------------- | ---------------------------- |
| MAAR-DENO-002 | MAAR-DENO-001                |
| MAAR-DENO-003 | MAAR-DENO-001                |
| MAAR-DENO-004 | MAAR-DENO-002, MAAR-DENO-003 |
| MAAR-DENO-005 | MAAR-DENO-004                |
| MAAR-DENO-006 | MAAR-DENO-005                |

## Sprint Burndown

| Day | Planned        | Completed | Remaining |
| --- | -------------- | --------- | --------- |
| 1   | Stories 1-2    | -         | -         |
| 2   | Stories 3-4    | -         | -         |
| 3   | Stories 5-6    | -         | -         |
| 4   | Buffer/testing | -         | -         |

## Definition of Done

- [ ] All code migrated to Deno APIs
- [ ] All tests passing with `deno test`
- [ ] `deno publish --dry-run` passes
- [ ] Manual testing confirms functionality preserved
- [ ] Documentation updated
- [ ] (Optional) Published to JSR

---

### Story 7: Version Flag

**ID:** MAAR-DENO-007\
**Points:** 1\
**Priority:** Should Have

**Story:**\
As a user, I want to check the current version of maar so that I can verify my installation.

**Acceptance Criteria:**

- [ ] `--version` flag prints version from deno.json
- [ ] `-v` short flag also works
- [ ] Version output format: `maar v1.0.1`
- [ ] Exits with code 0 after printing version
- [ ] Version check works without file arguments
- [ ] No conflict with file path arguments
- [ ] Update AGENTS.md: add version command to Common Tasks section
- [ ] Update skills/maar/SKILL.md: add version command and upgrade troubleshooting

**Technical Notes:**

- Read version from deno.json at runtime using `import.meta` or import the deno.json
- Check for `--version` or `-v` in `src/cli.ts` before file validation
- Follow GNU standard for `--version` flag

---

## Story Map

```
Setup ────────┐
Migrate APIs ─┼──▶ Renderer ──▶ Tests ──▶ Docs ──▶ Publish ──▶ Version
Update Code ──┘
```

## Dependencies

| Story         | Depends On                   |
| ------------- | ---------------------------- |
| MAAR-DENO-002 | MAAR-DENO-001                |
| MAAR-DENO-003 | MAAR-DENO-001                |
| MAAR-DENO-004 | MAAR-DENO-002, MAAR-DENO-003 |
| MAAR-DENO-005 | MAAR-DENO-004                |
| MAAR-DENO-006 | MAAR-DENO-005                |
| MAAR-DENO-007 | MAAR-DENO-002                |

## Sprint Burndown

| Day | Planned        | Completed | Remaining |
| --- | -------------- | --------- | --------- |
| 1   | Stories 1-2    | -         | -         |
| 2   | Stories 3-4    | -         | -         |
| 3   | Stories 5-6    | -         | -         |
| 4   | Story 7/Buffer | -         | -         |
| 5   | Buffer/testing | -         | -         |

## Definition of Done

- [ ] All code migrated to Deno APIs
- [ ] All tests passing with `deno test`
- [ ] `deno publish --dry-run` passes
- [ ] Manual testing confirms functionality preserved
- [ ] Documentation updated
- [ ] (Optional) Published to JSR

---

**Status:** 🚀 READY FOR DEVELOPMENT

**Next Step:** Start with `/dev-story MAAR-DENO-001` or run all with orchestrator
