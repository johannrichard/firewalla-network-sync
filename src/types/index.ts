/**
 * Type definitions for the firewalla-network-sync application
 */

/**
 * Client representation with common fields across both systems
 */
export interface Client {
  id: string;
  name?: string;
  macAddress: string;
  ipAddress?: string;
  connectedAt?: string;
}

/**
 * Firewalla-specific client data
 */
export interface FirewallaClient extends Client {
  // Firewalla-specific fields can be added here
}

/**
 * UniFi-specific client data
 */
export interface UniFiClient extends Client {
  type: 'WIRED' | 'WIRELESS' | 'VPN';
  uplinkDeviceId?: string;
}

/**
 * Configuration for the sync application
 */
export interface Config {
  // UniFi configuration
  unifi: {
    host: string;
    apiKey: string;
    siteId: string;
  };
  // Firewalla configuration
  firewalla: {
    host: string;
    apiToken: string;
  };
  // Sync configuration
  sync: {
    intervalMinutes: number;
    dryRun: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

/**
 * Result of a client name update operation
 */
export interface UpdateResult {
  success: boolean;
  clientId: string;
  macAddress: string;
  oldName?: string;
  newName: string;
  error?: string;
}

/**
 * Summary of a sync operation
 */
export interface SyncSummary {
  totalClients: number;
  matchedClients: number;
  updatedClients: number;
  failedUpdates: number;
  skippedClients: number;
  errors: string[];
}
