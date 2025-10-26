# Vercel Deployment Guide for FHEVM React Template

## Issues Fixed ✅

### 1. `pnpm chain` Not Failing - Working as Expected
The command appears to "hang" because `hardhat node` runs a persistent blockchain server. This is **correct behavior**.

**Proper Usage:**
```bash
# Terminal 1: Start the blockchain node (keep running)
pnpm chain

# Terminal 2: Deploy contracts
pnpm deploy:localhost

# Terminal 3: Start the frontend
pnpm start
```

### 2. Browser Connection - Already Configured
The hardhat config has been updated with proper network settings:
- Host: `0.0.0.0` (allows external connections)
- Port: `8545`
- Chain ID: `31337`

### 3. Vercel Configuration - Fixed
- ✅ Removed incorrect root `vercel.json`
- ✅ Updated `packages/nextjs/vercel.json` to use pnpm instead of yarn
- ✅ Configured proper build commands for monorepo structure

---

## Deploying to Vercel

### Prerequisites

Before deploying to Vercel, you need:

1. **Vercel Account** - Sign up at https://vercel.com
2. **Sepolia Testnet Deployment** - Your contracts must be deployed on Sepolia
3. **API Keys** - Alchemy API key for Sepolia RPC access
4. **Environment Variables** - Set in Vercel dashboard

---

## Step 1: Deploy Contracts to Sepolia Testnet

### 1.1 Configure Hardhat Variables

Navigate to the hardhat package:
```bash
cd packages/hardhat
```

Set up your environment variables:
```bash
npx hardhat vars set MNEMONIC
# Enter your wallet mnemonic (12 or 24 words)

npx hardhat vars set INFURA_API_KEY
# Enter your Infura API key for Sepolia
```

**Alternative:** You can also set these in `packages/hardhat/.env`:
```bash
MNEMONIC="your twelve or twenty four word mnemonic phrase here"
INFURA_API_KEY="your_infura_api_key_here"
```

### 1.2 Deploy to Sepolia

From the **root directory**:
```bash
pnpm deploy:sepolia
```

This will:
1. Deploy the `FHECounter` contract to Sepolia
2. Create deployment artifacts in `packages/hardhat/deployments/sepolia/`
3. Auto-generate `packages/nextjs/contracts/deployedContracts.ts` with Sepolia contract addresses

### 1.3 Verify Deployment

Check that `packages/nextjs/contracts/deployedContracts.ts` now includes Sepolia (chain ID: `11155111`):
```typescript
const deployedContracts = {
  31337: { /* localhost contracts */ },
  11155111: { /* Sepolia contracts */ }
}
```

---

## Step 2: Configure Environment Variables for Production

### 2.1 Get Required API Keys

1. **Alchemy API Key** (Required for production)
   - Sign up at https://www.alchemy.com/
   - Create a new app for Sepolia testnet
   - Copy your API key

2. **WalletConnect Project ID** (Optional but recommended)
   - Sign up at https://cloud.walletconnect.com/
   - Create a new project
   - Copy your Project ID

### 2.2 Update Local Environment (Optional)

Update `packages/nextjs/.env.local`:
```bash
NEXT_PUBLIC_ALCHEMY_API_KEY="your_alchemy_api_key"
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_walletconnect_project_id"
```

---

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
pnpm vercel:login
```

### 3.3 Deploy from Next.js Package Directory

Navigate to the Next.js package:
```bash
cd packages/nextjs
```

Deploy to Vercel:
```bash
vercel
```

Or use the pre-configured command:
```bash
pnpm vercel
```

Follow the prompts:
1. **Set up and deploy**: Yes
2. **Which scope**: Select your account/team
3. **Link to existing project**: No (first time) or Yes (updating)
4. **Project name**: Choose a name (e.g., `fhevm-react-template`)
5. **Directory**: `.` (current directory, which is `packages/nextjs`)

### 3.4 Configure Environment Variables in Vercel

After initial deployment, configure environment variables:

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Your Alchemy API key | Production, Preview, Development |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | Your WalletConnect Project ID | Production, Preview, Development |

**Option B: Via CLI**
```bash
vercel env add NEXT_PUBLIC_ALCHEMY_API_KEY
# Paste your Alchemy API key when prompted

vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
# Paste your WalletConnect Project ID when prompted
```

### 3.5 Redeploy with Environment Variables

After adding environment variables, trigger a new deployment:
```bash
vercel --prod
```

---

## Step 4: Verify Production Deployment

### 4.1 Check Deployment URL

Vercel will provide a URL like:
```
https://your-project-name.vercel.app
```

### 4.2 Test the Application

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Make sure MetaMask is set to Sepolia testnet
   - Approve the connection

2. **Test FHE Counter**
   - Click "Increment +1" (requires transaction on Sepolia)
   - Click "Decrement -1" (requires transaction on Sepolia)
   - Click "Decrypt Counter" (requires signature)

### 4.3 Common Issues

#### Issue: "NEXT_PUBLIC_ALCHEMY_API_KEY is required in production"
**Solution:** Add the environment variable in Vercel dashboard and redeploy

#### Issue: Contract not found or wrong address
**Solution:**
1. Make sure you deployed to Sepolia: `pnpm deploy:sepolia`
2. Verify `deployedContracts.ts` has Sepolia (11155111) contracts
3. Commit the updated `deployedContracts.ts` file
4. Redeploy to Vercel

#### Issue: Transactions failing
**Solution:**
1. Ensure you're connected to Sepolia network in MetaMask
2. Get Sepolia ETH from a faucet: https://sepoliafaucet.com/
3. Check that contract address in `deployedContracts.ts` is correct

---

## Project Structure for Deployment

```
fhevm-react-template/
├── packages/
│   ├── fhevm-sdk/              # Universal SDK (built before Next.js)
│   │   └── dist/               # Built SDK files
│   ├── hardhat/                # Smart contracts (git submodule)
│   │   ├── contracts/          # Solidity contracts
│   │   ├── deploy/             # Deploy scripts
│   │   └── deployments/        # Deployment artifacts
│   │       ├── localhost/      # Local deployments (31337)
│   │       └── sepolia/        # Sepolia deployments (11155111)
│   └── nextjs/                 # Next.js frontend (deploy this to Vercel)
│       ├── contracts/          # Auto-generated contract ABIs
│       │   └── deployedContracts.ts  # CONTRACT ADDRESSES
│       ├── vercel.json         # Vercel configuration
│       └── .env.local          # Local environment variables
└── scripts/
    └── generateTsAbis.ts       # Generates deployedContracts.ts
```

---

## Vercel Build Configuration

The `packages/nextjs/vercel.json` is configured as follows:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm install && pnpm sdk:build && cd packages/nextjs && pnpm build",
  "installCommand": "pnpm install --frozen-lockfile=false",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

This ensures:
1. ✅ pnpm is used (not yarn)
2. ✅ SDK is built before Next.js
3. ✅ Builds from monorepo root
4. ✅ Outputs to correct directory

---

## Deployment Checklist

Before deploying to Vercel:

- [ ] Contracts deployed to Sepolia testnet
- [ ] `deployedContracts.ts` includes Sepolia (11155111) chain
- [ ] Alchemy API key obtained
- [ ] WalletConnect Project ID obtained (optional)
- [ ] Environment variables configured in Vercel
- [ ] Git repository pushed to GitHub/GitLab (if using Git integration)
- [ ] `vercel.json` exists in `packages/nextjs/`
- [ ] Root `vercel.json` removed (to avoid conflicts)

---

## Continuous Deployment (Optional)

### Connect GitHub Repository to Vercel

1. Go to Vercel Dashboard
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `packages/nextjs`
   - **Build Command**: (use from vercel.json)
   - **Output Directory**: `.next`
   - **Install Command**: (use from vercel.json)

4. Add environment variables as described above
5. Deploy!

Now every push to `main` will automatically deploy to Vercel.

---

## Troubleshooting

### Build fails with "Cannot find module @fhevm/sdk"
**Cause:** SDK not built before Next.js build
**Solution:** The updated `vercel.json` includes `pnpm sdk:build` - redeploy

### Build fails with "pnpm: command not found"
**Cause:** Vercel doesn't have pnpm installed
**Solution:** Add to `package.json` in `packages/nextjs`:
```json
{
  "packageManager": "pnpm@9.0.0"
}
```

### Transactions work locally but not on Vercel
**Cause:** Using localhost contracts on production
**Solution:** Deploy to Sepolia and ensure `deployedContracts.ts` includes Sepolia

### "Invalid RPC URL" errors
**Cause:** Missing or invalid Alchemy API key
**Solution:** Verify `NEXT_PUBLIC_ALCHEMY_API_KEY` is set in Vercel environment variables

---

## Next Steps

After successful deployment:

1. **Custom Domain** - Add a custom domain in Vercel settings
2. **Monitoring** - Set up Vercel Analytics and monitoring
3. **Performance** - Enable Edge Functions if needed
4. **Security** - Review security settings and rate limiting
5. **Documentation** - Update README with production URL

---

## Additional Resources

- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Hardhat Deployment](https://hardhat.org/hardhat-runner/docs/guides/deploying)
- [Sepolia Faucet](https://sepoliafaucet.com/)

---

## Support

If you encounter issues:
1. Check the [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues)
2. Join [Zama Discord](https://discord.com/invite/zama)
3. Review [Vercel Support](https://vercel.com/support)
