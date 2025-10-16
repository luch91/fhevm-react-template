/**
 * useFHECounterNew - Enhanced FHE Counter hook using the new SDK
 *
 * This demonstrates the improved SDK with:
 * - State machine-based FHEVM client
 * - Fluent encryption builder API
 * - Smart decryption with caching
 * - Better error handling
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useFhevmClient, useFhevmEncrypt, useFhevmDecrypt } from "@fhevm/sdk/react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import type { AllowedChainIds } from "~~/utils/helper/networks";

export interface UseFHECounterNewParams {
  provider: any;
  chainId: number | undefined;
  initialMockChains?: Record<number, string>;
}

export function useFHECounterNew(params: UseFHECounterNewParams) {
  const { provider, chainId, initialMockChains } = params;
  const [message, setMessage] = useState<string>("");

  // Get ethers signer from wagmi
  const { ethersSigner } = useWagmiEthers(initialMockChains);

  // Get deployed contract info
  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: contractInfo } = useDeployedContractInfo({
    contractName: "FHECounter",
    chainId: allowedChainId,
  });

  const contractAddress = contractInfo?.address as `0x${string}` | undefined;

  // ============================================================================
  // NEW SDK: Initialize FHEVM client with state machine
  // ============================================================================

  const {
    instance,
    isReady: fhevmReady,
    isInitializing: fhevmInitializing,
    isError: fhevmError,
    error: fhevmErrorMessage,
  } = useFhevmClient({
    provider,
    chainId: chainId || 0,
    mockChains: initialMockChains,
    enabled: Boolean(provider && chainId),
  });

  // ============================================================================
  // NEW SDK: Setup encryption with fluent builder
  // ============================================================================

  const {
    encryptToHex,
    isEncrypting,
    error: encryptError,
  } = useFhevmEncrypt({
    instance,
    signer: ethersSigner,
    contractAddress,
  });

  // ============================================================================
  // NEW SDK: Setup decryption with smart caching
  // ============================================================================

  const {
    decrypt: decryptValue,
    isDecrypting,
    error: decryptError,
  } = useFhevmDecrypt({
    instance,
    signer: ethersSigner,
  });

  // ============================================================================
  // Contract Interactions: Read counter
  // ============================================================================

  const {
    data: encryptedHandle,
    refetch: refetchHandle,
    isFetching: isFetchingHandle,
  } = useReadContract({
    address: contractAddress,
    abi: contractInfo?.abi,
    functionName: "getCount",
    query: {
      enabled: Boolean(contractAddress && contractInfo?.abi),
    },
  });

  const handleString = encryptedHandle as string | undefined;

  // ============================================================================
  // Decryption State
  // ============================================================================

  const [decryptedValue, setDecryptedValue] = useState<bigint | undefined>();
  const [lastDecryptedHandle, setLastDecryptedHandle] = useState<string | undefined>();

  const isDecrypted = Boolean(
    handleString &&
    lastDecryptedHandle === handleString &&
    decryptedValue !== undefined
  );

  const handleDecrypt = useCallback(async () => {
    if (!handleString || !contractAddress) {
      setMessage("No handle to decrypt");
      return;
    }

    try {
      setMessage("Decrypting counter value...");
      const value = await decryptValue({
        handle: handleString,
        contractAddress,
      });

      setDecryptedValue(value as bigint);
      setLastDecryptedHandle(handleString);
      setMessage(`Decrypted value: ${value}`);
    } catch (error) {
      setMessage(`Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [handleString, contractAddress, decryptValue]);

  // ============================================================================
  // Contract Interactions: Write (increment/decrement)
  // ============================================================================

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isTxPending } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  });

  const isProcessing = isWritePending || isTxPending || isEncrypting;

  const updateCounter = useCallback(
    async (delta: number) => {
      if (!contractInfo || !contractAddress || isProcessing) {
        return;
      }

      try {
        const operation = delta > 0 ? "increment" : "decrement";
        const absValue = Math.abs(delta);

        setMessage(`Encrypting ${operation} value (${absValue})...`);

        // NEW SDK: Use fluent encryption builder
        const encrypted = await encryptToHex((builder) => {
          builder.addUint8(absValue);
        });

        setMessage(`Sending ${operation} transaction...`);

        // Send transaction
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: contractInfo.abi,
          functionName: operation,
          args: [encrypted.handles[0], encrypted.inputProof],
        });

        setLastTxHash(hash);
        setMessage(`Transaction sent: ${hash.slice(0, 10)}...`);

        // Clear decrypted value (counter changed)
        setDecryptedValue(undefined);
        setLastDecryptedHandle(undefined);

        // Wait a moment then refetch
        setTimeout(() => {
          refetchHandle();
          setMessage(`${operation} completed!`);
        }, 2000);
      } catch (error) {
        setMessage(
          `Update failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
    [
      contractInfo,
      contractAddress,
      isProcessing,
      encryptToHex,
      writeContractAsync,
      refetchHandle,
    ]
  );

  // ============================================================================
  // Auto-update message from errors
  // ============================================================================

  useEffect(() => {
    if (encryptError) {
      setMessage(`Encryption error: ${encryptError.message}`);
    }
  }, [encryptError]);

  useEffect(() => {
    if (decryptError) {
      setMessage(`Decryption error: ${decryptError.message}`);
    }
  }, [decryptError]);

  useEffect(() => {
    if (fhevmErrorMessage) {
      setMessage(`FHEVM error: ${fhevmErrorMessage.message}`);
    }
  }, [fhevmErrorMessage]);

  // ============================================================================
  // Return unified interface
  // ============================================================================

  return {
    // Contract info
    contractAddress,

    // FHEVM state
    fhevmReady,
    fhevmInitializing,
    fhevmError,

    // Counter data
    handle: handleString,
    clear: decryptedValue,
    isDecrypted,

    // Actions
    updateCounter,
    decryptCountHandle: handleDecrypt,
    refreshCountHandle: refetchHandle,

    // Loading states
    isRefreshing: isFetchingHandle,
    isDecrypting,
    isProcessing,

    // Capabilities
    canGetCount: Boolean(contractAddress && !isFetchingHandle),
    canDecrypt: Boolean(handleString && fhevmReady && !isDecrypting),
    canUpdateCounter: Boolean(contractAddress && fhevmReady && !isProcessing),

    // Messages
    message,
  };
}
