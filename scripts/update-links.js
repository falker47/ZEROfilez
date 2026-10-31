const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { inflateRawSync } = require('zlib');

const failedChecks = new Set();
function recordFailure(name, message) {
    failedChecks.add(name);
    console.log(message);
}

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
        filter: asset => /^azahar-windows-msvc-\d+(?:\.\d+)+\.zip$/i.test(asset.name),
        regex: /("3ds"[\s\S]*?"pc"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Azahar (Android)",
        repo: "azahar-emu/azahar",
        filter: asset => /^azahar-android-googleplay-\d+(?:\.\d+)+\.apk$/i.test(asset.name),
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
        name: "RetroArch (Android)",
        mode: "retroarch-android",
        regex: /("retroarch"[\s\S]*?"android"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "7-Zip",
        repo: "ip7z/7zip",
        filter: asset => /^7z\d+-x64\.exe$/i.test(asset.name),
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
        mode: "libreoffice",
        regex: /("libreoffice"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "Lucky Patcher",
        mode: "lucky-directory",
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
        name: "Notepad++",
        repo: "notepad-plus-plus/notepad-plus-plus",
        filter: asset => /^npp\.[0-9.]+\.Installer\.x64\.exe$/.test(asset.name),
        regex: /("notepad-plus-plus"[\s\S]*?"url":\s*")([^"]+)(")/
    },
    {
        name: "ShareX",
        repo: "ShareX/ShareX",
        filter: asset => /^ShareX-[0-9.]+-setup(?:-x64)?\.exe$/i.test(asset.name),
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
        name: "MarkText",
        repo: "marktext/marktext",
        filter: asset => /^marktext-win-x64-[0-9]+(?:\.[0-9]+)+-setup\.exe$/i.test(asset.name),
        regex: /("marktext"[\s\S]*?"url":\s*")([^"]+)(")/
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
        regex: /("cheat-engine"[\s\S]*?"url":\s*")([^"]+)(")/,
        checksumRegex: /("cheat-engine"[\s\S]*?"sha256":\s*")([a-f0-9]{64})(")/i
    },
    {
        name: "Hermes Agent",
        mode: "hermes",
        regex: /("hermes-agent"[\s\S]*?"url":\s*")([^"]+)(")/
    },
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
        } else if (prog.mode === 'antigravity') {
            updatesCount += await checkAntigravityUrl(
                prog.name,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        } else if (prog.mode === 'hermes') {
            updatesCount += await checkHermesAppInstallerUrl(prog.name, prog.regex, newContent, updated => { newContent = updated; });
        } else if (prog.mode === 'cheatengine') {
            updatesCount += await checkCheatEngineUrl(prog.name, prog.regex, prog.checksumRegex, newContent, updated => { newContent = updated; });
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
        } else if (prog.mode === 'retroarch' || prog.mode === 'retroarch-android') {
            updatesCount += await checkRetroarchUrl(
                prog.name,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; },
                prog.mode === 'retroarch-android' ? 'android' : 'pc'
            );
        } else if (prog.mode === 'lucky-directory') {
            updatesCount += await checkLuckyPatcherUrl(prog.name, prog.regex, newContent,
                (updatedContent) => { newContent = updatedContent; });
        } else if (prog.mode === 'libreoffice') {
            updatesCount += await checkLibreOfficeUrl(
                prog.name,
                prog.regex,
                newContent,
                (updatedContent) => { newContent = updatedContent; }
            );
        } else if (prog.mode === 'dolphin') {
            updatesCount += await checkDolphinUrl(prog.name, prog.regex, newContent,
                (updatedContent) => { newContent = updatedContent; });
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
    if (failedChecks.size > 0) {
        console.error('Link checks failed: ' + [...failedChecks].join(', '));
        process.exitCode = 1;
    }
}

const HERMES_APPINSTALLER_URL = 'https://hermes-assets.nousresearch.com/releases/win32/stable/stable.appinstaller';
const HERMES_PUBLISHER = 'CN=Nous Research Inc., O=Nous Research Inc., L=Austin, S=Texas, C=US';
const CHEAT_ENGINE_FEED_URL = 'https://community.chocolatey.org/api/v2/Packages()?$filter=Id%20eq%20%27cheatengine%27%20and%20IsLatestVersion';
const MAX_NUPKG_BYTES = 2 * 1024 * 1024;
const MAX_INSTALLER_BYTES = 200 * 1024 * 1024;

function xmlText(xml, name) {
    const match = String(xml).match(new RegExp(`<(?:(?:[A-Za-z0-9_]+):)?${name}>([\\s\\S]*?)<\\/(?:(?:[A-Za-z0-9_]+):)?${name}>`, 'i'));
    return match?.[1]?.replace(/<[^>]*>/g, '').trim()
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'") ?? null;
}

function extractChocolateyPackageMetadata(feedXml) {
    const entry = String(feedXml).match(/<entry\b[^>]*>([\s\S]*?)<\/entry>/i)?.[1];
    if (!entry) throw new Error('Chocolatey feed had no package entry');
    const version = xmlText(entry, 'Version');
    const author = xmlText(entry.match(/<author\b[^>]*>[\s\S]*?<\/author>/i)?.[0] ?? '', 'name');
    if (!/^\d+(?:\.\d+){1,3}(?:[-+][0-9A-Za-z.-]+)?$/.test(version ?? '')) {
        throw new Error('Chocolatey feed contained an invalid Cheat Engine version');
    }
    if (!author) throw new Error('Chocolatey feed did not identify the package author');
    return { version, author };
}

function extractNupkgEntry(nupkg, entryName, maxEntryBytes = 256 * 1024) {
    const zip = Buffer.isBuffer(nupkg) ? nupkg : Buffer.from(nupkg);
    const eocdSignature = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
    let eocd = -1;
    const minOffset = Math.max(0, zip.length - 22 - 0xffff);
    for (let offset = zip.length - 22; offset >= minOffset; offset--) {
        if (zip.readUInt32LE(offset) === eocdSignature.readUInt32LE(0) &&
            offset + 22 + zip.readUInt16LE(offset + 20) === zip.length) {
            eocd = offset;
            break;
        }
    }
    if (eocd < 0) throw new Error('Chocolatey package is not a valid ZIP/NuGet archive');

    const entryCount = zip.readUInt16LE(eocd + 10);
    let centralOffset = zip.readUInt32LE(eocd + 16);
    for (let index = 0; index < entryCount; index++) {
        if (centralOffset + 46 > zip.length || zip.readUInt32LE(centralOffset) !== 0x02014b50) {
            throw new Error('Chocolatey package has a malformed ZIP directory');
        }
        const flags = zip.readUInt16LE(centralOffset + 8);
        const method = zip.readUInt16LE(centralOffset + 10);
        const compressedSize = zip.readUInt32LE(centralOffset + 20);
        const uncompressedSize = zip.readUInt32LE(centralOffset + 24);
        const nameLength = zip.readUInt16LE(centralOffset + 28);
        const extraLength = zip.readUInt16LE(centralOffset + 30);
        const commentLength = zip.readUInt16LE(centralOffset + 32);
        const localOffset = zip.readUInt32LE(centralOffset + 42);
        const nameStart = centralOffset + 46;
        const name = zip.toString('utf8', nameStart, nameStart + nameLength);

        if (name.toLowerCase() === entryName.toLowerCase()) {
            if ((flags & 1) !== 0 || uncompressedSize > maxEntryBytes ||
                localOffset + 30 > zip.length || zip.readUInt32LE(localOffset) !== 0x04034b50) {
                throw new Error('Chocolatey install script entry was encrypted or exceeded its size limit');
            }
            const localNameLength = zip.readUInt16LE(localOffset + 26);
            const localExtraLength = zip.readUInt16LE(localOffset + 28);
            const dataStart = localOffset + 30 + localNameLength + localExtraLength;
            const dataEnd = dataStart + compressedSize;
            if (dataEnd > zip.length) throw new Error('Chocolatey install script entry is truncated');
            const compressed = zip.subarray(dataStart, dataEnd);
            let content;
            if (method === 0) content = Buffer.from(compressed);
            else if (method === 8) content = inflateRawSync(compressed, { maxOutputLength: maxEntryBytes });
            else throw new Error('Chocolatey install script uses an unsupported ZIP compression method');
            if (content.length !== uncompressedSize) throw new Error('Chocolatey install script size did not match its ZIP record');
            return content;
        }
        centralOffset += 46 + nameLength + extraLength + commentLength;
    }
    throw new Error('Chocolatey package did not include ' + entryName);
}

function extractChocolateyInstallerInfo(installScript) {
    const read64BitOrDefault = parameter => {
        const pattern = new RegExp(`-${parameter}(64(?:bit)?)?\\s+['\"]([^'\"]+)['\"]`, 'gi');
        const matches = [...String(installScript).matchAll(pattern)];
        const match = matches.find(candidate => candidate[1]) ?? matches[0];
        return match?.[2] ?? null;
    };
    const url = read64BitOrDefault('Url');
    const sha256 = read64BitOrDefault('Checksum');
    const checksumType = read64BitOrDefault('ChecksumType');
    if (!url || !/^https:\/\//i.test(url)) throw new Error('Chocolatey install script did not supply an HTTPS binary URL');
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.toLowerCase().endsWith('.cloudfront.net') ||
        !/\.exe$/i.test(parsedUrl.pathname) || parsedUrl.username || parsedUrl.password) {
        throw new Error('Chocolatey package URL was not a direct CloudFront EXE');
    }
    if (!/^[a-f0-9]{64}$/i.test(sha256 ?? '') || checksumType?.toLowerCase() !== 'sha256') {
        throw new Error('Chocolatey install script did not provide a SHA-256 checksum');
    }
    return { url, sha256: sha256.toUpperCase() };
}

function extractHermesAppInstallerInfo(manifestXml) {
    const xml = String(manifestXml);
    const appinstaller = xml.match(/<AppInstaller\b([^>]*)>/i)?.[1];
    const bundle = xml.match(/<MainBundle\b([^>]*)>/i)?.[1];
    if (!appinstaller || !bundle) throw new Error('Official Hermes App Installer XML was missing its bundle');
    const attribute = (text, name) => text.match(new RegExp(`\\b${name}\\s*=\\s*['\"]([^'\"]+)['\"]`, 'i'))?.[1] ?? null;
    const bundleUri = attribute(bundle, 'Uri');
    const publisher = attribute(bundle, 'Publisher');
    const version = attribute(bundle, 'Version');
    const parsedUri = new URL(bundleUri ?? 'https://invalid.invalid');
    if (publisher !== HERMES_PUBLISHER) throw new Error('Hermes App Installer publisher did not match Nous Research');
    if (parsedUri.protocol !== 'https:' || parsedUri.hostname !== 'hermes-assets.nousresearch.com' ||
        !parsedUri.pathname.startsWith('/releases/') || !parsedUri.pathname.endsWith('.msixbundle')) {
        throw new Error('Hermes bundle URI was outside the official release host');
    }
    if (!/^\d+(?:\.\d+){2,3}$/.test(version ?? '')) throw new Error('Hermes App Installer version was invalid');
    return { bundleUri, publisher, version };
}

async function readResponseBytes(response, maxBytes) {
    const declaredLength = Number(response.headers.get('content-length') ?? 0);
    if (declaredLength > maxBytes) throw new Error('Response exceeded the configured size limit');
    if (!response.body) return Buffer.alloc(0);
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.byteLength;
            if (length > maxBytes) {
                await reader.cancel();
                throw new Error('Response exceeded the configured size limit');
            }
            chunks.push(Buffer.from(value));
        }
    } finally {
        reader.releaseLock();
    }
    return Buffer.concat(chunks, length);
}

