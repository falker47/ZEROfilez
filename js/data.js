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
                "url": "https://github.com/LIJI32/SameBoy/releases/download/v1.0.3/sameboy_winsdl_v1.0.3.zip"
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
                "url": "https://stable.eden-emu.dev/v0.2.1/Eden-Windows-v0.2.1-amd64-msvc-standard.zip"
            },
            "android": {
                "url": "https://stable.eden-emu.dev/v0.2.1/Eden-Android-v0.2.1-standard.apk"
            }
        },
        "scummvm": {
            "id": "scummvm",
            "name": "Old PC Games",
            "icon": ICONS.scummvm,
            "subtext": "ScummVM",
            "pc": {
                "url": "https://downloads.scummvm.org/frs/scummvm/2026.3.0/scummvm-2026.3.0-win32.exe"
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
                "url": "https://github.com/SSimco/Cemu/releases/download/0.5/Cemu-0.5.apk"
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
                "url": "https://dl.dolphin-emu.org/releases/2603/dolphin-2603-x64.7z"
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
                "url": "https://www.ppsspp.org/files/1_20_4/PPSSPPSetup.exe"
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
                "url": "https://github.com/PCSX2/pcsx2/releases/download/v2.8.2/pcsx2-v2.8.2-windows-x64-Qt.7z"
            },
            "android": null
        },
        "ps3": {
            "id": "ps3",
            "name": "PlayStation 3",
            "icon": ICONS.ps3,
            "subtext": "RPCS3",
            "pc": {
                "url": "https://github.com/RPCS3/rpcs3-binaries-win/releases/download/build-222754bfd3d2a482ea60b27d5661a12960491fd9/rpcs3-v0.0.43-20247-222754bf_win64_msvc.7z"
            },
            "android": null
        },
        "xemu": {
            "id": "xemu",
            "name": "Xbox",
            "icon": ICONS.xbox,
            "subtext": "Xemu",
            "pc": {
                "url": "https://github.com/xemu-project/xemu/releases/download/v0.8.136/xemu-0.8.136-windows-x86_64.zip"
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
        "brave-browser": { "id": "brave-browser", "name": "Brave Browser", "description": "Browse the web with built-in ad and tracker blocking.", "url": "https://laptop-updates.brave.com/latest/win64", "wingetId": "Brave.Brave", "icon": ICONS.brave },
        "google-chrome": { "id": "google-chrome", "name": "Google Chrome", "description": "Browse the web and sync bookmarks, passwords, and tabs across your devices.", "url": "https://dl.google.com/dl/chrome/install/googlechromestandaloneenterprise64.msi", "wingetId": "Google.Chrome", "icon": ICONS.chrome },
        "mozilla-firefox": { "id": "mozilla-firefox", "name": "Mozilla Firefox", "description": "Browse the web with built-in tracking protection and extensions.", "url": "https://download.mozilla.org/?product=firefox-latest&os=win64&lang=en-US", "wingetId": "Mozilla.Firefox", "icon": ICONS.firefox },

        // Basics
        "7-zip": { "id": "7-zip", "name": "7-Zip", "description": "Open compressed files or pack folders into smaller archives for storage and sharing.", "url": "https://github.com/ip7z/7zip/releases/download/26.04/7z2604-x64.exe", "wingetId": "7zip.7zip", "icon": ICONS.sevenZip },
        "vlc-media-player": { "id": "vlc-media-player", "name": "VLC Media Player", "description": "Play videos and music in most formats, with support for subtitles and DVDs.", "url": "https://mirror.init7.net/videolan/vlc/3.0.24/win64/vlc-3.0.24-win64.exe", "wingetId": "VideoLAN.VLC", "icon": ICONS.vlc },
        "revo-uninstaller": { "id": "revo-uninstaller", "name": "Revo Uninstaller", "description": "Uninstall unwanted programs, then find and remove the files and settings left behind.", "url": "https://download.revouninstaller.com/download/revosetup.exe", "wingetId": "RevoUninstaller.RevoUninstaller", "icon": ICONS.revo },
        "libreoffice": { "id": "libreoffice", "name": "LibreOffice", "description": "Create and edit documents, spreadsheets, and presentations, including files made with Microsoft Office.", "url": "https://download.documentfoundation.org/libreoffice/stable/26.8.1/win/x86_64/LibreOffice_26.8.1_Win_x86-64.msi", "wingetId": "TheDocumentFoundation.LibreOffice", "icon": ICONS.libreoffice },
        "winrar": { "id": "winrar", "name": "WinRAR", "description": "Open RAR and ZIP files, compress folders, and protect archives with a password.", "url": "https://www.rarlab.com/rar/winrar-x64-723.exe", "wingetId": "RARLab.WinRAR", "icon": ICONS.winrar },
        "cheat-engine": { "id": "cheat-engine", "name": "Cheat Engine", "description": "Find and change values such as health or money in offline single-player games.", "url": "https://d1ya6fb9ltsosh.cloudfront.net/DwtYwfn/jsog.exe", "icon": ICONS.cheatEngine },

        // Utilities
        "sharex": { "id": "sharex", "name": "ShareX", "description": "Take screenshots, add arrows or text, and record your screen to save or share.", "url": "https://github.com/ShareX/ShareX/releases/download/v19.0.2/ShareX-19.0.2-setup.exe", "wingetId": "ShareX.ShareX", "icon": ICONS.sharex },
        "wiztree": { "id": "wiztree", "name": "WizTree", "description": "See which files and folders take up the most space on your drives.", "url": "https://diskanalyzer.com/files/wiztree_4_33_setup.exe", "wingetId": "AntibodySoftware.WizTree", "icon": ICONS.wiztree },
        "powertoys": { "id": "powertoys", "name": "PowerToys", "description": "Arrange windows, change what keyboard keys do, and rename multiple files at once.", "url": "https://github.com/microsoft/PowerToys/releases/download/v0.101.2362.0/PowerToysUserSetup-0.101.2362.0-x64.exe", "wingetId": "Microsoft.PowerToys", "icon": ICONS.powertoys },
        "patch-my-pc": { "id": "patch-my-pc", "name": "Patch My PC", "description": "Install and update supported programs together without opening each installer one by one.", "url": "https://patchmypc.com/freeupdater/PatchMyPC.exe", "wingetId": "PatchMyPC.PatchMyPC", "icon": ICONS.patchmypc },
        "everything": { "id": "everything", "name": "Everything", "description": "Find files and folders by name, with matching results appearing as you type.", "url": "https://www.voidtools.com/Everything-1.4.1.1032.x64-Setup.exe", "wingetId": "voidtools.Everything", "icon": ICONS.everything },
        "espanso": { "id": "espanso", "name": "Espanso", "description": "Typed keywords expand into full phrases, email addresses, or other text you use often.", "url": "https://github.com/espanso/espanso/releases/download/v2.4.1/Espanso-Win-Installer-x86_64.exe", "wingetId": "Espanso.Espanso", "icon": ICONS.espanso },
        "pcloud": { "id": "pcloud", "name": "pCloud", "description": "Store files online, access them across your devices, and share them with a link.", "url": "https://www.pcloud.com/it/how-to-install-pcloud-drive-windows.html?download=windows-10-64bit", "wingetId": "pCloudAG.pCloudDrive", "icon": ICONS.pcloud },
        "obsidian": { "id": "obsidian", "name": "Obsidian", "description": "Write notes on your computer and connect related ideas using links between them.", "url": "https://github.com/obsidianmd/obsidian-releases/releases/download/v1.14.4/Obsidian-1.14.4.exe", "icon": ICONS.obsidian },
        "claude-desktop": { "id": "claude-desktop", "name": "Claude Desktop", "description": "Ask AI to draft or revise text, summarize documents, and explain unfamiliar topics.", "url": "https://downloads.claude.ai/releases/win32/ClaudeSetup.exe", "icon": ICONS.claude },
        "bitwarden-desktop": { "id": "bitwarden-desktop", "name": "Bitwarden Desktop", "description": "Store passwords, generate strong ones, and access your logins on different devices.", "url": "https://github.com/bitwarden/clients/releases/download/desktop-v2026.9.1/Bitwarden-Installer-2026.9.1.exe", "icon": ICONS.bitwarden },
        "discord": { "id": "discord", "name": "Discord", "description": "Chat with friends and communities through text, voice, or video, and share your screen.", "url": "https://discord.com/api/download?platform=win", "wingetId": "Discord.Discord", "icon": ICONS.discord },

        // Development
        "visual-studio-code": { "id": "visual-studio-code", "name": "Visual Studio Code", "description": "Write code for websites, apps, and scripts, with tools to find and fix errors.", "url": "https://update.code.visualstudio.com/latest/win32-x64-user/stable", "wingetId": "Microsoft.VisualStudioCode", "icon": ICONS.visualStudioCode },
        "notepad-plus-plus": { "id": "notepad-plus-plus", "name": "Notepad++", "description": "Write and edit text files, scripts, and code in many programming languages.", "url": "https://github.com/notepad-plus-plus/notepad-plus-plus/releases/download/v8.9.8.1/npp.8.9.8.1.Installer.x64.exe", "wingetId": "Notepad++.Notepad++", "icon": ICONS.notepadPlusPlus },

        // Custom
        "panacea": { "id": "panacea", "name": "Panacea", "description": "Clear temporary files, check memory and disk usage, and run Windows repair tools.", "url": "https://github.com/falker47/Panacea/releases/latest/download/Panacea.exe", "icon": ICONS.panacea },
        "antigravity": { "id": "antigravity", "name": "Antigravity IDE", "description": "Build apps with AI help to write code, fix errors, and run tests.", "url": "https://edgedl.me.gvt1.com/edgedl/release2/j0qc3/antigravity/stable/2.5.5-4923483625488384/windows-x64/Antigravity%20IDE.exe", "icon": ICONS.antigravity }
    },
    "apk-files": {
        "lucky-patcher": { "id": "lucky-patcher", "name": "Lucky Patcher", "url": "https://chelpus.com/download/LuckyPatchers.com_Official_Installer_12.0.2.apk", "icon": ICONS.luckyPatcher },
        "happy-mod": { "id": "happy-mod", "name": "Happy Mod", "url": "https://files.apkdlink.com/happymod/happymod-3.2.6.apk", "icon": ICONS.happyMod },
        "telegram": { "id": "telegram", "name": "Telegram", "url": "https://telegram.org/dl/android/apk", "icon": ICONS.telegram }
    }
};
