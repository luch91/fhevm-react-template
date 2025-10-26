/**
 * Core FHEVM Client with State Machine
 *
 * This is the framework-agnostic core that manages FHEVM instance lifecycle,
 * encryption/decryption operations, and state transitions.
 */
import type { Eip1193Provider } from "ethers";
import type { FhevmInstance } from "../fhevmTypes";
/**
 * Client state machine states
 */
export type FhevmClientState = {
    status: "idle";
} | {
    status: "initializing";
    progress?: string;
} | {
    status: "ready";
    instance: FhevmInstance;
} | {
    status: "error";
    error: FhevmClientError;
};
/**
 * Configuration for FHEVM client
 */
export interface FhevmClientConfig {
    provider: string | Eip1193Provider;
    chainId: number;
    mockChains?: Record<number, string>;
}
/**
 * Structured error for FHEVM operations
 */
export declare class FhevmClientError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
/**
 * Event types for state changes
 */
export type FhevmClientEvent = {
    type: "stateChange";
    state: FhevmClientState;
};
type Listener = (event: FhevmClientEvent) => void;
type Unsubscribe = () => void;
/**
 * Core FHEVM Client with state machine
 *
 * @example
 * ```typescript
 * import { FhevmClient, EncryptionBuilder } from '@fhevm/sdk/core';
 *
 * const client = new FhevmClient();
 *
 * // Subscribe to state changes
 * client.subscribe((event) => {
 *   console.log('State:', event.state.status);
 * });
 *
 * // Initialize
 * await client.initialize({
 *   provider: window.ethereum,
 *   chainId: 31337
 * });
 *
 * // Use when ready
 * if (client.state.status === 'ready') {
 *   const builder = new EncryptionBuilder(
 *     client.state.instance,
 *     contractAddress,
 *     userAddress
 *   );
 *   const encrypted = await builder.addUint8(42).encrypt();
 * }
 * ```
 */
export declare class FhevmClient {
    private _state;
    private _listeners;
    private _abortController;
    private _config;
    private _initializationId;
    private _listenerErrors;
    private static readonly MAX_LISTENERS;
    /**
     * Current state of the client
     */
    get state(): FhevmClientState;
    /**
     * Check if client is ready to use
     */
    get isReady(): boolean;
    /**
     * Check if client is initializing
     */
    get isInitializing(): boolean;
    /**
     * Get the FHEVM instance (only available when ready)
     */
    get instance(): FhevmInstance | undefined;
    /**
     * Get current error (only available when in error state)
     */
    get error(): FhevmClientError | undefined;
    /**
     * Subscribe to state changes
     */
    subscribe(listener: Listener): Unsubscribe;
    /**
     * Initialize the FHEVM client
     */
    initialize(config: FhevmClientConfig): Promise<void>;
    /**
     * Refresh the client (re-initialize with current config)
     */
    refresh(): Promise<void>;
    /**
     * Destroy the client and clean up resources
     */
    destroy(): void;
    /**
     * Internal method to update state and notify listeners
     */
    private _setState;
    /**
     * Get errors that occurred in listeners during last state change
     * Useful for debugging listener issues
     */
    getListenerErrors(): readonly Error[];
    /**
     * Get the number of active listeners
     * Useful for detecting memory leaks
     */
    getListenerCount(): number;
}
export {};
