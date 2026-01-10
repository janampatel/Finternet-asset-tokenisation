"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Shield, Loader2, Play, Zap, AlertCircle } from "lucide-react";
import { useAiServices, type RiskAssessment } from "@/hooks/useAiServices";

interface RegulatorPanelProps {
    onVerify: (pk: string) => Promise<void>;
    onFreeze: (pk: string) => Promise<void>;
    selectedAssetId: string | null;
    assetStatus: number | undefined;
    assetType?: number;
}

export function RegulatorPanel({ onVerify, onFreeze, selectedAssetId, assetStatus, assetType }: RegulatorPanelProps) {
    const [privateKey, setPrivateKey] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
    const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);
    const { assessRisk, loading: aiLoading } = useAiServices();

    // Fetch risk assessment when asset is selected
    useEffect(() => {
        if (selectedAssetId && assetStatus === 0) {
            loadRiskAssessment();
        }
    }, [selectedAssetId]);

    const loadRiskAssessment = async () => {
        const assetTypeNames = ["Real Estate", "Bond", "Art"];
        const typeName = assetType !== undefined ? assetTypeNames[assetType] || "Asset" : "Asset";
        const assessment = await assessRisk(typeName, { assetId: selectedAssetId });
        setRiskAssessment(assessment);
    };

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

    const getRiskColor = (level: string) => {
        switch(level) {
            case 'LOW': return 'text-green-400 bg-green-900/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20';
            case 'HIGH': return 'text-orange-400 bg-orange-900/20';
            case 'CRITICAL': return 'text-red-400 bg-red-900/20';
            default: return 'text-slate-400 bg-slate-900/20';
        }
    };

    return (
        <div className="glass p-6 rounded-xl h-full border-l border-[var(--color-glass-border)] flex flex-col gap-6">
            <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-[var(--color-neon-blue)]" />
                <h2 className="font-semibold">Regulator Controls</h2>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                Target Asset: <span className="font-mono text-white ml-2">{selectedAssetId}</span>
            </div>

            {/* AI Risk Assessment */}
            {canVerify && (
                <div className="border border-slate-700 rounded-lg p-4 bg-slate-900/30">
                    <button
                        onClick={() => setShowRiskAnalysis(!showRiskAnalysis)}
                        className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-slate-100"
                    >
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            AI Risk Analysis
                        </div>
                        {aiLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    </button>
                    
                    {showRiskAnalysis && riskAssessment && (
                        <div className="mt-3 space-y-2 text-xs">
                            <div className={`inline-block px-2 py-1 rounded ${getRiskColor(riskAssessment.riskLevel)}`}>
                                {riskAssessment.riskLevel} RISK ({riskAssessment.riskScore}/100)
                            </div>
                            <p className="text-slate-400">{riskAssessment.analysis}</p>
                            {riskAssessment.recommendations && riskAssessment.recommendations.length > 0 && (
                                <div>
                                    <p className="text-slate-500 font-medium mt-2">Recommendations:</p>
                                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                                        {riskAssessment.recommendations.slice(0, 3).map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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
