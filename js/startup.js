import { ITEMS } from './data.js';
import { ORDER } from './array.js';
import { ICONS } from './icons.js';

export class StartupManager {
    constructor() {
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
            'emulation': [ICONS.nintendoFallback, '🎮'],
            'pc-programs': [ICONS.windowsFallback, `<img src="${ICONS.laptop}" class="file-icon-img" alt="PC">`],
            'apk-files': [ICONS.androidFallback, '📱']
        };
        return chain[category] || [null, '📂'];
    }

    createEmulatorCard(item) {
        const card = document.createElement('div');
        card.className = 'file-card';

        const subtextHtml = item.subtext ? item.subtext.split('\n').map(line => `<p>${line}</p>`).join('') : '';

        // Handle icon (URL vs emoji)
        let iconHtml;
        if (item.icon && item.icon.startsWith('http')) {
            const [fallbackImg, fallbackEmoji] = this.getFallbackChain('emulation');
            // Logic: Try exact icon -> Try generic image -> Show Emoji
            const onErrorLogic = `this.onerror=null; this.src='${fallbackImg}'; this.onerror=function(){ this.outerHTML='${fallbackEmoji}'; };`;
            iconHtml = `<img src="${item.icon}" alt="${item.name}" class="file-icon-img" onerror="${onErrorLogic}">`;
        } else {
            iconHtml = item.icon || '🎮';
        }

        card.innerHTML = `
            <div class="file-icon">${iconHtml}</div>
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

        card.querySelectorAll('.download-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => this.handleDownload(e.target, item));
            }
        });

        return card;
    }

    createSimpleFileCard(item, dataKey) {
        const card = document.createElement('div');
        card.className = 'file-card';

        const type = dataKey === 'apk-files' ? 'android' : 'pc';

        // Icon Container
        const iconDiv = document.createElement('div');
        iconDiv.className = 'file-icon';

        if (item.icon && item.icon.startsWith('http')) {
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
            const fallbackIcon = dataKey === 'apk-files' ? '📱' : `<img src="${ICONS.laptop}" class="file-icon-img" alt="PC">`;
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
