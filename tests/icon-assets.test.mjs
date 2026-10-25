import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONS, isImageIcon } from '../js/icons.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('every icon is served from an existing repository-owned asset', async () => {
  assert.ok(Object.keys(ICONS).length > 50, 'Unexpectedly small icon catalog');
  for (const [key, src] of Object.entries(ICONS)) {
    assert.match(src, /^(?:assets\/icons\/[\w-]+\.(?:svg|png)|[\w-]+\.(?:svg|png))$/, key);
    assert.ok(!src.includes('..') && !src.startsWith('/'), key);
    assert.ok(isImageIcon(src), `Renderer would treat ${key} as text`);
    assert.ok(!src.endsWith('.ico'), `${key} must not use ICO in the catalog`);
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
    assert.match(ICONS[key], /^assets\/icons\/(?:official|original)-[\w-]+\.(?:svg|png)$/, key);
  }
  for (const [a, b] of [['nintendoDs', 'nintendo3ds'], ['gba', 'gbc'], ['wii', 'wiiu']]) {
    assert.notEqual(ICONS[a], ICONS[b], `Icons should distinguish ${a} and ${b}`);
  }
});

test('original brand colors are never globally converted to monochrome', async () => {
  const css = await readFile(path.join(root, 'css/brand-icons.css'), 'utf8');
  const sections = await readFile(path.join(root, 'css/sections.css'), 'utf8');
  const imports = await readFile(path.join(root, 'styles.css'), 'utf8');

  assert.match(imports, /@import 'css\/brand-icons\.css';/);
  assert.match(css, /\.file-icon-img\s*\{\s*filter:\s*none;/);
  assert.doesNotMatch(sections, /filter:\s*brightness\(0\)\s*invert\(1\)/);

  for (const key of ["windows","windowsFallback","android","androidFallback","brave","chrome","firefox","vlc","cheatEngine","sharex","patchmypc","everything","obsidian","claude","bitwarden","discord","whatsapp","telegram","notepadPlusPlus","luckyPatcher","antigravity","revo","winrar","wiztree","happyMod"]) {
    assert.match(ICONS[key], /^assets\/icons\/(?:brand-[\w-]+-color|brand-luckypatcher|original-[\w-]+)\.(?:svg|png)$/, key);
  }
});

test('the renderer does not insert image filenames as text in any catalog layout', async () => {
  const startup = await readFile(path.join(root, 'js/startup.js'), 'utf8');
  const layouts = startup.match(/isImageIcon\(item\.icon\)/g) || [];
  assert.equal(layouts.length, 3, 'PC, emulation and setup all use isImageIcon');
  assert.doesNotMatch(startup, /item\.icon\.endsWith\('\.png'\)/);
  assert.equal(isImageIcon('assets/icons/example.ico'), true, 'legacy ICO is still recognized as an image');
  assert.equal(isImageIcon('assets/icons/example.PNG?cache=1'), true);
  assert.equal(isImageIcon('a product name'), false);
  assert.equal(isImageIcon(null), false);
});

test('the converted ICO logos are real PNGs with decodable pixel data', async () => {
  const { inflateSync } = await import('node:zlib');
  for (const name of ['everything', 'cheatengine']) {
    const bytes = await readFile(path.join(root, `assets/icons/original-${name}.png`));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    assert.ok(width >= 32 && height >= 32, name);
    const idats = [];
    let off = 8;
    while (off < bytes.length) {
      const size = bytes.readUInt32BE(off);
      const type = bytes.toString('ascii', off + 4, off + 8);
      assert.ok(off + 12 + size <= bytes.length, name);
      if (type === 'IDAT') idats.push(bytes.subarray(off + 8, off + 8 + size));
      off += 12 + size;
      if (type === 'IEND') break;
    }
    assert.ok(idats.length > 0, name);
    assert.ok(inflateSync(Buffer.concat(idats)).length >= (width * 4 + 1) * height, name);
  }
});
