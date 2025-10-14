/**
 * React hook for FHEVM encryption
 *
 * Provides encryption capabilities with React state management
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import type { FhevmInstance } from "../fhevmTypes";
import type { JsonRpcSigner } from "ethers";
import { EncryptionBuilder, type EncryptedInput } from "../core/EncryptionBuilder";

export interface UseFhevmEncryptOptions {
  /**
   * FHEVM instance (from useFhevmClient)
   */
  instance: FhevmInstance | undefined;

  /**
   * Ethers signer for getting user address
   */
  signer: JsonRpcSigner | undefined;

  /**
   * Contract address to encrypt for
   */
  contractAddress: `0x${string}` | undefined;
}

export interface UseFhevmEncryptResult {
  /**
   * Whether encryption is ready to use
   */
  canEncrypt: boolean;

  /**
   * Whether currently encrypting
   */
  isEncrypting: boolean;

  /**
   * Last encryption error
   */
  error: Error | undefined;

  /**
   * Create an encryption builder
   *
   * @example
   * ```ts
   * const encrypted = await createEncryptionBuilder()
   *   .addUint8(42)
   *   .addAddress(userAddress)
   *   .encrypt();
   * ```
   */
  createBuilder: () => Promise<EncryptionBuilder>;

  /**
   * Encrypt values using a builder function
   *
   * @example
   * ```ts
   * const encrypted = await encrypt((builder) => {
   *   builder.addUint8(42);
   *   builder.addAddress(userAddress);
   * });
   * ```
   */
  encrypt: (
    fn: (builder: EncryptionBuilder) => void | Promise<void>
  ) => Promise<EncryptedInput>;

  /**
   * Encrypt and get hex-encoded result
   */
  encryptToHex: (
    fn: (builder: EncryptionBuilder) => void | Promise<void>
  ) => Promise<{ handles: `0x${string}`[]; inputProof: `0x${string}` }>;

  /**
   * Clear the last error
   */
  clearError: () => void;
}

/**
 * Hook for encrypting data with FHEVM
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { instance } = useFhevmClient({ provider, chainId });
 *   const { encrypt, isEncrypting } = useFhevmEncrypt({
 *     instance,
 *     signer,
 *     contractAddress: '0x...'
 *   });
 *
 *   const handleSubmit = async () => {
 *     const encrypted = await encrypt((builder) => {
 *       builder.addUint8(42);
 *     });
 *
 *     await contract.myFunction(encrypted.handles[0], encrypted.inputProof);
 *   };
 *
 *   return (
 *     <button onClick={handleSubmit} disabled={isEncrypting}>
 *       Submit
 *     </button>
 *   );
 * }
 * ```
 */
export function useFhevmEncrypt(
  options: UseFhevmEncryptOptions
): UseFhevmEncryptResult {
  const { instance, signer, contractAddress } = options;

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Check if encryption is available
  const canEncrypt = useMemo(
    () => Boolean(instance && signer && contractAddress),
    [instance, signer, contractAddress]
  );

  // Create builder
  const createBuilder = useCallback(async (): Promise<EncryptionBuilder> => {
    if (!instance || !signer || !contractAddress) {
      throw new Error(
        "Cannot create encryption builder: missing instance, signer, or contract address"
      );
    }

    const userAddress = await signer.getAddress();
    return new EncryptionBuilder(instance, contractAddress, userAddress);
  }, [instance, signer, contractAddress]);

  // Encrypt with builder function
  const encrypt = useCallback(
    async (
      fn: (builder: EncryptionBuilder) => void | Promise<void>
    ): Promise<EncryptedInput> => {
      if (!canEncrypt) {
        throw new Error(
          "Cannot encrypt: missing instance, signer, or contract address"
        );
      }

      setIsEncrypting(true);
      setError(undefined);

      try {
        const builder = await createBuilder();
        await fn(builder);
        const result = await builder.encrypt();
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Encryption failed");
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [canEncrypt, createBuilder]
  );

  // Encrypt to hex
  const encryptToHex = useCallback(
    async (
      fn: (builder: EncryptionBuilder) => void | Promise<void>
    ): Promise<{ handles: `0x${string}`[]; inputProof: `0x${string}` }> => {
      if (!canEncrypt) {
        throw new Error(
          "Cannot encrypt: missing instance, signer, or contract address"
        );
      }

      setIsEncrypting(true);
      setError(undefined);

      try {
        const builder = await createBuilder();
        await fn(builder);
        const result = await builder.encryptToHex();
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Encryption failed");
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [canEncrypt, createBuilder]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  return {
    canEncrypt,
    isEncrypting,
    error,
    createBuilder,
    encrypt,
    encryptToHex,
    clearError,
  };
}
