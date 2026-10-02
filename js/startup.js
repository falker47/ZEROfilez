import { ITEMS } from './data.js';
import { ORDER } from './array.js';
import { ICONS } from './icons.js';
import { generateCommandSetup } from './windows-setup.js';

const SETUP_CATEGORY_GROUPS = [
    { label: 'Browsers', ids: ['brave-browser', 'google-chrome', 'mozilla-firefox'] },
    { label: 'Essentials', ids: ['7-zip', 'vlc-media-player', 'revo-uninstaller', 'libreoffice', 'winrar'] },
    { label: 'Utilities', ids: ['cheat-engine', 'sharex', 'wiztree', 'powertoys', 'patch-my-pc', 'everything', 'espanso', 'pcloud', 'obsidian', 'bitwarden-desktop'] },
    { label: 'Communication', ids: ['discord'] },
    { label: 'AI & tools', ids: ['claude-desktop', 'antigravity', 'cluely'] },
    { label: 'Personal', ids: ['panacea'] }
];

export class StartupManager {
    constructor() {
        this.setupSelectionMode = false;
        this.setupBuilderOpen = false;
        this.setupStep = 1;
        this.selectedSetupItems = new Set();
        this.generatedSetupScript = '';
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
    }

    initializeWindowsSetup() {
        const startButton = document.getElementById('startWindowsSetup');
        if (!startButton) return;

        startButton.addEventListener('click', () => this.openWindowsSetupBuilder());
        document.getElementById('exitWindowsSetup')?.addEventListener('click', () => this.closeWindowsSetupBuilder());
        document.getElementById('finishWindowsSetup')?.addEventListener('click', () => this.closeWindowsSetupBuilder());
        document.getElementById('clearSetupSelection')?.addEventListener('click', () => this.clearWindowsSetupSelection());
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

        document.getElementById('pcSetupEntry')?.classList.add('hidden');
        document.querySelector('#pc-programs-tab .search-container')?.classList.add('hidden');
        document.getElementById('pc-programs-list')?.classList.add('hidden');
        document.getElementById('windowsSetupBuilder')?.classList.remove('hidden');

        this.setSetupStep(1);
    }

    closeWindowsSetupBuilder() {
        this.setupBuilderOpen = false;

        document.getElementById('pcSetupEntry')?.classList.remove('hidden');
        document.querySelector('#pc-programs-tab .search-container')?.classList.remove('hidden');
        document.getElementById('pc-programs-list')?.classList.remove('hidden');
        document.getElementById('windowsSetupBuilder')?.classList.add('hidden');

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
        return (this.data['pc-programs'] || [])
            .filter(item => this.selectedSetupItems.has(item.id));
    }

    getSetupBreakdown() {
        const all = this.getSelectedSetupItems();
        return {
            all,
            automatic: all.filter(item => Boolean(item.wingetId)),
            manual: all.filter(item => !item.wingetId)
        };
    }

