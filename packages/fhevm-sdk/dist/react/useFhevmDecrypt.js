/**
 * React hook for FHEVM decryption
 *
 * Provides decryption capabilities with React state management
 */
"use client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { DecryptionHandler, } from "../core/DecryptionHandler";
/**
 * Hook for decrypting FHEVM encrypted values
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { instance } = useFhevmClient({ provider, chainId });
 *   const { decrypt, isDecrypting, error } = useFhevmDecrypt({
 *     instance,
 *     signer
 *   });
 *
 *   const [value, setValue] = useState<bigint>();
 *
 *   const handleDecrypt = async () => {
 *     const decrypted = await decrypt({
 *       handle: '0x123...',
 *       contractAddress: '0xabc...'
 *     });
 *     setValue(decrypted as bigint);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleDecrypt} disabled={isDecrypting}>
 *         Decrypt
 *       </button>
 *       {value && <p>Value: {value.toString()}</p>}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFhevmDecrypt(options) {
    const { instance, signer, storage, keypair } = options;
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [error, setError] = useState(undefined);
    const [handler, setHandler] = useState(undefined);
    // Store storage and keypair in refs to prevent recreation on every render
    const storageRef = useRef(storage);
    const keypairRef = useRef(keypair);
    // Update refs when storage/keypair change (allow intentional updates)
    useEffect(() => {
        storageRef.current = storage;
    }, [storage]);
    useEffect(() => {
        keypairRef.current = keypair;
    }, [keypair]);
    // Check if decryption is available
    const canDecrypt = useMemo(() => Boolean(instance && signer && handler), [instance, signer, handler]);
    // Create handler when instance and signer are available
    // Only recreate when instance or signer actually change
    useEffect(() => {
        if (instance && signer) {
            const newHandler = new DecryptionHandler(instance, signer, {
                storage: storageRef.current,
                keypair: keypairRef.current,
            });
            setHandler(newHandler);
        }
        else {
            setHandler(undefined);
        }
        // Cleanup handler on unmount or when dependencies change
        return () => {
            // Future: Add cleanup method to DecryptionHandler if needed
        };
    }, [instance, signer]); // Only instance and signer in deps
    // Decrypt single value
    const decrypt = useCallback(async (request) => {
        if (!handler) {
            throw new Error("Cannot decrypt: handler not initialized");
        }
        setIsDecrypting(true);
        setError(undefined);
        try {
            const result = await handler.decrypt(request);
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error("Decryption failed");
            setError(error);
            throw error;
        }
        finally {
            setIsDecrypting(false);
        }
    }, [handler]);
    // Decrypt multiple values
    const decryptMany = useCallback(async (requests) => {
        if (!handler) {
            throw new Error("Cannot decrypt: handler not initialized");
        }
        setIsDecrypting(true);
        setError(undefined);
        try {
            const result = await handler.decryptMany(requests);
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error("Decryption failed");
            setError(error);
            throw error;
        }
        finally {
            setIsDecrypting(false);
        }
    }, [handler]);
    // Decrypt many ordered
    const decryptManyOrdered = useCallback(async (requests) => {
        if (!handler) {
            throw new Error("Cannot decrypt: handler not initialized");
        }
        setIsDecrypting(true);
        setError(undefined);
        try {
            const result = await handler.decryptManyOrdered(requests);
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error("Decryption failed");
            setError(error);
            throw error;
        }
        finally {
            setIsDecrypting(false);
        }
    }, [handler]);
    // Preload signature
    const preloadSignature = useCallback(async (contractAddresses) => {
        if (!handler) {
            throw new Error("Cannot preload signature: handler not initialized");
        }
        try {
            await handler.preloadSignature(contractAddresses);
        }
        catch (err) {
            const error = err instanceof Error
                ? err
                : new Error("Failed to preload signature");
            setError(error);
            throw error;
        }
    }, [handler]);
    // Check valid signature
    const hasValidSignature = useCallback(async (contractAddresses) => {
        if (!handler) {
            return false;
        }
        try {
            return await handler.hasValidSignature(contractAddresses);
        }
        catch {
            return false;
        }
    }, [handler]);
    // Clear error
    const clearError = useCallback(() => {
        setError(undefined);
    }, []);
    return {
        canDecrypt,
        isDecrypting,
        error,
        decrypt,
        decryptMany,
        decryptManyOrdered,
        preloadSignature,
        hasValidSignature,
        clearError,
    };
}