function isPortableExecutable(file) {
    if (!Buffer.isBuffer(file) || file.length < 64 || file.toString('ascii', 0, 2) !== 'MZ') return false;
    const peOffset = file.readUInt32LE(0x3c);
    return peOffset >= 64 && peOffset + 4 <= file.length && file.toString('ascii', peOffset, peOffset + 4) === 'PE\0\0';
}

async function fetchChocolateyCheatEngineInfo() {
    const headers = { 'User-Agent': 'ZEROfilez link updater', Accept: 'application/atom+xml' };
    const feed = await fetch(CHEAT_ENGINE_FEED_URL, { headers, signal: AbortSignal.timeout(20000) });
    if (!feed.ok) throw new Error('Chocolatey package feed returned HTTP ' + feed.status);
    const metadata = extractChocolateyPackageMetadata(await feed.text());
    if (metadata.author.trim().toLowerCase() !== 'dark byte') {
        throw new Error('Latest Chocolatey package author was not Dark Byte');
    }

    const packageResponse = await fetch(`https://community.chocolatey.org/api/v2/package/cheatengine/${encodeURIComponent(metadata.version)}`, {
        headers: { 'User-Agent': 'ZEROfilez link updater', Accept: 'application/octet-stream' },
        signal: AbortSignal.timeout(20000)
    });
    if (!packageResponse.ok) throw new Error('Chocolatey package download returned HTTP ' + packageResponse.status);
    const nupkg = await readResponseBytes(packageResponse, MAX_NUPKG_BYTES);
    if (nupkg.subarray(0, 2).toString('ascii') !== 'PK') throw new Error('Chocolatey package response was not a NuGet ZIP');
    const installScript = extractNupkgEntry(nupkg, 'tools/chocolateyInstall.ps1').toString('utf8');
    return { ...metadata, ...extractChocolateyInstallerInfo(installScript) };
}

