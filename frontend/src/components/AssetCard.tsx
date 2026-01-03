"use client";

import { Box, FileText, CheckCircle2, Factory, Lock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface Asset {
    id: number | string;
    dataHash: string;
    assetType: number;
    status: number;
    owner: string;
}

interface AssetCardProps {
    asset: Asset;
    onClick: () => void;
}

// 0: Registered, 1: Verified, 2: Tokenized, 3: Active, 4: Frozen, 5: Redeemed
const STATUS_CONFIG = {
    0: { label: "Registered", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", icon: FileText },
    1: { label: "Verified", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: CheckCircle2 },
    2: { label: "Tokenized", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", icon: Factory },
    3: { label: "Active", color: "text-[var(--color-neon-purple)]", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: Box },
    4: { label: "Frozen", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: Lock },
    5: { label: "Redeemed", color: "text-slate-600", bg: "bg-black/40", border: "border-slate-800", icon: ShieldAlert },
};

const TYPE_CONFIG = {
    0: "Real Estate",
    1: "Art",
    2: "Bond",
    3: "Equity"
};

export function AssetCard({ asset, onClick }: AssetCardProps) {
    const status = STATUS_CONFIG[asset.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0];
    const typeLabel = TYPE_CONFIG[asset.assetType as keyof typeof TYPE_CONFIG] || "Unknown";
    const StatusIcon = status.icon;

    return (
        <div
            onClick={onClick}
            className="group relative glass p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,243,255,0.1)] cursor-pointer"
        >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex justify-between items-start mb-4">
                <div className={cn("px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5", status.bg, status.color, "border", status.border)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                    ID: {asset.id.toString()}
                </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[var(--color-neon-blue)] transition-colors">
                {typeLabel} Asset
            </h3>
            <p className="text-xs text-slate-400 font-mono truncate mb-4" title={asset.dataHash}>
                {asset.dataHash}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Owner</span>
                    <span className="text-xs font-mono text-slate-300">
                        {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
                    </span>
                </div>
            </div>
        </div>
    );
}
