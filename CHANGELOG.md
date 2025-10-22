# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-21

### Added

#### Universal FHEVM SDK
- **Framework-agnostic core SDK** with state machine architecture
- **Fluent Encryption API** with chainable, type-safe builder pattern
- **Smart caching** with automatic EIP-712 signature management
- **React hooks** (`useFhevmClient`, `useFhevmEncrypt`, `useFhevmDecrypt`)
- **TypeScript-first** design with full type safety
- **State machine client** with explicit lifecycle management (idle → initializing → ready/error)
- **Abort controller support** for cancellable async operations
- **Memory leak detection** with listener count warnings
- **Race condition protection** in client initialization
- **Signature auto-refresh** for expired decryption signatures
- Public API methods: `clearSignatureCache()` and `clearAllSignatures()` in DecryptionHandler

#### Smart Contracts
- **FHECounter contract** with encrypted counter operations
- Constructor initialization to encrypted zero
- Events for off-chain tracking (`CounterIncremented`, `CounterDecremented`)

#### Frontend
- **Next.js React template** with Tailwind CSS
- **RainbowKit integration** for wallet management
- **Error boundary component** for graceful error handling
- **Multi-network support** (Sepolia testnet and local Hardhat)
- **Live decryption demo** with FHE counter example

#### Documentation
- Comprehensive SDK documentation with usage examples
- Quick start guides for React (< 5 lines) and Node.js (< 10 lines)
- Windows-specific troubleshooting guide
- MetaMask + Hardhat development tips
- Production deployment notes for Sepolia

### Fixed

#### Critical Fixes
- **Type declaration paths**: Fixed `package.json` types field to point to `dist/index.d.ts` instead of `src/index.ts`
- **Bit shift overflow**: Changed `(1n << 256n)` to `2n ** 256n` to prevent RangeError in uint256 validation
- **Infinite re-render loop**: Removed `JSON.stringify` equality check in `useFhevmClient`, now uses primitive comparisons
- **Handler recreation thrashing**: Store storage/keypair in refs to prevent unnecessary DecryptionHandler recreation

#### Medium Fixes
- **Undefined counter state**: Added constructor initialization in FHECounter contract
- **Decryption edge case**: Use `hasOwnProperty` instead of `=== undefined` check in DecryptionHandler
- **Silent failures**: Added explicit return statements after `setMessage` calls
- **Type safety hack**: Fixed `isRefreshing` type assertion in useFHECounterWagmi
- **Error propagation**: Added error cause preservation throughout SDK
- **Race conditions**: Implemented initialization ID tracking in FhevmClient
- **Memory leaks**: Added cleanup protection with `isCleaningUpRef` flag in useFhevmClient

#### Minor Fixes
- **Address validation**: Improved regex validation for Ethereum addresses
- **Code duplication**: Extracted `performEncryption` method in `useFhevmEncrypt`, eliminating ~80 duplicate lines
- **Cross-platform scripts**: Changed `rm -rf` to `rimraf` for Windows compatibility
- **Package metadata**: Added description, license, author, repository, keywords to SDK package.json
- **Publishability**: Changed SDK package from `private: true` to `private: false`
- **JSDoc examples**: Updated FhevmClient documentation to use correct API
- **UI complexity**: Extracted helper functions for button text in FHECounterDemo

### Changed
- **Dependencies**: Updated `@zama-fhe/relayer-sdk` from `0.1.2` to `0.2.0`
- **Repository URL**: Fixed placeholder to actual GitHub URL

### Removed
- Development artifacts: DAY4-SUMMARY.md, DAYS-5-6-SUMMARY.md, FINAL-SUBMISSION-CHECKLIST.md, MASTER-SUMMARY.md, QUICK-REFERENCE.md, VERCEL-DEPLOYMENT.md, VIDEO-SCRIPT.md

## [Unreleased]

### Planned
- Additional encryption type support
- Batch decryption optimizations
- Vue.js and Angular framework adapters
- Extended error recovery mechanisms
- Performance benchmarking suite

---

## Version History

- **0.1.0** - Initial release for Zama FHE Builder Program
  - Universal SDK with framework-agnostic core
  - React template with Next.js integration
  - Full TypeScript support
  - Comprehensive documentation and examples
