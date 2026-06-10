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
        mode: "gitea",
        giteaBase: "https://git.eden-emu.dev",
        giteaRepo: "eden-emu/eden",
        filter: asset => asset.name.includes('Windows') && asset.name.includes('amd64') && asset.name.includes('msvc') && asset.name.endsWith('standard.zip'),
        regex: /("switch"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Eden (Android)",
        mode: "gitea",
        giteaBase: "https://git.eden-emu.dev",
        giteaRepo: "eden-emu/eden",
        filter: asset => asset.name.includes('Android') && asset.name.endsWith('standard.apk'),
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
    {
        name: "RPCS3 (PC)",
        repo: "RPCS3/rpcs3-binaries-win",
        filter: asset => asset.name.includes('win64_msvc.7z') && !asset.name.includes('.sha256'),
        regex: /("ps3"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Xemu (PC)",
        repo: "xemu-project/xemu",
        filter: asset => asset.name.includes('windows-x86_64.zip') && !asset.name.includes('dbg') && !asset.name.includes('pdb'),
        regex: /("xemu"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Cemu (Android)",
        repo: "SSimco/Cemu",
        filter: asset => asset.name.endsWith('.apk'),
        regex: /("wiiu"[\s\S]*?"android"[\s\S]*?"url":\s*")([^"]+)(")/
    },



    // --- INCREMENTAL AND SCRAPER PROGRAMS (Non-GitHub) ---
    {
        name: "WizTree",
        mode: "wiztree",
        regex: /("wiztree"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "PPSSPP (PC)",
        mode: "ppsspp",
        regex: /("psp"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "ScummVM",
        mode: "scummvm",
        regex: /("scummvm"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Dolphin (PC)",
        mode: "dolphin",
        regex: /("gc_wii"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "RetroArch (PC)",
        mode: "retroarch",
        regex: /("retroarch"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "7-Zip",
        mode: "7zip",
        regex: /("7-zip"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "VLC",
        mode: "vlc",
        regex: /("vlc-media-player"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "WinRAR",
        mode: "winrar",
        regex: /("winrar"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Everything",
        mode: "everything",
        regex: /("everything"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "LibreOffice",
        mode: "increment",
        // Current: https://download.documentfoundation.org/libreoffice/stable/25.8.4/win/x86_64/LibreOffice_25.8.4_Win_x86-64.msi
        regex: /("libreoffice"[\s\S]*?"url":\s*")([^"]+)(")/
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
    },
    {
        name: "Bitwarden",
        repo: "bitwarden/clients",
        tagPrefix: "desktop-v",
        filter: asset => asset.name.startsWith('Bitwarden-Installer-') && asset.name.endsWith('.exe'),
        regex: /("bitwarden-desktop"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Antigravity IDE",
        mode: "antigravity",
        regex: /("antigravity"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Cheat Engine",
        mode: "cheatengine",
        regex: /("cheat-engine"[\s\S]*?"url":\s*")([^"]+)(")/
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
        } else if (prog.mode === 'gitea') {
            updatesCount += await updateGiteaRelease(
                prog.name,
                prog.giteaBase,
                prog.repo,
                prog.filter,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        } else if (prog.mode === 'antigravity') {
            updatesCount += await checkAntigravityUrl(
                prog.name,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        } else if (prog.mode === 'gitea') {
            updatesCount += await updateGiteaRelease(
                prog.name,
                prog.giteaBase,
                prog.giteaRepo,
                prog.filter,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        } else if (prog.mode === 'ppsspp') {
            updatesCount += await checkPpssppUrl(
                prog.name,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        } else if (prog.mode === 'retroarch') {
            updatesCount += await checkRetroarchUrl(
                prog.name,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        } else if (prog.mode === 'dolphin') {
            updatesCount += await checkWebScrapeUrl(prog.name, prog.regex, newContent, (updatedContent) => { newContent = updatedContent; },
                'https://dolphin-emu.org/download/',
                /https:\/\/dl\.dolphin-emu\.org\/releases\/2[0-9]{3}\/dolphin-[^\/]+-x64\.7z/i);
        } else if (prog.mode === '7zip') {
            updatesCount += await checkWebScrapeUrl(prog.name, prog.regex, newContent, (updatedContent) => { newContent = updatedContent; },
                'https://www.7-zip.org/download.html',
                /a\/7z[0-9]+-x64\.exe/i,
                'https://www.7-zip.org/');
        } else if (prog.mode === 'winrar') {
            updatesCount += await checkWebScrapeUrl(prog.name, prog.regex, newContent, (updatedContent) => { newContent = updatedContent; },
                'https://www.rarlab.com/download.htm',
                /rar\/winrar-x64-[0-9]+\.exe/i,
                'https://www.rarlab.com/');
        } else if (prog.mode === 'vlc') {
            updatesCount += await checkWebScrapeUrl(prog.name, prog.regex, newContent, (updatedContent) => { newContent = updatedContent; },
                'https://www.videolan.org/vlc/download-windows.html',
                /vlc-[0-9\.]+-win64\.exe/i,
                'https://mirror.init7.net/videolan/vlc/{version}/win64/');
        } else if (prog.mode === 'wiztree') {
            updatesCount += await checkWebScrapeUrl(prog.name, prog.regex, newContent, (updatedContent) => { newContent = updatedContent; },
                'https://diskanalyzer.com/download',
                /files\/wiztree_[0-9_]+_setup\.exe/i,
                'https://diskanalyzer.com/');
        } else if (prog.mode === 'scummvm') {
            updatesCount += await checkWebScrapeUrl(prog.name, prog.regex, newContent, (updatedContent) => { newContent = updatedContent; },
                'https://www.scummvm.org/downloads/',
                /scummvm-[0-9\.]+-win32\.exe/i,
                'https://downloads.scummvm.org/frs/scummvm/{version}/');
        } else if (prog.mode === 'everything') {
            updatesCount += await checkWebScrapeUrl(prog.name, prog.regex, newContent, (updatedContent) => { newContent = updatedContent; },
                'https://www.voidtools.com/downloads/',
                /Everything-[0-9\.]+\.x64-Setup\.exe/i,
                'https://www.voidtools.com/');
        } else if (prog.mode === 'cheatengine') {
            updatesCount += await checkWebScrapeUrl(prog.name, prog.regex, newContent, (updatedContent) => { newContent = updatedContent; },
                'https://www.cheatengine.org/downloads.php',
                /https:\/\/[a-z0-9]+\.cloudfront\.net\/[a-z0-9]+\/[a-z0-9]+\.exe/i);
        } else {
            // Default: GitHub Release Asset
            updatesCount += await updateGithubRelease(
                prog.name,
                prog.repo,
                prog.filter,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; },
                prog.tagPrefix
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

async function updateGithubRelease(name, repo, assetFilter, regexPattern, currentContent, updateCallback, tagPrefix) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [GitHub] ... `);

        const url = tagPrefix 
            ? `https://api.github.com/repos/${repo}/releases`
            : `https://api.github.com/repos/${repo}/releases/latest`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();

        let release = data;
        if (tagPrefix) {
            release = data.find(r => !r.draft && !r.prerelease && r.tag_name.startsWith(tagPrefix));
        }

        if (!release) {
            console.log(`❌ No matching release.`);
            return 0;
        }

        const asset = release.assets.find(assetFilter);
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

async function updateGiteaRelease(name, giteaBase, repo, assetFilter, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Gitea]  ... `);

        const url = `${giteaBase}/api/v1/repos/${repo}/releases/latest`;
        const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();

        const asset = (data.assets || []).find(assetFilter);
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

async function checkAntigravityUrl(name, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Probe]  ... `);

        const downloadPageUrl = 'https://antigravity.google/download';
        const r = await fetch(downloadPageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
        const text = await r.text();
        const jsFileUrls = getScriptUrls(text, downloadPageUrl);
        let winX64Match = extractAntigravityInstallerUrl(text);
        const jsFileMatch = winX64Match || jsFileUrls.length > 0;
        if (!jsFileMatch) {
            console.log(`❌ Could not find main JS bundle.`);
            return 0;
        }

        for (const jsFileUrl of jsFileUrls) {
            if (winX64Match) break;
            try {
                const bundleResponse = await fetch(jsFileUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
                const bundleText = await bundleResponse.text();
                winX64Match = extractAntigravityInstallerUrl(bundleText);
            } catch (err) { }
        }

        if (!winX64Match) {
            console.log(`❌ Could not extract URL from JS bundle.`);
            return 0;
        }

        const match = currentContent.match(regexPattern);
        if (match) {
            const currentUrl = match[2];
            if (currentUrl !== winX64Match) {
                console.log(`✨ UPDATE FOUND!`);
                console.log(`    Old: ${currentUrl}`);
                console.log(`    New: ${winX64Match}`);

                const updated = currentContent.replace(regexPattern, `$1${winX64Match}$3`);
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

function getScriptUrls(html, pageUrl) {
    const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js[^"']*)["']/ig)].map(match => match[1]);
    const fallbackBundles = [...html.matchAll(/(?:src=["']|["'(/])([^"'()]*main[^"'()]*\.js[^"'()]*)/ig)].map(match => match[1]);
    const urls = [...scriptSrcs, ...fallbackBundles]
        .map(src => src.replace(/^["'(/]+/, ''))
        .map(src => {
            try {
                return new URL(src, pageUrl).href;
            } catch {
                return null;
            }
        })
        .filter(Boolean);

    return [...new Set(urls)];
}

function extractAntigravityInstallerUrl(text) {
    const normalizedText = text
        .replace(/\\u002F/gi, '/')
        .replace(/\\u003A/gi, ':')
        .replace(/\\\//g, '/')
        .replace(/&amp;/g, '&');

    const urls = normalizedText.match(/https?:\/\/[^"'<>\s)]+\.exe/ig) || [];
    const cleanUrls = urls.map(url => url.replace(/\\x26/g, '&'));

    return cleanUrls.find(url =>
        /\/antigravity\/stable\//i.test(url) &&
        /\/windows-x64\//i.test(url) &&
        /Antigravity(?:%20|\+)IDE\.exe$/i.test(url)
    ) || cleanUrls.find(url =>
        /\/antigravity\/stable\//i.test(url) &&
        /\/windows-x64\//i.test(url) &&
        /\.exe$/i.test(url)
    ) || null;
}

async function checkPpssppUrl(name, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Probe]  ... `);
        const r = await fetch('https://www.ppsspp.org/download/', { signal: AbortSignal.timeout(5000) });
        const text = await r.text();
        const exeMatch = text.match(/https:\/\/www\.ppsspp\.org\/files\/[^\/]+\/PPSSPPSetup\.exe/i);
        if (!exeMatch) {
            console.log(`❌ Could not find PPSSPP installer URL on download page.`);
            return 0;
        }

        const newUrl = exeMatch[0];
        const match = currentContent.match(regexPattern);
        if (match) {
            if (match[2] !== newUrl) {
                console.log(`✨ UPDATE FOUND!`);
                console.log(`    Old: ${match[2]}`);
                console.log(`    New: ${newUrl}`);
                const updated = currentContent.replace(regexPattern, `$1${newUrl}$3`);
                updateCallback(updated);
                return 1;
            } else {
                console.log(`✅`);
            }
        }
    } catch (err) { console.log(`❌ Error: ${err.message}`); }
    return 0;
}

async function checkRetroarchUrl(name, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Probe]  ... `);
        const r = await fetch('https://buildbot.libretro.com/stable/', { signal: AbortSignal.timeout(5000) });
        const text = await r.text();
        const versions = [...text.matchAll(/href="\/stable\/([0-9]+\.[0-9]+\.[0-9]+)\/"/g)].map(m => m[1]);
        if (versions.length === 0) {
            console.log(`❌ Could not scrape RetroArch versions.`);
            return 0;
        }

        const latestVersion = versions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop();
        const newUrl = `https://buildbot.libretro.com/stable/${latestVersion}/windows/x86_64/RetroArch-Win64-setup.exe`;

        const match = currentContent.match(regexPattern);
        if (match) {
            if (match[2] !== newUrl) {
                console.log(`✨ UPDATE FOUND!`);
                console.log(`    Old: ${match[2]}`);
                console.log(`    New: ${newUrl}`);
                const updated = currentContent.replace(regexPattern, `$1${newUrl}$3`);
                updateCallback(updated);
                return 1;
            } else {
                console.log(`✅`);
            }
        }
    } catch (err) { console.log(`❌ Error: ${err.message}`); }
    return 0;
}

// Universal Web Scraper for predictable download links
async function checkWebScrapeUrl(name, regexPattern, currentContent, updateCallback, scrapeUrl, extractRegex, prependDomain = '') {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Probe]  ... `);
        const r = await fetch(scrapeUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
        const text = await r.text();
        const extractedMatch = text.match(extractRegex);

        if (!extractedMatch) {
            console.log(`❌ Could not find installer URL on ${scrapeUrl}`);
            return 0;
        }

        let newUrl = extractedMatch[0];

        // Handle prepending domains and special version injections
        if (prependDomain && !newUrl.startsWith('http')) {
            if (prependDomain.includes('{version}')) {
                // Try to extract version number from the matched string e.g vlc-3.0.23-win64.exe -> 3.0.23
                const verMatch = newUrl.match(/[0-9]+(?:\.[0-9]+)+/);
                if (verMatch) {
                    newUrl = prependDomain.replace('{version}', verMatch[0]) + newUrl;
                } else {
                    newUrl = 'https://' + newUrl; // Fallback
                }
            } else {
                newUrl = prependDomain + newUrl;
            }
        }

        const match = currentContent.match(regexPattern);
        if (match) {
            if (match[2] !== newUrl) {
                console.log(`✨ UPDATE FOUND!`);
                console.log(`    Old: ${match[2]}`);
                console.log(`    New: ${newUrl}`);
                const updated = currentContent.replace(regexPattern, `$1${newUrl}$3`);
                updateCallback(updated);
                return 1;
            } else {
                console.log(`✅`);
            }
        }
    } catch (err) { console.log(`❌ Error: ${err.message}`); }
    return 0;
}

main();
