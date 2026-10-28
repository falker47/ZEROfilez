import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import { getDownloadChoices } from '../js/download-options.js';

test('Panacea lists recommended Install before portable, each with correct stable asset', () => {
    const app = ITEMS['pc-programs'].panacea;
    const choices = getDownloadChoices(app);
    assert.deepEqual(choices.map(choice => choice.kind), ['install', 'portable']);
    assert.deepEqual(choices.map(choice => choice.label), ['Install', 'Portable']);
    assert.deepEqual(choices.map(choice => choice.url), [app.installerUrl, app.url]);
    assert.match(choices[0].ariaLabel, /recommended/i);
    assert.match(choices[1].ariaLabel, /manual/i);
    assert.match(choices[0].url, /\/releases\/latest\/download\/PanaceaSetup\.exe$/);
    assert.match(choices[1].url, /\/releases\/latest\/download\/Panacea\.exe$/);
});

test('all other PC programs keep one normal download and no alternate format', () => {
    for (const item of Object.values(ITEMS['pc-programs']).filter(item => item.id !== 'panacea')) {
        const choices = getDownloadChoices(item);
        assert.equal(choices.length, 1, item.name);
        assert.equal(choices[0].url, item.url, item.name);
        assert.equal(choices[0].label, item.linkType === 'website' ? 'Official website' : 'Download', item.name);
    }
    assert.deepEqual(getDownloadChoices({ name: 'Missing' }), []);
});

test('catalog, Featured and PC Setup all reuse the existing download choices', async () => {
    const startup = await readFile(new URL('../js/startup.js', import.meta.url), 'utf8');
    const styles = await readFile(new URL('../css/sections.css', import.meta.url), 'utf8');

    assert.match(startup, /renderManualDownloads\(items\)[\s\S]*getDownloadChoices\(item\)/);
    assert.match(startup, /createSimpleFileCard\(item, dataKey\)[\s\S]*getDownloadChoices\(item\)/);
    assert.match(startup, /createDownloadChoiceButton\(item, choice\)/);
    assert.match(startup, /createPanaceaFeaturedCard\(item, mode = 'catalog'\)/);
    assert.match(startup, /choices\.find\(option => option\.kind === this\.getPanaceaVariant\(\)\)/);
    assert.match(startup, /handleSimpleDownload\(button, item, url = item\.url\)/);
    assert.match(startup, /window\.open\(url, '_blank', 'noopener,noreferrer'\)/);
    assert.match(styles, /\.download-choice--install/);
    assert.match(styles, /#pc-programs-tab \.file-card\.multi-download-card/);
});
