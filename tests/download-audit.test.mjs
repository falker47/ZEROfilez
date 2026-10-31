import assert from 'node:assert/strict';
import test from 'node:test';

import { collectCatalogDownloads, collectChangedCatalogDownloads, inspectDownloadSignature } from '../scripts/audit-download-links.mjs';

test('live audit covers PC programs, emulator downloads, stores, and alternate installers', () => {
    const catalog = {
        emulation: {
            emulator: {
                name: 'Example Emulator',
                pc: { url: 'https://files.example/emu.zip' },
                android: { url: 'https://play.google.com/store/apps/details?id=example', linkType: 'store' }
            }
        },
        'pc-programs': {
            app: { name: 'Example App', url: 'https://files.example/app.exe', installerUrl: 'https://files.example/setup.exe' }
        }
    };
    assert.deepEqual(collectCatalogDownloads(catalog).map(item => item.name), [
        'Example Emulator (PC)', 'Example Emulator (Android)', 'Example App', 'Example App (installer)'
    ]);
    assert.equal(collectCatalogDownloads(catalog)[1].linkType, 'store');
});

test('live audit validates signatures and rejects HTML returned for a file URL', () => {
    const exe = Buffer.alloc(256);
    exe.write('MZ', 0, 'ascii');
    exe.writeUInt32LE(0x80, 0x3c);
    exe.write('PE\0\0', 0x80, 'ascii');
    assert.deepEqual(inspectDownloadSignature(exe, 'exe'), { valid: true, signature: 'MZ/PE' });
    assert.equal(inspectDownloadSignature(Buffer.from('<!doctype html><title>Installer</title>'), 'exe').valid, false);
    assert.equal(inspectDownloadSignature(Buffer.from('PK\x03\x04'), 'zip').valid, true);
    assert.equal(inspectDownloadSignature(Buffer.from('377ABCAF271C', 'hex'), '7z').valid, true);
    assert.equal(inspectDownloadSignature(Buffer.from('<?xml version="1.0"?><AppInstaller/>'), 'appinstaller').valid, true);
    assert.equal(inspectDownloadSignature(Buffer.from('<?xml version="1.0"?><Other/>'), 'appinstaller').valid, false);
});

test('changed link audit includes new direct URLs and excludes deleted and unrelated sources', () => {
    const items = {
        emulation: { gba: { name: 'GBA', pc: { url: 'https://example.org/new.zip' } } },
        'pc-programs': {
            app: { name: 'Tool', url: 'https://example.org/tool.exe',
                installerUrl: 'https://example.org/installer.exe' }
        },
        'apk-files': { apk: { name: 'APK', url: 'https://example.org/new.apk' } }
    };
    const diff = [
        '--- a/js/data.js', '+++ b/js/data.js',
        '- "url": "https://example.org/old.zip"',
        '+ "url": "https://example.org/new.zip"',
        '+ "url": "https://example.org/new.apk"',
        '+ "name": "Tool", "url": "https://example.org/tool.exe", "installerUrl": "https://example.org/installer.exe"',
        '+ "url": "https://unrelated.example/not-listed.exe"'
    ].join('\n');
    assert.deepEqual(collectChangedCatalogDownloads(diff, items).map(row => row.url), [
        'https://example.org/new.zip',
        'https://example.org/tool.exe',
        'https://example.org/installer.exe',
        'https://example.org/new.apk'
    ]);
});