async function verifyCheatEngineHeaders(url) {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error('Cheat Engine binary returned HTTP ' + response.status);
    const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? '';
    const length = Number(response.headers.get('content-length') ?? 0);
    if (!['application/octet-stream', 'application/x-msdownload'].includes(contentType)) {
        throw new Error('Cheat Engine endpoint returned a non-binary Content-Type');
    }
    if (length < 1024 * 1024 || length > MAX_INSTALLER_BYTES) throw new Error('Cheat Engine endpoint had an unexpected Content-Length');
    if (response.url && new URL(response.url).hostname.toLowerCase() !== new URL(url).hostname.toLowerCase()) {
        throw new Error('Cheat Engine URL redirected to a different host');
    }
    return { contentType, length, contentDisposition: response.headers.get('content-disposition') };
}

async function downloadAndVerifyCheatEngine(info) {
    const response = await fetch(info.url, {
        headers: { 'User-Agent': 'ZEROfilez link updater', Accept: 'application/octet-stream' },
        redirect: 'follow',
        signal: AbortSignal.timeout(120000)
    });
    if (!response.ok) throw new Error('Cheat Engine download returned HTTP ' + response.status);
    const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? '';
    if (!['application/octet-stream', 'application/x-msdownload'].includes(contentType)) {
        throw new Error('Cheat Engine download returned a non-binary Content-Type');
    }
    if (response.url && new URL(response.url).hostname.toLowerCase() !== new URL(info.url).hostname.toLowerCase()) {
        throw new Error('Cheat Engine download redirected to a different host');
    }
    const file = await readResponseBytes(response, MAX_INSTALLER_BYTES);
    if (!isPortableExecutable(file)) throw new Error('Cheat Engine download did not have a valid PE signature');
    const sha256 = createHash('sha256').update(file).digest('hex').toUpperCase();
    if (sha256 !== info.sha256) throw new Error('Cheat Engine SHA-256 did not match the Chocolatey package');
    return { length: file.length, sha256 };
}

