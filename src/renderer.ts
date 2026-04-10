import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { renderMermaidASCII } from 'beautiful-mermaid';
import { RenderResult } from './types.js';

export function renderToAscii(
  mmdPath: string,
  markdownDir: string
): RenderResult {
  const absolutePath = resolve(markdownDir, mmdPath);

  if (!existsSync(absolutePath)) {
    return {
      success: false,
      error: 'file not found'
    };
  }

  try {
    const content = readFileSync(absolutePath, 'utf-8');
    const ascii = renderMermaidASCII(content);
    
    if (!ascii.trim()) {
      return {
        success: false,
        error: 'empty output'
      };
    }
    
    return {
      success: true,
      ascii: ascii.trimEnd()
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'unknown error'
    };
  }
}
