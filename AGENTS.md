# AGENTS.md

## Project Overview

**MAAR** (Mermaid ASCII Auto-Renderer) is a TypeScript CLI tool that auto-renders linked Mermaid diagram files (`.mmd`) into ASCII art and injects the output into Markdown files. Designed for LLM agent workflows to eliminate complex ASCII manipulation from agent tool calling.

### Key Technologies
- **Runtime**: Node.js + tsx
- **Language**: TypeScript (strict mode)
- **Rendering Engine**: pretty-mermaid
- **Architecture**: CLI tool with modular components

---

## Setup Commands

### Install Dependencies
```bash
npm install
```

### Install pretty-mermaid (Required Runtime Dependency)
```bash
npm install -g pretty-mermaid
# or
npx pretty-mermaid --version  # verify availability
```

---

## Development Workflow

### Run Directly (Development)
```bash
npx tsx maar.ts <file1.md> [file2.md ...]
```

### Compile to JavaScript (Optional Build)
```bash
npx tsc
node dist/maar.js <file1.md> [file2.md ...]
```

---

## Testing Instructions

### Run All Tests
```bash
npm test
```

### Run Unit Tests
```bash
npm run test:unit
```

### Run Integration Tests
```bash
npm run test:integration
```

### Test File Locations
- Unit tests: `src/**/*.test.ts`
- Integration tests: `tests/integration/*.test.ts`
- E2E tests: `tests/e2e/*.test.ts`

---

## Code Style Guidelines

### TypeScript Conventions
- **Strict mode**: Enabled in tsconfig.json
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
│   ├── renderer.ts       # pretty-mermaid execution
│   ├── injector.ts       # Markdown modification
│   └── reporter.ts       # Output formatting
├── maar.ts               # Main entry point
├── package.json
└── tsconfig.json
```

### Import Patterns
```typescript
// Node built-ins first
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Local modules
import { DiagramLink } from './types';
```

### Error Handling
- Fail-fast: Any error exits with code 1
- Specific error messages include file/diagram context
- Use `try/catch` for file operations

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
npx tsx maar.ts docs/example.md
```

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
