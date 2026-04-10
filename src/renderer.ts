import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { existsSync, createReadStream } from 'fs';
import { RenderResult } from './types.js';

export async function renderToAscii(
  mmdPath: string,
  markdownDir: string
): Promise<RenderResult> {
  const absolutePath = resolve(markdownDir, mmdPath);

  if (!existsSync(absolutePath)) {
    return {
      success: false,
      error: 'file not found'
    };
  }

  return new Promise((resolve) => {
    const proc = spawn('npx', ['mermaid-ascii'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: stderr.trim() || `exited with code ${code}`
        });
      } else if (!stdout.trim()) {
        resolve({
          success: false,
          error: 'empty output'
        });
      } else {
        resolve({
          success: true,
          ascii: stdout.trimEnd()
        });
      }
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    // Pipe file content to stdin
    const fileStream = createReadStream(absolutePath);
    fileStream.pipe(proc.stdin);
    fileStream.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });
  });
}
