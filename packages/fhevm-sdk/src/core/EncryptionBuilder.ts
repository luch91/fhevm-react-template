/**
 * Fluent API for building encrypted inputs
 *
 * Provides a type-safe, chainable interface for creating encrypted inputs
 * that can be sent to FHEVM smart contracts.
 */

import type { FhevmInstance } from "../fhevmTypes";
import type { RelayerEncryptedInput } from "@zama-fhe/relayer-sdk/web";

/**
 * Result of encryption operation
 */
export interface EncryptedInput {
  handles: Uint8Array[];
  inputProof: Uint8Array;
}

/**
 * Convert Uint8Array to hex string with 0x prefix
 */
function toHex(value: Uint8Array): `0x${string}` {
  return `0x${Array.from(value)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}` as `0x${string}`;
}

/**
 * Fluent builder for creating encrypted inputs
 *
 * @example
 * ```typescript
 * const encrypted = await client
 *   .createEncryptedInput(contractAddress, userAddress)
 *   .addBool(true)
 *   .addUint8(42)
 *   .addUint32(1000)
 *   .encrypt();
 *
 * // Send to contract
 * const tx = await contract.myFunction(
 *   encrypted.handles[0],
 *   encrypted.inputProof
 * );
 * ```
 */
export class EncryptionBuilder {
  private _input: RelayerEncryptedInput;
  private _instance: FhevmInstance;

  constructor(
    instance: FhevmInstance,
    contractAddress: string,
    userAddress: string
  ) {
    this._instance = instance;
    this._input = instance.createEncryptedInput(
      contractAddress,
      userAddress
    ) as RelayerEncryptedInput;
  }

  /**
   * Add an encrypted boolean value
   */
  addBool(value: boolean): this {
    this._input.addBool(value);
    return this;
  }

  /**
   * Add an encrypted 8-bit unsigned integer
   */
  addUint8(value: number): this {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error(`Invalid uint8 value: ${value}. Must be integer between 0-255`);
    }
    this._input.add8(value);
    return this;
  }

  /**
   * Add an encrypted 16-bit unsigned integer
   */
  addUint16(value: number): this {
    if (!Number.isInteger(value) || value < 0 || value > 65535) {
      throw new Error(`Invalid uint16 value: ${value}. Must be integer between 0-65535`);
    }
    this._input.add16(value);
    return this;
  }

  /**
   * Add an encrypted 32-bit unsigned integer
   */
  addUint32(value: number): this {
    if (!Number.isInteger(value) || value < 0 || value > 4294967295) {
      throw new Error(`Invalid uint32 value: ${value}. Must be integer between 0-4294967295`);
    }
    this._input.add32(value);
    return this;
  }

  /**
   * Add an encrypted 64-bit unsigned integer
   */
  addUint64(value: bigint | number): this {
    const bigintValue = typeof value === "number" ? BigInt(value) : value;
    if (bigintValue < 0n || bigintValue > 18446744073709551615n) {
      throw new Error(`Invalid uint64 value: ${value}. Must be between 0 and 2^64-1`);
    }
    this._input.add64(bigintValue);
    return this;
  }

  /**
   * Add an encrypted 128-bit unsigned integer
   */
  addUint128(value: bigint): this {
    if (value < 0n || value >= (1n << 128n)) {
      throw new Error(`Invalid uint128 value: ${value}. Must be between 0 and 2^128-1`);
    }
    this._input.add128(value);
    return this;
  }

  /**
   * Add an encrypted 256-bit unsigned integer
   */
  addUint256(value: bigint): this {
    if (value < 0n || value >= (1n << 256n)) {
      throw new Error(`Invalid uint256 value: ${value}. Must be between 0 and 2^256-1`);
    }
    this._input.add256(value);
    return this;
  }

  /**
   * Add an encrypted address
   */
  addAddress(value: string): this {
    // Basic validation - ethers will do more thorough validation
    if (!value.startsWith("0x") || value.length !== 42) {
      throw new Error(`Invalid address: ${value}. Must be 0x-prefixed 40-char hex string`);
    }
    this._input.addAddress(value);
    return this;
  }

  /**
   * Add multiple values at once using a builder function
   *
   * @example
   * ```typescript
   * const encrypted = await builder
   *   .addMultiple((b) => {
   *     b.addUint8(1);
   *     b.addUint8(2);
   *     b.addUint8(3);
   *   })
   *   .encrypt();
   * ```
   */
  addMultiple(fn: (builder: this) => void): this {
    fn(this);
    return this;
  }

  /**
   * Encrypt all added values
   *
   * @returns Promise resolving to encrypted input with handles and proof
   */
  async encrypt(): Promise<EncryptedInput> {
    try {
      const result = await this._input.encrypt();
      return {
        handles: result.handles,
        inputProof: result.inputProof,
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Encrypt and convert to hex format (commonly needed for contracts)
   *
   * @returns Promise resolving to encrypted input with hex-encoded values
   */
  async encryptToHex(): Promise<{
    handles: `0x${string}`[];
    inputProof: `0x${string}`;
  }> {
    const result = await this.encrypt();
    return {
      handles: result.handles.map(toHex),
      inputProof: toHex(result.inputProof),
    };
  }

  /**
   * Get the underlying RelayerEncryptedInput (for advanced use)
   */
  getInput(): RelayerEncryptedInput {
    return this._input;
  }
}

/**
 * Helper to create an EncryptionBuilder
 */
export function createEncryptionBuilder(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string
): EncryptionBuilder {
  return new EncryptionBuilder(instance, contractAddress, userAddress);
}
