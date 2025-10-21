/**
 * React hook for FHEVM Client
 *
 * Manages FHEVM instance lifecycle with React state
 */
import { type FhevmClientConfig, type FhevmClientState } from "../core/FhevmClient";
import type { FhevmInstance } from "../fhevmTypes";
export interface UseFhevmClientOptions extends FhevmClientConfig {
    /**
     * Whether to automatically initialize the client
     * @default true
     */
    enabled?: boolean;
}
export interface UseFhevmClientResult {
    /**
     * Current state of the client
     */
    state: FhevmClientState;
    /**
     * FHEVM instance (only available when ready)
     */
    instance: FhevmInstance | undefined;
    /**
     * Whether the client is ready to use
     */
    isReady: boolean;
    /**
     * Whether the client is initializing
     */
    isInitializing: boolean;
    /**
     * Whether the client is in an error state
     */
    isError: boolean;
    /**
     * Current error (only available in error state)
     */
    error: Error | undefined;
    /**
     * Manually refresh/reinitialize the client
     */
    refresh: () => Promise<void>;
}
/**
 * Hook for managing FHEVM client lifecycle
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { instance, isReady, isInitializing, error } = useFhevmClient({
 *     provider: window.ethereum,
 *     chainId: 31337
 *   });
 *
 *   if (isInitializing) return <div>Loading FHEVM...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!isReady) return <div>Not connected</div>;
 *
 *   return <div>FHEVM Ready!</div>;
 * }
 * ```
 */
export declare function useFhevmClient(options: UseFhevmClientOptions): UseFhevmClientResult;
