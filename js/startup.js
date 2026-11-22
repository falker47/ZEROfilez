import { ITEMS } from './data.js';
import { ORDER } from './array.js';
import { ICONS, isImageIcon } from './icons.js';
import { generateCommandSetup, isAutomaticSetupItem } from './windows-setup.js';
import { getFeaturedPcProgram, groupPcPrograms } from './pc-categories.js';
import { addZeroFilezSelection, getZeroFilezSelection } from './pc-selection.js';
import { getDownloadChoices } from './download-options.js';
import { categoryLabel, itemDescription, itemName, itemSubtext, t } from './i18n.js';

export class StartupManager {
    constructor() {
        this.setupSelectionMode = false;
        this.setupBuilderOpen = false;
        this.setupStep = 1;
        this.selectedSetupItems = new Set();
        this.setupVariants = new Map();
        this.generatedSetupScript = '';
        this.programInfoPopover = null;
        this.programInfoButton = null;
        this.programInfoPinned = false;
        this.data = this.buildData();
        this.initialize();
    }

    buildData() {
        const builtData = {};
        for (const [category, ids] of Object.entries(ORDER)) {
            if (ITEMS[category]) {
                builtData[category] = ids.map(id => ITEMS[category][id]).filter(item => item !== undefined);
            } else {
                builtData[category] = [];
            }
        }
        return builtData;
    }
    initialize() {
        this.initializeTabs();
        this.renderAllSections();
        this.initializeSearch();
        this.initializeWindowsSetup();
        this.initializeProgramInfoPopover();
    }

    // Re-render everything built in JavaScript, keeping searches, selections and the open step.
    refreshLanguage() {
        this.hideProgramInfoPopover();
        this.renderAllSections();
        for (const [inputId, dataKey, containerId] of [
            ['emulationSearchInput', 'emulation', 'emulation-list'],
            ['apkSearchInput', 'apk-files', 'apk-files-list']
        ]) {
            const query = document.getElementById(inputId)?.value.toLowerCase() || '';
            if (query) this.filterSection(dataKey, containerId, query);
        }
        if (this.setupBuilderOpen) {
            this.setSetupStep(this.setupStep);
        } else {
            this.renderSetupSelection();
            this.updateSetupSelectionCount();
        }
    }

    initializeProgramInfoPopover() {
        const popover = document.createElement('div');
        popover.id = 'programInfoPopover';
        popover.className = 'program-info-popover';
        popover.setAttribute('role', 'tooltip');
        popover.hidden = true;
        document.body.appendChild(popover);
        this.programInfoPopover = popover;

        document.addEventListener('pointerdown', (event) => {
            if (!this.programInfoPinned || !this.programInfoButton) return;
            if (!this.programInfoButton.contains(event.target)) {
                this.hideProgramInfoPopover();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideProgramInfoPopover();
            }
        });

        document.addEventListener('scroll', () => this.hideProgramInfoPopover(), true);
        window.addEventListener('resize', () => this.hideProgramInfoPopover());
    }

    showProgramInfoPopover(button, pin = false) {
        if (!this.programInfoPopover || !button?.dataset.description) return;

        if (this.programInfoButton && this.programInfoButton !== button) {
            this.programInfoButton.setAttribute('aria-expanded', 'false');
            this.programInfoButton.removeAttribute('aria-describedby');
        }

        this.programInfoButton = button;
        this.programInfoPinned = pin;
        this.programInfoPopover.textContent = button.dataset.description;
        this.programInfoPopover.hidden = false;
        this.programInfoPopover.style.visibility = 'hidden';
        button.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-describedby', this.programInfoPopover.id);

        const buttonRect = button.getBoundingClientRect();
        const popoverRect = this.programInfoPopover.getBoundingClientRect();
        const edge = 12;
        const gap = 8;

        let left = buttonRect.left + (buttonRect.width - popoverRect.width) / 2;
        left = Math.max(edge, Math.min(left, window.innerWidth - popoverRect.width - edge));

        let top = buttonRect.top - popoverRect.height - gap;
        if (top < edge) {
            top = buttonRect.bottom + gap;
        }

        this.programInfoPopover.style.left = `${Math.round(left)}px`;
        this.programInfoPopover.style.top = `${Math.round(top)}px`;
        this.programInfoPopover.style.visibility = 'visible';
    }

    hideProgramInfoPopover() {
        if (!this.programInfoPopover) return;

        if (this.programInfoButton) {
            this.programInfoButton.setAttribute('aria-expanded', 'false');
            this.programInfoButton.removeAttribute('aria-describedby');
        }

        this.programInfoPopover.hidden = true;
        this.programInfoPopover.style.visibility = '';
        this.programInfoButton = null;
        this.programInfoPinned = false;
    }

    createProgramInfoButton(item) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'program-info-btn icon-only-btn';
        button.dataset.description = itemDescription(item);
        button.setAttribute('aria-label', t('catalog.about', { name: item.name }));
        button.setAttribute('aria-expanded', 'false');
        button.innerHTML = `<img src="${ICONS.info}" alt="" aria-hidden="true">`;

