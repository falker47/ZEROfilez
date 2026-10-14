/** Download variants for a catalog item. Normal items retain a single download. */
export function getDownloadChoices(item) {
    if (!item?.url) return [];
    if (!item.installerUrl) {
        return [{
            kind: 'default',
            label: 'Download',
            url: item.url,
            ariaLabel: `Download ${item.name}`,
            hint: 'Download'
        }];
    }
    return [
        {
            kind: 'install',
            label: 'Install',
            url: item.installerUrl,
            ariaLabel: `Install ${item.name} (recommended; enables future guided updates)`,
            hint: 'Recommended: Windows installer with Start Menu shortcut and guided future updates'
        },
        {
            kind: 'portable',
            label: 'Portable',
            url: item.url,
            ariaLabel: `Download ${item.name} portable (no installation; future updates are manual)`,
            hint: 'Portable EXE: no installation; future updates require manual download'
        }
    ];
}
