# MAAR-DENO-001: Setup Deno Configuration

## User Story

As a developer, I want to configure the project for Deno runtime so that I can use Deno's native
TypeScript support and JSR distribution.

## Acceptance Criteria

- [ ] Create `deno.json` with project configuration (includes JSR publishing config)
- [ ] Remove `package.json` and `package-lock.json`
- [ ] Remove `tsconfig.json` (not needed with Deno)
- [ ] Add `deno.lock` to `.gitignore` (or commit for reproducibility)
- [ ] Verify `deno task` commands work
- [ ] Document minimum Deno version requirement (2.0+)

## Technical Notes

### deno.json structure:

```json
{
  "name": "@ball6847/maar",
  "version": "1.0.0",
  "exports": "./maar.ts",
  "publish": {
    "include": [
      "maar.ts",
      "src/**/*.ts",
      "README.md",
      "LICENSE"
    ]
  },
  "tasks": {
    "start": "deno run --allow-read --allow-write maar.ts",
    "test": "deno test --allow-read --allow-write"
  },
  "imports": {
    "beautiful-mermaid": "npm:beautiful-mermaid@^1.1.3"
  }
}
```

Note: JSR publishing configuration is included directly in `deno.json` under the `publish` key.
No separate `jsr.json` file is needed for Deno projects.

## Definition of Done

- [ ] `deno.json` created and validated (includes JSR config)
- [ ] Old Node.js config files removed
- [ ] `deno check maar.ts` passes
- [ ] Team can run `deno task start` successfully

## Effort Estimate

1 story point
