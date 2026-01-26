import { StartupManager } from './startup.js';
import { CloudDecryptor } from './decryptor.js';
import { ICONS } from './icons.js';

class App {
    constructor() {
        this.startupManager = new StartupManager();
        this.cloudDecryptor = new CloudDecryptor();
        this.currentMode = 'startup'; // 'decryptor' or 'startup'
        this.initializeModeToggle();
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
            mainTitle.textContent = 'ZEROfilez Cloud Decryptor';
            mainSubtitle.textContent = 'Secure system to manage encrypted files';
            // Highlight right icon (Cloud Decryptor)
            toggleIconLeft.style.opacity = '0.4';
            toggleIconRight.style.opacity = '1';
        } else {
            // Switch to Quick Startup
            cloudDecryptorPage.classList.add('hidden');
            quickStartupPage.classList.remove('hidden');
            mainTitle.textContent = 'ZEROfilez Quick Startup';
            mainSubtitle.textContent = 'Download useful files for free';
            // Highlight left icon (Quick Startup)
            toggleIconLeft.style.opacity = '1';
            toggleIconRight.style.opacity = '0.4';
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