async function checkCheatEngineUrl(name, urlRegex, checksumRegex, currentContent, updateCallback) {
    process.stdout.write('Checking ' + name.padEnd(20) + ' [Chocolatey hash] ... ');
    try {
        const info = await fetchChocolateyCheatEngineInfo();
        const urlMatch = currentContent.match(urlRegex);
        const checksumMatch = currentContent.match(checksumRegex);
        if (!urlMatch || !checksumMatch) throw new Error('Cheat Engine catalog URL or SHA-256 field was not found');

        if (urlMatch[2] === info.url && checksumMatch[2].toUpperCase() === info.sha256) {
            const headers = await verifyCheatEngineHeaders(info.url);
            console.log(`Current (Chocolatey ${info.version}; HTTP binary ${headers.length} bytes)`);
            return 0;
        }

        const verified = await downloadAndVerifyCheatEngine(info);
        let updatedContent = currentContent.replace(urlRegex, (_full, before, _old, after) => before + info.url + after);
        updatedContent = updatedContent.replace(checksumRegex, (_full, before, _old, after) => before + info.sha256 + after);
        updateCallback(updatedContent);
        console.log(`Updated to Chocolatey ${info.version} after full PE/SHA-256 validation (${verified.length} bytes)`);
        return 1;
    } catch (error) {
        recordFailure(name, 'Skipped: ' + error.message);
        return 0;
    }
}

