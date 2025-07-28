import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { app } from 'electron';

// Cache for logger instances to avoid creating duplicates
const loggerCache = new Map<string, winston.Logger>();

/**
 * Creates and configures a Winston logger with daily file rotation and max file size of 10MB.
 * 
 * @param loggerName - The name of the logger instance. @default 'main'
 * @returns Configured Winston logger instance
 */
export function getLogger(loggerName: string = 'main'): winston.Logger {
  
  // Return cached logger if it exists
  const cachedLogger = loggerCache.get(loggerName);
  if (cachedLogger) {
    return cachedLogger;
  }

  // Define log directory - use app.getPath('logs') for Electron apps
  const logDirectory = app.getPath('logs');
  console.log(`Log directory: ${logDirectory}`);
  
  // Each logger writes to its own file
  const filename = loggerName;

  // Configure daily rotate file transport
  const dailyRotateFileTransport = new DailyRotateFile({
    filename: path.join(logDirectory, `${loggerName}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m', // 20MB max file size
    maxFiles: '14d', // Keep logs for 14 days
    zippedArchive: true, // Compress archived log files
    format: winston.format.combine(
      winston.format.printf(({ timestamp, level, message, stack, scope, ...meta }) => {
        const scopePrefix = scope ? `[${scope}] ` : '';
        const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        const stackString = stack ? `\n${String(stack)}` : '';
        return `${String(timestamp)} [${String(level).toUpperCase()}]: ${scopePrefix}${String(message)}${stackString}${metaString}`;
      })
    )
  });

  // Configure console transport for development
  const consoleTransport = new winston.transports.Console({
    format: winston.format.colorize({ all: true }),
  });

  // Create logger instance
  // This has a default formatting that will be applied to all the transports
  const logger = winston.createLogger({
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    defaultMeta: {
      service: loggerName
    },
    format: winston.format.combine(
      winston.format.timestamp({format: "YYYY-MM-DDTHH:mm:ss.SSS"}),
      winston.format.errors({stack: true}),
      winston.format.printf((info: winston.Logform.TransformableInfo) => {
        const { timestamp, level, message, stack, scope } = info;
        const scopePrefix = scope ? ` [${scope}]` : '';
        const stackString = stack ? `\n${String(stack)}` : '';
        return `${String(timestamp)} [${String(level).toUpperCase()}]${scopePrefix} > ${message}${stackString}`;
      })
    ),
    transports: [
      dailyRotateFileTransport,
      consoleTransport
    ],
    // Handle uncaught exceptions and unhandled rejections
    exceptionHandlers: [
      new DailyRotateFile({
        filename: path.join(logDirectory, `${filename}-exceptions-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '14d',
        zippedArchive: true
      })
    ],
    rejectionHandlers: [
      new DailyRotateFile({
        filename: path.join(logDirectory, `${filename}-rejections-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '14d',
        zippedArchive: true
      })
    ]
  });

  // Add event listeners for file rotation
  dailyRotateFileTransport.on('rotate', (oldFilename, newFilename) => {
    logger.info(`Log file rotated from ${oldFilename} to ${newFilename}`);
  });

  dailyRotateFileTransport.on('archive', (zipFilename) => {
    logger.info(`Log file archived: ${zipFilename}`);
  });

  // Cache the logger instance
  loggerCache.set(loggerName, logger);

  return logger;
}
