// The PC catalog and Windows Setup share one category taxonomy.
export const PC_PROGRAM_CATEGORIES = [
    { label: 'Browsers', ids: ['brave-browser', 'google-chrome', 'mozilla-firefox'] },
    { label: 'Communication', ids: ['discord'] },
    { label: 'Development & AI', ids: ['visual-studio-code', 'notepad-plus-plus', 'claude-desktop', 'chatgpt-desktop', 'antigravity'] },
    { label: 'Essentials', ids: ['7-zip', 'vlc-media-player', 'revo-uninstaller', 'libreoffice', 'winrar', 'panacea'] },
    { label: 'Utilities', ids: ['cheat-engine', 'sharex', 'wiztree', 'powertoys', 'patch-my-pc', 'everything', 'espanso', 'pcloud', 'obsidian', 'marktext', 'bitwarden-desktop'] }
];

const compareNames = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true });

export function groupPcPrograms(programs, query = '') {
    const catalog = new Map(programs.map(item => [item.id, item]));
    const assigned = new Set();
    const term = String(query).trim().toLowerCase();
    const matches = (item, label) =>
        !term ||
        label.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term);

    const groups = PC_PROGRAM_CATEGORIES.map(group => {
        const members = [];
        for (const id of group.ids) {
            if (assigned.has(id)) continue;
            assigned.add(id);
            const item = catalog.get(id);
            if (item && matches(item, group.label)) members.push(item);
        }
        return { label: group.label, items: members.sort(compareNames) };
    }).filter(group => group.items.length > 0);

    // A new program without an assigned category must remain discoverable.
    const others = programs
        .filter(item => !assigned.has(item.id) && matches(item, 'Other'))
        .sort(compareNames);
    if (others.length) groups.push({ label: 'Other', items: others });
    return groups;
}