async function checkHermesAppInstallerUrl(name, regexPattern, currentContent, updateCallback) {
    process.stdout.write('Checking ' + name.padEnd(20) + ' [signed App Installer] ... ');
    try {
        const response = await fetch(HERMES_APPINSTALLER_URL, {
            headers: { 'User-Agent': 'ZEROfilez link updater', Accept: 'application/appinstaller, application/xml' },
            redirect: 'follow',
            signal: AbortSignal.timeout(20000)
        });
        if (!response.ok) throw new Error('Official App Installer feed returned HTTP ' + response.status);
        if (new URL(response.url).hostname !== 'hermes-assets.nousresearch.com') {
            throw new Error('Hermes App Installer feed redirected away from the official host');
        }
        const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? '';
        if (contentType !== 'application/appinstaller') throw new Error('Official endpoint did not return application/appinstaller');
        const body = await readResponseBytes(response, 512 * 1024);
        const appInfo = extractHermesAppInstallerInfo(body.toString('utf8'));
        const match = currentContent.match(regexPattern);
        if (!match) throw new Error('Hermes Agent catalog entry was not found');
        if (match[2] === HERMES_APPINSTALLER_URL) {
            console.log(`Current (stable signed bundle ${appInfo.version})`);
            return 0;
        }
        updateCallback(currentContent.replace(regexPattern,
            (_full, before, _old, after) => before + HERMES_APPINSTALLER_URL + after));
        console.log(`Updated to the stable App Installer feed (bundle ${appInfo.version})`);
        return 1;
    } catch (error) {
        recordFailure(name, 'Skipped: ' + error.message);
        return 0;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Official Dolphin releases have a 4-digit tag optionally followed by a hotfix
 * letter. Ignore development tags like 2609-133 and compare releases by version,
 * not by HTML appearance order.
 */
function extractDolphinStableUrl(html, platform = 'pc') {
    const candidates = [];
    const pattern = /https:\/\/dl\.dolphin-emu\.org\/releases\/(\d{4}[a-z]?)\/dolphin-(\d{4}[a-z]?)(-x64\.7z|\.apk)/gi;
    for (const match of String(html).matchAll(pattern)) {
        if (match[1] !== match[2]) continue;
        if (platform === 'pc' && match[3] !== '-x64.7z') continue;
        if (platform === 'android' && match[3] !== '.apk') continue;
        candidates.push({ version: match[1], url: match[0] });
    }
    candidates.sort((a, b) => a.version.slice(0, 4).localeCompare(b.version.slice(0, 4),
        undefined, { numeric: true }) || a.version.slice(4).localeCompare(b.version.slice(4)));
    return candidates.at(-1)?.url ?? null;
}

/** Read actual published files from the distributor directory rather than guessing releases. */
function extractLatestLuckyPatcherUrl(html) {
    const versions = [...String(html).matchAll(/LuckyPatchers\.com_Official_Installer_(\d+(?:\.\d+){2,})\.apk/gi)];
    versions.sort((a, b) => {
        const av = a[1].split('.').map(Number);
        const bv = b[1].split('.').map(Number);
        for (let i = 0; i < Math.max(av.length, bv.length); i++) {
            const diff = (av[i] ?? 0) - (bv[i] ?? 0);
            if (diff) return diff;
        }
        return 0;
    });
    const latest = versions.at(-1);
    return latest ? 'https://chelpus.com/download/' + latest[0] : null;
}

/** Verify file bytes (not just status/extension) before any scraped URL is written. */
async function verifyCandidateDownload(url, fetcher = fetch) {
    const extension = new URL(url).pathname.match(/\.(exe|msi|zip|apk|7z|appinstaller)$/i)?.[1]?.toLowerCase();
    if (!extension) throw new Error('URL did not name an accepted downloadable file: ' + url);
    const response = await fetcher(url, {
        headers: { Range: 'bytes=0-4095', 'User-Agent': 'ZEROfilez link updater' },
        redirect: 'follow', signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error('Candidate download returned HTTP ' + response.status);
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (/text\/html|application\/json/.test(contentType)) throw new Error('Candidate download returned a page');
    if (!response.body) throw new Error('Candidate download had no content');
    const reader = response.body.getReader();
    const parts = [];
    let count = 0;
    try {
        while (count < 4096) {
            const { value, done } = await reader.read();
            if (done) break;
            const part = Buffer.from(value).subarray(0, 4096 - count);
            parts.push(part);
            count += part.length;
        }
    } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
    }
    const sample = Buffer.concat(parts);
    const zip = sample.length >= 4 && sample.subarray(0, 2).toString('ascii') === 'PK' &&
        [3, 5, 7].includes(sample[2]) && [4, 6, 8].includes(sample[3]);
    const valid = extension === 'exe' ? isPortableExecutable(sample)
        : extension === 'msi' ? sample.subarray(0, 8).equals(Buffer.from('D0CF11E0A1B11AE1', 'hex'))
            : extension === '7z' ? sample.subarray(0, 6).equals(Buffer.from('377ABCAF271C', 'hex'))
                : ['zip', 'apk'].includes(extension) ? zip
                    : /^\s*(?:<\?xml[^>]*>\s*)?<AppInstaller\b/i.test(sample.toString('utf8'));
    if (!valid) throw new Error('Candidate download did not match expected ' + extension + ' file signature');
    return true;
}

async function checkDolphinUrl(name, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Official Dolphin] ... `);
        const response = await fetch('https://dolphin-emu.org/download/', {
            headers: { 'User-Agent': 'ZEROfilez link updater' },
            signal: AbortSignal.timeout(20000)
        });
        if (!response.ok) throw new Error('Dolphin release index returned HTTP ' + response.status);
        const newUrl = extractDolphinStableUrl(await response.text(), 'pc');
        if (!newUrl) throw new Error('No stable Windows x64 Dolphin download on official release index');
        const match = currentContent.match(regexPattern);
        if (!match) throw new Error('Dolphin catalog entry not found');
        if (match[2] === newUrl) { console.log('✅'); return 0; }
        await verifyCandidateDownload(newUrl);
        updateCallback(currentContent.replace(regexPattern, (_all, before, _old, after) => before + newUrl + after));
        console.log('✨ UPDATE FOUND! ' + newUrl);
        return 1;
    } catch (error) {
        recordFailure(name, '❌ Dolphin: ' + error.message);
        return 0;
    }
}

async function checkLuckyPatcherUrl(name, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Published directory] ... `);
        const response = await fetch('https://chelpus.com/download/', {
            headers: { 'User-Agent': 'ZEROfilez link updater' },
            signal: AbortSignal.timeout(20000)
        });
        if (!response.ok) throw new Error('Directory returned HTTP ' + response.status);
        const newUrl = extractLatestLuckyPatcherUrl(await response.text());
        if (!newUrl) throw new Error('No published Lucky Patcher APK found in directory');
        const match = currentContent.match(regexPattern);
        if (!match) throw new Error('Lucky Patcher catalog entry not found');
        if (match[2] === newUrl) { console.log('✅'); return 0; }
        await verifyCandidateDownload(newUrl);
        updateCallback(currentContent.replace(regexPattern, (_all, before, _old, after) => before + newUrl + after));
        console.log('✨ UPDATE FOUND! ' + newUrl);
        return 1;
    } catch (error) {
        recordFailure(name, '❌ Lucky Patcher: ' + error.message);
        return 0;
    }
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
            recordFailure(name, `❌ No matching release.`);
            return 0;
        }

        const asset = release.assets.find(assetFilter);
        if (!asset) {
            recordFailure(name, `❌ No matching asset.`);
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
            recordFailure(name, `⚠️ Regex mismatch.`);
        }

    } catch (err) {
        recordFailure(name, `❌ Error: ${err.message}`);
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
            recordFailure(name, `❌ No matching asset.`);
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
            recordFailure(name, `⚠️ Regex mismatch.`);
        }

    } catch (err) {
        recordFailure(name, `❌ Error: ${err.message}`);
    }
    return 0;
}

