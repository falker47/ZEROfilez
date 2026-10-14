import assert from 'node:assert/strict';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import { StartupManager } from '../js/startup.js';

function element(tagName) {
    const node = {
        tagName, children: [], listeners: {}, attributes: {},
        className: '', textContent: '', dataset: {}, style: {},
        title: '', disabled: false, hidden: false,
        appendChild(child) { this.children.push(child); return child; },
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(name, listener) { this.listeners[name] = listener; },
        click() { this.listeners.click?.({ currentTarget: this }); }
    };
    Object.defineProperty(node, 'innerHTML', {
        get() { return this._html || ''; },
        set(value) { this._html = value; this.children = []; }
    });
    const applied = new Set();
    node.classList = {
        add(name) { applied.add(name); },
        toggle(name, condition) {
            if (condition) applied.add(name);
            else applied.delete(name);
        },
        contains(name) { return applied.has(name); }
    };
    return node;
}

function useFakeBrowser(callback) {
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    const manual = element('div');
    const section = element('section');
    const opened = [];
    globalThis.document = {
        createElement: element,
        getElementById(id) {
            return id === 'setupManualSection' ? section
                : id === 'setupManualDownloads' ? manual : null;
        }
    };
    globalThis.window = {
        open(...args) { opened.push(args); }
    };
    try {
        return callback({ manual, section, opened });
    } finally {
        if (originalDocument === undefined) delete globalThis.document;
        else globalThis.document = originalDocument;
        if (originalWindow === undefined) delete globalThis.window;
        else globalThis.window = originalWindow;
    }
}

test('Panacea catalog card exposes clear Install and Portable buttons wired to distinct links', () => {
    useFakeBrowser(({ opened }) => {
        const manager = Object.create(StartupManager.prototype);
        manager.resetButton = () => {};
        manager.createProgramInfoButton = () => element('button');
        const panacea = ITEMS['pc-programs'].panacea;
        const card = manager.createSimpleFileCard(panacea, 'pc-programs');
        assert.equal(card.classList.contains('multi-download-card'), true);
        assert.equal(card.children.length, 3);
        const actions = card.children[2];
        assert.equal(actions.children.length, 3);
        const [info, install, portable] = actions.children;
        assert.equal(info.tagName, 'button');
        assert.equal(install.textContent, 'Install');
        assert.equal(portable.textContent, 'Portable');
        assert.match(install.attributes['aria-label'], /recommended/i);
        assert.match(portable.attributes['aria-label'], /manual/i);
        install.click();
        portable.click();
        assert.deepEqual(opened, [
            [panacea.installerUrl, '_blank', 'noopener,noreferrer'],
            [panacea.url, '_blank', 'noopener,noreferrer']
        ]);
    });
});

test('PC Setup manual choices show both Panacea downloads without affecting other items', () => {
    useFakeBrowser(({ manual, section, opened }) => {
        const manager = Object.create(StartupManager.prototype);
        manager.resetButton = () => {};
        const panacea = ITEMS['pc-programs'].panacea;
        const manualItem = ITEMS['pc-programs']['bitwarden-desktop'];
        manager.renderManualDownloads([panacea, manualItem]);
        assert.equal(section.classList.contains('hidden'), false);
        assert.equal(manual.children.length, 2);

        const panaceaRow = manual.children[0];
        assert.equal(panaceaRow.children[0].textContent, 'Panacea');
        const actions = panaceaRow.children[1];
        assert.equal(actions.className, 'setup-manual-choices');
        assert.equal(actions.children.length, 2);
        assert.deepEqual(actions.children.map(button => button.textContent), ['Install', 'Portable']);

        const standardRow = manual.children[1];
        assert.equal(standardRow.children.length, 2);
        assert.equal(standardRow.children[1].attributes['aria-label'], 'Download Bitwarden Desktop');

        actions.children[0].click();
        actions.children[1].click();
        standardRow.children[1].click();
        assert.deepEqual(opened.map(row => row[0]), [
            panacea.installerUrl,
            panacea.url,
            manualItem.url
        ]);
    });
});

test('single-download program cards remain unchanged', () => {
    useFakeBrowser(({ opened }) => {
        const manager = Object.create(StartupManager.prototype);
        manager.resetButton = () => {};
        manager.createProgramInfoButton = () => element('button');
        const app = ITEMS['pc-programs'].obsidian;
        const card = manager.createSimpleFileCard(app, 'pc-programs');
        assert.equal(card.classList.contains('multi-download-card'), false);
        const actions = card.children.at(-1);
        assert.equal(actions.children.length, 2);
        actions.children[1].click();
        assert.equal(opened[0][0], app.url);
    });
});
