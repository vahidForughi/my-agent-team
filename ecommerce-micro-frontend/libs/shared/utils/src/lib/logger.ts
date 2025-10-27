/**
 * Logger levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  enableTimestamp?: boolean;
  enableConsole?: boolean;
  onLog?: (level: LogLevel, message: string, data?: any) => void;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  enableTimestamp: true,
  enableConsole: true,
};

/**
 * Logger class for consistent logging across the application
 *
 * @example
 * ```ts
 * const logger = new Logger({ prefix: '[MyApp]', level: LogLevel.DEBUG });
 * logger.info('Application started');
 * logger.error('An error occurred', { error });
 * ```
 */
export class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current log level priority
   */
  private getLevelPriority(level: LogLevel): number {
    const priorities = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
    };
    return priorities[level];
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return (
      this.getLevelPriority(level) >= this.getLevelPriority(this.config.level)
    );
  }

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];

    if (this.config.enableTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }

    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message);

    // Call custom log handler if provided
    if (this.config.onLog) {
      this.config.onLog(level, formattedMessage, data);
    }

    // Log to console if enabled
    if (this.config.enableConsole) {
      const consoleMethod = level === LogLevel.DEBUG ? 'log' : level;
      if (data) {
        console[consoleMethod](formattedMessage, data);
      } else {
        console[consoleMethod](formattedMessage);
      }
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Create a child logger with inherited config and additional prefix
   */
  createChild(prefix: string): Logger {
    const childPrefix = this.config.prefix
      ? `${this.config.prefix}${prefix}`
      : prefix;
    return new Logger({ ...this.config, prefix: childPrefix });
  }
}

/**
 * Create a default logger instance
 */
export const createLogger = (config?: Partial<LoggerConfig>): Logger => {
  return new Logger(config);
};

/**
 * Global logger instance
 */
export const logger = createLogger({
  level:
    process.env['NODE_ENV'] === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  prefix: '[Ecommerce]',
});

export default logger;
