# Using Private Key Instead of Mnemonic

## ✅ YES - You Can Use a Private Key!

I've updated the Hardhat configuration to support **both** private keys and mnemonics. Private key takes precedence if both are set.

---

## 🔑 How to Get Your Private Key

### Option 1: Export from MetaMask

1. **Open MetaMask**
2. Click the **three dots** (⋮) next to your account name
3. Select **"Account details"**
4. Click **"Show private key"**
5. Enter your MetaMask password
6. Click to reveal and **copy** the private key
   - It's a 64-character hex string starting with `0x`
   - Example: `0x1234567890abcdef...`

⚠️ **NEVER share this with anyone!** It gives complete access to your wallet.

### Option 2: Create a New Test Wallet

For safety, create a dedicated test wallet:

1. **In MetaMask**: Add account → Create new account
2. Export its private key (steps above)
3. Fund it with Sepolia test ETH from https://sepoliafaucet.com/
4. Use this wallet's private key for development

---

## ⚙️ Setup with Private Key

### Step 1: Set Your Private Key in Hardhat

```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template\packages\hardhat"

# Set your private key
npx hardhat vars set PRIVATE_KEY
# When prompted, paste your private key (with or without 0x prefix)

# Set your Alchemy API key
npx hardhat vars set ALCHEMY_API_KEY
# Paste: aTfpJEPemo1gRVu2RLUpi
```

**Important Format Notes:**
- Include the `0x` prefix: `0x1234...`
- If you forget `0x`, Hardhat will add it automatically
- Keep it as one line, no spaces

### Step 2: Verify Configuration

```bash
npx hardhat vars list
```

Should show:
```
PRIVATE_KEY: <hidden>
ALCHEMY_API_KEY: <hidden>
```

If you see `MNEMONIC` listed too, that's fine - private key takes priority.

### Step 3: Deploy to Sepolia

```bash
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"
pnpm deploy:sepolia
```

**Expected Output:**
```
Deploying from account: 0xYourAddress (derived from private key)
deploying "FHECounter" (tx: 0x...)
✅ Contract deployed successfully
```

### Step 4: Start the Frontend

```bash
pnpm start
```

Open http://localhost:3000 and connect with the **same wallet** you used for the private key!

---

## 🆚 Private Key vs Mnemonic

### Private Key (Recommended for Single Account)
✅ **More secure** - only exposes one account
✅ **Simpler** - just one string to manage
✅ **Faster** - no derivation needed
❌ Only gives you **one account** (index 0)

### Mnemonic (Better for Multiple Accounts)
✅ Generates **10 accounts** (index 0-9)
✅ **Reproducible** - same mnemonic = same accounts
❌ **More sensitive** - exposes all derived accounts
❌ Longer to type/copy

### Configuration Priority

The config works like this:

```typescript
if (PRIVATE_KEY is set and not empty) {
  use PRIVATE_KEY  // ← Takes priority!
} else {
  use MNEMONIC (with 10 derived accounts)
}
```

---

## 🔄 Switching Between Private Key and Mnemonic

### To Use Private Key
```bash
npx hardhat vars set PRIVATE_KEY
# Enter your private key
```

### To Use Mnemonic Instead
```bash
# Delete the private key variable
npx hardhat vars delete PRIVATE_KEY

# Set mnemonic (if not already set)
npx hardhat vars set MNEMONIC
# Enter your 12-word phrase
```

### To Check Which Is Set
```bash
npx hardhat vars list
```

---

## 📋 Complete Setup Example

Here's a complete walkthrough using private key:

```bash
# 1. Navigate to hardhat package
cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template\packages\hardhat"

# 2. Set your private key (from MetaMask)
npx hardhat vars set PRIVATE_KEY
# Paste: 0xYourPrivateKeyHere

# 3. Set Alchemy API key
npx hardhat vars set ALCHEMY_API_KEY
# Paste: aTfpJEPemo1gRVu2RLUpi

# 4. Verify settings
npx hardhat vars list

# 5. Go back to root
cd ../..

# 6. Deploy to Sepolia
pnpm deploy:sepolia

# 7. Start frontend
pnpm start

# 8. In MetaMask:
#    - Switch to Sepolia testnet
#    - Make sure you're on the account that matches the private key
#    - Connect to the app at http://localhost:3000
```

---

## 🎯 Which Account Will Be Used?

### With Private Key:
- **Deployer:** The account derived from your private key
- **Only one account** available
- **Safer** - only this account is exposed

### With Mnemonic:
- **Deployer:** First account (index 0) from mnemonic
- **10 accounts** available (index 0-9)
- All accounts can interact with contracts

---

## 🔒 Security Best Practices

### ✅ DO:
- Use a **separate test wallet** for development
- Store private keys in Hardhat vars (encrypted locally)
- Get Sepolia test ETH (has no real value)
- Use private key for **single-account deployments**

### ❌ DON'T:
- Share your private key with anyone
- Commit private keys to git
- Use your main wallet with real assets
- Store keys in plaintext files
- Share screenshots showing your private key

### 🔐 Where Keys Are Stored:

**Hardhat vars:**
- Stored locally in `~/.hardhat/vars.json`
- Encrypted on your machine
- Not committed to git
- Specific to your computer

**Never store in:**
- `.env` files (can be accidentally committed)
- Source code
- Documentation
- Screenshots or logs

---

## 🐛 Troubleshooting

### "Error: invalid private key"
**Solution:**
- Ensure it's 64 hex characters (0-9, a-f)
- Include `0x` prefix
- No spaces or line breaks
- Copy the entire key from MetaMask

### "Insufficient funds"
**Solution:**
- Get Sepolia ETH from https://sepoliafaucet.com/
- Make sure you're using the address that matches your private key
- Check balance: Go to https://sepolia.etherscan.io/ and paste your address

### "Wrong account in MetaMask"
**Solution:**
- The wallet you use in MetaMask must match the private key you set
- Check deployer address after deployment
- Switch MetaMask account to match

### "Private key not working"
**Solution:**
```bash
# Delete and re-set
npx hardhat vars delete PRIVATE_KEY
npx hardhat vars set PRIVATE_KEY
# Paste key again carefully

# Verify it's set
npx hardhat vars list
```

---

## 🌐 Next Steps

Once deployment works with your private key:

1. **Test locally:** Make sure increment/decrement/decrypt work
2. **Deploy to Vercel:** Follow [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
3. **Set environment variables** in Vercel dashboard
4. **Production ready!** 🚀

---

## 📚 Related Documentation

- **[SETUP_STEPS.md](./SETUP_STEPS.md)** - Complete setup guide (now supports private key!)
- **[WINDOWS_FIX.md](./WINDOWS_FIX.md)** - Fix localhost port issues
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Deploy to production

---

## ✅ Quick Reference

### Get Your Private Key:
```
MetaMask → ⋮ (menu) → Account details → Show private key
```

### Set It in Hardhat:
```bash
npx hardhat vars set PRIVATE_KEY
# Paste your private key
```

### Deploy with It:
```bash
pnpm deploy:sepolia
```

### Use Same Account in App:
Switch MetaMask to the account that matches your private key!

---

## 🎊 You're All Set!

Private key setup is simpler and more secure for single-account deployments. Perfect for testing and development on Sepolia! 🚀
