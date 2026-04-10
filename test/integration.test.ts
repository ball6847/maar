import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

describe('Integration Tests', () => {
  const testDir = 'test/temp';

  before(async () => {
    if (!existsSync(testDir)) {
      await mkdir(testDir, { recursive: true });
    }
  });

  it('processes single file with single diagram', async () => {
    const testFile = join(testDir, 'test-simple.md');
    const mmdFile = join(testDir, 'diagram.mmd');

    await writeFile(mmdFile, 'flowchart TD\n    A[Start] --> B[End]\n');
    await writeFile(testFile, '# Test\n\n[View](diagram.mmd)\n');

    const { stdout } = await execAsync(`npx tsx maar.ts ${testFile}`);

    assert(stdout.includes('✓'), 'Should show success');
    assert(stdout.includes('1 diagram'), 'Should show diagram count');

    const content = await readFile(testFile, 'utf-8');
    assert(content.includes('<!-- MAAR: diagram.mmd -->'), 'Should have MAAR marker');
    assert(content.includes('```'), 'Should have code block');
  });

  it('processes file with no diagrams', async () => {
    const testFile = join(testDir, 'test-empty.md');
    await writeFile(testFile, '# Test\n\nNo diagrams here.\n');

    const { stdout } = await execAsync(`npx tsx maar.ts ${testFile}`);

    assert(stdout.includes('⚠'), 'Should show warning');
    assert(stdout.includes('0 diagrams'), 'Should show zero diagrams');
  });

  it('exits with error for missing mmd file', async () => {
    const testFile = join(testDir, 'test-missing.md');
    await writeFile(testFile, '# Test\n\n[View](nonexistent.mmd)\n');

    let error: Error | null = null;
    try {
      await execAsync(`npx tsx maar.ts ${testFile}`);
    } catch (e) {
      error = e as Error;
    }

    assert.notStrictEqual(error, null, 'Should throw error');
  });

  it('exits with error for missing markdown file', async () => {
    let error: Error | null = null;
    try {
      await execAsync(`npx tsx maar.ts nonexistent.md`);
    } catch (e) {
      error = e as Error;
    }

    assert.notStrictEqual(error, null, 'Should throw error');
  });

  it('re-runs deterministically', async () => {
    const testFile = join(testDir, 'test-deterministic.md');
    const mmdFile = join(testDir, 'diagram2.mmd');

    // Clean up from previous runs
    try {
      await rm(testFile);
      await rm(mmdFile);
    } catch { /* ignore */ }

    await writeFile(mmdFile, 'flowchart TD\n    A --> B\n');
    await writeFile(testFile, '# Test\n\n[View](diagram2.mmd)\n');

    // First run
    await execAsync(`npx tsx maar.ts ${testFile}`);
    const content1 = await readFile(testFile, 'utf-8');

    // Verify first run has exactly one MAAR marker
    const markerCount1 = (content1.match(/<!-- MAAR:/g) || []).length;
    assert.strictEqual(markerCount1, 1, `First run should have 1 MAAR marker, found ${markerCount1}`);

    // Second run
    await execAsync(`npx tsx maar.ts ${testFile}`);
    const content2 = await readFile(testFile, 'utf-8');

    // Verify second run still has exactly one MAAR marker
    const markerCount2 = (content2.match(/<!-- MAAR:/g) || []).length;
    assert.strictEqual(markerCount2, 1, `Second run should have 1 MAAR marker, found ${markerCount2}`);

    // Content should be identical
    assert.strictEqual(content1, content2, 'Content should be identical after re-run');
  });
});
