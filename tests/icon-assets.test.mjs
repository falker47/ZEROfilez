import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONS } from '../js/icons.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('every icon is served from an existing repository-owned asset', async () => {
  assert.ok(Object.keys(ICONS).length > 50, 'Unexpectedly small icon catalog');
  for (const [key, src] of Object.entries(ICONS)) {
    assert.match(src, /^(?:assets\/icons\/[\w-]+\.svg|[\w-]+\.(?:svg|png))$/, key);
    assert.ok(!src.includes('..') && !src.startsWith('/'), key);
    const file = path.resolve(root, src);
    assert.ok(file.startsWith(root + path.sep), key);

    const bytes = await readFile(file);
    assert.ok(bytes.length > 0, key);
    if (src.endsWith('.svg')) {
      const svg = bytes.toString('utf8');
      assert.match(svg, /^\s*<svg\b/i, key);
      assert.match(svg, /<\/svg>\s*$/i, key);
      assert.doesNotMatch(svg, /<script\b|onload\s*=|<foreignObject\b|href\s*=\s*["']https?:/i, key);
    }

    const onPages = new URL(src, 'https://example.github.io/ZEROfilez/');
    assert.ok(onPages.pathname.startsWith('/ZEROfilez/'), key);
  }
});

test('UI icons are not loaded from third-party services', () => {
  assert.ok(Object.values(ICONS).every(src => !/^https?:|^\/\//i.test(src)));
  for (const key of ['search', 'download', 'lock', 'windows', 'android', 'info', 'setup']) {
    assert.ok(ICONS[key], key);
  }
});
