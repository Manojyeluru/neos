// Use a relative path so the Vite dev-server proxy (→ port 5000) handles it.
// This avoids CORS issues and works regardless of hostname differences.
const API_BASE_URL = '/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
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
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            throw new Error('Connection refused: The event server is unreachable. Please ensure the backend is running at ' + API_BASE_URL);
        }
        throw err;
    }
};
