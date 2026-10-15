# ZEROfilez

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=F7DF1E) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

**ZEROfilez** is a static, client-side utility with two complementary modes: a curated quick-start catalog for useful software and emulation tools, and a browser-based decryptor for personal encrypted file packages.

---

## 🌱 From Community Support to Software

ZEROfilez began during the COVID lockdown as a practical response to a recurring problem: friends kept asking me how to set up emulators and get started with retro gaming, and I found myself explaining the same workflows over and over again.

What started as one-to-one support gradually evolved into reusable tutorials, curated resources, and a small community ecosystem built around making those workflows easier to understand and access.

This repository is the modern continuation of that original idea. The implementation has evolved, but the goal remains the same: **reduce friction, organize useful tools, and turn repeated technical help into something reusable**.

---

## 🌓 Project Modes

### 1. 🎮 Quick Startup

A curated catalog for quickly reaching useful software and emulation tooling.

- **Emulators**: Windows and Android links for actively maintained emulator projects.
- **PC utilities**: browsers, maintenance tools, productivity software and selected personal utilities.
- **Gaming tools**: save editors and ROM-hacking utilities used in the wider ZEROfilez workflow.
- **Upstream-first links**: official project/vendor sources are preferred whenever practical. Two legacy project-owned packages are intentionally served from the companion `FileStorage` repository.

Download URLs that change with releases are maintained by `scripts/update-links.js` and the scheduled GitHub Actions workflow.

#### Windows Setup

The **PC Programs** tab includes a guided **Set up a new PC** flow. Pick the programs you want, review the selection, and let ZEROfilez split the result into automatic installs and normal manual downloads. In **Choose**, the optional **ZEROfilez Selection** shortcut preselects Brave Browser, Discord, Notepad++, 7-Zip, Everything, Revo Uninstaller and Panacea. Six apps use the automatic WinGet setup; Panacea uses the existing manual download with **Install** selected by default (unless the user already selected **Portable**). It only adds recommendations: other selected programs remain selected, individual choices are editable, and **Clear** resets everything. The shortcut does not initiate installation.

Programs with a verified `wingetId` are bundled into one local Windows command file (`.cmd`). Packages use the `winget` community source by default, while entries with `wingetSource: 'msstore'` use the Microsoft Store catalog (for example, ChatGPT Desktop). The file is generated entirely in the browser, checks for already installed packages using their declared source, installs exact IDs and pauses before closing so failures remain visible. Store installation can require Windows Store services, an account or a confirmation; the normal direct download links remain available in the PC catalog. ZEROfilez does **not** execute commands on the PC from the browser.

Programs without `winget` metadata can still be selected. They appear at the end as a simple download checklist instead of silently disappearing from the setup flow.

**Panacea Featured:** Panacea is displayed once, above the PC Programs categories, while remaining searchable through both *Featured* and *Essentials*. Install (recommended) uses the stable `PanaceaSetup.exe` endpoint, enabling future user-approved updates; Portable uses the stable `Panacea.exe` endpoint with manual updates. In PC Setup, include Panacea in **Choose** and select exactly one variant; **Review** and **Install** keep that choice. Panacea is always a manual download and never enters the generated WinGet command file. A manual-only setup needs no `.cmd`. The generated command file remains available under **Technical details** for users who want to inspect it.

### 2. 🔐 Personal Vault

A local browser interface for decrypting a personal encrypted package.

- **Client-side cryptography**: AES-256-GCM with HKDF-SHA256 through the Web Crypto API.
- **Local key handling**: the decryption key is selected from the local device.
- **No upload backend in this repository**: package and key processing happens in the browser.

The private packaging scripts used for my own archive workflow are not part of this public repository because they are personal tooling, not because their secrecy is required for the cryptographic design.

---

## 🚀 Running the App

Because the application uses JavaScript modules, serve the repository over HTTP rather than opening `index.html` directly with `file://`.

For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

The project is also suitable for static hosting such as GitHub Pages.

### Personal Vault input

The public repository contains the decryptor, but not my private package-generation pipeline. To use the vault mode with your own data, provide:

1. an encrypted `packages.json.enc` package compatible with the frontend format;
2. the corresponding `user.key`;
3. the files referenced by that package through whatever storage layout your own generator uses.

---

## 🔄 Download-Link Maintenance

The updater has no npm dependencies. It requires **Node.js 20+** and can be run directly:

```bash
node scripts/update-links.js
```

The same script runs automatically from:

```text
.github/workflows/update_links.yml
```

The updater uses official release APIs or upstream download pages where possible. Version-specific links are updated in `js/data.js`; stable vendor landing/latest endpoints are left unchanged when they are already designed not to require version maintenance. The catalog coverage test (`tests/download-links.test.mjs`) checks that every PC program has one of those two update strategies. Cheat Engine uses its official downloads page because the publisher does not provide a reliable permanent direct-installer URL.

---

## 📁 Project Structure

```text
├── index.html
├── styles.css
├── css/                         # Layout, components and responsive styles
├── js/
│   ├── main.js                  # App entry point / mode switching
│   ├── startup.js               # Quick Startup rendering and downloads
│   ├── data.js                  # Curated software/emulator links
│   ├── array.js                 # Display ordering
│   ├── icons.js                 # Icon sources and fallbacks
│   ├── windows-setup.js         # Validated winget/msstore setup generators
│   ├── pc-categories.js        # Shared categories and alphabetical PC listing
│   └── decryptor.js             # Client-side vault/decryption logic
├── scripts/
│   └── update-links.js          # Release/link updater
├── tests/
│   ├── windows-setup.test.mjs   # Zero-dependency generator/regression tests
│   └── pc-categories.test.mjs   # Category/catalog regression tests
├── .github/workflows/
│   ├── ci.yml                   # Syntax + Node built-in tests
│   └── update_links.yml         # Scheduled updater
├── panacea_icon_white.png       # Local icon for Panacea
└── README.md
```

Private keys, encrypted personal indexes and personal packaging scripts are intentionally not committed.

---

## 🔐 Security Notes

- Keep `user.key` private and backed up.
- Keep independent backups of original files; the browser decryptor is not a backup system.
- Public software links point to third-party upstreams, so availability and distribution behavior remain under those upstreams' control.
- Generated Windows setup scripts contain only validated package IDs and explicitly approved `winget`/`msstore` sources from the curated catalog; review the script before running it. Windows Store installation behavior must be validated on a real Windows machine.
- No explicit software license is currently granted in this repository.


## Panacea: installed or portable

The Panacea entry in **PC Programs → Essentials** (and the manual step of **PC Setup**) offers **Install** (recommended) and **Portable**. Install downloads `PanaceaSetup.exe`, which places Panacea in a protected Windows directory and supports guided future updates. Portable downloads the standalone `Panacea.exe` and requires manual updates. Both stable GitHub URLs automatically target the newest *published stable* release, with no hardcoded version number.

**Release order:** this dual-download UI should go live only after the GitHub Panacea v2.0.0 stable release publishes *both* assets. Until then, the public v1.47 release does not contain the installer and the new installer URL would return a 404. The existing portable link remains valid throughout.
