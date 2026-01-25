import { startupData } from './data.js';

export class StartupManager {
    constructor() {
        this.data = startupData;
        this.initialize();
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
                const tabId = e.target.dataset.tab;
                this.switchMainTab(tabId);
            });
        });
    }

    initializeSearch() {
        this.setupSearchListener('pcSearchInput', 'pc-programs', 'pc-programs-list');
        this.setupSearchListener('apkSearchInput', 'apk-files', 'apk-files-list');
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
                    const validKeys = ['emulators', 'pc-programs', 'apk-files'];
                    const dataKey = validKeys.find(key => listContainerId.startsWith(key));

                    if (dataKey) {
                        if (dataKey === 'emulators') {
                            this.renderEmulatorsSection(dataKey, listContainerId);
                        } else {
                            this.renderSearchableSection(dataKey, listContainerId);
                        }
                    }
                }
            }
        });
    }

    renderAllSections() {
        this.renderEmulatorsSection('emulators', 'emulators-list');
        this.renderSearchableSection('pc-programs', 'pc-programs-list');
        this.renderSearchableSection('apk-files', 'apk-files-list');
    }

    renderEmulatorsSection(dataKey, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = this.data[dataKey] || [];

        if (items.length === 0) {
            this.renderEmptyState(container, dataKey);
            return;
        }

        container.innerHTML = '<div class="files-grid"></div>';
        const grid = container.querySelector('.files-grid');

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
            container.appendChild(this.createSimpleFileCard(item, dataKey));
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
            'emulators': ['https://cdn.simpleicons.org/nintendo/white', '🎮'],
            'pc-programs': ['https://cdn.simpleicons.org/windows/white', '💻'],
            'apk-files': ['https://cdn.simpleicons.org/android/white', '📱']
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
            const [fallbackImg, fallbackEmoji] = this.getFallbackChain('emulators');
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
                ${this.createButtonHtml(item, 'pc')}
                ${this.createButtonHtml(item, 'android')}
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

        // Handle icon (URL vs emoji/fallback)
        let iconHtml;
        if (item.icon && item.icon.startsWith('http')) {
            const [fallbackImg, fallbackEmoji] = this.getFallbackChain(dataKey);
            // Same chained logic
            const onErrorLogic = `this.onerror=null; this.src='${fallbackImg}'; this.onerror=function(){ this.outerHTML='${fallbackEmoji}'; };`;
            iconHtml = `<img src="${item.icon}" alt="${item.name}" class="file-icon-img" onerror="${onErrorLogic}">`;
        } else {
            const fallbackIcon = dataKey === 'apk-files' ? '📱' : '💻';
            iconHtml = item.icon || fallbackIcon;
        }

        card.innerHTML = `
            <div class="file-icon">${iconHtml}</div>
            <div class="file-info">
                <h3>${item.name}</h3>
            </div>
            <div class="dual-buttons">
                <button class="download-btn ${type}-btn">Download</button>
            </div>
        `;

        const btn = card.querySelector('.download-btn');
        btn.addEventListener('click', (e) => this.handleSimpleDownload(e.target, item));

        return card;
    }

    createButtonHtml(item, platform) {
        const data = item[platform];
        const label = platform === 'pc' ? 'PC' : 'Android';
        const className = `download-btn ${platform}-btn`;

        if (!data) {
            return `<button class="${className} disabled" disabled>N/A</button>`;
        }

        return `<button class="${className}" data-platform="${platform}">${label}</button>`;
    }

    handleDownload(button, item) {
        if (button.disabled) return;

        const platform = button.dataset.platform;
        const data = item[platform];
        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = 'Opening...';

        if (platform === 'android' && data.appId) {
            this.openPlayStore(data.appId, data.appName || item.name);
            this.resetButton(button, originalText, 2000);
        } else if (data.url) {
            window.open(data.url, '_blank', 'noopener,noreferrer');
            this.resetButton(button, originalText, 1000);
        } else {
            this.resetButton(button, originalText, 1500);
            alert(`No download URL configured for ${item.name}`);
        }
    }

    handleSimpleDownload(button, item) {
        if (button.disabled) return;
        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = 'Opening...';

        if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
            this.resetButton(button, originalText, 1000);
        } else {
            this.resetButton(button, originalText, 1500);
            alert(`No download URL configured for ${item.name}`);
        }
    }

    resetButton(button, text, delay) {
        setTimeout(() => {
            button.disabled = false;
            button.textContent = text;
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
