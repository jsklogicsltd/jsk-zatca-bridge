/**
 * Dashboard API Types and Services
 */

import { apiClient, ApiResponse } from './client';

// ============ Types ============

export interface DashboardStats {
    total_invoices: number;
    total_revenue: number;
    total_vat: number;
    cleared_count: number;
    reported_count: number;
    rejected_count: number;
    draft_count: number;
    signed_count: number;
}

export interface HealthStatus {
    status: string;
    database: string;
    version: string;
    timestamp: string;
}

// ============ API Functions ============

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(params?: {
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<DashboardStats>> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return apiClient.get<DashboardStats>(`/stats${query ? `?${query}` : ''}`);
}

/**
 * Get API health status
 */
export async function getHealthStatus(): Promise<ApiResponse<HealthStatus>> {
    return apiClient.get<HealthStatus>('/health');
}
