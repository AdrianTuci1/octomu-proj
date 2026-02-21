export class ApiService {
    protected static BASE_URL = 'http://localhost:8081';

    protected static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Request failed with status ${response.status}`);
        }

        return response.json();
    }

    protected static get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    protected static post<T>(endpoint: string, body: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
}