    renderSetupSelection() {
        const container = document.getElementById('setupBuilderSelectionList');
        if (!container) return;

        const itemMap = new Map((this.data['pc-programs'] || []).map(item => [item.id, item]));
        container.innerHTML = '';

        for (const group of SETUP_CATEGORY_GROUPS) {
            const items = group.ids.map(id => itemMap.get(id)).filter(Boolean);
            if (items.length === 0) continue;

            const category = document.createElement('div');
            category.className = 'setup-category';

            const heading = document.createElement('div');
            heading.className = 'setup-category-heading';

            const title = document.createElement('h4');
            title.textContent = group.label;

            const count = document.createElement('span');
            count.textContent = `${items.length} programs`;

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
        checkbox.setAttribute('aria-label', `Select ${item.name}`);

        const iconDiv = document.createElement('div');
        iconDiv.className = 'setup-program-icon';

        if (item.icon && (item.icon.startsWith('http') || item.icon.endsWith('.png') || item.icon.endsWith('.jpg') || item.icon.endsWith('.svg'))) {
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
        badge.className = `setup-type-badge ${item.wingetId ? 'automatic' : 'manual'}`;
        badge.textContent = item.wingetId ? 'Auto' : 'Manual';

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

        if (countLabel) countLabel.textContent = `${count} selected`;
        if (nextButton) nextButton.disabled = count === 0;
        if (clearButton) clearButton.disabled = count === 0;
    }

    clearWindowsSetupSelection() {
        this.selectedSetupItems.clear();
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
        if (total) total.textContent = `${all.length} total · ${automatic.length} auto · ${manual.length} manual`;

        this.renderSetupNameList('setupReviewAutomaticList', automatic, 'None');
        this.renderSetupNameList('setupReviewManualList', manual, 'None');
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
            row.textContent = item.name;
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
                ? `${automatic.length} auto · ${manual.length} manual`
                : `${all.length} manual`;
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
            name.textContent = item.name;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ui-icon-button';
            button.innerHTML = `<img src="${ICONS.download}" alt="">`;
            button.setAttribute('aria-label', `Download ${item.name}`);
            button.title = 'Download';
            button.disabled = !item.url;
            button.addEventListener('click', (event) => this.handleSimpleDownload(event.currentTarget, item));

            row.appendChild(name);
            row.appendChild(button);
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
            this.setWindowsSetupStatus('Setup copied to the clipboard.');
        } catch {
            this.setWindowsSetupStatus('Copy failed. Open Technical details and copy the setup manually.');
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

        this.setWindowsSetupStatus('Setup file downloaded.');
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

        const items = this.data[dataKey] || [];
        if (items.length === 0) {
            this.renderEmptyState(container, dataKey);
            return;
        }

        container.innerHTML = '<div class="files-grid"></div>';
        const grid = container.querySelector('.files-grid');

        this.renderGridItems(grid, items, dataKey);
    }

    filterSection(dataKey, containerId, query) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let grid = container.querySelector('.files-grid');
        if (!grid) return;

        const items = this.data[dataKey] || [];
        const filteredItems = items.filter(item => item.name.toLowerCase().includes(query));

        this.renderGridItems(grid, filteredItems, dataKey);
    }

    renderGridItems(container, items, dataKey) {
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<div class="no-results" style="grid-column: 1 / -1; text-align: center; color: #a0a0a0; padding: 20px;">No results found.</div>';
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
                <h2>Coming Soon</h2>
                <p>${dataKey.replace('-', ' ').toUpperCase()} section is under development</p>
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

        const subtextHtml = item.subtext ? item.subtext.split('\n').map(line => `<p>${line}</p>`).join('') : '';

        card.innerHTML = `
            <div class="file-icon"></div>
            <div class="file-info">
                <h3>${item.name}</h3>
                ${subtextHtml}
            </div>
            <div class="dual-buttons">
                ${item.pc ? this.createButtonHtml(item, 'pc') : ''}
                ${item.web ? this.createButtonHtml(item, 'web') : ''}
                ${item.android ? this.createButtonHtml(item, 'android') : ''}
            </div>
        `;

        const iconContainer = card.querySelector('.file-icon');
        if (item.icon && (item.icon.startsWith('http') || item.icon.endsWith('.png') || item.icon.endsWith('.jpg') || item.icon.endsWith('.svg'))) {
            const [fallbackImg, fallbackEmoji] = this.getFallbackChain('emulation');

            const img = document.createElement('img');
            img.src = item.icon;
            img.alt = item.name;
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
        const canSelectForSetup = dataKey === 'pc-programs' && Boolean(item.wingetId);
        let setupSelector = null;

        if (canSelectForSetup) {
            setupSelector = document.createElement('label');
            setupSelector.className = 'setup-selector';
            setupSelector.hidden = !this.setupSelectionMode;
            setupSelector.title = `Select ${item.name} for Windows setup`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.selectedSetupItems.has(item.id);
            checkbox.setAttribute('aria-label', `Select ${item.name} for Windows setup`);

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

        if (item.icon && (item.icon.startsWith('http') || item.icon.endsWith('.png') || item.icon.endsWith('.jpg') || item.icon.endsWith('.svg'))) {
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
        const btn = document.createElement('button');
        btn.className = `download-btn ${type}-btn icon-only-btn`; // Add icon-only-btn class
        // Replace text with Icon
        // btn.textContent = 'Download';
        btn.innerHTML = `<img src="${ICONS.download}" alt="Download" style="width: 1.2em; height: 1.2em;">`;
        btn.setAttribute('aria-label', 'Download');

        btn.addEventListener('click', (e) => this.handleSimpleDownload(e.currentTarget, item)); // Use currentTarget to get the button, not likely the img
        btnDiv.appendChild(btn);

        if (setupSelector) card.appendChild(setupSelector);
        card.appendChild(iconDiv);
        card.appendChild(infoDiv);
        card.appendChild(btnDiv);

        return card;
    }

    createButtonHtml(item, platform) {
        const data = item[platform];
        // Use icons instead of text text
        const iconSrc = platform === 'pc' ? ICONS.windows :
            platform === 'web' ? ICONS.web :
                ICONS.android;
        const className = `download-btn ${platform}-btn icon-only-btn`; // Added class for styling if needed

        if (!data) {
            return `<button class="${className} disabled" disabled style="padding: 5px 10px;">
                <img src="${iconSrc}" alt="${platform}" style="width: 1.2em; height: 1.2em; opacity: 0.5;">
            </button>`;
        }

        return `<button class="${className}" data-platform="${platform}" style="padding: 5px 10px; display: flex; align-items: center; justify-content: center;">
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
            alert(`No download URL configured for ${item.name}`);
        }
    }

    handleSimpleDownload(button, item) {
        if (button.disabled) return;

        button.disabled = true;

        if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
            this.resetButton(button, 1000);
        } else {
            this.resetButton(button, 1500);
            alert(`No download URL configured for ${item.name}`);
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
            alert(`📱 Per scaricare ${appName}, cerca "${appName}" nell'App Store di Apple.`);
        } else {
            window.open(`https://play.google.com/store/apps/details?id=${appId}`, '_blank', 'noopener,noreferrer');
        }
    }
}
