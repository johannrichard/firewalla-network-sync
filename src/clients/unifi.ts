/**
 * UniFi Network API client
 * Implements the UniFi Network API v10.0.162
 */

import type { UniFiClient } from '../types/index.js';
import * as logger from '../logger.js';

interface UniFiConfig {
  host: string;
  apiKey: string;
  siteId: string;
}

interface UniFiPaginatedResponse<T> {
  offset: number;
  limit: number;
  count: number;
  totalCount: number;
  data: T[];
}

/**
 * UniFi Network API client class
 */
export class UniFiApiClient {
  private config: UniFiConfig;
  private baseUrl: string;

  constructor(config: UniFiConfig) {
    this.config = config;
    this.baseUrl = `${config.host}/v1`;
  }

  /**
   * Make an authenticated request to the UniFi API
   */
  private async request<T>(
    path: string,
    method = 'GET',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    logger.debug(`UniFi API request: ${method} ${url}`);

    const headers: Record<string, string> = {
      'X-API-KEY': this.config.apiKey,
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
          `UniFi API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      logger.error(`UniFi API request failed: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch all connected clients from a site
   * Handles pagination automatically
   */
  async fetchClients(): Promise<UniFiClient[]> {
    logger.info('Fetching clients from UniFi Network...');

    const allClients: UniFiClient[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await this.request<UniFiPaginatedResponse<UniFiClient>>(
        `/sites/${this.config.siteId}/clients?offset=${offset}&limit=${limit}`
      );

      allClients.push(...response.data);
      offset += response.count;
      hasMore = offset < response.totalCount;

      logger.debug(
        `Fetched ${response.count} clients, total so far: ${allClients.length}/${response.totalCount}`
      );
    }

    logger.info(`Fetched ${allClients.length} clients from UniFi Network`);
    return allClients;
  }

  /**
   * Get detailed information about a specific client
   */
  async getClient(clientId: string): Promise<UniFiClient> {
    logger.debug(`Fetching client details for ${clientId}`);
    return this.request<UniFiClient>(
      `/sites/${this.config.siteId}/clients/${clientId}`
    );
  }

  /**
   * Update client information
   * Note: The UniFi API documentation doesn't explicitly show a client name update endpoint,
   * so this is a placeholder that may need adjustment based on actual API capabilities
   */
  async updateClient(
    clientId: string,
    updates: { name?: string }
  ): Promise<UniFiClient> {
    logger.debug(`Updating client ${clientId}:`, updates);
    return this.request<UniFiClient>(
      `/sites/${this.config.siteId}/clients/${clientId}`,
      'PUT',
      updates
    );
  }
}

/**
 * Create a UniFi API client instance
 */
export function createUniFiClient(config: UniFiConfig): UniFiApiClient {
  return new UniFiApiClient(config);
}
