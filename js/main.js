import { StartupManager } from './startup.js';
import { CloudDecryptor } from './decryptor.js';

class App {
    constructor() {
        this.startupManager = new StartupManager();
        this.cloudDecryptor = new CloudDecryptor();
        this.currentMode = 'startup'; // 'decryptor' or 'startup'
        this.initializeModeToggle();
    }

    initializeModeToggle() {
        const modeToggle = document.getElementById('modeToggle');
        if (modeToggle) {
            modeToggle.addEventListener('change', (e) => {
                this.toggleMode(e.target.checked);
            });
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
