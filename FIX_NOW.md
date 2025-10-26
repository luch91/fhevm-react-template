# 🔧 IMMEDIATE FIX GUIDE - Execute Now

## 🎯 Problem Identified

Your app shows this error:
```
Error: could not decode result data (value="0x", info={ "method": "getKmsSigners" }
```

**Root Cause:** Hardhat has `INFURA_API_KEY` set, but the config expects `ALCHEMY_API_KEY`

---

## ✅ THE FIX (5 Minutes)

### Step 1: Set the Correct API Key in Hardhat

```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template\packages\hardhat"

# Set Alchemy API key (matches your frontend .env.local)
npx hardhat vars set ALCHEMY_API_KEY
```

**When prompted, enter:** `aTfpJEPemo1gRVu2RLUpi`

### Step 2: Verify the Variable is Set

```bash
npx hardhat vars list
```

**Should show:**
```
ALCHEMY_API_KEY
MNEMONIC (or PRIVATE_KEY)
```

### Step 3: Delete the Old Infura Key (Optional but Recommended)

```bash
npx hardhat vars delete INFURA_API_KEY
```

### Step 4: Restart Your Frontend

```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"

# Stop current server if running (Ctrl+C)
pnpm start
```

### Step 5: Ensure MetaMask is on Sepolia

1. Open MetaMask
2. Click network dropdown
3. Select **"Sepolia test network"**
4. Verify you have test ETH (get from https://sepoliafaucet.com/ if needed)

### Step 6: Test the App

1. Go to http://localhost:3000
2. Click "Connect Wallet"
3. Approve in MetaMask

**Expected Result:**
```
🔧 FHEVM Instance
Instance Status: ✅ Connected
Status: ready
Error: No errors

📊 Counter Status
Can Get Count: ✓ true
Can Decrypt: ✓ true
Can Modify: ✓ true
```

---

## 🎉 What Changed

### ✅ Fixed Automatically (By Me)
1. ✅ Removed `chains.hardhat` from `scaffold.config.ts` (localhost not working on Windows)
2. ✅ Now only targets Sepolia network

### 🔧 You Need to Do
1. ⏰ Set `ALCHEMY_API_KEY` in Hardhat vars (Step 1 above)

---

## 🐛 If It Still Doesn't Work

### Issue: "Invalid API key" or "Unauthorized"

**Solution:** Double-check the API key:
```bash
# In Hardhat
npx hardhat vars get ALCHEMY_API_KEY

# Should match what's in packages/nextjs/.env.local:
# NEXT_PUBLIC_ALCHEMY_API_KEY="aTfpJEPemo1gRVu2RLUpi"
```

### Issue: "Insufficient funds"

**Solution:** Get Sepolia test ETH
1. Go to https://sepoliafaucet.com/
2. Paste your wallet address
3. Request ETH (wait 1-2 minutes)

### Issue: "Cannot connect to Sepolia"

**Solution:** Verify MetaMask network
1. MetaMask → Click network dropdown
2. Should show "Sepolia test network"
3. If not visible: Settings → Advanced → "Show test networks" ON

### Issue: Still shows "Instance Status: ❌ Disconnected"

**Solution:** Hard refresh
1. Close all browser tabs
2. Restart browser completely (to clear MetaMask cache)
3. Open http://localhost:3000 again
4. Reconnect wallet

---

## 📊 Quick Verification Commands

```bash
# Check Hardhat variables
cd packages/hardhat && npx hardhat vars list

# Check frontend env
cat packages/nextjs/.env.local

# Check deployed contract address
cat packages/nextjs/contracts/deployedContracts.ts | grep address

# Verify contract on Sepolia
# Open: https://sepolia.etherscan.io/address/0x32049322040a4feB2203Dd611378c3aa2988e415
```

---

## 🎯 Success Criteria

You'll know it's fixed when:

✅ FHEVM Instance shows "✅ Connected"
✅ Status shows "ready"
✅ Can Decrypt shows "✓ true"
✅ Can Modify shows "✓ true"
✅ All three buttons are enabled (not grayed out)

---

## 📚 Full Details

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for the complete analysis of what was wrong and why.

---

## 🚀 After It Works

Once the app is working:
1. Test incrementing the counter
2. Test decrementing the counter
3. Test decrypting the value
4. Follow [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) to deploy to production

---

## ⏱️ Estimated Time

- **Step 1-3:** 2 minutes (set API key)
- **Step 4:** 1 minute (restart server)
- **Step 5-6:** 2 minutes (connect & test)

**Total:** ~5 minutes

Let's fix it! 🚀
