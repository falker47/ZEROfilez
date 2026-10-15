import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import { addZeroFilezSelection, getZeroFilezSelection, ZEROFILEZ_SELECTION_IDS } from '../js/pc-selection.js';
import { generateCommandSetup, getSetupPackages } from '../js/windows-setup.js';

const catalog = Object.values(ITEMS['pc-programs']);

test('ZEROfilez Selection resolves only known Windows apps and builds automatic installs', () => {
    assert.deepEqual(ZEROFILEZ_SELECTION_IDS, [
        'brave-browser', 'discord', 'notepad-plus-plus', '7-zip', 'everything'
    ]);
    const apps = getZeroFilezSelection(catalog);
    assert.deepEqual(apps.map(app => app.name), [
        'Brave Browser', 'Discord', 'Notepad++', '7-Zip', 'Everything'
    ]);
    assert.ok(apps.every(app => app.wingetId));
    assert.equal(getSetupPackages(apps).length, apps.length);
    const cmd = generateCommandSetup(apps);
    for (const app of apps) {
        assert.ok(cmd.includes(`call :install "${app.wingetId}"`), `Missing installer: ${app.name}`);
    }
});

test('missing catalog programs are not added as phantom selections', () => {
    const reducedCatalog = catalog.filter(item => item.id !== 'discord');
    assert.deepEqual(getZeroFilezSelection(reducedCatalog).map(item => item.id), [
        'brave-browser', 'notepad-plus-plus', '7-zip', 'everything'
    ]);
    assert.deepEqual([...addZeroFilezSelection(new Set(), reducedCatalog)], [
        'brave-browser', 'notepad-plus-plus', '7-zip', 'everything'
    ]);
});

test('preset is additive and idempotent; manual selections remain untouched', () => {
    const custom = new Set(['vlc-media-player', 'brave-browser']);
    const once = addZeroFilezSelection(custom, catalog);
    const twice = addZeroFilezSelection(once, catalog);
    assert.deepEqual([...custom], ['vlc-media-player', 'brave-browser']);
    assert.deepEqual([...once], [
        'vlc-media-player', 'brave-browser', 'discord', 'notepad-plus-plus', '7-zip', 'everything'
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
    assert.match(choose, /id="zeroFilezSelectionStatus"/);
    assert.match(startup, /addZeroFilezSelection\(this\.selectedSetupItems/);
    assert.match(startup, /this\.renderSetupSelection\(\)/);
    assert.match(startup, /this\.updateSetupSelectionCount\(\)/);
    assert.match(css, /\.setup-preset-card/);
    assert.match(mobile, /\.setup-preset-card/);
});
