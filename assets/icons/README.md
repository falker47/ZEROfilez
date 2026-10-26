# Icon assets

All entries in `js/icons.js` are local: remote icon services are not required at runtime.

- `lucide-*.svg`: [Lucide](https://github.com/lucide-icons/lucide), white stroke applied for the existing site design. Licensing: ISC, with some original Feather icons under MIT. See `LICENSE-LUCIDE.txt` for both notices.
- Legacy monochrome `brand-*.svg` files without `-color`: [Simple Icons](https://github.com/simple-icons/simple-icons), CC0 1.0. Brand names/logos remain the marks of their owners. The newer `brand-*-color.svg` files use the color renditions attributed below.
- `windows.svg`, `nintendo-switch.svg`: original simplified UI pictograms drawn for ZEROfilez (not official brand logos).
- Existing Panacea and ChatGPT assets are kept in their original location.

The catalog prefers distinct available brand marks; when no reusable SVG is available it uses a local generic pictogram rather than an unreliable external image.

## Catalog brand identities (local assets)

These assets distinguish products rather than substituting one generic icon for unrelated
software. They are served from this repository, including on the GitHub Pages subpath.
External image hosts are not required.

- **Nintendo DS, Nintendo 3DS, Game Boy Advance, Game Boy Color, Wii, Wii U:**
  monochrome platform logotypes from [HVR88/Monochrome-Gaming-Logos](https://github.com/HVR88/Monochrome-Gaming-Logos).
  These are community vector redraws of original console marks, *not* SVG files published
  by Nintendo. Cropped DS/3DS wordmarks prioritize legibility at compact icon size.
  The project's README asks users to link back; attribution is provided here.
- **ScummVM:** original `scummvm_icon.svg` from
  [scummvm/scummvm-media](https://github.com/scummvm/scummvm-media);
  project artwork by Jean-Marc Gimenez, distributed under
  [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
  The exported SVG's XML declaration was removed for embedding.
- **Patch My PC:** white logo from the publisher's
  [PatchMyPC-Brand-Resources repository](https://github.com/PatchMyPCTeam/PatchMyPC-Brand-Resources).
- **PowerToys:** Microsoft-authored app icon from
  [microsoft/PowerToys](https://github.com/microsoft/PowerToys).
- **Espanso:** app icon from the official
  [espanso/website](https://github.com/espanso/website).
- **MarkText:** app icon from
  [marktext/marktext](https://github.com/marktext/marktext).
- **Cheat Engine:** application icon from
  [cheat-engine/cheat-engine](https://github.com/cheat-engine/cheat-engine).
- **Everything:** `Everything.ico` from the
  [voidtools/everything_shell](https://github.com/voidtools/everything_shell) repository.
- **pCloud, Visual Studio Code, Xbox, Nintendo Switch:** recognisable marks
  from [homarr-labs/dashboard-icons](https://github.com/homarr-labs/dashboard-icons)
  (Apache-2.0 icon collection). These are independently hosted icon renditions,
  not an assertion that the respective vendors authored those SVGs.

The brand names and logos are trademarks of their respective owners. Inclusion in this
third-party catalog does not imply endorsement. The original icon set and license notices
remain in this directory.

## Colored product marks and icon formats (October 2026)

Product and platform marks should use the original palette/appearance wherever a
suitable reusable asset can be verified. The Lucide *interface controls* remain
monochrome by design. `css/brand-icons.css` no longer flattens product logos to white.

- **Brave, Chrome, Firefox, Obsidian, Claude, Bitwarden, Discord, WhatsApp, Telegram,
  Windows 11 and Android:** full-color brand renditions from
  [Dashboard Icons](https://github.com/homarr-labs/dashboard-icons), Apache-2.0.
  These are community-maintained renderings of vendor marks, not vendor-original files.
- **VLC:** authentic traffic-cone SVG from [VideoLAN's VLC repository](https://github.com/videolan/vlc/blob/master/extras/package/macosx/asset_sources/vlc_app_icon.svg);
  copyright/licensing stays with the upstream project.
- **Patch My PC:** publisher-provided full-color mark from
  [PatchMyPC-Brand-Resources](https://github.com/PatchMyPCTeam/PatchMyPC-Brand-Resources),
  replacing the monochrome white variant.
- **Notepad++:** original 256px PNG extracted without recoloring from the PNG frame of
  the installer's `npp_inst.ico` in the [Notepad++ source](https://github.com/notepad-plus-plus/notepad-plus-plus).
- **ShareX:** original transparent RGB app logo from
  [ShareX.HelpersLib/Resources](https://github.com/ShareX/ShareX).
- **Everything and Cheat Engine:** PNGs extracted / converted from their
  repository-owned original ICO files (the ICOs remain as source archives,
  not as catalog image references). Everything's ICO embeds a PNG frame;
  Cheat Engine's 32-bit BMP icon frame was converted to PNG losslessly.
- **Lucky Patcher:** recognizable third-party vector rendition from
  [JabberLabs/awesome-dashboard-icons](https://github.com/JabberLabs/awesome-dashboard-icons),
  Apache-2.0 (not publisher-authored).
- **Google Antigravity:** multicolor icon from
  [Papirus](https://github.com/PapirusDevelopmentTeam/papirus-icon-theme),
  a third-party rendition, distributed under its GPL-3.0 icon license.

The colored assets are each separate graphic files. Reproducing product marks to
identify curated software does not imply endorsement. Black-and-white marks that
are the vendor's actual brand design are kept as such; items for which no suitable
redistributable identity was verified retain simple generic category symbols.

## Further original-brand icons (October 2026)

- **Revo Uninstaller** and **WinRAR:** software icon artwork reused from
  [WINSLIM CENTER STORE](https://github.com/Christianlg97/WINSLIM_CENTER_STORE/tree/main/src/assets/catalog);
  these are community-held copies of the recognizable application artwork,
  not files obtained directly from the publishers.
- **WizTree:** recognizable application logo from
  [RepairKit](https://github.com/Foulest/RepairKit/tree/main/src/main/resources/icons),
  a third-party repository distributing a local program PNG.
- **HappyMod:** a locally drawn green/grey mascot mark following the commonly
  used HappyMod face-and-horns visual identity; this is a small SVG rendition,
  not a claim of a publisher-issued or endorsed logo.

All these assets remain local, and no catalog image reference uses `.ico`.

## Catalog icon refinements (October 26, 2026)

- **PKHeX:** the 64 × 64 `icon.png` from the actual
  [kwsch/PKHeX repository](https://github.com/kwsch/PKHeX/blob/master/icon.png)
  (GPL-3.0; see `LICENSE-GPL-3.0.txt`). This identifies PKHeX, rather than a generic save icon.
- **PMD Save Editor / SkyEditor:** the 64 × 64, 32-bit application image from the
  [SkyEditor.UI.WPF resource icon](https://github.com/evandixon/SkyEditor.UI.WPF/blob/master/SkyEditor.UI.WPF/Resources/favicon.ico)
  by Evan Dixon. Converted from the original ICO bitmap to a transparent PNG;
  original licensing notice in `LICENSE-SKYEDITOR-MIT.txt`. This identifies the desktop
  package named `SkyEditor.SaveEditor.zip`, not the separate web editor.
- **WinRAR:** the existing familiar stacked-books artwork was preserved. Its
  original indexed-color PNG is now rendered with palette index 0 (white backdrop)
  transparent via a `tRNS` chunk. No logo recoloring or resampling.
  Source remains the community-held artwork attributed above.
- **LibreOffice:** the existing Simple Icons-style document-outline mark is
  rendered in LibreOffice green (`#18A303`), keeping the recognizable form and a
  transparent SVG background. This is a locally color-adapted brand rendition,
  *not* an assertion that the SVG is publisher-authored.
- **Emulation tab:** a locally adapted color gamepad pictogram derived from
  the existing Lucide gamepad shape. It represents a catalog category and is not
  an official emblem for any particular emulator.

The five catalog icon references are repository-local; they require no remote
icon service, and third-party software names/marks remain with their owners.
