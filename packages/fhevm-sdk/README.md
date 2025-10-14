# @fhevm/sdk

A universal, framework-agnostic SDK for building confidential smart contracts with FHEVM (Fully Homomorphic Encryption Virtual Machine).

## Features

- 🎯 **Framework-Agnostic Core** - Use in Node.js, React, Vue, or any JavaScript environment
- 🔄 **State Machine Architecture** - Explicit state management for all operations
- 🔗 **Fluent API** - Chainable, type-safe encryption builder
- ⚡ **Smart Caching** - Automatic signature caching for optimal performance
- 🎨 **React Hooks** - First-class React support with modern hooks
- 📦 **Zero Config** - Works out of the box with sensible defaults
- 🔐 **EIP-712 Signing** - Secure decryption with typed data signatures

## Installation

```bash
npm install @fhevm/sdk
# or
pnpm install @fhevm/sdk
# or
yarn add @fhevm/sdk
```

## Quick Start

### React + Next.js

```tsx
import { useFhevmClient, useFhevmEncrypt, useFhevmDecrypt } from '@fhevm/sdk/react';
import { useEthersSigner } from './hooks/useEthersSigner'; // your hook

function MyComponent() {
  // 1. Initialize FHEVM client
  const { instance, isReady, isInitializing, error } = useFhevmClient({
    provider: window.ethereum,
    chainId: 31337
  });

  // 2. Setup encryption
  const signer = useEthersSigner();
  const { encrypt } = useFhevmEncrypt({
    instance,
    signer,
    contractAddress: '0x...'
  });

  // 3. Setup decryption
  const { decrypt } = useFhevmDecrypt({ instance, signer });

  // 4. Use in your app
  const handleSubmit = async () => {
    // Encrypt data
    const encrypted = await encrypt((builder) => {
      builder.addUint8(42);
      builder.addAddress(userAddress);
    });

    // Send to contract
    await contract.myFunction(encrypted.handles[0], encrypted.inputProof);

    // Decrypt result
    const handle = await contract.getResult();
    const value = await decrypt({
      handle,
      contractAddress: '0x...'
    });

    console.log('Decrypted value:', value);
  };

  if (isInitializing) return <div>Loading FHEVM...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Connect wallet</div>;

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Node.js

```typescript
import { FhevmClient, EncryptionBuilder, DecryptionHandler } from '@fhevm/sdk/core';
import { ethers } from 'ethers';

async function main() {
  // 1. Initialize client
  const client = new FhevmClient();

  await client.initialize({
    provider: 'http://localhost:8545',
    chainId: 31337
  });

  // Wait for ready state
  if (client.state.status !== 'ready') {
    throw new Error('Client not ready');
  }

  const instance = client.instance!;
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const signer = await provider.getSigner();

  // 2. Encrypt data
  const userAddress = await signer.getAddress();
  const encrypted = await new EncryptionBuilder(
    instance,
    contractAddress,
    userAddress
  )
    .addUint8(42)
    .addAddress(userAddress)
    .encrypt();

  // 3. Send transaction
  const contract = new ethers.Contract(contractAddress, abi, signer);
  await contract.myFunction(encrypted.handles[0], encrypted.inputProof);

  // 4. Decrypt result
  const handler = new DecryptionHandler(instance, signer);
  const handle = await contract.getResult();
  const value = await handler.decrypt({
    handle,
    contractAddress
  });

  console.log('Decrypted value:', value);
}

main();
```

## API Reference

### Core API (`@fhevm/sdk/core`)

#### `FhevmClient`

Main client for managing FHEVM instance lifecycle.

```typescript
const client = new FhevmClient();

// Initialize
await client.initialize({
  provider: window.ethereum,
  chainId: 31337,
  mockChains: { 31337: 'http://localhost:8545' } // optional
});

// Subscribe to state changes
const unsubscribe = client.subscribe((event) => {
  console.log('State:', event.state.status);
});

// Access instance when ready
if (client.isReady) {
  const instance = client.instance;
}

// Refresh
await client.refresh();

// Cleanup
client.destroy();
```

**States:**
- `idle` - Not initialized
- `initializing` - Loading FHEVM
- `ready` - Ready to use
- `error` - Failed to initialize

#### `EncryptionBuilder`

Fluent API for building encrypted inputs.

```typescript
const builder = new EncryptionBuilder(instance, contractAddress, userAddress);

const encrypted = await builder
  .addBool(true)              // Add boolean
  .addUint8(255)              // Add uint8 (0-255)
  .addUint16(65535)           // Add uint16 (0-65535)
  .addUint32(4294967295)      // Add uint32
  .addUint64(18446744073709551615n) // Add uint64 (bigint)
  .addUint128(BigInt('340282366920938463463374607431768211455')) // Add uint128
  .addUint256(BigInt('1157920...')) // Add uint256
  .addAddress('0x...')        // Add address
  .encrypt();                 // Encrypt all values

// Or get hex-encoded result
const hexResult = await builder.encryptToHex();
```

#### `DecryptionHandler`

Handler for decrypting FHEVM values.

```typescript
const handler = new DecryptionHandler(instance, signer, {
  storage: customStorage,  // optional, defaults to in-memory
  keypair: { publicKey, privateKey } // optional, will generate if not provided
});

