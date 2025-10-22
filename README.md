# FHEVM Universal SDK & React Template

**A framework-agnostic FHEVM SDK with React template** for building confidential smart contract applications with Fully Homomorphic Encryption.

> 🏆 **Built for Zama FHE Builder Program** - Features a universal SDK with state machine architecture, fluent APIs, and framework-agnostic core.

## 🚀 What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) enables computation on encrypted data directly on Ethereum. This template demonstrates how to build dApps that can perform computations while keeping data private.

## ✨ Key Features

### 🎯 Universal FHEVM SDK
- **Framework-Agnostic Core**: Works in Node.js, React, Vue, or any JavaScript environment
- **State Machine Architecture**: Explicit state management for predictable behavior
- **Fluent Encryption API**: Chainable, type-safe encryption builder
- **Smart Caching**: Automatic EIP-712 signature caching for optimal performance
- **React Hooks**: Modern hooks (`useFhevmClient`, `useFhevmEncrypt`, `useFhevmDecrypt`)
- **TypeScript-First**: Full type safety with zero `any` in public APIs

### 🎨 React Template
- **⚛️ React + Next.js**: Modern, performant frontend framework
- **🎨 Tailwind CSS**: Utility-first styling for rapid UI development
- **🔗 RainbowKit**: Seamless wallet connection and management
- **🌐 Multi-Network Support**: Works on both Sepolia testnet and local Hardhat node
- **📦 Monorepo Structure**: Organized packages for SDK, contracts, and frontend

## 🚀 Quick SDK Usage

### React (< 5 lines)
```tsx
import { useFhevmClient, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk/react';

const { instance } = useFhevmClient({ provider, chainId });
const { encrypt } = useFhevmEncrypt({ instance, signer, contractAddress });
const { decrypt } = useFhevmDecrypt({ instance, signer });

// Encrypt → Send → Decrypt
const encrypted = await encrypt(b => b.addUint8(42));
await contract.myFunction(encrypted.handles[0], encrypted.inputProof);
const value = await decrypt({ handle, contractAddress });
```

### Node.js (< 10 lines)
```typescript
import { FhevmClient, EncryptionBuilder, DecryptionHandler } from '@fhevm/sdk/core';

const client = new FhevmClient();
await client.initialize({ provider, chainId });

const encrypted = await new EncryptionBuilder(client.instance!, contract, user)
  .addUint8(42).encrypt();

const handler = new DecryptionHandler(client.instance!, signer);
const value = await handler.decrypt({ handle, contractAddress });
```

**📚 [Full SDK Documentation](packages/fhevm-sdk/README.md)** | **💡 [Examples](examples/)**

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **MetaMask** browser extension
- **Git** for cloning the repository

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/zama-ai/fhevm-react-template.git
cd fhevm-react-template

# Initialize submodules (includes fhevm-hardhat-template)
git submodule update --init --recursive

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Set up your Hardhat environment variables by following the [FHEVM documentation](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional):

- `MNEMONIC`: Your wallet mnemonic phrase
- `INFURA_API_KEY`: Your Infura API key for Sepolia

### 3. Start Development Environment

**Option A: Local Development (Recommended for testing)**

```bash
# Terminal 1: Start local Hardhat node
pnpm chain
# RPC URL: http://127.0.0.1:8545 | Chain ID: 31337

# Terminal 2: Deploy contracts to localhost
pnpm deploy:localhost

# Terminal 3: Start the frontend
pnpm start
```

**Option B: Sepolia Testnet**

```bash
# Deploy to Sepolia testnet
pnpm deploy:sepolia

# Start the frontend
pnpm start
```

### 4. Connect MetaMask

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Connect Wallet" and select MetaMask
3. If using localhost, add the Hardhat network to MetaMask:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

### ⚠️ Sepolia Production note

- In production, `NEXT_PUBLIC_ALCHEMY_API_KEY` must be set (see `packages/nextjs/scaffold.config.ts`). The app throws if missing.
- Ensure `packages/nextjs/contracts/deployedContracts.ts` points to your live contract addresses.
- Optional: set `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` for better WalletConnect reliability.
- Optional: add per-chain RPCs via `rpcOverrides` in `packages/nextjs/scaffold.config.ts`.

