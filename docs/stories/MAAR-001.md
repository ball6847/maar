# Story MAAR-001: Project Setup

**Points:** 1\
**Priority:** Must Have\
**Status:** Not Started

## Story

As a developer, I want a properly configured TypeScript project so that I can start implementing the
CLI tool.

## Acceptance Criteria

- [ ] `package.json` with TypeScript, tsx, and pretty-mermaid dependencies
- [ ] `tsconfig.json` with strict mode enabled
- [ ] `src/types.ts` with all TypeScript interfaces defined
- [ ] Can run `npm install` without errors
- [ ] Can execute `npx tsx --version`

## Technical Notes

- Use Node.js 18+ compatibility
- Types to define:
  - `DiagramLink`: lineIndex, mmdPath, originalLine, linkText
  - `RenderResult`: success, ascii?, error?
  - `FileResult`: filePath, count, diagrams
  - `DiagramResult`: status, path, message?

## Implementation Hints

```typescript
// src/types.ts
export interface DiagramLink {
  lineIndex: number;
  mmdPath: string;
  originalLine: string;
  linkText: string;
}

export interface RenderResult {
  success: boolean;
  ascii?: string;
  error?: string;
}

export type DiagramResult =
  | { status: "success"; path: string }
  | { status: "error"; path: string; message: string };

export interface FileResult {
  filePath: string;
  count: number;
  diagrams: DiagramResult[];
}
```

## Files to Create/Modify

- `package.json` (create)
- `tsconfig.json` (create)
- `src/types.ts` (create)
