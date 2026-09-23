const WINGET_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{1,126}[A-Za-z0-9]$/;

export function isValidWingetId(value) {
    return typeof value === 'string'
        && value.length >= 3
        && value.length <= 128
        && value.includes('.')
        && !value.includes('..')
        && WINGET_ID_PATTERN.test(value);
}

function sanitizeComment(value) {
    return String(value ?? '')
        .replace(/[\r\n\u2028\u2029]+/g, ' ')
        .replace(/[\u0000-\u001f\u007f]/g, '')
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

        if (!isValidWingetId(wingetId)) {
            throw new Error(`Invalid winget package ID: ${String(wingetId)}`);
        }

        const key = wingetId.toLowerCase();
        if (!unique.has(key)) {
            unique.set(key, {
                name: sanitizeComment(item?.name || wingetId),
                wingetId
            });
        }
    }

    return [...unique.values()].sort((a, b) =>
        compareAsciiCaseInsensitive(a.wingetId, b.wingetId)
    );
}

export function generatePowerShellSetup(items) {
    const packages = getSetupPackages(items);

    if (packages.length === 0) {
        throw new Error('Select at least one winget-compatible application.');
    }

    const packageComments = packages
        .map(pkg => `# - ${pkg.name || pkg.wingetId}: ${pkg.wingetId}`)
        .join('\n');

    const packageIds = packages
        .map(pkg => `    '${pkg.wingetId}'`)
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

$packageIds = @(
${packageIds}
)

$failedPackages = @()

foreach ($packageId in $packageIds) {
    Write-Host ''
    Write-Host "==> $packageId"

    $installedOutput = & winget list --id $packageId --exact --source winget --accept-source-agreements --disable-interactivity 2>&1
    $installedExitCode = $LASTEXITCODE
    $installedText = $installedOutput -join "\`n"

    if ($installedExitCode -eq 0 -and $installedText -match [regex]::Escape($packageId)) {
        Write-Host 'Already installed; skipping.'
        continue
    }

    Write-Host 'Installing...'
    & winget install --id $packageId --exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity

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