## 🔧 Troubleshooting

### Common MetaMask + Hardhat Issues

When developing with MetaMask and Hardhat, you may encounter these common issues:

#### ❌ Nonce Mismatch Error

**Problem**: MetaMask tracks transaction nonces, but when you restart Hardhat, the node resets while MetaMask doesn't update its tracking.

**Solution**:
1. Open MetaMask extension
2. Select the Hardhat network
3. Go to **Settings** → **Advanced**
4. Click **"Clear Activity Tab"** (red button)
5. This resets MetaMask's nonce tracking

#### ❌ Cached View Function Results

**Problem**: MetaMask caches smart contract view function results. After restarting Hardhat, you may see outdated data.

**Solution**:
1. **Restart your entire browser** (not just refresh the page)
2. MetaMask's cache is stored in extension memory and requires a full browser restart to clear

> 💡 **Pro Tip**: Always restart your browser after restarting Hardhat to avoid cache issues.

For more details, see the [MetaMask development guide](https://docs.metamask.io/wallet/how-to/run-devnet/).

### Windows-Specific Issues

#### ❌ pnpm install fails

**Problem**: On Windows, you may see TTY-related errors during `pnpm install`.

**Solution**:
```bash
# Use the --force flag
pnpm install --force
```

#### ❌ Scripts fail to run

**Problem**: Some npm scripts use Unix-style commands that may not work on Windows.

**Solution**:
- Use Git Bash or WSL (Windows Subsystem for Linux)
- Or ensure you have a Unix-like environment like Git for Windows installed

## 📁 Project Structure

This template uses a monorepo structure with three main packages:

```
fhevm-react-template/
├── packages/
│   ├── fhevm-sdk/                # 🎯 Universal FHEVM SDK (NEW!)
│   │   ├── core/                 #    Framework-agnostic core
│   │   │   ├── FhevmClient.ts   #    State machine
│   │   │   ├── EncryptionBuilder.ts # Fluent encryption API
│   │   │   └── DecryptionHandler.ts # Smart decryption
│   │   └── react/                #    React hooks
│   │       ├── useFhevmClient.ts
│   │       ├── useFhevmEncrypt.ts
│   │       └── useFhevmDecrypt.ts
│   ├── fhevm-hardhat-template/  # Smart contracts & deployment
│   └── nextjs/                  # React frontend application
├── examples/                    # SDK usage examples
│   ├── node-example.js         # Node.js example
│   └── README.md               # Example documentation
└── scripts/                    # Build and deployment scripts
```

### Key Components

#### 🎯 **NEW: Universal FHEVM SDK** (`packages/fhevm-sdk/`)
The star of this template! A complete rewrite featuring:
- **Framework-Agnostic Core**: Works anywhere JavaScript runs
- **State Machine**: Explicit, predictable state management
- **Fluent APIs**: Chainable encryption with validation
- **Smart Caching**: EIP-712 signature reuse
- **Full TypeScript**: Type-safe from end to end

📚 **[Complete SDK Documentation](packages/fhevm-sdk/README.md)**

#### 🔗 React Integration (`packages/nextjs/hooks/`)
- Modern hooks using the new SDK
- **`useFHECounterNew.tsx`**: Example hook with new SDK
- **`useFHECounterWagmi.tsx`**: Legacy hook (backwards compatible)
- Wallet management with RainbowKit

#### 💡 Examples (`examples/`)
- **Node.js script**: Demonstrates framework-agnostic core
- **React app**: Full Next.js integration
- Shows same core logic in different environments

## 📚 Additional Resources

### Official Documentation
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/) - Complete FHEVM guide
- [FHEVM Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat) - Hardhat integration
- [Relayer SDK Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/) - SDK reference
- [Environment Setup](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) - MNEMONIC & API keys

### Development Tools
- [MetaMask + Hardhat Setup](https://docs.metamask.io/wallet/how-to/run-devnet/) - Local development
- [React Documentation](https://reactjs.org/) - React framework guide

### Community & Support
- [FHEVM Discord](https://discord.com/invite/zama) - Community support
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues) - Bug reports & feature requests

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.
