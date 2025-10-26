# Complete Setup Steps - Your Configuration

## Summary of Answers

### 1. Which Mnemonic?
**Use YOUR wallet's mnemonic** (the one you've been using with MetaMask)
- This wallet will deploy and own the contracts
- Needs Sepolia test ETH (get from faucets)
- For safety, consider creating a separate test wallet

### 2. API Keys
**NO new keys needed!** You already have Alchemy API key: `aTfpJEPemo1gRVu2RLUpi`
- I've updated hardhat.config.ts to use Alchemy instead of Infura
- Same key works for both deployment and frontend

### 3. Localhost vs Sepolia
**Use Sepolia exclusively for now** because:
- ✅ Bypasses Windows port 8545 blockage
- ✅ Works immediately without troubleshooting
- ✅ Same as production deployment
- ⏰ Fix localhost later (see WINDOWS_FIX.md)

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Wallet Credentials

**🔑 You can use EITHER a Private Key OR Mnemonic (Private Key is simpler!)**

#### Option A: Use Private Key (Recommended - Simpler & More Secure)
1. Open MetaMask
2. Click **⋮** (three dots) next to your account name
3. Select **"Account details"**
4. Click **"Show private key"**
5. Enter your password
6. Copy the private key (starts with `0x`)

📖 **See [PRIVATE_KEY_SETUP.md](./PRIVATE_KEY_SETUP.md) for detailed private key guide**

#### Option B: Use Mnemonic (If you need multiple accounts)
1. Open MetaMask
2. Click menu (3 dots) → Settings → Security & Privacy
3. Click "Reveal Secret Recovery Phrase"
4. Enter password
5. Copy all 12 words

#### Option C: Create New Test Wallet (Safest for Development)
1. In MetaMask: Click account icon → Add account → Create new wallet
2. Export the private key (Option A steps) OR save the mnemonic
3. Get free Sepolia ETH:
   - Copy your new wallet address
   - Go to https://sepoliafaucet.com/
   - Paste address and request ETH
   - Wait ~1 minute for ETH to arrive

### Step 2: Configure Hardhat Variables

Open terminal and run:

```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template\packages\hardhat"

# Option A: Use Private Key (RECOMMENDED - simpler!)
npx hardhat vars set PRIVATE_KEY
# When prompted, paste your private key (with 0x prefix)

# Option B: Use Mnemonic (if you prefer)
npx hardhat vars set MNEMONIC
# When prompted, paste your 12-word mnemonic phrase

# Set your Alchemy API key (required for both options)
npx hardhat vars set ALCHEMY_API_KEY
# When prompted, paste: aTfpJEPemo1gRVu2RLUpi
```

**Verify the vars are set:**
```bash
npx hardhat vars list
```

Should show (if using private key):
```
PRIVATE_KEY: <hidden>
ALCHEMY_API_KEY: <hidden>
```

Or (if using mnemonic):
```
MNEMONIC: <hidden>
ALCHEMY_API_KEY: <hidden>
```

**Note:** If both are set, private key takes priority.

### Step 3: Deploy Contracts to Sepolia

```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"
pnpm deploy:sepolia
```

**Expected Output:**
```
deploying "FHECounter" (tx: 0x...)
FHECounter deployed at 0x... with ... gas
✅ Contract deployed successfully
📝 Updated TypeScript contract definition file
```

**This creates:**
- Deployment artifacts in `packages/hardhat/deployments/sepolia/`
- Updated contract ABIs in `packages/nextjs/contracts/deployedContracts.ts`

### Step 4: Start the Frontend

```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"
pnpm start
```