        button.addEventListener('mouseenter', () => {
            if (!this.programInfoPinned) {
                this.showProgramInfoPopover(button);
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!this.programInfoPinned) {
                this.hideProgramInfoPopover();
            }
        });

        button.addEventListener('focus', () => {
            if (!this.programInfoPinned) {
                this.showProgramInfoPopover(button);
            }
        });

        button.addEventListener('blur', () => {
            if (!this.programInfoPinned) {
                this.hideProgramInfoPopover();
            }
        });

        button.addEventListener('click', (event) => {
            event.stopPropagation();

            if (this.programInfoPinned && this.programInfoButton === button) {
                this.hideProgramInfoPopover();
            } else {
                this.showProgramInfoPopover(button, true);
            }
        });

        return button;
    }

    initializeWindowsSetup() {
        const startButton = document.getElementById('startWindowsSetup');
        if (!startButton) return;

        startButton.addEventListener('click', () => this.openWindowsSetupBuilder());
        document.getElementById('exitWindowsSetup')?.addEventListener('click', () => this.closeWindowsSetupBuilder());
        document.getElementById('finishWindowsSetup')?.addEventListener('click', () => this.closeWindowsSetupBuilder());
        document.getElementById('clearSetupSelection')?.addEventListener('click', () => this.clearWindowsSetupSelection());
        document.getElementById('applyZeroFilezSelection')?.addEventListener('click', () => this.applyZeroFilezSelection());
        document.getElementById('setupStep1Next')?.addEventListener('click', () => this.setSetupStep(2));
        document.getElementById('setupStep2Back')?.addEventListener('click', () => this.setSetupStep(1));
        document.getElementById('setupStep2Next')?.addEventListener('click', () => this.setSetupStep(3));
        document.getElementById('setupStep3Back')?.addEventListener('click', () => this.setSetupStep(2));
        document.getElementById('copySetupScript')?.addEventListener('click', () => this.copyGeneratedSetup());
        document.getElementById('downloadSetupScript')?.addEventListener('click', () => this.downloadGeneratedSetup());

        this.renderSetupSelection();
        this.updateSetupSelectionCount();
    }

    openWindowsSetupBuilder() {
        this.setupBuilderOpen = true;

        document.getElementById('pcProgramsToolbar')?.classList.add('hidden');
        document.getElementById('pc-programs-list')?.classList.add('hidden');
        document.getElementById('windowsSetupBuilder')?.classList.remove('hidden');

        this.setSetupStep(1);
    }

    closeWindowsSetupBuilder() {
        this.setupBuilderOpen = false;

        document.getElementById('pcProgramsToolbar')?.classList.remove('hidden');
        document.getElementById('pc-programs-list')?.classList.remove('hidden');
        document.getElementById('windowsSetupBuilder')?.classList.add('hidden');

        this.setWindowsSetupStatus('');
    }

    applyZeroFilezSelection() {
        const programs = this.data['pc-programs'] || [];
        const recommended = getZeroFilezSelection(programs);
        if (!recommended.length) return;

        // The first inclusion of Panacea must use its recommended installer.
        // Preserve a previously selected Portable variant if the user chose it.
        const addPanaceaInstaller = recommended.some(item => item.id === 'panacea')
            && !this.selectedSetupItems.has('panacea');

        // Add missing recommendations without removing manual choices.
        this.selectedSetupItems = addZeroFilezSelection(this.selectedSetupItems, programs);
        if (addPanaceaInstaller) this.setupVariants.set('panacea', 'install');
        this.generatedSetupScript = '';
        this.renderSetupSelection();
        this.updateSetupSelectionCount();
        this.setWindowsSetupStatus('');
    }

    setSetupStep(step) {
        this.setupStep = step;

        document.querySelectorAll('#windowsSetupBuilder [data-setup-step]').forEach(element => {
            element.classList.toggle('hidden', Number(element.dataset.setupStep) !== step);
        });

        document.querySelectorAll('#windowsSetupBuilder [data-step-indicator]').forEach(element => {
            const indicatorStep = Number(element.dataset.stepIndicator);
            element.classList.toggle('active', indicatorStep === step);
            element.classList.toggle('completed', indicatorStep < step);
        });

        if (step === 1) {
            this.renderSetupSelection();
            this.updateSetupSelectionCount();
        } else if (step === 2) {
            this.renderSetupReview();
        } else if (step === 3) {
            this.prepareWindowsSetup();
        }
    }

    getSelectedSetupItems() {
        const programs = this.data['pc-programs'] || [];
        const featured = getFeaturedPcProgram(programs);
        return [featured, ...groupPcPrograms(programs).flatMap(group => group.items)]
            .filter(item => item && this.selectedSetupItems.has(item.id));
    }

    getSetupBreakdown() {
        const all = this.getSelectedSetupItems();
        return {
            all,
            automatic: all.filter(isAutomaticSetupItem),
            manual: all.filter(item => !isAutomaticSetupItem(item))
        };
    }


    getPanaceaVariant() {
        return this.setupVariants?.get('panacea') === 'portable' ? 'portable' : 'install';
    }

    setPanaceaIncluded(included) {
        if (included) {
            if (!this.selectedSetupItems.has('panacea')) {
                // A new inclusion always resets to the recommended installer.
                this.setupVariants ??= new Map();
                this.setupVariants.set('panacea', 'install');
            }
            this.selectedSetupItems.add('panacea');
        } else {
            this.selectedSetupItems.delete('panacea');
            this.setupVariants?.delete('panacea');
        }
        this.generatedSetupScript = '';
        this.updateSetupSelectionCount();
    }

    setPanaceaVariant(kind) {
        if (kind !== 'install' && kind !== 'portable') {
            throw new Error('Unsupported Panacea download variant.');
        }
        this.setPanaceaIncluded(true);
        this.setupVariants ??= new Map();
        this.setupVariants.set('panacea', kind);
    }

    getSetupItemLabel(item) {
        if (item.id !== 'panacea') return item.name;
        const variant = this.getPanaceaVariant();
        return `${item.name} — ${variant === 'install' ? t('download.install') : t('download.portable')}`;
    }

    createPanaceaFeaturedCard(item, mode = 'catalog') {
        const setup = mode === 'setup';
        const card = document.createElement('section');
        card.className = 'panacea-featured-card' + (setup ? ' panacea-setup-featured' : '');
        const titleId = setup ? 'setup-panacea-title' : 'catalog-panacea-title';
        card.setAttribute('aria-labelledby', titleId);

        const mark = document.createElement('div');
        mark.className = 'panacea-featured-mark';
        const logo = document.createElement('img');
        logo.src = 'assets/panacea-icon.png';
        logo.alt = '';
        logo.width = setup ? 44 : 56;
        logo.height = setup ? 44 : 56;
        // Do not apply file-icon-img: its global filter would turn the chalice white.
        mark.appendChild(logo);

        const copy = document.createElement('div');
        copy.className = 'panacea-featured-copy';
        const eyebrow = document.createElement('span');
        eyebrow.className = 'panacea-featured-eyebrow';
        eyebrow.textContent = t('featured.eyebrow');
        const title = document.createElement('h3');
        title.id = titleId;
        title.textContent = item.name;
        const tagline = document.createElement('p');
        tagline.className = 'panacea-featured-tagline';
        tagline.textContent = t('featured.tagline');
        const description = document.createElement('p');
        description.className = 'panacea-featured-description';
        description.textContent = t('featured.description');
        copy.appendChild(eyebrow);
        copy.appendChild(title);
        copy.appendChild(tagline);
        copy.appendChild(description);
        card.appendChild(mark);
        card.appendChild(copy);

        if (!setup) {
            const actions = document.createElement('div');
            actions.className = 'panacea-featured-actions';
            for (const choice of getDownloadChoices(item)) {
                actions.appendChild(this.createDownloadChoiceButton(item, choice));
            }
            const details = document.createElement('a');
            details.href = 'https://github.com/falker47/Panacea';
            details.target = '_blank';
            details.rel = 'noopener noreferrer';
            details.className = 'panacea-details-link';
            details.textContent = t('featured.details');
            details.setAttribute('aria-label', t('featured.detailsAria'));
            actions.appendChild(details);
            card.appendChild(actions);
            return card;
        }

        const controls = document.createElement('div');
        controls.className = 'panacea-featured-controls';
        const include = document.createElement('label');
        include.className = 'panacea-include';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        const includeText = document.createElement('span');
        includeText.textContent = t('featured.include');
        include.appendChild(checkbox);
        include.appendChild(includeText);

        const variantGroup = document.createElement('fieldset');
        variantGroup.className = 'panacea-variant-group';
        const legend = document.createElement('legend');
        legend.textContent = t('featured.package');
        variantGroup.appendChild(legend);
        const radios = [];
        for (const choice of getDownloadChoices(item)) {
            const label = document.createElement('label');
            label.className = 'panacea-variant-label';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'panacea-variant';
            radio.value = choice.kind;
            const labelText = document.createElement('span');
            labelText.textContent = choice.kind === 'install' ? t('featured.installRecommended') : t('download.portable');
            label.appendChild(radio);
            label.appendChild(labelText);
            variantGroup.appendChild(label);
            radios.push(radio);
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                this.setPanaceaVariant(choice.kind);
                syncState();
            });
        }

        const note = document.createElement('p');
        note.className = 'panacea-manual-note';
        note.textContent = t('featured.manualNote');
        controls.appendChild(include);
        controls.appendChild(variantGroup);
        controls.appendChild(note);
        card.appendChild(controls);

        const syncState = () => {
            const selected = this.selectedSetupItems.has('panacea');
            card.classList.toggle('selected', selected);
            checkbox.checked = selected;
            for (const radio of radios) {
                radio.checked = radio.value === this.getPanaceaVariant();
            }
        };
        checkbox.addEventListener('change', () => {
            this.setPanaceaIncluded(checkbox.checked);
            syncState();
        });
        syncState();
        return card;
    }

    renderSetupSelection() {
        const container = document.getElementById('setupBuilderSelectionList');
        if (!container) return;

        const programs = this.data['pc-programs'] || [];
        const groups = groupPcPrograms(programs);
        container.innerHTML = '';

        const featured = getFeaturedPcProgram(programs);
        if (featured) container.appendChild(this.createPanaceaFeaturedCard(featured, 'setup'));

        for (const group of groups) {
            const items = group.items;

            const category = document.createElement('div');
            category.className = 'setup-category';

            const heading = document.createElement('div');
            heading.className = 'setup-category-heading';

            const title = document.createElement('h4');
            title.textContent = categoryLabel(group.label);

            const count = document.createElement('span');
            count.textContent = t('catalog.programCount', { count: items.length });

            heading.appendChild(title);
            heading.appendChild(count);
            category.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'setup-program-grid';

            for (const item of items) {
                grid.appendChild(this.createSetupProgramCard(item));
            }

            category.appendChild(grid);
            container.appendChild(category);
        }
    }

    createSetupProgramCard(item) {
        const card = document.createElement('label');
        card.className = 'setup-program-card';
        card.classList.toggle('selected', this.selectedSetupItems.has(item.id));

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.selectedSetupItems.has(item.id);
        checkbox.setAttribute('aria-label', t('setup.selectItem', { name: item.name }));

        const iconDiv = document.createElement('div');
        iconDiv.className = 'setup-program-icon';

        if (isImageIcon(item.icon)) {
            const img = document.createElement('img');
            img.src = item.icon;
            img.alt = '';
            img.className = 'file-icon-img';
            img.onerror = () => {
                iconDiv.textContent = '▣';
            };
            iconDiv.appendChild(img);
        } else if (item.icon) {
            iconDiv.innerHTML = item.icon;
        } else {
            iconDiv.textContent = '▣';
        }

        const copy = document.createElement('div');
        copy.className = 'setup-program-copy';

        const name = document.createElement('strong');
        name.textContent = item.name;

        copy.appendChild(name);

        const badge = document.createElement('span');
        badge.className = `setup-type-badge ${isAutomaticSetupItem(item) ? 'automatic' : 'manual'}`;
        badge.textContent = isAutomaticSetupItem(item) ? t('setup.badgeAuto') : t('setup.badgeManual');

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                this.selectedSetupItems.add(item.id);
            } else {
                this.selectedSetupItems.delete(item.id);
            }
            card.classList.toggle('selected', checkbox.checked);
            this.generatedSetupScript = '';
            this.updateSetupSelectionCount();
        });

        card.appendChild(checkbox);
        card.appendChild(iconDiv);
        card.appendChild(copy);
        card.appendChild(badge);
        return card;
    }

    updateSetupSelectionCount() {
        const count = this.selectedSetupItems.size;
        const countLabel = document.getElementById('setupSelectionCount');
        const nextButton = document.getElementById('setupStep1Next');
        const clearButton = document.getElementById('clearSetupSelection');

        if (countLabel) countLabel.textContent = t('setup.selectedCount', { count });
        if (nextButton) nextButton.disabled = count === 0;
        if (clearButton) clearButton.disabled = count === 0;

        const recommended = getZeroFilezSelection(this.data['pc-programs'] || []);
        const included = recommended.filter(item => this.selectedSetupItems.has(item.id)).length;
        const remaining = recommended.length - included;
        const presetButton = document.getElementById('applyZeroFilezSelection');
        const presetAction = document.getElementById('zeroFilezSelectionAction');
        const presetStatus = document.getElementById('zeroFilezSelectionStatus');
        if (presetButton) {
            presetButton.disabled = remaining === 0;
            presetButton.setAttribute('aria-label', remaining === 0
                ? t('setup.presetApplied')
                : t('setup.presetAdd', { count: remaining }));
        }
        if (presetAction) {
            presetAction.textContent = recommended.length === 0
                ? t('setup.presetUnavailable')
                : remaining === 0 ? t('setup.presetSelected') : t('setup.presetSelect', { count: remaining });
        }
        if (presetStatus) {
            presetStatus.textContent = recommended.length === 0
                ? t('setup.presetNone')
                : remaining === 0 ? t('setup.presetAllSelected', { count: recommended.length })
                    : t('setup.presetPartial', { total: recommended.length, included });
        }
    }

    clearWindowsSetupSelection() {
        this.selectedSetupItems.clear();
        this.setupVariants?.clear();
        this.generatedSetupScript = '';
        this.renderSetupSelection();
        this.updateSetupSelectionCount();
        this.setWindowsSetupStatus('');
    }

    renderSetupReview() {
        const { all, automatic, manual } = this.getSetupBreakdown();

        const automaticCount = document.getElementById('setupAutomaticCount');
        const manualCount = document.getElementById('setupManualCount');
        const total = document.getElementById('setupReviewTotal');

        if (automaticCount) automaticCount.textContent = String(automatic.length);
        if (manualCount) manualCount.textContent = String(manual.length);
        if (total) total.textContent = t('setup.reviewTotal', { total: all.length, automatic: automatic.length, manual: manual.length });

        this.renderSetupNameList('setupReviewAutomaticList', automatic, t('setup.none'));
        this.renderSetupNameList('setupReviewManualList', manual, t('setup.none'));
    }

    renderSetupNameList(containerId, items, emptyMessage) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        if (items.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'setup-review-empty';
            empty.textContent = emptyMessage;
            container.appendChild(empty);
            return;
        }

        for (const item of items) {
            const row = document.createElement('span');
            row.textContent = this.getSetupItemLabel(item);
            container.appendChild(row);
        }
    }

    prepareWindowsSetup() {
        const { all, automatic, manual } = this.getSetupBreakdown();
        const summary = document.getElementById('setupReadySummary');
        const automaticOutput = document.getElementById('setupAutomaticOutput');
        const noAutomatic = document.getElementById('setupNoAutomatic');
        const preview = document.getElementById('setupScriptPreview');

        if (summary) {
            summary.textContent = automatic.length > 0
                ? t('setup.summaryMixed', { automatic: automatic.length, manual: manual.length })
                : t('setup.summaryManual', { count: all.length });
        }

        this.generatedSetupScript = '';
        this.setWindowsSetupStatus('');

        if (automatic.length > 0) {
            try {
                this.generatedSetupScript = generateCommandSetup(automatic);
                if (preview) preview.value = this.generatedSetupScript;
                automaticOutput?.classList.remove('hidden');
                noAutomatic?.classList.add('hidden');
            } catch (error) {
                automaticOutput?.classList.add('hidden');
                noAutomatic?.classList.remove('hidden');
                this.setWindowsSetupStatus(error.message);
            }
        } else {
            if (preview) preview.value = '';
            automaticOutput?.classList.add('hidden');
            noAutomatic?.classList.remove('hidden');
        }

        this.renderManualDownloads(manual);
    }

    createDownloadChoiceButton(item, choice) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `download-btn pc-btn download-choice download-choice--${choice.kind}`;
        button.textContent = choice.label;
        button.title = choice.hint;
        button.setAttribute('aria-label', choice.ariaLabel);
        button.disabled = !choice.url;
        button.addEventListener('click', event =>
            this.handleSimpleDownload(event.currentTarget, item, choice.url));
        return button;
    }

    renderManualDownloads(items) {
        const section = document.getElementById('setupManualSection');
        const container = document.getElementById('setupManualDownloads');
        if (!section || !container) return;

        container.innerHTML = '';
        section.classList.toggle('hidden', items.length === 0);

        for (const item of items) {
            const row = document.createElement('div');
            row.className = 'setup-manual-row';

            const name = document.createElement('strong');
            name.textContent = this.getSetupItemLabel(item);

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ui-icon-button';
            button.innerHTML = `<img src="${item.linkType === 'website' ? ICONS.web : ICONS.download}" alt="">`;
            button.setAttribute('aria-label', item.linkType === 'website' ? t('download.visitAria', { name: item.name }) : t('download.aria', { name: item.name }));
            button.title = item.linkType === 'website' ? t('download.officialPage') : t('download.label');
            button.disabled = !item.url;
            button.addEventListener('click', (event) => this.handleSimpleDownload(event.currentTarget, item));

            row.appendChild(name);
            const choices = getDownloadChoices(item);
            if (item.id === 'panacea') {
                const choice = choices.find(option => option.kind === this.getPanaceaVariant());
                if (choice) {
                    const download = this.createDownloadChoiceButton(item, choice);
                    download.textContent = t('download.label');
                    download.classList.add('setup-panacea-download');
                    download.setAttribute('aria-label', t('download.aria', { name: this.getSetupItemLabel(item) }));
                    row.appendChild(download);
                }
            } else {
                row.appendChild(button);
            }
            container.appendChild(row);
        }
    }

    async copyGeneratedSetup() {
        if (!this.generatedSetupScript) return;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(this.generatedSetupScript);
            } else {
                const preview = document.getElementById('setupScriptPreview');
                if (!preview) throw new Error('Setup preview unavailable.');
                preview.focus();
                preview.select();
                if (!document.execCommand('copy')) {
                    throw new Error('Copy command was rejected.');
                }
            }
            this.setWindowsSetupStatus(t('setup.copied'));
        } catch {
            this.setWindowsSetupStatus(t('setup.copyFailed'));
        }
    }

    downloadGeneratedSetup() {
        if (!this.generatedSetupScript) return;

        const blob = new Blob([this.generatedSetupScript], {
            type: 'text/plain;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ZEROfilez-Windows-Setup.cmd';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        this.setWindowsSetupStatus(t('setup.downloaded'));
    }

    setWindowsSetupStatus(message) {
        const status = document.getElementById('windowsSetupStatus');
        if (status) status.textContent = message;
    }

    initializeTabs() {
        const mainTabButtons = document.querySelectorAll('.main-tab-btn');
        mainTabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchMainTab(tabId);
            });
        });
    }

    initializeSearch() {
        this.setupSearchListener('pcSearchInput', 'pc-programs', 'pc-programs-list');
        this.setupSearchListener('apkSearchInput', 'apk-files', 'apk-files-list');
        this.setupSearchListener('emulationSearchInput', 'emulation', 'emulation-list');
    }

    setupSearchListener(inputId, dataKey, containerId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.filterSection(dataKey, containerId, query);
        });
    }

    switchMainTab(tabId) {
        const tabButtons = document.querySelectorAll('.main-tab-btn');
        const tabSections = document.querySelectorAll('.downloads-section');

        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        tabSections.forEach(section => {
            const isTarget = section.id === `${tabId}-tab`;
            section.classList.toggle('hidden', !isTarget);

            if (isTarget) {
                // Fix for empty APK section: check if grid is populated
                const grid = section.querySelector('.files-grid, #pc-programs-list, #apk-files-list, #emulators-list');
                // Use the ID inside the section or the section itself if it contains the list directly
                const listContainerId = section.querySelector('[id$="-list"]')?.id;

                if (listContainerId && (!grid || grid.children.length === 0)) {
                    // Map list ID back to data key
                    const validKeys = ['emulation', 'pc-programs', 'apk-files'];
                    const dataKey = validKeys.find(key => listContainerId.startsWith(key));

                    if (dataKey) {
                        if (dataKey === 'emulation') {
                            this.renderEmulationSection(dataKey, listContainerId);
                        } else {
                            this.renderSearchableSection(dataKey, listContainerId);
                        }
                    }
                }
            }
        });
    }

    renderAllSections() {
        this.renderEmulationSection('emulation', 'emulation-list');
        this.renderSearchableSection('pc-programs', 'pc-programs-list');
        this.renderSearchableSection('apk-files', 'apk-files-list');
    }

    renderEmulationSection(dataKey, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = this.data[dataKey] || [];

        if (items.length === 0) {
            this.renderEmptyState(container, dataKey);
            return;
        }

        container.innerHTML = '<div class="files-grid"></div>';
        const grid = container.querySelector('.files-grid');

        // Use renderGridItems logic instead of manual loop to support filtering consistency if needed,
        // but Emulation cards are special. So we keep using createEmulatorCard here.
        // To support search, we might need to use renderGridItems with a callback?
        // Let's stick to simple rendering here, filtering is handled by filterSection
        items.forEach(item => {
            grid.appendChild(this.createEmulatorCard(item));
        });
    }

    renderSearchableSection(dataKey, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (dataKey === 'pc-programs') {
            this.renderPcProgramsCatalog(container, document.getElementById('pcSearchInput')?.value || '');
            return;
        }

        const items = this.data[dataKey] || [];
        if (items.length === 0) {
            this.renderEmptyState(container, dataKey);
            return;
        }

        container.innerHTML = '<div class="files-grid"></div>';
        this.renderGridItems(container.querySelector('.files-grid'), items, dataKey);
    }

    renderPcProgramsCatalog(container, query = '') {
        const programs = this.data['pc-programs'] || [];
        const featured = getFeaturedPcProgram(programs, query);
        const groups = groupPcPrograms(programs, query);
        container.innerHTML = '';

        if (featured) container.appendChild(this.createPanaceaFeaturedCard(featured));

        if (!featured && groups.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'no-results';
            empty.setAttribute('role', 'status');
            empty.textContent = t('search.noResults');
            container.appendChild(empty);
            return;
        }

        for (const group of groups) {
            const category = document.createElement('div');
            category.className = 'pc-program-category';
            category.setAttribute('role', 'group');

            const headingRow = document.createElement('div');
            headingRow.className = 'pc-program-category-heading';

            const title = document.createElement('h3');
            title.id = `pc-category-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            title.textContent = categoryLabel(group.label);
            category.setAttribute('aria-labelledby', title.id);

            const count = document.createElement('span');
            count.textContent = t('catalog.programCount', { count: group.items.length });

            headingRow.appendChild(title);
            headingRow.appendChild(count);
            category.appendChild(headingRow);

            const grid = document.createElement('div');
            grid.className = 'files-grid pc-program-grid';
            for (const item of group.items) {
                grid.appendChild(this.createSimpleFileCard(item, 'pc-programs'));
            }

            category.appendChild(grid);
            container.appendChild(category);
        }
    }

    filterSection(dataKey, containerId, query) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (dataKey === 'pc-programs') {
            this.renderPcProgramsCatalog(container, query);
            container.scrollTop = 0;
            return;
        }

        const grid = container.querySelector('.files-grid');
        if (!grid) return;

        const items = this.data[dataKey] || [];
        const filteredItems = items.filter(item =>
            [item.name, itemName(item), item.subtext || '', itemSubtext(item)]
                .some(value => value.toLowerCase().includes(query)));
        this.renderGridItems(grid, filteredItems, dataKey);
    }

    renderGridItems(container, items, dataKey) {
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<div class="no-results" style="grid-column: 1 / -1; text-align: center; color: #a0a0a0; padding: 20px;"></div>';
            container.firstElementChild?.append(t('search.noResults'));
            return;
        }

        items.forEach(item => {
            if (dataKey === 'emulation') {
                container.appendChild(this.createEmulatorCard(item));
            } else {
                container.appendChild(this.createSimpleFileCard(item, dataKey));
            }
        });
    }

    renderEmptyState(container, dataKey) {
        container.innerHTML = `
            <div class="coming-soon-placeholder">
                <div class="coming-soon-icon">🚧</div>
                <h2>${t('empty.title')}</h2>
                <p>${t('empty.body', { section: dataKey.replace('-', ' ').toUpperCase() })}</p>
            </div>`;
    }

    // Fallback chain configuration
    getFallbackChain(category) {
        const chain = {
            'emulation': [ICONS.emulationTab, `<img src="${ICONS.emulationTab}" class="file-icon-img" alt="Emulation">`],
            'pc-programs': [ICONS.laptop, `<img src="${ICONS.laptop}" class="file-icon-img" alt="PC">`],
            'apk-files': [ICONS.android, `<img src="${ICONS.android}" class="file-icon-img" alt="Android">`]
        };
        return chain[category] || [null, '📂'];
    }

    createEmulatorCard(item) {
        const card = document.createElement('div');
        card.className = 'file-card';

        const subtext = itemSubtext(item);
        const subtextHtml = subtext ? subtext.split('\n').map(line => `<p>${line}</p>`).join('') : '';

        card.innerHTML = `
            <div class="file-icon"></div>
            <div class="file-info">
                <h3>${itemName(item)}</h3>
                ${subtextHtml}
            </div>
            <div class="dual-buttons">
                ${item.pc ? this.createButtonHtml(item, 'pc') : ''}
                ${item.web ? this.createButtonHtml(item, 'web') : ''}
                ${item.android ? this.createButtonHtml(item, 'android') : ''}
            </div>
        `;

        const iconContainer = card.querySelector('.file-icon');
        if (isImageIcon(item.icon)) {
            const [fallbackImg, fallbackEmoji] = this.getFallbackChain('emulation');

            const img = document.createElement('img');
            img.src = item.icon;
            img.alt = '';
            img.className = 'file-icon-img';

            img.onerror = function () {
                this.onerror = null;
                this.src = fallbackImg;
                this.onerror = function () {
                    const temp = document.createElement('div');
                    temp.innerHTML = fallbackEmoji;
                    if (temp.firstElementChild) {
                        this.replaceWith(temp.firstElementChild);
                    } else {
                        this.outerHTML = fallbackEmoji;
                    }
                };
            };
            iconContainer.appendChild(img);

            if (isImageIcon(item.secondaryIcon)) {
                const secondaryIcon = document.createElement('img');
                secondaryIcon.src = item.secondaryIcon;
                secondaryIcon.alt = '';
                secondaryIcon.className = 'file-icon-img';
                secondaryIcon.addEventListener('error', () => {
                    secondaryIcon.remove();
                    iconContainer.classList.remove('file-icon--pair');
                }, { once: true });
                iconContainer.classList.add('file-icon--pair');
                iconContainer.appendChild(secondaryIcon);
            }
        } else {
            iconContainer.innerHTML = item.icon || `<img src="${ICONS.emulationTab}" class="file-icon-img" alt="Emulation">`;
        }

        card.querySelectorAll('.download-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => this.handleDownload(e.currentTarget, item));
            }
        });

        return card;
    }

    createSimpleFileCard(item, dataKey) {
        const card = document.createElement('div');
        card.className = 'file-card';

        const type = dataKey === 'apk-files' ? 'android' : 'pc';
        const canSelectForSetup = dataKey === 'pc-programs' && isAutomaticSetupItem(item);
        let setupSelector = null;

        if (canSelectForSetup) {
            setupSelector = document.createElement('label');
            setupSelector.className = 'setup-selector';
            setupSelector.hidden = !this.setupSelectionMode;
            setupSelector.title = t('catalog.selectForSetup', { name: item.name });

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.selectedSetupItems.has(item.id);
            checkbox.setAttribute('aria-label', t('catalog.selectForSetup', { name: item.name }));

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.selectedSetupItems.add(item.id);
                } else {
                    this.selectedSetupItems.delete(item.id);
                }

                card.classList.toggle(
                    'setup-selected',
                    this.setupSelectionMode && checkbox.checked
                );
                this.updateWindowsSetupControls();
            });

            setupSelector.appendChild(checkbox);
            card.classList.toggle(
                'setup-selected',
                this.setupSelectionMode && checkbox.checked
            );
        }

        // Icon Container
        const iconDiv = document.createElement('div');
        iconDiv.className = 'file-icon';

        if (isImageIcon(item.icon)) {
            const [fallbackImg, fallbackEmoji] = this.getFallbackChain(dataKey);

            const img = document.createElement('img');
            img.src = item.icon;
            img.alt = item.name;
            img.className = 'file-icon-img';

            img.onerror = function () {
                this.onerror = null;
                this.src = fallbackImg;
                this.onerror = function () {
                    // Check if fallbackEmoji is an HTML tag string
                    if (fallbackEmoji.trim().startsWith('<')) {
                        const temp = document.createElement('div');
                        temp.innerHTML = fallbackEmoji;
                        if (temp.firstElementChild) {
                            this.replaceWith(temp.firstElementChild);
                        } else {
                            this.outerHTML = fallbackEmoji;
                        }
                    } else {
                        this.replaceWith(document.createTextNode(fallbackEmoji));
                    }
                };
            };
            iconDiv.appendChild(img);
        } else {
            const fallbackIcon = dataKey === 'apk-files' ?
                `<img src="${ICONS.android}" class="file-icon-img" alt="Android">` :
                `<img src="${ICONS.laptop}" class="file-icon-img" alt="PC">`;
            iconDiv.innerHTML = item.icon || fallbackIcon;
        }

        // Info Container
        const infoDiv = document.createElement('div');
        infoDiv.className = 'file-info';
        const h3 = document.createElement('h3');
        h3.textContent = item.name;
        infoDiv.appendChild(h3);

        // Buttons Container
        const btnDiv = document.createElement('div');
        btnDiv.className = 'dual-buttons';

        if (dataKey === 'pc-programs' && item.description) {
            btnDiv.appendChild(this.createProgramInfoButton(item));
        }

        const downloadChoices = dataKey === 'pc-programs' ? getDownloadChoices(item) : [];
        if (downloadChoices.length > 1) {
            card.classList.add('multi-download-card');
            btnDiv.classList.add('multi-download-actions');

            const hint = document.createElement('p');
            hint.className = 'download-choice-hint';
            hint.textContent = t('catalog.multiHint');
            infoDiv.appendChild(hint);

            for (const choice of downloadChoices) {
                btnDiv.appendChild(this.createDownloadChoiceButton(item, choice));
            }
        } else {
            const btn = document.createElement('button');
            btn.className = `download-btn ${type}-btn icon-only-btn`;
            btn.innerHTML = `<img src="${item.linkType === 'website' ? ICONS.web : ICONS.download}" alt="" aria-hidden="true" style="width: 1.2em; height: 1.2em;">`;
            btn.setAttribute('aria-label', item.linkType === 'website' ? t('download.visitAria', { name: item.name }) : t('download.aria', { name: item.name }));
            btn.title = item.linkType === 'website' ? t('download.officialPage') : t('download.label');
            btn.addEventListener('click', (e) => this.handleSimpleDownload(e.currentTarget, item));
            btnDiv.appendChild(btn);
        }

        if (setupSelector) card.appendChild(setupSelector);
        card.appendChild(iconDiv);
        card.appendChild(infoDiv);
        card.appendChild(btnDiv);

        return card;
    }

    createButtonHtml(item, platform) {
        const data = item[platform];
        const websiteOnly = data?.linkType === 'website';
        const storeLink = data?.linkType === 'store';
        const linkLabel = websiteOnly
            ? t('download.visitAria', { name: itemName(item) })
            : storeLink
                ? t(data.appId ? 'download.openPlay' : 'download.searchPlay', { name: itemName(item) })
                : t('download.forPlatform', { name: itemName(item), platform });
        const title = websiteOnly ? t('download.officialWebsite') : storeLink ? 'Google Play' : t('download.label');
        // Use icons instead of text.
        const iconSrc = websiteOnly ? ICONS.web : platform === 'pc' ? ICONS.windows :
            platform === 'web' ? ICONS.web :
                ICONS.android;
        const className = `download-btn ${platform}-btn icon-only-btn`; // Added class for styling if needed

        if (!data) {
            return `<button class="${className} disabled" disabled style="padding: 5px 10px;">
                <img src="${iconSrc}" alt="${platform}" style="width: 1.2em; height: 1.2em; opacity: 0.5;">
            </button>`;
        }

        return `<button class="${className}" data-platform="${platform}" aria-label="${linkLabel}" title="${title}" style="padding: 5px 10px; display: flex; align-items: center; justify-content: center;">
            <img src="${iconSrc}" alt="${platform}" style="width: 1.2em; height: 1.2em;">
        </button>`;
    }

    handleDownload(button, item) {
        if (button.disabled) return;

        const platform = button.dataset.platform;
        const data = item[platform];

        button.disabled = true;

        if (platform === 'android' && data.appId) {
            this.openPlayStore(data.appId, data.appName || item.name);
            this.resetButton(button, 2000);
        } else if (data.url) {
            window.open(data.url, '_blank', 'noopener,noreferrer');
            this.resetButton(button, 1000);
        } else {
            this.resetButton(button, 1500);
            alert(t('download.noUrl', { name: item.name }));
        }
    }

    handleSimpleDownload(button, item, url = item.url) {
        if (button.disabled) return;

        button.disabled = true;

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
            this.resetButton(button, 1000);
        } else {
            this.resetButton(button, 1500);
            alert(t('download.noUrl', { name: item.name }));
        }
    }

    resetButton(button, delay) {
        setTimeout(() => {
            button.disabled = false;
        }, delay);
    }

    openPlayStore(appId, appName) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isAndroid) {
            const intentUrl = `intent://play.google.com/store/apps/details?id=${appId}#Intent;scheme=https;package=com.android.vending;end`;
            const fallbackUrl = `https://play.google.com/store/apps/details?id=${appId}`;

            window.location.href = intentUrl;

            setTimeout(() => {
                if (document.hidden || document.visibilityState === 'hidden') return;
                window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
            }, 1000);

        } else if (isIOS) {
            alert(t('download.ios', { name: appName }));
        } else {
            window.open(`https://play.google.com/store/apps/details?id=${appId}`, '_blank', 'noopener,noreferrer');
        }
    }
}
