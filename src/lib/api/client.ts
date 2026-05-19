/**
 * API Client Configuration
 * Centralized API client for communicating with the ZATCA Bridge backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Types
export interface ApiError {
    detail: string;
    status: number;
}

export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
    success: boolean;
}

export interface RequestOptions {
    headers?: Record<string, string>;
}

// API Client class
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders: HeadersInit = {
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    data: null,
                    error: {
                        detail: data.detail || 'An error occurred',
                        status: response.status,
                    },
                    success: false,
                };
            }

            return {
                data: data as T,
                error: null,
                success: true,
            };
        } catch (error) {
            return {
                data: null,
                error: {
                    detail: error instanceof Error ? error.message : 'Network error',
                    status: 0,
                },
                success: false,
            };
        }
    }

    // GET request
    async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET', headers: options?.headers });
    }

    // POST request
    async post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: options?.headers,
        });
    }

    // PUT request
    async put<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: options?.headers,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE', headers: options?.headers });
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

