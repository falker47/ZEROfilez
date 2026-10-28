// Local icons: no runtime dependency on external icon CDNs.
// See assets/icons/README.md for source attribution and licenses.
export const ICONS = {
    // UI
    search: 'assets/icons/lucide-search.svg',
    download: 'assets/icons/lucide-download.svg',
    lock: 'assets/icons/lucide-lock.svg',
    emulationTab: 'assets/icons/emulation-controller-color.svg',
    arrowLeft: 'assets/icons/lucide-arrow-left.svg',
    arrowRight: 'assets/icons/lucide-arrow-right.svg',
    check: 'assets/icons/lucide-check.svg',
    reset: 'assets/icons/lucide-rotate-ccw.svg',
    close: 'assets/icons/lucide-x.svg',
    copy: 'assets/icons/lucide-copy.svg',
    setup: 'assets/icons/lucide-wand-sparkles.svg',
    info: 'assets/icons/lucide-info.svg',

    // Platforms and fallbacks
    windows: 'assets/icons/brand-windows-color.svg',
    android: 'assets/icons/brand-android-color.svg',
    nintendoFallback: 'assets/icons/lucide-gamepad-2.svg',
    windowsFallback: 'assets/icons/brand-windows-color.svg',
    laptop: 'assets/icons/lucide-laptop.svg',
    androidFallback: 'assets/icons/brand-android-color.svg',

    // Emulators
    nintendoDs: 'assets/icons/official-nintendo-ds.svg',
    gba: 'assets/icons/official-gameboy-advance.svg',
    gbc: 'assets/icons/official-gameboy-color.svg',
    switch: 'assets/icons/official-nintendo-switch.svg',
    wii: 'assets/icons/official-nintendo-wii.svg',
    nintendo3ds: 'assets/icons/official-nintendo-3ds.svg',
    psp: 'assets/icons/brand-playstationportable.svg',
    ps1: 'assets/icons/brand-playstation.svg',
    ps2: 'assets/icons/brand-playstation2.svg',
    ps3: 'assets/icons/brand-playstation3.svg',
    xbox: 'assets/icons/official-xbox.svg',
    retroArch: 'assets/icons/brand-retroarch.svg',
    scummvm: 'assets/icons/official-scummvm.svg',
    wiiu: 'assets/icons/official-nintendo-wiiu.svg',
    psvita: 'assets/icons/brand-playstationvita.svg',

    // Browsers
    brave: 'assets/icons/brand-brave-color.svg',
    chrome: 'assets/icons/brand-chrome-color.svg',
    firefox: 'assets/icons/brand-firefox-color.svg',

    // Programs
    sevenZip: 'assets/icons/brand-7zip.svg',
    vlc: 'assets/icons/original-vlc.svg',
    revo: 'assets/icons/original-revo.png',
    libreoffice: 'assets/icons/brand-libreoffice-color.svg',
    winrar: 'assets/icons/original-winrar.png',
    cheatEngine: 'assets/icons/original-cheatengine.png',
    sharex: 'assets/icons/original-sharex.png',
    wiztree: 'assets/icons/original-wiztree.png',
    patchmypc: 'assets/icons/original-patchmypc-color.svg',
    everything: 'assets/icons/original-everything.png',
    pcloud: 'assets/icons/official-pcloud.svg',
    espanso: 'assets/icons/official-espanso.png',
    obsidian: 'assets/icons/brand-obsidian-color.svg',
    marktext: 'assets/icons/official-marktext.png',
    powertoys: 'assets/icons/official-powertoys.png',
    claude: 'assets/icons/brand-claude-color.svg',
    chatgpt: 'chatgpt_icon_white.svg',
    hermes: 'assets/icons/official-hermes-agent.png',
    bitwarden: 'assets/icons/brand-bitwarden-color.svg',
    discord: 'assets/icons/brand-discord-color.svg',
    whatsapp: 'assets/icons/brand-whatsapp-color.svg',
    visualStudioCode: 'assets/icons/official-vscode.svg',
    notepadPlusPlus: 'assets/icons/original-notepadplusplus.png',

    // Android
    luckyPatcher: 'assets/icons/brand-luckypatcher.svg',
    happyMod: 'assets/icons/brand-happymod-color.svg',
    telegram: 'assets/icons/brand-telegram-color.svg',

    // Other
    tools: 'assets/icons/lucide-wrench.svg',
    pkhex: 'assets/icons/official-pkhex.png',
    pmdSaveEditor: 'assets/icons/official-skyeditor.png',
    web: 'assets/icons/lucide-globe.svg',
    panacea: 'panacea_icon_white.png',
    antigravity: 'assets/icons/brand-antigravity-color.svg',

};

// The catalog renderer uses the same image-source check for every card layout.
// .ico is recognized defensively, but entries in ICONS must use SVG/PNG instead.
export function isImageIcon(source) {
    return typeof source === 'string' && (
        /^https?:\/\//i.test(source) ||
        /\.(?:svg|png|jpe?g|webp|gif|ico)(?:[?#].*)?$/i.test(source)
    );
}
