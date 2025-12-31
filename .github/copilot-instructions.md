# Copilot Instructions for firewalla-network-sync

## Repository Overview

This repository contains code to synchronize client names between Firewalla (master) and UniFi Network. The synchronization ensures that device names from Firewalla are propagated to UniFi Network for consistent network management.

## Project Type

- **Language**: Node.js/JavaScript
- **Primary Purpose**: Network device name synchronization
- **Integration Points**: Firewalla API, UniFi Network API

## Development Guidelines

### Code Style

- Follow standard JavaScript/Node.js conventions
- Use consistent indentation (2 spaces)
- Prefer async/await over callback-based patterns for asynchronous operations
- Use descriptive variable and function names that reflect the networking context

### API Integration

- Firewalla is the source of truth for client names (master)
- UniFi Network is the target for synchronization
- Handle API authentication securely
- Implement proper error handling for network requests
- Use environment variables for credentials and configuration

### Error Handling

- Always handle API errors gracefully
- Log errors with sufficient context for debugging
- Implement retry logic for transient network failures
- Provide meaningful error messages

### Configuration

- Use `.env` files for local development (already gitignored)
- Provide an `.env.example` file as a template
- Document all required environment variables
- Never commit credentials or API keys

### Dependencies

- Keep dependencies up to date
- Review security advisories for used packages
- Minimize external dependencies where possible
- Document the purpose of each major dependency

## Testing

- Write tests for API integration logic
- Mock external API calls in unit tests
- Test error handling scenarios
- Verify synchronization logic with various client name formats

## Security Considerations

- Never expose API credentials in logs
- Validate and sanitize data from external APIs
- Use HTTPS for all API communications
- Implement rate limiting to respect API quotas
- Follow principle of least privilege for API access

## Documentation

- Keep README.md updated with setup instructions
- Document API endpoints used from Firewalla and UniFi
- Provide examples of expected data formats
- Include troubleshooting guidance for common issues

## Git Workflow

- Create descriptive commit messages
- Keep commits focused and atomic
- Reference issue numbers in commit messages when applicable
- Avoid committing generated files or dependencies
