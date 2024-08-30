import Logger from 'electron-log/main';
import { MainLogger, LogFunctions } from 'electron-log/src';

// Hold a global logger instance
// No need to recreate multiple instances
let loggers: {[key: string]: MainLogger} = { }

/**
 * Creates a logger for module
 * @returns {ElectronLog.ElectronLog}
 */
const getOrCreateLogger = (logId: string): MainLogger => {

    // If logger is already created for this `logId`, return that.
    if(logId in loggers) {
        return loggers[logId];
    }

    // Instance. Max File = 4MB
    let logger = Logger.create( { logId } );
    let maxFileSize = 4 * 1e+6;

    // File transform config
    logger.transports.file.level = 'silly';
    logger.transports.file.fileName = 'np-main.log';
    logger.transports.file.maxSize = maxFileSize;
    logger.transports.file.format = '[{y}-{m}-{d}T{h}:{i}:{s}.{ms}] [{level}]{scope} › {text}';

    return logger;
}

/**
 * Get or create logger for logId and scope provided.
 * 
 * @param scope Logging scope
 * @param logId Id of the log allow creating different log instances
 * @returns {ElectronLog.ElectronLog}
 */
export const getLogger = (logId?: string, scope?: string): LogFunctions => {
    const logger = getOrCreateLogger( logId || 'main' );
    return scope ? logger.scope(scope) : logger;
}

// export const readAllLogs = function () {
//     try {
//         let allLogs = logger.transports.file.readAllLogs();
//         let latestLog = allLogs.find( f => f.path === logger.transports.file.getFile().path );
//         return latestLog && latestLog.lines ? latestLog.lines : [];
//     } catch(err) {
//         logger.error('Error reading logs', err );
//         return [];
//     }
//   };