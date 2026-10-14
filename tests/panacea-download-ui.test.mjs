import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import { ORDER } from '../js/array.js';
import { StartupManager } from '../js/startup.js';

// Lightweight DOM controls exercise the real render/event methods without a browser dependency.
function element(tagName) {
    const applied = new Set();
    const node = {
        tagName, children: [], listeners: {}, attributes: {}, dataset: {}, style: {},
        className: '', textContent: '', title: '', disabled: false, checked: false,
        hidden: false, value: '', id: '',
        appendChild(child) { this.children.push(child); return child; },
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(type, callback) { this.listeners[type] = callback; },
        dispatch(type) { this.listeners[type]?.({ target: this, currentTarget: this }); },
        click() { this.dispatch('click'); }
    };
    node.classList = {
        add(name) { applied.add(name); },
        toggle(name, on) { if (on) applied.add(name); else applied.delete(name); },
        remove(name) { applied.delete(name); },
        contains(name) { return applied.has(name) || node.className.split(/\s+/).includes(name); }
    };
    Object.defineProperty(node, 'innerHTML', {
        get() { return this._html || ''; },
        set(value) { this._html = value; this.children = []; }
    });
    return node;
}

function descendants(node) {
    return [node, ...node.children.flatMap(descendants)];
}

function fakeBrowser(callback) {
    const prevDocument = globalThis.document;
    const prevWindow = globalThis.window;
    const opened = [];
    const ids = new Map();
    for (const id of [
        'setupBuilderSelectionList', 'setupSelectionCount', 'setupStep1Next',
        'clearSetupSelection', 'setupAutomaticCount', 'setupManualCount',
        'setupReviewTotal', 'setupReviewAutomaticList', 'setupReviewManualList',
        'setupReadySummary', 'setupAutomaticOutput', 'setupNoAutomatic',
        'setupScriptPreview', 'setupManualSection', 'setupManualDownloads',
        'windowsSetupStatus'
    ]) ids.set(id, element('div'));
    globalThis.document = {
        createElement: element,
        getElementById(id) { return ids.get(id) || null; },
        querySelectorAll() { return []; }
    };
    globalThis.window = { open(...args) { opened.push(args); } };
    const manager = Object.create(StartupManager.prototype);
    manager.data = {
        'pc-programs': ORDER['pc-programs'].map(id => ITEMS['pc-programs'][id])
    };
    manager.selectedSetupItems = new Set();
    manager.setupVariants = new Map();
    manager.generatedSetupScript = '';
    manager.resetButton = () => {};
    manager.createProgramInfoButton = () => element('button');
    try {
        return callback({ manager, ids, opened });
    } finally {
        if (prevDocument === undefined) delete globalThis.document;
        else globalThis.document = prevDocument;
        if (prevWindow === undefined) delete globalThis.window;
        else globalThis.window = prevWindow;
    }
}

function controls(card) {
    const nodes = descendants(card);
    const inputs = nodes.filter(node => node.tagName === 'input');
    return {
        checkbox: inputs.find(node => node.type === 'checkbox'),
        install: inputs.find(node => node.type === 'radio' && node.value === 'install'),
        portable: inputs.find(node => node.type === 'radio' && node.value === 'portable'),
        inputs
    };
}

test('featured catalog is rendered once above alphabetically sorted ordinary categories', () => {
    fakeBrowser(({ manager }) => {
        const output = element('div');
        const regularIds = [];
        manager.createSimpleFileCard = item => {
            regularIds.push(item.id);
            const card = element('div');
            card.dataset.itemId = item.id;
            return card;
        };
        manager.renderPcProgramsCatalog(output);
        const featured = output.children[0];
        assert.ok(featured.classList.contains('panacea-featured-card'));
        assert.equal(descendants(output).filter(n => n.classList.contains('panacea-featured-card')).length, 1);
        assert.equal(regularIds.includes('panacea'), false);
        assert.equal(new Set(regularIds).size, regularIds.length);
        assert.equal(regularIds.length + 1, manager.data['pc-programs'].length);
        const essentials = output.children.find(node =>
            descendants(node).some(child => child.textContent === 'Essentials'));
        assert.ok(essentials);
        assert.equal(essentials.children[0].children[1].textContent, '5 programs');
        assert.equal(output.children.some(node => node.textContent === 'No results found.'), false);

        const logo = descendants(featured).find(n => n.tagName === 'img');
        assert.equal(logo.src, 'assets/panacea-icon.png');
        assert.ok(!logo.classList.contains('file-icon-img'));
        assert.equal(logo.alt, '');
        assert.deepEqual(descendants(featured).filter(n => n.tagName === 'button').map(n => n.textContent),
            ['Install', 'Portable']);
        const details = descendants(featured).find(n => n.tagName === 'a');
        assert.equal(details.href, 'https://github.com/falker47/Panacea');
        assert.equal(details.rel, 'noopener noreferrer');
    });
});

