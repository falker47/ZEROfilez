// Curated, opt-in preset for a fresh Windows installation.
// IDs must match entries in ITEMS['pc-programs']; no arbitrary installer input.
export const ZEROFILEZ_SELECTION_IDS = Object.freeze([
    'brave-browser',
    'discord',
    'notepad-plus-plus',
    '7-zip',
    'everything',
    'revo-uninstaller',
    'panacea'
]);

export function getZeroFilezSelection(programs) {
    const byId = new Map(programs.map(item => [item.id, item]));
    return ZEROFILEZ_SELECTION_IDS.map(id => byId.get(id)).filter(Boolean);
}

export function addZeroFilezSelection(currentIds, programs) {
    const selected = new Set(currentIds);
    for (const item of getZeroFilezSelection(programs)) {
        selected.add(item.id);
    }
    return selected;
}
