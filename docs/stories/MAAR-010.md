# Story MAAR-010: Setup Husky Pre-commit Formatting

**Points:** 1  
**Priority:** Should Have  
**Status:** Not Started

## Story

As a developer, I want automatic code formatting before each commit so that code style is consistently enforced without manual intervention.

## Acceptance Criteria

- [ ] Husky installed and configured
- [ ] Pre-commit hook runs `deno task fmt`
- [ ] Formatting runs automatically on `git commit`
- [ ] Commit fails if formatting produces changes (so developer can review and re-commit)

## Technical Notes

- Use husky v9+ (modern version)
- Pre-commit hook should run `deno task fmt`
- Consider: should we auto-add formatted files or fail and let developer review?

## Implementation Hints

```bash
# Install husky
deno add npm:husky

# Initialize husky
npx husky init

# Create pre-commit hook
echo "deno task fmt" > .husky/pre-commit
```

Alternative (simpler) - just create `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

deno task fmt
git add -A
```

## Files to Create/Modify

- `.husky/pre-commit` (create)
- `deno.json` (add husky to tasks if needed)
- `.gitignore` (ensure .husky tracked appropriately)
