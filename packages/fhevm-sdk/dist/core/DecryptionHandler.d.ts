/**
 * Decryption Handler
 *
 * Manages decryption operations including EIP-712 signature generation,
 * caching, and calling the FHEVM gateway for decryption.
 */
import type { FhevmInstance } from "../fhevmTypes";
import type { JsonRpcSigner } from "ethers";
import type { GenericStringStorage } from "../storage/GenericStringStorage";
/**
 * Request for decryption
 */
export interface DecryptionRequest {
    handle: string;
    contractAddress: `0x${string}`;
}
/**
 * Result of decryption
 */
export type DecryptedValue = string | bigint | boolean;
/**
 * Options for decryption
 */
export interface DecryptionOptions {
    /**
     * Storage for caching decryption signatures
     * Defaults to in-memory storage
     */
    storage?: GenericStringStorage;
    /**
     * Custom keypair for decryption (optional)
     * If not provided, will generate one
     */
    keypair?: {
        publicKey: string;
        privateKey: string;
    };
}
/**
 * Handler for FHEVM decryption operations
 *
 * @example
 * ```typescript
 * const handler = new DecryptionHandler(instance, signer);
 *
 * // Decrypt single value
 * const value = await handler.decrypt({
 *   handle: '0x123...',
 *   contractAddress: '0xabc...'
 * });
 *
 * // Decrypt multiple values at once
 * const values = await handler.decryptMany([
 *   { handle: '0x123...', contractAddress: '0xabc...' },
 *   { handle: '0x456...', contractAddress: '0xdef...' }
 * ]);
 * ```
 */
export declare class DecryptionHandler {
    private _instance;
    private _signer;
    private _storage;
    private _keypair?;
    constructor(instance: FhevmInstance, signer: JsonRpcSigner, options?: DecryptionOptions);
    /**
     * Decrypt a single encrypted value
     */
    decrypt(request: DecryptionRequest): Promise<DecryptedValue>;
    /**
     * Decrypt multiple encrypted values in one operation
     * More efficient than calling decrypt() multiple times
     */
    decryptMany(requests: DecryptionRequest[]): Promise<Record<string, DecryptedValue>>;
    /**
     * Internal method to perform decryption with a signature
     * @private
     */
    private _performDecryption;
    /**
     * Decrypt multiple values and return them in order
     * Useful when you need results in a specific order
     */
    decryptManyOrdered(requests: DecryptionRequest[]): Promise<DecryptedValue[]>;
    /**
     * Pre-generate and cache a decryption signature for contract addresses
     * Useful to avoid prompting user for signature during time-sensitive operations
     */
    preloadSignature(contractAddresses: `0x${string}`[]): Promise<void>;
    /**
     * Check if a valid signature exists in cache for given contracts
     */
    hasValidSignature(contractAddresses: `0x${string}`[]): Promise<boolean>;
    /**
     * Get the storage instance (for advanced use)
     */
    getStorage(): GenericStringStorage;
    /**
     * Update the storage instance
     */
    setStorage(storage: GenericStringStorage): void;
    /**
     * Clear cached signature for specific contract addresses
     * Useful when signature expires or needs to be regenerated
     */
    clearSignatureCache(contractAddresses: `0x${string}`[]): Promise<void>;
    /**
     * Clear all cached signatures from storage
     */
    clearAllSignatures(): Promise<void>;
}
/**
 * Helper to create a DecryptionHandler
 */
export declare function createDecryptionHandler(instance: FhevmInstance, signer: JsonRpcSigner, options?: DecryptionOptions): DecryptionHandler;
