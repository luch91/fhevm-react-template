/**
 * React hook for FHEVM Client
 *
 * Manages FHEVM instance lifecycle with React state
 */
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { FhevmClient, } from "../core/FhevmClient";
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
export function useFhevmClient(options) {
    const { provider, chainId, mockChains, enabled = true } = options;
    const [state, setState] = useState({ status: "idle" });
    const clientRef = useRef(null);
    const configRef = useRef("");
    // Create config key for comparison
    const configKey = JSON.stringify({ provider, chainId, mockChains });
    // Initialize client
    useEffect(() => {
        if (!enabled || !provider || !chainId) {
            // Destroy existing client if disabled or missing config
            if (clientRef.current) {
                clientRef.current.destroy();
                clientRef.current = null;
            }
            setState({ status: "idle" });
            return;
        }
        // Check if config changed
        const configChanged = configKey !== configRef.current;
        if (!clientRef.current) {
            // Create new client
            clientRef.current = new FhevmClient();
            clientRef.current.subscribe((event) => {
                setState(event.state);
            });
        }
        // Initialize or refresh if config changed
        if (configChanged) {
            configRef.current = configKey;
            clientRef.current
                .initialize({ provider, chainId, mockChains })
                .catch((error) => {
                // Error is already handled by state machine
                console.error("FHEVM initialization failed:", error);
            });
        }
        // Cleanup
        return () => {
            if (clientRef.current) {
                clientRef.current.destroy();
                clientRef.current = null;
            }
        };
    }, [provider, chainId, mockChains, enabled, configKey]);
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
