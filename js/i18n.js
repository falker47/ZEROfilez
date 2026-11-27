// Interface language for ZEROfilez (English and Italian).
// Shares the storage key and ?lang= parameter with falker47.github.io, so a choice
// made on the main site carries over here and vice versa (same origin).
// Without a browser the language stays English, which keeps tests deterministic.

export const LANGUAGES = Object.freeze(['en', 'it']);
const STORAGE_KEY = 'nexus-language';
const listeners = new Set();
let currentLanguage = 'en';

const plural = (n, one, many) => (n === 1 ? one : many);

const STRINGS = {
    en: {
        'meta.description': 'Two-sided platform: a secure cloud for your encrypted files and a public archive to quickly download emulators, APKs and essential PC utilities.',
        'language.label': 'Language',
        'header.subtitle': 'Download useful files for free',
        'header.vaultMode': 'Cloud Decryptor',
        'header.vaultSubtitle': 'Secure system to manage encrypted files',
        'toggle.startup': 'Download',
        'toggle.vault': 'Vault',

        'vault.keyTitle': '🔑 User Key',
        'vault.keyInput': 'User Key',
        'vault.packageTitle': '📦 Encrypted Package',
        'vault.packageInput': 'Encrypted Package',
        'vault.filesTitle': '📁 Your Files',
        'vault.filter': 'Filter files',
        'vault.filterPlaceholder': 'Type to filter files...',
        'vault.filesPlaceholder': 'No files to show yet. Upload an encrypted package to see your files.',
        'vault.keyWaiting': '⏳ Waiting for key',
        'vault.packageWaiting': '⏳ Waiting for package',
        'vault.keyOk': '✅ Key OK, KEK OK',
        'vault.keyError': ({ message }) => `❌ Error loading user key: ${message}`,
        'vault.loadKeyFirst': '❌ Load the key first',
        'vault.decrypting': '🔄 Decrypting package...',
        'vault.decrypted': '✅ Package decrypted!',
        'vault.decryptError': ({ message }) => `❌ Package decryption error: ${message}`,
        'vault.localOnly': '🔒 Encryption happens locally in your browser. No data is sent to any server.',
        'vault.fileDownloaded': ({ name }) => `✅ File downloaded: ${name}`,
        'vault.noFiles': 'No files found in the package',
        'vault.download': 'Download',
        'vault.downloading': 'Downloading...',
        'vault.downloadingPrefix': '⬇️ Downloading: ',
        'vault.error': '❌ Error',

        'tab.emulation': 'Emulation',
        'tab.pcPrograms': 'PC Programs',
        'tab.apkFiles': 'APK Files',
        'search.emulation': 'Search emulators',
        'search.emulationPlaceholder': 'Search emulators...',
        'search.pc': 'Search PC programs',
        'search.pcPlaceholder': 'Search PC programs...',
        'search.apk': 'Search APK files',
        'search.apkPlaceholder': 'Search APK files...',
        'search.noResults': 'No results found.',
        'empty.title': 'Coming Soon',
        'empty.body': ({ section }) => `${section} section is under development`,

        'category.Browsers': 'Browsers',
        'category.Communication': 'Communication',
        'category.Development & AI': 'Development & AI',
        'category.Essentials': 'Essentials',
        'category.Utilities': 'Utilities',
        'category.Other': 'Other',
        'catalog.programCount': ({ count }) => `${count} program${plural(count, '', 's')}`,
        'catalog.about': ({ name }) => `About ${name}`,
        'catalog.multiHint': 'Install recommended · Portable available',
        'catalog.selectForSetup': ({ name }) => `Select ${name} for Windows setup`,

        'download.label': 'Download',
        'download.aria': ({ name }) => `Download ${name}`,
        'download.forPlatform': ({ name, platform }) => `Download ${name} for ${platform}`,
        'download.officialWebsite': 'Official website',
        'download.officialPage': 'Official download page',
        'download.visitAria': ({ name }) => `Visit ${name} official download page`,
        'download.websiteHint': 'Open the publisher website; this is not a direct file download',
        'download.install': 'Install',
        'download.installAria': ({ name }) => `Install ${name} (recommended; enables future guided updates)`,
        'download.installHint': 'Recommended: Windows installer with Start Menu shortcut and guided future updates',
        'download.portable': 'Portable',
        'download.portableAria': ({ name }) => `Download ${name} portable (no installation; future updates are manual)`,
        'download.portableHint': 'Portable EXE: no installation; future updates require manual download',
        'download.openPlay': ({ name }) => `Open ${name} in Google Play`,
        'download.searchPlay': ({ name }) => `Search ${name} in Google Play`,
        'download.noUrl': ({ name }) => `No download URL configured for ${name}`,
        'download.ios': ({ name }) => `📱 To download ${name}, search for "${name}" in Apple's App Store.`,

        'featured.eyebrow': 'FEATURED',
        'featured.keyword': 'Featured',
        'featured.tagline': 'Windows maintenance, simplified.',
        'featured.description': 'Cleanup, monitoring and repair tools in one place.',
        'featured.details': 'Details',
        'featured.detailsAria': 'Panacea details on GitHub',
        'featured.include': 'Include Panacea in setup',
        'featured.package': 'Package',
        'featured.installRecommended': 'Install · Recommended',
        'featured.manualNote': 'Manual download · Not a WinGet package',

        'setup.entry': 'Set up multiple programs in a few clicks',
        'setup.build': 'Build',
        'setup.title': 'PC Setup',
        'setup.exit': 'Exit setup',
        'setup.exitTitle': 'Exit',
        'setup.progress': 'Setup progress',
        'setup.stepChoose': 'Choose',
        'setup.stepReview': 'Review',
        'setup.stepInstall': 'Install',
        'setup.selectionName': 'ZEROfilez Selection',
        'setup.selectionApply': 'Apply ZEROfilez Selection',
        'setup.clear': 'Clear selection',
        'setup.clearTitle': 'Clear',
        'setup.next': 'Next',
        'setup.back': 'Back',
        'setup.done': 'Done',
        'setup.reviewSelection': 'Review selection',
        'setup.backToSelection': 'Back to program selection',
        'setup.create': 'Create setup',
        'setup.backToReview': 'Back to review',
        'setup.finish': 'Finish setup',
        'setup.automatic': 'Automatic',
        'setup.manual': 'Manual',
        'setup.ready': 'Ready',
        'setup.download': 'Download',
        'setup.copy': 'Copy',
        'setup.runNote': 'Double-click the <code>.cmd</code>. It stays open if something fails.',
        'setup.details': 'Details',
        'setup.detailsBody': 'Generated locally with verified WinGet package IDs and the official Hermes PowerShell installer, if selected.',
        'setup.scriptPreview': 'Generated Windows command setup',
        'setup.noAutomatic': 'Manual downloads only. No setup file is needed.',
        'setup.downloadSeparately': 'Download separately',
        'setup.selectItem': ({ name }) => `Select ${name}`,
        'setup.badgeAuto': 'Auto',
        'setup.badgeManual': 'Manual',
        'setup.selectedCount': ({ count }) => `${count} selected`,
        'setup.presetApplied': 'ZEROfilez Selection applied',
        'setup.presetAdd': ({ count }) => `Add ${count} recommended apps with ZEROfilez Selection`,
        'setup.presetUnavailable': 'Unavailable',
        'setup.presetSelected': 'Selected',
        'setup.presetSelect': ({ count }) => `Select ${count} app${plural(count, '', 's')}`,
        'setup.presetNone': 'No recommended apps available',
        'setup.presetAllSelected': ({ count }) => `${count} recommended apps selected`,
        'setup.presetPartial': ({ total, included }) => `${total} recommended · ${included} selected`,
        'setup.reviewTotal': ({ total, automatic, manual }) => `${total} total · ${automatic} auto · ${manual} manual`,
        'setup.none': 'None',
        'setup.summaryMixed': ({ automatic, manual }) => `${automatic} auto · ${manual} manual`,
        'setup.summaryManual': ({ count }) => `${count} manual`,
        'setup.copied': 'Setup copied to the clipboard.',
        'setup.copyFailed': 'Copy failed. Open Technical details and copy the setup manually.',
        'setup.downloaded': 'Setup file downloaded.'
    },

    it: {
        'meta.description': 'Piattaforma dalla doppia natura: Cloud sicuro per i propri file criptati e Archivio pubblico per scaricare rapidamente emulatori, APK e utility fondamentali per PC.',
        'language.label': 'Lingua',
        'header.subtitle': 'Scarica gratis file utili',
        'header.vaultMode': 'Cloud Decryptor',
        'header.vaultSubtitle': 'Sistema sicuro per gestire file criptati',
        'toggle.startup': 'Download',
        'toggle.vault': 'Vault',

        'vault.keyTitle': '🔑 Chiave utente',
        'vault.keyInput': 'Chiave utente',
        'vault.packageTitle': '📦 Pacchetto criptato',
        'vault.packageInput': 'Pacchetto criptato',
        'vault.filesTitle': '📁 I tuoi file',
        'vault.filter': 'Filtra i file',
        'vault.filterPlaceholder': 'Scrivi per filtrare i file...',
        'vault.filesPlaceholder': 'Ancora nessun file da mostrare. Carica un pacchetto criptato per vedere i tuoi file.',
        'vault.keyWaiting': '⏳ In attesa della chiave',
        'vault.packageWaiting': '⏳ In attesa del pacchetto',
        'vault.keyOk': '✅ Chiave OK, KEK OK',
        'vault.keyError': ({ message }) => `❌ Errore nella chiave: ${message}`,
        'vault.loadKeyFirst': '❌ Prima carica la chiave',
        'vault.decrypting': '🔄 Decrittazione in corso...',
        'vault.decrypted': '✅ Pacchetto decrittato!',
        'vault.decryptError': ({ message }) => `❌ Errore di decrittazione: ${message}`,
        'vault.localOnly': '🔒 Tutto avviene nel tuo browser: nessun dato va a un server.',
        'vault.fileDownloaded': ({ name }) => `✅ File scaricato: ${name}`,
        'vault.noFiles': 'Nessun file nel pacchetto',
        'vault.download': 'Scarica',
        'vault.downloading': 'Download in corso...',
        'vault.downloadingPrefix': '⬇️ Download in corso: ',
        'vault.error': '❌ Errore',

        'tab.emulation': 'Emulazione',
        'tab.pcPrograms': 'Programmi PC',
        'tab.apkFiles': 'File APK',
        'search.emulation': 'Cerca emulatori',
        'search.emulationPlaceholder': 'Cerca emulatori...',
        'search.pc': 'Cerca programmi PC',
        'search.pcPlaceholder': 'Cerca programmi PC...',
        'search.apk': 'Cerca file APK',
        'search.apkPlaceholder': 'Cerca file APK...',
        'search.noResults': 'Nessun risultato.',
        'empty.title': 'In arrivo',
        'empty.body': ({ section }) => `La sezione ${section} è in sviluppo`,

        'category.Browsers': 'Browser',
        'category.Communication': 'Comunicazione',
        'category.Development & AI': 'Sviluppo e AI',
        'category.Essentials': 'Essenziali',
        'category.Utilities': 'Utilità',
        'category.Other': 'Altro',
        'catalog.programCount': ({ count }) => `${count} ${plural(count, 'programma', 'programmi')}`,
        'catalog.about': ({ name }) => `Informazioni su ${name}`,
        'catalog.multiHint': 'Installazione consigliata · Disponibile portable',
        'catalog.selectForSetup': ({ name }) => `Seleziona ${name} per il setup di Windows`,

        'download.label': 'Scarica',
        'download.aria': ({ name }) => `Scarica ${name}`,
        'download.forPlatform': ({ name, platform }) => `Scarica ${name} per ${platform}`,
        'download.officialWebsite': 'Sito ufficiale',
        'download.officialPage': 'Pagina di download ufficiale',
        'download.visitAria': ({ name }) => `Apri la pagina di download ufficiale di ${name}`,
        'download.websiteHint': "Apre il sito dell'editore: non è un download diretto",
        'download.install': 'Installa',
        'download.installAria': ({ name }) => `Installa ${name} (consigliato: abilita gli aggiornamenti guidati)`,
        'download.installHint': 'Consigliato: installer Windows con collegamento nel menu Start e aggiornamenti guidati',
        'download.portable': 'Portable',
        'download.portableAria': ({ name }) => `Scarica ${name} portable (senza installazione: gli aggiornamenti sono manuali)`,
        'download.portableHint': 'EXE portable: nessuna installazione; gli aggiornamenti vanno scaricati a mano',
        'download.openPlay': ({ name }) => `Apri ${name} su Google Play`,
        'download.searchPlay': ({ name }) => `Cerca ${name} su Google Play`,
        'download.noUrl': ({ name }) => `Nessun link di download configurato per ${name}`,
        'download.ios': ({ name }) => `📱 Per scaricare ${name}, cerca "${name}" nell'App Store di Apple.`,

        'featured.eyebrow': 'IN EVIDENZA',
        'featured.keyword': 'In evidenza',
        'featured.tagline': 'La manutenzione di Windows, semplificata.',
        'featured.description': 'Pulizia, monitoraggio e riparazione in un unico posto.',
        'featured.details': 'Dettagli',
        'featured.detailsAria': 'Dettagli di Panacea su GitHub',
        'featured.include': 'Includi Panacea nel setup',
        'featured.package': 'Versione',
        'featured.installRecommended': 'Installa · Consigliato',
        'featured.manualNote': 'Download manuale · Non è un pacchetto WinGet',

        'setup.entry': 'Installa più programmi in pochi clic',
        'setup.build': 'Crea',
        'setup.title': 'Setup del PC',
        'setup.exit': 'Esci dal setup',
        'setup.exitTitle': 'Esci',
        'setup.progress': 'Avanzamento del setup',
        'setup.stepChoose': 'Scegli',
        'setup.stepReview': 'Controlla',
        'setup.stepInstall': 'Installa',
        'setup.selectionName': 'Selezione ZEROfilez',
        'setup.selectionApply': 'Applica la Selezione ZEROfilez',
        'setup.clear': 'Azzera la selezione',
        'setup.clearTitle': 'Azzera',
        'setup.next': 'Avanti',
        'setup.back': 'Indietro',
        'setup.done': 'Fatto',
        'setup.reviewSelection': 'Controlla la selezione',
        'setup.backToSelection': 'Torna alla scelta dei programmi',
        'setup.create': 'Crea il setup',
        'setup.backToReview': 'Torna al controllo',
        'setup.finish': 'Termina il setup',
        'setup.automatic': 'Automatici',
        'setup.manual': 'Manuali',
        'setup.ready': 'Pronto',
        'setup.download': 'Scarica',
        'setup.copy': 'Copia',
        'setup.runNote': 'Fai doppio clic sul file <code>.cmd</code>. Se qualcosa non va, la finestra resta aperta.',
        'setup.details': 'Dettagli',
        'setup.detailsBody': "Generato nel tuo browser con ID WinGet verificati e, se selezionato, l'installer PowerShell ufficiale di Hermes.",
        'setup.scriptPreview': 'Script di setup per Windows generato',
        'setup.noAutomatic': 'Solo download manuali: non serve alcun file di setup.',
        'setup.downloadSeparately': 'Da scaricare a parte',
        'setup.selectItem': ({ name }) => `Seleziona ${name}`,
        'setup.badgeAuto': 'Auto',
        'setup.badgeManual': 'Manuale',
        'setup.selectedCount': ({ count }) => `${count} ${plural(count, 'selezionato', 'selezionati')}`,
        'setup.presetApplied': 'Selezione ZEROfilez applicata',
        'setup.presetAdd': ({ count }) => `Aggiungi ${count} app consigliate con la Selezione ZEROfilez`,
        'setup.presetUnavailable': 'Non disponibile',
        'setup.presetSelected': 'Selezionate',
        'setup.presetSelect': ({ count }) => `Seleziona ${count} app`,
        'setup.presetNone': 'Nessuna app consigliata disponibile',
        'setup.presetAllSelected': ({ count }) => `${count} app consigliate selezionate`,
        'setup.presetPartial': ({ total, included }) => `${total} consigliate · ${included} ${plural(included, 'selezionata', 'selezionate')}`,
        'setup.reviewTotal': ({ total, automatic, manual }) => `${total} in tutto · ${automatic} auto · ${manual} ${plural(manual, 'manuale', 'manuali')}`,
        'setup.none': 'Nessuno',
        'setup.summaryMixed': ({ automatic, manual }) => `${automatic} auto · ${manual} ${plural(manual, 'manuale', 'manuali')}`,
        'setup.summaryManual': ({ count }) => `${count} ${plural(count, 'manuale', 'manuali')}`,
        'setup.copied': 'Setup copiato negli appunti.',
        'setup.copyFailed': 'Copia non riuscita. Apri Dettagli e copia il setup a mano.',
        'setup.downloaded': 'File di setup scaricato.'
    }
};

