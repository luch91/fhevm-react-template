# FHEVM SDK Examples

This directory contains examples demonstrating the FHEVM SDK in different environments.

## Prerequisites

Before running any examples:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build the SDK**:
   ```bash
   pnpm sdk:build
   ```

3. **Start local Hardhat node** (Terminal 1):
   ```bash
   pnpm chain
   ```

4. **Deploy contracts** (Terminal 2):
   ```bash
   pnpm deploy:localhost
   ```

## Examples

### Node.js Example ([node-example.js](./node-example.js))

Demonstrates the framework-agnostic core in a pure Node.js environment.

**What it does**:
- Initializes FHEVM client
- Encrypts a value (42)
- Sends encrypted value to FHECounter contract
- Retrieves and decrypts the counter

**Run it**:
```bash
node examples/node-example.js
```

**Expected output**:
```
🚀 FHEVM Node.js Example

1️⃣  Initializing FHEVM client...
   ⏳ sdk-loading...
   ⏳ sdk-loaded...
   ⏳ sdk-initializing...
   ⏳ sdk-initialized...
   ⏳ creating...
   ✅ FHEVM client ready

2️⃣  Setting up provider and signer...
   ✅ Connected as: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

3️⃣  Connecting to FHECounter contract...
   ✅ Connected to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

4️⃣  Encrypting value (42)...
   ✅ Value encrypted
   📦 Handle: 0x1234567890...
   📦 Proof: 0xabcdef1234...

5️⃣  Sending transaction to increment counter...
   ⏳ Transaction sent: 0x...
   ✅ Transaction confirmed in block 2

6️⃣  Getting encrypted counter value...
   ✅ Got encrypted handle: 0x...

7️⃣  Decrypting counter value...
   ✅ Decrypted value: 42

🎉 Success! The counter was incremented by 42.
   Final counter value: 42
```

### Next.js Example

The main application in `packages/nextjs` demonstrates the SDK in a React/Next.js environment.

**Run it**:
```bash
pnpm start
```

Then open [http://localhost:3000](http://localhost:3000)

**Features**:
- React hooks (`useFhevmClient`, `useFhevmEncrypt`, `useFhevmDecrypt`)
- Wallet connection with RainbowKit
- Real-time state updates
- Error handling
- Loading states

## Troubleshooting

### "Cannot find module" errors

Make sure you've built the SDK first:
```bash
pnpm sdk:build
```

### "FHEVM initialization failed"

Make sure the Hardhat node is running:
```bash
pnpm chain
```

### "Contract not found"

Make sure contracts are deployed:
```bash
pnpm deploy:localhost
```

Update the `CONTRACT_ADDRESS` in the example with the deployed address from the deployment output.

### Nonce errors with MetaMask

If using MetaMask with the local Hardhat node, clear activity:
1. Open MetaMask
2. Settings → Advanced → Clear Activity Tab

## Architecture Comparison

### Node.js (Imperative)
```javascript
const client = new FhevmClient();
await client.initialize({ provider, chainId });

const builder = new EncryptionBuilder(client.instance, contract, user);
const encrypted = await builder.addUint8(42).encrypt();

const handler = new DecryptionHandler(client.instance, signer);
const value = await handler.decrypt({ handle, contractAddress });
```

### React (Hooks)
```jsx
const { instance } = useFhevmClient({ provider, chainId });
const { encrypt } = useFhevmEncrypt({ instance, signer, contractAddress });
const { decrypt } = useFhevmDecrypt({ instance, signer });

const encrypted = await encrypt(b => b.addUint8(42));
const value = await decrypt({ handle, contractAddress });
```

**Same core, different interfaces!** ✨

## Learn More

- [SDK Documentation](../packages/fhevm-sdk/README.md)
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
