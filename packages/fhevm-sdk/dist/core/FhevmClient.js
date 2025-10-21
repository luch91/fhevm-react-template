/**
 * Core FHEVM Client with State Machine
 *
 * This is the framework-agnostic core that manages FHEVM instance lifecycle,
 * encryption/decryption operations, and state transitions.
 */
import { createFhevmInstance, FhevmAbortError } from "../internal/fhevm";
/**
 * Structured error for FHEVM operations
 */
export class FhevmClientError extends Error {
    code;
    cause;
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = "FhevmClientError";
    }
}
/**
 * Core FHEVM Client with state machine
 *
 * @example
 * ```typescript
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
 *   const encrypted = await client.encrypt()
 *     .addUint8(42)
 *     .build();
 * }
 * ```
 */
export class FhevmClient {
    _state = { status: "idle" };
    _listeners = new Set();
    _abortController = null;
    _config = null;
    /**
     * Current state of the client
     */
    get state() {
        return this._state;
    }
    /**
     * Check if client is ready to use
     */
    get isReady() {
        return this._state.status === "ready";
    }
    /**
     * Check if client is initializing
     */
    get isInitializing() {
        return this._state.status === "initializing";
    }
    /**
     * Get the FHEVM instance (only available when ready)
     */
    get instance() {
        return this._state.status === "ready" ? this._state.instance : undefined;
    }
    /**
     * Get current error (only available when in error state)
     */
    get error() {
        return this._state.status === "error" ? this._state.error : undefined;
    }
    /**
     * Subscribe to state changes
     */
    subscribe(listener) {
        this._listeners.add(listener);
        return () => {
            this._listeners.delete(listener);
        };
    }
    /**
     * Initialize the FHEVM client
     */
    async initialize(config) {
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
            // Check if aborted during initialization
            if (signal.aborted) {
                return;
            }
            this._setState({ status: "ready", instance });
        }
        catch (error) {
            // Don't set error state if operation was aborted
            if (error instanceof FhevmAbortError) {
                this._setState({ status: "idle" });
                return;
            }
            const fhevmError = error instanceof FhevmClientError
                ? error
                : new FhevmClientError("INIT_ERROR", error instanceof Error ? error.message : "Failed to initialize FHEVM client", error);
            this._setState({ status: "error", error: fhevmError });
            throw fhevmError;
        }
    }
    /**
     * Refresh the client (re-initialize with current config)
     */
    async refresh() {
        if (!this._config) {
            throw new FhevmClientError("NO_CONFIG", "Cannot refresh: client has not been initialized");
        }
        await this.initialize(this._config);
    }
    /**
     * Destroy the client and clean up resources
     */
    destroy() {
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
    _setState(state) {
        this._state = state;
        const event = { type: "stateChange", state };
        this._listeners.forEach((listener) => {
            try {
                listener(event);
            }
            catch (error) {
                console.error("Error in FhevmClient listener:", error);
            }
        });
    }
}
