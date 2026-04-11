# AGENTS.md

## Project Overview

**MAAR** (Mermaid ASCII Auto-Renderer) is a TypeScript CLI tool that auto-renders linked Mermaid
diagram files (`.mmd`) into ASCII art and injects the output into Markdown files. Designed for LLM
agent workflows to eliminate complex ASCII manipulation from agent tool calling.

### Key Technologies

- **Runtime**: Deno 2.0+ (secure, native TypeScript)
- **Language**: TypeScript (strict mode)
- **Rendering Engine**: beautiful-mermaid (via npm: specifier)
- **Distribution**: JSR (JavaScript Registry)
- **Architecture**: CLI tool with modular components

---

## Setup Commands

### Install Deno

```bash
curl -fsSL https://deno.land/install.sh | sh
# or
brew install deno
```

### Install Dependencies

Deno manages dependencies automatically via `deno.json` imports. No manual install needed.

---

## Development Workflow

### Run Directly (Development)

```bash
deno task start <file1.md> [file2.md ...]
# or
deno run --allow-read --allow-write maar.ts <file1.md> [file2.md ...]
```

### Run Tests

```bash
deno task test
# or
deno test --allow-read --allow-write --allow-run
```

### Type Check

```bash
deno task check
# or
deno check maar.ts
```

### Format Code

```bash
deno task fmt
# or
deno fmt
```

### Lint

```bash
deno task lint
# or
deno lint
```

### Dry Run Publish (JSR)

```bash
deno task publish:dry
# or
deno publish --dry-run
```

---

## Testing Instructions

### Run All Tests

```bash
deno task test
```

### Test File Locations

- Unit tests: `test/*.test.ts`
- Integration tests: `test/integration.test.ts`

### Test Command with Permissions

```bash
deno test --allow-read --allow-write --allow-run
```

---

## Code Style Guidelines

### TypeScript Conventions

- **Strict mode**: Enabled in deno.json
- **Interfaces**: Use `interface` for public APIs, `type` for unions
- **Naming**:
  - PascalCase for types, interfaces, enums
  - camelCase for variables, functions
  - UPPER_SNAKE_CASE for constants

### File Organization

```
maar/
├── src/
│   ├── types.ts          # TypeScript interfaces
│   ├── cli.ts            # CLI argument parsing
│   ├── detector.ts       # Mermaid link detection
│   ├── renderer.ts       # beautiful-mermaid execution
│   ├── injector.ts       # Markdown modification
│   └── reporter.ts       # Output formatting
├── test/
│   ├── cli.test.ts       # CLI tests
│   ├── detector.test.ts  # Detector tests
│   ├── injector.test.ts  # Injector tests
│   ├── reporter.test.ts  # Reporter tests
│   └── integration.test.ts # Integration tests
├── maar.ts               # Main entry point
├── deno.json             # Deno configuration

├── LICENSE               # MIT License
└── .gitignore            # Git ignore patterns
```

### Import Patterns

```typescript
// npm dependencies (via jsr: or npm: specifiers)
import { assertEquals } from "jsr:@std/assert";
import { renderMermaidASCII } from "npm:beautiful-mermaid";

// Local modules (use .ts extension)
import { DiagramLink } from "./types.ts";
```

### Error Handling

- Fail-fast: Any error exits with code 1 (`Deno.exit(1)`)
- Specific error messages include file/diagram context
- Use `try/catch` for async operations

---

## Key Implementation Patterns

### Mermaid Link Detection

Pattern: Markdown links ending in `.mmd` (case-insensitive)

- `[label](path/to/diagram.mmd)`
- `![alt](path/to/diagram.mmd)`

### MAAR Marker Format

```markdown
<!-- MAAR: path/to/diagram.mmd -->
```

### Output Format

```
✓ README.md: 3 diagrams
✗ docs/arch.md: flow.mmd - syntax error line 4
⚠ README.md: 0 diagrams
Done. Total: 8 diagrams in 2 files.
```

### Deno APIs vs Node.js

| Node.js             | Deno                         |
| ------------------- | ---------------------------- |
| `fs.readFileSync()` | `await Deno.readTextFile()`  |
| `fs.writeFile()`    | `await Deno.writeTextFile()` |
| `fs.existsSync()`   | `await Deno.stat().catch()`  |
| `process.argv`      | `Deno.args`                  |
| `process.exit()`    | `Deno.exit()`                |
| `path.resolve()`    | `new URL()` or string concat |

---

## BMAD Workflow

This project uses the BMAD (Build Model After Design) workflow:

### Check Workflow Status

```bash
/workflow-status
```

### Available Phases

1. **Analysis** (`/analysis`) - Problem decomposition
2. **Planning** (`/sprint-planning`) - Sprint planning
3. **Solutioning** (`/solutioning`) - Technical solution design
4. **Implementation** (`/implementation`) - Code implementation

### Documentation Structure

- `PRD.md` - Product Requirements Document
- `docs/tech-spec.md` - Technical Specification
- `docs/stories/MAAR-XXX.md` - User stories
- `docs/sprint-plan.md` - Sprint planning document

---

## Common Tasks

### Add a New Story

Create file in `docs/stories/MAAR-XXX.md` following existing story format.

### Update Tech Spec

Edit `docs/tech-spec.md` when making architectural decisions.

### Run on Test Files

```bash
deno task start docs/example.md
```

### Check Version

```bash
deno run --allow-read maar.ts --version
```

### Install from local (for testing)

```bash
deno install --allow-read --allow-write -n maar-local ./maar.ts
```

---

## Documentation Standards

### Nested Codeblocks

When writing markdown examples that contain codeblocks:

- Use 4+ backticks (`` ```` ``) for outer block when containing 3-backtick codeblocks
- Alternative: use tilde fencing (`~~~`) for outer blocks
- Never nest 3-backtick blocks inside 3-backtick blocks (breaks rendering)
- `deno fmt` auto-converts `~~~` to `` ```` `` and preserves structure

Example:

````
```
inner codeblock
```
````

---

## Constraints & Out of Scope

**Explicitly NOT implemented** (per PRD):

- Watch mode
- Caching/mtime checks
- Parallel processing
- Dry-run mode
- Configurable markers
- Custom code block languages

**Always implement**:

- Sequential file processing
- Atomic file writes (temp file + rename)
- Deterministic output (always rewrite)
- Original `.mmd` link preservation