**Expected:**
```
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### Step 5: Configure MetaMask

1. **Switch to Sepolia Network:**
   - Open MetaMask
   - Click network dropdown
   - Select "Sepolia test network"
   - (If not visible: Settings → Advanced → Show test networks: ON)

2. **Verify you have Sepolia ETH:**
   - Should show ETH balance (e.g., "0.5 ETH")
   - If zero, get more from https://sepoliafaucet.com/

3. **Open the App:**
   - Go to http://localhost:3000
   - Click "Connect Wallet"
   - Approve MetaMask connection

### Step 6: Test the FHE Counter

1. **Increment the counter:**
   - Click "➕ Increment +1"
   - Approve transaction in MetaMask
   - Wait ~15 seconds for confirmation
   - ✅ Should see "Processing..." then success

2. **Decrypt the counter:**
   - Click "🔓 Decrypt Counter"
   - Sign message in MetaMask (free, no gas)
   - Should see decrypted value (e.g., "1")

3. **Decrement the counter:**
   - Click "➖ Decrement -1"
   - Approve transaction
   - Wait for confirmation

---

## 🎯 Expected Results

After successful setup, your app should show:

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

## 🐛 Troubleshooting

### "Not enough funds" error
**Solution:** Get Sepolia ETH from https://sepoliafaucet.com/

### "Invalid mnemonic" or "Invalid private key"
**Solution (Mnemonic):** Make sure you copied all 12 words correctly, separated by single spaces

**Solution (Private Key):**
- Ensure it's 64 hex characters (0-9, a-f)
- Include `0x` prefix
- No spaces or line breaks
- See [PRIVATE_KEY_SETUP.md](./PRIVATE_KEY_SETUP.md) for troubleshooting

### "Cannot connect to Sepolia"
**Solution:** Verify Alchemy API key is correct: `aTfpJEPemo1gRVu2RLUpi`

### "Contract not found"
**Solution:**
1. Check `packages/nextjs/contracts/deployedContracts.ts` has Sepolia (11155111)
2. Re-run: `pnpm deploy:sepolia`

### "Transaction failed"
**Solution:**
1. Make sure MetaMask is on **Sepolia network**
2. Make sure you have enough Sepolia ETH
3. Check you're using the same wallet that deployed the contract

---

## 🌐 Next: Deploy to Vercel

Once Sepolia is working locally, you can deploy to production:

### Step 1: Get Alchemy Sepolia URL
1. Go to https://dashboard.alchemy.com/
2. Find your app
3. Copy the Sepolia endpoint URL (or just use your existing key)

### Step 2: Deploy to Vercel
```bash
cd packages/nextjs
vercel
```

### Step 3: Set Environment Variables in Vercel
In Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | `aTfpJEPemo1gRVu2RLUpi` |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | `1dc2ac5e030458ed33033e3909f45c46` |

### Step 4: Redeploy
```bash
vercel --prod
```

**Your app is now live on Vercel using Sepolia testnet!** 🎉

---

## 📚 Additional Resources

- **[PRIVATE_KEY_SETUP.md](./PRIVATE_KEY_SETUP.md)** - Use private key instead of mnemonic (recommended!)
- **[WINDOWS_FIX.md](./WINDOWS_FIX.md)** - Fix localhost port 8545 issue (for later)
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Detailed deployment guide
- **[Sepolia Faucet](https://sepoliafaucet.com/)** - Get free test ETH
- **[Alchemy Dashboard](https://dashboard.alchemy.com/)** - Manage your API keys

---

## 🔑 Security Reminders

- ⚠️ Never share your mnemonic phrase
- ⚠️ Use a separate test wallet for development
- ⚠️ Don't commit .env files to git
- ⚠️ Hardhat vars are stored locally in `~/.hardhat/vars.json`
- ✅ API keys can be shared (they're meant for frontend use)
- ✅ Sepolia ETH has no real value - safe to use

---

## ✅ Checklist

Before starting:
- [ ] Have MetaMask installed
- [ ] Have a wallet with Sepolia test ETH (or plan to get it)
- [ ] Have your Alchemy API key: `aTfpJEPemo1gRVu2RLUpi`
- [ ] Hardhat config updated to use Alchemy (already done ✓)

Setup complete when:
- [ ] Hardhat vars configured (MNEMONIC, ALCHEMY_API_KEY)
- [ ] Contracts deployed to Sepolia
- [ ] Frontend running on localhost:3000
- [ ] MetaMask connected to Sepolia network
- [ ] Can increment/decrement/decrypt counter

---

## 🎊 You're Ready!

Follow the steps above, and your app will be working on Sepolia testnet, ready for Vercel deployment!
