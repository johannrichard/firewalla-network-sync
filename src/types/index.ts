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
 * Firewalla-specific client data based on MSP API v2
 */
export interface FirewallaClient extends Client {
  // Firewalla uses MAC address as ID
  id: string; // MAC address (e.g., "AA:BB:CC:DD:EE:FF")
  macAddress: string;
  name?: string;
  ipAddress?: string;

  // Firewalla-specific fields
  macVendor?: string;
  gid?: string; // Firewalla box ID
  ipReserved?: boolean;
  online?: boolean;
  lastSeen?: string;
  network?: {
    name: string;
    id: string;
  };
  group?: {
    name: string;
    id: string;
  };
  totalDownload?: number;
  totalUpload?: number;
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
    boxId?: string; // Optional: specific box ID, if not provided fetches from all boxes
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
