# Development Notes

## Firewalla MSP API Implementation

✅ **The Firewalla API client is now fully implemented** based on the Firewalla MSP API v2 documentation.

### Implemented Features

1. **Base URL**: `https://msp_domain/v2`
2. **Authentication**: `Token` authentication in Authorization header
3. **Get Devices**: `GET /v2/devices` - Fetch all devices (optionally filtered by box ID)
4. **Update Device**: `PATCH /v2/boxes/:gid/devices/:id` - Update device name (max 32 characters)

### API Structure

**Device Object:**
```typescript
{
  id: string;              // MAC address (e.g., "AA:BB:CC:DD:EE:FF")
  macVendor: string;       // Manufacturer
  gid: string;             // Firewalla box ID
  ip: string;              // IP address
  ipReserved: boolean;     // Whether IP is reserved
  name: string;            // Device name
  online: boolean;         // Online status
  lastSeen: string;        // Timestamp
  network: {
    name: string;
    id: string;
  };
  group: {
    name: string;
    id: string;
  };
  totalDownload: number;
  totalUpload: number;
}
```

### Configuration

The Firewalla client requires:
- `FIREWALLA_HOST`: Your MSP domain (e.g., `https://mydomain.firewalla.net`)
- `FIREWALLA_API_TOKEN`: Personal access token from Firewalla MSP
- `FIREWALLA_BOX_ID`: Your Firewalla box ID (gid) - Required for filtering devices and updates

### Testing the Firewalla Client

Test the Firewalla API client independently:

```bash
# Create a test script
cat > test-firewalla-api.js << 'EOF'
import { createFirewallaClient } from './dist/clients/firewalla.js';

const client = createFirewallaClient({
  host: process.env.FIREWALLA_HOST,
  apiToken: process.env.FIREWALLA_API_TOKEN,
  boxId: process.env.FIREWALLA_BOX_ID,
});

try {
  const devices = await client.fetchClients();
  console.log('Fetched devices:', devices.length);
  console.log('Sample device:', devices[0]);
} catch (error) {
  console.error('Error:', error);
}
EOF

# Run the test
node test-firewalla-api.js
```

## UniFi API Implementation

The UniFi API client is implemented based on the official UniFi Network API v10.0.162 documentation. However, note:

### Client Name Updates

The current implementation assumes a `PUT /v1/sites/{siteId}/clients/{clientId}` endpoint for updating client information. **This endpoint may not exist** in the UniFi API.

If client name updates are not supported via the API, you may need to:

1. Check if there's a different endpoint for client aliases/names
2. Verify if client names can be updated through a different mechanism
3. Consider alternative approaches (e.g., using fixed clients, DHCP reservations, etc.)

### Testing the UniFi Client

Test the UniFi API client independently:

```bash
# Create a test script
cat > test-unifi-api.js << 'EOF'
import { createUniFiClient } from './dist/clients/unifi.js';

const client = createUniFiClient({
  host: process.env.UNIFI_HOST,
  apiKey: process.env.UNIFI_API_KEY,
  siteId: process.env.UNIFI_SITE_ID,
});

try {
  const clients = await client.fetchClients();
  console.log('Fetched clients:', clients.length);
  console.log('Sample client:', clients[0]);
} catch (error) {
  console.error('Error:', error);
}
EOF

# Run the test
node test-unifi-api.js
```

## Next Steps for Integration

1. **Get Firewalla API Documentation**
   - Access https://docs.firewalla.net
   - Review available endpoints
   - Verify authentication mechanism

2. **Update Firewalla Client**
   - Modify `src/clients/firewalla.ts` based on documentation
   - Update types in `src/types/index.ts` if needed

3. **Test Both Clients Independently**
   - Create test scripts to verify API connectivity
   - Ensure data structures match expectations

4. **Run Integration Tests**
   - Use dry-run mode: `DRY_RUN=true npm start`
   - Verify MAC address matching works
   - Check client name mapping

5. **Update Tests**
   - Add API client tests with mocked responses
   - Test error handling
   - Verify edge cases

## Known Limitations

1. **SSL/TLS Certificates**: The current implementation may have issues with self-signed certificates. You may need to add certificate handling:
   ```typescript
   // For development/testing only - NOT recommended for production
   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
   ```

2. **Rate Limiting**: Neither client currently implements rate limiting or retry logic

3. **Pagination**: UniFi client implements pagination, but Firewalla client assumes all results in one request

## Contributing Improvements

If you implement improvements to the API clients:

1. Update this document with your findings
2. Add tests for new functionality
3. Update the README with any configuration changes
4. Consider adding retry logic and better error handling
