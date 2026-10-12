import assert from 'node:assert/strict';
import test from 'node:test';

import { ITEMS } from '../js/data.js';
import { ORDER } from '../js/array.js';
import { PC_PROGRAM_CATEGORIES, groupPcPrograms } from '../js/pc-categories.js';

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

test('Panacea belongs to Essentials in both catalog views', () => {
    const categories = PC_PROGRAM_CATEGORIES.map(group => group.label);
    assert.equal(categories.includes('Personal'), false);

    const essentials = groupPcPrograms(items).find(group => group.label === 'Essentials');
    assert.ok(essentials);
    assert.equal(essentials.items.some(item => item.id === 'panacea'), true);
    assert.equal(groupPcPrograms(items, 'panacea')[0].label, 'Essentials');
});

test('every downloadable PC program appears exactly once', () => {
    const foundIds = groupPcPrograms(items).flatMap(group => group.items.map(item => item.id));
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
    assert.deepEqual(groupPcPrograms(items, 'Communication')[0].items.map(item => item.name), ['Discord']);
});

test('new programs without a category remain visible', () => {
    const extra = { id: 'future-tool', name: 'Future Tool', description: 'Example', url: 'https://example.com' };
    const groups = groupPcPrograms([...items, extra]);
    assert.deepEqual(groups.at(-1), { label: 'Other', items: [extra] });
});
