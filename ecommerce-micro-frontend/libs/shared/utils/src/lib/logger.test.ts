import { Logger, LogLevel, createLogger } from './logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should create logger with default config', () => {
      const logger = new Logger();

      logger.info('test message');

      expect(console.info).toHaveBeenCalled();
    });

    it('should create logger with custom config', () => {
      const logger = new Logger({
        level: LogLevel.ERROR,
        prefix: '[Test]',
        enableTimestamp: false,
      });

      logger.info('test message');

      expect(console.info).not.toHaveBeenCalled();

      logger.error('error message');

      expect(console.error).toHaveBeenCalledWith(
        '[Test] [ERROR] error message'
      );
    });

    it('should update config using configure method', () => {
      const logger = new Logger({ level: LogLevel.INFO });

      logger.configure({ level: LogLevel.ERROR });
      logger.info('should not log');

      expect(console.info).not.toHaveBeenCalled();

      logger.error('should log');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Log Levels', () => {
    it('should respect log level priority - INFO', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      logger.debug('debug message');
      expect(consoleSpy).not.toHaveBeenCalled();

      logger.info('info message');
      expect(console.info).toHaveBeenCalled();

      logger.warn('warn message');
      expect(console.warn).toHaveBeenCalled();

      logger.error('error message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should respect log level priority - WARN', () => {
      const logger = new Logger({
        level: LogLevel.WARN,
        enableTimestamp: false,
      });

      logger.debug('debug message');
      logger.info('info message');
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();

      logger.warn('warn message');
      expect(console.warn).toHaveBeenCalled();

      logger.error('error message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should respect log level priority - ERROR', () => {
      const logger = new Logger({
        level: LogLevel.ERROR,
        enableTimestamp: false,
      });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();

      logger.error('error message');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Message Formatting', () => {
    it('should format message with timestamp', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: true,
      });

      logger.info('test message');

      const call = (console.info as jest.Mock).mock.calls[0][0];
      expect(call).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
      expect(call).toContain('[INFO] test message');
    });

    it('should format message without timestamp', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      logger.info('test message');

      expect(console.info).toHaveBeenCalledWith('[INFO] test message');
    });

    it('should format message with custom prefix', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        prefix: '[MyApp]',
        enableTimestamp: false,
      });

      logger.info('test message');

      expect(console.info).toHaveBeenCalledWith('[MyApp] [INFO] test message');
    });

    it('should format message with timestamp and prefix', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        prefix: '[MyApp]',
        enableTimestamp: true,
      });

      logger.info('test message');

      const call = (console.info as jest.Mock).mock.calls[0][0];
      expect(call).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
      expect(call).toContain('[MyApp] [INFO] test message');
    });
  });

  describe('Logging with Data', () => {
    it('should log message with additional data', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });
      const data = { userId: 123, action: 'login' };

      logger.info('User action', data);

      expect(console.info).toHaveBeenCalledWith('[INFO] User action', data);
    });

    it('should log error with error object', () => {
      const logger = new Logger({
        level: LogLevel.ERROR,
        enableTimestamp: false,
      });
      const error = new Error('Test error');

      logger.error('An error occurred', error);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] An error occurred',
        error
      );
    });
  });

  describe('Custom Log Handler', () => {
    it('should call custom onLog handler', () => {
      const onLog = jest.fn();
      const logger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
        onLog,
      });

      logger.info('test message');

      expect(onLog).toHaveBeenCalledWith(
        LogLevel.INFO,
        '[INFO] test message',
        undefined
      );
    });

    it('should call custom onLog handler with data', () => {
      const onLog = jest.fn();
      const logger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
        onLog,
      });
      const data = { test: 'value' };

      logger.info('test message', data);

      expect(onLog).toHaveBeenCalledWith(
        LogLevel.INFO,
        '[INFO] test message',
        data
      );
    });
  });

  describe('Console Disabling', () => {
    it('should not log to console when enableConsole is false', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        enableConsole: false,
      });

      logger.info('test message');
      logger.warn('warn message');
      logger.error('error message');

      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should still call onLog when console is disabled', () => {
      const onLog = jest.fn();
      const logger = new Logger({
        level: LogLevel.INFO,
        enableConsole: false,
        enableTimestamp: false,
        onLog,
      });

      logger.info('test message');

      expect(console.info).not.toHaveBeenCalled();
      expect(onLog).toHaveBeenCalledWith(
        LogLevel.INFO,
        '[INFO] test message',
        undefined
      );
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with inherited config', () => {
      const parent = new Logger({
        level: LogLevel.INFO,
        prefix: '[Parent]',
        enableTimestamp: false,
      });

      const child = parent.createChild('[Child]');

      child.info('test message');

      expect(console.info).toHaveBeenCalledWith(
        '[Parent][Child] [INFO] test message'
      );
    });

    it('should create child logger without parent prefix', () => {
      const parent = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      const child = parent.createChild('[Child]');

      child.info('test message');

      expect(console.info).toHaveBeenCalledWith('[Child] [INFO] test message');
    });

    it('should inherit log level from parent', () => {
      const parent = new Logger({
        level: LogLevel.WARN,
        enableTimestamp: false,
      });

      const child = parent.createChild('[Child]');

      child.info('should not log');
      expect(console.info).not.toHaveBeenCalled();

      child.warn('should log');
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('createLogger Factory', () => {
    it('should create logger with default config', () => {
      const logger = createLogger();

      logger.info('test message');

      expect(console.info).toHaveBeenCalled();
    });

    it('should create logger with custom config', () => {
      const logger = createLogger({
        level: LogLevel.ERROR,
        prefix: '[Factory]',
        enableTimestamp: false,
      });

      logger.error('error message');

      expect(console.error).toHaveBeenCalledWith(
        '[Factory] [ERROR] error message'
      );
    });
  });

  describe('Log Methods', () => {
    it('should log debug messages', () => {
      const logger = new Logger({
        level: LogLevel.DEBUG,
        enableTimestamp: false,
      });

      logger.debug('debug message');

      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] debug message');
    });

    it('should log info messages', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        enableTimestamp: false,
      });

      logger.info('info message');

      expect(console.info).toHaveBeenCalledWith('[INFO] info message');
    });

    it('should log warn messages', () => {
      const logger = new Logger({
        level: LogLevel.WARN,
        enableTimestamp: false,
      });

      logger.warn('warn message');

      expect(console.warn).toHaveBeenCalledWith('[WARN] warn message');
    });

    it('should log error messages', () => {
      const logger = new Logger({
        level: LogLevel.ERROR,
        enableTimestamp: false,
      });

      logger.error('error message');

      expect(console.error).toHaveBeenCalledWith('[ERROR] error message');
    });
  });
});
