/**
 * Tauri HTTP Fetch Wrapper
 * 
 * Provides a fetch-compatible interface using Tauri's HTTP client
 * to bypass browser CORS restrictions in desktop apps.
 */

import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

/**
 * Custom fetch implementation using Tauri's HTTP client
 * Compatible with the standard Fetch API signature
 */
export function createTauriFetch(): typeof fetch {
    console.log('[TauriFetch] Creating Tauri fetch wrapper');
    
    const wrapper = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        // Extract URL
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        console.log('[TauriFetch] Making request to:', url, 'method:', init?.method || 'GET');

        // Convert body to string if present
        let bodyString: string | undefined;
        if (init?.body) {
            if (typeof init.body === 'string') {
                bodyString = init.body;
            } else {
                bodyString = String(init.body);
            }
        }

        try {
            // Make Tauri HTTP request
            const tauriResponse = await tauriFetch(url, {
                method: (init?.method || 'GET') as any,
                headers: init?.headers as Record<string, string> | undefined,
                body: bodyString as any,
            });

            console.log('[TauriFetch] Response received:', tauriResponse.status);

            // Get response body as text
            const responseText = await tauriResponse.text();

            // Convert Tauri response to standard Response
            return new Response(responseText, {
                status: tauriResponse.status,
                statusText: tauriResponse.ok ? 'OK' : 'Error',
                headers: tauriResponse.headers as HeadersInit,
            });
        } catch (error) {
            console.error('[TauriFetch] Error making request:', error);
            throw error;
        }
    };
    
    console.log('[TauriFetch] Wrapper created successfully');
    return wrapper as typeof fetch;
}
