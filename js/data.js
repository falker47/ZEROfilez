import { ICONS } from './icons.js';



export const ITEMS = {
    "emulators": {
        "nds": {
            "id": "nds",
            "name": "Nintendo DS",
            "icon": ICONS.nintendoDs,
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
        "gba": {
            "id": "gba",
            "name": "Game Boy Advance",
            "icon": ICONS.gba,
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
        "gbc": {
            "id": "gbc",
            "name": "Game Boy Color",
            "icon": ICONS.gbc,
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
        "switch": {
            "id": "switch",
            "name": "Nintendo Switch",
            "icon": ICONS.switch,
            "subtext": "Coming Soon...",
            "pc": null, // User did not provide links yet
            "android": null
        },
        "gc_wii": {
            "id": "gc_wii",
            "name": "GameCube & Wii",
            "icon": ICONS.wii,
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
        "3ds": {
            "id": "3ds",
            "name": "Nintendo 3DS",
            "icon": ICONS.nintendo3ds,
            "subtext": "Citra Emulator",
            "pc": {
                "url": "https://archive.org/download/citra-emu_202403/citra-windows-msvc-20240303-0ff3440_nightly.zip"
            },
            "android": {
                "url": "https://github.com/PabloMK7/citra/releases/download/r608383e/citra-android-universal-20240927-608383e.apk"
            }
        },
        "psp": {
            "id": "psp",
            "name": "PlayStation Portable",
            "icon": ICONS.psp,
            "subtext": "PPSSPP",
            "pc": {
                "url": "https://www.ppsspp.org/files/1_19_3/PPSSPPSetup.exe"
            },
            "android": {
                "appId": "org.ppsspp.ppsspp",
                "appName": "PPSSPP",
                "url": "https://play.google.com/store/apps/details?id=org.ppsspp.ppsspp"
            }
        },
        "ps1": {
            "id": "ps1",
            "name": "PlayStation 1",
            "icon": ICONS.ps1,
            "subtext": "ePSXe",
            "pc": {
                "url": "https://www.epsxe.com/files/ePSXe2018.zip"
            },
            "android": {
                "appId": "com.epsxe.ePSXe",
                "appName": "ePSXe",
                "url": "https://play.google.com/store/apps/details?id=com.epsxe.ePSXe&hl=en"
            }
        },
        "ps2": {
            "id": "ps2",
            "name": "PlayStation 2",
            "icon": ICONS.ps2,
            "subtext": "PCSX2",
            "pc": {
                "url": "https://github.com/PCSX2/pcsx2/releases/download/v2.6.2/pcsx2-v2.6.2-windows-x64-Qt.7z"
            },
            "android": null
        }
    },
    "pc-programs": {
        // Browsers
        "brave-browser": { "id": "brave-browser", "name": "Brave Browser", "url": "https://laptop-updates.brave.com/latest/win64", "icon": ICONS.brave },
        "google-chrome": { "id": "google-chrome", "name": "Google Chrome", "url": "https://dl.google.com/dl/chrome/install/googlechromestandaloneenterprise64.msi", "icon": ICONS.chrome },
        "mozilla-firefox": { "id": "mozilla-firefox", "name": "Mozilla Firefox", "url": "https://download.mozilla.org/?product=firefox-latest&os=win64&lang=en-US", "icon": ICONS.firefox },

        // Basics
        "7-zip": { "id": "7-zip", "name": "7-Zip", "url": "https://www.7-zip.org/a/7z2408-x64.exe", "icon": ICONS.sevenZip },
        "vlc-media-player": { "id": "vlc-media-player", "name": "VLC Media Player", "url": "https://mirror.init7.net/videolan/vlc/3.0.23/win64/vlc-3.0.23-win64.exe", "icon": ICONS.vlc },
        "revo-uninstaller": { "id": "revo-uninstaller", "name": "Revo Uninstaller", "url": "https://download.revouninstaller.com/download/revosetup.exe", "icon": ICONS.revo },
        "libreoffice": { "id": "libreoffice", "name": "LibreOffice", "url": "https://download.documentfoundation.org/libreoffice/stable/25.8.4/win/x86_64/LibreOffice_25.8.4_Win_x86-64.msi", "icon": ICONS.libreoffice },
        "winrar": { "id": "winrar", "name": "WinRAR", "url": "https://www.rarlab.com/rar/winrar-x64-713.exe", "icon": ICONS.winrar },

        // Utilities
        "sharex": { "id": "sharex", "name": "ShareX", "url": "https://github.com/ShareX/ShareX/releases/download/v18.0.1/ShareX-18.0.1-setup.exe", "icon": ICONS.sharex },
        "wiztree": { "id": "wiztree", "name": "WizTree", "url": "https://diskanalyzer.com/files/wiztree_4_22_setup.exe", "icon": ICONS.wiztree },
        "powertoys": { "id": "powertoys", "name": "PowerToys", "url": "https://github.com/microsoft/PowerToys/releases/download/v0.94.2/PowerToysUserSetup-0.94.2-x64.exe", "icon": ICONS.powertoys },
        "patch-my-pc": { "id": "patch-my-pc", "name": "Patch My PC", "url": "https://patchmypc.com/freeupdater/PatchMyPC.exe", "icon": ICONS.patchmypc },
        "everything": { "id": "everything", "name": "Everything", "url": "https://www.voidtools.com/Everything-1.4.1.1023.x64-Setup.exe", "icon": ICONS.everything },
        "espanso": { "id": "espanso", "name": "Espanso", "url": "https://github.com/espanso/espanso/releases/latest/download/Espanso-Win-Installer-x86_64.exe", "icon": ICONS.espanso },
        "pcloud": { "id": "pcloud", "name": "pCloud", "url": "https://static.pcloud.com/pcloudDrive/pcloud-drive-latest.exe", "icon": ICONS.pcloud },
        "obsidian": { "id": "obsidian", "name": "Obsidian", "url": "https://github.com/obsidianmd/obsidian-releases/releases/download/v1.11.5/Obsidian-1.11.5.exe", "icon": ICONS.obsidian }
    },
    "apk-files": {
        "lucky-patcher": { "id": "lucky-patcher", "name": "Lucky Patcher", "url": "https://chelpus.com/download/LuckyPatchers.com_Official_Installer_12.0.0.apk", "icon": ICONS.luckyPatcher },
        "happy-mod": { "id": "happy-mod", "name": "Happy Mod", "url": "https://files.apkdlink.com/happymod/happymod-3.2.6.apk", "icon": ICONS.happyMod },
        "telegram": { "id": "telegram", "name": "Telegram", "url": "https://telegram.org/dl/android/apk", "icon": ICONS.telegram }
    }
};
