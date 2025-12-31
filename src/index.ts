/**
 * Firewalla-UniFi Network Sync
 * Synchronizes client names from Firewalla (master) to UniFi Network
 */

import { createFirewallaClient } from './clients/firewalla.js';
import { createUniFiClient } from './clients/unifi.js';
import { loadConfig, validateConfig } from './config.js';
import * as logger from './logger.js';
import {
  createSyncSummary,
  findClientsToUpdate,
  logSyncSummary,
  matchClients,
  verifyChanges,
} from './sync.js';
import type { UpdateResult } from './types/index.js';

/**
 * Perform a single sync operation
 */
async function performSync(
  firewallaClient: ReturnType<typeof createFirewallaClient>,
  unifiClient: ReturnType<typeof createUniFiClient>,
  dryRun: boolean
): Promise<void> {
  logger.info('Starting sync operation...');

  if (dryRun) {
    logger.info('DRY RUN MODE - No changes will be persisted');
  }

  try {
    // Fetch clients from both systems
    const [firewallaClients, unifiClients] = await Promise.all([
      firewallaClient.fetchClients(),
      unifiClient.fetchClients(),
    ]);

    // Match clients by MAC address
    const matches = matchClients(firewallaClients, unifiClients);
    logger.info(`Matched ${matches.size} clients between Firewalla and UniFi`);

    // Find clients that need updates
    const toUpdate = findClientsToUpdate(matches);
    logger.info(`Found ${toUpdate.length} clients that need name updates`);

    if (toUpdate.length === 0) {
      logger.info('No updates needed');
      const summary = createSyncSummary(firewallaClients, unifiClients, matches, []);
      logSyncSummary(summary);
      return;
    }

    // Perform updates
    const results: UpdateResult[] = [];

    for (const { unifi, newName } of toUpdate) {
      const result: UpdateResult = {
        success: false,
        clientId: unifi.id,
        macAddress: unifi.macAddress,
        oldName: unifi.name,
        newName,
      };

      try {
        // Verify that we're only changing the name field (safety-first principle)
        const updates = { name: newName };
        verifyChanges(unifi, updates);

        if (dryRun) {
          logger.info(
            `[DRY RUN] Would update client ${unifi.macAddress}: "${unifi.name || '(none)'}" -> "${newName}"`
          );
          result.success = true;
        } else {
          logger.info(
            `Updating client ${unifi.macAddress}: "${unifi.name || '(none)'}" -> "${newName}"`
          );
          await unifiClient.updateClient(unifi.id, updates);
          result.success = true;
        }
      } catch (error) {
        result.error = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to update client ${unifi.macAddress}: ${result.error}`);
      }

      results.push(result);
    }

    // Log summary
    const summary = createSyncSummary(firewallaClients, unifiClients, matches, results);
    logSyncSummary(summary);

    if (summary.failedUpdates > 0) {
      logger.warn(`Sync completed with ${summary.failedUpdates} failed updates`);
    } else {
      logger.info('Sync completed successfully');
    }
  } catch (error) {
    logger.error(`Sync operation failed: ${error}`);
    throw error;
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    // Load and validate configuration
    const config = loadConfig();
    validateConfig(config);

    // Set log level
    logger.setLogLevel(config.sync.logLevel);

    logger.info('Firewalla-UniFi Network Sync starting...');
    logger.info(`Firewalla host: ${config.firewalla.host}`);
    logger.info(`UniFi host: ${config.unifi.host}`);
    logger.info(`UniFi site ID: ${config.unifi.siteId}`);
    logger.info(`Sync interval: ${config.sync.intervalMinutes} minutes`);
    logger.info(`Dry run: ${config.sync.dryRun}`);

    // Create API clients
    const firewallaClient = createFirewallaClient(config.firewalla);
    const unifiClient = createUniFiClient(config.unifi);

    // Run sync immediately
    await performSync(firewallaClient, unifiClient, config.sync.dryRun);

    // Set up interval sync if configured
    if (config.sync.intervalMinutes > 0) {
      const intervalMs = config.sync.intervalMinutes * 60 * 1000;
      logger.info(`Scheduling sync every ${config.sync.intervalMinutes} minutes`);

      setInterval(async () => {
        try {
          await performSync(firewallaClient, unifiClient, config.sync.dryRun);
        } catch (error) {
          logger.error(`Scheduled sync failed: ${error}`);
        }
      }, intervalMs);

      // Keep the process running
      logger.info('Sync scheduler running. Press Ctrl+C to exit.');
    } else {
      logger.info('Single sync completed. Exiting.');
      process.exit(0);
    }
  } catch (error) {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

// Run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error(`Unhandled error: ${error}`);
    process.exit(1);
  });
}

// Export functions for testing
export { performSync, main };
