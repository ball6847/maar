# PRD: MAAR Agent Skill

## 1. Overview

An installable agent skill (for skills.sh) that enables AI coding agents to use MAAR (Mermaid ASCII
Auto-Renderer) effectively. The skill guides agents through the full workflow: writing Mermaid
`.mmd` diagram files, linking them in Markdown, running MAAR to render ASCII art into docs, and
verifying/committing results.

## 2. Goals

- Make MAAR discoverable and usable by any AI agent with a single skill install
- Eliminate the need for agents to manually craft ASCII art in Markdown files
- Provide a clear, repeatable workflow that agents can follow deterministically
- Ensure agents produce correct Mermaid syntax, proper Markdown linking, and clean MAAR output

## 3. Target Users

AI coding agents (Claude Code, OpenCode, Cursor, etc.) that need to:

- Add architecture/system diagrams to project documentation
- Maintain up-to-date diagrams alongside code changes
- Keep diagrams as code (`.mmd` files) in version control

## 4. Skill Specification

### 4.1 SKILL.md Frontmatter

```yaml
---
name: maar
description: |
  Mermaid ASCII Auto-Renderer — render Mermaid .mmd diagram files into ASCII art
  and inject them into Markdown documents automatically.

  Use this skill when:
  1. User asks to "add a diagram" or "create a diagram" in Markdown docs
  2. User wants to render .mmd files into ASCII in their README or docs
  3. User needs architecture, flowchart, sequence, state, class, or ER diagrams
  4. User mentions "mermaid" or ".mmd" files
  5. User wants to update existing MAAR-injected diagrams
  6. Agent needs to document system architecture visually
  7. User says "generate a flowchart", "create a sequence diagram", etc.
---
```

### 4.2 Skill Structure

```
maar/
├── SKILL.md                  # Main skill instructions
└── references/
    └── mermaid-syntax.md     # Mermaid diagram type reference
```

### 4.3 Prerequisites

MAAR requires Deno 2.0+. The skill must check for or install Deno before use.

```bash
# Check if Deno is installed
deno --version

# Install if needed
curl -fsSL https://deno.land/install.sh | sh
```

MAAR itself is invoked via:

```bash
deno run --allow-read --allow-write jsr:@ball6847/maar <file1.md> [file2.md ...]
```

### 4.4 Workflow

The skill must guide agents through this exact sequence:

#### Step 1: Identify Need

Determine if the user wants a new diagram or to update an existing one:

- **New diagram**: Create a `.mmd` file and link it from Markdown
- **Update diagram**: Edit the `.mmd` file, then re-run MAAR

#### Step 2: Create/Edit Mermaid File

Write or edit a `.mmd` file with valid Mermaid syntax. The diagram file must:

- Use one of the supported diagram types (see Mermaid syntax reference)
- Be placed in a sensible location relative to the Markdown file (e.g., `docs/diagrams/`)
- Have a `.mmd` extension

#### Step 3: Link in Markdown

Add a Markdown link in the target `.md` file pointing to the `.mmd` file:

```markdown
[Label](path/to/diagram.mmd)
```

Or as an image link:

```markdown
![Alt](path/to/diagram.mmd)
```

The path must be relative to the Markdown file's location.

#### Step 4: Run MAAR

```bash
deno run --allow-read --allow-write jsr:@ball6847/maar <markdown-file.md>
```

MAAR will:

- Detect the `.mmd` link in the Markdown
- Read and render the Mermaid diagram as ASCII
- Inject the ASCII art above the link, wrapped in a `<!-- MAAR: ... -->` marker and code block
- Write changes atomically

#### Step 5: Verify Output

After running MAAR:

1. Read the modified Markdown file to confirm the ASCII art was injected
2. If MAAR exited with code 1, read the error message and fix the `.mmd` file
3. If successful, proceed to commit

#### Step 6: Commit (if requested)

Commit both the `.mmd` file and the modified `.md` file together so the diagram source and rendered
output stay in sync.

### 4.5 MAAR Marker Format

Injected ASCII blocks follow this structure:

````markdown
<!-- MAAR: path/to/diagram.mmd -->

```
┌─────┐
│Start│
└─────┘
```

[Label](path/to/diagram.mmd)
````

- The `<!-- MAAR: ... -->` marker identifies existing blocks for re-rendering
- The code block uses plain triple backticks (no language identifier)
- A blank line separates the code block closing and the link
- The original `.mmd` link is always preserved

### 4.6 Re-rendering (Deterministic)

MAAR is idempotent — running it again on the same file produces identical output:

- If a `<!-- MAAR: ... -->` marker exists, MAAR replaces the existing ASCII block
- Running twice on the same file yields the exact same result

### 4.7 Error Handling

MAAR uses fail-fast behavior:

- **Missing `.md` file** → exit 1 with error
- **Missing `.mmd` file referenced in a link** → exit 1 with specific diagram path
- **Mermaid syntax error** → exit 1 with error message
- **No diagrams found** → warning (exit 0), outputs `⚠ filename: 0 diagrams`

When MAAR fails, the agent must:

1. Read the error output
2. Fix the `.mmd` file (syntax error) or the link path (file not found)
3. Re-run MAAR

## 5. Diagram Type Reference

The skill should include a concise reference for the most common Mermaid diagram types:

| Type      | Keyword           | Use For                                    |
| --------- | ----------------- | ------------------------------------------ |
| Flowchart | `flowchart`       | Processes, workflows, decision trees       |
| Sequence  | `sequenceDiagram` | API calls, interactions, message flows     |
| State     | `stateDiagram-v2` | Application states, lifecycle, FSM         |
| Class     | `classDiagram`    | Object models, architecture, relationships |
| ER        | `erDiagram`       | Database schema, data models               |

Detailed syntax should be in `references/mermaid-syntax.md`.

## 6. Success Criteria

- Agent can install and invoke MAAR without manual intervention
- Agent produces correct `.mmd` files with valid Mermaid syntax
- Agent correctly links `.mmd` files from Markdown
- Agent re-runs MAAR to update diagrams after `.mmd` changes
- Agent handles MAAR errors by fixing source diagrams
- Agent never manually edits the ASCII art block (always lets MAAR manage it)
- Committed state always includes both `.mmd` source and rendered `.md` output

## 7. Out of Scope

- Watch mode (not implemented in MAAR)
- Caching/mtime checks (not implemented)
- Parallel file processing (not implemented)
- Dry-run mode (not implemented)
- Configurable markers (not implemented)
- Custom code block languages (not implemented)
- SVG rendering (covered by the separate `pretty-mermaid` skill)

## 8. Skill Structure & Installation

### 8.1 Repository Structure

The skill lives in the MAAR repository at `skills/maar/SKILL.md`:

```
maar/
├── maar.ts
├── src/
├── docs/
│   └── prd-maar-skill.md
└── skills/
    └── maar/
        ├── SKILL.md
        └── references/
            └── mermaid-syntax.md
```

### 8.2 Installation

Users install directly from the GitHub repository:

```bash
# Install from GitHub (skills.sh auto-discovers skills/maar/SKILL.md)
skills install https://github.com/ball6847/maar
```

Or manually:

```bash
# Clone and link
git clone https://github.com/ball6847/maar.git
ln -s $(pwd)/maar/skills/maar ~/.agents/skills/maar
```

### 8.3 Self-Referencing

The skill should reference its own repo for:

- MAAR installation instructions
- Example `.mmd` files (if any)
- Troubleshooting / issues link