test('catalog searches Featured, Essentials, Panacea, descriptive text and genuine no-results', () => {
    fakeBrowser(({ manager }) => {
        const output = element('div');
        manager.createSimpleFileCard = item => {
            const card = element('div');
            card.dataset.itemId = item.id;
            return card;
        };
        for (const query of ['Panacea', 'Featured', 'windows maintenance', 'cleanup', 'repair']) {
            manager.renderPcProgramsCatalog(output, query);
            assert.equal(output.children.length, 1, query);
            assert.ok(output.children[0].classList.contains('panacea-featured-card'), query);
        }
        manager.renderPcProgramsCatalog(output, 'Essentials');
        assert.equal(output.children.length, 2);
        assert.equal(output.children[1].children[1].children.length, 5);
        manager.renderPcProgramsCatalog(output, 'MarkDown');
        assert.equal(output.children.length, 1);
        assert.equal(output.children[0].children[1].children[0].dataset.itemId, 'marktext');
        manager.renderPcProgramsCatalog(output, 'no-results-73bd');
        assert.equal(output.children.length, 1);
        assert.equal(output.children[0].textContent, 'No results found.');
        assert.equal(output.children[0].attributes.role, 'status');
    });
});

test('featured buttons download the exact stable assets; other programs keep their download', () => {
    fakeBrowser(({ manager, opened }) => {
        const panacea = ITEMS['pc-programs'].panacea;
        const card = manager.createPanaceaFeaturedCard(panacea);
        const buttons = descendants(card).filter(n => n.tagName === 'button');
        assert.match(buttons[0].attributes['aria-label'], /recommended/i);
        assert.match(buttons[1].attributes['aria-label'], /manual/i);
        buttons[0].click();
        buttons[1].click();
        assert.deepEqual(opened.map(row => row[0]), [panacea.installerUrl, panacea.url]);
        assert.ok(opened.every(row => row[1] === '_blank' && row[2] === 'noopener,noreferrer'));

        const app = ITEMS['pc-programs'].obsidian;
        const regular = manager.createSimpleFileCard(app, 'pc-programs');
        assert.ok(!regular.classList.contains('multi-download-card'));
        regular.children.at(-1).children.at(-1).click();
        assert.equal(opened[2][0], app.url);
    });
});

test('original Panacea asset is a real PNG and stays independent from white icon filter', () => {
    const bytes = readFileSync(new URL('../assets/panacea-icon.png', import.meta.url));
    assert.ok(bytes.length > 1000);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    const css = readFileSync(new URL('../css/sections.css', import.meta.url), 'utf8');
    assert.match(css, /\.panacea-featured-mark img[\s\S]*?filter:\s*none/);
    assert.match(css, /@media \(max-width: 480px\)/);
});

test('Choose preserves one ID and resets variant on deselection, reinclusion and Clear', () => {
    fakeBrowser(({ manager, ids, opened }) => {
        manager.renderSetupSelection();
        let card = ids.get('setupBuilderSelectionList').children[0];
        let { checkbox, install, portable } = controls(card);
        assert.equal(checkbox.checked, false);
        assert.equal(install.checked, true);
        assert.equal(portable.checked, false);
        assert.equal(checkbox.type, 'checkbox');
        assert.equal(install.name, portable.name);
        assert.equal(descendants(card).some(n => n.tagName === 'fieldset'), true);
        assert.equal(descendants(card).some(n => n.tagName === 'legend'), true);
        assert.ok(descendants(card).some(n => n.textContent === 'Manual download · Not a WinGet package'));
        assert.equal(ids.get('setupStep1Next').disabled, true);

        checkbox.checked = true; checkbox.dispatch('change');
        assert.deepEqual([...manager.selectedSetupItems], ['panacea']);
        assert.equal(manager.getPanaceaVariant(), 'install');
        assert.equal(ids.get('setupSelectionCount').textContent, '1 selected');
        assert.equal(ids.get('setupStep1Next').disabled, false);

        portable.checked = true; portable.dispatch('change');
        assert.equal(manager.getPanaceaVariant(), 'portable');
        assert.equal(manager.selectedSetupItems.size, 1);
        install.checked = true; install.dispatch('change');
        assert.equal(manager.getPanaceaVariant(), 'install');

        checkbox.checked = false; checkbox.dispatch('change');
        assert.equal(manager.selectedSetupItems.size, 0);
        assert.equal(manager.setupVariants.has('panacea'), false);

        // Choosing a radio also implicitly includes an excluded Panacea.
        portable.checked = true; portable.dispatch('change');
        assert.equal(manager.selectedSetupItems.size, 1);
        assert.equal(manager.getPanaceaVariant(), 'portable');
        assert.equal(checkbox.checked, true);
        checkbox.checked = false; checkbox.dispatch('change');
        checkbox.checked = true; checkbox.dispatch('change');
        assert.equal(manager.getPanaceaVariant(), 'install');

        manager.clearWindowsSetupSelection();
        assert.equal(manager.selectedSetupItems.size, 0);
        assert.equal(manager.setupVariants.size, 0);
        assert.equal(ids.get('setupSelectionCount').textContent, '0 selected');
        card = ids.get('setupBuilderSelectionList').children[0];
        ({ checkbox, install, portable } = controls(card));
        assert.equal(checkbox.checked, false);
        assert.equal(install.checked, true);
        assert.equal(opened.length, 0); // Choose never downloads.
    });
});

