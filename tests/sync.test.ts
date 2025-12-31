/**
 * Unit tests for sync.ts functions
 */

import { describe, expect, test } from '@jest/globals';
import {
  normalizeMacAddress,
  matchClients,
  findClientsToUpdate,
  verifyChanges,
} from '../src/sync';
import type { FirewallaClient, UniFiClient } from '../src/types';

describe('normalizeMacAddress', () => {
  test('normalizes MAC addresses with colons', () => {
    expect(normalizeMacAddress('AA:BB:CC:DD:EE:FF')).toBe('aa:bb:cc:dd:ee:ff');
  });

  test('normalizes MAC addresses with hyphens', () => {
    expect(normalizeMacAddress('AA-BB-CC-DD-EE-FF')).toBe('aa:bb:cc:dd:ee:ff');
  });

  test('normalizes MAC addresses without separators', () => {
    expect(normalizeMacAddress('AABBCCDDEEFF')).toBe('aa:bb:cc:dd:ee:ff');
  });

  test('handles mixed case', () => {
    expect(normalizeMacAddress('Aa:Bb:Cc:Dd:Ee:Ff')).toBe('aa:bb:cc:dd:ee:ff');
  });
});

describe('matchClients', () => {
  test('matches clients by MAC address', () => {
    const firewallaClients: FirewallaClient[] = [
      {
        id: 'fw1',
        name: 'Living Room TV',
        macAddress: 'aa:bb:cc:dd:ee:ff',
        ipAddress: '192.168.1.100',
      },
      {
        id: 'fw2',
        name: 'Kitchen Speaker',
        macAddress: '11:22:33:44:55:66',
        ipAddress: '192.168.1.101',
      },
    ];

    const unifiClients: UniFiClient[] = [
      {
        id: 'unifi1',
        name: 'Old TV Name',
        macAddress: 'AA:BB:CC:DD:EE:FF', // Different case
        type: 'WIRED',
        ipAddress: '192.168.1.100',
      },
      {
        id: 'unifi3',
        name: 'Unknown Device',
        macAddress: '99:88:77:66:55:44', // Not in Firewalla
        type: 'WIRELESS',
      },
    ];

    const matches = matchClients(firewallaClients, unifiClients);

    expect(matches.size).toBe(1);
    expect(matches.has('aa:bb:cc:dd:ee:ff')).toBe(true);

    const match = matches.get('aa:bb:cc:dd:ee:ff');
    expect(match?.firewalla.name).toBe('Living Room TV');
    expect(match?.unifi.name).toBe('Old TV Name');
  });

  test('handles different MAC address formats', () => {
    const firewallaClients: FirewallaClient[] = [
      {
        id: 'fw1',
        name: 'Device 1',
        macAddress: 'AA-BB-CC-DD-EE-FF',
      },
    ];

    const unifiClients: UniFiClient[] = [
      {
        id: 'unifi1',
        name: 'Device 1',
        macAddress: 'AABBCCDDEEFF',
        type: 'WIRED',
      },
    ];

    const matches = matchClients(firewallaClients, unifiClients);

    expect(matches.size).toBe(1);
    expect(matches.has('aa:bb:cc:dd:ee:ff')).toBe(true);
  });
});

describe('findClientsToUpdate', () => {
  test('identifies clients that need name updates', () => {
    const matches = new Map([
      [
        'aa:bb:cc:dd:ee:ff',
        {
          firewalla: {
            id: 'fw1',
            name: 'New Name',
            macAddress: 'aa:bb:cc:dd:ee:ff',
          },
          unifi: {
            id: 'unifi1',
            name: 'Old Name',
            macAddress: 'aa:bb:cc:dd:ee:ff',
            type: 'WIRED' as const,
          },
        },
      ],
      [
        '11:22:33:44:55:66',
        {
          firewalla: {
            id: 'fw2',
            name: 'Same Name',
            macAddress: '11:22:33:44:55:66',
          },
          unifi: {
            id: 'unifi2',
            name: 'Same Name',
            macAddress: '11:22:33:44:55:66',
            type: 'WIRELESS' as const,
          },
        },
      ],
    ]);

    const toUpdate = findClientsToUpdate(matches);

    expect(toUpdate.length).toBe(1);
    expect(toUpdate[0].unifi.id).toBe('unifi1');
    expect(toUpdate[0].newName).toBe('New Name');
  });

  test('skips clients without Firewalla names', () => {
    const matches = new Map([
      [
        'aa:bb:cc:dd:ee:ff',
        {
          firewalla: {
            id: 'fw1',
            macAddress: 'aa:bb:cc:dd:ee:ff',
            // No name
          },
          unifi: {
            id: 'unifi1',
            name: 'Old Name',
            macAddress: 'aa:bb:cc:dd:ee:ff',
            type: 'WIRED' as const,
          },
        },
      ],
    ]);

    const toUpdate = findClientsToUpdate(matches);

    expect(toUpdate.length).toBe(0);
  });
});

describe('verifyChanges', () => {
  const sampleClient: UniFiClient = {
    id: 'unifi1',
    name: 'Old Name',
    macAddress: 'aa:bb:cc:dd:ee:ff',
    type: 'WIRED',
  };

  test('allows name-only updates', () => {
    expect(() => {
      verifyChanges(sampleClient, { name: 'New Name' });
    }).not.toThrow();
  });

  test('rejects updates to disallowed fields', () => {
    expect(() => {
      verifyChanges(sampleClient, { name: 'New Name', type: 'WIRELESS' } as any);
    }).toThrow('disallowed fields');
  });

  test('rejects non-string name values', () => {
    expect(() => {
      verifyChanges(sampleClient, { name: 123 } as any);
    }).toThrow('Name must be a string');
  });

  test('allows empty updates object', () => {
    expect(() => {
      verifyChanges(sampleClient, {});
    }).not.toThrow();
  });
});
