import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import { ITEMS } from '../js/data.js';

const require = createRequire(import.meta.url);
const { PROGRAMS, extractHermesInstallerUrl } = require('../scripts/update-links.js');
const catalogSource = readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');

// Version-independent upstream endpoints intentionally do not require daily rewrites.
const STABLE_PC_URLS = new Map([
    ['brave-browser', 'https://laptop-updates.brave.com/latest/win64'],
    ['google-chrome', 'https://dl.google.com/dl/chrome/install/googlechromestandaloneenterprise64.msi'],
    ['mozilla-firefox', 'https://download.mozilla.org/?product=firefox-latest&os=win64&lang=en-US'],
    ['revo-uninstaller', 'https://download.revouninstaller.com/download/revosetup.exe'],
    ['cheat-engine', 'https://cheatengine.org/downloads.php'],
    ['patch-my-pc', 'https://patchmypc.com/freeupdater/PatchMyPC.exe'],
    ['pcloud', 'https://partner.pcloud.com/dl/win64'],
    ['claude-desktop', 'https://downloads.claude.ai/releases/win32/ClaudeSetup.exe'],
    ['chatgpt-desktop', 'https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi'],
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

test('PC download actions are direct files or verified stable binary resolvers, never masked landing pages', () => {
    const resolvers = new Set(['brave-browser', 'mozilla-firefox', 'pcloud',
        'discord', 'telegram-desktop', 'chatgpt-desktop',
        'whatsapp-desktop', 'visual-studio-code']);
    const websiteOnly = new Set(['cheat-engine']);
    for (const item of Object.values(ITEMS['pc-programs'])) {
        if (websiteOnly.has(item.id)) {
            assert.equal(item.linkType, 'website', item.name + ' must be visibly marked as a website');
            continue;
        }
        assert.notEqual(item.linkType, 'website', item.name + ' must provide a direct binary');
        if (resolvers.has(item.id)) continue;
        assert.match(new URL(item.url).pathname, /\.(?:exe|msi|msix|msixbundle|appinstaller|zip|7z)$/i,
            item.name + ' is not a direct file URL');
        if (item.installerUrl) assert.match(new URL(item.installerUrl).pathname, /\.exe$/i);
    }
});

test('emulator PC downloads target files except the explicitly labelled PKHeX publisher page', () => {
    for (const item of Object.values(ITEMS.emulation)) {
        if (!item.pc?.url) continue;
        if (item.id === 'pkhex') {
            assert.equal(item.pc.linkType, 'website');
        } else {
            assert.match(new URL(item.pc.url).pathname, /\.(?:exe|msi|7z|zip)$/i, item.name);
        }
    }
});

test('Hermes updater extracts only the official Windows installer URL and never links to landing pages', () => {
    const current = ITEMS['pc-programs']['hermes-agent'].url;
    const rule = PROGRAMS.find(rule => rule.name === 'Hermes Agent');
    assert.equal(rule?.mode, 'hermes');
    assert.equal(catalogSource.match(rule.regex)?.[2], current);
    assert.equal(new URL(current).hostname, 'hermes-assets.nousresearch.com');
    assert.equal(new URL(current).pathname, '/Hermes-Setup.exe');
    assert.equal(extractHermesInstallerUrl('<a href="' + current + '">Download</a>'), current);
    const updatedBuild = 'https://hermes-assets.nousresearch.com/Hermes-Setup.exe?build=new-release';
    assert.equal(extractHermesInstallerUrl('<a href="' + updatedBuild + '">Download</a>'), updatedBuild);
    assert.equal(extractHermesInstallerUrl('<a href="https://hermes-agent.nousresearch.com/">Download</a>'), null);
});
