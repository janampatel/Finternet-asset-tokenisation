# Versioning Strategy

Finternet uses [Semantic Versioning 2.0.0](https://semver.org/) (SemVer) for its releases.

## Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Incompatible API changes or Smart Contract upgrades that require migration.
- **MINOR**: Backward-compatible functionality (e.g., new asset types, UI features).
- **PATCH**: Backward-compatible bug fixes or non-functional changes.

## Release Process

1.  **Draft Release**: Created on GitHub Actions trigger or manually.
2.  **Tagging**: `v1.0.0`
3.  **Changelog**: Auto-generated based on Conventional Commits.

## Component Versioning

Since this is a Monorepo, we version the entire suite together to ensure compatibility between:
- Smart Contract ABIs
- Backend Event Indexer
- Frontend UI

When a breaking change occurs in Contracts, the whole system increments MAJOR.
