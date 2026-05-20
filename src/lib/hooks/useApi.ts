/**
 * React hooks for API calls
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getDashboardStats,
    listInvoices,
    getInvoice,
    signInvoice,
    validateInvoice,
    zatcaOnboard,
    getCSIDStatus,
    getHealthStatus,
    getCurrentUser,
    getZatcaHealth,
    getZatcaCredentialsStatus,
    type DashboardStats,
    type InvoiceListResponse,
    type InvoiceResponse,
    type InvoiceCreate,
    type SignedInvoice,
    type OnboardRequest,
    type OnboardResponse,
    type CSIDStatusResponse,
    type CredentialsStatus,
    type User,
} from '../api';

// ============ Generic Fetch Hook ============

interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

function useFetch<T>(
    fetchFn: () => Promise<{ data: T | null; error: { detail: string } | null; success: boolean }>,
    deps: unknown[] = []
): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const result = await fetchFn();

        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error?.detail || 'An error occurred');
        }

        setLoading(false);
    }, [fetchFn]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error, refetch: fetchData };
}

// ============ Dashboard Hooks ============

export function useDashboardStats(startDate?: string, endDate?: string) {
    return useFetch<DashboardStats>(
        () => getDashboardStats({ start_date: startDate, end_date: endDate }),
        [startDate, endDate]
    );
}

export function useHealthStatus() {
    return useFetch(() => getHealthStatus(), []);
}

export function useCurrentUser() {
    return useFetch<User>(() => getCurrentUser(), []);
}

export function useZatcaHealth() {
    return useFetch<{ status: string; message: string }>(() => getZatcaHealth(), []);
}

export function useZatcaCredentialsStatus() {
    return useFetch<CredentialsStatus>(() => getZatcaCredentialsStatus(), []);
}

// ============ Invoice Hooks ============

export function useInvoiceList(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
}) {
    return useFetch<InvoiceListResponse>(
        () => listInvoices(params),
        [params?.skip, params?.limit, params?.status, params?.start_date, params?.end_date]
    );
}

export function useInvoice(id: number) {
    return useFetch<InvoiceResponse>(() => getInvoice(id), [id]);
}

// ============ Mutation Hooks ============

interface UseMutationResult<T, R> {
    mutate: (data: T) => Promise<R | null>;
    loading: boolean;
    error: string | null;
    data: R | null;
    reset: () => void;
}

function useMutation<T, R>(
    mutationFn: (data: T) => Promise<{ data: R | null; error: { detail: string } | null; success: boolean }>
): UseMutationResult<T, R> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<R | null>(null);

    const mutate = async (input: T): Promise<R | null> => {
        setLoading(true);
        setError(null);

        const result = await mutationFn(input);

        if (result.success && result.data) {
            setData(result.data);
            setLoading(false);
            return result.data;
        } else {
            setError(result.error?.detail || 'An error occurred');
            setLoading(false);
            return null;
        }
    };

    const reset = () => {
        setData(null);
        setError(null);
        setLoading(false);
    };

    return { mutate, loading, error, data, reset };
}

// Invoice mutations
export function useSignInvoice() {
    return useMutation<InvoiceCreate, SignedInvoice>(signInvoice);
}

export function useValidateInvoice() {
    return useMutation<InvoiceCreate, { valid: boolean; errors?: Array<{ field: string; message: string }> }>(
        validateInvoice
    );
}

// ZATCA mutations
export function useZatcaOnboard() {
    return useMutation<OnboardRequest, OnboardResponse>(zatcaOnboard);
}

export function useCSIDStatus(csid: string) {
    return useFetch<CSIDStatusResponse>(() => getCSIDStatus(csid), [csid]);
}
