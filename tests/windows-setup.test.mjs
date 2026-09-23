import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import {
    generatePowerShellSetup,
    getSetupPackages,
    isValidWingetId
} from '../js/windows-setup.js';

test('zero selections are rejected', () => {
    assert.throws(
        () => generatePowerShellSetup([]),
        /Select at least one/
    );
});

test('one compatible selection produces one package', () => {
    const script = generatePowerShellSetup([
        { name: 'Chrome', wingetId: 'Google.Chrome' }
    ]);

    assert.match(script, /'Google\.Chrome'/);
    assert.equal((script.match(/'Google\.Chrome'/g) || []).length, 1);
});

test('multiple selections are emitted in deterministic winget ID order', () => {
    const packages = getSetupPackages([
        { name: 'VLC', wingetId: 'VideoLAN.VLC' },
        { name: '7-Zip', wingetId: '7zip.7zip' },
        { name: 'Chrome', wingetId: 'Google.Chrome' }
    ]);

    assert.deepEqual(
        packages.map(pkg => pkg.wingetId),
        ['7zip.7zip', 'Google.Chrome', 'VideoLAN.VLC']
    );
});

test('duplicate package IDs are removed case-insensitively', () => {
    const packages = getSetupPackages([
        { name: 'Chrome', wingetId: 'Google.Chrome' },
        { name: 'Chrome duplicate', wingetId: 'google.chrome' }
    ]);

    assert.equal(packages.length, 1);
    assert.equal(packages[0].wingetId, 'Google.Chrome');
});

test('items without wingetId are excluded', () => {
    const packages = getSetupPackages([
        { name: 'Panacea' },
        { name: 'Firefox', wingetId: 'Mozilla.Firefox' }
    ]);

    assert.deepEqual(packages.map(pkg => pkg.wingetId), ['Mozilla.Firefox']);
});

test('winget IDs use a strict data whitelist', () => {
    for (const valid of [
        'Google.Chrome',
        '7zip.7zip',
        'TheDocumentFoundation.LibreOffice',
        'Microsoft.PowerToys'
    ]) {
        assert.equal(isValidWingetId(valid), true, valid);
    }

    for (const invalid of [
        '',
        'NoDot',
        'Google Chrome',
        'Google.Chrome;Remove-Item',
        'Google.Chrome" -e',
        'Google..Chrome',
        '.Google.Chrome',
        'Google.Chrome.',
        'Google.Chrome\nWrite-Host hacked'
    ]) {
        assert.equal(isValidWingetId(invalid), false, invalid);
    }

    assert.throws(
        () => generatePowerShellSetup([
            { name: 'Bad', wingetId: 'Bad.Id;Write-Host hacked' }
        ]),
        /Invalid winget package ID/
    );
});

test('generated script checks winget, skips installed packages, and installs exact IDs from winget', () => {
    const script = generatePowerShellSetup([
        { name: 'Firefox', wingetId: 'Mozilla.Firefox' }
    ]);

    assert.match(script, /Get-Command winget -ErrorAction SilentlyContinue/);
    assert.match(script, /winget list --id \$packageId --exact --source winget --accept-source-agreements --disable-interactivity/);
    assert.match(script, /Already installed; skipping\./);
    assert.match(script, /winget install --id \$packageId --exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity/);
    assert.match(script, /Continuing with the remaining packages/);
});

test('generated script omits risky legacy OnePunch behaviors', () => {
    const script = generatePowerShellSetup([
        { name: 'Firefox', wingetId: 'Mozilla.Firefox' }
    ]);

    for (const forbidden of [
        /ExecutionPolicy\s+Bypass/i,
        /Invoke-Expression/i,
        /\biex\b/i,
        /Invoke-WebRequest/i,
        /Start-BitsTransfer/i,
        /Restart-Computer/i,
        /shutdown\.exe/i,
        /\bwsl(?:\.exe)?\b/i,
        /Start-Process[^\n]*RunAs/i
    ]) {
        assert.doesNotMatch(script, forbidden);
    }
});

test('all catalog winget IDs are valid and unique', () => {
    const items = Object.values(ITEMS['pc-programs']);
    const withWinget = items.filter(item => item.wingetId);

    assert.ok(withWinget.length > 0);
    assert.equal(
        new Set(withWinget.map(item => item.wingetId.toLowerCase())).size,
        withWinget.length
    );

    for (const item of withWinget) {
        assert.equal(isValidWingetId(item.wingetId), true, item.wingetId);
    }
});

test('legacy FileStorage packages remain in the canonical catalog', () => {
    assert.equal(
        ITEMS.emulation['pmd-save-editor'].pc.url,
        'https://github.com/falker47/FileStorage/raw/main/SkyEditor.SaveEditor.zip'
    );
    assert.equal(
        ITEMS.emulation['gba-hackrom-tools'].pc.url,
        'https://github.com/falker47/FileStorage/raw/main/GBA_HackROM_Toolz%5BZEROfilezRepack%5D.zip'
    );
});

test('Personal Vault and normal startup entry points remain wired', async () => {
    const [indexHtml, mainJs, startupJs] = await Promise.all([
        readFile(new URL('../index.html', import.meta.url), 'utf8'),
        readFile(new URL('../js/main.js', import.meta.url), 'utf8'),
        readFile(new URL('../js/startup.js', import.meta.url), 'utf8')
    ]);

    assert.match(indexHtml, /id="cloudDecryptorPage"/);
    assert.match(indexHtml, /id="modeToggle"/);
    assert.match(mainJs, /import \{ CloudDecryptor \} from '\.\/decryptor\.js'/);
    assert.match(mainJs, /new CloudDecryptor\(\)/);
    assert.match(startupJs, /window\.open\(item\.url, '_blank', 'noopener,noreferrer'\)/);
});
