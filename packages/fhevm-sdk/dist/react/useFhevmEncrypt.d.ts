/**
 * React hook for FHEVM encryption
 *
 * Provides encryption capabilities with React state management
 */
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
    encrypt: (fn: (builder: EncryptionBuilder) => void | Promise<void>) => Promise<EncryptedInput>;
    /**
     * Encrypt and get hex-encoded result
     */
    encryptToHex: (fn: (builder: EncryptionBuilder) => void | Promise<void>) => Promise<{
        handles: `0x${string}`[];
        inputProof: `0x${string}`;
    }>;
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
export declare function useFhevmEncrypt(options: UseFhevmEncryptOptions): UseFhevmEncryptResult;