async function checkUrlIncrement(name, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Probe]  ... `);

        const match = currentContent.match(regexPattern);
        if (!match) {
            recordFailure(name, `⚠️ Regex mismatch.`);
            return 0;
        }

        let currentUrl = match[2];
        await verifyCandidateDownload(currentUrl);
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
            recordFailure(name, `❓ Could not parse version.`);
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
                    await verifyCandidateDownload(nextUrl);

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
        recordFailure(name, `❌ Error: ${err.message}`);
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
            recordFailure(name, `❌ Could not find main JS bundle.`);
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
            recordFailure(name, `❌ Could not extract URL from JS bundle.`);
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
            recordFailure(name, `⚠️ Regex mismatch.`);
        }
    } catch (err) {
        recordFailure(name, `❌ Error: ${err.message}`);
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
            recordFailure(name, `❌ Could not find PPSSPP installer URL on download page.`);
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
    } catch (err) { recordFailure(name, `❌ Error: ${err.message}`); }
    return 0;
}

async function checkLibreOfficeUrl(name, regexPattern, currentContent, updateCallback) {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Official] ... `);

        const indexUrl = 'https://download.documentfoundation.org/libreoffice/stable/';
        const r = await fetch(indexUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(5000)
        });
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);

        const html = await r.text();
        const versions = [...html.matchAll(/href=["'](\d+\.\d+\.\d+)\/["']/g)]
            .map(match => match[1]);

        if (versions.length === 0) {
            recordFailure(name, '❌ Could not find stable versions.');
            return 0;
        }

        const latestVersion = versions.sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        ).pop();

        const newUrl =
            `https://download.documentfoundation.org/libreoffice/stable/${latestVersion}/win/x86_64/LibreOffice_${latestVersion}_Win_x86-64.msi`;

        const match = currentContent.match(regexPattern);
        if (!match) {
            recordFailure(name, '⚠️ Regex mismatch.');
            return 0;
        }

        if (match[2] !== newUrl) {
            console.log('✨ UPDATE FOUND!');
            console.log(`    Old: ${match[2]}`);
            console.log(`    New: ${newUrl}`);
            updateCallback(currentContent.replace(regexPattern, `$1${newUrl}$3`));
            return 1;
        }

        console.log('✅');
    } catch (err) {
        recordFailure(name, `❌ Error: ${err.message}`);
    }
    return 0;
}