// Catalog copy lives in data.js in English; Italian overrides are keyed by item id.
// A program added later without an entry here simply shows its English text.
const ITEM_NAMES_IT = {
    scummvm: 'Vecchi giochi per PC',
    retroarch: 'Multisistema'
};

const ITEM_SUBTEXTS_IT = {
    pkhex: 'Editor di salvataggi Pokémon'
};

const DESCRIPTIONS_IT = {
    'brave-browser': 'Naviga sul web con il blocco di pubblicità e tracciamento già integrato.',
    'google-chrome': 'Naviga sul web e sincronizza preferiti, password e schede su tutti i tuoi dispositivi.',
    'mozilla-firefox': 'Naviga sul web con protezione dal tracciamento ed estensioni.',
    '7-zip': 'Apri i file compressi o comprimi le cartelle in archivi più piccoli da conservare e condividere.',
    'vlc-media-player': 'Guarda video e ascolta musica in quasi tutti i formati, con sottotitoli e DVD.',
    'revo-uninstaller': 'Disinstalla i programmi che non ti servono, poi trova e rimuovi i file e le impostazioni rimasti.',
    'libreoffice': 'Crea e modifica documenti, fogli di calcolo e presentazioni, anche i file fatti con Microsoft Office.',
    'winrar': 'Apri file RAR e ZIP, comprimi cartelle e proteggi gli archivi con una password.',
    'cheat-engine': 'Trova e modifica valori come vita o denaro nei giochi offline per giocatore singolo.',
    'sharex': 'Cattura lo schermo, aggiungi frecce o testo e registra video da salvare o condividere.',
    'wiztree': 'Scopri quali file e cartelle occupano più spazio sui tuoi dischi.',
    'powertoys': 'Disponi le finestre, cambia la funzione dei tasti e rinomina più file in una volta.',
    'patch-my-pc': 'Installa e aggiorna insieme i programmi supportati, senza aprire gli installer uno per uno.',
    'everything': 'Trova file e cartelle per nome, con i risultati che compaiono mentre scrivi.',
    'espanso': 'Scrivi una parola chiave e diventa una frase intera, un indirizzo email o un altro testo che usi spesso.',
    'pcloud': 'Salva i file online, ritrovali su tutti i tuoi dispositivi e condividili con un link.',
    'obsidian': 'Scrivi note sul computer e collega tra loro le idee correlate con dei link.',
    'marktext': 'Leggi e modifica file Markdown con una formattazione pulita e immediata, senza vedere la sintassi.',
    'claude-desktop': "Chiedi all'AI di scrivere o rivedere testi, riassumere documenti e spiegarti argomenti nuovi.",
    'chatgpt-desktop': "Usa ChatGPT su Windows per conversazioni, progetti, file e strumenti di programmazione con l'AI.",
    'hermes-agent': "Automatizza attività con un agente AI che ricorda il contesto, usa strumenti e migliora con l'esperienza.",
    'openclaw': 'Collega Windows a un gateway OpenClaw, usa la chat nativa e gestisci le funzioni del nodo Windows.',
    'bitwarden-desktop': 'Conserva le password, creane di sicure e accedi ai tuoi account da dispositivi diversi.',
    'discord': 'Chatta con amici e community via testo, voce o video, e condividi lo schermo.',
    'telegram-desktop': 'Scrivi ai tuoi contatti, entra in gruppi e canali e fai chiamate da Windows.',
    'whatsapp-desktop': 'Invia messaggi e fai chiamate vocali o video dal PC, collegato al tuo telefono.',
    'visual-studio-code': 'Scrivi codice per siti, app e script, con strumenti per trovare e correggere gli errori.',
    'notepad-plus-plus': 'Scrivi e modifica file di testo, script e codice in molti linguaggi di programmazione.',
    'panacea': "Elimina i file temporanei, controlla memoria e disco e avvia gli strumenti di riparazione di Windows. L'installer abilita gli aggiornamenti guidati; la versione portable non richiede installazione.",
    'antigravity': "Crea app con l'aiuto dell'AI per scrivere codice, correggere errori ed eseguire test."
};

