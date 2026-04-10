import { describe, it } from 'node:test';
import assert from 'node:assert';
import { detectDiagramLinks, findExistingMarker } from '../src/detector.js';

describe('detectDiagramLinks', () => {
  it('detects basic mmd link', () => {
    const lines = ['# Title', '', '[Flow](diagrams/flow.mmd)'];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 1);
    assert.strictEqual(links[0].mmdPath, 'diagrams/flow.mmd');
    assert.strictEqual(links[0].lineIndex, 2);
    assert.strictEqual(links[0].linkText, 'Flow');
  });

  it('detects image-style mmd link', () => {
    const lines = ['![Alt](path/to/diagram.mmd)'];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 1);
    assert.strictEqual(links[0].mmdPath, 'path/to/diagram.mmd');
  });

  it('is case insensitive', () => {
    const lines = ['[Label](diagram.MMD)', '[Label](diagram.Mmd)'];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 2);
  });

  it('returns empty array when no links', () => {
    const lines = ['# Title', 'Some text', '[Link](http://example.com)'];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 0);
  });

  it('detects multiple links', () => {
    const lines = [
      '# Title',
      '[First](a.mmd)',
      'Some text',
      '[Second](b.mmd)'
    ];
    const links = detectDiagramLinks(lines);

    assert.strictEqual(links.length, 2);
    assert.strictEqual(links[0].mmdPath, 'a.mmd');
    assert.strictEqual(links[1].mmdPath, 'b.mmd');
  });
});

describe('findExistingMarker', () => {
  it('finds marker before link', () => {
    const lines = [
      '<!-- MAAR: diagram.mmd -->',
      '```',
      'ascii',
      '```',
      '',
      '[Label](diagram.mmd)'
    ];
    const marker = findExistingMarker(lines, 5);

    assert.notStrictEqual(marker, null);
    assert.strictEqual(marker!.mmdPath, 'diagram.mmd');
    assert.strictEqual(marker!.lineIndex, 0);
  });

  it('returns null when no marker', () => {
    const lines = ['# Title', '', '[Label](diagram.mmd)'];
    const marker = findExistingMarker(lines, 2);

    assert.strictEqual(marker, null);
  });

  it('finds marker within 4 lines (standard format)', () => {
    // Standard format: marker, code block, blank line, link
    const lines = [
      '# Title',
      '<!-- MAAR: diagram.mmd -->',
      '```',
      'line1',
      '```',
      '',
      '[Label](diagram.mmd)'
    ];
    const marker = findExistingMarker(lines, 6);

    assert.notStrictEqual(marker, null);
    assert.strictEqual(marker!.mmdPath, 'diagram.mmd');
  });
});
