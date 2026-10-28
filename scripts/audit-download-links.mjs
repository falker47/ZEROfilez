import { ITEMS } from '../js/data.js';
import { pathToFileURL } from 'node:url';

const USER_AGENT = 'ZEROfilez direct-download audit';
const RANGE_BYTES = 64 * 1024;
const TIMEOUT_MS = 25_000;

export function collectCatalogDownloads(items = ITEMS) {
    const downloads = [];
    for (const item of Object.values(items.emulation ?? {})) {
        if (item.pc?.url) downloads.push({ name: `${item.name} (PC)`, ...item.pc });
        if (item.android?.url) downloads.push({ name: `${item.name} (Android)`, ...item.android });
    }
    for (const item of Object.values(items['pc-programs'] ?? {})) {
        if (item.url) downloads.push({ name: item.name, ...item });
        if (item.installerUrl) downloads.push({
            name: `${item.name} (installer)`,
            url: item.installerUrl,
            ...(item.installerLinkType ? { linkType: item.installerLinkType } : {})
        });
    }
    return downloads;
}

function isHtml(sample) {
    const text = sample.toString('utf8').replace(/^\uFEFF/, '').trimStart().slice(0, 32).toLowerCase();
    return text.startsWith('<!doctype html') || text.startsWith('<html') || text.startsWith('<head') || text.startsWith('<body');
}

function getExpectedType(url, disposition, contentType) {
    const filename = disposition?.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i)?.[1]?.trim();
    const path = filename || new URL(url).pathname;
    const extension = path.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
    if (['exe', 'msi', 'zip', 'apk', '7z', 'msixbundle', 'appinstaller'].includes(extension)) return extension;
    if (contentType === 'application/appinstaller') return 'appinstaller';
    if (contentType === 'application/vnd.android.package-archive') return 'apk';
    if (contentType === 'application/zip') return 'zip';
    if (contentType === 'application/x-7z-compressed') return '7z';
    if (contentType === 'application/x-msdownload') return 'exe';
    return 'unknown';
}

export function inspectDownloadSignature(sample, expectedType) {
    const bytes = Buffer.isBuffer(sample) ? sample : Buffer.from(sample);
    if (!bytes.length || isHtml(bytes)) return { valid: false, signature: 'HTML or empty response' };

    if (expectedType === 'exe') {
        if (bytes.length < 64 || bytes.toString('ascii', 0, 2) !== 'MZ') return { valid: false, signature: 'missing MZ header' };
        const peOffset = bytes.readUInt32LE(0x3c);
        const valid = peOffset >= 64 && peOffset + 4 <= bytes.length && bytes.toString('ascii', peOffset, peOffset + 4) === 'PE\0\0';
        return { valid, signature: valid ? 'MZ/PE' : 'MZ without PE header' };
    }
    if (expectedType === 'msi') {
        const valid = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from('D0CF11E0A1B11AE1', 'hex'));
        return { valid, signature: valid ? 'OLE/CFB MSI' : 'missing OLE header' };
    }
    if (['zip', 'apk', 'msixbundle'].includes(expectedType)) {
        const valid = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b &&
            [0x03, 0x05, 0x07].includes(bytes[2]) && [0x04, 0x06, 0x08].includes(bytes[3]);
        return { valid, signature: valid ? 'ZIP container' : 'missing ZIP header' };
    }
    if (expectedType === '7z') {
        const valid = bytes.length >= 6 && bytes.subarray(0, 6).equals(Buffer.from('377ABCAF271C', 'hex'));
        return { valid, signature: valid ? '7-Zip' : 'missing 7-Zip header' };
    }
    if (expectedType === 'appinstaller') {
        const text = bytes.toString('utf8').replace(/^\uFEFF/, '').trimStart();
        const root = text.replace(/^<\?xml\b[^?]*\?>\s*/i, '');
        const valid = /^<(?:[\w.-]+:)?AppInstaller\b/i.test(root);
        return { valid, signature: valid ? 'App Installer XML' : 'missing AppInstaller XML root' };
    }

    const valid = bytes.length >= 64 && bytes.toString('ascii', 0, 2) === 'MZ';
    if (valid) return inspectDownloadSignature(bytes, 'exe');
    return { valid: false, signature: `unknown file signature for ${expectedType}` };
}

async function readSample(response, limit) {
    if (!response.body) return Buffer.alloc(0);
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    try {
        while (length < limit) {
            const { done, value } = await reader.read();
            if (done) break;
            const piece = Buffer.from(value).subarray(0, limit - length);
            chunks.push(piece);
            length += piece.length;
            if (piece.length < value.byteLength) break;
        }
    } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
    }
    return Buffer.concat(chunks, length);
}

async function auditDownload(item) {
    let response;
    try {
        response = await fetch(item.url, {
            headers: { Range: `bytes=0-${RANGE_BYTES - 1}`, 'User-Agent': USER_AGENT },
            redirect: 'follow',
            signal: AbortSignal.timeout(TIMEOUT_MS)
        });
    } catch (error) {
        return { name: item.name, url: item.url, ok: false, message: `Request failed: ${error.message}` };
    }

    const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? '';
    const contentDisposition = response.headers.get('content-disposition') ?? '(none)';
    const sample = await readSample(response, RANGE_BYTES);
    const finalUrl = response.url || item.url;
    const expected = getExpectedType(finalUrl, contentDisposition, contentType);
    const signature = inspectDownloadSignature(sample, expected);
    const intentionalPage = item.linkType === 'website' || item.linkType === 'store';
    const isPage = isHtml(sample);
    const pageTypeMatches = intentionalPage && isPage;
    const ok = response.ok && (signature.valid || pageTypeMatches);

    return {
        name: item.name,
        url: item.url,
        finalUrl,
        status: response.status,
        contentType,
        contentDisposition,
        sampleBytes: sample.length,
        signature: isPage ? 'HTML page' : signature.signature,
        ok,
        message: ok ? (intentionalPage ? `explicit ${item.linkType} target` : 'file signature validated')
            : !response.ok ? `HTTP ${response.status}`
                : !signature.valid ? `not a usable ${expected} download` : 'unclassified response'
    };
}

async function runPool(values, limit, task) {
    const results = new Array(values.length);
    let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
        while (true) {
            const index = cursor++;
            if (index >= values.length) return;
            results[index] = await task(values[index]);
        }
    }));
    return results;
}

export async function auditCatalog(items = ITEMS) {
    return runPool(collectCatalogDownloads(items), 5, auditDownload);
}

async function main() {
    const results = await auditCatalog();
    for (const result of results) {
        const status = result.status ?? 'ERR';
        const finalUrl = result.finalUrl ?? result.url;
        console.log(`${result.ok ? 'PASS' : 'FAIL'} ${String(status).padEnd(3)} ${result.contentType ?? '-'} | ${result.signature ?? '-'} | CD: ${result.contentDisposition ?? '-'} | ${result.name}`);
        if (finalUrl !== result.url) console.log(`     ${finalUrl}`);
        if (!result.ok) console.log(`     ${result.message}`);
    }
    const failed = results.filter(result => !result.ok);
    console.log(`\n${results.length - failed.length}/${results.length} catalog URLs passed live HTTP and signature checks.`);
    if (failed.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
}
