import { KaleidoClient } from 'kaleidoswap-sdk';
import { NodeApiWrapper } from './node-api-wrapper';
import { createTauriFetch } from '../utils/tauri-fetch';

export interface MinimalState {
    nodeSettings: {
        data?: {
            node_url?: string;
            bearer_token?: string;
            default_maker_url?: string;
        } | null;
    };
}

let clientInstance: KaleidoClient | null = null;
let nodeApiWrapper: NodeApiWrapper | null = null;
let currentBaseUrl: string | null = null;
let currentNodeUrl: string | null = null;
let currentAuthToken: string | null = null;

// Initialize Tauri fetch at module load time
let tauriFetch: typeof fetch | null = null;

// Initialize Tauri fetch immediately (synchronous)
try {
    tauriFetch = createTauriFetch();
    console.log('[Client] Tauri fetch initialized successfully');
} catch (err) {
    console.error('[Client] Failed to initialize Tauri fetch:', err);
}

export const getKaleidoClient = async (state: MinimalState): Promise<KaleidoClient> => {
    const nodeUrl = state.nodeSettings.data?.node_url;
    const authToken = state.nodeSettings.data?.bearer_token;
    const baseUrl = state.nodeSettings.data?.default_maker_url || 'http://localhost:8000';

    // Verify tauriFetch is available
    if (!tauriFetch) {
        console.error('[Client] Tauri fetch not initialized!');
        throw new Error('Tauri fetch failed to initialize');
    }

    // Check if we need to recreate the client
    // - If it doesn't exist
    // - If config changed
    const needsRecreate = 
        !clientInstance ||
        currentNodeUrl !== (nodeUrl ?? null) ||
        currentAuthToken !== (authToken ?? null) ||
        currentBaseUrl !== baseUrl;

    if (needsRecreate) {
        console.log('[Client] Creating KaleidoClient with Tauri fetch', {
            baseUrl,
            nodeUrl,
            hasTauriFetch: !!tauriFetch
        });

        // Create new instance with the TypeScript SDK using static factory
        clientInstance = KaleidoClient.create({
            baseUrl,
            nodeUrl,
            apiKey: authToken,
            fetch: tauriFetch,
        });

        // Create wrapper instance
        nodeApiWrapper = new NodeApiWrapper(clientInstance.rln);

        currentBaseUrl = baseUrl;
        currentNodeUrl = nodeUrl ?? null;
        currentAuthToken = authToken ?? null;
    }

    // At this point clientInstance is guaranteed to be non-null
    return clientInstance!;
};

/**
 * Get the Node API wrapper with enhanced error handling and request defaults
 */
export const getNodeApiWrapper = async (state: MinimalState): Promise<NodeApiWrapper> => {
    // Ensure client is initialized
    await getKaleidoClient(state);

    // At this point nodeApiWrapper is guaranteed to be non-null
    return nodeApiWrapper!;
};

