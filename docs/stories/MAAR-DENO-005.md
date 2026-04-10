# MAAR-DENO-005: Update Documentation for Deno

## User Story

As a user, I want clear documentation on how to install and use maar with Deno so that I can easily
adopt the tool.

## Acceptance Criteria

- [ ] Update README.md with Deno installation instructions
- [ ] Update AGENTS.md with Deno development workflow
- [ ] Add JSR install command examples
- [ ] Document permission flags (`--allow-read`, `--allow-write`)
- [ ] Update PRD.md references (pretty-mermaid → beautiful-mermaid already done)
- [ ] Add troubleshooting section for Deno-specific issues

## Documentation Updates

### README.md Sections

#### Installation

```markdown
## Installation

### From JSR (Recommended)

\`\`\`bash deno install --allow-read --allow-write -n maar jsr:@ball6847/maar \`\`\`

### Run without installing

\`\`\`bash deno run --allow-read --allow-write jsr:@ball6847/maar <file.md> \`\`\`
```

#### Usage

```markdown
## Usage

\`\`\`bash

# Process single file

maar README.md

# Process multiple files

maar docs/*.md

# With scoped permissions (more secure)

deno run --allow-read=./docs --allow-write=./docs jsr:@ball6847/maar docs/*.md \`\`\`
```

#### Development

```markdown
## Development

\`\`\`bash

# Clone and run locally

git clone <repo> cd maar

# Run directly

deno task start <file.md>

# Run tests

deno task test

# Check types

deno check maar.ts \`\`\`
```

### AGENTS.md Updates

Update setup commands:

```markdown
### Setup Commands

#### Install Deno

\`\`\`bash curl -fsSL https://deno.land/install.sh | sh

# or

brew install deno \`\`\`

#### Install Dependencies

Deno manages dependencies automatically via imports in deno.json.

#### Run Directly (Development)

\`\`\`bash deno run --allow-read --allow-write maar.ts <file1.md> [file2.md ...] \`\`\`
```

## Definition of Done

- [ ] README.md updated with Deno instructions
- [ ] AGENTS.md updated with Deno workflow
- [ ] All npm/node references removed
- [ ] JSR install examples tested and working
- [ ] Permission documentation clear

## Effort Estimate

1 story point
