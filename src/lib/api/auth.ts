/**
 * Authentication API service
 */

import { apiClient, type ApiResponse } from './client';

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
    id: number;
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

// Token storage
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

export function storeAuth(token: string, user: User): void {
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

// API Functions
export async function signup(data: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    if (response.success && response.data) {
        storeAuth(response.data.access_token, response.data.user);
    }
    return response;
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.success && response.data) {
        storeAuth(response.data.access_token, response.data.user);
    }
    return response;
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
    const token = getStoredToken();
    if (!token) {
        return { success: false, data: null, error: { detail: 'Not authenticated', status: 401 } };
    }
    return apiClient.get<User>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const token = getStoredToken();
    if (!token) {
        return { success: false, data: null, error: { detail: 'Not authenticated', status: 401 } };
    }
    const response = await apiClient.put<User>('/auth/me', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (response.success && response.data) {
        storeAuth(token, response.data);
    }
    return response;
}

export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    const token = getStoredToken();
    if (!token) {
        return { success: false, data: null, error: { detail: 'Not authenticated', status: 401 } };
    }
    return apiClient.post<{ message: string }>('/auth/change-password', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export async function logout(): Promise<void> {
    const token = getStoredToken();
    if (token) {
        try {
            await apiClient.post<{ message: string }>('/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch {
            // Ignore logout errors
        }
    }
    clearAuth();
}
