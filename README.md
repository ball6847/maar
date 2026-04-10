# MAAR - Mermaid ASCII Auto-Renderer

A TypeScript CLI tool that auto-renders linked Mermaid diagram files (`.mmd`) into ASCII art and injects the output into Markdown files.

## Features

- **Single CLI call** handles detection, rendering, and injection
- **Fail-fast** - any error exits with code 1
- **Ultra-low token output** - human-readable, not structured data
- **Atomic in-place file editing** - prevents corruption
- **Deterministic output** - re-running produces identical results

## Installation

```bash
npm install
```

## Usage

```bash
npx tsx maar.ts <file1.md> [file2.md ...]
```

## How It Works

1. Scans Markdown files for links ending in `.mmd`
2. Renders each Mermaid diagram to ASCII using `beautiful-mermaid`
3. Injects ASCII art above the link with a MAAR marker:

```markdown
<!-- MAAR: path/to/diagram.mmd -->
```
┌─────┐
│Start│
└─────┘
```

[View Flow](path/to/diagram.mmd)
```

## Output Format

Success:
```
✓ README.md: 3 diagrams
✓ docs/architecture.md: 5 diagrams
Done. Total: 8 diagrams in 2 files.
```

Failure (Exit 1):
```
✓ README.md: 1 diagram
✗ docs/architecture.md: sequence.mmd - syntax error line 4
```

No diagrams:
```
⚠ README.md: 0 diagrams
Done. Total: 0 diagrams in 1 file.
```

## Development

```bash
# Run tests
npm test

# Run on specific files
npx tsx maar.ts README.md docs/*.md
```

## Requirements

- Node.js 18+
- `beautiful-mermaid` (installed automatically)

## License

MIT
