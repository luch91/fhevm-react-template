# Quick Start Guide - Windows Port Issue Resolved

## ⚠️ IMPORTANT: Windows Port 8545 Issue

Your app errors show:
```
Error: The URL http://localhost:8545 is not a Web3 node or is not reachable.
```

This is caused by **Windows blocking port 8545** (`EACCES: permission denied`).

**See [WINDOWS_FIX.md](./WINDOWS_FIX.md) for detailed solutions.**

---

## 🎯 Recommended Solution: Use Sepolia Testnet

**Skip localhost entirely** and develop on Sepolia testnet:

### Step 1: Configure Hardhat (One-time setup)
```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template\packages\hardhat"

# Set your wallet mnemonic
npx hardhat vars set MNEMONIC
# Enter your 12 or 24-word MetaMask recovery phrase

# Set Infura API key (get free key from https://infura.io)
npx hardhat vars set INFURA_API_KEY
# Enter your Infura API key
```

### Step 2: Deploy Contracts to Sepolia
```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"
pnpm deploy:sepolia
```

**Expected output:**
- Contracts deployed to Sepolia testnet
- `packages/nextjs/contracts/deployedContracts.ts` updated with Sepolia addresses

### Step 3: Start Frontend
```bash
pnpm start
```

**App will now connect to Sepolia instead of localhost!**

### Step 4: Configure MetaMask
1. **Switch to Sepolia Testnet** in MetaMask
2. **Get test ETH** from https://sepoliafaucet.com/
3. **Connect wallet** in the app
4. **Test the FHE Counter!**

---

## 🔄 Alternative: Fix Port 8545 (Advanced)

If you want to use localhost, try these solutions:

### Solution 1: Run as Administrator
1. Close all terminals
2. Right-click your terminal app → "Run as administrator"
3. Try `pnpm chain` again

### Solution 2: Check Hyper-V Port Exclusions
```powershell
# Run as Administrator
netsh interface ipv4 show excludedportrange protocol=tcp

# If 8545 is reserved, restart Windows NAT
net stop winnat
net start winnat
```

### Solution 3: Use WSL2 (Best long-term solution)
```powershell
# Install WSL2
wsl --install

# Then use Linux terminal for development
```

**Full details:** [WINDOWS_FIX.md](./WINDOWS_FIX.md)

---

## 🌐 Vercel Deployment (Production)

Once contracts are deployed to Sepolia, you can deploy to Vercel:

### Step 1: Get API Keys
- **Alchemy:** https://www.alchemy.com/ (create Sepolia app)
- **WalletConnect:** https://cloud.walletconnect.com/ (optional)

### Step 2: Deploy to Vercel
```bash
cd packages/nextjs
vercel
```

### Step 3: Add Environment Variables in Vercel
In Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_ALCHEMY_API_KEY` = your Alchemy key
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` = your WalletConnect ID

### Step 4: Redeploy
```bash
vercel --prod
```

**Full guide:** [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

## ✅ What's Been Fixed

1. **Vercel Configuration** ✅
   - Root `vercel.json` removed (was using yarn)
   - `packages/nextjs/vercel.json` updated for pnpm
   - `packageManager` field added to package.json

2. **Port Issue Documented** ✅
   - Created [WINDOWS_FIX.md](./WINDOWS_FIX.md) with multiple solutions
   - Recommended Sepolia testnet as workaround

3. **Ready for Deployment** ✅
   - All Vercel configs correct
   - Documentation complete
   - Sepolia deployment path verified

---

## 🚀 Next Steps

### For Development Right Now:
```bash
# 1. Deploy to Sepolia (one-time)
pnpm deploy:sepolia

# 2. Start frontend
pnpm start

# 3. Use Sepolia testnet in MetaMask
```

### For Production:
```bash
# Deploy to Vercel
cd packages/nextjs
vercel
```

---

## 📚 Documentation

- **[WINDOWS_FIX.md](./WINDOWS_FIX.md)** - Solve port 8545 issues
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - Original quick start (for non-Windows)

---

## 💡 Why Sepolia is Better for Now

✅ **No Windows port restrictions**
✅ **More realistic testing** (actual blockchain)
✅ **Same functionality** as localhost
✅ **Works immediately** - no troubleshooting
✅ **Free test ETH** from faucets
✅ **Same code** works for Vercel deployment

The only difference is you need test ETH and transactions take ~15 seconds instead of instant.
