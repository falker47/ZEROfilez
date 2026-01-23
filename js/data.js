export const startupData = {
    "emulators": [
        {
            "id": "nds",
            "name": "Nintendo DS",
            "icon": "https://api.iconify.design/cib:nintendo-3ds.svg?color=white",
            "subtext": "MelonDS",
            "pc": {
                "url": "https://melonds.kuribo64.net/downloads/melonDS-windows-x86_64(1).zip"
            },
            "android": {
                "appId": "me.magnum.melonds",
                "appName": "melonDS",
                "url": "https://play.google.com/store/apps/details?id=me.magnum.melonds&pcampaignid=web_share"
            }
        },
        {
            "id": "gba",
            "name": "Game Boy Advance",
            "icon": "https://api.iconify.design/mage:gameboy-fill.svg?color=white",
            "subtext": "💻: mGBA\n📱: Pizza Boy GBA",
            "pc": {
                "url": "https://github.com/mgba-emu/mgba/releases/download/0.10.5/mGBA-0.10.5-win64-installer.exe"
            },
            "android": {
                "appId": "it.dbtecno.pizzaboygba.basic",
                "appName": "Pizza Boy GBA Basic",
                "url": "https://play.google.com/store/search?q=pizza%20boy%20a&c=apps&hl=it"
            }
        },
        {
            "id": "gbc",
            "name": "Game Boy Color",
            "icon": "https://api.iconify.design/mdi:nintendo-game-boy.svg?color=white",
            "subtext": "💻: SameBoy\n📱: Pizza Boy GBC",
            "pc": {
                "url": "https://github.com/LIJI32/SameBoy/releases/download/v1.0.2/sameboy_winsdl_v1.0.2.zip"
            },
            "android": {
                "appId": "it.dbtecno.pizzaboy",
                "appName": "Pizza Boy GBC",
                "url": "https://play.google.com/store/apps/details?id=it.dbtecno.pizzaboy"
            }
        },
        {
            "id": "switch",
            "name": "Nintendo Switch",
            "icon": "https://api.iconify.design/streamline-logos:nintendo-switch-logo-block.svg?color=white",
            "subtext": "Coming Soon...",
            "pc": null, // User did not provide links yet
            "android": null
        },
        {
            "id": "gc_wii",
            "name": "GameCube & Wii",
            "icon": "https://api.iconify.design/cib:wii.svg?color=white",
            "subtext": "Dolphin Emulator",
            "pc": {
                "url": "https://dl.dolphin-emu.org/releases/2509/dolphin-2509-x64.7z"
            },
            "android": {
                "appId": "org.dolphinemu.dolphinemu",
                "appName": "Dolphin Emulator",
                "url": "https://play.google.com/store/apps/details?id=org.dolphinemu.dolphinemu&hl=it"
            }
        },
        {
            "id": "3ds",
            "name": "Nintendo 3DS",
            "icon": "https://api.iconify.design/cib:nintendo-3ds.svg?color=white",
            "subtext": "Citra Emulator",
            "pc": {
                "url": "https://archive.org/download/citra-emu_202403/citra-windows-msvc-20240303-0ff3440_nightly.zip"
            },
            "android": {
                "url": "https://github.com/PabloMK7/citra/releases/download/r608383e/citra-android-universal-20240927-608383e.apk"
            }
        }
    ],
    "pc-programs": [
        // Browsers
        { "name": "Brave Browser", "url": "https://laptop-updates.brave.com/latest/win64", "icon": "https://cdn.simpleicons.org/brave/white" },
        { "name": "Google Chrome", "url": "https://dl.google.com/dl/chrome/install/googlechromestandaloneenterprise64.msi", "icon": "https://cdn.simpleicons.org/googlechrome/white" },
        { "name": "Mozilla Firefox", "url": "https://download.mozilla.org/?product=firefox-latest&os=win64&lang=en-US", "icon": "https://cdn.simpleicons.org/firefox/white" },

        // Basics
        { "name": "7-Zip", "url": "https://www.7-zip.org/a/7z2408-x64.exe", "icon": "https://api.iconify.design/simple-icons:7zip.svg?color=white" },
        { "name": "VLC Media Player", "url": "https://mirror.init7.net/videolan/vlc/3.0.23/win64/vlc-3.0.23-win64.exe", "icon": "https://cdn.simpleicons.org/vlcmediaplayer/white" },
        { "name": "Revo Uninstaller", "url": "https://download.revouninstaller.com/download/revosetup.exe", "icon": "https://api.iconify.design/arcticons:multi-app-uninstaller.svg?color=white" },
        { "name": "LibreOffice", "url": "https://download.documentfoundation.org/libreoffice/stable/25.8.4/win/x86_64/LibreOffice_25.8.4_Win_x86-64.msi", "icon": "https://cdn.simpleicons.org/libreoffice/white" },
        { "name": "WinRAR", "url": "https://www.rarlab.com/rar/winrar-x64-713.exe", "icon": "https://api.iconify.design/solar:winrar-outline.svg?color=white" }
    ],
    "apk-files": [
        { "name": "Lucky Patcher", "url": "https://chelpus.com/download/LuckyPatchers.com_Official_Installer_12.0.0.apk", "icon": "https://api.iconify.design/raphael:smile.svg?color=white" },
        { "name": "Happy Mod", "url": "https://files.apkdlink.com/happymod/happymod-3.2.6.apk", "icon": "https://api.iconify.design/arcticons:happymod.svg?color=white" }
    ]
};
