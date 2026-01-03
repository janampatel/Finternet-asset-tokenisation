"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus } from "lucide-react";

interface AssetRegistrationFormProps {
    onRegister: (hash: string, type: number) => Promise<void>;
    isPending: boolean;
}

const ASSET_TYPES = [
    { value: 0, label: "Real Estate" },
    { value: 1, label: "Art" },
    { value: 2, label: "Bond" },
    { value: 3, label: "Equity" },
];

export function AssetRegistrationForm({ onRegister, isPending }: AssetRegistrationFormProps) {
    const [hash, setHash] = useState("");
    const [type, setType] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onRegister(hash, type);
            setHash(""); // Reset only on success
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="glass p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--color-neon-purple)]" />
                Mint New Asset
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                        Asset Type
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(parseInt(e.target.value))}
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-neon-blue)] focus:outline-none"
                    >
                        {ASSET_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                        Metadata Hash
                    </label>
                    <input
                        type="text"
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        placeholder="e.g. ipfs://..."
                        required
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-neon-blue)] focus:outline-none"
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none"
                    disabled={isPending || !hash}
                >
                    {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Mint Asset"
                    )}
                </Button>
            </form>
        </div>
    );
}
