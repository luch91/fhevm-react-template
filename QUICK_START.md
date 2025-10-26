# Quick Start Guide - Fixed & Ready for Vercel

## 🎉 Issues Fixed

### ✅ 1. `pnpm chain` - Working Correctly
The command is **not failing** - it's running a persistent blockchain node (correct behavior).

### ✅ 2. Browser Connection - Configured
Hardhat is configured to accept browser connections on `0.0.0.0:8545`

### ✅ 3. Vercel Deployment - Ready
- Removed incorrect root `vercel.json`
- Fixed `packages/nextjs/vercel.json` to use pnpm
- Added `packageManager` field to `package.json`

---

## 🚀 Local Development (3 Terminals)

### Terminal 1: Start Local Blockchain
```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"
pnpm chain
```
**Expected:** Terminal stays open running the node on http://127.0.0.1:8545

### Terminal 2: Deploy Contracts
```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"
pnpm deploy:localhost
```
**Expected:** Contracts deployed, ABIs generated

### Terminal 3: Start Frontend
```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"
pnpm start
```
**Expected:** Next.js dev server on http://localhost:3000

### Configure MetaMask for Localhost
- **Network Name:** Hardhat Local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency:** ETH

---

## 🌐 Vercel Production Deployment

### Step 1: Deploy to Sepolia Testnet
```bash
# Set up Hardhat variables
cd packages/hardhat
npx hardhat vars set MNEMONIC
# Enter your wallet mnemonic

npx hardhat vars set INFURA_API_KEY
# Enter your Infura API key

# Deploy contracts
cd ../..
pnpm deploy:sepolia
```

### Step 2: Configure Vercel Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Your Alchemy API key
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Your WalletConnect ID (optional)

### Step 3: Deploy to Vercel
```bash
cd packages/nextjs
vercel
```

**OR** connect your GitHub repo to Vercel for auto-deployments:
- **Root Directory:** `packages/nextjs`
- **Framework:** Next.js
- **Build/Install Commands:** Automatic (from vercel.json)

---

## 📁 Key Files Modified

1. **`packages/nextjs/vercel.json`** - Fixed to use pnpm
2. **`packages/nextjs/package.json`** - Added packageManager field
3. **`vercel.json`** (root) - Removed to avoid conflicts

---

## 🔧 Troubleshooting

### "pnpm chain hangs"
✅ **This is correct!** It's running a node. Keep it open and use a new terminal.

### "Can't connect to localhost:8545"
✅ **Already fixed!** Hardhat config has `listen: { host: "0.0.0.0", port: 8545 }`

### "Vercel build fails"
1. Ensure contracts deployed to Sepolia: `pnpm deploy:sepolia`
2. Verify environment variables set in Vercel dashboard
3. Check `packages/nextjs/contracts/deployedContracts.ts` includes Sepolia (11155111)

### "MetaMask nonce issues"
- Settings → Advanced → Clear Activity Tab
- Restart browser completely

---

## 📚 Full Documentation
See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for complete deployment instructions.

---

## 🎯 What This Project Does

This is an **FHE (Fully Homomorphic Encryption) Counter Demo** that:
- Stores an **encrypted counter** on-chain
- Performs **arithmetic on encrypted data** (increment/decrement)
- Allows **authorized decryption** by users
- Demonstrates **privacy-preserving smart contracts**

The counter value remains encrypted on the blockchain - only authorized users can decrypt and view it!
