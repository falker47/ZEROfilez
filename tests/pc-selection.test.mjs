import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import { getDownloadChoices } from '../js/download-options.js';
import { addZeroFilezSelection, getZeroFilezSelection, ZEROFILEZ_SELECTION_IDS } from '../js/pc-selection.js';
import { generateCommandSetup, getSetupPackages } from '../js/windows-setup.js';

const catalog = Object.values(ITEMS['pc-programs']);

test('ZEROfilez Selection resolves seven apps: six automatic and Panacea manual', () => {
    assert.deepEqual(ZEROFILEZ_SELECTION_IDS, [
        'brave-browser', 'discord', 'notepad-plus-plus', '7-zip', 'everything',
        'revo-uninstaller', 'panacea'
    ]);
    const apps = getZeroFilezSelection(catalog);
    assert.deepEqual(apps.map(app => app.name), [
        'Brave Browser', 'Discord', 'Notepad++', '7-Zip', 'Everything',
        'Revo Uninstaller', 'Panacea'
    ]);
    const automatic = apps.filter(item => Boolean(item.wingetId));
    const manual = apps.filter(item => !item.wingetId);
    assert.equal(automatic.length, 6);
    assert.deepEqual(manual.map(item => item.id), ['panacea']);

    const packages = getSetupPackages(apps);
    assert.equal(packages.length, 6);
    assert.ok(packages.some(item => item.wingetId === 'RevoUninstaller.RevoUninstaller'));
    const cmd = generateCommandSetup(apps);
    for (const item of automatic) {
        assert.ok(cmd.includes(`call :install "${item.wingetId}"`), `Missing installer: ${item.name}`);
    }
    assert.doesNotMatch(cmd, /Panacea/i);

    const panacea = manual[0];
    const choices = getDownloadChoices(panacea);
    assert.deepEqual(choices.map(choice => choice.kind), ['install', 'portable']);
    assert.equal(choices[0].url, 'https://github.com/falker47/Panacea/releases/latest/download/PanaceaSetup.exe');
});

test('missing catalog programs are not added as phantom selections', () => {
    const reducedCatalog = catalog.filter(item => item.id !== 'discord');
    assert.deepEqual(getZeroFilezSelection(reducedCatalog).map(item => item.id), [
        'brave-browser', 'notepad-plus-plus', '7-zip', 'everything', 'revo-uninstaller', 'panacea'
    ]);
    assert.deepEqual([...addZeroFilezSelection(new Set(), reducedCatalog)], [
        'brave-browser', 'notepad-plus-plus', '7-zip', 'everything', 'revo-uninstaller', 'panacea'
    ]);
});

test('preset is additive and idempotent; manual selections remain untouched', () => {
    const custom = new Set(['vlc-media-player', 'brave-browser']);
    const once = addZeroFilezSelection(custom, catalog);
    const twice = addZeroFilezSelection(once, catalog);
    assert.deepEqual([...custom], ['vlc-media-player', 'brave-browser']);
    assert.deepEqual([...once], [
        'vlc-media-player', 'brave-browser', 'discord', 'notepad-plus-plus', '7-zip', 'everything', 'revo-uninstaller', 'panacea'
    ]);
    assert.deepEqual([...twice], [...once]);
});

test('preset CTA is visible in Choose, wired to real selections and responsive styling', async () => {
    const [html, startup, css, mobile] = await Promise.all([
        readFile(new URL('../index.html', import.meta.url), 'utf8'),
        readFile(new URL('../js/startup.js', import.meta.url), 'utf8'),
        readFile(new URL('../css/sections.css', import.meta.url), 'utf8'),
        readFile(new URL('../css/responsive.css', import.meta.url), 'utf8')
    ]);
    const choose = html.split('data-setup-step="1"')[1].split('data-setup-step="2"')[0];
    assert.match(choose, /id="applyZeroFilezSelection"/);
    assert.match(choose, /ZEROfilez Selection/);
    assert.match(choose, /data-icon="setup"/);
    assert.match(choose, /id="zeroFilezSelectionStatus"[^>]*>7 recommended apps/);
    assert.match(choose, /id="zeroFilezSelectionAction"[^>]*>Select 7 apps/);
    assert.match(startup, /addZeroFilezSelection\(this\.selectedSetupItems/);
    assert.match(startup, /addPanaceaInstaller[\s\S]*!this\.selectedSetupItems\.has\('panacea'\)/);
    assert.match(startup, /if \(addPanaceaInstaller\) this\.setupVariants\.set\('panacea', 'install'\)/);
    assert.match(startup, /this\.renderSetupSelection\(\)/);
    assert.match(startup, /this\.updateSetupSelectionCount\(\)/);
    assert.match(css, /\.setup-preset-card/);
    assert.match(mobile, /\.setup-preset-card/);
});
