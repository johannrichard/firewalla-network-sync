/**
 * Simple logger utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = 'info';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[currentLevel];
}

export function debug(message: string, ...args: unknown[]): void {
  if (shouldLog('debug')) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

export function info(message: string, ...args: unknown[]): void {
  if (shouldLog('info')) {
    console.log(`[INFO] ${message}`, ...args);
  }
}

export function warn(message: string, ...args: unknown[]): void {
  if (shouldLog('warn')) {
    console.warn(`[WARN] ${message}`, ...args);
  }
}

export function error(message: string, ...args: unknown[]): void {
  if (shouldLog('error')) {
    console.error(`[ERROR] ${message}`, ...args);
  }
}
