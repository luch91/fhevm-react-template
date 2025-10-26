/**
 * React hook for FHEVM encryption
 *
 * Provides encryption capabilities with React state management
 */
"use client";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { EncryptionBuilder } from "../core/EncryptionBuilder";
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
export function useFhevmEncrypt(options) {
    const { instance, signer, contractAddress } = options;
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [error, setError] = useState(undefined);
    const abortControllerRef = useRef(null);
    // Check if encryption is available
    const canEncrypt = useMemo(() => Boolean(instance && signer && contractAddress), [instance, signer, contractAddress]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Cancel any pending encryption on unmount
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    // Create builder
    const createBuilder = useCallback(async () => {
        if (!instance || !signer || !contractAddress) {
            throw new Error("Cannot create encryption builder: missing instance, signer, or contract address");
        }
        const userAddress = await signer.getAddress();
        return new EncryptionBuilder(instance, contractAddress, userAddress);
    }, [instance, signer, contractAddress]);
    /**
     * Internal method to perform encryption with common error handling
     * @private
     */
    const performEncryption = useCallback(async (fn, encryptMethod) => {
        if (!canEncrypt) {
            throw new Error("Cannot encrypt: missing instance, signer, or contract address");
        }
        // Cancel any existing encryption
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // Create new abort controller for this operation
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        setIsEncrypting(true);
        setError(undefined);
        try {
            const builder = await createBuilder();
            // Check if aborted
            if (abortController.signal.aborted) {
                throw new Error("Encryption was cancelled");
            }
            await fn(builder);
            // Check if aborted after builder function
            if (abortController.signal.aborted) {
                throw new Error("Encryption was cancelled");
            }
            const result = await encryptMethod(builder);
            // Check if aborted after encryption
            if (abortController.signal.aborted) {
                throw new Error("Encryption was cancelled");
            }
            return result;
        }
        catch (err) {
            // Don't set error if operation was aborted
            if (!abortController.signal.aborted) {
                const error = err instanceof Error ? err : new Error("Encryption failed");
                setError(error);
                throw error;
            }
            throw new Error("Encryption was cancelled");
        }
        finally {
            // Only clear encrypting state if this abort controller is still current
            if (abortControllerRef.current === abortController) {
                setIsEncrypting(false);
                abortControllerRef.current = null;
            }
        }
    }, [canEncrypt, createBuilder]);
    // Encrypt with builder function
    const encrypt = useCallback(async (fn) => {
        return performEncryption(fn, (builder) => builder.encrypt());
    }, [performEncryption]);
    // Encrypt to hex
    const encryptToHex = useCallback(async (fn) => {
        return performEncryption(fn, (builder) => builder.encryptToHex());
    }, [performEncryption]);
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
