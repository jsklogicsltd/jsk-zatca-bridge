/**
 * Authentication API service.
 *
 * Real mode: backed by Supabase Auth (session lives in cookies via @supabase/ssr).
 * Demo mode: routes through apiClient + demoData so the offline demo still works.
 */

import { apiClient, DEMO_MODE, type ApiResponse } from './client';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

// Types
export interface SignupRequest {
    email: string;
    password: string;
    confirm_password: string;
    full_name?: string;
    company_name?: string;
    tax_id?: string;
    phone?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    /** Supabase auth.users.id (UUID). In demo mode this may be a numeric string. */
    id: string;
    email: string;
    full_name: string | null;
    company_name: string | null;
    tax_id: string | null;
    phone: string | null;
    is_active: boolean;
    is_verified: boolean;
    zatca_environment: string | null;
    has_zatca_csid: boolean;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}

export interface UpdateProfileRequest {
    full_name?: string;
    company_name?: string;
    tax_id?: string;
    phone?: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

// Local cache so synchronous callers (isAuthenticated, getStoredUser) keep working.
// Supabase is the source of truth — this is just a sync mirror.
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

function storeAuth(token: string, user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
    return !!getStoredToken();
}

interface ProfileRow {
    id: string;
    full_name: string | null;
    company_name: string | null;
    tax_id: string | null;
    phone: string | null;
    zatca_environment: string | null;
    has_zatca_csid: boolean | null;
    created_at: string;
}

function mergeUser(
    authUser: { id: string; email?: string | null; created_at?: string; email_confirmed_at?: string | null },
    profile: ProfileRow | null,
): User {
    return {
        id: authUser.id,
        email: authUser.email ?? '',
        full_name: profile?.full_name ?? null,
        company_name: profile?.company_name ?? null,
        tax_id: profile?.tax_id ?? null,
        phone: profile?.phone ?? null,
        is_active: true,
        is_verified: !!authUser.email_confirmed_at,
        zatca_environment: profile?.zatca_environment ?? 'sandbox',
        has_zatca_csid: !!profile?.has_zatca_csid,
        created_at: profile?.created_at ?? authUser.created_at ?? new Date().toISOString(),
    };
}

// API Functions
export async function signup(data: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    if (DEMO_MODE) {
        const response = await apiClient.post<AuthResponse>('/auth/signup', data);
        if (response.success && response.data) {
            storeAuth(response.data.access_token, response.data.user);
        }
        return response;
    }

    const supabase = createSupabaseClient();
    const { data: result, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: data.full_name ?? '',
                company_name: data.company_name ?? '',
                tax_id: data.tax_id ?? '',
                phone: data.phone ?? '',
            },
        },
    });

    if (error || !result.user) {
        return {
            success: false,
            data: null,
            error: { detail: error?.message || 'Signup failed', status: 400 },
        };
    }

    // If email confirmation is required, session will be null. We still return a
    // user object so the UI can route to the verify-email page.
    const merged = mergeUser(result.user, null);
    const token = result.session?.access_token ?? '';
    if (token) storeAuth(token, merged);

    return {
        success: true,
        data: {
            access_token: token,
            token_type: 'bearer',
            expires_in: result.session?.expires_in ?? 0,
            user: merged,
        },
        error: null,
    };
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    if (DEMO_MODE) {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        if (response.success && response.data) {
            storeAuth(response.data.access_token, response.data.user);
        }
        return response;
    }

    const supabase = createSupabaseClient();
    const { data: result, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });

    if (error || !result.session || !result.user) {
        return {
            success: false,
            data: null,
            error: { detail: error?.message || 'Login failed', status: 401 },
        };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, company_name, tax_id, phone, zatca_environment, has_zatca_csid, created_at')
        .eq('id', result.user.id)
        .maybeSingle();

    const merged = mergeUser(result.user, profile as ProfileRow | null);
    storeAuth(result.session.access_token, merged);

    return {
        success: true,
        data: {
            access_token: result.session.access_token,
            token_type: 'bearer',
            expires_in: result.session.expires_in,
            user: merged,
        },
        error: null,
    };
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
    if (DEMO_MODE) {
        const token = getStoredToken();
        if (!token) {
            return { success: false, data: null, error: { detail: 'Not authenticated', status: 401 } };
        }
        return apiClient.get<User>('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    }

    const supabase = createSupabaseClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return { success: false, data: null, error: { detail: 'Not authenticated', status: 401 } };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, company_name, tax_id, phone, zatca_environment, has_zatca_csid, created_at')
        .eq('id', authUser.id)
        .maybeSingle();

    const merged = mergeUser(authUser, profile as ProfileRow | null);
    const token = (await supabase.auth.getSession()).data.session?.access_token ?? '';
    if (token) storeAuth(token, merged);

    return { success: true, data: merged, error: null };
}

export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    if (DEMO_MODE) {
        const token = getStoredToken();
        if (!token) {
            return { success: false, data: null, error: { detail: 'Not authenticated', status: 401 } };
        }
        const response = await apiClient.put<User>('/auth/me', data, { headers: { Authorization: `Bearer ${token}` } });
        if (response.success && response.data) storeAuth(token, response.data);
        return response;
    }

    const supabase = createSupabaseClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return { success: false, data: null, error: { detail: 'Not authenticated', status: 401 } };
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .update({
            full_name: data.full_name,
            company_name: data.company_name,
            tax_id: data.tax_id,
            phone: data.phone,
        })
        .eq('id', authUser.id)
        .select('id, full_name, company_name, tax_id, phone, zatca_environment, has_zatca_csid, created_at')
        .single();

    if (error) {
        return { success: false, data: null, error: { detail: error.message, status: 400 } };
    }

    const merged = mergeUser(authUser, profile as ProfileRow);
    const token = (await supabase.auth.getSession()).data.session?.access_token ?? '';
    if (token) storeAuth(token, merged);
    return { success: true, data: merged, error: null };
}

export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    if (DEMO_MODE) {
        const token = getStoredToken();
        if (!token) {
            return { success: false, data: null, error: { detail: 'Not authenticated', status: 401 } };
        }
        return apiClient.post<{ message: string }>('/auth/change-password', data, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: data.new_password });
    if (error) {
        return { success: false, data: null, error: { detail: error.message, status: 400 } };
    }
    return { success: true, data: { message: 'Password updated' }, error: null };
}

export async function logout(): Promise<void> {
    if (DEMO_MODE) {
        const token = getStoredToken();
        if (token) {
            try {
                await apiClient.post<{ message: string }>('/auth/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch {
                // ignore
            }
        }
        clearAuth();
        return;
    }

    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    clearAuth();
}

/**
 * Request a password reset email. Supabase emails a link back to `redirectTo`,
 * where we run the access_token through supabase.auth.updateUser() to set a
 * new password. Demo mode is a no-op.
 */
export async function requestPasswordReset(email: string, redirectTo?: string): Promise<ApiResponse<{ message: string }>> {
    if (DEMO_MODE) {
        return { success: true, data: { message: 'Reset email sent (demo)' }, error: null };
    }
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
        return { success: false, data: null, error: { detail: error.message, status: 400 } };
    }
    return { success: true, data: { message: 'Reset email sent' }, error: null };
}

/**
 * Resend the email-verification message for an unverified address.
 * Demo mode short-circuits to success.
 */
export async function resendVerificationEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    if (DEMO_MODE) {
        return { success: true, data: { message: 'Verification email sent (demo)' }, error: null };
    }
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
        return { success: false, data: null, error: { detail: error.message, status: 400 } };
    }
    return { success: true, data: { message: 'Verification email sent' }, error: null };
}
