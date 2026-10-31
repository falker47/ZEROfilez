import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import { collectCatalogDownloads } from '../scripts/audit-download-links.mjs';

const require = createRequire(import.meta.url);
const { PROGRAMS, extractDolphinStableUrl, extractLatestLuckyPatcherUrl, verifyCandidateDownload } =
    require('../scripts/update-links.js');

test('Azahar release rules accept upstream versioned filenames for Windows and Android', () => {
    const pc = PROGRAMS.find(rule => rule.name === 'Azahar (PC)');
    const android = PROGRAMS.find(rule => rule.name === 'Azahar (Android)');
    assert.equal(pc?.filter({ name: 'azahar-windows-msvc-2126.2.zip' }), true);
    assert.equal(android?.filter({ name: 'azahar-android-googleplay-2126.2.apk' }), true);
    assert.equal(pc?.filter({ name: 'azahar-windows-msvc-2126.2-installer.exe' }), false);
    assert.equal(android?.filter({ name: 'azahar-android-googleplay-2126.2.aab' }), false);
});

test('Dolphin official release parser selects newest stable hotfix, never a development build', () => {
    assert.equal(typeof extractDolphinStableUrl, 'function');
    const html = `
        <a href="https://dl.dolphin-emu.org/releases/2606/dolphin-2606-x64.7z">old</a>
        <a href="https://dl.dolphin-emu.org/releases/2609-133/dolphin-2609-133-x64.7z">development</a>
        <a href="https://dl.dolphin-emu.org/releases/2609a/dolphin-2609a-x64.7z">hotfix</a>
        <a href="https://dl.dolphin-emu.org/releases/2609/dolphin-2609-x64.7z">base</a>
        <a href="https://dl.dolphin-emu.org/releases/2609a/dolphin-2609a.apk">android</a>
        <a href="https://dl.dolphin-emu.org/releases/2609/dolphin-2609.apk">android-old</a>
    `;
    assert.equal(extractDolphinStableUrl(html, 'pc'),
        'https://dl.dolphin-emu.org/releases/2609a/dolphin-2609a-x64.7z');
    assert.equal(extractDolphinStableUrl(html, 'android'),
        'https://dl.dolphin-emu.org/releases/2609a/dolphin-2609a.apk');
    assert.equal(extractDolphinStableUrl('<a href="/wrong.exe">no download</a>', 'pc'), null);
});

test('Lucky Patcher updater selects published versions from its directory, not numeric guesses', () => {
    assert.equal(typeof extractLatestLuckyPatcherUrl, 'function');
    const html = `
        <a href="LuckyPatchers.com_Official_Installer_12.9.99.apk">old</a>
        <a href="LuckyPatchers.com_Official_Installer_12.10.8.apk">latest</a>
        <a href="LuckyPatchers.com_Official_Installer_12.10.7.apk">previous</a>
        <a href="https://malicious.example/12.99.apk">ignore</a>
    `;
    assert.equal(extractLatestLuckyPatcherUrl(html),
        'https://chelpus.com/download/LuckyPatchers.com_Official_Installer_12.10.8.apk');
    assert.equal(extractLatestLuckyPatcherUrl('<html></html>'), null);
});

test('RetroArch Android is maintained independently of the Windows URL while sharing stable releases', () => {
    const current = ITEMS.emulation.retroarch;
    const pc = PROGRAMS.filter(rule => rule.name === 'RetroArch (PC)');
    const android = PROGRAMS.find(rule => rule.name === 'RetroArch (Android)');
    assert.equal(pc.length, 1);
    assert.equal(android?.mode, 'retroarch-android');
    assert.equal(android && android.regex.exec(JSON.stringify({
        retroarch: { android: { url: current.android.url } }
    }))?.[2], current.android.url);
});

