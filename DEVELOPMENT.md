# Development Notes

## Firewalla API Implementation

**⚠️ IMPORTANT: The Firewalla API client implementation needs verification**

The current Firewalla API client (`src/clients/firewalla.ts`) is a **placeholder implementation** based on common REST API patterns. Since we don't have access to the complete Firewalla API documentation at https://docs.firewalla.net, the following need to be verified and updated:

### Items to Verify

1. **Base URL/Endpoint Path**
   - Current assumption: `${FIREWALLA_HOST}/api`
   - May need adjustment based on actual API structure

2. **Authentication Method**
   - Current implementation: Bearer token in Authorization header
   - Verify this matches Firewalla's actual auth mechanism

3. **Client Listing Endpoint**
   - Current assumption: `GET /api/devices`
   - Need to verify:
     - Correct endpoint path
     - Response format
     - Pagination (if needed)
     - Available client fields

4. **Client Data Structure**
   - Verify the actual structure of client/device objects
   - Ensure we're correctly accessing:
     - `id` field
     - `name` field
     - `macAddress` field
     - `ipAddress` field (optional)

### How to Update the Firewalla Client

Once you have access to the Firewalla API documentation:

1. **Review the Authentication**
   ```typescript
   // In src/clients/firewalla.ts, update the headers in the request method:
   const headers: Record<string, string> = {
     Authorization: `Bearer ${this.config.apiToken}`, // Verify this format
     'Content-Type': 'application/json',
   };
   ```

2. **Update the Base URL**
   ```typescript
   // In the constructor:
   this.baseUrl = `${config.host}/api`; // Update /api to correct path
   ```

3. **Update the fetchClients Method**
   ```typescript
   async fetchClients(): Promise<FirewallaClient[]> {
     // Update '/devices' to the correct endpoint
     const clients = await this.request<FirewallaClient[]>('/devices');
     return clients;
   }
   ```

4. **Update Type Definitions**
   ```typescript
   // In src/types/index.ts, add Firewalla-specific fields if needed:
   export interface FirewallaClient extends Client {
     // Add any Firewalla-specific fields here
     deviceType?: string;
     manufacturer?: string;
     // etc.
   }
   ```

### Testing the Firewalla Client

Once updated, test the API client:

```bash
# Create a test script
cat > test-firewalla-api.js << 'EOF'
import { createFirewallaClient } from './dist/clients/firewalla.js';

const client = createFirewallaClient({
  host: process.env.FIREWALLA_HOST,
  apiToken: process.env.FIREWALLA_API_TOKEN,
});

try {
  const clients = await client.fetchClients();
  console.log('Fetched clients:', clients);
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
