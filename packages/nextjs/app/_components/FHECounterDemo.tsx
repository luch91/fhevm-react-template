"use client";

import { useMemo } from "react";
import { useFhevm } from "@fhevm/sdk";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useFHECounterWagmi } from "~~/hooks/fhecounter-example/useFHECounterWagmi";
import { ErrorBoundary } from "~~/components/ErrorBoundary";

/*
 * Main FHECounter React component with 3 buttons
 *  - "Decrypt" button: allows you to decrypt the current FHECounter count handle.
 *  - "Increment" button: allows you to increment the FHECounter count handle using FHE operations.
 *  - "Decrement" button: allows you to decrement the FHECounter count handle using FHE operations.
 */
export const FHECounterDemo = () => {
  const { isConnected, chain } = useAccount();

  const chainId = chain?.id;

  //////////////////////////////////////////////////////////////////////////////
  // FHEVM instance
  //////////////////////////////////////////////////////////////////////////////

  // Create EIP-1193 provider from wagmi for FHEVM
  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;

    // Get the wallet provider from window.ethereum
    return (window as any).ethereum;
  }, []);

  // CRITICAL FIX: Only use mock chains for localhost (31337), NOT for Sepolia
  // This prevents the SDK from trying to connect to localhost:8545 when on Sepolia
  const initialMockChains = useMemo(() => {
    if (chainId === 31337) {
      return { 31337: "http://localhost:8545" };
    }
    // For Sepolia (11155111) or any other network, return undefined
    return undefined;
  }, [chainId]);

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true, // use enabled to dynamically create the instance on-demand
  });

  //////////////////////////////////////////////////////////////////////////////
  // useFHECounter is a custom hook containing all the FHECounter logic, including
  // - calling the FHECounter contract
  // - encrypting FHE inputs
  // - decrypting FHE handles
  //////////////////////////////////////////////////////////////////////////////

  const fheCounter = useFHECounterWagmi({
    instance: fhevmInstance,
    initialMockChains,
  });

  //////////////////////////////////////////////////////////////////////////////
  // UI Stuff:
  // --------
  // A basic page containing
  // - A bunch of debug values allowing you to better visualize the React state
  // - 1x "Decrypt" button (to decrypt the latest FHECounter count handle)
  // - 1x "Increment" button (to increment the FHECounter)
  // - 1x "Decrement" button (to decrement the FHECounter)
  //////////////////////////////////////////////////////////////////////////////

  const buttonClass =
    "inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg " +
    "transition-all duration-200 hover:scale-105 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 " +
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  // Primary (accent) button — #FFD208 with dark text and warm hover #A38025
  const primaryButtonClass =
    buttonClass +
    " bg-[#FFD208] text-[#2D2D2D] hover:bg-[#A38025] focus-visible:ring-[#2D2D2D]  cursor-pointer";

  // Secondary (neutral dark) button — #2D2D2D with light text and accent focus
  const secondaryButtonClass =
    buttonClass +
    " bg-black text-[#F4F4F4] hover:bg-[#1F1F1F] focus-visible:ring-[#FFD208] cursor-pointer";

  // Success/confirmed state — deeper gold #A38025 with dark text
  const successButtonClass =
    buttonClass +
    " bg-[#A38025] text-[#2D2D2D] hover:bg-[#8F6E1E] focus-visible:ring-[#2D2D2D]";

  const titleClass = "font-extrabold text-black text-2xl mb-4 border-b-2 border-gray-800 pb-2";
  const sectionClass = "bg-white shadow-lg p-6 mb-6 text-gray-900 border border-gray-200";

  // Helper functions for button text
  const getDecryptButtonText = () => {
    if (fheCounter.canDecrypt) return "🔓 Decrypt Counter";
    if (fheCounter.isDecrypted) return `✅ Decrypted: ${fheCounter.clear}`;
    if (fheCounter.isDecrypting) return "⏳ Decrypting...";
    return "❌ Nothing to decrypt";
  };

  const getIncrementButtonText = () => {
    if (fheCounter.canUpdateCounter) return "➕ Increment +1";
    if (fheCounter.isProcessing) return "⏳ Processing...";
    return "❌ Cannot increment";
  };

  const getDecrementButtonText = () => {
    if (fheCounter.canUpdateCounter) return "➖ Decrement -1";
    if (fheCounter.isProcessing) return "⏳ Processing...";
    return "❌ Cannot decrement";
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-gray-900">
        <div className="flex items-center justify-center">
          <div className="bg-white border border-gray-200 shadow-xl p-8 text-center rounded-lg">
            <div className="mb-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-900/30 text-amber-400 text-3xl">
                ⚠️
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-black mb-3">Wallet not connected</h2>
            <p className="text-lg text-gray-700 font-medium mb-6">Connect your wallet to use the FHE Counter demo.</p>
            <div className="flex items-center justify-center">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto p-6 space-y-6 text-gray-900">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold mb-3 text-black">FHE Counter Demo</h1>
        <p className="text-lg text-gray-700 font-medium">Interact with the Fully Homomorphic Encryption Counter contract</p>
      </div>

      {/* Count Handle Display */}
      <div className={sectionClass}>
        <h3 className={titleClass}>🔢 Count Handle</h3>
        <div className="space-y-3 space-x-3">
          {printProperty("Encrypted Handle", fheCounter.handle || "No handle available")}
          {printProperty("Decrypted Value", fheCounter.isDecrypted ? fheCounter.clear : "Not decrypted yet")}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
        <button
          className={fheCounter.isDecrypted ? successButtonClass : primaryButtonClass}
          disabled={!fheCounter.canDecrypt}
          onClick={fheCounter.decryptCountHandle}
        >
          {getDecryptButtonText()}
        </button>

        <button
          className={secondaryButtonClass}
          disabled={!fheCounter.canUpdateCounter}
          onClick={() => fheCounter.updateCounter(+1)}
        >
          {getIncrementButtonText()}
        </button>

        <button
          className={secondaryButtonClass}
          disabled={!fheCounter.canUpdateCounter}
          onClick={() => fheCounter.updateCounter(-1)}
        >
          {getDecrementButtonText()}
        </button>
      </div>

      {/* Messages */}
      {fheCounter.message && (
        <div className={sectionClass}>
          <h3 className={titleClass}>💬 Messages</h3>
          <div className="bg-gray-50 border border-gray-300 p-4 rounded">
            <p className="text-gray-900 font-medium">{fheCounter.message}</p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={sectionClass}>
          <h3 className={titleClass}>🔧 FHEVM Instance</h3>
          <div className="space-y-3">
            {printProperty("Instance Status", fhevmInstance ? "✅ Connected" : "❌ Disconnected")}
            {printProperty("Status", fhevmStatus)}
            {printProperty("Error", fhevmError ?? "No errors")}
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className={titleClass}>📊 Counter Status</h3>
          <div className="space-y-3">
            {printProperty("Refreshing", fheCounter.isRefreshing)}
            {printProperty("Decrypting", fheCounter.isDecrypting)}
            {printProperty("Processing", fheCounter.isProcessing)}
            {printProperty("Can Get Count", fheCounter.canGetCount)}
            {printProperty("Can Decrypt", fheCounter.canDecrypt)}
            {printProperty("Can Modify", fheCounter.canUpdateCounter)}
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 border border-gray-300 rounded w-full">
      <span className="text-black font-semibold text-base">{name}</span>
      <span className="ml-2 font-mono text-sm font-bold text-black bg-gray-200 px-3 py-1.5 border border-gray-400 rounded">
        {displayValue}
      </span>
    </div>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 border border-gray-300 rounded w-full">
      <span className="text-black font-semibold text-base">{name}</span>
      <span
        className={`font-mono text-sm font-bold px-3 py-1.5 border rounded ${
          value
            ? "text-green-900 bg-green-100 border-green-400"
            : "text-red-900 bg-red-100 border-red-400"
        }`}
      >
        {value ? "✓ true" : "✗ false"}
      </span>
    </div>
  );
}