test('whole-catalog audit includes APK files and both web applications', () => {
    const downloads = collectCatalogDownloads(ITEMS);
    const expected = Object.values(ITEMS.emulation).reduce((total, item) =>
        total + ['pc','android','web'].filter(key => item[key]?.url).length, 0)
        + Object.values(ITEMS['pc-programs']).reduce((total, item) =>
            total + Number(Boolean(item.url)) + Number(Boolean(item.installerUrl)), 0)
        + Object.values(ITEMS['apk-files']).filter(item => item.url).length;
    assert.equal(downloads.length, expected);
    for (const item of Object.values(ITEMS['apk-files'])) {
        assert.ok(downloads.some(link => link.url === item.url), item.name + ' omitted from audit');
    }
    for (const item of Object.values(ITEMS.emulation)) {
        if (item.web?.url) {
            assert.ok(downloads.some(link => link.url === item.web.url && link.linkType === 'website'),
                item.name + ' web application omitted or misclassified');
        }
    }
});

test('GBA Android links to the real Pizza Boy A Basic Play listing', () => {
    assert.equal(ITEMS.emulation.gba.android.appId, 'it.dbtecno.pizzaboygba');
    assert.equal(ITEMS.emulation.gba.android.url,
        'https://play.google.com/store/apps/details?id=it.dbtecno.pizzaboygba');
});

test('continuous Vita3K asset endpoints need no stale timestamp query', () => {
    assert.equal(ITEMS.emulation.psvita.pc.url,
        'https://github.com/Vita3K/Vita3K/releases/download/continuous/windows-latest.zip');
    assert.equal(ITEMS.emulation.psvita.android.url,
        'https://github.com/Vita3K/Vita3K/releases/download/continuous/android-latest.apk');
});

test('resolved download paths use maintained current-generation upstream naming', () => {
    assert.match(ITEMS.emulation['3ds'].pc.url,
        /^https:\/\/github\.com\/azahar-emu\/azahar\/releases\/download\/\d+(?:\.\d+)+\/azahar-windows-msvc-\d+(?:\.\d+)+\.zip$/);
    assert.match(ITEMS.emulation['3ds'].android.url,
        /^https:\/\/github\.com\/azahar-emu\/azahar\/releases\/download\/\d+(?:\.\d+)+\/azahar-android-googleplay-\d+(?:\.\d+)+\.apk$/);
    assert.doesNotMatch(ITEMS.emulation['3ds'].pc.url, /2124\.3/);
    assert.match(ITEMS.emulation.gc_wii.pc.url,
        /^https:\/\/dl\.dolphin-emu\.org\/releases\/\d{4}[a-z]?\/dolphin-\d{4}[a-z]?-x64\.7z$/);
    assert.doesNotMatch(ITEMS.emulation.gc_wii.pc.url, /\/2609\/dolphin-2609-x64/);
    assert.match(ITEMS['apk-files']['lucky-patcher'].url,
        /^https:\/\/chelpus\.com\/download\/LuckyPatchers\.com_Official_Installer_\d+(?:\.\d+){2,}\.apk$/);
    assert.doesNotMatch(ITEMS['apk-files']['lucky-patcher'].url, /_12\.0\.2\.apk$/);
});

test('scraper candidates require binary signatures, not simply HTTP 200', async () => {
    const validArchive = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);
    const serve = (bytes, contentType) => async () =>
        new Response(bytes, { status: 206, headers: { 'Content-Type': contentType } });
    await assert.doesNotReject(verifyCandidateDownload('https://example.org/good.apk',
        serve(validArchive, 'application/vnd.android.package-archive')));
    await assert.rejects(verifyCandidateDownload('https://example.org/bad.apk',
        serve('<html>Download</html>', 'text/html')), /page/);
    await assert.rejects(verifyCandidateDownload('https://example.org/bad.zip',
        serve(Buffer.from('fake zip'), 'application/zip')), /file signature/);
    await assert.rejects(verifyCandidateDownload('https://example.org/bad.zip',
        async () => new Response('not found', { status: 404 })), /HTTP 404/);
});
