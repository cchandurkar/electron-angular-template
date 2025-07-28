# Winston Logger Configuration

This module provides a Winston logger configuration with daily file rotation and max file size of 20MB for the Electron application. Each logger write to its own file.

## Features

- **Daily File Rotation**: Log files are rotated daily with date patterns
- **Max File Size**: 20MB maximum file size before rotation
- **Automatic Archiving**: Old log files are compressed to save space
- **Multiple Log Levels**: Support for debug, info, warn, error levels
- **Console and File Output**: Logs to both console (development) and files
- **Exception Handling**: Separate files for uncaught exceptions and unhandled rejections
- **Logger Caching**: Prevents duplicate logger instances

## Usage

### Create Logger

```typescript
import { getLogger } from './logging';

// Gets existing logger or creates new one if it doesn't exist
const log = getLogger('main-app');

log.info('Application started');
log.error('Something went wrong');
log.warn('This is a warning');
log.debug('Debug information');
```

### Logger With Child Scope

You can create a child logger off of a main logger. The `scope` from child logger will be added to the logs.

```typescript
import { getLogger } from './logging';

// Create a child logger with `scope`. 
const log = getLogger('main').child({scope: 'ipc'});

log.info('IPC hooks setup');
log.info('Event received: INIT');

// Logs:
// [2025-07-26 12:42:47.177] [INFO] [ipc] > IPC hooks setup
// [2025-07-26 12:42:47.177] [INFO] [ipc] > Event received: INIT
```

## Log File Structure

Log files are stored in the Electron app's logs directory and follow this structure:

```
logs/
├── main-app-2024-01-15.log
├── main-app-2024-01-16.log.gz
├── main-app-database-2024-01-15.log
├── main-app-exceptions-2024-01-15.log
└── main-app-rejections-2024-01-15.log
```

## Configuration Details

- **Log Directory**: Uses `app.getPath('logs')` (Electron's default logs directory)
- **File Rotation**: Daily rotation with `YYYY-MM-DD` date pattern
- **Max File Size**: 10MB per log file
- **Retention**: Keeps logs for 14 days
- **Archive Format**: Compressed (.gz) for older files
- **Log Format**: `[timestamp] [level] message metadata`

## Dependencies

This implementation requires the following packages:

```json
{
  "winston": "^3.x.x",
  "winston-daily-rotate-file": "^4.x.x"
}
```

## Environment-Based Logging

- **Development**: Logs at `debug` level with colorized console output
- **Production**: Logs at `info` level and above

## Error Handling

The logger automatically handles:

- **Uncaught Exceptions**: Logged to separate exception files
- **Unhandled Promise Rejections**: Logged to separate rejection files
- **File Rotation Events**: Logged when files are rotated, created, or archived
