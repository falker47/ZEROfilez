import { ITEMS } from '../js/data.js';
import { generatePowerShellSetup } from '../js/windows-setup.js';

const hermes = ITEMS['pc-programs']['hermes-agent'];
process.stdout.write(generatePowerShellSetup([hermes]));
