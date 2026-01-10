"use client";

import { useState, useEffect } from 'react';

const FALLBACK_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const BACKEND_URL = "http://localhost:3000";

export function useContractAddress() {
    const [address, setAddress] = useState<string>(FALLBACK_ADDRESS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/contract-address`);
                if (response.ok) {
                    const data = await response.json();
                    setAddress(data.address);
                    setError(null);
                } else {
                    console.warn("Failed to fetch contract address from backend, using fallback");
                    setError("Using fallback address");
                }
            } catch (err) {
                console.warn("Could not connect to backend for contract address:", err);
                setError(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAddress();
    }, []);

    return { address, loading, error };
}
