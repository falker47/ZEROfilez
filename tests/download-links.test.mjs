import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import { ITEMS } from '../js/data.js';

const require = createRequire(import.meta.url);
const {
    PROGRAMS,
    extractChocolateyInstallerInfo,
    extractChocolateyPackageMetadata,
    extractHermesAppInstallerInfo,
    extractNupkgEntry,
    isPortableExecutable
} = require('../scripts/update-links.js');
const catalogSource = readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');
const startupSource = readFileSync(new URL('../js/startup.js', import.meta.url), 'utf8');

// Version-independent upstream endpoints intentionally do not require daily rewrites.
const STABLE_PC_URLS = new Map([
    ['brave-browser', 'https://laptop-updates.brave.com/latest/win64'],
    ['google-chrome', 'https://dl.google.com/dl/chrome/install/googlechromestandaloneenterprise64.msi'],
    ['mozilla-firefox', 'https://download.mozilla.org/?product=firefox-latest&os=win64&lang=en-US'],
    ['revo-uninstaller', 'https://download.revouninstaller.com/download/revosetup.exe'],
    ['patch-my-pc', 'https://patchmypc.com/freeupdater/PatchMyPC.exe'],
    ['pcloud', 'https://partner.pcloud.com/dl/win64'],
    ['claude-desktop', 'https://downloads.claude.ai/releases/win32/ClaudeSetup.exe'],
    ['chatgpt-desktop', 'https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi'],
    ['discord', 'https://discord.com/api/download?platform=win'],
    ['telegram-desktop', 'https://telegram.org/dl/desktop/win64'],
    ['whatsapp-desktop', 'https://get.microsoft.com/installer/download/9NKSQGP7F2NH'],
    ['visual-studio-code', 'https://update.code.visualstudio.com/latest/win32-x64-user/stable'],
    ['openclaw', 'https://github.com/openclaw/openclaw-windows-node/releases/latest/download/OpenClawCompanion-Setup-x64.exe'],
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
    const websiteOnly = new Set();
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

test('emulator PC downloads target files, including the published PKHeX application ZIP', () => {
    for (const item of Object.values(ITEMS.emulation)) {
        if (!item.pc?.url) continue;
        assert.match(new URL(item.pc.url).pathname, /\.(?:exe|msi|7z|zip)$/i, item.name);
    }
});

test('Android store destinations are identified as stores instead of download files', () => {
    for (const item of Object.values(ITEMS.emulation)) {
        const android = item.android;
        if (!android?.url) continue;
        if (new URL(android.url).hostname === 'play.google.com') {
            assert.equal(android.linkType, 'store', item.name + ' Google Play destination must be labelled as a store');
        } else {
            assert.match(new URL(android.url).pathname, /\.apk$/i, item.name + ' Android endpoint must be an APK');
        }
    }
    assert.match(startupSource, /storeLink = data\?\.linkType === 'store'/);
    assert.match(startupSource, /Google Play/);
});

test('Hermes updater verifies the permanent official App Installer feed and signed bundle metadata', () => {
    const current = ITEMS['pc-programs']['hermes-agent'].url;
    const rule = PROGRAMS.find(rule => rule.name === 'Hermes Agent');
    assert.equal(rule?.mode, 'hermes');
    assert.equal(catalogSource.match(rule.regex)?.[2], current);
    assert.equal(new URL(current).hostname, 'hermes-assets.nousresearch.com');
    assert.equal(new URL(current).pathname, '/releases/win32/stable/stable.appinstaller');
    assert.equal(ITEMS['pc-programs']['hermes-agent'].autoInstaller, 'hermes-appinstaller');
    const manifest = `<AppInstaller Version="2026.6864.2132.0"><MainBundle Uri="https://hermes-assets.nousresearch.com/releases/tag/rc.3-v0.22.0/HermesBundled-2026.6864.2132.0-win.msixbundle" Version="2026.6864.2132.0" Publisher="CN=Nous Research Inc., O=Nous Research Inc., L=Austin, S=Texas, C=US" /></AppInstaller>`;
    assert.deepEqual(extractHermesAppInstallerInfo(manifest), {
        bundleUri: 'https://hermes-assets.nousresearch.com/releases/tag/rc.3-v0.22.0/HermesBundled-2026.6864.2132.0-win.msixbundle',
        publisher: 'CN=Nous Research Inc., O=Nous Research Inc., L=Austin, S=Texas, C=US',
        version: '2026.6864.2132.0'
    });
    assert.throws(() => extractHermesAppInstallerInfo(manifest.replace('CN=Nous Research Inc.', 'CN=Untrusted')),
        /publisher did not match/);
    assert.throws(() => extractHermesAppInstallerInfo(manifest.replace('hermes-assets.nousresearch.com', 'attacker.example')),
        /official release host/);
});

test('OpenClaw uses the official stable Windows Hub installer endpoint', () => {
    const openclaw = ITEMS['pc-programs'].openclaw;
    assert.equal(openclaw.url, STABLE_PC_URLS.get('openclaw'));
    assert.equal(openclaw.autoInstaller, 'openclaw-inno');
    assert.equal(new URL(openclaw.url).hostname, 'github.com');
    assert.equal(new URL(openclaw.url).pathname,
        '/openclaw/openclaw-windows-node/releases/latest/download/OpenClawCompanion-Setup-x64.exe');
    assert.equal(openclaw.wingetId, undefined);
});

test('Cheat Engine points to Dark Byte’s direct package binary and pins the published SHA-256', () => {
    const item = ITEMS['pc-programs']['cheat-engine'];
    const rule = PROGRAMS.find(rule => rule.name === 'Cheat Engine');
    assert.equal(rule?.mode, 'cheatengine');
    assert.equal(catalogSource.match(rule.regex)?.[2], item.url);
    assert.equal(rule.checksumRegex && catalogSource.match(rule.checksumRegex)?.[2], item.sha256);
    assert.equal(item.url, 'https://d1dj9aohuk02ls.cloudfront.net/f/CheatEngine/2129/CheatEngine77.exe');
    assert.equal(item.sha256, 'CF0F4B6002555677984233C95856683959BE83A5DEF3DC12175A8296EB22676B');
    assert.equal(item.linkType, undefined);
});

test('Chocolatey updater accepts only the package author, direct PE URL, and a SHA-256 checksum', () => {
    const feed = `<feed><entry><author><name>Dark Byte</name></author><m:properties><d:Version>7.7.0</d:Version></m:properties></entry></feed>`;
    assert.deepEqual(extractChocolateyPackageMetadata(feed), { version: '7.7.0', author: 'Dark Byte' });
    assert.throws(() => extractChocolateyPackageMetadata('<feed></feed>'), /no package entry/);

    const hash = 'CF0F4B6002555677984233C95856683959BE83A5DEF3DC12175A8296EB22676B';
    const install = `Install-ChocolateyPackage \\\n+  -PackageName 'cheatengine' \\\n+  -Url 'https://d1dj9aohuk02ls.cloudfront.net/f/CheatEngine/2129/CheatEngine77.exe' \\\n+  -Checksum '${hash}' \\\n+  -ChecksumType 'SHA256'`;
    assert.deepEqual(extractChocolateyInstallerInfo(install), {
        url: 'https://d1dj9aohuk02ls.cloudfront.net/f/CheatEngine/2129/CheatEngine77.exe',
        sha256: hash
    });
    assert.throws(() => extractChocolateyInstallerInfo(install.replace('cloudfront.net', 'example.org')),
        /direct CloudFront EXE/);
    assert.throws(() => extractChocolateyInstallerInfo(install.replace(hash, 'bad')),
        /SHA-256 checksum/);
});

test('Chocolatey NuGet parser extracts the install script and rejects non-PE bytes', () => {
    const name = Buffer.from('tools/chocolateyInstall.ps1', 'utf8');
    const text = Buffer.from("Install-ChocolateyPackage -Url 'https://example.invalid/CheatEngine.exe'", 'utf8');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(text.length, 18);
    local.writeUInt32LE(text.length, 22);
    local.writeUInt16LE(name.length, 26);
    const localRecord = Buffer.concat([local, name, text]);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(text.length, 20);
    central.writeUInt32LE(text.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(0, 42);
    const centralRecord = Buffer.concat([central, name]);

    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(1, 8);
    eocd.writeUInt16LE(1, 10);
    eocd.writeUInt32LE(centralRecord.length, 12);
    eocd.writeUInt32LE(localRecord.length, 16);
    const nupkg = Buffer.concat([localRecord, centralRecord, eocd]);
    assert.equal(extractNupkgEntry(nupkg, 'tools/chocolateyInstall.ps1').toString('utf8'), text.toString('utf8'));
    assert.throws(() => extractNupkgEntry(Buffer.from('not a ZIP'), 'tools/chocolateyInstall.ps1'), /valid ZIP/);
    assert.equal(isPortableExecutable(Buffer.from('not an executable')), false);
});
