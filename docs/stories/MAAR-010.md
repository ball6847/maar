# Story MAAR-010: Setup Lefthook Pre-commit Formatting

**Points:** 1\
**Priority:** Should Have\
**Status:** COMPLETE

## Story

As a developer, I want automatic code formatting before each commit so that code style is
consistently enforced without manual intervention.

## Acceptance Criteria

- [x] Lefthook installed and configured
- [x] Pre-commit hook runs `deno task fmt`
- [x] Pre-commit hook runs `deno task lint`
- [x] Formatting runs automatically on `git commit`
- [x] Formatted files auto-staged

## Technical Notes

- **Decision:** Used Lefthook instead of Husky because:
  - Project is pure Deno (no package.json)
  - Husky requires Node.js ecosystem
  - Lefthook is language-agnostic (Go binary)
  - Faster execution (~1ms)

## Implementation

Created `lefthook.yml`:

```yaml
pre-commit:
  parallel: false
  commands:
    format:
      run: deno task fmt
      glob: "*.{ts,tsx,js,jsx,json,md}"
      stage_fixed_files: true
    lint:
      run: deno task lint
      glob: "*.{ts,tsx,js,jsx}"
```

## Files Created/Modified

- `lefthook.yml` (created)
- `README.md` (added setup instructions)
