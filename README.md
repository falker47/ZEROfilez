# 🔐 ZEROfilez Cloud Decryptor

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

**ZEROfilez** is a dual-mode encrypted file management system and public archive utility. It operates entirely client-side, ensuring zero knowledge privacy for your personal files while offering a quick interface for public tools.

---

## 🌓 Project Modes

This project features a unique duality:

### 1. 🎮 Quick Startup (Public Mode)

A public archive mode designed for quick access to essential tools.

- **Emulators**: Direct downloads for popular emulators (PC & Android).
- **Utilities**: Curated list of useful software and APKs.
- **Game Archives**: Quick links for retro-gaming setups.

### 2. 🔐 Personal Vault (Private Mode)

A secure system to decrypt and manage your private files directly in the browser.

- **Client-Side Encryption**: Uses AES-256-GCM + HKDF-SHA256.
- **Zero Knowledge**: No private keys or unencrypted data are ever sent to a server.
- **Local Key Management**: Requires your personal `user.key` to unlock content.

---

## 🚀 Setup & Usage

### For Public Use

Simply open the `index.html` file or host it on GitHub Pages. The "Quick Startup" mode works out-of-the-box.

### For Personal Vault Use

To use the encryption features, you must generate your own encrypted package.

1.  **Dependencies**: You need the backend python scripts (excluded from this repo for privacy).
2.  **Generate Package**: Use the `packager.py` (not included) to create `packages.json.enc`.
3.  **Unlock**: Upload your `packages.json.enc` and `user.key` in the web interface.

> **Note**: The Python scripts used to generate the encrypted packages are intentionally excluded from this public repository to maintain the security of my personal implementation. You are free to implement your own package generator adhering to the `packages.json` schema.

---

## 📁 Project Structure

```text
├── index.html              # Main Web App (Dual Interface)
├── styles.css              # Styling & Animations
├── script.js               # Core Logic (Crypto + UI)
├── README.md               # Documentation
│
├── [EXCLUDED]              # Private Backend Tools
│   ├── add_file.py
│   ├── process_all.py
│   └── packages.json.enc   # Your encrypted file list
└── [EXCLUDED]
    └── user.key            # Your private decryption key
```

## 🛠️ Development Setup

If you want to run this project locally or contribute to the automation scripts, follow these steps:

### Prerequisites

- **Node.js**: Install the latest LTS version from [nodejs.org](https://nodejs.org/).

### Installation

1.  Clone the repository.
2.  Open a terminal in the project folder.
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Auto-Updater

To manually run the script that checks for new software versions:

```bash
npm run update-links
```

This will check the supported GitHub repositories and update `js/data.js` if new versions are found.

---

## 📄 License & Privacy

This project is open for personal use.
**Security Notice**: All cryptographic operations rely on standard Web Crypto APIs. Always keep your `user.key` safe and maintain backups of your original files.
