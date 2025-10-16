/**
 * ZEROfilez Cloud Decryptor - JavaScript Client-Side
 * Crittografia AES-256-GCM + HKDF-SHA256
 */

// Embedded key che deve essere sostituita con quella generata
const EMBEDDED_KEY_B64 = "cibwPVciXDNtJaKPnSA2nNpIsY1ExGTuuGEyuBrNbWI=";

class CloudDecryptor {
    constructor() {
        this.userKey = null;
        this.kek = null;
        this.packages = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File user key
        document.getElementById('userKeyFile').addEventListener('change', (e) => {
            this.handleUserKeyFile(e.target.files[0]);
        });

        // Search filter
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.applySearchFilter(searchInput.value);
            });
        }
        // File package
        document.getElementById('packageFile').addEventListener('change', (e) => {
            this.handlePackageFile(e.target.files[0]);
        });
    }

    // Rimosso input manuale: si usa solo il file key

    async handleUserKeyFile(file) {
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const userKeyBytes = new Uint8Array(arrayBuffer);
            
            if (userKeyBytes.length !== 32) {
                throw new Error('Il file user key deve essere di 32 byte');
            }

            this.userKey = userKeyBytes;
            this.kek = await this.deriveKEK(userKeyBytes, EMBEDDED_KEY_B64);
            
            
            this.updateKeyStatus('✅ User key loaded - KEK derived', 'success');
        } catch (error) {
            this.updateKeyStatus(`❌ Error loading user key file: ${error.message}`, 'error');
            this.kek = null;
        }
    }

    async handlePackageFile(file) {
        if (!file) return;

        if (!this.kek) {
            this.updatePackageStatus('❌ Prima inserisci una user key valida', 'error');
            return;
        }

        try {
            this.updatePackageStatus('🔄 Decrypting package...', 'info');
            
            const arrayBuffer = await file.arrayBuffer();
            const encryptedData = new Uint8Array(arrayBuffer);
            
            
            const decryptedData = await this.decryptData(encryptedData, this.kek);
            const packagesJson = JSON.parse(new TextDecoder().decode(decryptedData));
            
            this.packages = packagesJson;
            this.updatePackageStatus('✅ Package decrypted successfully', 'success');
            this.displayFiles();
            
        } catch (error) {
            console.error('Detailed error:', error);
            this.updatePackageStatus(`❌ Error decrypting package: ${error.message}`, 'error');
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
            throw new Error(`Errore nella derivazione della KEK: ${error.message}`);
        }
    }

    async hkdf(ikm, salt, info, length) {
        // HKDF-SHA256 implementation corretta secondo RFC 5869
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
            
            // Per HKDF-Expand: T(i) = HMAC-Hash(PRK, T(i-1) || info || i)
            // T(0) è vuoto, quindi per i=0: T(1) = HMAC-Hash(PRK, info || 1)
            let input;
            if (i === 0) {
                // Prima iterazione: solo info || counter
                input = new Uint8Array(info.length + counter.length);
                input.set(info, 0);
                input.set(counter, info.length);
            } else {
                // Iterazioni successive: T(i-1) || info || counter
                const prevT = okm.slice((i-1) * hashLen, i * hashLen);
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
            console.error('Errore nella decrittografia:', error);
            throw new Error(`Errore nella decrittografia: ${error.message}`);
        }
    }

    async unwrapDEK(wrappedDekB64, kek) {
        try {
            const wrappedDek = this.base64ToUint8Array(wrappedDekB64);
            return await this.decryptData(wrappedDek, kek);
        } catch (error) {
            throw new Error(`Errore nell'unwrapping della DEK: ${error.message}`);
        }
    }

    convertGoogleDriveLink(shareLink) {
        /**
         * Converte un link di condivisione Google Drive in link diretto download
         * Input:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
         * Output: https://drive.google.com/uc?export=download&id=FILE_ID
         */
        try {
            if (shareLink.includes("drive.google.com/file/d/")) {
                // Estrae FILE_ID dal link di condivisione
                const start = shareLink.indexOf("/file/d/") + 8;
                let end = shareLink.indexOf("/", start);
                if (end === -1) {
                    end = shareLink.indexOf("?", start);
                }
                if (end === -1) {
                    end = shareLink.length;
                }
                
                const fileId = shareLink.substring(start, end);
                
                // Costruisce il link diretto
                const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
                return directLink;
            } else {
                throw new Error("Link Google Drive non valido");
            }
        } catch (error) {
            console.error("Errore nella conversione del link Google Drive:", error);
            throw error;
        }
    }

    async downloadAndDecryptFile(fileId) {
        if (!this.packages || !this.packages[fileId]) {
            throw new Error('File non trovato nei packages');
        }

        const fileInfo = this.packages[fileId];
        
        try {
            // Mostra sezione download
            this.showDownloadSection();
            this.updateDownloadInfo(`Downloading: ${fileInfo.originalName}`);

            // Determina l'URL corretto in base al tipo di hosting
            let downloadUrl = fileInfo.url;
            if (fileInfo.hosting === 'google_drive') {
                // Normalizza sempre il link Google Drive in usercontent per evitare CORS/interstitial
                const idMatch = downloadUrl.match(/drive\.google\.com\/file\/d\/([^/?#]+)/) || downloadUrl.match(/[?&]id=([^&]+)/);
                if (idMatch && idMatch[1]) {
                    downloadUrl = `https://drive.usercontent.google.com/download?id=${idMatch[1]}&export=download`;
                }
            }

            // Scarica il file criptato
            this.updateProgress(10);
            const footer = document.getElementById('appFooter');
            if (footer) footer.classList.add('downloading');
            const response = await fetch(downloadUrl, { redirect: 'follow', credentials: 'omit', referrerPolicy: 'no-referrer' });
            
            if (!response.ok) {
                throw new Error(`Download error: ${response.status} ${response.statusText}`);
            }

            this.updateProgress(30);
            const encryptedFileData = new Uint8Array(await response.arrayBuffer());

            // Unwrappa la DEK
            this.updateProgress(50);
            const dek = await this.unwrapDEK(fileInfo.wrappedDekB64, this.kek);

            // Decripta il file
            this.updateProgress(70);
            const decryptedData = await this.decryptData(encryptedFileData, dek);

            // Scarica il file
            this.updateProgress(90);
            this.downloadFile(decryptedData, fileInfo.originalName);

            this.updateProgress(100);
            this.updateDownloadInfo(`✅ File downloaded: ${fileInfo.originalName}`);
            if (footer) {
                footer.classList.remove('downloading');
                footer.classList.add('success');
                setTimeout(() => footer.classList.remove('success'), 1500);
            }

            // Nasconde la sezione download dopo 2 secondi
            setTimeout(() => {
                this.hideDownloadSection();
                this.keepFilesSectionOpen();
            }, 2000);

        } catch (error) {
            this.updateDownloadInfo(`❌ Error: ${error.message}`);
            const footerErr = document.getElementById('appFooter');
            if (footerErr) {
                footerErr.classList.remove('downloading');
                footerErr.classList.add('error');
                setTimeout(() => footerErr.classList.remove('error'), 2000);
            }
            throw error;
        }
    }

    keepFilesSectionOpen() {
        // Ensure the files section stays visible as long as KEK and package are loaded
        const filesSection = document.getElementById('filesSection');
        if (this.kek && this.packages && filesSection) {
            filesSection.style.display = 'block';
        }
    }

    downloadFile(data, filename) {
        const blob = new Blob([data]);
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

        const fileIds = Object.keys(this.packages);
        
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

    createFileItem(fileInfo) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        const fileInfoDiv = document.createElement('div');
        fileInfoDiv.className = 'file-info';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = fileInfo.originalName;
        
        fileInfoDiv.appendChild(fileName);

        const actions = document.createElement('div');
        actions.className = 'file-actions';

        const sizeEl = document.createElement('div');
        sizeEl.className = 'file-size';
        sizeEl.textContent = this.formatFileSize(fileInfo.size);

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = 'Decrypt & Download';
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
                    downloadBtn.textContent = 'Decrypt & Download';
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
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateKeyStatus(message, type) {
        const status = document.getElementById('keyStatus');
        status.textContent = message;
        status.className = `status ${type}`;
    }

    updatePackageStatus(message, type) {
        const status = document.getElementById('packageStatus');
        status.textContent = message;
        status.className = `status ${type}`;
    }

    updateDownloadInfo(message) {
        const info = document.getElementById('downloadInfo');
        info.textContent = message;
    }

    updateProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${percentage}%`;
    }

    showDownloadSection() {
        const section = document.getElementById('downloadSection');
        section.style.display = 'block';
        section.classList.add('fade-in');
    }

    hideDownloadSection() {
        const section = document.getElementById('downloadSection');
        section.style.display = 'none';
        this.updateProgress(0);
    }

    base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
}

// Inizializza l'applicazione quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    new CloudDecryptor();
    
    // Verifica se l'embedded key è stata sostituita
    if (EMBEDDED_KEY_B64 === "REPLACE_WITH_YOUR_EMBEDDED_KEY_BASE64") {
        console.warn('⚠️ WARNING: Replace EMBEDDED_KEY_B64 in script.js with your generated key!');
    }
});