// Decrypt single value
const value = await handler.decrypt({
  handle: '0x123...',
  contractAddress: '0xabc...'
});

// Decrypt multiple values (more efficient)
const values = await handler.decryptMany([
  { handle: '0x123...', contractAddress: '0xabc...' },
  { handle: '0x456...', contractAddress: '0xdef...' }
]);

// Preload signature (avoid wallet prompt during time-sensitive ops)
await handler.preloadSignature(['0xabc...', '0xdef...']);

// Check if valid signature exists
const hasSignature = await handler.hasValidSignature(['0xabc...']);
```

### React API (`@fhevm/sdk/react`)

#### `useFhevmClient(options)`

Hook for managing FHEVM client lifecycle.

```typescript
const {
  instance,      // FhevmInstance | undefined
  state,         // Current state object
  isReady,       // boolean
  isInitializing, // boolean
  isError,       // boolean
  error,         // Error | undefined
  refresh        // () => Promise<void>
} = useFhevmClient({
  provider: window.ethereum,
  chainId: 31337,
  mockChains: {}, // optional
  enabled: true   // optional, default true
});
```

#### `useFhevmEncrypt(options)`

Hook for encryption operations.

```typescript
const {
  canEncrypt,     // boolean
  isEncrypting,   // boolean
  error,          // Error | undefined
  encrypt,        // (fn) => Promise<EncryptedInput>
  encryptToHex,   // (fn) => Promise<{handles, inputProof}>
  createBuilder,  // () => Promise<EncryptionBuilder>
  clearError      // () => void
} = useFhevmEncrypt({
  instance,
  signer,
  contractAddress
});

// Usage
const encrypted = await encrypt((builder) => {
  builder.addUint8(42);
});
```

#### `useFhevmDecrypt(options)`

Hook for decryption operations.

```typescript
const {
  canDecrypt,         // boolean
  isDecrypting,       // boolean
  error,              // Error | undefined
  decrypt,            // (request) => Promise<DecryptedValue>
  decryptMany,        // (requests) => Promise<Record<string, DecryptedValue>>
  decryptManyOrdered, // (requests) => Promise<DecryptedValue[]>
  preloadSignature,   // (addresses) => Promise<void>
  hasValidSignature,  // (addresses) => Promise<boolean>
  clearError          // () => void
} = useFhevmDecrypt({
  instance,
  signer,
  storage,   // optional
  keypair    // optional
});

// Usage
const value = await decrypt({
  handle: '0x123...',
  contractAddress: '0xabc...'
});
```

## Advanced Usage

### Custom Storage

Implement custom storage for signature caching:

```typescript
import { GenericStringStorage } from '@fhevm/sdk/storage';

class CustomStorage implements GenericStringStorage {
  async getItem(key: string): Promise<string | null> {
    // Your implementation
  }

  async setItem(key: string, value: string): Promise<void> {
    // Your implementation
  }

  async removeItem(key: string): Promise<void> {
    // Your implementation
  }
}

const handler = new DecryptionHandler(instance, signer, {
  storage: new CustomStorage()
});
```

### Multiple Contract Decryption

Efficiently decrypt from multiple contracts:

```typescript
const values = await handler.decryptMany([
  { handle: '0x123...', contractAddress: '0xabc...' },
  { handle: '0x456...', contractAddress: '0xabc...' },
  { handle: '0x789...', contractAddress: '0xdef...' }
]);

// Access by handle
console.log(values['0x123...']); // bigint | boolean | string
```

### Error Handling

```typescript
try {
  await client.initialize({ provider, chainId });
} catch (error) {
  if (error instanceof FhevmClientError) {
    console.error(`Error [${error.code}]:`, error.message);
    console.error('Cause:', error.cause);
  }
}
```

### State Management

Subscribe to client state changes:

```typescript
const client = new FhevmClient();

client.subscribe((event) => {
  switch (event.state.status) {
    case 'initializing':
      console.log('Progress:', event.state.progress);
      break;
    case 'ready':
      console.log('Instance ready:', event.state.instance);
      break;
    case 'error':
      console.error('Error:', event.state.error);
      break;
  }
});
```

## Examples

See the [examples](../../examples) directory for complete applications:

- **Next.js** - Full-featured React app with FHECounter
- **Node.js** - CLI script demonstrating framework-agnostic core

## Architecture

```
@fhevm/sdk
├── core/              → Framework-agnostic core
│   ├── FhevmClient           (State machine)
│   ├── EncryptionBuilder     (Fluent encryption API)
│   └── DecryptionHandler     (Decryption with caching)
├── react/             → React hooks
│   ├── useFhevmClient
│   ├── useFhevmEncrypt
│   └── useFhevmDecrypt
├── storage/           → Storage abstraction
└── types/             → TypeScript types
```

## TypeScript

Fully typed with TypeScript. All types are exported:

```typescript
import type {
  FhevmInstance,
  FhevmClientState,
  FhevmClientConfig,
  EncryptedInput,
  DecryptionRequest,
  DecryptedValue
} from '@fhevm/sdk';
```

## Browser Support

- Modern browsers with ES2020 support
- Node.js 18+

## License

BSD-3-Clause-Clear

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## Support

- [Discord](https://discord.com/invite/zama)
- [Documentation](https://docs.zama.ai)
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues)
