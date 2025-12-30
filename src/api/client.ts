import { KaleidoClient, KaleidoConfig } from 'kaleidoswap-sdk';
import { RootState } from '../app/store';

let clientInstance: KaleidoClient | null = null;
let currentConfig: Partial<KaleidoConfig> | null = null;

export const getKaleidoClient = (state: RootState): KaleidoClient => {
    const nodeUrl = state.nodeSettings.data?.node_url;
    const authToken = state.nodeSettings.data?.bearer_token;
    const baseUrl = state.nodeSettings.data?.default_maker_url || 'http://localhost:8000';

    // Check if config changed
    if (
        !clientInstance ||
        !currentConfig ||
        currentConfig.nodeUrl !== nodeUrl ||
        currentConfig.authToken !== authToken ||
        currentConfig.baseUrl !== baseUrl
    ) {
        // Create new instance
        clientInstance = new KaleidoClient({
            nodeUrl,
            authToken,
            baseUrl,
            // You can add other config like wsUrl if needed
        });

        currentConfig = {
            nodeUrl,
            authToken,
            baseUrl,
        };
    }

    return clientInstance;
};