export function getLanguage() {
    return currentLanguage;
}

export function t(key, params = {}) {
    const entry = STRINGS[currentLanguage]?.[key] ?? STRINGS.en[key];
    if (entry === undefined) return key;
    return typeof entry === 'function' ? entry(params) : entry;
}

/** Every translation of a key, for searches that should match either language. */
export function allTranslations(key) {
    return LANGUAGES.map(lang => STRINGS[lang][key]).filter(value => typeof value === 'string');
}

export function categoryLabel(label) {
    const key = `category.${label}`;
    return STRINGS.en[key] === undefined ? label : t(key);
}

export function itemName(item) {
    return (currentLanguage === 'it' && ITEM_NAMES_IT[item?.id]) || item?.name || '';
}

export function itemSubtext(item) {
    return (currentLanguage === 'it' && ITEM_SUBTEXTS_IT[item?.id]) || item?.subtext || '';
}

export function itemDescription(item) {
    return (currentLanguage === 'it' && DESCRIPTIONS_IT[item?.id]) || item?.description || '';
}

export function onLanguageChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function applyStaticTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    for (const attribute of ['placeholder', 'title', 'aria-label']) {
        const dataName = 'i18n' + attribute.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
        root.querySelectorAll(`[data-i18n-${attribute}]`).forEach(el => {
            el.setAttribute(attribute, t(el.dataset[dataName]));
        });
    }
    root.querySelectorAll('[data-i18n-placeholder-attr]').forEach(el => {
        el.dataset.placeholder = t(el.dataset.i18nPlaceholderAttr);
    });
}

