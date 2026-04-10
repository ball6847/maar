import { describe, it } from 'node:test';
import assert from 'node:assert';
import { writeFile, unlink } from 'fs/promises';
import { parseArgs } from '../src/cli.js';

describe('parseArgs', () => {
  it('returns file paths from argv', async () => {
    // Create a temp file that exists
    await writeFile('test/temp/argtest.md', '# Test');
    const argv = ['node', 'maar.ts', 'test/temp/argtest.md'];
    const result = parseArgs(argv);

    assert.deepStrictEqual(result, ['test/temp/argtest.md']);
    await unlink('test/temp/argtest.md');
  });
});
