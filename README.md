# MAAR - Mermaid ASCII Auto-Renderer

A TypeScript CLI tool that auto-renders linked Mermaid diagram files (`.mmd`) into ASCII art and
injects the output into Markdown files.

Built with **Deno** for secure, fast, native TypeScript execution. Distributed via **JSR**.

## Features

- **Single CLI call** handles detection, rendering, and injection
- **Fail-fast** - any error exits with code 1
- **Ultra-low token output** - human-readable, not structured data
- **Atomic in-place file editing** - prevents corruption
- **Deterministic output** - re-running produces identical results
- **Secure by default** - Deno's permission-based sandbox

## Installation

### From JSR (Recommended)

```bash
deno install --allow-read --allow-write -n maar jsr:@ball6847/maar
```

### Run without installing

```bash
deno run --allow-read --allow-write jsr:@ball6847/maar <file.md>
```

## Usage

```bash
# Process single file
maar README.md

# Process multiple files
maar docs/*.md

# With scoped permissions (more secure)
deno run --allow-read=./docs --allow-write=./docs jsr:@ball6847/maar docs/*.md
```

## How It Works

1. Scans Markdown files for links ending in `.mmd`
2. Renders each Mermaid diagram to ASCII using `beautiful-mermaid`
3. Injects ASCII art above the link with a MAAR marker:

```markdown
<!-- MAAR: path/to/diagram.mmd -->
┌─────┐
│Start│
└─────┘
  │
  ▼
┌────────┐
│Process │
└────────┘
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
# Clone the repository
git clone <repo-url>
cd maar

# Run directly
deno task start <file.md>

# Run tests
deno task test

# Type check
deno task check

# Format code
deno task fmt

# Lint
deno task lint
```

## Requirements

- [Deno](https://deno.land/) 2.0+

## Releasing

To publish a new version to JSR:

1. Update version in `deno.json`
2. Commit: `git commit -am "Bump version to v1.0.1"`
3. Tag: `git tag v1.0.1`
4. Push: `git push && git push --tags`

GitHub Actions will automatically:

- Run tests and checks
- Publish to JSR on successful tag push

## License

MIT