export function setLanguage(value, { persist = true } = {}) {
    currentLanguage = LANGUAGES.includes(value) ? value : 'en';
    if (typeof document === 'undefined') return;

    document.documentElement.lang = currentLanguage;
    const description = document.querySelector('meta[name=description]');
    if (description) description.content = t('meta.description');
    applyStaticTranslations();
    document.querySelectorAll('[data-lang]').forEach(button =>
        button.setAttribute('aria-pressed', String(button.dataset.lang === currentLanguage)));

    if (persist) {
        try { localStorage.setItem(STORAGE_KEY, currentLanguage); } catch { /* storage unavailable */ }
        try {
            const url = new URL(location.href);
            url.searchParams.set('lang', currentLanguage);
            history.replaceState(null, '', url);
        } catch { /* history unavailable */ }
    }
    listeners.forEach(callback => callback(currentLanguage));
}

/** Language order: ?lang= in the link, then a saved choice, then the browser language. */
export function initLanguage() {
    if (typeof document === 'undefined') return currentLanguage;
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* storage unavailable */ }
    const requested = new URLSearchParams(location.search).get('lang');
    const browser = (navigator.language || '').toLowerCase().startsWith('it') ? 'it' : 'en';
    const initial = LANGUAGES.includes(requested) ? requested : LANGUAGES.includes(saved) ? saved : browser;
    // Persist only an explicit choice (link or button), never the browser guess.
    setLanguage(initial, { persist: LANGUAGES.includes(requested) });

    document.querySelectorAll('[data-lang]').forEach(button =>
        button.addEventListener('click', () => setLanguage(button.dataset.lang)));
    const nav = document.querySelector('.language');
    if (nav) nav.hidden = false;
    return currentLanguage;
}
