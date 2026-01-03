"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contracts';

export function useAssetRegistry() {
    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [isPending, setIsPending] = useState(false);

    const connectWallet = useCallback(async () => {
        const ethereum = (window as any).ethereum;
        if (typeof ethereum !== 'undefined') {
            try {
                const browserProvider = new ethers.BrowserProvider(ethereum);
                const accounts = await browserProvider.send("eth_requestAccounts", []);
                const signer = await browserProvider.getSigner();
                const registryContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

                setProvider(browserProvider);
                setAccount(accounts[0]);
                setContract(registryContract);
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

    // Re-connect on load if already authorized
    useEffect(() => {
        const ethereum = (window as any).ethereum;
        if (typeof ethereum !== 'undefined') {
            ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        connectWallet();
                    }
                });
        }
    }, [connectWallet]);

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
        registerAsset,
        tokenizeAsset,
        redeemAsset,
        isPending
    };
}
