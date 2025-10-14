/**
 * Node.js Example - FHEVM SDK
 *
 * This example demonstrates using the framework-agnostic core
 * to encrypt and decrypt values with FHEVM in a Node.js environment.
 *
 * Prerequisites:
 * 1. Run `pnpm chain` in terminal 1 (starts local Hardhat node)
 * 2. Run `pnpm deploy:localhost` in terminal 2 (deploys contracts)
 * 3. Run this script: `node examples/node-example.js`
 */

import { FhevmClient } from '../packages/fhevm-sdk/dist/core/FhevmClient.js';
import { EncryptionBuilder } from '../packages/fhevm-sdk/dist/core/EncryptionBuilder.js';
import { DecryptionHandler } from '../packages/fhevm-sdk/dist/core/DecryptionHandler.js';
import { ethers } from 'ethers';

// Contract ABI - only the functions we need
const COUNTER_ABI = [
  'function incrementBy(bytes32 encryptedAmount, bytes calldata inputProof) external',
  'function getCounter() external view returns (bytes32)',
];

// Configuration
const RPC_URL = 'http://127.0.0.1:8545';
const CHAIN_ID = 31337;
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Update after deployment

async function main() {
  console.log('🚀 FHEVM Node.js Example\n');

  // Step 1: Initialize FHEVM Client
  console.log('1️⃣  Initializing FHEVM client...');
  const client = new FhevmClient();

  // Subscribe to state changes
  client.subscribe((event) => {
    if (event.state.status === 'initializing') {
      console.log(`   ⏳ ${event.state.progress || 'initializing'}...`);
    }
  });

  try {
    await client.initialize({
      provider: RPC_URL,
      chainId: CHAIN_ID,
    });

    if (client.state.status !== 'ready') {
      throw new Error('Client failed to initialize');
    }

    console.log('   ✅ FHEVM client ready\n');

    // Step 2: Setup provider and signer
    console.log('2️⃣  Setting up provider and signer...');
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    console.log(`   ✅ Connected as: ${userAddress}\n`);

    // Step 3: Connect to contract
    console.log('3️⃣  Connecting to FHECounter contract...');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, COUNTER_ABI, signer);
    console.log(`   ✅ Connected to: ${CONTRACT_ADDRESS}\n`);

    // Step 4: Encrypt a value
    console.log('4️⃣  Encrypting value (42)...');
    const instance = client.instance;
    if (!instance) {
      throw new Error('Instance not available');
    }

    const builder = new EncryptionBuilder(
      instance,
      CONTRACT_ADDRESS,
      userAddress
    );

    const encrypted = await builder
      .addUint8(42)
      .encrypt();

    console.log('   ✅ Value encrypted');
    console.log(`   📦 Handle: ${encrypted.handles[0].slice(0, 10)}...`);
    console.log(`   📦 Proof: ${encrypted.inputProof.slice(0, 10)}...\n`);

    // Step 5: Send transaction
    console.log('5️⃣  Sending transaction to increment counter...');
    const tx = await contract.incrementBy(
      encrypted.handles[0],
      encrypted.inputProof
    );

    console.log(`   ⏳ Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}\n`);

    // Step 6: Get encrypted result
    console.log('6️⃣  Getting encrypted counter value...');
    const encryptedHandle = await contract.getCounter();
    console.log(`   ✅ Got encrypted handle: ${encryptedHandle.slice(0, 20)}...\n`);

    // Step 7: Decrypt the result
    console.log('7️⃣  Decrypting counter value...');
    const handler = new DecryptionHandler(instance, signer);

    const decryptedValue = await handler.decrypt({
      handle: encryptedHandle,
      contractAddress: CONTRACT_ADDRESS,
    });

    console.log(`   ✅ Decrypted value: ${decryptedValue}\n`);

    // Success!
    console.log('🎉 Success! The counter was incremented by 42.');
    console.log(`   Final counter value: ${decryptedValue}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    // Cleanup
    client.destroy();
  }
}

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
