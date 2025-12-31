# Usage Examples

This document provides practical examples of using the firewalla-network-sync application.

## Quick Start

### 1. One-Time Sync (Dry Run)

Test the sync without making any changes:

```bash
# Set up environment
cp .env.example .env
# Edit .env with your actual credentials

# Run dry-run
SYNC_INTERVAL_MINUTES=0 DRY_RUN=true npm start
```

Expected output:
```
[INFO] Firewalla-UniFi Network Sync starting...
[INFO] Firewalla host: https://192.168.1.2
[INFO] UniFi host: https://192.168.1.1
[INFO] UniFi site ID: 550e8400-e29b-41d4-a716-446655440000
[INFO] Sync interval: 0 minutes
[INFO] Dry run: true
[INFO] Starting sync operation...
[INFO] DRY RUN MODE - No changes will be persisted
[INFO] Fetching clients from Firewalla...
[INFO] Fetching clients from UniFi Network...
[INFO] Matched 15 clients between Firewalla and UniFi
[INFO] Found 3 clients that need name updates
[INFO] [DRY RUN] Would update client aa:bb:cc:dd:ee:ff: "Old Name" -> "New Name"
[INFO] === Sync Summary ===
[INFO] Total UniFi clients: 20
[INFO] Matched with Firewalla: 15
[INFO] Successfully updated: 3
[INFO] Failed updates: 0
[INFO] Skipped (no match): 5
[INFO] Single sync completed. Exiting.
```

### 2. One-Time Sync (Live)

Actually update client names:

```bash
SYNC_INTERVAL_MINUTES=0 DRY_RUN=false npm start
```

### 3. Continuous Sync

Run sync every hour:

```bash
# Default: sync every 60 minutes
npm start
```

Or customize the interval:

```bash
# Sync every 30 minutes
SYNC_INTERVAL_MINUTES=30 npm start
```

## Production Deployment

### Using Bundled Executable

1. Build the production bundle:

```bash
npm run bundle
```

2. Copy to production server:

```bash
# Copy the minified bundle and .env
scp dist/firewalla-sync.min.js server:/opt/firewalla-sync/
scp .env server:/opt/firewalla-sync/
```

3. Run on the server:

```bash
cd /opt/firewalla-sync
node firewalla-sync.min.js
```

### Systemd Service

Create `/etc/systemd/system/firewalla-sync.service`:

```ini
[Unit]
Description=Firewalla-UniFi Network Sync
After=network.target

[Service]
Type=simple
User=firewalla-sync
WorkingDirectory=/opt/firewalla-sync
EnvironmentFile=/opt/firewalla-sync/.env
ExecStart=/usr/bin/node /opt/firewalla-sync/firewalla-sync.min.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable firewalla-sync
sudo systemctl start firewalla-sync

# Check status
sudo systemctl status firewalla-sync

# View logs
sudo journalctl -u firewalla-sync -f
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY dist/firewalla-sync.min.js .
COPY .env .

CMD ["node", "firewalla-sync.min.js"]
```

Build and run:

```bash
docker build -t firewalla-sync .
docker run -d --name firewalla-sync --restart unless-stopped firewalla-sync
```

## Environment Variables Reference

### Required

```bash
# UniFi Network Configuration
UNIFI_HOST=https://unifi.example.com
UNIFI_API_KEY=your-api-key-here
UNIFI_SITE_ID=550e8400-e29b-41d4-a716-446655440000

# Firewalla Configuration
FIREWALLA_HOST=https://firewalla.example.com
FIREWALLA_API_TOKEN=your-token-here
```

### Optional

```bash
# How often to sync (0 = run once and exit)
SYNC_INTERVAL_MINUTES=60

# Dry run mode (true/1 = don't make actual changes)
DRY_RUN=false

# Log level (debug, info, warn, error)
LOG_LEVEL=info
```

## Common Scenarios

### Scenario 1: Initial Setup Testing

```bash
# Step 1: Test connectivity (dry run)
LOG_LEVEL=debug DRY_RUN=true SYNC_INTERVAL_MINUTES=0 npm start

# Step 2: Review what would change
# Check the dry-run output

# Step 3: Run actual sync once
DRY_RUN=false SYNC_INTERVAL_MINUTES=0 npm start

# Step 4: Verify changes in UniFi Network UI
# Log in to UniFi and check client names
```

### Scenario 2: Development/Testing

```bash
# Use development mode for fast iteration
npm run dev
```

### Scenario 3: Scheduled Sync

```bash
# Sync every 4 hours
SYNC_INTERVAL_MINUTES=240 npm start

# Or use cron for more control
# Add to crontab:
0 */4 * * * cd /opt/firewalla-sync && /usr/bin/node dist/firewalla-sync.min.js
```

## Troubleshooting Examples

### Debug Mode

Get detailed logging:

```bash
LOG_LEVEL=debug npm start
```

### Test API Connectivity

Create a simple test script `test-api.js`:

```javascript
// Test UniFi API
const response = await fetch('https://unifi.example.com/v1/info', {
  headers: { 'X-API-KEY': 'your-api-key' }
});
console.log(await response.json());

// Test Firewalla API  
const fwResponse = await fetch('https://firewalla.example.com/api/devices', {
  headers: { 'Authorization': 'Bearer your-token' }
});
console.log(await fwResponse.json());
```

### Check Specific Client

Modify the code to log details about a specific MAC:

```bash
# Add temporary debug logging in src/sync.ts
# Then rebuild and run
npm run build
LOG_LEVEL=debug npm start
```

## Best Practices

1. **Always test with dry-run first**
   ```bash
   DRY_RUN=true npm start
   ```

2. **Use appropriate sync intervals**
   - Don't sync too frequently (causes unnecessary API load)
   - Recommended: 30-60 minutes for most setups

3. **Monitor logs in production**
   ```bash
   # Systemd
   sudo journalctl -u firewalla-sync -f
   
   # Or redirect to file
   npm start >> /var/log/firewalla-sync.log 2>&1
   ```

4. **Keep credentials secure**
   - Never commit .env files
   - Use restrictive file permissions (chmod 600 .env)
   - Consider using environment-specific configs

5. **Regular testing**
   - Periodically run in dry-run mode to verify configuration
   - Check for API updates from UniFi and Firewalla