async function checkRetroarchUrl(name, regexPattern, currentContent, updateCallback, platform = 'pc') {
    try {
        process.stdout.write(`Checking ${name.padEnd(20)} [Probe]  ... `);
        const r = await fetch('https://buildbot.libretro.com/stable/', { signal: AbortSignal.timeout(5000) });
        const text = await r.text();
        const versions = [...text.matchAll(/href="\/stable\/([0-9]+\.[0-9]+\.[0-9]+)\/"/g)].map(m => m[1]);
        if (versions.length === 0) {
            recordFailure(name, `❌ Could not scrape RetroArch versions.`);
            return 0;
        }

        const latestVersion = versions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop();
        const newUrl = platform === 'android'
            ? `https://buildbot.libretro.com/stable/${latestVersion}/android/RetroArch.apk`
            : `https://buildbot.libretro.com/stable/${latestVersion}/windows/x86_64/RetroArch-Win64-setup.exe`;

        const match = currentContent.match(regexPattern);
        if (match) {
            if (match[2] !== newUrl) {
                await verifyCandidateDownload(newUrl);
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
    } catch (err) { recordFailure(name, `❌ Error: ${err.message}`); }
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
            recordFailure(name, `❌ Could not find installer URL on ${scrapeUrl}`);
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
                await verifyCandidateDownload(newUrl);
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
    } catch (err) { recordFailure(name, `❌ Error: ${err.message}`); }
    return 0;
}

// Expose source parsers for offline catalog and updater regression tests.
module.exports = {
    PROGRAMS,
    extractDolphinStableUrl,
    extractLatestLuckyPatcherUrl,
    verifyCandidateDownload,
    extractChocolateyInstallerInfo,
    extractChocolateyPackageMetadata,
    extractHermesAppInstallerInfo,
    extractNupkgEntry,
    isPortableExecutable
};

if (require.main === module) {
    main();
}
