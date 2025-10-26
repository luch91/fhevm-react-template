# Windows Port 8545 Issue & Solutions

## 🚨 Problem

You're encountering this error when running `pnpm chain`:

```
Error: listen EACCES: permission denied 127.0.0.1:8545
```

This is a **Windows-specific security issue** where Node.js is blocked from binding to port 8545.

## 🔍 Root Cause

Port 8545 might be:
1. **Reserved by Windows** - Some Windows systems have reserved port ranges
2. **Blocked by Windows Firewall** - Security settings preventing Node.js
3. **Restricted by Antivirus** - Security software blocking the port
4. **Hyper-V reservation** - If Hyper-V is enabled, it may reserve ports dynamically

## ✅ Solutions (Choose One)

### Solution 1: Run as Administrator (Quickest)

1. **Close all terminals**
2. **Right-click** on your terminal application (PowerShell, CMD, or Git Bash)
3. Select **"Run as administrator"**
4. Navigate to your project:
   ```powershell
   cd "c:\Users\user\Desktop\ZAMA FHE template\fhevm-react-template"
   ```
5. Try again:
   ```powershell
   pnpm chain
   ```

### Solution 2: Check Port Exclusions (Hyper-V Fix)

If you have Hyper-V or Docker Desktop installed, Windows may have dynamically reserved port 8545.

**Check reserved ports:**
```powershell
# Run as Administrator
netsh interface ipv4 show excludedportrange protocol=tcp
```

If 8545 is in the excluded range:

**Option A: Release the reservation**
```powershell
# Stop services that might reserve ports
net stop winnat
net start winnat
```

**Option B: Exclude specific ports from dynamic allocation**
```powershell
# Reserve port 8545 for your use
netsh int ipv4 add excludedportrange protocol=tcp startport=8545 numberofports=1
```

### Solution 3: Allow Node.js Through Firewall

1. **Open Windows Defender Firewall**
   - Press `Win + R`
   - Type `wf.msc` and press Enter

2. **Create Inbound Rule**
   - Click "Inbound Rules" → "New Rule"
   - Select "Program" → Next
   - Browse to your Node.js executable (usually `C:\Program Files\nodejs\node.exe`)
   - Allow the connection
   - Apply to all profiles
   - Name it "Node.js Development"

3. **Repeat for Outbound Rules**

### Solution 4: Disable Antivirus Temporarily

If you have third-party antivirus (Norton, McAfee, Kaspersky, etc.):

1. **Temporarily disable** the antivirus
2. Try running `pnpm chain` again
3. If it works, **add an exception** for Node.js in your antivirus settings
4. **Re-enable** the antivirus

### Solution 5: Use WSL2 (Recommended for Long-term)

Windows Subsystem for Linux provides a Linux environment without these Windows-specific port restrictions.

**Install WSL2:**
```powershell
# Run as Administrator
wsl --install
```

**Then in WSL2:**
```bash
cd /mnt/c/Users/user/Desktop/ZAMA\ FHE\ template/fhevm-react-template
pnpm chain
```

## 🎯 Quick Workaround: Deploy to Sepolia Instead

Skip local development and deploy directly to Sepolia testnet for now:

### Step 1: Set Hardhat Variables
```bash
cd packages/hardhat
npx hardhat vars set MNEMONIC
# Enter your 12 or 24-word wallet mnemonic

npx hardhat vars set INFURA_API_KEY
# Enter your Infura API key from https://infura.io
```

### Step 2: Deploy to Sepolia
```bash
cd ../..
pnpm deploy:sepolia
```

### Step 3: Start Frontend (Will use Sepolia)
```bash
pnpm start
```

### Step 4: Configure MetaMask
- Switch MetaMask to **Sepolia testnet**
- Get test ETH from https://sepoliafaucet.com/
- Connect and test the app!

## 🔧 After Fixing Port Issue

Once you resolve the port 8545 issue, remember to:

1. **Revert hardhat.config.ts** (if you made changes)
2. **Clean deployment artifacts:**
   ```bash
   cd packages/hardhat
   pnpm clean
   ```
3. **Restart the development workflow:**
   ```bash
   # Terminal 1
   pnpm chain

   # Terminal 2
   pnpm deploy:localhost

   # Terminal 3
   pnpm start
   ```

## 📊 Verify Port Availability

Check if port 8545 is available:

```powershell
# Check what's using port 8545
netstat -ano | findstr :8545

# If nothing appears, the port is free but blocked
# If something appears, you need to stop that process
```

Check if Node.js can bind to a test port:

```powershell
# Run as Administrator
node -e "require('net').createServer().listen(8545, '127.0.0.1', () => console.log('Port 8545 is available!'))"
```

If this works, the issue is with Hardhat specifically. If it fails, it's a Windows/Node.js permission issue.

## 🌐 Continue with Vercel Deployment

**Good News:** This local development issue **does NOT affect Vercel deployment!**

Vercel builds and runs in a Linux environment, so you can still deploy to production:

1. Deploy contracts to Sepolia (as shown in workaround above)
2. Follow the [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
3. Your production app will work perfectly!

## 📝 Recommended Path Forward

Given the Windows port restriction, here's what I recommend:

### For Development:
**Use Sepolia testnet** instead of localhost:
- No port issues
- More realistic testing environment
- Same contracts, same functionality
- Just need test ETH (free from faucets)

### For Production:
**Deploy to Vercel** using Sepolia:
- Follow [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- Set environment variables in Vercel dashboard
- Production-ready deployment!

### For Local Development Later:
- Try running as Administrator
- Or set up WSL2 for a better development experience
- Or use Docker (if you're comfortable with containers)

## 🆘 Still Having Issues?

If none of these solutions work:

1. **Check Node.js version:**
   ```bash
   node --version
   # Should be >= 18.0.0
   ```

2. **Reinstall Node.js** with administrator privileges

3. **Try a different port** (requires modifying config - not recommended for FHEVM)

4. **Use Sepolia testnet** (recommended workaround)

## 💡 Why This Happens on Windows

Windows has stricter security policies than Linux/Mac:
- Dynamic port reservation by Hyper-V
- Firewall rules more restrictive
- Some ports require elevation
- Antivirus software intercepts network operations

This is why many developers use WSL2 or Linux VMs for blockchain development on Windows.
