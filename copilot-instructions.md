<!-- copilot-instructions.md - concise, actionable guidance for AI coding agents -->

# Copilot instructions for firewalla-network-sync

## Purpose

- Help AI coding agents become productive quickly by explaining architecture, developer workflows, conventions, and key integration points.

## Architecture (big picture)

- Single TypeScript CLI tool: source entry is `src/index.ts` which synchronizes client names from Firewalla (master) to UniFi Network.
- Core functions: `fetchFirewallaClients`, `fetchUniFiClients`, `syncClientNames`, `verifyChanges` (exported at bottom of `src/index.ts`).
- Data flow: fetch clients from Firewalla → fetch clients from UniFi → match by MAC address → update client names in UniFi → verify changes → optionally persist.

## Key files

- [README.md](README.md): user-facing usage, env vars, and safety features.
- `src/index.ts`: main implementation and defaults.
- `src/clients/firewalla.ts`: Firewalla API client implementation.
- `src/clients/unifi.ts`: UniFi Network API client implementation.
- `src/sync.ts`: Synchronization logic.
- `tests/`: Unit tests and mocking patterns for API clients.
- `package.json`: build, bundle, test, lint/format scripts.

## Developer workflows & commands

- Build TypeScript: `npm run build` (runs `tsc`).
- Create standalone bundles (recommended for distribution): `npm run bundle` (uses `esbuild`): produces `dist/firewalla-sync.js` and `dist/firewalla-sync.min.js`.
- Run in development: `npm run dev` (uses `tsx` for fast TypeScript execution).
- Run built version: `npm start` (runs `node dist/index.js` after `npm run build`).
- Tests: `npm test` (Jest with ts-jest). Tests show how API clients are mocked.
- Lint/format: uses Biome: `npm run check`, `npm run lint`, `npm run format`.

## Config & env vars (concrete values)

- `UNIFI_HOST` (required): UniFi Network controller URL (e.g., `https://192.168.1.1`)
- `UNIFI_API_KEY` (required): UniFi API key for authentication
- `UNIFI_SITE_ID` (required): UniFi site ID (UUID)
- `FIREWALLA_HOST` (required): Firewalla host URL (e.g., `https://192.168.1.2`)
- `UNIFI_SITE_ID` (required): UniFi site ID (UUID)
- `FIREWALLA_HOST` (required): Firewalla MSP domain (e.g., `https://mydomain.firewalla.net`)
- `FIREWALLA_API_TOKEN` (required): Firewalla personal access token
- `FIREWALLA_BOX_ID` (required): Firewalla box ID (gid)
- `SYNC_INTERVAL_MINUTES` (default: `60`): How often to run sync (0 = run once and exit)
- `DRY_RUN` (default: `false`): Set to `true` or `1` to enable dry-run mode
- `LOG_LEVEL` (default: `info`): Logging level (debug, info, warn, error)

## Project-specific conventions & patterns

- Safety-first: any changes must be verified before persisting — see `verifyChanges`. Never update UniFi without verification.
- API authentication: UniFi uses API key in `X-API-KEY` header, Firewalla MSP uses `Token` in Authorization header.
- MAC address matching: Primary key for matching clients across systems (normalized to lowercase with colons).
- Error handling: All API errors should be caught and logged; failures should not crash the entire sync process.
- Bundling: Produce standalone single-file bundles with `esbuild` (target Node 18). Use `dist/firewalla-sync.min.js` for production.

## Integration points & dependencies

- HTTP clients: Native `fetch` API (Node 18+) for API calls.
- Configuration: `dotenv` for environment variable management.
- Bundling: `esbuild` for shipping standalone JS.
- Testing: `jest` with `ts-jest` for TypeScript support.
- Formatting/linting: `Biome` (commands in `package.json`).

## API Documentation

### Firewalla MSP API v2
- Documentation: https://docs.firewalla.net
- Base URL: `https://msp_domain/v2`
- Authentication: `Token` in Authorization header
- Used endpoints:
  - `GET /v2/devices` - List all devices (optionally filtered by box ID)
  - `PATCH /v2/boxes/:gid/devices/:id` - Update device name (max 32 characters)

### UniFi Network API (v10.0.162)
- Base path: `/v1`
- Authentication: API key via `X-API-KEY` header
- Key endpoints used:
  - `GET /v1/sites` - List sites
  - `GET /v1/sites/{siteId}/clients` - List connected clients
  - `GET /v1/sites/{siteId}/clients/{clientId}` - Get client details
  - `PUT /v1/sites/{siteId}/clients/{clientId}` - Update client (if supported)

## What an agent can safely change

- Small fixes and refactors that preserve exported function signatures and behavior (especially `verifyChanges` contract).
- Add unit tests following existing test patterns when adding behavior.
- Update README or add CLI flags, but keep env-var defaults intact unless a breaking change is required.
- Enhance error handling and logging.

## Quick examples (copyable)

- Run dry-run locally (after building):
  ```bash
  DRY_RUN=true npm start
  ```

- Run in development mode:
  ```bash
  npm run dev
  ```

- Create production bundle and run bundled script:
  ```bash
  npm run bundle
  node dist/firewalla-sync.min.js
  ```

- Run tests:
  ```bash
  npm test
  ```

## Notes for reviewers (agent-specific)

- Prefer small, well-tested commits. Unit tests are authoritative for behavior.
- Use tests as examples of how to mock API clients rather than inventing new mocking styles.
- Preserve Node 18+ compatibility when editing bundling targets unless you update `package.json` and justify it.
- Follow safety-first principle: always verify changes before persisting.

If anything in this file is unclear or you need more details about a specific function or test, ask and I will add explicit examples or line pointers.
