
import Logger from 'electron-log/main';
import type { MainLogger, TransformFn, FileTransport, LogFile, LogMessage } from 'electron-log/src';
import fs from 'fs';
import path from 'path';
import { serve } from './config';

// Cache for logger instances to avoid creating duplicates
const loggerCache = new Map<string, MainLogger>();

/**
 * Get the date in YYYY-MM-DD format, adjusted for timezone offset.
 * @param date 
 * @returns 
 */
const getDay = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const today = new Date(date.getTime() - offset * 60 * 1000);
  return today.toISOString().substring(0, 10);
}

/**
 * Archives the log file by renaming it with the current date.
 * 
 * @param logFile The log file to archive.
 */
const dailyArchiveLogFn = (logFile: LogFile) => {
  const info = path.parse(logFile.path);
  const today = getDay(new Date());
  const newPath = path.join(info.dir, `${info.name}-${today}${info.ext}`);
  try {
    fs.renameSync(logFile.path, newPath);
  } catch (e) {
    console.warn(`Could not rotate log file: ${logFile.path}`, e);
  }
}

/**
 * Transform that checks if the log file needs to be archived based on the date.
 * 
 * @param param0 
 * @returns 
 */
const dailyRotateFile: TransformFn = ({ data, message, transport }) => {
  const messageDate = getDay(new Date(message.date));
  const logFile = (<FileTransport>transport).getFile();
  const logFileStats = fs.statSync(logFile.path);
  const logFileCreationDate = getDay(new Date(logFileStats.birthtime));
  if (messageDate > logFileCreationDate) {
    (<FileTransport>transport).archiveLogFn(logFile);
  }
  return data;
};

/**
 * Creates a logger for module
 * @returns {MainLogger}
 */
export const getLogger = (logId: string): MainLogger => {

   // Return cached logger if it exists
  const cachedLogger = loggerCache.get(logId);
  if (cachedLogger) {
    return cachedLogger;
  }

  // Instance. Max File = 4MB
  const logger = Logger.create( { logId } );

  // File transform config
  const fileName = `${logId}.log`;
  const maxFileSize = 4 * 1e+6;
  logger.transports.file.level = serve ? 'debug': 'info';
  logger.transports.file.fileName = fileName;
  logger.transports.file.maxSize = maxFileSize;
  logger.transports.file.format = '[{y}-{m}-{d}T{h}:{i}:{s}.{ms}] [{level}]{scope} > {text}';
  logger.transports.file.archiveLogFn = dailyArchiveLogFn;
  logger.transports.file.transforms.push(dailyRotateFile);

  // Setup console transport
  logger.transports.console.level = serve ? 'debug' : 'info';
  logger.transports.console.format = '[{y}-{m}-{d}T{h}:{i}:{s}.{ms}] [{level}]{scope} > {text}';
  logger.transports.console.useStyles = true;
  logger.transports.console.writeFn = ({ message }: { message: LogMessage }) => {
    console.log(colorize(message));
  };

  // Set logger to cache
  loggerCache.set(logId, logger);

  return logger;
}

const colorCodes: Record<string, string> = {
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    info: '\x1b[34m',    // Blue
    debug: '\x1b[90m',   // Gray
    default: '\x1b[37m', // White
  };

const colorize = (message: LogMessage): string => {
  const reset = '\x1b[0m'
  const color = colorCodes[message.level] || colorCodes.default;
  const text = message.data.join(' ');
  return `${color}${text}${reset}`;
}

export default getLogger('main');