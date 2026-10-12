import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { generateCommandSetup, generatePowerShellSetup } from '../js/windows-setup.js';

// This executable never delegates to WinGet or launches another process.
const stubSource = `
using System;
using System.IO;
public class FakeWinget {
    public static int Main(string[] args) {
        string mode = Environment.GetEnvironmentVariable("ZF_STUB_MODE");
        string log = Environment.GetEnvironmentVariable("ZF_STUB_LOG");
        string id = "", source = "";
        for (int i = 1; i + 1 < args.Length; i++) {
            if (args[i] == "--id") id = args[i + 1];
            if (args[i] == "--source") source = args[i + 1];
        }
        if (args.Length == 0 || (args[0] != "list" && args[0] != "install")) return 99;
        File.AppendAllText(log, String.Join("\\t", args) + Environment.NewLine);
        if (mode == "missing-source" && source == "msstore") {
            Console.WriteLine("No source matches msstore");
            return -1978335214;
        }
        if (args[0] == "list") {
            if (mode == "installed") {
                Console.WriteLine("Name Id Version");
                Console.WriteLine("Example " + id + " 1.0");
                return 0;
            }
            if (mode == "list-error-with-id") {
                Console.WriteLine("Failed to query " + id);
                return -1978335231;
            }
            Console.WriteLine("No installed package found");
            return -1978335212;
        }
        if (source == "msstore" && mode == "negative-install") return -1978335202;
        if (source == "msstore" && mode == "positive-install") return 1;
        return 0;
    }
}`;

const store = { name: 'ChatGPT Desktop', wingetId: '9PLM9XGG6VKS', wingetSource: 'msstore' };
const community = { name: 'Git', wingetId: 'Git.Git' };
const manual = { name: 'Manual download', url: 'https://example.com/manual.exe' };

