/**
 * Centralized logging utility for FuelTrakr
 * Provides structured logging with different severity levels
 */

import { debugMode } from './supabase/safe-demo-config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isProduction = import.meta.env.MODE === 'production';

  /**
   * Log debug messages (only in development/debug mode)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (debugMode) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : undefined;
    this.log('error', message, context, errorObj);

    // In production, you might want to send errors to a monitoring service
    // Example: Sentry.captureException(errorObj);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    // In development, use console
    if (!this.isProduction) {
      const logFn = console[level] || console.log;
      if (error) {
        logFn(`[${level.toUpperCase()}]`, message, context || '', error);
      } else {
        logFn(`[${level.toUpperCase()}]`, message, context || '');
      }
    } else {
      // In production, only log warnings and errors to console
      if (level === 'warn' || level === 'error') {
        const logFn = console[level];
        logFn(`[${level.toUpperCase()}]`, message);
      }

      // Send to monitoring service in production
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry): void {
    // Placeholder for sending logs to a monitoring service
    // Example: Send to Sentry, LogRocket, or custom backend
    // This prevents sensitive information from being logged in production
  }
}

export const logger = new Logger();
