/**
 * API Client Configuration
 * Centralized API client for communicating with the ZATCA Bridge backend
 */

import { resolveDemo } from './demoData';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * DEMO MODE — when true, all API calls return realistic dummy data instead
 * of hitting the FastAPI backend (no backend/Firebase needed for demos).
 * Set to false to restore real backend integration.
 */
export const DEMO_MODE = false;

/**
 * REAL_ZATCA_SUBMISSION — when true, the `/invoices/submit-to-zatca`
 * endpoint bypasses DEMO_MODE and hits the FastAPI backend, which in turn
 * makes a real httpx call to gw-fatoora.zatca.gov.sa. If ZATCA credentials
 * are missing on the backend, it returns a structured "would-have-called"
 * response so you can see the exact URL/payload that would have hit ZATCA.
 *
 * Keep DEMO_MODE = true so dashboards/CSID/list views still render from
 * mock data — only the submit path is wired live.
 */
export const REAL_ZATCA_SUBMISSION = true;

// Endpoints that ALWAYS bypass DEMO_MODE — these go straight to the real
// FastAPI backend. /zatca/onboard intentionally stays in DEMO_MODE so that
// any OTP the user types is accepted (the demo can't trigger a real ZATCA
// OTP). The CSR-preview, credentials, and upgrade endpoints remain live
// because they're triggered explicitly from the CSID settings page.
const REAL_ZATCA_ENDPOINT_PREFIXES = [
    '/invoices/submit-to-zatca',
    '/zatca/csr/preview',
    '/zatca/credentials',
    '/zatca/upgrade-to-production',
];

export function isRealZatcaEndpoint(endpoint: string): boolean {
    if (!REAL_ZATCA_SUBMISSION) return false;
    return REAL_ZATCA_ENDPOINT_PREFIXES.some((p) => endpoint.startsWith(p));
}

/** Simulated network latency so the demo feels real. */
export const demoDelay = (ms = 450) =>
    new Promise<void>((r) => setTimeout(r, ms + Math.random() * 250));

/**
 * Coerce a FastAPI `detail` (which may be a string, an error envelope object,
 * or absent) into a single display string. Prefers a `message` field when the
 * detail is an object so the user sees the backend's human-readable reason.
 */
function normalizeDetail(detail: unknown): string {
    if (typeof detail === 'string') return detail;
    if (detail && typeof detail === 'object') {
        const msg = (detail as { message?: unknown }).message;
        if (typeof msg === 'string' && msg) return msg;
        try {
            return JSON.stringify(detail);
        } catch {
            // Fall through to the generic message.
        }
    }
    return 'An error occurred';
}

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

        // Demo mode: answer from dummy data, skip the network entirely.
        // Exception: `/invoices/submit-to-zatca` always goes live when
        // REAL_ZATCA_SUBMISSION is true, so we can prove the real ZATCA
        // submission path end-to-end.
        if (DEMO_MODE && !isRealZatcaEndpoint(endpoint)) {
            await demoDelay();
            let parsedBody: unknown;
            try {
                parsedBody =
                    typeof options.body === 'string'
                        ? JSON.parse(options.body)
                        : undefined;
            } catch {
                parsedBody = undefined;
            }
            return {
                data: resolveDemo(
                    options.method || 'GET',
                    endpoint,
                    parsedBody
                ) as T,
                error: null,
                success: true,
            };
        }

        const defaultHeaders: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Attach Supabase access token unless the caller already set one. Skipped
        // server-side (no browser supabase client) — server callers pass their
        // own header.
        const callerHeaders = (options.headers as Record<string, string>) || {};
        if (!callerHeaders.Authorization && !callerHeaders.authorization && typeof window !== 'undefined') {
            try {
                const supabase = createSupabaseClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    callerHeaders.Authorization = `Bearer ${session.access_token}`;
                }
            } catch {
                // Supabase not configured — fall through with no auth header.
            }
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...callerHeaders,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    data: null,
                    error: {
                        // FastAPI may set `detail` to a structured object (e.g. the
                        // submit-to-zatca 502/500 envelope: {success, request_id,
                        // timestamp, attempted_url, message}). ApiError.detail is a
                        // string, and callers render it directly, so coerce here —
                        // prefer the human-readable `message` — to avoid React's
                        // "Objects are not valid as a React child" crash.
                        detail: normalizeDetail(data?.detail),
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
            // Backend unreachable (e.g. the public demo deploy where
            // NEXT_PUBLIC_API_URL points at a host that isn't serving the
            // FastAPI backend). For everything except the live ZATCA submit
            // endpoints — which deliberately surface the offline state as a
            // polished "what would be sent" preview (see submitToZatcaFlow /
            // ZatcaResponseCard) — transparently fall back to demo data so the
            // app stays fully usable instead of throwing a raw NetworkError.
            // This is what the "Demo Mode (backend offline)" pill promises.
            if (!isRealZatcaEndpoint(endpoint)) {
                let parsedBody: unknown;
                try {
                    parsedBody =
                        typeof options.body === 'string'
                            ? JSON.parse(options.body)
                            : undefined;
                } catch {
                    parsedBody = undefined;
                }
                return {
                    data: resolveDemo(
                        options.method || 'GET',
                        endpoint,
                        parsedBody
                    ) as T,
                    error: null,
                    success: true,
                };
            }
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

