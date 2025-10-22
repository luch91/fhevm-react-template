/**
 * Decryption Handler
 *
 * Manages decryption operations including EIP-712 signature generation,
 * caching, and calling the FHEVM gateway for decryption.
 */

import type { FhevmInstance } from "../fhevmTypes";
import type { JsonRpcSigner } from "ethers";
import { FhevmDecryptionSignature } from "../FhevmDecryptionSignature";
import type { GenericStringStorage } from "../storage/GenericStringStorage";
import { GenericStringInMemoryStorage } from "../storage/GenericStringStorage";

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
export class DecryptionHandler {
  private _instance: FhevmInstance;
  private _signer: JsonRpcSigner;
  private _storage: GenericStringStorage;
  private _keypair?: { publicKey: string; privateKey: string };

  constructor(
    instance: FhevmInstance,
    signer: JsonRpcSigner,
    options: DecryptionOptions = {}
  ) {
    this._instance = instance;
    this._signer = signer;
    this._storage = options.storage || new GenericStringInMemoryStorage();
    this._keypair = options.keypair;
  }

  /**
   * Decrypt a single encrypted value
   */
  async decrypt(request: DecryptionRequest): Promise<DecryptedValue> {
    const results = await this.decryptMany([request]);

    // Use hasOwnProperty to differentiate between undefined and missing
    if (!Object.prototype.hasOwnProperty.call(results, request.handle)) {
      throw new Error(`Failed to decrypt handle: ${request.handle}`);
    }

    return results[request.handle];
  }

  /**
   * Decrypt multiple encrypted values in one operation
   * More efficient than calling decrypt() multiple times
   */
  async decryptMany(
    requests: DecryptionRequest[]
  ): Promise<Record<string, DecryptedValue>> {
    if (requests.length === 0) {
      return {};
    }

    // Get unique contract addresses for signature
    const uniqueAddresses = Array.from(
      new Set(requests.map((r) => r.contractAddress))
    );

    // Get or create decryption signature
    const signature = await FhevmDecryptionSignature.loadOrSign(
      this._instance,
      uniqueAddresses,
      this._signer,
      this._storage,
      this._keypair
    );

    if (!signature) {
      throw new Error("Failed to create decryption signature");
    }

    // Validate signature is still valid - if expired, try to refresh
    if (!signature.isValid()) {
      // Clear expired signature from cache
      await this.clearSignatureCache(uniqueAddresses);

      // Try to get a fresh signature
      const freshSignature = await FhevmDecryptionSignature.loadOrSign(
        this._instance,
        uniqueAddresses,
        this._signer,
        this._storage,
        this._keypair
      );

      if (!freshSignature || !freshSignature.isValid()) {
        throw new Error("Decryption signature has expired and could not be refreshed");
      }

      // Use the fresh signature
      return await this._performDecryption(requests, freshSignature);
    }

    return await this._performDecryption(requests, signature);
  }

  /**
   * Internal method to perform decryption with a signature
   * @private
   */
  private async _performDecryption(
    requests: DecryptionRequest[],
    signature: FhevmDecryptionSignature
  ): Promise<Record<string, DecryptedValue>> {
    try {
      const results = await this._instance.userDecrypt(
        requests,
        signature.privateKey,
        signature.publicKey,
        signature.signature,
        signature.contractAddresses,
        signature.userAddress,
        signature.startTimestamp,
        signature.durationDays
      );

      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const decryptionError = new Error(`Decryption failed: ${message}`);

      // Preserve original error as cause
      if (error instanceof Error) {
        decryptionError.cause = error;
      }

      throw decryptionError;
    }
  }

  /**
   * Decrypt multiple values and return them in order
   * Useful when you need results in a specific order
   */
  async decryptManyOrdered(
    requests: DecryptionRequest[]
  ): Promise<DecryptedValue[]> {
    const results = await this.decryptMany(requests);
    return requests.map((req) => {
      const value = results[req.handle];
      if (value === undefined) {
        throw new Error(`Missing decryption result for handle: ${req.handle}`);
      }
      return value;
    });
  }

  /**
   * Pre-generate and cache a decryption signature for contract addresses
   * Useful to avoid prompting user for signature during time-sensitive operations
   */
  async preloadSignature(contractAddresses: `0x${string}`[]): Promise<void> {
    const signature = await FhevmDecryptionSignature.loadOrSign(
      this._instance,
      contractAddresses,
      this._signer,
      this._storage,
      this._keypair
    );

    if (!signature) {
      throw new Error("Failed to preload decryption signature");
    }
  }

  /**
   * Check if a valid signature exists in cache for given contracts
   */
  async hasValidSignature(contractAddresses: `0x${string}`[]): Promise<boolean> {
    try {
      const userAddress = await this._signer.getAddress();
      const cached = await FhevmDecryptionSignature.loadFromGenericStringStorage(
        this._storage,
        this._instance,
        contractAddresses,
        userAddress,
        this._keypair?.publicKey
      );

      return cached !== null && cached.isValid();
    } catch {
      return false;
    }
  }

  /**
   * Get the storage instance (for advanced use)
   */
  getStorage(): GenericStringStorage {
    return this._storage;
  }

  /**
   * Update the storage instance
   */
  setStorage(storage: GenericStringStorage): void {
    this._storage = storage;
  }

  /**
   * Clear cached signature for specific contract addresses
   * Useful when signature expires or needs to be regenerated
   */
  async clearSignatureCache(contractAddresses: `0x${string}`[]): Promise<void> {
    try {
      const userAddress = await this._signer.getAddress();
      const publicKey = this._keypair?.publicKey || "";

      // Generate the same cache key used by FhevmDecryptionSignature
      const sortedAddresses = [...contractAddresses].sort();
      const cacheKey = `fhevm_signature_${userAddress}_${sortedAddresses.join("_")}_${publicKey}`;

      await this._storage.removeItem(cacheKey);
    } catch (error) {
      // Silently fail - cache clearing is not critical
      console.warn("Failed to clear signature cache:", error);
    }
  }

  /**
   * Clear all cached signatures from storage
   */
  async clearAllSignatures(): Promise<void> {
    // Note: This is a best-effort implementation
    // GenericStringStorage doesn't have a "clear all" method
    // So we can only clear if the storage implementation supports it
    if (typeof (this._storage as any).clear === "function") {
      try {
        await (this._storage as any).clear();
      } catch (error) {
        console.warn("Failed to clear all signatures:", error);
      }
    }
  }
}

/**
 * Helper to create a DecryptionHandler
 */
export function createDecryptionHandler(
  instance: FhevmInstance,
  signer: JsonRpcSigner,
  options?: DecryptionOptions
): DecryptionHandler {
  return new DecryptionHandler(instance, signer, options);
}
