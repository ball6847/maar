# MAAR-DENO-003: Update Renderer for Deno npm Compatibility

## User Story

As a developer, I want the renderer to import beautiful-mermaid using Deno's npm specifier so that
it works with Deno's module resolution.

## Acceptance Criteria

- [ ] Update `src/renderer.ts` to use `npm:beautiful-mermaid` import
- [ ] Verify beautiful-mermaid renders correctly in Deno
- [ ] Handle any Deno-specific rendering edge cases
- [ ] Ensure synchronous rendering still works

## Implementation Notes

### Import Pattern

```typescript
// Old (Node.js with npm install)
import { renderMermaidASCII } from "beautiful-mermaid";

// New (Deno with npm: specifier)
import { renderMermaidASCII } from "npm:beautiful-mermaid";
```

### deno.json imports (optional but recommended)

```json
{
  "imports": {
    "beautiful-mermaid": "npm:beautiful-mermaid@^1.1.3"
  }
}
```

Then import as:

```typescript
import { renderMermaidASCII } from "beautiful-mermaid";
```

## Verification Steps

```typescript
// Test script (save as test-render.ts)
import { renderMermaidASCII } from "npm:beautiful-mermaid";

const result = renderMermaidASCII(`graph TD\n    A --> B`);
console.log(result);
// Should output ASCII diagram
```

Run with:

```bash
deno run test-render.ts
```

## Definition of Done

- [ ] Renderer imports work with Deno
- [ ] Rendering produces correct ASCII output
- [ ] No TypeScript type errors
- [ ] Added to `deno task test` suite

## Effort Estimate

1 story point
