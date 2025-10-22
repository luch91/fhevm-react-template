/**
 * React hook for FHEVM Client
 *
 * Manages FHEVM instance lifecycle with React state
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  FhevmClient,
  type FhevmClientConfig,
  type FhevmClientState,
} from "../core/FhevmClient";
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
export function useFhevmClient(
  options: UseFhevmClientOptions
): UseFhevmClientResult {
  const { provider, chainId, mockChains, enabled = true } = options;

  const [state, setState] = useState<FhevmClientState>({ status: "idle" });
  const clientRef = useRef<FhevmClient | null>(null);
  const prevChainIdRef = useRef<number | undefined>(undefined);
  const prevEnabledRef = useRef<boolean | undefined>(undefined);
  const isCleaningUpRef = useRef<boolean>(false);

  // Store mockChains in ref to avoid recreating config on every render
  const mockChainsRef = useRef(mockChains);
  mockChainsRef.current = mockChains;

  // Initialize client
  useEffect(() => {
    // Skip if we're in the middle of cleanup
    if (isCleaningUpRef.current) {
      return;
    }

    if (!enabled || !provider || !chainId) {
      // Destroy existing client if disabled or missing config
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
      setState({ status: "idle" });
      prevChainIdRef.current = undefined;
      prevEnabledRef.current = enabled;
      return;
    }

    // Check if config changed (using primitive comparisons only)
    const chainIdChanged = chainId !== prevChainIdRef.current;
    const enabledChanged = enabled !== prevEnabledRef.current;
    const configChanged = chainIdChanged || enabledChanged;

    if (!clientRef.current) {
      // Create new client
      clientRef.current = new FhevmClient();
      clientRef.current.subscribe((event) => {
        setState(event.state);
      });
    }

    // Initialize or refresh if config changed
    if (configChanged || !clientRef.current.isReady) {
      prevChainIdRef.current = chainId;
      prevEnabledRef.current = enabled;

      clientRef.current
        .initialize({ provider, chainId, mockChains: mockChainsRef.current })
        .catch((error) => {
          // Error is already handled by state machine
          // Only log if not in an error state already
          if (clientRef.current?.state.status !== "error") {
            console.error("FHEVM initialization failed:", error);
          }
        });
    }

    // Cleanup
    return () => {
      isCleaningUpRef.current = true;

      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }

      // Reset cleanup flag after a tick
      setTimeout(() => {
        isCleaningUpRef.current = false;
      }, 0);
    };
  }, [provider, chainId, enabled]);

  // Refresh callback
  const refresh = useCallback(async () => {
    if (!clientRef.current) {
      throw new Error("Client not initialized");
    }
    await clientRef.current.refresh();
  }, []);

  // Derive convenience flags
  const isReady = state.status === "ready";
  const isInitializing = state.status === "initializing";
  const isError = state.status === "error";
  const instance = state.status === "ready" ? state.instance : undefined;
  const error = state.status === "error" ? state.error : undefined;

  return {
    state,
    instance,
    isReady,
    isInitializing,
    isError,
    error,
    refresh,
  };
}
