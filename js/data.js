import { ICONS } from './icons.js';



export const ITEMS = {
    "emulation": {
        "nds": {
            "id": "nds",
            "name": "Nintendo DS",
            "icon": ICONS.nintendoDs,
            "subtext": "MelonDS",
            "pc": {
                "url": "https://github.com/melonDS-emu/melonDS/releases/download/1.1/melonDS-1.1-windows-x86_64.zip"
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
            "subtext": "Eden Emulator",
            "pc": {
                "url": "https://github.com/eden-emulator/Releases/releases/download/v0.2.0-rc1/Eden-Windows-v0.2.0-rc1-amd64-msvc-standard.zip"
            },
            "android": {
                "url": "https://github.com/eden-emulator/Releases/releases/download/v0.2.0-rc1/Eden-Android-v0.2.0-rc1-standard.apk"
            }
        },
        "scummvm": {
            "id": "scummvm",
            "name": "Old PC Games",
            "icon": ICONS.scummvm,
            "subtext": "ScummVM",
            "pc": {
                "url": "https://downloads.scummvm.org/frs/scummvm/2.9.1/scummvm-2.9.1-win32.exe"
            },
            "android": {
                "appId": "org.scummvm.scummvm",
                "appName": "ScummVM",
                "url": "https://play.google.com/store/apps/details?id=org.scummvm.scummvm"
            }
        },
        "wiiu": {
            "id": "wiiu",
            "name": "Wii U",
            "icon": ICONS.wiiu,
            "subtext": "Cemu",
            "pc": {
                "url": "https://github.com/cemu-project/Cemu/releases/download/v2.6/cemu-2.6-windows-x64.zip"
            },
            "android": {
                "url": "https://github.com/SSimco/Cemu/releases/download/0.03/Cemu-0.3.apk"
            }
        },
        "psvita": {
            "id": "psvita",
            "name": "PS Vita",
            "icon": ICONS.psvita,
            "subtext": "Vita3K",
            "pc": {
                "url": "https://github.com/Vita3K/Vita3K/releases/download/continuous/windows-latest.zip?time=1769420982148"
            },
            "android": {
                "url": "https://github.com/Vita3K/Vita3K/releases/download/continuous/android-latest.apk?time=1769420982148"
            }
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
            "subtext": "Azahar",
            "pc": {
                "url": "https://github.com/azahar-emu/azahar/releases/download/2124.3/azahar-2124.3-windows-msvc.zip"
            },
            "android": {
                "url": "https://github.com/azahar-emu/azahar/releases/download/2124.3/azahar-2124.3-android-googleplay.apk"
            }
        },
        "psp": {
            "id": "psp",
            "name": "PlayStation Portable",
            "icon": ICONS.psp,
            "subtext": "PPSSPP",
            "pc": {
                "url": "https://www.ppsspp.org/files/1_19_184/PPSSPPSetup.exe"
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
                "url": "https://github.com/PCSX2/pcsx2/releases/download/v2.6.3/pcsx2-v2.6.3-windows-x64-Qt.7z"
            },
            "android": null
        },
        "ps3": {
            "id": "ps3",
            "name": "PlayStation 3",
            "icon": ICONS.ps3,
            "subtext": "RPCS3",
            "pc": {
                "url": "https://github.com/RPCS3/rpcs3-binaries-win/releases/download/build-0ee3e24b25a119ac8810c30a5065ab846419214b/rpcs3-v0.0.39-18736-0ee3e24b_win64_msvc.7z"
            },
            "android": null
        },
        "xemu": {
            "id": "xemu",
            "name": "Xbox",
            "icon": ICONS.xbox,
            "subtext": "Xemu",
            "pc": {
                "url": "https://github.com/xemu-project/xemu/releases/latest/download/xemu-0.8.133-windows-x86_64.zip"
            },
            "android": null
        },
        "xenia": {
            "id": "xenia",
            "name": "Xbox 360",
            "icon": ICONS.xbox,
            "subtext": "Xenia",
            "pc": {
                "url": "https://github.com/xenia-project/release-builds-windows/releases/latest/download/xenia_master.zip"
            },
            "android": null
        },
        "retroarch": {
            "id": "retroarch",
            "name": "Multi-System",
            "icon": ICONS.retroArch,
            "subtext": "RetroArch",
            "pc": {
                "url": "https://buildbot.libretro.com/stable/1.22.2/windows/x86_64/RetroArch-Win64-setup.exe"
            },
            "android": {
                "url": "https://buildbot.libretro.com/stable/1.22.2/android/RetroArch.apk"
            }
        },
        "pkhex": {
            "id": "pkhex",
            "name": "PKHeX",
            "icon": ICONS.pkhex,
            "subtext": "Pokémon Save Editor",
            "pc": {
                "url": "https://projectpokemon.org/home/files/file/1-pkhex/"
            },
            "web": {
                "url": "https://pkhex-web.github.io/"
            }
        },
        "pmd-save-editor": {
            "id": "pmd-save-editor",
            "name": "PMD Save Editor",
            "icon": ICONS.pkhex,
            "subtext": "Pokémon Mystery Dungeon",
            "pc": {
                "url": "https://github.com/falker47/FileStorage/raw/main/SkyEditor.SaveEditor.zip"
            },
            "web": {
                "url": "https://pokemonmysterydungeon-saveditor.netlify.app/"
            }
        },
        "gba-hackrom-tools": {
            "id": "gba-hackrom-tools",
            "name": "HackROM Tools Pack",
            "icon": ICONS.tools,
            "subtext": "Pokemon Hack Rom Tools GBA",
            "pc": {
                "url": "https://github.com/falker47/FileStorage/raw/main/GBA_HackROM_Toolz%5BZEROfilezRepack%5D.zip"
            }
        }
    },
    "pc-programs": {
        // Browsers
        "brave-browser": { "id": "brave-browser", "name": "Brave Browser", "url": "https://laptop-updates.brave.com/latest/win64", "icon": ICONS.brave },
        "google-chrome": { "id": "google-chrome", "name": "Google Chrome", "url": "https://dl.google.com/dl/chrome/install/googlechromestandaloneenterprise64.msi", "icon": ICONS.chrome },
        "mozilla-firefox": { "id": "mozilla-firefox", "name": "Mozilla Firefox", "url": "https://download.mozilla.org/?product=firefox-latest&os=win64&lang=en-US", "icon": ICONS.firefox },

        // Basics
        "7-zip": { "id": "7-zip", "name": "7-Zip", "url": "https://www.7-zip.org/a/7z2409-x64.exe", "icon": ICONS.sevenZip },
        "vlc-media-player": { "id": "vlc-media-player", "name": "VLC Media Player", "url": "https://mirror.init7.net/videolan/vlc/3.0.23/win64/vlc-3.0.23-win64.exe", "icon": ICONS.vlc },
        "revo-uninstaller": { "id": "revo-uninstaller", "name": "Revo Uninstaller", "url": "https://download.revouninstaller.com/download/revosetup.exe", "icon": ICONS.revo },
        "libreoffice": { "id": "libreoffice", "name": "LibreOffice", "url": "https://download.documentfoundation.org/libreoffice/stable/25.8.4/win/x86_64/LibreOffice_25.8.4_Win_x86-64.msi", "icon": ICONS.libreoffice },
        "winrar": { "id": "winrar", "name": "WinRAR", "url": "https://www.rarlab.com/rar/winrar-x64-713.exe", "icon": ICONS.winrar },

        // Utilities
        "sharex": { "id": "sharex", "name": "ShareX", "url": "https://github.com/ShareX/ShareX/releases/download/v19.0.2/ShareX-19.0.2-setup.exe", "icon": ICONS.sharex },
        "wiztree": { "id": "wiztree", "name": "WizTree", "url": "https://diskanalyzer.com/files/wiztree_4_28_setup.exe", "icon": ICONS.wiztree },
        "powertoys": { "id": "powertoys", "name": "PowerToys", "url": "https://github.com/microsoft/PowerToys/releases/download/v0.97.2/PowerToysUserSetup-0.97.2-x64.exe", "icon": ICONS.powertoys },
        "patch-my-pc": { "id": "patch-my-pc", "name": "Patch My PC", "url": "https://patchmypc.com/freeupdater/PatchMyPC.exe", "icon": ICONS.patchmypc },
        "everything": { "id": "everything", "name": "Everything", "url": "https://www.voidtools.com/Everything-1.4.1.1023.x64-Setup.exe", "icon": ICONS.everything },
        "espanso": { "id": "espanso", "name": "Espanso", "url": "https://github.com/espanso/espanso/releases/download/v2.3.0/Espanso-Win-Installer-x86_64.exe", "icon": ICONS.espanso },
        "pcloud": { "id": "pcloud", "name": "pCloud", "url": "https://static.pcloud.com/pcloudDrive/pcloud-drive-latest.exe", "icon": ICONS.pcloud },
        "obsidian": { "id": "obsidian", "name": "Obsidian", "url": "https://github.com/obsidianmd/obsidian-releases/releases/download/v1.11.7/Obsidian-1.11.7.exe", "icon": ICONS.obsidian }
    },
    "apk-files": {
        "lucky-patcher": { "id": "lucky-patcher", "name": "Lucky Patcher", "url": "https://chelpus.com/download/LuckyPatchers.com_Official_Installer_12.0.2.apk", "icon": ICONS.luckyPatcher },
        "happy-mod": { "id": "happy-mod", "name": "Happy Mod", "url": "https://files.apkdlink.com/happymod/happymod-3.2.6.apk", "icon": ICONS.happyMod },
        "telegram": { "id": "telegram", "name": "Telegram", "url": "https://telegram.org/dl/android/apk", "icon": ICONS.telegram }
    }
};
