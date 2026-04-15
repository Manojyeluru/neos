// Use a relative path so the Vite dev-server proxy (→ port 5000) handles it.
// This avoids CORS issues and works regardless of hostname differences.
export const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchApi = async (endpoint: string, options: RequestInit = {}, retries = 2): Promise<any> => {
    const token = localStorage.getItem('token');
    const eventId = localStorage.getItem('selectedEventId');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(eventId ? { 'x-event-id': eventId } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Something went wrong');
        }

        return response.json();
    } catch (err: any) {
        // Handle Render cold-start: retry with backoff on network failures
        if ((err.name === 'TypeError' && err.message === 'Failed to fetch') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
            if (retries > 0) {
                const delay = (3 - retries) * 2000 + 1000; // 1s, 3s backoff
                console.warn(`Backend unreachable, retrying in ${delay}ms... (${retries} attempts left)`);
                await sleep(delay);
                return fetchApi(endpoint, options, retries - 1);
            }
            throw new Error('The server is starting up — this can take ~30 seconds on first load. Please wait and try again.');
        }
        throw err;
    }
};

// Keep-alive ping: wakes Render from sleep every 14 minutes
if (import.meta.env.VITE_API_URL) {
    const ping = () => fetch(`${API_BASE_URL}/auth/public-events`).catch(() => {});
    setInterval(ping, 14 * 60 * 1000);
}
