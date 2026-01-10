"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from '@/config/contracts';
import { useContractAddress } from './useContractAddress';

interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    send: (method: string, params: unknown[]) => Promise<unknown>;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

export function useAssetRegistry() {
    const { address: CONTRACT_ADDRESS, loading: addressLoading } = useContractAddress();
    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [isManuallyDisconnected, setIsManuallyDisconnected] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('manuallyDisconnected') === 'true';
        }
        return false;
    });

    const connectWallet = useCallback(async () => {
        const ethereum = window.ethereum;
        if (typeof ethereum !== 'undefined') {
            try {
                const browserProvider = new ethers.BrowserProvider(ethereum);
                const accounts = await browserProvider.send("eth_requestAccounts", []);
                const signer = await browserProvider.getSigner();
                const registryContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

                setAccount(accounts[0]);
                setContract(registryContract);
                setIsManuallyDisconnected(false);
                localStorage.removeItem('manuallyDisconnected');
                return accounts[0];
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                throw error;
            }
        } else {
            alert("Please install MetaMask!");
            return null;
        }
    }, []);

    const disconnectWallet = useCallback(async () => {
        setAccount(null);
        setContract(null);
        setIsManuallyDisconnected(true);
        localStorage.setItem('manuallyDisconnected', 'true');

        // Revoke MetaMask permissions
        const ethereum = window.ethereum;
        if (ethereum && typeof ethereum !== 'undefined') {
            try {
                await ethereum.request({
                    method: 'wallet_revokePermissions',
                    params: [{ eth_accounts: {} }]
                });
            } catch (error) {
                console.log('Permission revocation not supported or failed:', error);
            }
        }
    }, []);

    // Re-connect on load if already authorized AND not manually disconnected
    useEffect(() => {
        const ethereum = window.ethereum;
        if (typeof ethereum !== 'undefined' && !isManuallyDisconnected) {
            ethereum.request({ method: 'eth_accounts' })
                .then((accounts) => {
                    if ((accounts as string[]).length > 0) {
                        connectWallet();
                    }
                });
        }
    }, [connectWallet, isManuallyDisconnected]);

    const registerAsset = async (metadataHash: string, assetType: number) => {
        if (!contract) throw new Error("Contract not initialized");
        try {
            setIsPending(true);
            const tx = await contract.registerAsset(metadataHash, assetType);
            await tx.wait();
            return tx;
        } finally {
            setIsPending(false);
        }
    };

    const tokenizeAsset = async (assetId: bigint) => {
        if (!contract) throw new Error("Contract not initialized");
        try {
            setIsPending(true);
            const tx = await contract.tokenizeAsset(assetId);
            await tx.wait();
            return tx;
        } finally {
            setIsPending(false);
        }
    };

    const redeemAsset = async (assetId: bigint) => {
        if (!contract) throw new Error("Contract not initialized");
        try {
            setIsPending(true);
            const tx = await contract.redeemAsset(assetId);
            await tx.wait();
            return tx;
        } finally {
            setIsPending(false);
        }
    };

    return {
        account,
        contract,
        connectWallet,
        disconnectWallet,
        registerAsset,
        tokenizeAsset,
        redeemAsset,
        isPending
    };
}
