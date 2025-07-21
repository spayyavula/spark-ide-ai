/**
 * Production-safe logger utility
 * Logs are filtered in production to prevent sensitive data exposure
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, ...args: any[]) {
    // Only log errors and warnings in production
    if (!this.isDevelopment && !['error', 'warn'].includes(level)) {
      return;
    }

    // Filter out sensitive data
    const filteredArgs = args.map(arg => this.filterSensitiveData(arg));

    switch (level) {
      case 'error':
        console.error(`[${level.toUpperCase()}] ${message}`, ...filteredArgs);
        break;
      case 'warn':
        console.warn(`[${level.toUpperCase()}] ${message}`, ...filteredArgs);
        break;
      case 'info':
        console.info(`[${level.toUpperCase()}] ${message}`, ...filteredArgs);
        break;
      case 'debug':
        console.log(`[${level.toUpperCase()}] ${message}`, ...filteredArgs);
        break;
    }
  }

  private filterSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Filter out common patterns that might contain sensitive data
      if (data.includes('token') || data.includes('password') || data.includes('secret')) {
        return '[FILTERED]';
      }
    }

    if (typeof data === 'object' && data !== null) {
      const filtered = { ...data };
      const sensitiveKeys = ['token', 'password', 'secret', 'apiKey', 'authorization'];
      
      for (const key of Object.keys(filtered)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          filtered[key] = '[FILTERED]';
        }
      }
      return filtered;
    }

    return data;
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }
}

export const logger = new Logger();