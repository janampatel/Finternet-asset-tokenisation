"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Shield, Loader2, Play } from "lucide-react";

interface RegulatorPanelProps {
    onVerify: (pk: string) => Promise<void>;
    onFreeze: (pk: string) => Promise<void>;
    selectedAssetId: string | null;
    assetStatus: number | undefined;
}

export function RegulatorPanel({ onVerify, onFreeze, selectedAssetId, assetStatus }: RegulatorPanelProps) {
    const [privateKey, setPrivateKey] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (action: 'verify' | 'freeze') => {
        if (!privateKey) return alert("Please enter Regulator Private Key");
        try {
            setIsProcessing(true);
            if (action === 'verify') await onVerify(privateKey);
            if (action === 'freeze') await onFreeze(privateKey);
            alert(`Asset ${action} successful!`);
        } catch (error) {
            console.error(error);
            alert(`Failed to ${action} asset`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!selectedAssetId) {
        return (
            <div className="glass p-6 rounded-xl h-full border-l border-[var(--color-glass-border)]">
                <div className="flex items-center gap-2 mb-4 text-slate-400">
                    <Shield className="w-5 h-5" />
                    <h2 className="font-semibold">Regulator Panel</h2>
                </div>
                <p className="text-sm text-slate-500">Select an asset to view regulator actions.</p>
            </div>
        );
    }

    // Status 0: Registered -> Can Verify
    // Status 3: Active -> Can Freeze
    const canVerify = assetStatus === 0;
    const canFreeze = assetStatus === 3;

    return (
        <div className="glass p-6 rounded-xl h-full border-l border-[var(--color-glass-border)] flex flex-col gap-6">
            <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-[var(--color-neon-blue)]" />
                <h2 className="font-semibold">Regulator Controls</h2>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                Target Asset: <span className="font-mono text-white ml-2">{selectedAssetId}</span>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                        Regulator Private Key
                    </label>
                    <input
                        type="password"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 rounded px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-[var(--color-neon-blue)]"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="secondary"
                        disabled={!canVerify || isProcessing}
                        onClick={() => handleAction('verify')}
                        className="w-full justify-between group"
                    >
                        Verify Asset
                        {isProcessing && canVerify ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                    </Button>

                    <Button
                        variant="secondary"
                        disabled={!canFreeze || isProcessing}
                        onClick={() => handleAction('freeze')}
                        className="w-full justify-between group border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    >
                        Freeze Asset
                        {isProcessing && canFreeze ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                    </Button>
                </div>

                {(!canVerify && !canFreeze) && (
                    <p className="text-xs text-center text-slate-600 italic">
                        No actions available for current state.
                    </p>
                )}
            </div>
        </div>
    );
}
