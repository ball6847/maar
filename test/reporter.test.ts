import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatSuccess, formatWarning, formatError, formatSummary } from '../src/reporter.js';

describe('reporter', () => {
  it('formats success correctly with singular', () => {
    assert.strictEqual(formatSuccess('file.md', 1), '✓ file.md: 1 diagram');
  });

  it('formats success correctly with plural', () => {
    assert.strictEqual(formatSuccess('file.md', 3), '✓ file.md: 3 diagrams');
  });

  it('formats warning correctly', () => {
    assert.strictEqual(formatWarning('file.md'), '⚠ file.md: 0 diagrams');
  });

  it('formats error correctly', () => {
    assert.strictEqual(
      formatError('file.md', 'diagram.mmd', 'not found'),
      '✗ file.md: diagram.mmd - not found'
    );
  });

  it('formats summary correctly with singular', () => {
    assert.strictEqual(formatSummary(1, 1), 'Done. Total: 1 diagram in 1 file.');
  });

  it('formats summary correctly with plural', () => {
    assert.strictEqual(formatSummary(5, 2), 'Done. Total: 5 diagrams in 2 files.');
  });
});
