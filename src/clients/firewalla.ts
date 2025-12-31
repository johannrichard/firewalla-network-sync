/**
 * Firewalla API client
 * Implements the Firewalla API for client management
 * See: https://docs.firewalla.net
 */

import * as logger from '../logger.js';
import type { FirewallaClient } from '../types/index.js';

interface FirewallaConfig {
  host: string;
  apiToken: string;
}

/**
 * Firewalla API client class
 *
 * Note: This is a placeholder implementation. The actual Firewalla API
 * endpoints and authentication mechanisms should be verified against
 * https://docs.firewalla.net and updated accordingly.
 */
export class FirewallaApiClient {
  private config: FirewallaConfig;
  private baseUrl: string;

  constructor(config: FirewallaConfig) {
    this.config = config;
    this.baseUrl = `${config.host}/api`;
  }

  /**
   * Make an authenticated request to the Firewalla API
   */
  private async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    logger.debug(`Firewalla API request: ${method} ${url}`);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Firewalla API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      logger.error(`Firewalla API request failed: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch all clients/devices from Firewalla
   *
   * Note: The exact endpoint path needs to be verified from the Firewalla API documentation.
   * This is a placeholder implementation that assumes a /devices or /clients endpoint.
   */
  async fetchClients(): Promise<FirewallaClient[]> {
    logger.info('Fetching clients from Firewalla...');

    try {
      // TODO: Update this endpoint path based on actual Firewalla API documentation
      const clients = await this.request<FirewallaClient[]>('/devices');

      logger.info(`Fetched ${clients.length} clients from Firewalla`);
      return clients;
    } catch (error) {
      logger.error(`Failed to fetch clients from Firewalla: ${error}`);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific client
   *
   * Note: Update endpoint path based on actual Firewalla API documentation
   */
  async getClient(macAddress: string): Promise<FirewallaClient> {
    logger.debug(`Fetching client details for ${macAddress}`);
    // TODO: Update endpoint path based on actual API
    return this.request<FirewallaClient>(`/devices/${macAddress}`);
  }
}

/**
 * Create a Firewalla API client instance
 */
export function createFirewallaClient(config: FirewallaConfig): FirewallaApiClient {
  return new FirewallaApiClient(config);
}
