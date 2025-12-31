/**
 * Firewalla MSP API client
 * Implements the Firewalla MSP API v2 for device/client management
 * See: https://docs.firewalla.net
 *
 * Based on Firewalla MSP API v2 documentation
 */

import * as logger from '../logger.js';
import type { FirewallaClient } from '../types/index.js';

interface FirewallaConfig {
  host: string;
  apiToken: string;
  boxId?: string;
}

/**
 * Firewalla MSP API v2 client class
 */
export class FirewallaApiClient {
  private config: FirewallaConfig;
  private baseUrl: string;

  constructor(config: FirewallaConfig) {
    this.config = config;
    this.baseUrl = `${config.host}/v2`;
  }

  /**
   * Make an authenticated request to the Firewalla MSP API
   */
  private async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    logger.debug(`Firewalla API request: ${method} ${url}`);

    const headers: Record<string, string> = {
      Authorization: `Token ${this.config.apiToken}`,
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
   * Fetch all devices from Firewalla MSP
   * GET /v2/devices
   *
   * @param boxId - Optional: Filter devices by specific Firewalla box
   */
  async fetchClients(boxId?: string): Promise<FirewallaClient[]> {
    logger.info('Fetching devices from Firewalla MSP API...');

    try {
      const queryBox = boxId || this.config.boxId;
      const queryParams = queryBox ? `?box=${queryBox}` : '';
      const clients = await this.request<FirewallaClient[]>(`/devices${queryParams}`);

      logger.info(`Fetched ${clients.length} devices from Firewalla`);
      return clients;
    } catch (error) {
      logger.error(`Failed to fetch devices from Firewalla: ${error}`);
      throw error;
    }
  }

  /**
   * Update a device name in Firewalla MSP
   * PATCH /v2/boxes/:gid/devices/:id
   *
   * @param boxId - Firewalla box ID (gid)
   * @param deviceId - Device MAC address
   * @param name - New device name (max 32 characters)
   */
  async updateClient(boxId: string, deviceId: string, name: string): Promise<FirewallaClient> {
    logger.debug(`Updating device ${deviceId} in box ${boxId} with name: ${name}`);

    if (!name || name.length > 32) {
      throw new Error('Device name must be between 1 and 32 characters');
    }

    try {
      const updatedDevice = await this.request<FirewallaClient>(
        `/boxes/${boxId}/devices/${deviceId}`,
        'PATCH',
        { name }
      );

      logger.info(`Successfully updated device ${deviceId} name to "${name}"`);
      return updatedDevice;
    } catch (error) {
      logger.error(`Failed to update device ${deviceId}: ${error}`);
      throw error;
    }
  }
}

/**
 * Create a Firewalla API client instance
 */
export function createFirewallaClient(config: FirewallaConfig): FirewallaApiClient {
  return new FirewallaApiClient(config);
}
