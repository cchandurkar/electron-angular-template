import { app } from 'electron';
import Logger from 'electron-log/main.js';
import type { FileTransport, LogFile, LogMessage, MainLogger, TransformFn } from 'electron-log/src';
import fs from 'fs';
import path from 'path';
import { serve } from './config.js';

// Cache for logger instances to avoid creating duplicates
const loggerCache = new Map<string, MainLogger>();

/** Date in YYYY-MM-DD format, adjusted for timezone offset. */
const getDay = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const today = new Date(date.getTime() - offset * 60 * 1000);
  return today.toISOString().substring(0, 10);
};

/** Archives the log file by renaming it with the current date. */
const dailyArchiveLogFn = (logFile: LogFile) => {
  const info = path.parse(logFile.path);
  const today = getDay(new Date());
  const newPath = path.join(info.dir, `${info.name}-${today}${info.ext}`);
  try {
    fs.renameSync(logFile.path, newPath);
  } catch (e) {
    console.warn(`Could not rotate log file: ${logFile.path}`, e);
  }
};

/** Archives the log file when its creation date differs from the current log message's date. */
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

export const getLogger = (logId: string): MainLogger => {
  const cachedLogger = loggerCache.get(logId);
  if (cachedLogger) {
    return cachedLogger;
  }

  console.log('Log Path', app.getPath('logs'));
  console.log('App Path', app.getAppPath());

  const logger = Logger.create({ logId });

  const fileName = `${logId}.log`;
  const maxFileSize = 4 * 1e6; // 4MB
  logger.transports.file.level = serve ? 'debug' : 'info';
  logger.transports.file.fileName = fileName;
  logger.transports.file.maxSize = maxFileSize;
  logger.transports.file.format = '[{y}-{m}-{d}T{h}:{i}:{s}.{ms}] [{level}]{scope}{text}';
  logger.transports.file.archiveLogFn = dailyArchiveLogFn;
  logger.transports.file.transforms.push(dailyRotateFile);

  logger.transports.console.level = serve ? 'debug' : 'info';
  logger.transports.console.format = '[{y}-{m}-{d}T{h}:{i}:{s}.{ms}] [{level}]{scope}{text}';
  logger.transports.console.useStyles = true;
  logger.transports.console.writeFn = ({ message }: { message: LogMessage }) => {
    console.log(colorize(message));
  };

  loggerCache.set(logId, logger);

  return logger;
};

const colorCodes: Record<string, string> = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[34m', // Blue
  debug: '\x1b[90m', // Gray
  default: '\x1b[37m' // White
};

const colorize = (message: LogMessage): string => {
  const reset = '\x1b[0m';
  const color = colorCodes[message.level] || colorCodes.default;
  const text = message.data.join(' ');
  return `${color}${text}${reset}`;
};

export default getLogger('main');
