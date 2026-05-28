# Changelog

All notable changes to the Stellar-Tipz project will be documented in this file.

## [1.0.0] - 2026-05-28

### Added
- **Contract Interface Versioning**: Defined a static `CONTRACT_INTERFACE_VERSION` set to `1.0.0` inside `types/contract.ts`.
- **Response Parser Functions**: Implemented explicit parser helpers that handle raw response shapes from the Soroban smart contract, transforming snake_case fields into camelCase frontend types:
  - `parseProfile`: Parses raw profiles returned from `Profile` contract struct.
  - `parseLeaderboardEntry`: Parses leaderboard data and provides support for backward-compatible `score` alias.
  - `parseTip`: Parses tipping transaction data.
  - `parseContractStats`: Parses global contract statistics.
- **Contract Interface Tests**: Created a new test suite under `src/services/__tests__/contract-interface.test.ts` to ensure frontend types and smart contract response schemas match perfectly.
- **CI Safety Checks**: Tests fail automatically in PR checks if any smart contract response shape deviates without updating the corresponding frontend mappings.
