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
    const value = results[request.handle];

    if (value === undefined) {
      throw new Error(`Failed to decrypt handle: ${request.handle}`);
    }

    return value;
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

    // Validate signature is still valid
    if (!signature.isValid()) {
      throw new Error("Decryption signature has expired");
    }

    // Call userDecrypt on instance
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
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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
