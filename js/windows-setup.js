const WINGET_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]{1,126}[A-Za-z0-9+]$/;
const MSSTORE_ID_PATTERN = /^[A-Z0-9]{12}$/;

// Non-WinGet installers use their publisher-supported distribution and validation contracts.
export function isAutomaticSetupItem(item) {
    return Boolean(item?.wingetId) ||
        (item?.id === 'hermes-agent' && item?.autoInstaller === 'hermes-appinstaller') ||
        (item?.id === 'openclaw' && item?.autoInstaller === 'openclaw-inno');
}

function validateAutomaticInstallers(items) {
    if (!Array.isArray(items)) throw new TypeError('Expected an array of catalog items.');
    const supported = new Map([
        ['hermes-agent', 'hermes-appinstaller'],
        ['openclaw', 'openclaw-inno']
    ]);
    for (const item of items) {
        if (item?.autoInstaller && supported.get(item.id) !== item.autoInstaller) {
            throw new Error('Unsupported automatic installer: ' + String(item.autoInstaller));
        }
    }
}

function hasHermesSetup(items) {
    return items.some(item => item?.id === 'hermes-agent' && item?.autoInstaller === 'hermes-appinstaller');
}

function hasOpenClawSetup(items) {
    return items.some(item => item?.id === 'openclaw' && item?.autoInstaller === 'openclaw-inno');
}

const OPENCLAW_INSTALL_SCRIPT = `Write-Host 'Installing OpenClaw Windows Hub from the official stable release...'
$ErrorActionPreference = 'Stop'
$release = Invoke-RestMethod -Uri 'https://api.github.com/repos/openclaw/openclaw-windows-node/releases/latest' -Headers @{ Accept = 'application/vnd.github+json'; 'User-Agent' = 'ZEROfilez Windows Setup' } -TimeoutSec 30
if ($release.draft -or $release.prerelease) { throw 'The latest OpenClaw release was not stable.' }
$asset = $null
foreach ($candidate in $release.assets) {
    if ($candidate.name -eq 'OpenClawCompanion-Setup-x64.exe') { $asset = $candidate; break }
}
if (-not $asset) { throw 'GitHub did not publish an OpenClaw x64 installer in the latest stable release.' }
if ($asset.digest -notmatch '^sha256:[A-Fa-f0-9]{64}$') { throw 'GitHub did not provide an OpenClaw SHA-256 release digest.' }
if ($asset.browser_download_url -notmatch '^https://github\\.com/openclaw/openclaw-windows-node/releases/download/[^/]+/OpenClawCompanion-Setup-x64\\.exe$') {
    throw 'GitHub returned an OpenClaw installer outside the official release path.'
}
if ([long]$asset.size -lt 1000000) { throw 'GitHub returned an unexpectedly small OpenClaw installer.' }
$target = Join-Path $env:TEMP ('ZEROfilez-OpenClaw-' + [guid]::NewGuid().ToString('N') + '.exe')
$installRoot = Join-Path $env:LOCALAPPDATA 'OpenClawTray'
$installLog = Join-Path $env:TEMP ('ZEROfilez-OpenClaw-Install-' + [guid]::NewGuid().ToString('N') + '.log')
$expectedSigner = 'CN=OpenClaw Foundation, O=OpenClaw Foundation, L=Mill Valley, S=California, C=US'
try {
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $target -MaximumRedirection 5 -TimeoutSec 300
    $file = Get-Item -LiteralPath $target
    if ($file.Length -ne [long]$asset.size) { throw 'The downloaded OpenClaw installer size did not match release metadata.' }
    $hash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
    if ($hash -ine $asset.digest.Substring(7)) { throw 'The downloaded OpenClaw installer SHA-256 did not match GitHub release metadata.' }
    $signature = Get-AuthenticodeSignature -LiteralPath $target
    if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -ne $expectedSigner) {
        throw 'The OpenClaw installer Authenticode signature was invalid or belonged to a different publisher.'
    }
    $arguments = @('/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART','/SP-', ('/DIR=' + [char]34 + $installRoot + [char]34), ('/LOG=' + [char]34 + $installLog + [char]34))
    $process = Start-Process -FilePath $target -ArgumentList $arguments -Wait -PassThru
    Write-Host ('OpenClaw installer exited with code ' + $process.ExitCode + '.')
    if ($process.ExitCode -ne 0) { throw ('The OpenClaw installer exited with code ' + $process.ExitCode + '.') }
    $installed = Join-Path $installRoot 'OpenClaw.Tray.WinUI.exe'
    if (-not (Test-Path -LiteralPath $installed) -or (Get-Item -LiteralPath $installed).Length -lt 1000000) {
        Write-Host ('Expected OpenClaw executable path: ' + $installed)
        Write-Host ('OpenClaw installer log: ' + $installLog)
        if (Test-Path -LiteralPath $installLog) {
            Get-Content -LiteralPath $installLog -Tail 60 | ForEach-Object { Write-Host $_ }
        }
        throw 'OpenClaw Windows Hub was not present after the installer completed.'
    }
    Remove-Item -LiteralPath $installLog -Force -ErrorAction SilentlyContinue
    Write-Host ('OpenClaw Windows Hub ' + $release.tag_name + ' installed. Open it to complete Gateway setup.')
} finally {
    Remove-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue
}`;

