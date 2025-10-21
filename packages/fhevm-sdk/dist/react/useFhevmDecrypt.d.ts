/**
 * React hook for FHEVM decryption
 *
 * Provides decryption capabilities with React state management
 */
import type { FhevmInstance } from "../fhevmTypes";
import type { JsonRpcSigner } from "ethers";
import { type DecryptionRequest, type DecryptedValue, type DecryptionOptions } from "../core/DecryptionHandler";
export interface UseFhevmDecryptOptions extends DecryptionOptions {
    /**
     * FHEVM instance (from useFhevmClient)
     */
    instance: FhevmInstance | undefined;
    /**
     * Ethers signer for signing EIP-712 messages
     */
    signer: JsonRpcSigner | undefined;
}
export interface UseFhevmDecryptResult {
    /**
     * Whether decryption is ready to use
     */
    canDecrypt: boolean;
    /**
     * Whether currently decrypting
     */
    isDecrypting: boolean;
    /**
     * Last decryption error
     */
    error: Error | undefined;
    /**
     * Decrypt a single encrypted value
     */
    decrypt: (request: DecryptionRequest) => Promise<DecryptedValue>;
    /**
     * Decrypt multiple encrypted values
     */
    decryptMany: (requests: DecryptionRequest[]) => Promise<Record<string, DecryptedValue>>;
    /**
     * Decrypt multiple values and return in order
     */
    decryptManyOrdered: (requests: DecryptionRequest[]) => Promise<DecryptedValue[]>;
    /**
     * Pre-generate and cache signature for contracts
     * Useful to avoid prompting user during time-sensitive operations
     */
    preloadSignature: (contractAddresses: `0x${string}`[]) => Promise<void>;
    /**
     * Check if valid signature exists for contracts
     */
    hasValidSignature: (contractAddresses: `0x${string}`[]) => Promise<boolean>;
    /**
     * Clear the last error
     */
    clearError: () => void;
}
/**
 * Hook for decrypting FHEVM encrypted values
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { instance } = useFhevmClient({ provider, chainId });
 *   const { decrypt, isDecrypting, error } = useFhevmDecrypt({
 *     instance,
 *     signer
 *   });
 *
 *   const [value, setValue] = useState<bigint>();
 *
 *   const handleDecrypt = async () => {
 *     const decrypted = await decrypt({
 *       handle: '0x123...',
 *       contractAddress: '0xabc...'
 *     });
 *     setValue(decrypted as bigint);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleDecrypt} disabled={isDecrypting}>
 *         Decrypt
 *       </button>
 *       {value && <p>Value: {value.toString()}</p>}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useFhevmDecrypt(options: UseFhevmDecryptOptions): UseFhevmDecryptResult;
