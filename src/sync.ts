/**
 * Synchronization logic for client names between Firewalla and UniFi
 */

import * as logger from './logger.js';
import type { FirewallaClient, SyncSummary, UniFiClient, UpdateResult } from './types/index.js';

/**
 * Normalize MAC address to a consistent format (lowercase with colons)
 */
export function normalizeMacAddress(mac: string): string {
  // Remove any separators and convert to lowercase
  const cleaned = mac.replace(/[:-]/g, '').toLowerCase();

  // Add colons every 2 characters
  return cleaned.match(/.{1,2}/g)?.join(':') || cleaned;
}

/**
 * Match UniFi clients with Firewalla clients by MAC address
 */
export function matchClients(
  firewallaClients: FirewallaClient[],
  unifiClients: UniFiClient[]
): Map<string, { firewalla: FirewallaClient; unifi: UniFiClient }> {
  const matches = new Map<string, { firewalla: FirewallaClient; unifi: UniFiClient }>();

  // Create a map of Firewalla clients by normalized MAC address
  const firewallaByMac = new Map<string, FirewallaClient>();
  for (const client of firewallaClients) {
    const normalizedMac = normalizeMacAddress(client.macAddress);
    firewallaByMac.set(normalizedMac, client);
  }

  // Match UniFi clients with Firewalla clients
  for (const unifiClient of unifiClients) {
    const normalizedMac = normalizeMacAddress(unifiClient.macAddress);
    const firewallaClient = firewallaByMac.get(normalizedMac);

    if (firewallaClient) {
      matches.set(normalizedMac, {
        firewalla: firewallaClient,
        unifi: unifiClient,
      });
    }
  }

  return matches;
}

/**
 * Determine which clients need name updates
 */
export function findClientsToUpdate(
  matches: Map<string, { firewalla: FirewallaClient; unifi: UniFiClient }>
): Array<{ unifi: UniFiClient; newName: string }> {
  const toUpdate: Array<{ unifi: UniFiClient; newName: string }> = [];

  for (const [mac, { firewalla, unifi }] of matches) {
    // Only update if Firewalla has a name and it differs from UniFi
    if (firewalla.name && firewalla.name !== unifi.name) {
      logger.debug(
        `Client ${mac}: UniFi name "${unifi.name || '(none)'}" -> Firewalla name "${firewalla.name}"`
      );
      toUpdate.push({
        unifi,
        newName: firewalla.name,
      });
    }
  }

  return toUpdate;
}

/**
 * Verify that only the name field would be changed
 * This implements the safety-first principle from the copilot instructions
 */
export function verifyChanges(original: UniFiClient, updates: { name?: string }): void {
  // Ensure we're only modifying the name field
  const allowedFields = ['name'];
  const updateFields = Object.keys(updates);

  const disallowedFields = updateFields.filter((field) => !allowedFields.includes(field));

  if (disallowedFields.length > 0) {
    throw new Error(
      `Attempted to modify disallowed fields: ${disallowedFields.join(', ')}. Only "name" field is allowed for safety.`
    );
  }

  // Additional validation can be added here
  if (updates.name !== undefined && typeof updates.name !== 'string') {
    throw new Error('Name must be a string');
  }
}

/**
 * Create a summary of the sync operation
 */
export function createSyncSummary(
  firewallaClients: FirewallaClient[],
  unifiClients: UniFiClient[],
  matches: Map<string, { firewalla: FirewallaClient; unifi: UniFiClient }>,
  results: UpdateResult[]
): SyncSummary {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  return {
    totalClients: unifiClients.length,
    matchedClients: matches.size,
    updatedClients: successful.length,
    failedUpdates: failed.length,
    skippedClients: unifiClients.length - matches.size,
    errors: failed.map((r) => r.error || 'Unknown error'),
  };
}

/**
 * Log sync summary
 */
export function logSyncSummary(summary: SyncSummary): void {
  logger.info('=== Sync Summary ===');
  logger.info(`Total UniFi clients: ${summary.totalClients}`);
  logger.info(`Matched with Firewalla: ${summary.matchedClients}`);
  logger.info(`Successfully updated: ${summary.updatedClients}`);
  logger.info(`Failed updates: ${summary.failedUpdates}`);
  logger.info(`Skipped (no match): ${summary.skippedClients}`);

  if (summary.errors.length > 0) {
    logger.warn('Errors encountered:');
    for (const error of summary.errors) {
      logger.warn(`  - ${error}`);
    }
  }
}
