// NodeJs Imports
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Parse Args
const args = yargs(hideBin(process.argv)).argv;
export const serve = 'serve' in args;

// Platform
export const platform = process.platform;
export const isMac = platform === 'darwin';
