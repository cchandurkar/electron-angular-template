import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv)).argv;
export const serve = 'serve' in args;

export const platform = process.platform;
export const isMac = platform === 'darwin';
