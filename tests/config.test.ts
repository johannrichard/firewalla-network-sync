/**
 * Unit tests for config.ts functions
 */

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { loadConfig, validateConfig } from '../src/config';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('loads valid configuration from environment', () => {
    process.env.UNIFI_HOST = 'https://unifi.example.com';
    process.env.UNIFI_API_KEY = 'test-api-key';
    process.env.UNIFI_SITE_ID = '550e8400-e29b-41d4-a716-446655440000';
    process.env.FIREWALLA_HOST = 'https://firewalla.example.com';
    process.env.FIREWALLA_API_TOKEN = 'test-token';
    process.env.SYNC_INTERVAL_MINUTES = '30';
    process.env.DRY_RUN = 'true';
    process.env.LOG_LEVEL = 'debug';

    const config = loadConfig();

    expect(config.unifi.host).toBe('https://unifi.example.com');
    expect(config.unifi.apiKey).toBe('test-api-key');
    expect(config.unifi.siteId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(config.firewalla.host).toBe('https://firewalla.example.com');
    expect(config.firewalla.apiToken).toBe('test-token');
    expect(config.sync.intervalMinutes).toBe(30);
    expect(config.sync.dryRun).toBe(true);
    expect(config.sync.logLevel).toBe('debug');
  });

  test('uses default values for optional settings', () => {
    process.env.UNIFI_HOST = 'https://unifi.example.com';
    process.env.UNIFI_API_KEY = 'test-api-key';
    process.env.UNIFI_SITE_ID = '550e8400-e29b-41d4-a716-446655440000';
    process.env.FIREWALLA_HOST = 'https://firewalla.example.com';
    process.env.FIREWALLA_API_TOKEN = 'test-token';

    const config = loadConfig();

    expect(config.sync.intervalMinutes).toBe(60);
    expect(config.sync.dryRun).toBe(false);
    expect(config.sync.logLevel).toBe('info');
  });

  test('throws error when required variables are missing', () => {
    process.env = {};

    expect(() => loadConfig()).toThrow('Missing required environment variables');
  });

  test('handles DRY_RUN=1', () => {
    process.env.UNIFI_HOST = 'https://unifi.example.com';
    process.env.UNIFI_API_KEY = 'test-api-key';
    process.env.UNIFI_SITE_ID = '550e8400-e29b-41d4-a716-446655440000';
    process.env.FIREWALLA_HOST = 'https://firewalla.example.com';
    process.env.FIREWALLA_API_TOKEN = 'test-token';
    process.env.DRY_RUN = '1';

    const config = loadConfig();

    expect(config.sync.dryRun).toBe(true);
  });
});

describe('validateConfig', () => {
  test('validates valid configuration', () => {
    const config = {
      unifi: {
        host: 'https://unifi.example.com',
        apiKey: 'test-key',
        siteId: '550e8400-e29b-41d4-a716-446655440000',
      },
      firewalla: {
        host: 'https://firewalla.example.com',
        apiToken: 'test-token',
      },
      sync: {
        intervalMinutes: 60,
        dryRun: false,
        logLevel: 'info' as const,
      },
    };

    expect(() => validateConfig(config)).not.toThrow();
  });

  test('rejects invalid URLs', () => {
    const config = {
      unifi: {
        host: 'not-a-url',
        apiKey: 'test-key',
        siteId: '550e8400-e29b-41d4-a716-446655440000',
      },
      firewalla: {
        host: 'https://firewalla.example.com',
        apiToken: 'test-token',
      },
      sync: {
        intervalMinutes: 60,
        dryRun: false,
        logLevel: 'info' as const,
      },
    };

    expect(() => validateConfig(config)).toThrow('Invalid host URL');
  });

  test('rejects invalid site ID', () => {
    const config = {
      unifi: {
        host: 'https://unifi.example.com',
        apiKey: 'test-key',
        siteId: 'not-a-uuid',
      },
      firewalla: {
        host: 'https://firewalla.example.com',
        apiToken: 'test-token',
      },
      sync: {
        intervalMinutes: 60,
        dryRun: false,
        logLevel: 'info' as const,
      },
    };

    expect(() => validateConfig(config)).toThrow('UNIFI_SITE_ID must be a valid UUID');
  });

  test('rejects negative sync interval', () => {
    const config = {
      unifi: {
        host: 'https://unifi.example.com',
        apiKey: 'test-key',
        siteId: '550e8400-e29b-41d4-a716-446655440000',
      },
      firewalla: {
        host: 'https://firewalla.example.com',
        apiToken: 'test-token',
      },
      sync: {
        intervalMinutes: -1,
        dryRun: false,
        logLevel: 'info' as const,
      },
    };

    expect(() => validateConfig(config)).toThrow('SYNC_INTERVAL_MINUTES must be >= 0');
  });
});
