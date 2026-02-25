const fs = require('fs');
const path = require('path');

// ==========================================
// 🛠️ CONFIGURATION - ADD NEW PROGRAMS HERE
// ==========================================
const PROGRAMS = [
    // --- EMULATORS (GitHub API) ---
    {
        name: "MelonDS",
        repo: "melonDS-emu/melonDS",
        filter: asset => asset.name.toLowerCase().includes('windows') && (asset.name.toLowerCase().includes('x64') || asset.name.toLowerCase().includes('x86_64')),
        regex: /("nds"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Eden (PC)",
        repo: "eden-emulator/Releases",
        filter: asset => asset.name.includes('Windows') && asset.name.includes('msvc') && asset.name.includes('standard.zip'),
        regex: /("switch"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Eden (Android)",
        repo: "eden-emulator/Releases",
        filter: asset => asset.name.includes('Android') && asset.name.includes('standard.apk'),
        regex: /("switch"[\s\S]*?"android"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Azahar (PC)",
        repo: "azahar-emu/azahar",
        filter: asset => asset.name.includes('windows-msvc.zip'),
        regex: /("3ds"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Azahar (Android)",
        repo: "azahar-emu/azahar",
        filter: asset => asset.name.includes('android-googleplay.apk'),
        regex: /("3ds"[\s\S]*?"android"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "mGBA",
        repo: "mgba-emu/mgba",
        filter: asset => asset.name.includes('-win64-installer.exe'),
        regex: /("gba"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "SameBoy",
        repo: "LIJI32/SameBoy",
        filter: asset => asset.name.includes('winsdl') && asset.name.endsWith('.zip'),
        regex: /("gbc"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Cemu (PC)",
        repo: "cemu-project/Cemu",
        filter: asset => asset.name.includes('windows-x64.zip'),
        regex: /("wiiu"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "PCSX2",
        repo: "PCSX2/pcsx2",
        filter: asset => asset.name.includes('windows-x64-Qt.7z'),
        regex: /("ps2"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },



    // --- INCREMENTAL CHECK PROGRAMS (Non-GitHub) ---
    {
        name: "WizTree",
        mode: "increment",
        // Current: https://diskanalyzer.com/files/wiztree_4_22_setup.exe
        regex: /("wiztree"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "PPSSPP (PC)",
        mode: "increment",
        // Current: https://www.ppsspp.org/files/1_19_3/PPSSPPSetup.exe
        regex: /("psp"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "ScummVM",
        mode: "increment",
        // Current: https://downloads.scummvm.org/frs/scummvm/2.9.1/scummvm-2.9.1-win32.exe
        regex: /("scummvm"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Dolphin (PC)",
        mode: "increment",
        // Current: https://dl.dolphin-emu.org/releases/2509/dolphin-2509-x64.7z
        regex: /("gc_wii"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "RetroArch (PC)",
        mode: "increment",
        // Current: https://buildbot.libretro.com/stable/1.22.2/windows/x86_64/RetroArch-Win64-setup.exe
        regex: /("retroarch"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "7-Zip",
        mode: "increment",
        // Current: https://www.7-zip.org/a/7z2408-x64.exe
        regex: /("7-zip"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "VLC",
        mode: "increment",
        // Current: https://mirror.init7.net/videolan/vlc/3.0.23/win64/vlc-3.0.23-win64.exe
        regex: /("vlc-media-player"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "LibreOffice",
        mode: "increment",
        // Current: https://download.documentfoundation.org/libreoffice/stable/25.8.4/win/x86_64/LibreOffice_25.8.4_Win_x86-64.msi
        regex: /("libreoffice"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "WinRAR",
        mode: "increment",
        // Current: https://www.rarlab.com/rar/winrar-x64-713.exe
        regex: /("winrar"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Everything",
        mode: "increment",
        // Current: https://www.voidtools.com/Everything-1.4.1.1023.x64-Setup.exe
        regex: /("everything"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Lucky Patcher",
        mode: "increment",
        // Current: https://chelpus.com/download/LuckyPatchers.com_Official_Installer_12.0.0.apk
        regex: /("lucky-patcher"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Happy Mod",
        mode: "increment",
        // Current: https://files.apkdlink.com/happymod/happymod-3.2.6.apk
        regex: /("happy-mod"[\s\S]*?"url":\s*")([^"]+)(")/
    },

    // --- PC PROGRAMS (GitHub API) ---
    {
        name: "ShareX",
        repo: "ShareX/ShareX",
        filter: asset => asset.name.includes('setup.exe'),
        regex: /("sharex"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "PowerToys",
        repo: "microsoft/PowerToys",
        filter: asset => asset.name.includes('UserSetup') && asset.name.includes('x64'),
        regex: /("powertoys"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Espanso",
        repo: "espanso/espanso",
        filter: asset => asset.name.includes('Win-Installer-x86_64.exe'),
        regex: /("espanso"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Obsidian",
        repo: "obsidianmd/obsidian-releases",
        filter: asset => asset.name.includes('.exe') && !asset.name.includes('arm64'),
        regex: /("obsidian"[\s\S]*?"url":\s*")([^"]+)(")/
    }
];


// ==========================================
// 🚀 MAIN SCRIPT LOGIC
// ==========================================
const DATA_FILE_PATH = path.join(__dirname, '../js/data.js');
const FILE_CONTENT = fs.readFileSync(DATA_FILE_PATH, 'utf8');

async function main() {
    console.log('Starting daily link check...');
    let newContent = FILE_CONTENT;
    let updatesCount = 0;

    // Iterate through configuration
    for (const prog of PROGRAMS) {
        if (prog.mode === 'increment') {
            updatesCount += await checkUrlIncrement(
                prog.name,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        } else {
            // Default: GitHub Release Asset
            updatesCount += await updateGithubRelease(
                prog.name,
                prog.repo,
                prog.filter,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        }
        // Polite delay between programs to avoid aggressive rate limiting
        await sleep(1500);
    }

    if (updatesCount > 0) {
        console.log(`\nTotal updates found: ${updatesCount}`);
        fs.writeFileSync(DATA_FILE_PATH, newContent, 'utf8');
        console.log('Updated js/data.js');
    } else {
        console.log('\nNo updates found.');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 🛠️ HELPER FUNCTIONS
// ==========================================

async function updateGithubRelease(name, repo, assetFilter, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [GitHub] ... `);

        const url = `https://api.github.com/repos/${repo}/releases/latest`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();

        const asset = data.assets.find(assetFilter);
        if (!asset) {
            console.log(`❌ No matching asset.`);
            return 0;
        }

        const newUrl = asset.browser_download_url;
        const match = currentContent.match(regexPattern);

        if (match) {
            const currentUrl = match[2];
            if (currentUrl !== newUrl) {
                console.log(`✨ UPDATE FOUND!`);
                console.log(`    Old: ${currentUrl}`);
                console.log(`    New: ${newUrl}`);

                const updated = currentContent.replace(regexPattern, `$1${newUrl}$3`);
                updateCallback(updated);
                return 1;
            } else {
                console.log(`✅`);
            }
        } else {
            console.log(`⚠️ Regex mismatch.`);
        }

    } catch (err) {
        console.log(`❌ Error: ${err.message}`);
    }
    return 0;
}

async function checkUrlIncrement(name, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Probe]  ... `);

        const match = currentContent.match(regexPattern);
        if (!match) {
            console.log(`⚠️ Regex mismatch.`);
            return 0;
        }

        let currentUrl = match[2];
        let bestUrl = currentUrl;
        let foundUpdate = false;

        // Find version string (last occurring segment of digits possibly separated by . or _)
        let versionMatch = currentUrl.match(/([0-9]+[._][0-9]+([._][0-9]+)?)/g);

        // Fallback for versions without separators (e.g. "2408" in 7z2408, "713" in winrar-713)
        // We look for at least 3 digits to avoid matching small numbers in IDs if possible, 
        // though strictly we just want to find *something* that looks like a version.
        if (!versionMatch) {
            versionMatch = currentUrl.match(/(\d{3,})/g);
        }

        if (!versionMatch) {
            console.log(`❓ Could not parse version.`);
            return 0;
        }
        let versionStr = versionMatch[versionMatch.length - 1];

        // Loop to find max version
        // Limit to 20 increments to avoid infinite loops
        for (let i = 0; i < 20; i++) {
            const separator = versionStr.includes('_') ? '_' : '.';
            const parts = versionStr.split(separator).map(Number);

            // Generate Candidates (Priority: Patch -> Minor -> Major)
            let candidates = [];

            // 1. Patch Increment
            let patchParts = [...parts];
            patchParts[patchParts.length - 1]++;
            candidates.push(patchParts.join(separator));

            // 2. Minor Increment
            if (parts.length >= 2) {
                let minorParts = [...parts];
                minorParts[parts.length - 2]++;
                for (let k = parts.length - 1; k > parts.length - 2; k--) minorParts[k] = 0;
                candidates.push(minorParts.join(separator));
            }

            // 3. Major Increment
            if (parts.length >= 2) {
                let majorParts = [...parts];
                majorParts[0]++;
                for (let k = 1; k < parts.length; k++) majorParts[k] = 0;
                candidates.push(majorParts.join(separator));
            }

            let stepSuccess = false;
            for (const nextVer of candidates) {
                if (nextVer === versionStr) continue;
                const nextUrl = currentUrl.replace(versionStr, nextVer);
                if (nextUrl === currentUrl) continue;

                try {
                    await sleep(1000);
                    const resp = await fetch(nextUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
                    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

                    bestUrl = nextUrl;
                    versionStr = nextVer;
                    currentUrl = nextUrl;
                    foundUpdate = true;
                    stepSuccess = true;
                    break;
                } catch (err) { }
            }

            if (!stepSuccess) break;
        }

        if (foundUpdate) {
            console.log(`✨ UPDATE FOUND!`);
            console.log(`    Old: ${match[2]}`);
            console.log(`    New: ${bestUrl}`);

            const updated = currentContent.replace(regexPattern, `$1${bestUrl}$3`);
            updateCallback(updated);
            return 1;
        } else {
            console.log(`✅ Up to date.`);
        }

    } catch (err) {
        console.log(`❌ Error: ${err.message}`);
    }
    return 0;
}



main();