test('generated setups execute safely against an isolated native WinGet stub', {
    skip: process.platform !== 'win32' ? 'Requires native Windows CMD and PowerShell' : false
}, async t => {
    const root = mkdtempSync(path.join(tmpdir(), 'zerofilez-native-'));
    t.after(() => {
        assert.equal(path.dirname(root), path.resolve(tmpdir()));
        assert.ok(path.basename(root).startsWith('zerofilez-native-'));
        rmSync(root, { recursive: true, force: true });
    });
    const bin = path.join(root, 'bin');
    mkdirSync(bin);
    const systemRoot = process.env.SystemRoot || 'C:\\Windows';
    const system32 = path.join(systemRoot, 'System32');
    const cmd = path.join(system32, 'cmd.exe');
    const powershell = path.join(system32, 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    const compiler = path.join(systemRoot, 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe');
    const stubPath = path.join(bin, 'winget.exe');
    const sourcePath = path.join(root, 'winget.cs');
    writeFileSync(sourcePath, stubSource);
    const compilation = spawnSync(compiler, ['/nologo', '/target:exe', '/out:' + stubPath, sourcePath], {
        encoding: 'utf8', timeout: 30000
    });
    assert.ifError(compilation.error);
    assert.equal(compilation.status, 0, compilation.stdout + compilation.stderr);

    // No user PATH, WindowsApps aliases, profiles or cmd AutoRun are inherited.
    // The only possible bare `winget` resolution must be our non-delegating stub.
    const env = {
        SystemRoot: systemRoot, WINDIR: systemRoot,
        TEMP: root, TMP: root, ComSpec: cmd,
        PATH: bin + path.delimiter + system32, PATHEXT: '.EXE;.COM;.BAT;.CMD'
    };
    const resolution = spawnSync(cmd, ['/d', '/c', 'where winget'], {
        cwd: root, env, encoding: 'utf8', timeout: 10000
    });
    assert.ifError(resolution.error);
    assert.equal(resolution.status, 0);
    // Windows may report the long path for a short 8.3 TEMP directory alias.
    const canonicalStub = realpathSync.native(stubPath).toLowerCase();
    assert.deepEqual(resolution.stdout.trim().split(/\r?\n/).map(value => realpathSync.native(value).toLowerCase()), [canonicalStub]);
    const psResolution = spawnSync(powershell, ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command',
        '(Get-Command winget -CommandType Application).Source'], {
        cwd: root, env, encoding: 'utf8', timeout: 10000
    });
    assert.ifError(psResolution.error);
    assert.equal(psResolution.status, 0);
    assert.equal(realpathSync.native(psResolution.stdout.trim()).toLowerCase(), canonicalStub);

    function run(format, mode, selection, inheritedErrorLevel) {
        const file = path.join(root, 'setup.' + format);
        const log = path.join(root, format + '-' + mode + '.log');
        const script = format === 'cmd' ? generateCommandSetup(selection) : generatePowerShellSetup(selection);
        // Fail closed if the generator ever starts invoking an absolute installer,
        // a different executable, a new shell, or changing PATH.
        const commands = [...script.matchAll(/\bwinget (list|install)\b/g)].map(match => match[1]);
        assert.deepEqual(commands, ['list', 'install', 'install']);
        assert.doesNotMatch(script, /winget\.exe|WindowsApps|Start-Process|Invoke-Expression|\biex\b|\bpowershell\b|\bpwsh\b|\bcmd\.exe\b|(?:set\s+"?PATH=|\$env:PATH\s*=)/i);
        writeFileSync(file, script);
        writeFileSync(log, '');
        const result = spawnSync(format === 'cmd' ? cmd : powershell,
            format === 'cmd' ? ['/d', '/c', file] : ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command',
                '& ([scriptblock]::Create([IO.File]::ReadAllText($env:ZF_SETUP_FILE)))'], {
                cwd: root, env: { ...env, ZF_STUB_MODE: mode, ZF_STUB_LOG: log, ZF_SETUP_FILE: file,
                    ...(inheritedErrorLevel !== undefined ? { ERRORLEVEL: inheritedErrorLevel } : {}),
                    ...(mode === 'unavailable' ? { PATH: system32 } : {}) },
                encoding: 'utf8', input: '\r\n\r\n', timeout: 15000
            });
        assert.ifError(result.error);
        const calls = readFileSync(log, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(line => line.split('\t'));
        return { ...result, output: result.stdout + result.stderr, calls };
    }

    for (const format of ['cmd', 'ps1']) {
        await t.test(format + ' exits with failure when WinGet is unavailable', () => {
            const result = run(format, 'unavailable', [store, community]);
            assert.equal(result.status, 1, result.output);
            assert.match(result.output, /winget is not available/);
            assert.deepEqual(result.calls, []);
        });
        await t.test(format + ' skips already installed Store and community packages', () => {
            const result = run(format, 'installed', [store, community, manual]);
            assert.equal(result.status, 0, result.output);
            assert.deepEqual(result.calls.map(args => args[0]), ['list', 'list']);
            assert.equal((result.output.match(/Already installed; skipping\./g) || []).length, 2);
        });
        for (const [name, selection, expected] of [
            ['community only', [community], [['Git.Git', 'winget']]],
            ['Store only', [store], [['9PLM9XGG6VKS', 'msstore']]],
            ['mixed with manual download', [community, store, manual], [['9PLM9XGG6VKS', 'msstore'], ['Git.Git', 'winget']]]
        ]) {
            await t.test(format + ' installs exact IDs from the declared sources: ' + name, () => {
                const result = run(format, 'success', selection);
                assert.equal(result.status, 0, result.output);
                const installs = result.calls.filter(args => args[0] === 'install');
                assert.deepEqual(installs.map(args => [args[args.indexOf('--id') + 1], args[args.indexOf('--source') + 1]]), expected);
                for (const args of installs) {
                    assert.ok(args.includes('--exact'));
                    assert.ok(args.includes('--accept-package-agreements'));
                    assert.ok(args.includes('--accept-source-agreements'));
                    assert.equal(args.includes('--disable-interactivity'), args.includes('winget'));
                }
            });
        }
        for (const mode of ['negative-install', 'positive-install', 'missing-source']) {
            await t.test(format + ' reports failure and continues after ' + mode, () => {
                const result = run(format, mode, [store, community]);
                assert.equal(result.status, 1, result.output);
                assert.match(result.output, /Completed with failures:.*9PLM9XGG6VKS/);
                assert.deepEqual(result.calls.filter(args => args[0] === 'install').map(args => args[args.indexOf('--id') + 1]), ['9PLM9XGG6VKS', 'Git.Git']);
            });
        }
        await t.test(format + ' does not treat an ID in failed list output as installed', () => {
            const result = run(format, 'list-error-with-id', [community]);
            assert.equal(result.status, 0, result.output);
            assert.deepEqual(result.calls.map(args => args[0]), ['list', 'install']);
            assert.doesNotMatch(result.output, /Already installed; skipping\./);
        });
    }

    await t.test('cmd ignores an inherited ERRORLEVEL=0 when a native command fails', () => {
        const result = run('cmd', 'negative-install', [store, community], '0');
        assert.equal(result.status, 1, result.output);
        assert.match(result.output, /Completed with failures:.*9PLM9XGG6VKS/);
        assert.deepEqual(result.calls.filter(args => args[0] === 'install').map(args => args[args.indexOf('--id') + 1]), ['9PLM9XGG6VKS', 'Git.Git']);
    });
    await t.test('cmd ignores an inherited nonzero ERRORLEVEL for installed detection', () => {
        const result = run('cmd', 'installed', [store, community], '7');
        assert.equal(result.status, 0, result.output);
        assert.deepEqual(result.calls.map(args => args[0]), ['list', 'list']);
    });
});
