# MAAR-BUG-001: Fix Idempotent Diagram Detection with Unbounded Search

**Status:** Ready for Implementation  
**Priority:** High  
**Created:** 2026-04-11  
**Assignee:** Developer  

---

## Problem Statement

The current diagram detection mechanism in `injector.ts` has a **100-line search limit** when looking for existing MAAR markers. This causes duplicate diagram injection when:

1. A diagram's ASCII content exceeds 100 lines
2. The marker falls outside the search window
3. MAAR incorrectly treats it as a new diagram and inserts a duplicate

### Current Behavior

```markdown
<!-- MAAR: diagrams/big-flow.mmd -->
```
```
[100+ lines of ASCII art]
```

[View Flow](diagrams/big-flow.mmd)
```

After re-render (BUG - duplicate):
```markdown
<!-- MAAR: diagrams/big-flow.mmd -->
```
```
[100+ lines of ASCII art]
```

<!-- MAAR: diagrams/big-flow.mmd -->  ← DUPLICATE!
```
```
[100+ lines of ASCII art]
```

[View Flow](diagrams/big-flow.mmd)
```

---

## Root Cause

In `src/injector.ts`, `findMarkerLine()` uses a hardcoded 100-line limit:

```typescript
function findMarkerLine(lines: string[], startIndex: number, mmdPath: string): number {
  // Search up to 100 lines back to handle large ASCII art blocks
  for (let i = startIndex - 1; i >= Math.max(0, startIndex - 100); i--) {
    if (lines[i] === `<!-- MAAR: ${mmdPath} -->`) {
      return i;
    }
  }
  return -1;
}
```

This is fragile because:
- Large diagrams can exceed 100 lines
- The limit is arbitrary and not documented
- No recovery mechanism when marker is not found

---

## Solution

### Approach: Link-as-Boundary with Early Termination

Use the `.mmd` link position as the natural end boundary. Search backward from the link with **early termination** when hitting another diagram's territory.

### Algorithm

```typescript
function findMarkerLine(lines: string[], linkIndex: number, mmdPath: string): number {
  for (let i = linkIndex - 1; i >= 0; i--) {
    const line = lines[i];
    
    // EARLY TERMINATION: Hit another mmd link (different diagram's boundary)
    if (MMD_LINK_REGEX.test(line)) {
      return -1;
    }
    
    // Found our marker
    if (line === `<!-- MAAR: ${mmdPath} -->`) {
      return i;
    }
  }
  return -1;
}
```

### Output Format Update

Add blank line after marker for better Markdown rendering:

```markdown
<!-- MAAR: path/to/diagram.mmd -->

```
┌─────┐
│ASCII│
└─────┘
```

[View Diagram](path/to/diagram.mmd)
```

---

## Acceptance Criteria

- [ ] Remove 100-line search limit from `findMarkerLine()`
- [ ] Implement early termination at other `.mmd` links
- [ ] Add blank line after marker in `createInjectionBlock()`
- [ ] Diagrams of any size (1000+ lines) re-render correctly without duplication
- [ ] Multiple diagrams in same file continue to work correctly
- [ ] Existing tests pass
- [ ] New test: Large diagram (>100 lines) re-renders idempotently

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/injector.ts` | Update `findMarkerLine()` to use link-as-boundary, add blank line in `createInjectionBlock()` |
| `test/injector.test.ts` | Add test for large diagram idempotency |

---

## Implementation Notes

1. **Backward Compatibility**: Old single-marker format will be auto-upgraded to new format (with blank line) on next render
2. **Complexity**: O(average_diagram_size) instead of O(100 fixed) or O(file_size)
3. **Safety**: Early termination prevents scanning entire file unnecessarily

---

## Related

- Tech Spec Section 6.3: Injection Strategy
- PRD: Deterministic Output requirement
