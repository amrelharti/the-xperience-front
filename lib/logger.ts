// Simple logging utility for better error handling and debugging

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    }

    // In development, log to console with colors
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m'  // red
      }
      const reset = '\x1b[0m'
      
      console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`)
      if (context) {
        console.log('Context:', context)
      }
      if (error) {
        console.error('Error:', error)
      }
    }

    // In production, you could send to external logging service
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      // Example: send to external logging service
      // this.sendToLoggingService(entry)
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>, error?: Error) {
    this.log('warn', message, context, error)
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('error', message, context, error)
  }

  // API-specific logging
  apiRequest(method: string, url: string, context?: Record<string, any>) {
    this.debug(`API Request: ${method} ${url}`, context)
  }

  apiResponse(method: string, url: string, status: number, context?: Record<string, any>) {
    if (status >= 400) {
      this.error(`API Error: ${method} ${url} - ${status}`, context)
    } else {
      this.debug(`API Response: ${method} ${url} - ${status}`, context)
    }
  }

  // Performance logging
  performance(operation: string, duration: number, context?: Record<string, any>) {
    this.debug(`Performance: ${operation} took ${duration}ms`, context)
  }
}

// Create singleton instance
export const logger = new Logger()

// Export types for TypeScript
export type { LogLevel, LogEntry }
