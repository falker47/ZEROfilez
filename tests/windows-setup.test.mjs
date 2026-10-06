import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import {
    generateCommandSetup,
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

test('Notepad++ retains its official package ID in both setup formats', () => {
    const selection = [{ name: 'Notepad++', wingetId: 'Notepad++.Notepad++' }];

    assert.deepEqual(getSetupPackages(selection), selection);
    assert.ok(generateCommandSetup(selection).includes('call :install "Notepad++.Notepad++"'));
    assert.ok(generatePowerShellSetup(selection).includes("'Notepad++.Notepad++'"));
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
        'Microsoft.PowerToys',
        'Notepad++.Notepad++'
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
        'Google.Chrome\nWrite-Host hacked',
        'Notepad++.Notepad++&whoami',
        'Notepad++.Notepad++|whoami',
        'Notepad++.Notepad++%PATH%'
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

test('command setup avoids PowerShell execution-policy friction and keeps errors visible', () => {
    const script = generateCommandSetup([
        { name: 'Firefox', wingetId: 'Mozilla.Firefox' },
        { name: 'LibreOffice', wingetId: 'TheDocumentFoundation.LibreOffice' }
    ]);

    assert.match(script, /^@echo off/);
    assert.match(script, /where winget >nul 2>&1/);
    assert.match(script, /winget list --id "%PACKAGE_ID%" --exact --accept-source-agreements --disable-interactivity/);
    assert.match(script, /winget install --id "%PACKAGE_ID%" --exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity/);
    assert.match(script, /Already installed; skipping\./);
    assert.match(script, /pause >nul/);
    assert.match(script, /call :install "Mozilla\.Firefox"/);
    assert.match(script, /call :install "TheDocumentFoundation\.LibreOffice"/);
    assert.doesNotMatch(script, /powershell/i);
    assert.doesNotMatch(script, /ExecutionPolicy/i);
});

test('command setup rejects zero compatible selections', () => {
    assert.throws(
        () => generateCommandSetup([]),
        /Select at least one/
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

test('PC setup builder exposes a compact component-based three-step flow', async () => {
    const [indexHtml, startupJs, sectionsCss, componentsCss, iconsJs] = await Promise.all([
        readFile(new URL('../index.html', import.meta.url), 'utf8'),
        readFile(new URL('../js/startup.js', import.meta.url), 'utf8'),
        readFile(new URL('../css/sections.css', import.meta.url), 'utf8'),
        readFile(new URL('../css/components.css', import.meta.url), 'utf8'),
        readFile(new URL('../js/icons.js', import.meta.url), 'utf8')
    ]);

    assert.match(indexHtml, /id="pcProgramsToolbar"/);
    assert.match(indexHtml, /class="input-group search-container pc-search-container"/);
    assert.match(indexHtml, /New PC · Set up multiple programs in a few clicks/);
    assert.doesNotMatch(indexHtml, /<span class="setup-entry-kicker">Windows setup<\/span>/);
    assert.match(indexHtml, /<h2>PC Setup<\/h2>/);
    assert.match(indexHtml, /data-setup-step="1"/);
    assert.match(indexHtml, /data-setup-step="2"/);
    assert.match(indexHtml, /data-setup-step="3"/);
    assert.match(indexHtml, /id="downloadSetupScript"/);
    assert.match(indexHtml, /setup-step-body/);
    assert.match(indexHtml, /aria-label="Review selection"/);
    assert.match(indexHtml, /data-icon="arrowRight"/);
    assert.match(indexHtml, /data-icon="arrowLeft"/);
    assert.match(indexHtml, /data-icon="check"/);
    assert.doesNotMatch(indexHtml, />→<\/button>/);
    assert.doesNotMatch(indexHtml, />←<\/button>/);
    assert.doesNotMatch(indexHtml, />✓<\/button>/);
    assert.match(indexHtml, /<summary>Details<\/summary>/);
    assert.doesNotMatch(indexHtml, /Review selection<\/button>/);
    assert.doesNotMatch(indexHtml, /Download Windows setup/);
    assert.doesNotMatch(indexHtml, /Copy file contents/);
    assert.doesNotMatch(indexHtml, /Technical details/);
    assert.doesNotMatch(indexHtml, /Select for setup/);
    assert.doesNotMatch(indexHtml, /Generate setup/);

    assert.match(sectionsCss, /#quickStartupPage \.downloads-section[\s\S]*height:\s*clamp\(/);
    assert.match(sectionsCss, /#quickStartupPage \.files-grid[\s\S]*flex:\s*1 1 auto/);
    assert.match(sectionsCss, /#pcProgramsToolbar[\s\S]*--pc-toolbar-control-height:\s*48px/);
    assert.match(sectionsCss, /#pcProgramsToolbar #pcSearchInput[\s\S]*height:\s*var\(--pc-toolbar-control-height\)/);
    assert.match(sectionsCss, /#pcProgramsToolbar \.pc-setup-entry[\s\S]*height:\s*var\(--pc-toolbar-control-height\)/);
    assert.match(sectionsCss, /#emulation-tab \.file-card,[\s\S]*#apk-files-tab \.file-card[\s\S]*var\(--startup-card-height-desktop\)/);
    assert.match(sectionsCss, /\.setup-step-body[\s\S]*overflow-y:\s*auto/);
    assert.match(sectionsCss, /\.setup-step-footer[\s\S]*flex:\s*0 0 auto/);
    assert.match(componentsCss, /\.ui-button,/);
    assert.match(componentsCss, /\.ui-icon-button/);
    assert.match(iconsJs, /arrowRight:/);
    assert.match(iconsJs, /copy:/);

    assert.match(startupJs, /pcProgramsToolbar/);
    assert.match(startupJs, /SETUP_CATEGORY_GROUPS/);
    assert.match(startupJs, /badge\.textContent = item\.wingetId \? 'Auto' : 'Manual'/);
    assert.match(startupJs, /generateCommandSetup\(automatic\)/);
    assert.match(startupJs, /setupManualDownloads/);
    assert.match(startupJs, /ZEROfilez-Windows-Setup\.cmd/);
    assert.doesNotMatch(startupJs, /ZEROfilez-Windows-Setup\.ps1/);
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
