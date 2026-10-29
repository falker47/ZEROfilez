import { ITEMS } from '../js/data.js';
import { generateCommandSetup, generatePowerShellSetup } from '../js/windows-setup.js';

const generate = process.argv.includes('--cmd') ? generateCommandSetup : generatePowerShellSetup;
process.stdout.write(generate([ITEMS['pc-programs'].openclaw]));
