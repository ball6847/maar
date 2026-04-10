import { describe, it } from 'node:test';
import assert from 'node:assert';
import { injectAscii, createInjectionBlock } from '../src/injector.js';
import { DiagramLink } from '../src/types.js';

describe('createInjectionBlock', () => {
  it('creates properly formatted block', () => {
    const block = createInjectionBlock('path.mmd', 'ASCII');

    assert.strictEqual(block[0], '<!-- MAAR: path.mmd -->');
    assert.strictEqual(block[1], '```');
    assert.strictEqual(block[2], 'ASCII');
    assert.strictEqual(block[3], '```');
    assert.strictEqual(block[4], '');
  });
});

describe('injectAscii', () => {
  it('inserts block before link for new diagram', () => {
    const lines = ['# Title', '[Label](path.mmd)'];
    const link: DiagramLink = {
      lineIndex: 1,
      mmdPath: 'path.mmd',
      originalLine: '[Label](path.mmd)',
      linkText: 'Label'
    };

    const result = injectAscii(lines, link, 'ASCII', false);

    assert.strictEqual(result[0], '# Title');
    assert.strictEqual(result[1], '<!-- MAAR: path.mmd -->');
    assert.strictEqual(result[2], '```');
    assert.strictEqual(result[3], 'ASCII');
    assert.strictEqual(result[4], '```');
    assert.strictEqual(result[5], '');
    assert.strictEqual(result[6], '[Label](path.mmd)');
  });

  it('preserves surrounding content', () => {
    const lines = ['# Title', '', '[Label](path.mmd)', '', 'Footer'];
    const link: DiagramLink = {
      lineIndex: 2,
      mmdPath: 'path.mmd',
      originalLine: '[Label](path.mmd)',
      linkText: 'Label'
    };

    const result = injectAscii(lines, link, 'ASCII', false);

    assert.strictEqual(result[0], '# Title');
    assert.strictEqual(result[result.length - 1], 'Footer');
  });
});
