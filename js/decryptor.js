
// Embedded key che deve essere sostituita con quella generata
const EMBEDDED_KEY_B64 = "cibwPVciXDNtJaKPnSA2nNpIsY1ExGTuuGEyuBrNbWI=";
// Max length for download info messages (including filename)
const DOWNLOAD_INFO_MAX_LEN = 75;

export class CloudDecryptor {
    constructor() {
        this.userKey = null;
        this.kek = null;
        this.packages = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File user key
        const keyFile = document.getElementById('userKeyFile');
        if (keyFile) {
            keyFile.addEventListener('change', (e) => {
                this.handleUserKeyFile(e.target.files[0]);
            });
        }

        // Search filter
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.applySearchFilter(searchInput.value);
            });
        }
        // File package
        const packageFile = document.getElementById('packageFile');
        if (packageFile) {
            packageFile.addEventListener('change', (e) => {
                this.handlePackageFile(e.target.files[0]);
            });
        }

        // Window resize listener for filename truncation
        window.addEventListener('resize', () => {
            this.updateFilenamesOnResize();
        });
    }

    // Rimosso input manuale: si usa solo il file key

    async handleUserKeyFile(file) {
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const userKeyBytes = new Uint8Array(arrayBuffer);

            if (userKeyBytes.length !== 32) {
                throw new Error('User key file must be 32 bytes');
            }

            this.userKey = userKeyBytes;
            this.kek = await this.deriveKEK(userKeyBytes, EMBEDDED_KEY_B64);


            this.updateKeyStatus('✅ Key OK, KEK OK', 'success');
        } catch (error) {
            this.updateKeyStatus(`❌ Error loading user key: ${error.message}`, 'error');
            this.kek = null;
        }
    }

    async handlePackageFile(file) {
        if (!file) return;

        if (!this.kek) {
            this.updatePackageStatus('❌ Load the key first', 'error');
            return;
        }

        try {
            this.updatePackageStatus('🔄 Decrypting package...', 'info');

            const arrayBuffer = await file.arrayBuffer();
            const encryptedData = new Uint8Array(arrayBuffer);


            const decryptedData = await this.decryptData(encryptedData, this.kek);
            const packagesJson = JSON.parse(new TextDecoder().decode(decryptedData));

            this.packages = packagesJson;
            this.updatePackageStatus('✅ Package decrypted!', 'success');
            this.displayFiles();

        } catch (error) {
            console.error('Detailed error:', error);
            this.updatePackageStatus(`❌ Package decryption error: ${error.message}`, 'error');
            this.packages = null;
        }
    }

    async deriveKEK(userKey, embeddedKeyB64) {
        try {
            // Converte user key in Uint8Array se è una stringa
            let userKeyBytes;
            if (typeof userKey === 'string') {
                userKeyBytes = new TextEncoder().encode(userKey);
            } else {
                userKeyBytes = userKey;
            }

            // Decodifica embedded key
            const embeddedKeyBytes = this.base64ToUint8Array(embeddedKeyB64);

            // Combina le chiavi: userKey || embeddedKey
            const combinedKey = new Uint8Array(userKeyBytes.length + embeddedKeyBytes.length);
            combinedKey.set(userKeyBytes, 0);
            combinedKey.set(embeddedKeyBytes, userKeyBytes.length);

            // Deriva KEK usando HKDF-SHA256
            const salt = new Uint8Array(32); // Salt di 32 byte tutti zero
            const info = new TextEncoder().encode('cloud-decryptor/v1');

            const kek = await this.hkdf(combinedKey, salt, info, 32);
            return kek;

        } catch (error) {
            throw new Error(`Error deriving KEK: ${error.message}`);
        }
    }

    base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    async hkdf(ikm, salt, info, length) {
        // HKDF-SHA256 implementation per RFC 5869
        // Step 1: Extract - PRK = HMAC-SHA256(salt, IKM)
        const extractKey = await crypto.subtle.importKey(
            'raw',
            salt,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const prk = await crypto.subtle.sign('HMAC', extractKey, ikm);
        const prkBytes = new Uint8Array(prk);

        // Step 2: Expand - OKM = HKDF-Expand(PRK, info, L)
        const okm = new Uint8Array(length);
        const hashLen = 32; // SHA-256 output length
        const iterations = Math.ceil(length / hashLen);

        for (let i = 0; i < iterations; i++) {
            const counter = new Uint8Array([i + 1]);

            // HKDF-Expand: T(i) = HMAC-Hash(PRK, T(i-1) || info || i)
            // T(0) is empty, so for i=0: T(1) = HMAC-Hash(PRK, info || 1)
            let input;
            if (i === 0) {
                // First iteration: only info || counter
                input = new Uint8Array(info.length + counter.length);
                input.set(info, 0);
                input.set(counter, info.length);
            } else {
                // Next iterations: T(i-1) || info || counter
                const prevT = okm.slice((i - 1) * hashLen, i * hashLen);
                input = new Uint8Array(prevT.length + info.length + counter.length);
                input.set(prevT, 0);
                input.set(info, prevT.length);
                input.set(counter, prevT.length + info.length);
            }

            const expandKey = await crypto.subtle.importKey(
                'raw',
                prkBytes,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );

            const hash = await crypto.subtle.sign('HMAC', expandKey, input);
            const hashBytes = new Uint8Array(hash);

            const start = i * hashLen;
            const end = Math.min(start + hashLen, length);
            const copyLen = end - start;

            if (copyLen > 0) {
                okm.set(hashBytes.slice(0, copyLen), start);
            }
        }

        return okm;
    }

    async decryptData(encryptedData, key) {
        try {
            const nonce = encryptedData.slice(0, 12);
            const ciphertext = encryptedData.slice(12);


            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                key,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );

            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: nonce
                },
                cryptoKey,
                ciphertext
            );

            return new Uint8Array(decryptedData);

        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error(`Decryption error: ${error.message}`);
        }
    }

    async unwrapDEK(wrappedDekB64, kek) {
        try {
            const wrappedDek = this.base64ToUint8Array(wrappedDekB64);
            return await this.decryptData(wrappedDek, kek);
        } catch (error) {
            throw new Error(`Error unwrapping DEK: ${error.message}`);
        }
    }

    async downloadAndDecryptFile(fileId) {
        if (!this.packages || !this.packages[fileId]) {
            throw new Error('File not found in packages');
        }

        const fileInfo = this.packages[fileId];

        try {
            // Show download section
            this.showDownloadSection();
            this.updateDownloadInfo(this.buildDownloadMessage('⬇️ Downloading: ', fileInfo.originalName, DOWNLOAD_INFO_MAX_LEN));

            // Determine URL for hosting
            let downloadUrl = fileInfo.url;

            // Download the encrypted file
            this.updateProgress(10);

            const response = await fetch(downloadUrl, {
                redirect: 'follow',
                credentials: 'omit',
                referrerPolicy: 'no-referrer'
            });

            if (!response.ok) {
                throw new Error(`Download error: ${response.status} ${response.statusText}`);
            }

            this.updateProgress(30);
            const encryptedFileData = new Uint8Array(await response.arrayBuffer());

            // Unwrap DEK
            this.updateProgress(50);
            const dek = await this.unwrapDEK(fileInfo.wrappedDekB64, this.kek);

            // Decrypt file
            this.updateProgress(70);
            const decryptedData = await this.decryptData(encryptedFileData, dek);

            // Download file
            this.updateProgress(90);
            this.downloadFile(decryptedData, fileInfo.originalName);

            this.updateProgress(100);
            this.updateDownloadInfo(`✅ File downloaded: ${fileInfo.originalName}`);
            // footer removed

            // Mantieni visibile la sezione download, resetta dopo 2 secondi
            setTimeout(() => {
                this.hideDownloadSection();
                this.keepFilesSectionOpen();
            }, 2000);

        } catch (error) {
            this.updateDownloadInfo(`❌ Error: ${error.message}`);
            // footer removed
            throw error;
        }
    }

    buildDownloadMessage(prefix, filename, maxLen) {
        // Simple helper to construct the "Downloading: <filename>" string
        // The clamping happens in updateDownloadInfo calling clampText
        return prefix + filename;
    }

    keepFilesSectionOpen() {
        // Ensure the files section stays visible as long as KEK and package are loaded
        const filesSection = document.getElementById('filesSection');
        if (this.kek && this.packages && filesSection) {
            filesSection.style.display = 'block';
        }
    }

    getMimeType(filename) {
        const extension = filename.toLowerCase().split('.').pop();
        const mimeTypes = {
            // Game ROMs
            'gba': 'application/octet-stream',
            'gb': 'application/octet-stream',
            'gbc': 'application/octet-stream',
            'nds': 'application/octet-stream',
            '3ds': 'application/octet-stream',
            'n64': 'application/octet-stream',
            'z64': 'application/octet-stream',
            'v64': 'application/octet-stream',
            'sfc': 'application/octet-stream',
            'smc': 'application/octet-stream',
            'nes': 'application/octet-stream',
            'rom': 'application/octet-stream',
            'iso': 'application/octet-stream',
            'bin': 'application/octet-stream',
            'cue': 'application/octet-stream',

            // Archives
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
            'tar': 'application/x-tar',
            'gz': 'application/gzip',

            // Documents
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'rtf': 'application/rtf',

            // Images
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',

            // Audio
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac',
            'aac': 'audio/aac',

            // Video
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mkv': 'video/x-matroska',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv',

            // Applications
            'exe': 'application/x-msdownload',
            'msi': 'application/x-msdownload',
            'apk': 'application/vnd.android.package-archive',
            'deb': 'application/x-debian-package',
            'rpm': 'application/x-rpm',

            // Code
            'js': 'application/javascript',
            'html': 'text/html',
            'css': 'text/css',
            'json': 'application/json',
            'xml': 'application/xml',
            'py': 'text/x-python',
            'java': 'text/x-java-source',
            'cpp': 'text/x-c++src',
            'c': 'text/x-csrc',
            'h': 'text/x-chdr',

            // Other
            'dat': 'application/octet-stream',
            'db': 'application/octet-stream',
            'sqlite': 'application/x-sqlite3',
            'log': 'text/plain'
        };

        return mimeTypes[extension] || 'application/octet-stream';
    }

    downloadFile(data, filename) {
        const mimeType = this.getMimeType(filename);
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    displayFiles() {
        const filesSection = document.getElementById('filesSection');
        const filesList = document.getElementById('filesList');

        // Always keep section visible; show placeholder if missing KEK or package
        if (!this.kek || !this.packages) {
            if (filesList) {
                filesList.innerHTML = '';
                filesList.classList.add('empty');
            }
            return;
        }

        filesSection.style.display = 'block';
        filesList.innerHTML = '';
        filesList.classList.add('empty');

        const fileIds = Object.keys(this.packages).sort((a, b) => {
            const an = (this.packages[a].originalName || '').toLowerCase();
            const bn = (this.packages[b].originalName || '').toLowerCase();
            return an.localeCompare(bn);
        });

        if (fileIds.length === 0) {
            filesList.innerHTML = '<p class="text-center">No files found in the package</p>';
            return;
        }

        fileIds.forEach(fileId => {
            const fileInfo = { ...this.packages[fileId], id: fileId };
            const fileItem = this.createFileItem(fileInfo);
            filesList.appendChild(fileItem);
        });

        if (filesList.children.length > 0) {
            filesList.classList.remove('empty');
        }
        filesSection.classList.add('fade-in');
    }

    normalizeText(t) {
        return (t || '').toString().toLowerCase().replace(/\s+/g, '');
    }

    applySearchFilter(query) {
        const filesList = document.getElementById('filesList');
        if (!filesList) return;
        const normQuery = this.normalizeText(query);
        const children = Array.from(filesList.children);
        children.forEach(el => {
            const nameEl = el.querySelector('.file-name');
            const name = nameEl ? nameEl.textContent : '';
            const match = this.normalizeText(name).includes(normQuery);
            el.style.display = match ? '' : 'none';
        });
    }

    updateFilenamesOnResize() {
        // Update all existing filename elements when screen size changes
        const filesList = document.getElementById('filesList');
        if (!filesList || !this.packages) return;

        const fileItems = filesList.querySelectorAll('.file-item');
        fileItems.forEach(fileItem => {
            const fileNameEl = fileItem.querySelector('.file-name');
            if (fileNameEl) {
                // Get the original filename from the packages data
                const fileId = fileItem.dataset.fileId;
                if (fileId && this.packages[fileId]) {
                    fileNameEl.textContent = this.truncateFilenameForFileItem(this.packages[fileId].originalName);
                }
            }
        });
    }

    createFileItem(fileInfo) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileId = fileInfo.id;

        const fileInfoDiv = document.createElement('div');
        fileInfoDiv.className = 'file-info';

        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = this.truncateFilenameForFileItem(fileInfo.originalName);

        fileInfoDiv.appendChild(fileName);

        const actions = document.createElement('div');
        actions.className = 'file-actions';

        const sizeEl = document.createElement('div');
        sizeEl.className = 'file-size';
        sizeEl.textContent = this.formatFileSize(fileInfo.size);

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.addEventListener('click', async () => {
            downloadBtn.disabled = true;
            downloadBtn.textContent = 'Downloading...';

            try {
                await this.downloadAndDecryptFile(fileInfo.id);
            } catch (error) {
                console.error('Download error:', error);
                downloadBtn.textContent = '❌ Error';
            } finally {
                setTimeout(() => {
                    downloadBtn.disabled = false;
                    downloadBtn.textContent = 'Download';
                }, 3000);
            }
        });

        actions.appendChild(sizeEl);
        actions.appendChild(downloadBtn);

        fileItem.appendChild(fileInfoDiv);
        fileItem.appendChild(actions);

        return fileItem;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
        const value = bytes / Math.pow(k, i);

        // Truncate to 3 significant digits (not rounding), then format and use comma as decimal separator
        const truncated = this.truncateToSignificantDigits(value, 3);
        const formatted = this.formatWithFixedSigDigits(truncated, 3).replace('.', ',');
        return `${formatted} ${sizes[i]}`;
    }

    truncateToSignificantDigits(value, sigDigits) {
        if (!isFinite(value) || value === 0) return 0;
        const absVal = Math.abs(value);
        const exponent = Math.floor(Math.log10(absVal));
        const decimalPlaces = Math.max(0, sigDigits - 1 - exponent);
        const factor = Math.pow(10, decimalPlaces);
        const truncated = Math.trunc(value * factor) / factor;
        return truncated;
    }

    formatWithFixedSigDigits(value, sigDigits) {
        if (!isFinite(value) || value === 0) return '0';
        const absVal = Math.abs(value);
        const exponent = Math.floor(Math.log10(absVal));
        const decimalPlaces = Math.max(0, sigDigits - 1 - exponent);
        // Ensure fixed decimals to keep trailing zeros to reach 3 significant digits
        return value.toFixed(decimalPlaces);
    }

    updateKeyStatus(message, type) {
        const status = document.getElementById('keyStatus');
        status.textContent = this.shortenStatus(message);
        status.className = `status ${type || 'waiting'}`;
    }

    updatePackageStatus(message, type) {
        const status = document.getElementById('packageStatus');
        status.textContent = this.shortenStatus(message);
        status.className = `status ${type || 'waiting'}`;
    }

    updateDownloadInfo(message) {
        const info = document.getElementById('downloadInfo');
        info.textContent = this.clampText(message, DOWNLOAD_INFO_MAX_LEN);
    }

    updateProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${percentage}%`;
    }

    showDownloadSection() {
        const section = document.getElementById('downloadSection');
        section.style.display = 'block';
        section.classList.add('fade-in');
        // title removed
    }

    hideDownloadSection() {
        // Keep section always visible; just reset to placeholder and progress 0
        this.updateProgress(0);
        const info = document.getElementById('downloadInfo');
        if (info) {
            info.textContent = '🔒 Encryption happens locally in your browser. No data is sent to any server.';
        }
        // title removed
    }

    clampText(text, maxLen) {
        try {
            const s = String(text || '');
            if (s.length <= maxLen) return s;
            return s.slice(0, Math.max(0, maxLen - 1)) + '…';
        } catch (_) {
            return '';
        }
    }

    shortenStatus(text) {
        const MAX_STATUS_LEN = 30;
        return this.clampText(text, MAX_STATUS_LEN);
    }

    truncateFilenameKeepExt(filename, maxLen) {
        try {
            const s = String(filename || '');
            if (s.length <= maxLen) return s;
            const lastDot = s.lastIndexOf('.');
            if (lastDot <= 0 || lastDot === s.length - 1) {
                // no extension or trailing dot — fallback to generic clamp
                return this.clampText(s, maxLen);
            }
            const name = s.slice(0, lastDot);
            const ext = s.slice(lastDot); // includes the dot
            const budget = Math.max(0, maxLen - ext.length - 3); // 3 for '...'
            if (budget <= 0) {
                // cannot keep even minimal name, return just ext with ellipsis prefix
                return '...' + ext.slice(-Math.max(0, maxLen - 3));
            }
            const truncatedName = name.slice(0, budget);
            return truncatedName + '..' + ext;
        } catch (_) {
            return filename;
        }
    }

    truncateFilenameForFileItem(filename) {
        try {
            const viewportWidth = window.innerWidth;
            let maxLen = 30; // default for desktop

            if (viewportWidth < 480) {
                maxLen = 15; // mobile phones
            } else if (viewportWidth < 768) {
                maxLen = 20; // tablets
            }

            return this.truncateFilenameKeepExt(filename, maxLen);
        } catch (_) {
            return filename;
        }
    }
}
