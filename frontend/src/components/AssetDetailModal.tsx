"use client";

import { useState } from "react";
import { X, Factory, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Asset {
    id: number | string;
    dataHash: string;
    assetType: number;
    status: number;
    owner: string;
}

interface AssetDetailModalProps {
    asset: Asset | null;
    currentAccount: string | null;
    onClose: () => void;
    onTokenize: (id: bigint) => Promise<void>;
    onRedeem: (id: bigint) => Promise<void>;
}

export function AssetDetailModal({ asset, currentAccount, onClose, onTokenize, onRedeem }: AssetDetailModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!asset) return null;

    const isOwner = currentAccount && asset.owner.toLowerCase() === currentAccount.toLowerCase();

    // Status Logic
    const canTokenize = asset.status === 1 && isOwner; // Verified
    const canRedeem = asset.status === 3 && isOwner; // Active

    const handleAction = async (action: 'tokenize' | 'redeem') => {
        try {
            setIsProcessing(true);
            const id = BigInt(asset.id);
            if (action === 'tokenize') await onTokenize(id);
            if (action === 'redeem') await onRedeem(id);
            onClose(); // Close on success
        } catch (error) {
            console.error(error);
            alert("Action failed. See console.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative glass w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Asset Details</h2>
                    <p className="text-slate-400 font-mono text-sm">ID: {asset.id}</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Metadata Hash</label>
                        <p className="text-sm text-slate-200 font-mono break-all">{asset.dataHash}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Owner</label>
                        <p className="text-sm text-slate-200 font-mono break-all">{asset.owner}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {canTokenize && (
                        <Button
                            variant="primary"
                            onClick={() => handleAction('tokenize')}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 border-none"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Factory className="w-4 h-4 mr-2" />}
                            Tokenize Asset
                        </Button>
                    )}

                    {canRedeem && (
                        <Button
                            variant="secondary"
                            onClick={() => handleAction('redeem')}
                            disabled={isProcessing}
                            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                            Redeem Asset
                        </Button>
                    )}

                    {!canTokenize && !canRedeem && isOwner && (
                        <div className="text-center text-sm text-slate-500 italic">
                            No actions available for curent status.
                        </div>
                    )}
                    {!isOwner && (
                        <div className="text-center text-sm text-slate-500 italic">
                            You are not the owner of this asset.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
