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
    assert.match(src, /^(?:assets\/icons\/[\w-]+\.(?:svg|png|ico)|[\w-]+\.(?:svg|png))$/, key);
    assert.ok(!src.includes('..') && !src.startsWith('/'), key);
    const file = path.resolve(root, src);
    assert.ok(file.startsWith(root + path.sep), key);

    const bytes = await readFile(file);
    assert.ok(bytes.length > 0, key);
    if (src.endsWith('.svg')) {
      const svg = bytes.toString('utf8');
      assert.match(svg, /^\s*<svg\b/i, key);
      assert.match(svg, /<\/svg>\s*$/i, key);
      assert.doesNotMatch(svg, /<script\b|onload\s*=|onerror\s*=|<foreignObject\b|<iframe\b|<image\b|href\s*=\s*["']https?:/i, key);
    } else if (src.endsWith('.png')) {
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', key);
    } else if (src.endsWith('.ico')) {
      assert.equal(bytes.subarray(0, 4).toString('hex'), '00000100', key);
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

test('emulation consoles and selected apps have identifiable local branding', () => {
  const brandedKeys = ["nintendoDs","gba","gbc","switch","wii","nintendo3ds","xbox","scummvm","wiiu","patchmypc","everything","pcloud","espanso","powertoys","visualStudioCode","marktext","cheatEngine"];
  for (const key of brandedKeys) {
    assert.match(ICONS[key], /^assets\/icons\/official-[\w-]+\.(?:svg|png|ico)$/, key);
  }
  for (const [a, b] of [['nintendoDs', 'nintendo3ds'], ['gba', 'gbc'], ['wii', 'wiiu']]) {
    assert.notEqual(ICONS[a], ICONS[b], `Icons should distinguish ${a} and ${b}`);
  }
});

test('full-color brand assets render without global white filtering', async () => {
  const css = await readFile(path.join(root, 'css/brand-icons.css'), 'utf8');
  const imports = await readFile(path.join(root, 'styles.css'), 'utf8');
  assert.match(imports, /@import 'css\/brand-icons\.css';/);
  for (const asset of ["official-nintendo-switch.svg","official-xbox.svg","official-scummvm.svg","official-pcloud.svg","official-vscode.svg","official-espanso.png","official-powertoys.png","official-everything.ico","official-marktext.png","official-cheatengine.ico"]) {
    assert.ok(css.includes(`[src$="${asset}"]`), asset);
  }
});
