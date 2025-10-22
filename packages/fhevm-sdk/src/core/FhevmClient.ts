/**
 * Core FHEVM Client with State Machine
 *
 * This is the framework-agnostic core that manages FHEVM instance lifecycle,
 * encryption/decryption operations, and state transitions.
 */

import type { Eip1193Provider } from "ethers";
import type { FhevmInstance } from "../fhevmTypes";
import { createFhevmInstance, FhevmAbortError } from "../internal/fhevm";

/**
 * Client state machine states
 */
export type FhevmClientState =
  | { status: "idle" }
  | { status: "initializing"; progress?: string }
  | { status: "ready"; instance: FhevmInstance }
  | { status: "error"; error: FhevmClientError };

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
export class FhevmClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "FhevmClientError";
  }
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
export class FhevmClient {
  private _state: FhevmClientState = { status: "idle" };
  private _listeners: Set<Listener> = new Set();
  private _abortController: AbortController | null = null;
  private _config: FhevmClientConfig | null = null;
  private _initializationId: number = 0; // Track initialization attempts
  private _listenerErrors: Error[] = []; // Collect listener errors
  private static readonly MAX_LISTENERS = 100; // Warn threshold

  /**
   * Current state of the client
   */
  get state(): FhevmClientState {
    return this._state;
  }

  /**
   * Check if client is ready to use
   */
  get isReady(): boolean {
    return this._state.status === "ready";
  }

  /**
   * Check if client is initializing
   */
  get isInitializing(): boolean {
    return this._state.status === "initializing";
  }

  /**
   * Get the FHEVM instance (only available when ready)
   */
  get instance(): FhevmInstance | undefined {
    return this._state.status === "ready" ? this._state.instance : undefined;
  }

  /**
   * Get current error (only available when in error state)
   */
  get error(): FhevmClientError | undefined {
    return this._state.status === "error" ? this._state.error : undefined;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: Listener): Unsubscribe {
    this._listeners.add(listener);

    // Warn if too many listeners (potential memory leak)
    if (this._listeners.size > FhevmClient.MAX_LISTENERS) {
      console.warn(
        `FhevmClient: ${this._listeners.size} listeners registered. ` +
        `This may indicate a memory leak. Check for missing unsubscribe calls.`
      );
    }

    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Initialize the FHEVM client
   */
  async initialize(config: FhevmClientConfig): Promise<void> {
    // Increment initialization ID to track this attempt
    const currentInitId = ++this._initializationId;

    // Cancel any existing initialization
    if (this._abortController) {
      this._abortController.abort();
    }

    this._config = config;
    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    this._setState({ status: "initializing" });

    try {
      const instance = await createFhevmInstance({
        provider: config.provider,
        mockChains: config.mockChains,
        signal,
        onStatusChange: (status) => {
          this._setState({
            status: "initializing",
            progress: status,
          });
        },
      });

      // Check if aborted during initialization or if a new init started
      if (signal.aborted || currentInitId !== this._initializationId) {
        return;
      }

      this._setState({ status: "ready", instance });
    } catch (error) {
      // Don't set error state if operation was aborted
      if (error instanceof FhevmAbortError) {
        this._setState({ status: "idle" });
        return;
      }

      const fhevmError = error instanceof FhevmClientError
        ? error
        : new FhevmClientError(
            "INIT_ERROR",
            error instanceof Error ? error.message : "Failed to initialize FHEVM client",
            error
          );

      this._setState({ status: "error", error: fhevmError });
      throw fhevmError;
    }
  }

  /**
   * Refresh the client (re-initialize with current config)
   */
  async refresh(): Promise<void> {
    if (!this._config) {
      throw new FhevmClientError(
        "NO_CONFIG",
        "Cannot refresh: client has not been initialized"
      );
    }
    await this.initialize(this._config);
  }

  /**
   * Destroy the client and clean up resources
   */
  destroy(): void {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    this._listeners.clear();
    this._setState({ status: "idle" });
    this._config = null;
  }

  /**
   * Internal method to update state and notify listeners
   */
  private _setState(state: FhevmClientState): void {
    this._state = state;
    const event: FhevmClientEvent = { type: "stateChange", state };

    // Clear previous listener errors
    this._listenerErrors = [];

    this._listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        // Collect errors instead of just logging
        const listenerError = error instanceof Error
          ? error
          : new Error(String(error));

        this._listenerErrors.push(listenerError);
        console.error("Error in FhevmClient listener:", error);
      }
    });
  }

  /**
   * Get errors that occurred in listeners during last state change
   * Useful for debugging listener issues
   */
  getListenerErrors(): readonly Error[] {
    return [...this._listenerErrors];
  }

  /**
   * Get the number of active listeners
   * Useful for detecting memory leaks
   */
  getListenerCount(): number {
    return this._listeners.size;
  }
}