function getOpenClawInstallScriptForCommand() {
    return OPENCLAW_INSTALL_SCRIPT.split(/\r?\n/).map(line => line.trim()).filter(Boolean).join('; ');
}

export function isValidWingetId(value) {
    return typeof value === 'string'
        && value.length >= 3
        && value.length <= 128
        && value.includes('.')
        && !value.includes('..')
        && WINGET_ID_PATTERN.test(value);
}

export function isValidStoreId(value) {
    return typeof value === 'string' && MSSTORE_ID_PATTERN.test(value);
}

function sanitizeComment(value) {
    return String(value ?? '')
        .replace(/[\r\n\u2028\u2029]+/g, ' ')
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .replace(/[&|<>^%!()\"]/g, ' ')
        .trim();
}

function compareAsciiCaseInsensitive(left, right) {
    const a = left.toLowerCase();
    const b = right.toLowerCase();
    if (a < b) return -1;
    if (a > b) return 1;
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
}

export function getSetupPackages(items) {
    if (!Array.isArray(items)) {
        throw new TypeError('Expected an array of catalog items.');
    }

    const unique = new Map();
    for (const item of items) {
        const wingetId = item?.wingetId;
        if (!wingetId) continue;

        const source = item?.wingetSource ?? 'winget';
        if (source !== 'winget' && source !== 'msstore') {
            throw new Error(`Unsupported winget source: ${String(source)}`);
        }
        const valid = source === 'msstore' ? isValidStoreId(wingetId) : isValidWingetId(wingetId);
        if (!valid) {
            throw new Error(`Invalid ${source} package ID: ${String(wingetId)}`);
        }

        const key = `${source}:${wingetId.toLowerCase()}`;
        if (!unique.has(key)) {
            unique.set(key, {
                name: sanitizeComment(item?.name || wingetId),
                wingetId,
                ...(source === 'msstore' ? { wingetSource: 'msstore' } : {})
            });
        }
    }

    return [...unique.values()].sort((a, b) =>
        compareAsciiCaseInsensitive(a.wingetSource ?? 'winget', b.wingetSource ?? 'winget') ||
        compareAsciiCaseInsensitive(a.wingetId, b.wingetId)
    );
}

export function generateCommandSetup(items) {
    validateAutomaticInstallers(items);
    const packages = getSetupPackages(items);
    const hermes = hasHermesSetup(items);
    const openclaw = hasOpenClawSetup(items);

    if (packages.length === 0 && !hermes && !openclaw) {
        throw new Error('Select at least one supported automatic application.');
    }

    const packageComments = packages
        .map(pkg => `rem - ${pkg.name || pkg.wingetId}: ${pkg.wingetId} [${pkg.wingetSource || 'winget'}]`)
        .join('\r\n');

    const installCalls = packages
        .map(pkg => pkg.wingetSource === 'msstore'
            ? `call :install "${pkg.wingetId}" "msstore"`
            : `call :install "${pkg.wingetId}"`)
        .join('\r\n');

    return `@echo off
setlocal EnableExtensions
set "ERRORLEVEL="
title ZEROfilez Windows Setup

rem Generated locally in your browser.
rem Selected packages:
${packageComments}

${packages.length ? `where winget >nul 2>&1
if errorlevel 1 (
    echo ERROR: winget is not available.
    echo Install or update App Installer from Microsoft, then run this setup again.
    echo.
    echo Press any key to close this window.
    pause >nul
    exit /b 1
)` : ''}

set "FAILED_PACKAGES="

${installCalls}
${hermes ? 'call :installHermes' : ''}
${openclaw ? 'call :installOpenClaw' : ''}

echo.
if defined FAILED_PACKAGES (
    echo Completed with failures:%FAILED_PACKAGES%
    echo The programs above were not installed. The other selections may have completed successfully.
    echo.
    echo Press any key to close this window.
    pause >nul
    exit /b 1
)

echo Windows setup completed successfully.
echo.
echo Press any key to close this window.
pause >nul
exit /b 0

:install
set "PACKAGE_ID=%~1"
set "PACKAGE_SOURCE=%~2"
if not defined PACKAGE_SOURCE set "PACKAGE_SOURCE=winget"
echo.
echo ==^> %PACKAGE_ID%

winget list --id "%PACKAGE_ID%" --exact --source %PACKAGE_SOURCE% --accept-source-agreements --disable-interactivity >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo Already installed; skipping.
    exit /b 0
)

echo Installing...
if /I "%PACKAGE_SOURCE%"=="msstore" (
    winget install --id "%PACKAGE_ID%" --exact --source msstore --accept-package-agreements --accept-source-agreements
) else (
    winget install --id "%PACKAGE_ID%" --exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity
)

if not "%ERRORLEVEL%"=="0" (
    echo WARNING: Installation failed for %PACKAGE_ID% with exit code %ERRORLEVEL%. Continuing with the remaining programs.
    set "FAILED_PACKAGES=%FAILED_PACKAGES% %PACKAGE_ID%"
) else (
    echo Installed successfully.
)

exit /b 0
${hermes ? `
:installHermes
echo.
echo ==^> Hermes Agent (official signed Windows App Installer feed)
powershell.exe -NoLogo -NoProfile -NonInteractive -Command "$ErrorActionPreference='Stop'; $expectedPublisher='CN=Nous Research Inc., O=Nous Research Inc., L=Austin, S=Texas, C=US'; $target=Join-Path $env:TEMP ('ZEROfilez-Hermes-' + [guid]::NewGuid().ToString('N') + '.appinstaller'); try { Invoke-WebRequest -Uri 'https://hermes-assets.nousresearch.com/releases/win32/stable/stable.appinstaller' -OutFile $target -MaximumRedirection 3 -TimeoutSec 60; [xml]$manifest=Get-Content -LiteralPath $target -Raw; $package=$manifest.AppInstaller.MainBundle; if (-not $package -or $package.Publisher -ne $expectedPublisher) { throw 'Hermes App Installer publisher did not match Nous Research.' }; $bundle=[uri]$package.Uri; if ($bundle.Scheme -ne 'https' -or $bundle.Host -ne 'hermes-assets.nousresearch.com' -or $bundle.AbsolutePath -notlike '/releases/*.msixbundle' -and $bundle.AbsolutePath -notlike '/releases/*/*.msixbundle') { throw 'Hermes bundle URI was outside the official release host.' }; $installed=Get-AppxPackage | Where-Object { $_.Publisher -eq $expectedPublisher -and $_.Name -match 'Hermes' } | Sort-Object { [version]$_.Version } -Descending | Select-Object -First 1; if ($installed -and [version]$installed.Version -ge [version]$package.Version) { Write-Host 'Hermes Agent is already installed at the current stable version.'; exit 0 }; Add-AppxPackage -AppInstallerFile $target -ErrorAction Stop; $installed=Get-AppxPackage | Where-Object { $_.Publisher -eq $expectedPublisher -and $_.Name -match 'Hermes' -and [version]$_.Version -ge [version]$package.Version } | Select-Object -First 1; if (-not $installed) { throw 'Hermes package was not registered after App Installer completed.' } } catch { Write-Error $_; exit 1 } finally { Remove-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue }"
if not "%ERRORLEVEL%"=="0" (
    echo WARNING: Hermes Agent installation failed. Continuing.
    set "FAILED_PACKAGES=%FAILED_PACKAGES% hermes-agent"
) else (
    echo Hermes Agent installed successfully.
)
exit /b 0
` : ''}
${openclaw ? `
:installOpenClaw
echo.
echo ==^> OpenClaw Windows Hub (official stable release, verified SHA-256 and signature)
powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command \"${getOpenClawInstallScriptForCommand()}\"
if not \"%ERRORLEVEL%\"==\"0\" (
    echo WARNING: OpenClaw installation failed. Continuing.
    set \"FAILED_PACKAGES=%FAILED_PACKAGES% openclaw\"
) else (
    echo OpenClaw Windows Hub installed successfully.
)
exit /b 0
` : ''}
`;
}

export function generatePowerShellSetup(items) {
    validateAutomaticInstallers(items);
    const packages = getSetupPackages(items);
    const hermes = hasHermesSetup(items);
    const openclaw = hasOpenClawSetup(items);

    if (packages.length === 0 && !hermes && !openclaw) {
        throw new Error('Select at least one supported automatic application.');
    }

    const packageComments = packages
        .map(pkg => `# - ${pkg.name || pkg.wingetId}: ${pkg.wingetId} [${pkg.wingetSource || 'winget'}]`)
        .join('\n');

    const packageIds = packages
        .map(pkg => `    @{ Id = '${pkg.wingetId}'; Source = '${pkg.wingetSource || 'winget'}' }`)
        .join(',\n');

    return `# ZEROfilez Windows Setup
# Generated locally in your browser. Review this file before running it.
# Selected packages:
${packageComments}

$ErrorActionPreference = 'Continue'

# Use the native executable resolver used by the CMD installer. PowerShell's
# Get-Command lookup can stall when WinGet is absent on a restricted PATH.
# where.exe searches executable locations without module/alias discovery.
${packages.length ? `& where.exe winget.exe > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error 'winget is not available. Install or update App Installer from Microsoft, then run this script again.'
    exit 1
}` : ''}

$packages = @(
${packageIds}
)

$failedPackages = @()

foreach ($package in $packages) {
    $packageId = $package.Id
    $source = $package.Source
    Write-Host ''
    Write-Host "==> $packageId"

    $installedOutput = & winget list --id $packageId --exact --source $source --accept-source-agreements --disable-interactivity 2>&1
    $installedExitCode = $LASTEXITCODE
    $installedText = $installedOutput -join "\`n"

    if ($installedExitCode -eq 0 -and $installedText -match [regex]::Escape($packageId)) {
        Write-Host 'Already installed; skipping.'
        continue
    }

    Write-Host 'Installing...'
    if ($source -eq 'msstore') {
        & winget install --id $packageId --exact --source msstore --accept-package-agreements --accept-source-agreements
    } else {
        & winget install --id $packageId --exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host 'Installed successfully.'
    } else {
        Write-Warning "Installation failed for $packageId (exit code $LASTEXITCODE). Continuing with the remaining packages."
        $failedPackages += $packageId
    }
}

${hermes ? `
$expectedPublisher = 'CN=Nous Research Inc., O=Nous Research Inc., L=Austin, S=Texas, C=US'
$target = Join-Path $env:TEMP ('ZEROfilez-Hermes-' + [guid]::NewGuid().ToString('N') + '.appinstaller')
try {
    Write-Host 'Installing Hermes Agent from the official signed Windows App Installer feed...'
    Invoke-WebRequest -Uri 'https://hermes-assets.nousresearch.com/releases/win32/stable/stable.appinstaller' -OutFile $target -MaximumRedirection 3 -TimeoutSec 60
    [xml]$manifest = Get-Content -LiteralPath $target -Raw
    $package = $manifest.AppInstaller.MainBundle
    if (-not $package -or $package.Publisher -ne $expectedPublisher) {
        throw 'Hermes App Installer publisher did not match Nous Research.'
    }
    $bundle = [uri]$package.Uri
    if ($bundle.Scheme -ne 'https' -or $bundle.Host -ne 'hermes-assets.nousresearch.com' -or
        $bundle.AbsolutePath -notlike '/releases/*.msixbundle' -and $bundle.AbsolutePath -notlike '/releases/*/*.msixbundle') {
        throw 'Hermes bundle URI was outside the official release host.'
    }
    $installed = Get-AppxPackage | Where-Object {
        $_.Publisher -eq $expectedPublisher -and $_.Name -match 'Hermes'
    } | Sort-Object { [version]$_.Version } -Descending | Select-Object -First 1
    if ($installed -and [version]$installed.Version -ge [version]$package.Version) {
        Write-Host 'Hermes Agent is already installed at the current stable version.'
    } else {
        Add-AppxPackage -AppInstallerFile $target -ErrorAction Stop
        $installed = Get-AppxPackage | Where-Object {
            $_.Publisher -eq $expectedPublisher -and $_.Name -match 'Hermes' -and
            [version]$_.Version -ge [version]$package.Version
        } | Select-Object -First 1
        if (-not $installed) {
            throw 'Hermes package was not registered after App Installer completed.'
        }
        Write-Host "Hermes Agent $($installed.Version) installed successfully."
    }
} catch {
    Write-Warning ('Hermes Agent installation failed: ' + $_.Exception.Message)
    $failedPackages += 'hermes-agent'
} finally {
    Remove-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue
}
` : ''}
${openclaw ? `
try {
${OPENCLAW_INSTALL_SCRIPT.split(/\r?\n/).map(line => '    ' + line).join('\n')}
} catch {
    Write-Warning ('OpenClaw installation failed: ' + $_.Exception.Message)
    $failedPackages += 'openclaw'
}
` : ''}

Write-Host ''

if ($failedPackages.Count -gt 0) {
    Write-Warning ("Completed with failures: " + ($failedPackages -join ', '))
    exit 1
}

Write-Host 'Windows setup completed successfully.'
`;
}
