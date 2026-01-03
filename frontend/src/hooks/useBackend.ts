"use client";

import useSWR from 'swr';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useBackend() {
    const { data: assets, error, mutate } = useSWR(
        `${API_BASE}/assets`,
        fetcher,
        { refreshInterval: 2000 } // Auto-refresh every 2s to catch block updates
    );

    const verifyAsset = async (assetId: string, regulatorPrivateKey: string) => {
        try {
            await axios.post(`${API_BASE}/verify`, { assetId, regulatorPrivateKey });
            mutate(); // Refresh list
        } catch (e) {
            console.error("Verification failed", e);
            throw e;
        }
    };

    const freezeAsset = async (assetId: string, regulatorPrivateKey: string) => {
        try {
            await axios.post(`${API_BASE}/freeze`, { assetId, regulatorPrivateKey });
            mutate();
        } catch (e) {
            console.error("Freeze failed", e);
            throw e;
        }
    };

    return {
        assets: assets || [],
        isLoading: !assets && !error,
        isError: error,
        verifyAsset,
        freezeAsset,
        mutate
    };
}
