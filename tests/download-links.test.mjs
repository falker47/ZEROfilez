import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import { ITEMS } from '../js/data.js';

const require = createRequire(import.meta.url);
const { PROGRAMS } = require('../scripts/update-links.js');
const catalogSource = readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');

// Version-independent upstream endpoints intentionally do not require daily rewrites.
const STABLE_PC_URLS = new Map([
    ['brave-browser', 'https://laptop-updates.brave.com/latest/win64'],
    ['google-chrome', 'https://dl.google.com/dl/chrome/install/googlechromestandaloneenterprise64.msi'],
    ['mozilla-firefox', 'https://download.mozilla.org/?product=firefox-latest&os=win64&lang=en-US'],
    ['revo-uninstaller', 'https://download.revouninstaller.com/download/revosetup.exe'],
    ['cheat-engine', 'https://cheatengine.org/downloads.php'],
    ['patch-my-pc', 'https://patchmypc.com/freeupdater/PatchMyPC.exe'],
    ['pcloud', 'https://www.pcloud.com/it/how-to-install-pcloud-drive-windows.html?download=windows-10-64bit'],
    ['claude-desktop', 'https://downloads.claude.ai/releases/win32/ClaudeSetup.exe'],
    ['chatgpt-desktop', 'https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi'],
    ['hermes-agent', 'https://hermes-agent.nousresearch.com/'],
    ['discord', 'https://discord.com/api/download?platform=win'],
    ['telegram-desktop', 'https://telegram.org/dl/desktop/win64'],
    ['whatsapp-desktop', 'https://get.microsoft.com/installer/download/9NKSQGP7F2NH'],
    ['visual-studio-code', 'https://update.code.visualstudio.com/latest/win32-x64-user/stable'],
    ['panacea', 'https://github.com/falker47/Panacea/releases/latest/download/Panacea.exe']
]);

test('every PC program has a permanent upstream link or one matching automatic updater', () => {
    const catalog = Object.values(ITEMS['pc-programs']);
    const catalogIds = new Set(catalog.map(item => item.id));
    for (const id of STABLE_PC_URLS.keys()) {
        assert.ok(catalogIds.has(id), 'Stale stable-link exception: ' + id);
    }

    for (const item of catalog) {
        assert.match(item.url, /^https:\/\//, item.name + ' must use HTTPS');
        const updaters = PROGRAMS.filter(rule => catalogSource.match(rule.regex)?.[2] === item.url);
        if (STABLE_PC_URLS.has(item.id)) {
            assert.equal(item.url, STABLE_PC_URLS.get(item.id), item.name + ' stable URL changed; verify upstream behavior');
            assert.equal(updaters.length, 0, item.name + ' must not be simultaneously classified as static and updater-managed');
        } else {
            assert.equal(updaters.length, 1, item.name + ' needs exactly one working release updater regex');
        }
    }
});

test('release selectors target the correct Windows x64 installers', () => {
    const marktext = PROGRAMS.find(rule => rule.name === 'MarkText');
    const sharex = PROGRAMS.find(rule => rule.name === 'ShareX');
    assert.ok(marktext);
    assert.ok(sharex);
    assert.equal(marktext.repo, 'marktext/marktext');
    assert.equal(marktext.filter({ name: 'marktext-win-x64-0.21.2-setup.exe' }), true);
    assert.equal(marktext.filter({ name: 'marktext-win-arm64-0.21.2-setup.exe' }), false);
    assert.equal(marktext.filter({ name: 'marktext-win-x64-0.21.2.zip' }), false);
    assert.equal(sharex.filter({ name: 'ShareX-21.0.0-setup-x64.exe' }), true);
    assert.equal(sharex.filter({ name: 'ShareX-19.0.2-setup.exe' }), true);
    assert.equal(sharex.filter({ name: 'ShareX-21.0.0-portable-x64.zip' }), false);
});

test('Panacea offers stable installer and portable links without release-number rewrites', () => {
    const panacea = ITEMS['pc-programs'].panacea;
    assert.equal(panacea.url, 'https://github.com/falker47/Panacea/releases/latest/download/Panacea.exe');
    assert.equal(panacea.installerUrl, 'https://github.com/falker47/Panacea/releases/latest/download/PanaceaSetup.exe');
    assert.notEqual(panacea.url, panacea.installerUrl);
    assert.ok(!PROGRAMS.some(rule => rule.name === 'Panacea'));
});
