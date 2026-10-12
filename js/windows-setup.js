const WINGET_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]{1,126}[A-Za-z0-9+]$/;
const MSSTORE_ID_PATTERN = /^[A-Z0-9]{12}$/;

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
    const packages = getSetupPackages(items);

    if (packages.length === 0) {
        throw new Error('Select at least one winget-compatible application.');
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
title ZEROfilez Windows Setup

rem Generated locally in your browser.
rem Selected packages:
${packageComments}

where winget >nul 2>&1
if errorlevel 1 (
    echo ERROR: winget is not available.
    echo Install or update App Installer from Microsoft, then run this setup again.
    echo.
    echo Press any key to close this window.
    pause >nul
    exit /b 1
)

set "FAILED_PACKAGES="

${installCalls}

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

winget list --id "%PACKAGE_ID%" --exact --source %PACKAGE_SOURCE% --accept-source-agreements --disable-interactivity 2>nul | findstr /I /C:"%PACKAGE_ID%" >nul
if not errorlevel 1 (
    echo Already installed; skipping.
    exit /b 0
)

echo Installing...
if /I "%PACKAGE_SOURCE%"=="msstore" (
    winget install --id "%PACKAGE_ID%" --exact --source msstore --accept-package-agreements --accept-source-agreements
) else (
    winget install --id "%PACKAGE_ID%" --exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity
)

if errorlevel 1 (
    echo WARNING: Installation failed for %PACKAGE_ID%. Continuing with the remaining programs.
    set "FAILED_PACKAGES=%FAILED_PACKAGES% %PACKAGE_ID%"
) else (
    echo Installed successfully.
)

exit /b 0
`;
}

export function generatePowerShellSetup(items) {
    const packages = getSetupPackages(items);

    if (packages.length === 0) {
        throw new Error('Select at least one winget-compatible application.');
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

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Error 'winget is not available. Install or update App Installer from Microsoft, then run this script again.'
    exit 1
}

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

Write-Host ''

if ($failedPackages.Count -gt 0) {
    Write-Warning ("Completed with failures: " + ($failedPackages -join ', '))
    exit 1
}

Write-Host 'Windows setup completed successfully.'
`;
}
