# ZEROfilez

**ZEROfilez** is a browser-based toolkit for setting up a PC, finding useful software and emulation tools, and accessing files from a personal encrypted archive.

It brings together two features that grew from the same idea: making frequently repeated technical tasks easier to manage.

- **Quick Startup** provides a curated software catalog, direct download links, and a Windows setup builder.
- **Personal Vault** lets you decrypt and download files from a compatible encrypted archive using a local key.

The interface runs as a static website using HTML, CSS, and JavaScript. It does not require an application server or an npm build step.

**[Open ZEROfilez](https://falker47.github.io/ZEROfilez/)**

## Quick Startup

Quick Startup organizes software into three searchable sections:

| Section | Contents |
|---|---|
| **Emulation** | Emulators for different gaming platforms, save editors, and related tools |
| **PC Programs** | Browsers, productivity software, maintenance utilities, communication apps, and development tools |
| **APK Files** | Selected Android application downloads |

The catalog is maintained in [`js/data.js`](js/data.js), with display ordering defined in [`js/array.js`](js/array.js).

Most downloads lead to upstream projects, publishers, or their release files. Some entries open a website or an application store instead of downloading a file directly.

ZEROfilez does not develop, certify, or control the third-party software listed in the catalog. Download availability, licensing, installer behavior, and release schedules remain the responsibility of the respective providers.

### Windows PC Setup

The **PC Programs** section also includes a setup builder for installing several Windows applications without opening every download page individually.

1. Select **Build** in PC Programs.
2. In **Choose**, select the applications you want.
3. In **Review**, check which applications support automatic installation and which require a manual download.
4. In **Install**, download or copy the generated Windows setup script and follow the separate manual download links.

The optional **ZEROfilez Selection** preset adds seven recommendations:

- Brave Browser
- Discord
- Notepad++
- 7-Zip
- Everything
- Revo Uninstaller
- Panacea

The first six use WinGet. Panacea remains a manual download, with its installer selected by default when newly added. The preset does not remove other selections, and every choice can be changed individually.

The builder creates `ZEROfilez-Windows-Setup.cmd` locally in your browser. Its automatic steps use:

- **WinGet**, with exact package IDs from the curated catalog and explicit `winget` or `msstore` sources.
- **Hermes Agent**, through its publisher's Windows App Installer feed, with publisher and installed-package checks.
- **OpenClaw Windows Hub**, through its official GitHub release, with checks of release metadata, the downloaded SHA-256 digest, and the Windows installer signature.

Only supported applications enter the generated script. Everything else remains in the manual download list, so unsupported selections are not silently omitted.

The script checks for applications already registered through their declared WinGet source, attempts the remaining installations, reports failures, and pauses before closing. Some installations may require administrator privileges, Windows services, a Microsoft Store account, or additional confirmation.

**The browser never runs the generated script automatically.** You must download or copy it and execute it on your own Windows computer.

The generated commands can be inspected under **Details** before running them. Review them, especially when selecting applications that use their own installer mechanisms rather than WinGet.

### Panacea

[Panacea](https://github.com/falker47/Panacea) is a separate Windows maintenance utility developed by the same author. ZEROfilez features it in PC Programs and provides two download options:

| Edition | Download | Update behavior |
|---|---|---|
| **Install** (recommended) | [PanaceaSetup.exe](https://github.com/falker47/Panacea/releases/latest/download/PanaceaSetup.exe) | Installs the application in a protected Windows location and supports user-confirmed guided updates |
| **Portable** | [Panacea.exe](https://github.com/falker47/Panacea/releases/latest/download/Panacea.exe) | Runs without installation; replacing it with a newer release is a manual operation |

Both links point to assets of the latest published stable GitHub release, rather than a hardcoded version.

Panacea is deliberately excluded from the automatically executed Windows setup commands. Selecting it in PC Setup adds the chosen edition to the manual download list.

For checksums, release notes, installation requirements, and safety guidance, consult the [Panacea repository](https://github.com/falker47/Panacea) and its [stable releases](https://github.com/falker47/Panacea/releases/latest). Its downloadable Windows binaries are not currently Authenticode-signed; published SHA-256 checksums are not equivalent to a verified publisher signature.

## Personal Vault

Personal Vault is a browser interface for reading a compatible encrypted file archive. It is intended for users who already possess the encrypted package, the corresponding key, and access to the encrypted files.

### How to use it

1. Switch from Quick Startup to **Personal Vault** using the toggle at the top of the page.
2. Select your `user.key` file in **User Key**.
3. Select the compatible `packages.json.enc` file in **Encrypted Package**.
4. Once the index has been decrypted, browse or search the available files.
5. Select **Download** beside a file to retrieve its encrypted contents, decrypt them in the browser, and save the resulting file locally.

The supplied `user.key` must contain exactly **32 bytes**.

The decryptor does not ask you to upload your plaintext files to an application backend. The selected key and encrypted index are processed locally in JavaScript.

Downloading an archived file does, however, require a network request to the URL recorded in its encrypted index. The storage provider can observe request metadata, and the remote server must allow browser access to the encrypted file, including any necessary CORS permissions.

### Encryption and package compatibility

The implementation in [`js/decryptor.js`](js/decryptor.js) uses:

- **AES-256-GCM** for authenticated decryption.
- **HKDF-SHA256** to derive a key-encryption key from the 32-byte user key and a constant included in the public frontend.
- A 12-byte nonce prefixed to AES-GCM encrypted data.
- Per-file data-encryption keys wrapped by the derived key-encryption key.

The encrypted index is a JSON object whose file records provide information such as the original filename, file size, encrypted-file URL, and wrapped file key.

The constant embedded in the JavaScript source is public and should not be treated as a secret. Confidentiality depends on the private key material, the encryption process, and the security of the devices and storage involved.

**The public repository contains the decryptor, not the archive generator.** The personal scripts used to prepare and encrypt the author's archives are not distributed here.

To use Personal Vault with another archive, its generator must produce data compatible with the format implemented by the frontend. Arbitrary encrypted files or unrelated backup formats cannot be opened simply by renaming them.

Personal Vault is not a backup service, a key-recovery service, or a general-purpose file encryption tool. Losing the necessary key or encrypted data may make the archive unrecoverable.

## Running ZEROfilez locally

The application uses JavaScript modules, so it should be served over HTTP rather than opened directly through a `file://` URL.

Clone the repository:

```bash
git clone https://github.com/falker47/ZEROfilez.git
cd ZEROfilez
```

Start a local HTTP server with Python 3:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

No `npm install` or compilation step is required to run the website.

A modern browser with JavaScript module and Web Crypto support is needed. Personal Vault's cryptographic operations require a secure browser context, such as HTTPS or localhost.

The same static files can be hosted on services such as GitHub Pages.

## Download catalog maintenance

Many software download addresses contain a release number, asset filename, or version-specific directory. These can become outdated as upstream projects publish new releases.

ZEROfilez includes an updater at [`scripts/update-links.js`](scripts/update-links.js) that checks supported sources and rewrites the corresponding entries in [`js/data.js`](js/data.js) when changes are found.

The updater uses different methods according to the provider, including GitHub and Gitea release APIs, official download pages, publisher endpoints, and selected package metadata sources.

Some downloads have stable publisher-maintained URLs that do not need a version rewrite. Others, including archived project-owned ZIP files, are intentionally maintained manually.

The updater uses Node.js **20 or later** and has no external npm dependencies.

Run it with:

```bash
node scripts/update-links.js
```

This command may modify `js/data.js`; review the resulting changes before committing them.

The workflow [`.github/workflows/update_links.yml`](.github/workflows/update_links.yml) also runs the updater on a daily schedule and attempts to commit catalog changes when necessary.

### Checking download links

A separate script performs live HTTP and file-format checks:

```bash
node scripts/audit-download-links.mjs
```

It follows redirects and inspects the beginning of downloaded responses to distinguish supported file formats from unexpected HTML pages or invalid files.

In the current implementation, this audit covers PC program downloads, their alternate installer links, and the Windows/Android destinations of the Emulation catalog. It does **not** comprehensively audit the separate APK Files section.

A successful check means the response passed the implemented availability and format checks at that moment. It does not establish:

- that the file is safe or free from malware;
- that the publisher's account or distribution infrastructure has not been compromised;
- that the download is the latest available version;
- that the software will install or work correctly on your device.

Upstream websites can change their release formats, rate-limit automated requests, or remove files. An updater may also fail before its changes are published. Catalog freshness is therefore best-effort, not guaranteed.

### Special download sources

**PKHeX.** The official Project Pokémon download process uses session-dependent links that are unsuitable for a permanent static catalog entry. ZEROfilez instead maintains a [Windows x64 PKHeX release](https://github.com/falker47/ZEROfilez/releases/latest) built from the corresponding stable upstream source tag.

The [PKHeX release workflow](.github/workflows/pkhex-release.yml) uses .NET 10, packages the Windows executable without modifying the upstream application source, and publishes the matching upstream source archive and GPLv3 notice. The resulting build requires the .NET 10 Windows Desktop Runtime. Each release should be checked against its accompanying source and build information.

**FileStorage.** Two legacy packages are hosted in the companion [FileStorage repository](https://github.com/falker47/FileStorage):

- `SkyEditor.SaveEditor.zip`
- `GBA_HackROM_Toolz[ZEROfilezRepack].zip`

These are curated archives, not continuously discovered upstream releases. Their availability and contents should be assessed separately from automatically updated vendor downloads.

## Project structure

| Path | Purpose |
|---|---|
| [`index.html`](index.html) | Main interface and both application modes |
| [`styles.css`](styles.css), [`css/`](css/) | Shared styling, components, layouts, and responsive design |
| [`js/main.js`](js/main.js) | Application initialization and mode switching |
| [`js/startup.js`](js/startup.js) | Quick Startup catalog, searches, downloads, and PC Setup interface |
| [`js/data.js`](js/data.js), [`js/array.js`](js/array.js) | Software catalog and display ordering |
| [`js/pc-categories.js`](js/pc-categories.js), [`js/pc-selection.js`](js/pc-selection.js) | Program categories and recommended setup preset |
| [`js/windows-setup.js`](js/windows-setup.js) | Windows command generation and supported installation methods |
| [`js/download-options.js`](js/download-options.js) | Download variants, including Panacea editions |
| [`js/decryptor.js`](js/decryptor.js) | Personal Vault key handling, index decryption, and file retrieval |
| [`js/icons.js`](js/icons.js), [`assets/`](assets/) | Locally hosted application icons and other artwork |
| [`scripts/`](scripts/) | Catalog maintenance, link audits, and setup-generation helpers |
| [`tests/`](tests/) | Node.js regression tests |
| [`.github/workflows/`](.github/workflows/) | CI, download maintenance, and PKHeX release automation |

Private archive keys, encrypted personal indexes, and personal package-generation scripts are intentionally excluded from this repository.

## Tests and automation

The [CI workflow](.github/workflows/ci.yml) runs on pull requests and pushes to `main`.

It includes:

- JavaScript syntax checks and Node.js built-in regression tests on Linux.
- Windows regression tests using an isolated WinGet stub.
- Windows-runner installation checks for the generated Hermes Agent and OpenClaw setup procedures.

The test suite covers setup generation, package IDs and sources, catalog organization, download choices, link-maintenance behavior, local icon assets, and selected UI integration points.

Run the Node.js test suite locally with:

```bash
node --test tests/*.test.mjs
```

There is also a separate [PKHeX build and release workflow](.github/workflows/pkhex-release.yml), which validates its generated artifacts and associated release information.

These automated checks are useful regression evidence, but they are not a full security audit. In particular, the existing tests do not provide end-to-end validation of Personal Vault with independently generated archives, and an isolated Windows runner cannot establish compatibility with every user's machine.

Workflow status and logs are available under [GitHub Actions](https://github.com/falker47/ZEROfilez/actions).

## Security, privacy, and limitations

ZEROfilez is designed to minimize infrastructure, but operating without an application backend does not eliminate every security or privacy concern.

**Personal Vault**

- Keep `user.key` private, protected, and backed up separately.
- Do not publish the key, decrypted index, or plaintext files.
- Use trusted HTTPS hosting for encrypted archives and the application.
- Remember that external storage providers can observe download requests even though decryption occurs locally.
- Keep independent backups. The decryptor cannot regenerate missing encrypted files or recover lost keys.
- Treat the implementation as application code, not as an independently audited cryptographic product.

**Software downloads and Windows Setup**

- Verify that downloads originate from the intended publisher.
- Review generated scripts before executing them, particularly steps that download and launch installer files.
- Check digital signatures, release checksums, and publisher documentation when available.
- Treat third-party APKs and executable installers as potentially sensitive; downloading a file through ZEROfilez does not certify it.
- Expect some installers to require Windows permissions, supporting services, or user confirmation.
- Do not assume that automated catalog checks provide complete supply-chain security.

ZEROfilez does not bundle the applications displayed in its ordinary catalog, apart from the separately identified project-hosted download arrangements. Their availability and continued maintenance are external dependencies.

## Licenses and attribution

**No repository-wide software license is currently provided.** Public access to this repository does not by itself grant a general permission to redistribute or reuse its source code.

The third-party applications linked in the catalog retain their own licenses, trademarks, distribution rules, and responsibilities.

Locally stored icons and brand assets also have separate origins and licensing conditions. Their provenance and available notices are documented in [`assets/icons/README.md`](assets/icons/README.md) and the accompanying license files.

The icon set includes material derived from sources such as Lucide, Simple Icons, project-maintained artwork, community icon collections, and official application resources. Product marks are used for identification and do not imply endorsement by their owners.

PKHeX remains an upstream project by [kwsch](https://github.com/kwsch/PKHeX), distributed under the GNU GPLv3. ZEROfilez's corresponding Windows release includes its license notice and matching source archive.

## Project background

ZEROfilez began during the COVID-19 lockdown, when I was frequently helping friends configure emulators and get started with retro gaming.

The same installation questions kept coming up, so I started turning individual explanations into reusable tutorials and organized download resources. Over time, that effort developed into a small community project.

Today's ZEROfilez retains that original purpose while extending it beyond emulation. Quick Startup helps people find and install useful software, while Personal Vault reflects a separate personal file-management workflow.

Both features follow the same practical motivation: make recurring technical tasks easier to repeat and maintain.

---

Created and maintained by [Maurizio Falconi (falker47)](https://github.com/falker47).
