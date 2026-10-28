import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import { ORDER } from '../js/array.js';
import { PC_PROGRAM_CATEGORIES, getFeaturedPcProgram, groupPcPrograms } from '../js/pc-categories.js';

const items = Object.values(ITEMS['pc-programs']);
const alphabetically = names => [...names].sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true })
);

test('PC programs render with alphabetically sorted categories and names', () => {
    const categories = PC_PROGRAM_CATEGORIES.map(group => group.label);
    assert.deepEqual(categories, alphabetically(categories));
    const groups = groupPcPrograms(items);
    assert.deepEqual(groups.map(group => group.label), categories);
    for (const group of groups) {
        const names = group.items.map(item => item.name);
        assert.deepEqual(names, alphabetically(names), group.label);
    }
});

test('Panacea keeps Essentials search membership but has one distinct Featured placement', () => {
    assert.equal(PC_PROGRAM_CATEGORIES.find(group => group.label === 'Essentials').ids.includes('panacea'), true);
    const groups = groupPcPrograms(items);
    assert.equal(groups.find(group => group.label === 'Essentials').items.length, 5);
    assert.equal(groups.some(group => group.items.some(item => item.id === 'panacea')), false);
    assert.equal(getFeaturedPcProgram(items), ITEMS['pc-programs'].panacea);
    for (const query of ['Panacea', 'Featured', 'Essentials', 'cleanup', 'repair', 'maintenance']) {
        assert.equal(getFeaturedPcProgram(items, query)?.id, 'panacea', query);
    }
    assert.equal(getFeaturedPcProgram(items, 'unrelated-abc'), null);
    assert.deepEqual(groupPcPrograms(items, 'Featured'), []);
    assert.deepEqual(groupPcPrograms(items, 'panacea'), []);
    assert.equal(groupPcPrograms(items, 'Essentials')[0].items.length, 5);
});

test('every downloadable PC program appears exactly once', () => {
    const foundIds = [getFeaturedPcProgram(items)?.id, ...groupPcPrograms(items).flatMap(group => group.items.map(item => item.id))];
    assert.equal(foundIds.length, items.length);
    assert.deepEqual(new Set(foundIds), new Set(items.map(item => item.id)));
    assert.deepEqual(new Set(ORDER['pc-programs']), new Set(foundIds));
});

test('catalog search matches program names, categories and descriptions', () => {
    const groups = groupPcPrograms(items, 'chatgpt');
    assert.equal(groups.length, 1);
    assert.equal(groups[0].label, 'Development & AI');
    assert.deepEqual(groups[0].items.map(item => item.name), ['ChatGPT Desktop']);
    assert.deepEqual(groupPcPrograms(items, 'never-a-match-539f'), []);
    assert.deepEqual(groupPcPrograms(items, 'Communication')[0].items.map(item => item.name), ['Discord', 'Telegram Desktop', 'WhatsApp Desktop']);
});

test('new programs without a category remain visible', () => {
    const extra = { id: 'future-tool', name: 'Future Tool', description: 'Example', url: 'https://example.com' };
    const groups = groupPcPrograms([...items, extra]);
    assert.deepEqual(groups.at(-1), { label: 'Other', items: [extra] });
});

test('MarkText is listed under Utilities with a Windows setup package', () => {
    const marktext = ITEMS['pc-programs'].marktext;
    assert.equal(marktext.wingetId, 'MarkText.MarkText');
    assert.match(marktext.url, /marktext-win-x64-[\d.]+-setup\.exe$/);
    const utilities = groupPcPrograms(items).find(group => group.label === 'Utilities');
    assert.ok(utilities?.items.some(item => item.id === 'marktext'));
    assert.deepEqual(groupPcPrograms(items, 'markdown').flatMap(group => group.items.map(item => item.id)), ['marktext']);
});

test('Telegram and WhatsApp Desktop are in Communication and available in Windows Setup', () => {
    const telegram = ITEMS['pc-programs']['telegram-desktop'];
    const whatsapp = ITEMS['pc-programs']['whatsapp-desktop'];
    assert.equal(telegram.wingetId, 'Telegram.TelegramDesktop');
    assert.equal(whatsapp.wingetId, '9NKSQGP7F2NH');
    assert.equal(whatsapp.wingetSource, 'msstore');
    assert.ok(telegram.description && whatsapp.description);
    assert.deepEqual(
        groupPcPrograms(items, 'Communication')[0].items.map(item => item.id),
        ['discord', 'telegram-desktop', 'whatsapp-desktop']
    );
    assert.deepEqual(groupPcPrograms(items, 'telegram').flatMap(group => group.items.map(item => item.id)), ['telegram-desktop']);
    assert.deepEqual(groupPcPrograms(items, 'whatsapp').flatMap(group => group.items.map(item => item.id)), ['whatsapp-desktop']);
    assert.ok(ORDER['pc-programs'].includes(telegram.id) && ORDER['pc-programs'].includes(whatsapp.id));
});

test('Hermes Agent appears once in Development & AI with a direct installer and automatic setup', () => {
    const hermes = ITEMS['pc-programs']['hermes-agent'];
    assert.equal(hermes.name, 'Hermes Agent');
    assert.equal(hermes.url, 'https://hermes-assets.nousresearch.com/releases/win32/stable/stable.appinstaller');
    assert.equal(hermes.autoInstaller, 'hermes-appinstaller');
    assert.equal(hermes.icon, 'assets/icons/official-hermes-agent.png');
    assert.equal(Object.hasOwn(hermes, 'wingetId'), false);
    assert.ok(PC_PROGRAM_CATEGORIES.find(group => group.label === 'Development & AI').ids.includes(hermes.id));
    assert.ok(ORDER['pc-programs'].includes(hermes.id));
    assert.deepEqual(groupPcPrograms(items, 'Hermes').flatMap(group => group.items.map(item => item.id)), ['hermes-agent']);
});

test('PC Programs is the only initially active and visible main tab', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const activeTabs = [...html.matchAll(/<button class="([^"]+)" data-tab="([^"]+)">/g)]
        .filter(([, classes]) => classes.split(' ').includes('active'))
        .map(([, , id]) => id);
    const visibleSections = [...html.matchAll(/<section class="([^"]+)" id="([^"]+-tab)">/g)]
        .filter(([, classes]) => !classes.split(' ').includes('hidden'))
        .map(([, , id]) => id);
    assert.deepEqual(activeTabs, ['pc-programs']);
    assert.deepEqual(visibleSections, ['pc-programs-tab']);
});
