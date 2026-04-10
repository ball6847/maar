Product Requirements Document: Mermaid ASCII Auto-Renderer (maar)

1. Overview
   TypeScript CLI tool that auto-renders linked Mermaid diagram files (.mmd) into ASCII art using beautiful-mermaid and injects output into Markdown files as code blocks. Designed for LLM agent workflows to eliminate complex ASCII manipulation from agent tool calling.

2. Goals

- Single CLI call handles detection, rendering, and injection
- Fail-fast: any error exits 1, forcing agent to fix source diagrams first
- Ultra-low token output (human-readable, not structured data)
- Atomic in-place file editing
- Deterministic output (always rewrite, no caching)

3. Functional Requirements

3.1 Input Processing

- CLI: `npx tsx maar.ts <file1.md> <file2.md> ...`
- Accepts multiple explicit file paths as positional arguments
- Validates file existence (exit 1 if any file missing)
- Processes files sequentially

  3.2 Mermaid Link Detection

- Pattern: Markdown links ending in `.mmd` (case-insensitive)
  - `[label](path/to/diagram.mmd)` or `![alt](path/to/diagram.mmd)`
- Path resolution: relative to markdown file's directory
- Multiple diagrams: handles N diagrams per file, top-to-bottom

  3.3 Rendering Pipeline

1. Extract `.mmd` path from link
2. Validate `.mmd` file exists (exit 1 if missing)
3. Call beautiful-mermaid library to generate ASCII
4. If rendering throws error or returns empty, exit 1 immediately
5. Insert/replace ASCII block above the link line

3.4 Markdown Injection Strategy

- Insert ASCII code block above the link line
- Format:

````
  <!-- MAAR: path/to/diagram.mmd -->
  ```
  [ASCII ART]
  ```

  [label](path/to/diagram.mmd)
````

- Detection: HTML comment `<!-- MAAR: <relative-path> -->` marks existing blocks for replacement
- Replacement: if MAAR comment exists immediately before link, replace the code block below it
- Code block: plain triple backticks (no language identifier)
- One blank line between code block and link

  3.5 File Modification

- In-place editing with atomic write (temp file + rename)
- Always rewrite (no hash/mtime checking)
- Original `.mmd` link remains intact for re-rendering

4. Output Specification

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

Rules:

- `✓` = success
- `✗` = failure (stop processing, exit 1 immediately)
- `⚠` = warning (no diagrams found, continue)
- Format: `[status] <filename>: <count> diagrams` or `[status] <filename>: <mmd-file> - <error>`
- One line per file
- Final summary line only on success or warning (not shown on failure)

5. Technical Specification

5.1 Stack

- Runtime: Node.js + tsx
- Dependencies: beautiful-mermaid (library), fs, path
- TypeScript: strict mode

  5.2 Types

```typescript
interface DiagramLink {
  lineIndex: number;
  mmdPath: string;
  originalLine: string;
}

interface FileResult {
  filePath: string;
  count: number;
  error?: { diagram: string; message: string };
}
```

5.3 Algorithm

1. Parse CLI args → file array
2. For each file:
   - Read lines
   - Scan for `.mmd` links
   - For each link:
     - Resolve path
     - Call beautiful-mermaid
     - If error → output failure line, exit 1
     - Insert/replace ASCII block with MAAR marker
   - Write file atomically
   - Output success/warning line
3. Output summary line (if no failure)
4. Exit 0

5. Error Handling

Scenario Output Exit
Markdown not found `✗ <file> - file not found` 1
`.mmd` not found `✗ <file>: <diagram> - file not found` 1
Render error `✗ <file>: <diagram> - <error>` 1
Permission denied `✗ <file> - permission denied` 1
No diagrams `⚠ <file>: 0 diagrams` 0
Success `✓ <file>: <n> diagrams` 0

7. CLI Specification

```bash
npx tsx maar.ts <file1.md> [file2.md ...]
```

8. Example

Input:

```markdown
# Architecture

[View Flow](diagrams/flow.mmd)
```

Output:

```markdown
# Architecture

<!-- MAAR: diagrams/flow.mmd -->
```

┌─────┐
│Start│
└─────┘

```

[View Flow](diagrams/flow.mmd)
```

9. Success Criteria

- Agent calls single bash command to update all diagrams
- Output consumes <15 tokens per file
- Failed renders exit 1 with specific diagram location
- Re-running produces identical output
- Original links remain clickable
- No agent-side ASCII manipulation required

10. Out of Scope

- Watch mode
- Caching/mtime checks
- Parallel processing
- Dry-run
- Configurable markers
- Custom code block languages
