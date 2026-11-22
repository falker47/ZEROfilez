import { t } from './i18n.js';

/** Download variants for a catalog item. Normal items retain a single download. */
export function getDownloadChoices(item) {
    if (!item?.url) return [];
    if (item.linkType === 'website') {
        return [{ kind: 'website', label: t('download.officialWebsite'), url: item.url,
            ariaLabel: t('download.visitAria', { name: item.name }), hint: t('download.websiteHint') }];
    }
    if (!item.installerUrl) {
        return [{
            kind: 'default',
            label: t('download.label'),
            url: item.url,
            ariaLabel: t('download.aria', { name: item.name }),
            hint: t('download.label')
        }];
    }
    return [
        {
            kind: 'install',
            label: t('download.install'),
            url: item.installerUrl,
            ariaLabel: t('download.installAria', { name: item.name }),
            hint: t('download.installHint')
        },
        {
            kind: 'portable',
            label: t('download.portable'),
            url: item.url,
            ariaLabel: t('download.portableAria', { name: item.name }),
            hint: t('download.portableHint')
        }
    ];
}