test('Review and Install keep one manual Panacea variant, including manual-only setup', () => {
    fakeBrowser(({ manager, ids, opened }) => {
        manager.setPanaceaIncluded(true);
        manager.setPanaceaVariant('portable');
        manager.setSetupStep(2);
        assert.equal(ids.get('setupAutomaticCount').textContent, '0');
        assert.equal(ids.get('setupManualCount').textContent, '1');
        assert.equal(ids.get('setupReviewTotal').textContent, '1 total · 0 auto · 1 manual');
        assert.deepEqual(ids.get('setupReviewManualList').children.map(n => n.textContent), ['Panacea — Portable']);
        manager.setSetupStep(1);
        const selected = controls(ids.get('setupBuilderSelectionList').children[0]);
        assert.equal(selected.checkbox.checked, true);
        assert.equal(selected.portable.checked, true);
        manager.setSetupStep(3);
        assert.equal(manager.generatedSetupScript, '');
        assert.ok(ids.get('setupAutomaticOutput').classList.contains('hidden'));
        assert.ok(!ids.get('setupNoAutomatic').classList.contains('hidden'));
        const rows = ids.get('setupManualDownloads').children;
        assert.equal(rows.length, 1);
        assert.equal(rows[0].children[0].textContent, 'Panacea — Portable');
        assert.equal(rows[0].children[1].textContent, 'Download');
        assert.equal(rows[0].children[1].attributes['aria-label'], 'Download Panacea — Portable');
        rows[0].children[1].click();
        assert.deepEqual(opened.map(row => row[0]), [ITEMS['pc-programs'].panacea.url]);
    });
});

test('mixed setup keeps WinGet separate and switches the sole Panacea download to Install', () => {
    fakeBrowser(({ manager, ids, opened }) => {
        manager.selectedSetupItems.add('google-chrome');
        manager.selectedSetupItems.add('bitwarden-desktop');
        manager.setPanaceaIncluded(true);
        manager.setPanaceaVariant('portable');
        manager.setPanaceaVariant('install');
        manager.setSetupStep(2);
        assert.equal(manager.getSelectedSetupItems().length, 3);
        assert.equal(ids.get('setupAutomaticCount').textContent, '1');
        assert.equal(ids.get('setupManualCount').textContent, '2');
        assert.deepEqual(ids.get('setupReviewManualList').children.map(n => n.textContent),
            ['Panacea — Install', 'Bitwarden Desktop']);
        manager.setSetupStep(3);
        assert.ok(!ids.get('setupAutomaticOutput').classList.contains('hidden'));
        assert.ok(ids.get('setupNoAutomatic').classList.contains('hidden'));
        assert.match(manager.generatedSetupScript, /Google\.Chrome/);
        assert.doesNotMatch(manager.generatedSetupScript, /panacea|PanaceaSetup|Panacea\.exe/i);
        const rows = ids.get('setupManualDownloads').children;
        assert.equal(rows.length, 2);
        assert.equal(rows[0].children[0].textContent, 'Panacea — Install');
        assert.equal(rows[1].children[0].textContent, 'Bitwarden Desktop');
        assert.equal(rows[0].children.length, 2);
        rows[0].children[1].click();
        rows[1].children[1].click();
        assert.deepEqual(opened.map(row => row[0]), [
            ITEMS['pc-programs'].panacea.installerUrl,
            ITEMS['pc-programs']['bitwarden-desktop'].url
        ]);
    });
});
