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
export declare class EncryptionBuilder {
    private _input;
    private _instance;
    constructor(instance: FhevmInstance, contractAddress: string, userAddress: string);
    /**
     * Add an encrypted boolean value
     */
    addBool(value: boolean): this;
    /**
     * Add an encrypted 8-bit unsigned integer
     */
    addUint8(value: number): this;
    /**
     * Add an encrypted 16-bit unsigned integer
     */
    addUint16(value: number): this;
    /**
     * Add an encrypted 32-bit unsigned integer
     */
    addUint32(value: number): this;
    /**
     * Add an encrypted 64-bit unsigned integer
     */
    addUint64(value: bigint | number): this;
    /**
     * Add an encrypted 128-bit unsigned integer
     */
    addUint128(value: bigint): this;
    /**
     * Add an encrypted 256-bit unsigned integer
     */
    addUint256(value: bigint): this;
    /**
     * Add an encrypted address
     */
    addAddress(value: string): this;
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
    addMultiple(fn: (builder: this) => void): this;
    /**
     * Encrypt all added values
     *
     * @returns Promise resolving to encrypted input with handles and proof
     */
    encrypt(): Promise<EncryptedInput>;
    /**
     * Encrypt and convert to hex format (commonly needed for contracts)
     *
     * @returns Promise resolving to encrypted input with hex-encoded values
     */
    encryptToHex(): Promise<{
        handles: `0x${string}`[];
        inputProof: `0x${string}`;
    }>;
    /**
     * Get the underlying RelayerEncryptedInput (for advanced use)
     */
    getInput(): RelayerEncryptedInput;
}
/**
 * Helper to create an EncryptionBuilder
 */
export declare function createEncryptionBuilder(instance: FhevmInstance, contractAddress: string, userAddress: string): EncryptionBuilder;
