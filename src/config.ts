import 'dotenv/config';
import type { Config } from './types/index.js';

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): Config {
  const required = [
    'UNIFI_HOST',
    'UNIFI_API_KEY',
    'UNIFI_SITE_ID',
    'FIREWALLA_HOST',
    'FIREWALLA_API_TOKEN',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    unifi: {
      host: process.env.UNIFI_HOST as string,
      apiKey: process.env.UNIFI_API_KEY as string,
      siteId: process.env.UNIFI_SITE_ID as string,
    },
    firewalla: {
      host: process.env.FIREWALLA_HOST as string,
      apiToken: process.env.FIREWALLA_API_TOKEN as string,
      boxId: process.env.FIREWALLA_BOX_ID, // Optional
    },
    sync: {
      intervalMinutes: Number.parseInt(process.env.SYNC_INTERVAL_MINUTES || '60', 10),
      dryRun: process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1',
      logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    },
  };
}

/**
 * Validate configuration values
 */
export function validateConfig(config: Config): void {
  // Validate URLs
  try {
    new URL(config.unifi.host);
    new URL(config.firewalla.host);
  } catch (error) {
    throw new Error(`Invalid host URL: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Validate site ID is a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(config.unifi.siteId)) {
    throw new Error('UNIFI_SITE_ID must be a valid UUID');
  }

  // Validate sync interval
  if (config.sync.intervalMinutes < 0 || Number.isNaN(config.sync.intervalMinutes)) {
    throw new Error('SYNC_INTERVAL_MINUTES must be a valid number >= 0');
  }
}
