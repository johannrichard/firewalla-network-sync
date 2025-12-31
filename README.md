# Firewalla-UniFi Network Sync

A TypeScript CLI tool to synchronize client names from Firewalla (master) to UniFi Network. This tool helps maintain consistent device naming across both network management systems by treating Firewalla as the authoritative source for device names.

## Features

- 🔄 Automatic synchronization of client names from Firewalla to UniFi Network
- 🔒 Safety-first approach with verification before making changes
- 🏃 One-time or continuous sync modes
- 🔍 Dry-run mode for testing without making changes
- 📊 Detailed logging and sync summaries
- 🎯 MAC address-based client matching
- ⚡ Standalone bundled executables for easy deployment

## Prerequisites

- Node.js 18.0.0 or higher
- Access to Firewalla API (API token required)
- Access to UniFi Network API (API key and site ID required)

## Installation

### Option 1: From source

```bash
# Clone the repository
git clone https://github.com/johannrichard/firewalla-network-sync.git
cd firewalla-network-sync

# Install dependencies
npm install

# Build the project
npm run build
```

### Option 2: Using bundled executable

```bash
# Build the standalone bundle
npm run bundle

# The bundled files will be in the dist directory:
# - dist/firewalla-sync.js (development)
# - dist/firewalla-sync.min.js (production - minified)
```

## Configuration

Configuration is done via environment variables. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `UNIFI_HOST` | UniFi Network controller URL | `https://192.168.1.1` |
| `UNIFI_API_KEY` | UniFi API key for authentication | `your-api-key-here` |
| `UNIFI_SITE_ID` | UniFi site ID (UUID format) | `550e8400-e29b-41d4-a716-446655440000` |
| `FIREWALLA_HOST` | Firewalla host URL | `https://192.168.1.2` |
| `FIREWALLA_API_TOKEN` | Firewalla API authentication token | `your-token-here` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SYNC_INTERVAL_MINUTES` | How often to sync (0 = run once and exit) | `60` |
| `DRY_RUN` | Enable dry-run mode (`true` or `1`) | `false` |
| `LOG_LEVEL` | Logging level (`debug`, `info`, `warn`, `error`) | `info` |

### Getting API Credentials

#### UniFi Network API Key

1. Log into your UniFi Network application
2. Navigate to Settings → Integrations
3. Create a new API key
4. Copy the API key and site ID

#### Firewalla API Token

Refer to the [Firewalla API documentation](https://docs.firewalla.net) for instructions on obtaining an API token.

## Usage

### Development Mode

Run directly with TypeScript (fastest for development):

```bash
npm run dev
```

### Production Mode

Build and run:

```bash
npm run build
npm start
```

### Using Bundled Executable

```bash
# Run the minified production bundle
node dist/firewalla-sync.min.js
```

### Dry-Run Mode

Test without making any changes:

```bash
DRY_RUN=true npm start
```

### One-Time Sync

Run sync once and exit:

```bash
SYNC_INTERVAL_MINUTES=0 npm start
```

### Continuous Sync

Sync every hour (default):

```bash
npm start
```

Or customize the interval:

```bash
SYNC_INTERVAL_MINUTES=30 npm start
```

## How It Works

1. **Fetch Clients**: Retrieves client lists from both Firewalla and UniFi Network
2. **Match by MAC**: Matches clients across systems using normalized MAC addresses
3. **Identify Changes**: Compares client names and identifies differences
4. **Verify Safety**: Ensures only the name field will be modified (safety-first principle)
5. **Apply Updates**: Updates client names in UniFi Network (respecting dry-run mode)
6. **Report Results**: Logs a detailed summary of the sync operation

## Safety Features

- **Verification**: All changes are verified to ensure only the name field is modified
- **Dry-run mode**: Test the sync process without making actual changes
- **Error handling**: Individual client update failures don't stop the entire sync
- **Detailed logging**: Track exactly what changes are being made

## Development

### Project Structure

```
src/
├── clients/
│   ├── firewalla.ts    # Firewalla API client
│   └── unifi.ts        # UniFi Network API client
├── types/
│   └── index.ts        # TypeScript type definitions
├── config.ts           # Configuration loading and validation
├── logger.ts           # Logging utility
├── sync.ts             # Synchronization logic
└── index.ts            # Main entry point

tests/                  # Unit tests
copilot-instructions.md # AI agent guidance
```

### Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run bundle` - Create standalone bundles (development and production)
- `npm run dev` - Run in development mode with tsx
- `npm start` - Run built version
- `npm test` - Run unit tests with Jest
- `npm run check` - Run Biome checks (lint + format)
- `npm run lint` - Lint code with Biome
- `npm run format` - Format code with Biome

### Running Tests

```bash
npm test
```

### Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check for issues
npm run check

# Lint only
npm run lint

# Format code
npm run format
```

## API Documentation

### Firewalla API

- Documentation: https://docs.firewalla.net
- Note: The Firewalla client implementation may need adjustments based on the actual API structure

### UniFi Network API

- Version: 10.0.162
- Base URL: `{UNIFI_HOST}/v1`
- Authentication: API key via `X-API-KEY` header
- Key endpoints used:
  - `GET /v1/sites` - List sites
  - `GET /v1/sites/{siteId}/clients` - List connected clients
  - `GET /v1/sites/{siteId}/clients/{clientId}` - Get client details
  - `PUT /v1/sites/{siteId}/clients/{clientId}` - Update client

## Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Ensure all required environment variables are set in your `.env` file

**"Invalid host URL"**
- Check that `UNIFI_HOST` and `FIREWALLA_HOST` are valid URLs (including `https://`)

**"UNIFI_SITE_ID must be a valid UUID"**
- Verify your site ID is in UUID format (e.g., `550e8400-e29b-41d4-a716-446655440000`)

**API connection errors**
- Verify network connectivity to both Firewalla and UniFi Network
- Check that API credentials are correct
- Ensure SSL certificates are valid (or configure to accept self-signed certs if needed)

### Debug Mode

For detailed logging:

```bash
LOG_LEVEL=debug npm start
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `npm run check` to ensure code quality
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/johannrichard/firewalla-network-sync/issues
- Firewalla API: https://docs.firewalla.net
- UniFi Network API: Check your UniFi Network application's Integration section
