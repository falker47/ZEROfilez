import { StartupManager } from './startup.js';
import { CloudDecryptor } from './decryptor.js';
import { ICONS } from './icons.js';
import { initLanguage, onLanguageChange, t } from './i18n.js';

class App {
    constructor() {
        this.startupManager = new StartupManager();
        this.cloudDecryptor = new CloudDecryptor();
        this.currentMode = 'startup'; // 'decryptor' or 'startup'
        this.initializeModeToggle();
        onLanguageChange(() => {
            this.toggleMode(this.currentMode === 'decryptor');
            this.startupManager.refreshLanguage();
            this.cloudDecryptor.refreshLanguage();
        });
        initLanguage();
        this.updateFooterYear();
        this.initializeIcons();
    }

    initializeIcons() {
        // Initialize elements with data-icon attribute
        document.querySelectorAll('[data-icon]').forEach(element => {
            const iconKey = element.dataset.icon;
            if (ICONS[iconKey]) {
                element.src = ICONS[iconKey];
            }
        });

        const inputIcons = document.querySelectorAll('.input-icon');
        inputIcons.forEach(icon => {
            if (icon.textContent.includes('🔎')) {
                icon.innerHTML = `<img src="${ICONS.search}" alt="Search" style="width: 1em; height: 1em;">`;
            }
        });
    }

    initializeModeToggle() {
        const modeToggle = document.getElementById('modeToggle');
        if (modeToggle) {
            modeToggle.addEventListener('change', (e) => {
                this.toggleMode(e.target.checked);
            });
        }
    }

    updateFooterYear() {
        const yearSpan = document.getElementById('currentYear');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    toggleMode(isDecryptorMode) {
        this.currentMode = isDecryptorMode ? 'decryptor' : 'startup';

        const cloudDecryptorPage = document.getElementById('cloudDecryptorPage');
        const quickStartupPage = document.getElementById('quickStartupPage');
        const mainTitle = document.getElementById('mainTitle');
        const mainSubtitle = document.getElementById('mainSubtitle');
        const toggleIconLeft = document.querySelector('.toggle-icon-left');
        const toggleIconRight = document.querySelector('.toggle-icon-right');

        if (isDecryptorMode) {
            // Switch to Cloud Decryptor
            quickStartupPage.classList.add('hidden');
            cloudDecryptorPage.classList.remove('hidden');
            mainTitle.innerHTML = '<img class="brand-wordmark" src="assets/zerofilez-wordmark.svg" alt="ZEROfilez">';
            mainSubtitle.innerHTML = '';
            const modeLabel = document.createElement('span');
            modeLabel.className = 'mode-label';
            modeLabel.textContent = t('header.vaultMode');
            const separator = document.createElement('span');
            separator.className = 'mode-separator';
            separator.textContent = '·';
            const subtitle = document.createElement('span');
            subtitle.textContent = t('header.vaultSubtitle');
            mainSubtitle.append(modeLabel, separator, subtitle);
            // Highlight right icon (Cloud Decryptor)
            toggleIconLeft.style.opacity = '0.4';
            toggleIconRight.style.opacity = '1';
        } else {
            // Switch to Download
            cloudDecryptorPage.classList.add('hidden');
            quickStartupPage.classList.remove('hidden');
            mainTitle.innerHTML = '<img class="brand-wordmark" src="assets/zerofilez-wordmark.svg" alt="ZEROfilez">';
            mainSubtitle.textContent = t('header.subtitle');
            // Highlight left icon (Download)
            toggleIconLeft.style.opacity = '1';
            toggleIconRight.style.opacity = '0.4';
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
